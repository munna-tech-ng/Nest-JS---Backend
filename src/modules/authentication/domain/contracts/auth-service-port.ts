import { AuthProvider, AuthUser } from "../entities/auth-user.entity";
import { AuthMethodType } from "../types/auth-method-type";

export interface AuthServicePort {
    getUserByPhone(phone: string): Promise<AuthUser>;
    getUserByEmail(email: string): Promise<AuthUser>;
    getUserByCode(code: string): Promise<AuthUser>;
    getUserByGuest(guest: boolean): Promise<AuthUser>;
    getListOfUsers(): Promise<AuthUser[]>;
    getUserById(id: string): Promise<AuthUser>;
    getUserByProvider(provider: AuthProvider): Promise<AuthUser[]>;
    getAuthProviders(): AuthProvider[];
    getAuthMethods(): AuthMethodType[];
}

export const AUTH_SERVICE = "AUTH_SERVICE";