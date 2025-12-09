import { Inject, Injectable } from "@nestjs/common";
import { AUTH_USER_REPO } from "../../domain/contracts/auth-user-repository.port";
import { AuthServicePort } from "../../domain/contracts/auth-service-port";
import { AuthProvider, AuthUser } from "../../domain/entities/auth-user.entity";
import { AuthMethodType } from "../../domain/types/auth-method-type";

@Injectable()
export class AuthUserService {
    constructor(
        @Inject(AUTH_USER_REPO)
        private readonly authService: AuthServicePort,
    ) { }

    async getUserByPhone(phone: string): Promise<AuthUser> {
        return await this.authService.getUserByPhone(phone);
    }

    async getUserByEmail(email: string): Promise<AuthUser> {
        return await this.authService.getUserByEmail(email);
    }

    async getUserByCode(code: string): Promise<AuthUser> {
        return await this.authService.getUserByCode(code);
    }

    async getUserByGuest(guest: boolean): Promise<AuthUser> {
        return await this.authService.getUserByGuest(guest);
    }

    async getUserById(id: string): Promise<AuthUser> {
        return await this.authService.getUserById(id);
    }

    async getUserByProvider(provider: AuthProvider): Promise<AuthUser[]> {
        return await this.authService.getUserByProvider(provider);
    }

    getAuthProviders(): AuthProvider[] {
        return this.authService.getAuthProviders();
    }

    getAuthMethods(): AuthMethodType[] {
        return this.authService.getAuthMethods();
    }

    async getListOfUsers(): Promise<AuthUser[]> {
        return await this.authService.getListOfUsers();
    }
}