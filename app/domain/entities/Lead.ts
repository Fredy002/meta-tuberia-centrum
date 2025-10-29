import { Email } from "../value-objects/Email";
import { PhoneNumber } from "../value-objects/PhoneNumber";
import { DNI } from "../value-objects/DNI";
import { Experience } from "../value-objects/Experience";

export interface LeadData {
  dni: string;
  email: string;
  phone: string;
  fullName: string;
  experience?: number;
  educationLevel?: string;
  suneduRegistered?: boolean;
  createdTime: Date;
  program?: string;
  // Additional fields from the original notebook
  adName?: string;
  adsetName?: string;
  campaignId?: string;
  campaignName?: string;
  formId?: string;
  formName?: string;
  adId?: string;
  adsetId?: string;
  isOrganic?: boolean;
  platform?: string;
  leadStatus?: string;
  utmCampaignMedium?: string;
}

export class Lead {
  private readonly id: string;
  private readonly dni: DNI;
  private readonly email: Email;
  private readonly phone: PhoneNumber;
  private readonly fullName: string;
  private readonly experience?: Experience;
  private readonly educationLevel?: string;
  private readonly suneduRegistered?: boolean;
  private readonly createdTime: Date;
  private readonly program?: string;
  private readonly adName?: string;
  private readonly adsetName?: string;
  private readonly campaignId?: string;
  private readonly campaignName?: string;
  private readonly formId?: string;
  private readonly formName?: string;
  private readonly adId?: string;
  private readonly adsetId?: string;
  private readonly isOrganic?: boolean;
  private readonly platform?: string;
  private readonly leadStatus?: string;
  private readonly utmCampaignMedium?: string;

  constructor(data: LeadData) {
    this.id = crypto.randomUUID();
    this.dni = new DNI(data.dni);
    this.email = new Email(data.email);
    this.phone = new PhoneNumber(data.phone);
    this.fullName = data.fullName;
    this.experience = data.experience ? new Experience(data.experience) : undefined;
    this.educationLevel = data.educationLevel;
    this.suneduRegistered = data.suneduRegistered;
    this.createdTime = data.createdTime;
    this.program = data.program;
    this.adName = data.adName;
    this.adsetName = data.adsetName;
    this.campaignId = data.campaignId;
    this.campaignName = data.campaignName;
    this.formId = data.formId;
    this.formName = data.formName;
    this.adId = data.adId;
    this.adsetId = data.adsetId;
    this.isOrganic = data.isOrganic;
    this.platform = data.platform;
    this.leadStatus = data.leadStatus;
    this.utmCampaignMedium = data.utmCampaignMedium;
  }

  getId(): string {
    return this.id;
  }

  getDni(): DNI {
    return this.dni;
  }

  getEmail(): Email {
    return this.email;
  }

  getPhone(): PhoneNumber {
    return this.phone;
  }

  getFullName(): string {
    return this.fullName;
  }

  getExperience(): Experience | undefined {
    return this.experience;
  }

  getEducationLevel(): string | undefined {
    return this.educationLevel;
  }

  getSuneduRegistered(): boolean | undefined {
    return this.suneduRegistered;
  }

  getCreatedTime(): Date {
    return this.createdTime;
  }

  getProgram(): string | undefined {
    return this.program;
  }

  getAdName(): string | undefined {
    return this.adName;
  }

  getAdsetName(): string | undefined {
    return this.adsetName;
  }

  getCampaignId(): string | undefined {
    return this.campaignId;
  }

  getCampaignName(): string | undefined {
    return this.campaignName;
  }

  getFormId(): string | undefined {
    return this.formId;
  }

  getFormName(): string | undefined {
    return this.formName;
  }

  getAdId(): string | undefined {
    return this.adId;
  }

  getAdsetId(): string | undefined {
    return this.adsetId;
  }

  getIsOrganic(): boolean | undefined {
    return this.isOrganic;
  }

  getPlatform(): string | undefined {
    return this.platform;
  }

  getLeadStatus(): string | undefined {
    return this.leadStatus;
  }

  getUtmCampaignMedium(): string | undefined {
    return this.utmCampaignMedium;
  }

  toJSON() {
    return {
      id: this.id,
      dni: this.dni.getValue(),
      email: this.email.getValue(),
      phone: this.phone.getValue(),
      fullName: this.fullName,
      experience: this.experience?.getYears(),
      educationLevel: this.educationLevel,
      suneduRegistered: this.suneduRegistered,
      createdTime: this.createdTime.toISOString(),
      program: this.program,
      adName: this.adName,
      adsetName: this.adsetName,
      campaignId: this.campaignId,
      campaignName: this.campaignName,
      formId: this.formId,
      formName: this.formName,
      adId: this.adId,
      adsetId: this.adsetId,
      isOrganic: this.isOrganic,
      platform: this.platform,
      leadStatus: this.leadStatus,
      utmCampaignMedium: this.utmCampaignMedium,
    };
  }
}
