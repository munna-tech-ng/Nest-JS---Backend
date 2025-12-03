import { Email } from "../value-objects/email.vo";

export type AuthProvider = "email" | "firebase" | "code" | "guest";

export class AuthUser {
    constructor(
        private readonly _id: string,
        private _email: Email | null,
        private _isGuest: boolean,
        private _provider: AuthProvider,
    ) { }

    get id() {
        return this._id;
    }

    get email() {
        return this._email;
    }

    get isGuest() {
        return this._isGuest;
    }

    get provider() {
        return this._provider;
    }
}
