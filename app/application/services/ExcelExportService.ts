import * as XLSX from 'xlsx';
import { ProcessedLead } from '../../domain/entities/ProcessedLead';
import { Lead } from '../../domain/entities/Lead';

export interface ExportConfig {
  fileName?: string;
  includeAllAgencyFields?: boolean;
}

export class ExcelExportService {
  /**
   * Safely formats a date to YYYY-MM-DD format, handling invalid dates
   */
  private formatDate(date: Date | undefined | null): string | undefined {
    if (!date) return undefined;
    
    // Check if date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return undefined;
    }
    
    try {
      return date.toISOString().split('T')[0];
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Calculates the difference in days between two dates
   */
  private calculateDateDifference(date1: Date | undefined, date2: Date | undefined): number | undefined {
    if (!date1 || !date2) return undefined;
    
    // Validate both dates
    if (!(date1 instanceof Date) || isNaN(date1.getTime())) return undefined;
    if (!(date2 instanceof Date) || isNaN(date2.getTime())) return undefined;
    
    try {
      return Math.round((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Exports processed leads to Excel file matching the Python export structure
   * Matches the exact export format from the Python script:
   * - Preserves ALL original agency columns (except those in to_drop list)
   * - Adds processed columns: Presente en el CRM, No_Cumple_perfil, Status, Clasificacion, Fecha_Agencia, Fecha_Tuberia
   * - Removes hardcoded columns: id, created_time_days, ad_id, adset_id, is_organic, platform, lead_status, created_time, FechaTuberia
   */
  exportToExcel(
    processedLeads: ProcessedLead[],
    originalAgencyData?: Record<string, any>[],
    config: ExportConfig = {}
  ): void {
    const fileName = config.fileName || `intensivo_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Columns to drop (matching Python script's to_drop list)
    const columnsToDrop = new Set([
      'id',
      'created_time_days',
      'ad_id',
      'adset_id',
      'is_organic',
      'platform',
      'lead_status',
      'created_time',
      'FechaTuberia',
      // Intermediate columns that shouldn't appear in final export
      'Status_email',
      'Status_dni',
      'Status_phone',
      'Clasificacion_email',
      'Clasificacion_dni',
      'Clasificacion_phone',
      'Appears_by_email',
      'Appears_by_phone',
      'Appears_by_dni',
      'Appears_by_email_or_dni',
      'Appears_by_email_or_dni_or_phone',
      'FechaTuberia_phone',
      'FechaTuberia_dni',
      'FechaTuberia_email',
    ]);

    // Convert processed leads to flat export structure matching Python output
    const exportData = processedLeads.map((processedLead, index) => {
      const lead = processedLead.getLead();
      const matchResult = processedLead.getMatchResult();
      const profileValidation = processedLead.getProfileValidation();
      
      // Get dates for processed columns
      const fechaAgencia = lead.getCreatedTime();
      const fechaTuberia = matchResult.crmCreatedDate;

      // Start with original agency data to preserve all original columns
      const row: Record<string, any> = {};
      
      if (originalAgencyData && originalAgencyData[index]) {
        const originalRow = originalAgencyData[index];
        
        // Copy all original columns except those in to_drop
        Object.keys(originalRow).forEach(key => {
          if (!columnsToDrop.has(key)) {
            row[key] = originalRow[key];
          }
        });
      }

      // Override core identification fields with processed values (matching Python normalization)
      row['dni'] = lead.getDni().getValue();
      row['email'] = lead.getEmail().getValue();
      row['telefono'] = lead.getPhone().getValue();

      // Add processed columns (matching Python script structure)
      row['Presente en el CRM'] = processedLead.isPresentInCRM() 
        ? 'Presente en el CRM' 
        : 'No presente en el CRM';
      row['No_Cumple_perfil'] = profileValidation.meetsProfile 
        ? 'Cumple perfil' 
        : 'No cumple perfil';
      row['Status'] = processedLead.getStatus();
      row['Clasificacion'] = processedLead.getClassification();
      row['Fecha_Agencia'] = fechaAgencia ? this.formatDate(fechaAgencia) : undefined;
      row['Fecha_Tuberia'] = fechaTuberia ? this.formatDate(fechaTuberia) : undefined;

      // Note: Experience, education, and program fields are preserved from original data
      // with their original column names. We only override dni, email, and telefono
      // with normalized processed values.

      return row;
    });

    // Determine column order: original columns first, then processed columns at the end
    const allKeys = new Set<string>();
    exportData.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });

    // Processed columns that should appear at the end (matching Python output order)
    const processedColumns = [
      'Presente en el CRM',
      'No_Cumple_perfil',
      'Status',
      'Clasificacion',
      'Fecha_Agencia',
      'Fecha_Tuberia',
    ];

    // Build ordered column list: original columns first, then processed columns
    const orderedColumns: string[] = [];
    const originalColumns = Array.from(allKeys).filter(key => !processedColumns.includes(key));
    orderedColumns.push(...originalColumns.sort());
    orderedColumns.push(...processedColumns.filter(col => allKeys.has(col)));

    // Reorder rows to match column order
    const orderedData = exportData.map(row => {
      const orderedRow: Record<string, any> = {};
      orderedColumns.forEach(col => {
        if (col in row) {
          orderedRow[col] = row[col];
        }
      });
      return orderedRow;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(orderedData);

    // Set column widths for better readability
    const colWidths = this.calculateColumnWidths(orderedData);
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Leads Procesados');

    // Write file
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Calculates optimal column widths based on content
   */
  private calculateColumnWidths(data: Record<string, any>[]): Array<{ wch: number }> {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);
    const widths: Array<{ wch: number }> = [];

    keys.forEach(key => {
      // Find max length in this column
      let maxLength = key.length; // Start with header length
      
      data.forEach(row => {
        const value = row[key];
        if (value !== null && value !== undefined) {
          const strLength = String(value).length;
          if (strLength > maxLength) {
            maxLength = strLength;
          }
        }
      });

      // Set width with some padding (min 10, max 50)
      widths.push({ wch: Math.min(Math.max(maxLength + 2, 10), 50) });
    });

    return widths;
  }

  /**
   * Exports summary statistics to Excel
   */
  exportSummaryToExcel(
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
    },
    fileName?: string
  ): void {
    const exportFileName = fileName || `resumen_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      { 'Categoria': 'Leads CRM', 'Total': summary.crmStats.totalCRMLeads },
      { 'Categoria': 'Leads CRM con UTM', 'Total': summary.crmStats.crmLeadsWithUTM },
      { 'Categoria': 'Leads Agencia', 'Total': summary.totalLeads },
      { 'Categoria': 'Presentes en CRM', 'Total': summary.presentInCRM },
      { 'Categoria': 'Leads Faltantes', 'Total': summary.missingLeads },
      { 'Categoria': 'Cumplen Perfil', 'Total': summary.meetsProfile },
      { 'Categoria': 'Duplicados por DNI', 'Total': summary.duplicates.byDni },
      { 'Categoria': 'Duplicados por Email', 'Total': summary.duplicates.byEmail },
      { 'Categoria': 'Duplicados Totales', 'Total': summary.duplicates.totalDuplicates },
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');

    // Status distribution sheet
    const statusData = Object.entries(summary.statusDistribution).map(([status, count]) => ({
      'Estado': status,
      'Cantidad': count
    }));
    const statusWs = XLSX.utils.json_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, statusWs, 'Distribucion Estados');

    // Form distribution sheet
    const formData = Object.entries(summary.formDistribution)
      .map(([form, count]) => ({
        'Formulario': form,
        'Total Registros': count
      }))
      .sort((a, b) => b['Total Registros'] - a['Total Registros']);
    const formWs = XLSX.utils.json_to_sheet(formData);
    XLSX.utils.book_append_sheet(wb, formWs, 'Distribucion Formularios');

    XLSX.writeFile(wb, exportFileName);
  }
}

