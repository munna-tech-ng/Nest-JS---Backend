import { AuthUser } from "../entities/auth-user.entity";
import { AuthMethodType } from "../types/auth-method-type";

export interface AuthMethodPort {
    readonly type: AuthMethodType;

    login(payload: any): Promise<AuthUser>;
    register?(payload: any): Promise<AuthUser>; // optional for guest/code
}

export const AUTH_METHODS = "AUTH_METHODS";
