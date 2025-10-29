export class Experience {
  private readonly years: number;

  constructor(years: number) {
    if (years < 0) {
      throw new Error("Experience years cannot be negative");
    }
    this.years = Math.floor(years);
  }

  getYears(): number {
    return this.years;
  }

  meetsMinimum(minimumYears: number): boolean {
    return this.years >= minimumYears;
  }

  equals(other: Experience): boolean {
    return this.years === other.years;
  }

  toString(): string {
    return `${this.years} years`;
  }
}
