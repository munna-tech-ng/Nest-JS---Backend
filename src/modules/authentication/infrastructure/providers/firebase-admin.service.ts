import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";
import * as fs from "fs";
import { FirebaseAuthException } from "../../domain/exceptions";

export interface FirebaseUserInfo {
    uid: string;
    email: string | null;
    name?: string | null;
}

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
    private app: admin.app.App | null = null;
    private readonly logger = new Logger(FirebaseAdminService.name);
    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        this.logger.log("Initializing Firebase Admin SDK");
        this.initializeFirebase();
        this.logger.log("Firebase Admin SDK initialized successfully");
    }

    private initializeFirebase() {
        const serviceAccountPath = this.configService.get<string>("FIREBASE_SERVICE_ACCOUNT_PATH");
        try {
            // Check if Firebase is already initialized
            if (admin.apps.length > 0) {
                this.app = admin.app();
                return;
            }

            if (serviceAccountPath) {
                // Load from file path
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
                this.app = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            } else {
                throw new FirebaseAuthException(
                    "Firebase Admin SDK configuration missing. Provide either FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_PROJECT_ID + FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL"
                );
            }
        } catch (error) {
            throw new FirebaseAuthException(`Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Verify Firebase ID token and return decoded token with user information
     */
    async verifyIdToken(idToken: string): Promise<FirebaseUserInfo> {
        if (!this.app) {
            throw new FirebaseAuthException("Firebase Admin SDK not initialized");
        }

        try {
            const decodedToken: DecodedIdToken = await this.app.auth().verifyIdToken(idToken);

            return {
                uid: decodedToken.uid,
                email: decodedToken.email || null,
                name: decodedToken.name || null,
            };
        } catch {
            throw new FirebaseAuthException(`Invalid ID token`);
        }
    }

    /**
     * Get user information from Firebase by UID
     */
    async getUserByUid(uid: string): Promise<FirebaseUserInfo | null> {
        if (!this.app) {
            throw new FirebaseAuthException("Firebase Admin SDK not initialized");
        }

        try {
            const userRecord = await this.app.auth().getUser(uid);
            return {
                uid: userRecord.uid,
                email: userRecord.email || null,
                name: userRecord.displayName || null,
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes("not found")) {
                return null;
            }
            throw new FirebaseAuthException(`Failed to get user by UID`);
        }
    }
}

