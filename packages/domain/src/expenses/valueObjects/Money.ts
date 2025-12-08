export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    if (!currency || currency.length !== 3) {
      throw new Error("Currency must be a 3-letter ISO code");
    }
  }

  static create(amount: number, currency: string = "USD"): Money {
    return new Money(amount, currency.toUpperCase());
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    if (this.amount < other.amount) {
      throw new Error("Resulting amount cannot be negative");
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

