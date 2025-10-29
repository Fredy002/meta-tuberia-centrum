import { Lead } from "../entities/Lead";
import { EducationLevelValidator } from "../value-objects/EducationLevel";
import { ProfileValidationResult } from "../entities/ProcessedLead";

export interface ValidationConfig {
  type: 'none' | 'education_experience' | 'sunedu_registration';
  minimumExperience?: number;
  invalidEducationLevels?: string[];
}

export class ProfileValidationService {
  validateProfile(lead: Lead, config: ValidationConfig): ProfileValidationResult {
    switch (config.type) {
      case 'none':
        return { meetsProfile: true };
      
      case 'education_experience':
        return this.validateEducationAndExperience(lead, config);
      
      case 'sunedu_registration':
        return this.validateSuneduRegistration(lead);
      
      default:
        return { meetsProfile: true };
    }
  }

  private validateEducationAndExperience(
    lead: Lead, 
    config: ValidationConfig
  ): ProfileValidationResult {
    const educationLevel = lead.getEducationLevel();
    const experience = lead.getExperience();
    const minimumExperience = config.minimumExperience || 1;
    const invalidEducationLevels = config.invalidEducationLevels || [
      'egresado', 'tecnico', 'técnico', 'estudiante', '3ero de secundaria'
    ];

    // Check education level first (like in the notebook)
    if (educationLevel) {
      const lowerEducationLevel = educationLevel.toLowerCase();
      if (invalidEducationLevels.some(invalid => 
        lowerEducationLevel.includes(invalid.toLowerCase())
      )) {
        return {
          meetsProfile: false,
          reason: `Nivel educativo no válido: ${educationLevel}`
        };
      }

      // If education is valid, check experience
      if (experience && experience.getYears() <= minimumExperience) {
        return {
          meetsProfile: false,
          reason: `Experiencia insuficiente: ${experience.getYears()} años (mínimo: ${minimumExperience})`
        };
      }
    }

    return { meetsProfile: true };
  }

  private validateSuneduRegistration(lead: Lead): ProfileValidationResult {
    const isRegistered = lead.getSuneduRegistered();
    
    if (isRegistered === undefined) {
      return {
        meetsProfile: false,
        reason: 'Información de registro SUNEDU no disponible'
      };
    }

    if (!isRegistered) {
      return {
        meetsProfile: false,
        reason: 'No registrado en SUNEDU'
      };
    }

    return { meetsProfile: true };
  }
}
