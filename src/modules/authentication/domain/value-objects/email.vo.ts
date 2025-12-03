export class Email {
    private constructor(private readonly _value: string) { }

    static create(raw: string): Email {
        const value = raw.trim().toLowerCase();
        if (!value || !value.includes("@")) {
            throw new Error("Invalid email");
        }
        return new Email(value);
    }

    get value(): string {
        return this._value;
    }
}  