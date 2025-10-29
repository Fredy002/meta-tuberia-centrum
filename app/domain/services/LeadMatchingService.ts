import { Lead } from "../entities/Lead";
import { CRMLead } from "../entities/CRMLead";
import { LeadMatchResult } from "../entities/ProcessedLead";

export class LeadMatchingService {
  private countMatch(crmLeads: CRMLead[], program: string | undefined, field: 'email' | 'dni' | 'phone', value: string): number {
    if (!value) return 0;
    
    let filteredLeads = crmLeads;
    
    // Filter by program if available
    if (program) {
      filteredLeads = crmLeads.filter(crmLead => crmLead.getProgram() === program);
    }
    
    // Count matches using contains logic (matching Python's str.contains)
    return filteredLeads.filter(crmLead => {
      const crmValue = field === 'email' ? crmLead.getEmail().getValue() :
                      field === 'dni' ? crmLead.getDni().getValue() :
                      crmLead.getPhone().getValue();
      
      return crmValue && crmValue.includes(value);
    }).length;
  }

  /**
   * Gets the earliest creation date for matching CRM leads by a key field
   * Supports program-based filtering when program is provided
   * Matches Python's build_earliest_date_dict and get_earliest_date functions
   */
  private getEarliestDate(
    crmLeads: CRMLead[], 
    program: string | undefined,
    keyField: 'email' | 'dni' | 'phone', 
    keyValue: string
  ): Date | undefined {
    if (!keyValue) return undefined;
    
    let filteredLeads = crmLeads;
    
    // Filter by program if available
    if (program) {
      filteredLeads = crmLeads.filter(crmLead => crmLead.getProgram() === program);
    }
    
    const matchingLeads = filteredLeads.filter(crmLead => {
      const crmValue = keyField === 'email' ? crmLead.getEmail().getValue() :
                      keyField === 'dni' ? crmLead.getDni().getValue() :
                      crmLead.getPhone().getValue();
      return crmValue && crmValue.includes(keyValue);
    });

    if (matchingLeads.length === 0) return undefined;

    return matchingLeads.reduce((earliest, lead) => {
      const leadDate = lead.getCreatedDate();
      return leadDate < earliest ? leadDate : earliest;
    }, matchingLeads[0].getCreatedDate());
  }

  /**
   * Gets the latest value (status or classification) for matching CRM leads by a key field
   * Supports program-based filtering and matches Python's get_latest_value function
   */
  private getLatestValue(
    crmLeads: CRMLead[], 
    program: string | undefined,
    keyField: 'email' | 'dni' | 'phone', 
    keyValue: string, 
    valueField: 'status' | 'classification'
  ): string | undefined {
    if (!keyValue) return undefined;
    
    let filteredLeads = crmLeads;
    
    // Filter by program if available
    if (program) {
      filteredLeads = crmLeads.filter(crmLead => crmLead.getProgram() === program);
    }
    
    const matchingLeads = filteredLeads.filter(crmLead => {
      const crmValue = keyField === 'email' ? crmLead.getEmail().getValue() :
                      keyField === 'dni' ? crmLead.getDni().getValue() :
                      crmLead.getPhone().getValue();
      return crmValue && crmValue.includes(keyValue);
    });

    if (matchingLeads.length === 0) return undefined;

    // Find the lead with the latest creation date (matching Python logic)
    const latestLead = matchingLeads.reduce((latest, lead) => {
      const leadDate = lead.getCreatedDate();
      const latestDate = latest.getCreatedDate();
      return leadDate > latestDate ? lead : latest;
    }, matchingLeads[0]);

    return valueField === 'status' ? latestLead.getStatus() : latestLead.getClassification();
  }

  /**
   * Matches a lead against CRM leads with program-aware filtering
   * Matches Python's find_missing_leads function logic
   */
  matchLead(lead: Lead, crmLeads: CRMLead[]): LeadMatchResult {
    const program = lead.getProgram();
    
    // Count matches for each field (matching Python's Appears_by_email/dni/phone logic)
    const emailMatches = this.countMatch(crmLeads, program, 'email', lead.getEmail().getValue());
    const dniMatches = this.countMatch(crmLeads, program, 'dni', lead.getDni().getValue());
    const phoneMatches = this.countMatch(crmLeads, program, 'phone', lead.getPhone().getValue());
    
    // Check if present (any match > 0) - matching Python's Appears_by_email_or_dni_or_phone logic
    const isPresent = (emailMatches + dniMatches + phoneMatches) > 0;
    
    if (!isPresent) {
      return {
        isPresent: false,
        matchType: 'none',
      };
    }

    // Determine match type priority: email > dni > phone
    let matchType: 'email' | 'dni' | 'phone' = 'none';
    if (emailMatches > 0 || dniMatches > 0) {
      matchType = emailMatches > 0 ? 'email' : 'dni';
    } else if (phoneMatches > 0) {
      matchType = 'phone';
    }

    // Get consolidated status and classification (prioritize email > dni > phone)
    // This matches Python's consolidation logic: Status_email.fillna(Status_dni).fillna(Status_phone)
    const statusEmail = this.getLatestValue(crmLeads, program, 'email', lead.getEmail().getValue(), 'status');
    const statusDni = this.getLatestValue(crmLeads, program, 'dni', lead.getDni().getValue(), 'status');
    const statusPhone = this.getLatestValue(crmLeads, program, 'phone', lead.getPhone().getValue(), 'status');
    const status = statusEmail || statusDni || statusPhone || 'Sin estado';

    const clasifEmail = this.getLatestValue(crmLeads, program, 'email', lead.getEmail().getValue(), 'classification');
    const clasifDni = this.getLatestValue(crmLeads, program, 'dni', lead.getDni().getValue(), 'classification');
    const clasifPhone = this.getLatestValue(crmLeads, program, 'phone', lead.getPhone().getValue(), 'classification');
    const classification = clasifEmail || clasifDni || clasifPhone || 'Sin clasificación';

    // Get earliest creation date (matching Python's FechaTuberia logic)
    // Priority: email > dni > phone
    const fechaEmail = this.getEarliestDate(crmLeads, program, 'email', lead.getEmail().getValue());
    const fechaDni = this.getEarliestDate(crmLeads, program, 'dni', lead.getDni().getValue());
    const fechaPhone = this.getEarliestDate(crmLeads, program, 'phone', lead.getPhone().getValue());
    const crmCreatedDate = fechaEmail || fechaDni || fechaPhone;

    return {
      isPresent: true,
      matchType,
      status,
      classification,
      crmCreatedDate,
    };
  }

  matchLeadsByProgram(lead: Lead, crmLeads: CRMLead[]): LeadMatchResult {
    return this.matchLead(lead, crmLeads);
  }
}
