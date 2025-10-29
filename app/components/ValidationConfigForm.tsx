import { useState } from 'react';
import { ValidationConfig } from '~/domain/services/ProfileValidationService';

interface ValidationConfigFormProps {
  onConfigChange: (config: ValidationConfig) => void;
  className?: string;
}

const VALIDATION_TYPES = [
  {
    type: 'none' as const,
    title: 'Sin Validación',
    description: 'Todos los leads se considerarán válidos',
    icon: '🚫',
    color: 'gray'
  },
  {
    type: 'education_experience' as const,
    title: 'Educación + Experiencia',
    description: 'Valida grado académico y años de experiencia',
    icon: '🎓',
    color: 'blue'
  },
  {
    type: 'sunedu_registration' as const,
    title: 'Registro SUNEDU',
    description: 'Valida que esté registrado en SUNEDU',
    icon: '🏛️',
    color: 'purple'
  }
] as const;

export function ValidationConfigForm({ onConfigChange, className }: ValidationConfigFormProps) {
  const [config, setConfig] = useState<ValidationConfig>({
    type: 'education_experience',
    minimumExperience: 1,
    invalidEducationLevels: ['egresado', 'tecnico', 'técnico', 'estudiante', '3ero de secundaria'],
  });

  const handleTypeChange = (type: ValidationConfig['type']) => {
    const newConfig = { ...config, type };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleMinimumExperienceChange = (value: number) => {
    const newConfig = { ...config, minimumExperience: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleInvalidLevelsChange = (levels: string) => {
    const invalidLevels = levels.split(',').map(level => level.trim()).filter(level => level);
    const newConfig = { ...config, invalidEducationLevels: invalidLevels };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Validación de Perfil
        </h3>
        <p className="text-gray-600 text-sm">
          Configura los criterios para determinar si los leads cumplen el perfil requerido
        </p>
      </div>

      {/* Validation Type Selection */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Tipo de Validación</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VALIDATION_TYPES.map((validationType) => {
            const isSelected = config.type === validationType.type;
            const colorClasses = {
              gray: isSelected ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300',
              blue: isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
              purple: isSelected ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
            };
            
            return (
              <div
                key={validationType.type}
                className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${colorClasses[validationType.color]} ${
                  isSelected ? 'shadow-md scale-102' : 'hover:shadow-sm'
                }`}
                onClick={() => handleTypeChange(validationType.type)}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    isSelected 
                      ? validationType.color === 'gray' ? 'bg-gray-100' : 
                        validationType.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                      : 'bg-gray-100'
                  }`}>
                    <span className="text-2xl">{validationType.icon}</span>
                  </div>
                  <h5 className="text-base font-semibold text-gray-900 mb-1">
                    {validationType.title}
                  </h5>
                  <p className="text-xs text-gray-600">
                    {validationType.description}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Education and Experience Configuration */}
      {config.type === 'education_experience' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🎓</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900">Configuración de Educación y Experiencia</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Experiencia Mínima Requerida
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={config.minimumExperience || 1}
                    onChange={(e) => handleMinimumExperienceChange(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                    años
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Los leads deben tener al menos esta cantidad de años de experiencia
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Grados Académicos No Aceptados
                </label>
                <textarea
                  value={config.invalidEducationLevels?.join(', ') || ''}
                  onChange={(e) => handleInvalidLevelsChange(e.target.value)}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="egresado, tecnico, estudiante, 3ero de secundaria"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Los leads con estos grados académicos no cumplirán el perfil (separados por comas)
                </p>
              </div>
            </div>
          </div>

          {/* Current Configuration Summary */}
          <div className="mt-4 bg-white rounded-lg p-3 border border-blue-200">
            <h5 className="text-base font-semibold text-gray-900 mb-3">Configuración Actual</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 text-sm">Experiencia mínima:</span>
                <span className="font-bold text-blue-600 text-sm">{config.minimumExperience} años</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 text-sm">Grados no aceptados:</span>
                <span className="font-bold text-red-600 text-sm">{config.invalidEducationLevels?.length || 0} tipos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUNEDU Configuration */}
      {config.type === 'sunedu_registration' && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏛️</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Validación SUNEDU</h4>
              <p className="text-gray-600 text-sm">
                Se validará que el lead tenga registro en SUNEDU marcado como "Sí"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Validation */}
      {config.type === 'none' && (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🚫</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Sin Validación</h4>
              <p className="text-gray-600 text-sm">
                No se aplicará ninguna validación de perfil. Todos los leads se considerarán válidos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
