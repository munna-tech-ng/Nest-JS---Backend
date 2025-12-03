import { Inject, Injectable } from "@nestjs/common";
import { RegisterInputDto } from "../dto/register-input.dto";
import { AUTH_METHODS, AuthMethodPort } from "../../domain/contracts/auth-method.port";

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(AUTH_METHODS) private readonly methods: AuthMethodPort[],
    ) { }

    async execute(input: RegisterInputDto) {
        const method = this.methods.find((m) => m.type === input.method);
        if (!method || !method.register) {
            throw new Error("Unsupported register method");
        }

        return await method.register(input.payload);
    }
}
