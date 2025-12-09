import { AuthValidationException } from "../exceptions/auth.exceptions";

export class Phone {
    private constructor(private readonly _value: string) { }

    static create(raw?: string): Phone | null {
        if (!raw) return null;
        // remove all space, dash, and parenthesis
        const value = raw.trim().replace(/[\s\-()]/g, '');
        if (!value || value.length !== 10) {
            throw new AuthValidationException("Invalid phone number", "phone");
        }
        return new Phone(value);
    }

    get value(): string {
        return this._value;
    }
}