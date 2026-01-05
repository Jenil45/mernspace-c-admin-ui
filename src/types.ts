export type Credentials = {
    email: string;
    password: string;
}

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    createdAt: string;
}

export type Tenant = {
    id: number;
    name: string;
    address: string;
    createdAt: string;
}