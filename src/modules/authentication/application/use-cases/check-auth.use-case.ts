import { Inject, Injectable } from "@nestjs/common";
import { TOKEN_SERVICE, TokenServicePort } from "../../domain/contracts/token-service.port";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { LoginOutputDto } from "../dto/login-output.dto";
import { UserNotFoundException } from "../../domain/exceptions";


@Injectable()
export class CheckAuthUseCase {
    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
        @Inject(AUTH_USER_REPO)
        private readonly users: AuthUserRepositoryPort,
    ) { }

    async execute(userId: string): Promise<LoginOutputDto> {
        const user = await this.users.findById(userId);
        if (!user) throw new UserNotFoundException();

        // Optionally re-issue a new token or reuse current one
        const tokenInformation = await this.tokenService.generate(user);

        return {
            user,
            ...tokenInformation
        };
    }
}
