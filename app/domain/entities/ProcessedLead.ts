import { Lead } from "./Lead";
import { CRMLead } from "./CRMLead";

export interface LeadMatchResult {
  isPresent: boolean;
  matchType: 'email' | 'dni' | 'phone' | 'none';
  crmLead?: CRMLead;
  status?: string;
  classification?: string;
  crmCreatedDate?: Date;
}

export interface ProfileValidationResult {
  meetsProfile: boolean;
  reason?: string;
}

export class ProcessedLead {
  private readonly lead: Lead;
  private readonly matchResult: LeadMatchResult;
  private readonly profileValidation: ProfileValidationResult;

  constructor(
    lead: Lead,
    matchResult: LeadMatchResult,
    profileValidation: ProfileValidationResult
  ) {
    this.lead = lead;
    this.matchResult = matchResult;
    this.profileValidation = profileValidation;
  }

  getLead(): Lead {
    return this.lead;
  }

  getMatchResult(): LeadMatchResult {
    return this.matchResult;
  }

  getProfileValidation(): ProfileValidationResult {
    return this.profileValidation;
  }

  isPresentInCRM(): boolean {
    return this.matchResult.isPresent;
  }

  meetsProfile(): boolean {
    return this.profileValidation.meetsProfile;
  }

  isMissingLead(): boolean {
    return !this.isPresentInCRM() && this.meetsProfile();
  }

  getStatus(): string {
    return this.matchResult.status || 'No presente en el CRM';
  }

  getClassification(): string {
    return this.matchResult.classification || 'Sin clasificación';
  }

  toJSON() {
    return {
      lead: this.lead.toJSON(),
      isPresentInCRM: this.isPresentInCRM(),
      meetsProfile: this.meetsProfile(),
      isMissingLead: this.isMissingLead(),
      status: this.getStatus(),
      classification: this.getClassification(),
      matchType: this.matchResult.matchType,
      crmCreatedDate: this.matchResult.crmCreatedDate?.toISOString(),
      profileValidationReason: this.profileValidation.reason,
    };
  }
}
