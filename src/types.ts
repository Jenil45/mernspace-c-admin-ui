export type Credentials = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  createdAt: string;
};

export type CreateUserData = {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  password: string;
  tenantId: number;
};

export type Tenant = {
  id: number;
  name: string;
  address: string;
  createdAt: string;
};

export type CreateTenantData = {
  name: string;
  address: string;
};

export type FieldData = {
    name: string[];
    value?: string;
}