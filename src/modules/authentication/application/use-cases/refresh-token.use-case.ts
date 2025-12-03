import { Inject, Injectable } from "@nestjs/common";
import { TOKEN_SERVICE, TokenServicePort } from "../../domain/contracts/token-service.port";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { LoginOutputDto } from "../dto/login-output.dto";
import { InvalidTokenException, UserNotFoundException } from "../../domain/exceptions";

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
        @Inject(AUTH_USER_REPO)
        private readonly users: AuthUserRepositoryPort,
    ) { }

    async execute(refreshToken: string): Promise<LoginOutputDto> {
        try {
            // Verify refresh token and extract userId
            const { userId } = await this.tokenService.verify(refreshToken);

            // Verify user still exists
            const user = await this.users.findById(userId);
            if (!user) {
                throw new UserNotFoundException(userId);
            }

            // Generate new token pair using refresh method
            const tokenPair = await this.tokenService.refresh(refreshToken);

            return {
                user,
                ...tokenPair,
            };
        } catch (error) {
            // If token verification fails or user not found, throw appropriate exception
            if (error instanceof UserNotFoundException) {
                throw error;
            }
            throw new InvalidTokenException();
        }
    }
}

