import { useState } from 'react';
import { FileUpload } from '~/components/FileUpload';
import { ColumnMappingForm } from '~/components/ColumnMappingForm';
import { ValidationConfigForm } from '~/components/ValidationConfigForm';
import { ProcessingResults } from '~/components/ProcessingResults';
import { LeadProcessingService, ColumnMapping, ProcessingResult } from '~/application/services/LeadProcessingService';
import { FileProcessingService } from '~/application/services/FileProcessingService';
import { ExcelExportService } from '~/application/services/ExcelExportService';
import { ValidationConfig } from '~/domain/services/ProfileValidationService';
import { Lead } from '~/domain/entities/Lead';
import { CRMLead } from '~/domain/entities/CRMLead';

export default function Index() {
  const [agencyFile, setAgencyFile] = useState<File | null>(null);
  const [crmFile, setCrmFile] = useState<File | null>(null);
  const [agencyFileHeaders, setAgencyFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    dni: 'dni',
    email: 'email',
    phone: 'phone_number',
    fullName: 'full_name',
    experience: 'años_de_experiencia',
    educationLevel: 'indica_tu_grado_académico_alcanzado',
    suneduRegistered: undefined,
    createdTime: 'created_time',
    program: undefined,
  });
  const [validationConfig, setValidationConfig] = useState<ValidationConfig>({
    type: 'education_experience',
    minimumExperience: 1,
    invalidEducationLevels: ['egresado', 'tecnico', 'técnico', 'estudiante', '3ero de secundaria'],
  });
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [originalAgencyData, setOriginalAgencyData] = useState<Record<string, any>[] | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleAgencyFileSelect = async (file: File) => {
    setAgencyFile(file);
    setErrors([]);
    
    try {
      const fileProcessingService = new FileProcessingService();
      const headers = await fileProcessingService.extractHeaders(file);
      setAgencyFileHeaders(headers);
    } catch (error) {
      setErrors([`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`]);
    }
  };

  const handleProcessFiles = async () => {
    if (!agencyFile || !crmFile) {
      setErrors(['Por favor selecciona ambos archivos']);
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const fileProcessingService = new FileProcessingService();
      const leadProcessingService = new LeadProcessingService();

      // Process files
      const [agencyResult, crmResult] = await Promise.all([
        fileProcessingService.processAgencyFile(agencyFile, columnMapping),
        fileProcessingService.processCRMFile(crmFile),
      ]);

      if (agencyResult.errors.length > 0 || crmResult.errors.length > 0) {
        setErrors([...agencyResult.errors, ...crmResult.errors]);
        setIsProcessing(false);
        return;
      }

      // Store original agency data for export preservation
      if (agencyResult.originalData) {
        setOriginalAgencyData(agencyResult.originalData);
      }

      // Process leads
      const result = await leadProcessingService.processLeads(
        agencyResult.data,
        crmResult.data,
        {
          validation: validationConfig,
          columnMapping,
        }
      );

      setProcessingResult(result);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Error desconocido']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadResults = () => {
    if (!processingResult) return;

    const excelService = new ExcelExportService();
    excelService.exportToExcel(
      processingResult.processedLeads,
      originalAgencyData,
      {
        fileName: `intensivo_${new Date().toISOString().split('T')[0]}.xlsx`
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Cruce de Leads Inteligente
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  Agencia vs Tubería CRM • Análisis Avanzado de Datos
                </p>
              </div>
            </div>
            {processingResult && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Procesado</span>
                </div>
                <button
                  onClick={handleDownloadResults}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cargar Archivos de Datos
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Sube los archivos de agencia y CRM para comenzar el análisis
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-dashed border-blue-200 group-hover:border-blue-400 transition-all duration-200">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Archivo de Agencia
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Leads enviados por la agencia
                    </p>
                    <FileUpload
                      onFileSelect={handleAgencyFileSelect}
                      acceptedTypes=".xlsx,.xls,.csv"
                      maxSize={10}
                    />
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-dashed border-emerald-200 group-hover:border-emerald-400 transition-all duration-200">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Archivo de CRM
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Base de datos de Tubería CRM
                    </p>
                    <FileUpload
                      onFileSelect={setCrmFile}
                      acceptedTypes=".xlsx,.xls,.csv"
                      maxSize={10}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configuración
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Personaliza el mapeo de columnas y criterios de validación
              </p>
            </div>
            
            <div className="space-y-6">
              {agencyFileHeaders.length > 0 ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <ColumnMappingForm
                    onMappingChange={setColumnMapping}
                    agencyFileHeaders={agencyFileHeaders}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-amber-800 font-medium text-sm">
                      Sube el archivo de agencia para configurar el mapeo de columnas
                    </p>
                  </div>
                </div>
              )}
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <ValidationConfigForm
                  onConfigChange={setValidationConfig}
                />
              </div>
            </div>
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <button
              onClick={handleProcessFiles}
              disabled={!agencyFile || !crmFile || isProcessing}
              className="group relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Iniciar Análisis
                </>
              )}
            </button>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200 shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-800">
                  Errores de Procesamiento
                </h3>
              </div>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2 text-red-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Results */}
          {processingResult && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Análisis Completado
                </h2>
                <p className="text-gray-600 text-lg">
                  Los resultados del cruce de leads están listos
                </p>
              </div>
              
              <ProcessingResults result={processingResult} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
