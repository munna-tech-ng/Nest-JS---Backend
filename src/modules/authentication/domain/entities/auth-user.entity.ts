import { Email } from "../value-objects/email.vo";

export type AuthProvider = "email" | "firebase" | "code" | "guest";

export class AuthUser {
    constructor(
        private readonly _id: string,
        private _email: Email | null,
        private _name: string,
        private _isGuest: boolean,
        private _code: string | null,
        private _provider: AuthProvider,
    ) { }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get email() {
        return this._email;
    }

    get isGuest() {
        return this._isGuest;
    }

    get code() {
        return this._code;
    }

    get provider() {
        return this._provider;
    }
}
