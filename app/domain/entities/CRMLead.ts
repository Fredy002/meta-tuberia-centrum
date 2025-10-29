import { Email } from "../value-objects/Email";
import { PhoneNumber } from "../value-objects/PhoneNumber";
import { DNI } from "../value-objects/DNI";

export interface CRMLeadData {
  dni: string;
  email: string;
  phone: string;
  fullName: string;
  status: string;
  classification: string;
  program: string;
  createdDate: Date;
  utmCampaignMedium?: string;
}

export class CRMLead {
  private readonly id: string;
  private readonly dni: DNI;
  private readonly email: Email;
  private readonly phone: PhoneNumber;
  private readonly fullName: string;
  private readonly status: string;
  private readonly classification: string;
  private readonly program: string;
  private readonly createdDate: Date;
  private readonly utmCampaignMedium?: string;

  constructor(data: CRMLeadData) {
    this.id = crypto.randomUUID();
    this.dni = new DNI(data.dni);
    this.email = new Email(data.email);
    this.phone = new PhoneNumber(data.phone);
    this.fullName = data.fullName;
    this.status = data.status;
    this.classification = data.classification;
    this.program = data.program;
    this.createdDate = data.createdDate;
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

  getStatus(): string {
    return this.status;
  }

  getClassification(): string {
    return this.classification;
  }

  getProgram(): string {
    return this.program;
  }

  getCreatedDate(): Date {
    return this.createdDate;
  }

  getUtmCampaignMedium(): string | undefined {
    return this.utmCampaignMedium;
  }

  hasUtmTracking(): boolean {
    return !!this.utmCampaignMedium;
  }

  toJSON() {
    return {
      id: this.id,
      dni: this.dni.getValue(),
      email: this.email.getValue(),
      phone: this.phone.getValue(),
      fullName: this.fullName,
      status: this.status,
      classification: this.classification,
      program: this.program,
      createdDate: this.createdDate.toISOString(),
      utmCampaignMedium: this.utmCampaignMedium,
    };
  }
}
