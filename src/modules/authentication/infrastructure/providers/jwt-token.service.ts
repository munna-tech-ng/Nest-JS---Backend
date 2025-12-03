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
        
        // Parse expiration times from environment (in milliseconds) or use defaults
        // Environment variables are strings, so we need to parse them
        const accessTokenExpiresInMs = this.parseExpirationTime(
            this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
            60 * 60 * 1000 // Default: 1 hour
        );
        const refreshTokenExpiresInMs = this.parseExpirationTime(
            this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
            60 * 60 * 24 * 1000 // Default: 24 hours
        );

        // Sign tokens with expiration times (JWT expects seconds, not milliseconds)
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: Math.floor(accessTokenExpiresInMs / 1000),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: Math.floor(refreshTokenExpiresInMs / 1000),
        });

        const accessTokenExpiresAt = new Date(Date.now() + accessTokenExpiresInMs);
        const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiresInMs);
        
        return { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } as TokenPair;
    }

    /**
     * Parse expiration time from environment variable
     * Supports: number (milliseconds), or string format like "1h", "24h", "30d"
     */
    private parseExpirationTime(value: string | undefined, defaultValue: number): number {
        if (!value) return defaultValue;
        
        // Try to parse as number (milliseconds)
        const parsed = Number(value);
        if (!isNaN(parsed) && parsed > 0) {
            return parsed;
        }
        
        // Try to parse as time string format (e.g., "1h", "24h", "30d", "30m", "30s")
        const match = value.match(/^(\d+)([smhd])?$/i);
        if (match) {
            const amount = parseInt(match[1], 10);
            const unit = (match[2] || 'ms').toLowerCase();
            
            const multipliers: Record<string, number> = {
                'ms': 1,
                's': 1000,
                'm': 60 * 1000,
                'h': 60 * 60 * 1000,
                'd': 24 * 60 * 60 * 1000,
            };
            
            const multiplier = multipliers[unit] || 1;
            return amount * multiplier;
        }
        
        return defaultValue;
    }

    async verify(accessToken: string): Promise<{ userId: string }> {
        const decoded = await this.jwtService.verifyAsync<{ sub: string }>(accessToken, {
            secret: this.configService.get<string>('JWT_SECRET') as string,
        });
        return { userId: decoded.sub };
    }

    async refresh(refreshToken: string): Promise<TokenPair> {
        // Verify refresh token
        const decoded = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
            secret: this.configService.get<string>('JWT_SECRET') as string,
        });

        const userId = decoded.sub;
        const payload = { sub: userId };

        // Parse expiration times from environment or use defaults
        const accessTokenExpiresInMs = this.parseExpirationTime(
            this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
            60 * 60 * 1000 // Default: 1 hour
        );
        const refreshTokenExpiresInMs = this.parseExpirationTime(
            this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
            60 * 60 * 24 * 1000 // Default: 24 hours
        );

        // Generate new token pair
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: Math.floor(accessTokenExpiresInMs / 1000),
        });
        const newRefreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: Math.floor(refreshTokenExpiresInMs / 1000),
        });

        const accessTokenExpiresAt = new Date(Date.now() + accessTokenExpiresInMs);
        const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiresInMs);

        return {
            accessToken,
            refreshToken: newRefreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
        } as TokenPair;
    }
}
