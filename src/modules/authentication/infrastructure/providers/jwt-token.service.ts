import { Injectable } from "@nestjs/common";
import { TokenPair, TokenServicePort } from "../../domain/contracts/token-service.port";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtTokenService implements TokenServicePort {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    async generate(user: AuthUser): Promise<TokenPair> {
        const payload = { sub: user.id };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload);
        const accessTokenExpiresAt = new Date(Date.now() + (this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? 60 * 60 * 1000));
        const refreshTokenExpiresAt = new Date(Date.now() + (this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? 60 * 60 * 24 * 1000));
        return { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } as TokenPair;
    }

    async verify(accessToken: string): Promise<{ userId: string }> {
        console.log(accessToken);
        const decoded = await this.jwtService.verifyAsync<{ sub: string }>(accessToken, {
            secret: this.configService.get<string>('JWT_SECRET') as string,
        });
        return { userId: decoded.sub };
    }
}
