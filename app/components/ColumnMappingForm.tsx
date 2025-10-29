import { useState, useEffect } from 'react';
import { ColumnMapping } from '~/application/services/LeadProcessingService';

interface ColumnMappingFormProps {
  onMappingChange: (mapping: ColumnMapping) => void;
  agencyFileHeaders: string[];
  className?: string;
}

const MAPPING_FIELDS = [
  { key: 'dni', label: 'DNI', required: true, icon: '🆔', description: 'Número de documento de identidad' },
  { key: 'email', label: 'Email', required: true, icon: '📧', description: 'Dirección de correo electrónico' },
  { key: 'phone', label: 'Teléfono', required: true, icon: '📱', description: 'Número de teléfono o celular' },
  { key: 'createdTime', label: 'Fecha de Creación', required: true, icon: '📅', description: 'Fecha cuando se creó el lead' },
  { key: 'experience', label: 'Experiencia', required: false, icon: '💼', description: 'Años de experiencia laboral' },
  { key: 'educationLevel', label: 'Grado Académico', required: false, icon: '🎓', description: 'Nivel de estudios alcanzado' },
  { key: 'suneduRegistered', label: 'Bachiller SUNEDU', required: false, icon: '🏛️', description: 'Registro en SUNEDU' },
  { key: 'program', label: 'Programa', required: false, icon: '📚', description: 'Programa académico de interés' },
] as const;

export function ColumnMappingForm({ onMappingChange, agencyFileHeaders, className }: ColumnMappingFormProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({
    dni: 'dni',
    email: 'email',
    phone: 'phone_number',
    fullName: 'full_name',
    createdTime: 'created_time',
    experience: 'años_de_experiencia',
    educationLevel: 'indica_tu_grado_académico_alcanzado',
    suneduRegistered: undefined,
    program: undefined,
  });

  useEffect(() => {
    onMappingChange(mapping);
  }, [mapping, onMappingChange]);

  const handleFieldChange = (field: keyof ColumnMapping, value: string) => {
    const newMapping = {
      ...mapping,
      [field]: value === 'NO_DISPONIBLE' ? undefined : (value || undefined),
    };
    setMapping(newMapping);
  };

  const requiredFields = MAPPING_FIELDS.filter(field => field.required);
  const optionalFields = MAPPING_FIELDS.filter(field => !field.required);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Mapeo de Columnas
        </h3>
        <p className="text-gray-600 text-sm">
          Configura cómo se mapean las columnas de tu archivo de agencia
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600 font-bold text-sm">*</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Campos Obligatorios</h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requiredFields.map((field) => (
            <div key={field.key} className="group">
              <div className="bg-white rounded-xl p-4 border border-gray-200 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{field.icon}</span>
                  </div>
                  <div>
                    <label className="text-base font-semibold text-gray-900">
                      {field.label}
                    </label>
                    <p className="text-xs text-gray-600">{field.description}</p>
                  </div>
                </div>
                
                <select
                  value={mapping[field.key as keyof ColumnMapping] || ''}
                  onChange={(e) => handleFieldChange(field.key as keyof ColumnMapping, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 text-sm"
                  required={field.required}
                >
                  <option value="">-- Seleccionar columna --</option>
                  <option value="NO_DISPONIBLE">❌ No está en el Archivo</option>
                  {agencyFileHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
                
                {field.required && !mapping[field.key as keyof ColumnMapping] && (
                  <div className="flex items-center space-x-2 mt-2">
                    <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-red-600 font-medium">Este campo es obligatorio</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-600 font-bold text-sm">?</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Campos Opcionales</h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {optionalFields.map((field) => (
            <div key={field.key} className="group">
              <div className="bg-white rounded-xl p-4 border border-gray-200 group-hover:border-purple-300 group-hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{field.icon}</span>
                  </div>
                  <div>
                    <label className="text-base font-semibold text-gray-900">
                      {field.label}
                    </label>
                    <p className="text-xs text-gray-600">{field.description}</p>
                  </div>
                </div>
                
                <select
                  value={mapping[field.key as keyof ColumnMapping] || ''}
                  onChange={(e) => handleFieldChange(field.key as keyof ColumnMapping, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 text-sm"
                >
                  <option value="">-- Seleccionar columna --</option>
                  <option value="NO_DISPONIBLE">❌ No está en el Archivo</option>
                  {agencyFileHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapping Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Resumen del Mapeo</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MAPPING_FIELDS.map((field) => {
            const value = mapping[field.key as keyof ColumnMapping];
            const displayValue = value ? value : '❌ No está en el Archivo';
            const isMapped = !!value;
            
            return (
              <div key={field.key} className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{field.icon}</span>
                  <span className="font-medium text-gray-900 text-sm">{field.label}:</span>
                </div>
                <span className={`font-semibold text-sm ${!isMapped ? 'text-red-600' : 'text-green-600'}`}>
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

