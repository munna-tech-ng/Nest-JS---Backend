export class Password {
    private constructor(private readonly _value: string) { }

    static create(raw: string): Password {
        if (!raw || raw.length < 6) {
            throw new Error("Password too short");
        }
        return new Password(raw);
    }

    get value(): string {
        return this._value;
    }
}
