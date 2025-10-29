import { Lead } from "../entities/Lead";

export interface DuplicateInfo {
  byDni: number;
  byEmail: number;
  byDniAndEmail: number;
  totalDuplicates: number;
  duplicateLeads: Lead[];
}

export class DuplicateDetectionService {
  detectDuplicates(leads: Lead[]): DuplicateInfo {
    const dniCounts = new Map<string, Lead[]>();
    const emailCounts = new Map<string, Lead[]>();
    const dniEmailCounts = new Map<string, Lead[]>();
    
    // Group leads by DNI, email, and combined key
    leads.forEach(lead => {
      const dni = lead.getDni().getValue();
      const email = lead.getEmail().getValue();
      const dniEmailKey = `${dni}|${email}`;
      
      // Group by DNI
      if (!dniCounts.has(dni)) {
        dniCounts.set(dni, []);
      }
      dniCounts.get(dni)!.push(lead);
      
      // Group by email
      if (!emailCounts.has(email)) {
        emailCounts.set(email, []);
      }
      emailCounts.get(email)!.push(lead);
      
      // Group by DNI + email combination
      if (!dniEmailCounts.has(dniEmailKey)) {
        dniEmailCounts.set(dniEmailKey, []);
      }
      dniEmailCounts.get(dniEmailKey)!.push(lead);
    });
    
    // Count duplicates
    const byDni = Array.from(dniCounts.values()).filter(group => group.length > 1).length;
    const byEmail = Array.from(emailCounts.values()).filter(group => group.length > 1).length;
    const byDniAndEmail = Array.from(dniEmailCounts.values()).filter(group => group.length > 1).length;
    
    // Calculate total unique duplicates (avoid double counting)
    const totalDuplicates = byDni + byEmail - byDniAndEmail;
    
    // Get all duplicate leads
    const duplicateLeads: Lead[] = [];
    const processedLeads = new Set<string>();
    
    Array.from(dniCounts.values())
      .filter(group => group.length > 1)
      .forEach(group => {
        group.forEach(lead => {
          const key = `${lead.getDni().getValue()}|${lead.getEmail().getValue()}`;
          if (!processedLeads.has(key)) {
            duplicateLeads.push(lead);
            processedLeads.add(key);
          }
        });
      });
    
    Array.from(emailCounts.values())
      .filter(group => group.length > 1)
      .forEach(group => {
        group.forEach(lead => {
          const key = `${lead.getDni().getValue()}|${lead.getEmail().getValue()}`;
          if (!processedLeads.has(key)) {
            duplicateLeads.push(lead);
            processedLeads.add(key);
          }
        });
      });
    
    return {
      byDni,
      byEmail,
      byDniAndEmail,
      totalDuplicates,
      duplicateLeads
    };
  }
}

