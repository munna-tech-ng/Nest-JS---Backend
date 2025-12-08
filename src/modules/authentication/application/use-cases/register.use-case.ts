import { Inject, Injectable } from "@nestjs/common";
import { RegisterInputDto } from "../dto/register-input.dto";
import { AUTH_METHODS, AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { UnsupportedAuthMethodException } from "../../domain/exceptions/auth.exceptions";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { TOKEN_SERVICE, TokenPair } from "../../domain/contracts/token-service.port";
import { TokenServicePort } from "../../domain/contracts/token-service.port";

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(AUTH_METHODS) private readonly methods: AuthMethodPort[],
        @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
    ) { }

    async execute(input: RegisterInputDto) {
        const method = this.methods.find((m) => m.type === input.method);
        if (!method || !method.register) {
            throw new UnsupportedAuthMethodException(input.method);
        }
        return await method.register(input.payload);
    }

    async generateToken(user: AuthUser): Promise<TokenPair> {
        return await this.tokenService.generate(user);
    }
}
