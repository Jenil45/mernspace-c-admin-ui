import type { CreateTenantData, CreateUserData, Credentials } from "../types";
import { api } from "./client";

// Auth Service
export const login = (credentials: Credentials) =>
  api.post("/auth/login", credentials);

export const self = () => api.get("/auth/self");

export const logout = () => api.post("/auth/logout");

export const getUsers = () => api.get("/users/");
export const createUser = (user: CreateUserData) => api.post("/users/", user);

export const getTenants = () => api.get("/tenants/");
export const createTenants = (tenant: CreateTenantData) => api.post("/tenants/", tenant);
