export class DNI {
  private readonly value: string;

  constructor(dni: string) {
    this.value = dni.toString().trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: DNI): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
