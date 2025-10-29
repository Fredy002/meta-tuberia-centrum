import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Lead } from "../../domain/entities/Lead";
import { CRMLead } from "../../domain/entities/CRMLead";
import { ColumnMapping } from "./LeadProcessingService";

export interface FileProcessingResult<T> {
  data: T[];
  headers: string[];
  errors: string[];
}

export class FileProcessingService {
  async extractHeaders(file: File): Promise<string[]> {
    const { headers } = await this.parseFile(file);
    return headers;
  }

  async processAgencyFile(
    file: File,
    columnMapping: ColumnMapping
  ): Promise<FileProcessingResult<Lead> & { originalData?: Record<string, any>[] }> {
    const { rawData, headers } = await this.parseFile(file);
    const leads: Lead[] = [];
    const errors: string[] = [];
    const originalData: Record<string, any>[] = [];

    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        // Preserve original row data for export (matching Python's approach of keeping all columns)
        originalData.push({ ...row });
        
        const leadData = this.mapAgencyRow(row, columnMapping, i);
        const lead = new Lead(leadData);
        leads.push(lead);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Still preserve original data even if mapping fails
        if (rawData[i]) {
          originalData.push({ ...rawData[i] });
        }
      }
    }

    return { data: leads, headers, errors, originalData };
  }

  async processCRMFile(file: File): Promise<FileProcessingResult<CRMLead>> {
    const { rawData, headers } = await this.parseFile(file);
    const crmLeads: CRMLead[] = [];
    const errors: string[] = [];

    // Add headers info to help with debugging
    if (headers.length > 0) {
      console.log('Available CRM headers:', headers);
    }

    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        const crmLeadData = this.mapCRMRow(row, i);
        const crmLead = new CRMLead(crmLeadData);
        crmLeads.push(crmLead);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Row ${i + 1}: ${errorMessage}`);
        
        // Add headers info to first error for debugging
        if (i === 0 && headers.length > 0) {
          errors.push(`Available headers: ${headers.join(', ')}`);
        }
      }
    }

    return { data: crmLeads, headers, errors };
  }

  private async parseFile(file: File): Promise<{ rawData: any[], headers: string[] }> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      return this.parseCSV(file);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      return this.parseExcel(file);
    } else {
      throw new Error(`Unsupported file format: ${fileExtension}`);
    }
  }

  private async parseCSV(file: File): Promise<{ rawData: any[], headers: string[] }> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          } else {
            const headers = results.meta.fields || [];
            resolve({ rawData: results.data as any[], headers });
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private async parseExcel(file: File): Promise<{ rawData: any[], headers: string[] }> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      throw new Error('Excel file must have at least a header row and one data row');
    }

    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1) as any[][];

    const rawData = rows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return { rawData, headers };
  }

  private mapAgencyRow(row: any, mapping: ColumnMapping, index: number): any {
    const getValue = (key: string | undefined) => {
      if (!key) return '';
      const value = row[key];
      return value !== undefined && value !== null ? String(value).trim() : '';
    };

    const dni = getValue(mapping.dni);
    const email = getValue(mapping.email);
    const phone = getValue(mapping.phone);
    const fullName = getValue(mapping.fullName);
    const createdTime = getValue(mapping.createdTime);

    if (!dni || !email || !fullName || !createdTime) {
      throw new Error(`Missing required fields: DNI, email, fullName, or createdTime`);
    }

    return {
      dni,
      email,
      phone,
      fullName,
      experience: mapping.experience ? parseInt(getValue(mapping.experience)) || 0 : undefined,
      educationLevel: mapping.educationLevel ? getValue(mapping.educationLevel) : undefined,
      suneduRegistered: mapping.suneduRegistered ? getValue(mapping.suneduRegistered) === '1' : undefined,
      createdTime: new Date(createdTime),
      program: mapping.program ? getValue(mapping.program) : undefined,
      // Map additional fields that might be in the file
      adName: getValue('ad_name') || getValue('adName'),
      adsetName: getValue('adset_name') || getValue('adsetName'),
      campaignId: getValue('campaign_id') || getValue('campaignId'),
      campaignName: getValue('campaign_name') || getValue('campaignName'),
      formId: getValue('form_id') || getValue('formId'),
      formName: getValue('form_name') || getValue('formName'),
      adId: getValue('ad_id') || getValue('adId'),
      adsetId: getValue('adset_id') || getValue('adsetId'),
      isOrganic: getValue('is_organic') === 'true' || getValue('isOrganic') === 'true',
      platform: getValue('platform'),
      leadStatus: getValue('lead_status') || getValue('leadStatus'),
      utmCampaignMedium: getValue('utm_campaign_medium') || getValue('utmCampaignMedium'),
    };
  }

  private mapCRMRow(row: any, index: number): any {
    const getValue = (key: string) => {
      const value = row[key];
      return value !== undefined && value !== null ? String(value).trim() : '';
    };

    // Try different possible column names for each field
    const dni = getValue('N° de documento') || getValue('DNI') || getValue('dni') || getValue('numero_documento');
    const email = getValue('Correo electrónico') || getValue('email') || getValue('Email') || getValue('correo');
    const phone = getValue('Teléfono') || getValue('telefono') || getValue('Telefono') || getValue('phone');
    const fullName = getValue('Nombre completo') || getValue('Nombre') || getValue('full_name') || getValue('name');
    const status = getValue('Estado') || getValue('estado') || getValue('Status') || getValue('status');
    const classification = getValue('Nombre de clasificación') || getValue('clasificacion') || getValue('Classification') || getValue('classification');
    const program = getValue('Abreviatura') || getValue('abreviatura') || getValue('Programa') || getValue('programa') || getValue('program');
    const createdDate = getValue('Fecha de creación de oportunidad potencial') || getValue('fecha_creacion') || getValue('created_date') || getValue('Created Date');
    const utmCampaignMedium = getValue('UTM Campaign Medium') || getValue('utm_campaign_medium') || getValue('utm') || getValue('UTM');

    // Make some fields optional and provide defaults
    if (!dni || !email) {
      throw new Error(`Missing required CRM fields: DNI or email at row ${index + 1}`);
    }

    return {
      dni,
      email,
      phone: phone || '',
      fullName: fullName || 'Sin nombre',
      status: status || 'Sin estado',
      classification: classification || 'Sin clasificación',
      program: program || 'Sin programa',
      createdDate: createdDate ? new Date(createdDate) : new Date(),
      utmCampaignMedium: utmCampaignMedium || undefined,
    };
  }
}
