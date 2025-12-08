import { Inject, Injectable } from "@nestjs/common";
import { AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { FirebaseAdminService } from "../providers/firebase-admin.service";
import { randomUUID } from "crypto";
import { UserNotFoundException, FirebaseUserEmailNotFoundException } from "../../domain/exceptions/auth.exceptions";

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
            throw new UserNotFoundException();
        }

        // Find user by email in database
        const email = Email.create(firebaseUser.email);
        const user = await this.users.findByEmail(email);
        
        if (!user) {
            throw new UserNotFoundException();
        }

        return user;
    }

    async register(payload: { idToken: string }): Promise<AuthUser> {
        // Verify Firebase ID token and get user information
        const firebaseUser = await this.firebaseAdmin.verifyIdToken(payload.idToken);
        
        if (!firebaseUser.email) {
            throw new FirebaseUserEmailNotFoundException();
        }

        // Check if user already exists
        const email = Email.create(firebaseUser.email);
        const existingUser = await this.users.findByEmail(email);
        
        // when user already exists then return the user
        if (existingUser) {
            existingUser.isExistingUser = true;
            return existingUser;
        }

        const userName = firebaseUser.name ?? "User";

        // Create new user
        const user = new AuthUser(randomUUID(), email, userName, false, null, "firebase", false);
        
        // generate password hash
        const passwordHash = await this.users.generatePasswordHash();

        // get the profile picture from firebase
        const profilePicture = this.getFirebaseProfilePicture(firebaseUser);

        // store user
        await this.users.save(user, passwordHash, firebaseUser.firebase?.sign_in_provider ?? "firebase", firebaseUser.uid ?? "", profilePicture);

        return user;
    }

    private getFirebaseProfilePicture(firebaseUser: any): string | null {
        let profile = firebaseUser.picture;
        if (profile) {
            profile = profile.replace("=s96-c", "=s256-c");
        }
        return profile;
    }
}
