import { Lead } from "../../domain/entities/Lead";
import { CRMLead } from "../../domain/entities/CRMLead";
import { ProcessedLead } from "../../domain/entities/ProcessedLead";
import { LeadMatchingService } from "../../domain/services/LeadMatchingService";
import { ProfileValidationService, ValidationConfig } from "../../domain/services/ProfileValidationService";
import { DuplicateDetectionService } from "../../domain/services/DuplicateDetectionService";

export interface LeadProcessingConfig {
  validation: ValidationConfig;
  columnMapping: ColumnMapping;
}

export interface ColumnMapping {
  dni: string;
  email: string;
  phone: string;
  fullName: string;
  experience?: string;
  educationLevel?: string;
  suneduRegistered?: string;
  createdTime: string;
  program?: string;
}

export interface ProcessingResult {
  processedLeads: ProcessedLead[];
  summary: {
    totalLeads: number;
    presentInCRM: number;
    missingLeads: number;
    meetsProfile: number;
    duplicates: {
      byDni: number;
      byEmail: number;
      byDniAndEmail: number;
      totalDuplicates: number;
    };
    crmStats: {
      totalCRMLeads: number;
      crmLeadsWithUTM: number;
    };
    statusDistribution: Record<string, number>;
    formDistribution: Record<string, number>;
  };
}

export class LeadProcessingService {
  private readonly matchingService: LeadMatchingService;
  private readonly validationService: ProfileValidationService;
  private readonly duplicateDetectionService: DuplicateDetectionService;

  constructor() {
    this.matchingService = new LeadMatchingService();
    this.validationService = new ProfileValidationService();
    this.duplicateDetectionService = new DuplicateDetectionService();
  }

  async processLeads(
    agencyLeads: Lead[],
    crmLeads: CRMLead[],
    config: LeadProcessingConfig
  ): Promise<ProcessingResult> {
    const processedLeads: ProcessedLead[] = [];

    for (const lead of agencyLeads) {
      const matchResult = this.matchingService.matchLeadsByProgram(lead, crmLeads);
      const profileValidation = this.validationService.validateProfile(lead, config.validation);
      
      const processedLead = new ProcessedLead(lead, matchResult, profileValidation);
      processedLeads.push(processedLead);
    }

    const summary = this.calculateSummary(processedLeads, crmLeads);

    return {
      processedLeads,
      summary,
    };
  }

  private calculateSummary(processedLeads: ProcessedLead[], crmLeads: CRMLead[]): ProcessingResult['summary'] {
    const totalLeads = processedLeads.length;
    const presentInCRM = processedLeads.filter(lead => lead.isPresentInCRM()).length;
    const missingLeads = processedLeads.filter(lead => lead.isMissingLead()).length;
    const meetsProfile = processedLeads.filter(lead => lead.meetsProfile()).length;

    // Use the dedicated duplicate detection service
    const leads = processedLeads.map(lead => lead.getLead());
    const duplicateInfo = this.duplicateDetectionService.detectDuplicates(leads);

    // CRM Statistics
    const totalCRMLeads = crmLeads.length;
    const crmLeadsWithUTM = crmLeads.filter(lead => lead.getUtmCampaignMedium()).length;

    // Status distribution
    const statusDistribution: Record<string, number> = {};
    processedLeads.forEach(lead => {
      const status = lead.getStatus();
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    // Form distribution
    const formDistribution: Record<string, number> = {};
    processedLeads.forEach(lead => {
      const formName = lead.getLead().getFormName();
      if (formName) {
        formDistribution[formName] = (formDistribution[formName] || 0) + 1;
      }
    });

    return {
      totalLeads,
      presentInCRM,
      missingLeads,
      meetsProfile,
      duplicates: {
        byDni: duplicateInfo.byDni,
        byEmail: duplicateInfo.byEmail,
        byDniAndEmail: duplicateInfo.byDniAndEmail,
        totalDuplicates: duplicateInfo.totalDuplicates,
      },
      crmStats: {
        totalCRMLeads,
        crmLeadsWithUTM,
      },
      statusDistribution,
      formDistribution,
    };
  }
}
