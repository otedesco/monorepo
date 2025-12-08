// Stub: Property entity (minimal implementation)
export interface Property {
  id: string;
  tenantId?: string;
  name: string;
  address: string;
}

export class Property {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string | undefined,
    public readonly name: string,
    public readonly address: string
  ) {}

  static create(props: {
    id: string;
    tenantId?: string;
    name: string;
    address: string;
  }): Property {
    if (!props.id) {
      throw new Error("Property ID is required");
    }
    if (!props.name) {
      throw new Error("Property name is required");
    }
    if (!props.address) {
      throw new Error("Property address is required");
    }

    return new Property(props.id, props.tenantId, props.name, props.address);
  }
}

