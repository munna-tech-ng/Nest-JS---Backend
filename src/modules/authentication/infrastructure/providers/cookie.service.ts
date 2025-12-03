import { Injectable } from "@nestjs/common";
import { FastifyReply } from "fastify";

@Injectable()
export class CookieService {
    /**
     * Set authentication cookies (access token and refresh token)
     * @param response Fastify response object
     * @param accessToken JWT access token
     * @param refreshToken JWT refresh token
     * @param rememberMe Whether to extend cookie expiration (default: false)
     */
    setAuthCookies(
        response: FastifyReply,
        accessToken: string,
        refreshToken: string,
        rememberMe: boolean = false,
    ): void {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
        };

        // Access token expiration: 30 days if rememberMe, otherwise 7 days
        const accessTokenMaxAge = rememberMe
            ? 1000 * 60 * 60 * 24 * 30 // 30 days in milliseconds
            : 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds

        // Refresh token expiration: 60 days if rememberMe, otherwise 30 days
        const refreshTokenMaxAge = rememberMe
            ? 1000 * 60 * 60 * 24 * 60 // 60 days in milliseconds
            : 1000 * 60 * 60 * 24 * 30; // 30 days in milliseconds

        // Set access token cookie
        response.setCookie("sso_token", accessToken, {
            ...cookieOptions,
            maxAge: accessTokenMaxAge,
        });

        // Set refresh token cookie
        response.setCookie("sso_refresh_token", refreshToken, {
            ...cookieOptions,
            maxAge: refreshTokenMaxAge,
        });
    }

    /**
     * Clear authentication cookies
     * @param response Fastify response object
     */
    clearAuthCookies(response: FastifyReply): void {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
        };

        // Clear access token cookie
        response.clearCookie("sso_token", cookieOptions);

        // Clear refresh token cookie
        response.clearCookie("sso_refresh_token", cookieOptions);
    }
}

