import { Inject, Injectable } from "@nestjs/common";
import { LoginInputDto } from "../dto/login-input.dto";
import { AUTH_METHODS, AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { TOKEN_SERVICE, TokenServicePort } from "../../domain/contracts/token-service.port";
import { LoginOutputDto } from "../dto/login-output.dto";

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(AUTH_METHODS)
        private readonly methods: AuthMethodPort[],

        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
    ) { }

    async execute(input: LoginInputDto): Promise<LoginOutputDto> {
        const method = this.methods.find((m) => m.type === input.method);
        if (!method) {
            throw new Error("Unsupported login method");
        }

        const user = await method.login(input.payload);
        const tokenInformation = await this.tokenService.generate(user);

        return {
            user,
            ...tokenInformation
        };
    }
}