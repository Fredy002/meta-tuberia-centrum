export enum EducationLevel {
  BACHELOR = "bachiller",
  TECHNICAL = "tecnico",
  TECHNICAL_ALT = "técnico",
  STUDENT = "estudiante",
  HIGH_SCHOOL = "3ero de secundaria",
  GRADUATE = "egresado"
}

export class EducationLevelValidator {
  private static readonly INVALID_LEVELS = [
    EducationLevel.TECHNICAL,
    EducationLevel.TECHNICAL_ALT,
    EducationLevel.STUDENT,
    EducationLevel.HIGH_SCHOOL,
    EducationLevel.GRADUATE
  ];

  static isValid(level: string): boolean {
    const normalizedLevel = level.toLowerCase().trim();
    return !this.INVALID_LEVELS.includes(normalizedLevel as EducationLevel);
  }

  static getInvalidLevels(): string[] {
    return [...this.INVALID_LEVELS];
  }
}
