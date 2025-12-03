import { Inject, Injectable } from "@nestjs/common";
import { AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { FirebaseAdminService } from "../providers/firebase-admin.service";
import { randomUUID } from "crypto";

@Injectable()
export class FirebaseAuthMethod implements AuthMethodPort {
    readonly type: AuthMethodType = "firebase";

    constructor(
        @Inject(AUTH_USER_REPO)
        private readonly users: AuthUserRepositoryPort,
        private readonly firebaseAdmin: FirebaseAdminService,
    ) { }

    async login(payload: { idToken: string }): Promise<AuthUser> {
        // Verify Firebase ID token and get user information
        const firebaseUser = await this.firebaseAdmin.verifyIdToken(payload.idToken);
        
        if (!firebaseUser.email) {
            throw new Error("Firebase user email not found");
        }

        // Find user by email in database
        const email = Email.create(firebaseUser.email);
        const user = await this.users.findByEmail(email);
        
        if (!user) {
            throw new Error("User not found. Please register first.");
        }

        return user;
    }

    async register(payload: { idToken: string }): Promise<AuthUser> {
        // Verify Firebase ID token and get user information
        const firebaseUser = await this.firebaseAdmin.verifyIdToken(payload.idToken);
        
        if (!firebaseUser.email) {
            throw new Error("Firebase user email not found");
        }

        // Check if user already exists
        const email = Email.create(firebaseUser.email);
        const existingUser = await this.users.findByEmail(email);
        
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Create new user
        const user = new AuthUser(randomUUID(), email, false, "firebase");
        // Firebase handles authentication, so no password hash needed
        await this.users.save(user, null);

        return user;
    }
}
