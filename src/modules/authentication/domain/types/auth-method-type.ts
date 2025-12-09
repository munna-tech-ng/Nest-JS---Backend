import { AuthUser } from "../entities/auth-user.entity";
import { Phone } from "../value-objects/phone.vo";

export type AuthMethodType = "email" | "firebase" | "code" | "guest" | "phone";
export type SaveUserPayload = {
    user: AuthUser,
    passwordHash?: string | null,
    provider?: string,
    providerId?: string,
    avatar?: string | null,
    phone?: Phone | null
}