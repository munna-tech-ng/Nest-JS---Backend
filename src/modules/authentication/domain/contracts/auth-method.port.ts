import { AuthUser } from "../entities/auth-user.entity";
import { AuthMethodType } from "../types/auth-method-type";
import { TokenPair } from "./token-service.port";

export interface AuthMethodPort {
    readonly type: AuthMethodType;

    login(payload: any): Promise<AuthUser>;
    register?(payload: any): Promise<AuthUser>; // optional for guest/code
    generateToken?(user: AuthUser): Promise<TokenPair>; // optional at register
}

export const AUTH_METHODS = "AUTH_METHODS";
