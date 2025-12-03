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
        // Cookie options - must match EXACTLY what was used to set them
        // Important: secure must match (false in dev, true in prod)
        const isProduction = process.env.NODE_ENV === "production";
        const baseOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
        };

        // Try multiple methods to ensure cookies are cleared
        
        // Method 1: Use Fastify's clearCookie
        try {
            response.clearCookie("sso_token", baseOptions);
            response.clearCookie("sso_refresh_token", baseOptions);
        } catch (error) {
            console.error("Error using clearCookie:", error);
        }
        
        // Method 2: Set cookies to empty with maxAge: 0
        try {
            response.setCookie("sso_token", "", {
                ...baseOptions,
                maxAge: 0,
            });
            response.setCookie("sso_refresh_token", "", {
                ...baseOptions,
                maxAge: 0,
            });
        } catch (error) {
            console.error("Error using setCookie with maxAge 0:", error);
        }
        
        // Method 3: Manually set Set-Cookie headers (most reliable)
        // This bypasses Fastify's cookie plugin and sets headers directly
        const secureFlag = isProduction ? "; Secure" : "";
        const cookieHeader1 = `sso_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
        const cookieHeader2 = `sso_refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
        
        // Get existing Set-Cookie headers
        const existingCookies = response.getHeader("Set-Cookie");
        let cookiesArray: string[] = [];
        
        if (existingCookies) {
            cookiesArray = Array.isArray(existingCookies) 
                ? existingCookies 
                : [existingCookies as string];
        }
        
        // Add our cookie clearing headers (these will override any existing ones)
        cookiesArray.push(cookieHeader1, cookieHeader2);
        
        // Set the Set-Cookie header directly
        response.header("Set-Cookie", cookiesArray);
    }
}

