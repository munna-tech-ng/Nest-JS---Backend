import { AuthValidationException } from "../exceptions";

export class Password {
    private constructor(private readonly _value: string) { }

    static create(raw: string): Password {
        if (!raw || raw.length < 6) {
            throw new AuthValidationException("Password too short", "password");
        }
        return new Password(raw);
    }

    get value(): string {
        return this._value;
    }
}
