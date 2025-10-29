export class PhoneNumber {
  private readonly value: string;

  constructor(phone: string) {
    this.value = this.normalize(phone);
  }

  /**
   * Normalizes phone number to match Python logic: 
   * 1. Return empty if length < 9
   * 2. Replace everything from start until first '9' with just '9' (regex r'^.*?9')
   * This matches Python's: .str.replace(r'^.*?9', '9', regex=True)
   */
  private normalize(phone: string): string {
    if (!phone || phone.length < 9) {
      return "";
    }
    
    // Convert to string and extract number starting with 9
    // Python logic: .str.replace(r'^.*?9', '9', regex=True)
    // This replaces everything from start up to first 9 with just '9'
    const phoneStr = String(phone);
    const match = phoneStr.match(/^.*?9/);
    
    if (match) {
      // Replace the matched portion with just '9' and keep the rest
      const remaining = phoneStr.substring(match[0].length);
      return '9' + remaining;
    }
    
    return "";
  }

  getValue(): string {
    return this.value;
  }

  isValid(): boolean {
    return this.value.length === 9 && this.value.startsWith('9');
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
