// Stub: Tenant entity (minimal implementation)
export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export class Tenant {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone?: string
  ) {}

  static create(props: { id: string; name: string; email: string; phone?: string }): Tenant {
    if (!props.id) {
      throw new Error("Tenant ID is required");
    }
    if (!props.name) {
      throw new Error("Tenant name is required");
    }
    if (!props.email) {
      throw new Error("Tenant email is required");
    }

    return new Tenant(props.id, props.name, props.email, props.phone);
  }
}

