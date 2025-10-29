import { Lead } from '../entities/Lead';
import { CRMLead } from '../entities/CRMLead';

export interface LeadRepository {
  saveLead(lead: Lead): Promise<void>;
  findLeadById(id: string): Promise<Lead | null>;
  findLeadsByEmail(email: string): Promise<Lead[]>;
  findLeadsByDni(dni: string): Promise<Lead[]>;
}

export interface CRMLeadRepository {
  saveCRMLead(crmLead: CRMLead): Promise<void>;
  findCRMLeadById(id: string): Promise<CRMLead | null>;
  findCRMLeadsByEmail(email: string): Promise<CRMLead[]>;
  findCRMLeadsByDni(dni: string): Promise<CRMLead[]>;
  findCRMLeadsByProgram(program: string): Promise<CRMLead[]>;
}
