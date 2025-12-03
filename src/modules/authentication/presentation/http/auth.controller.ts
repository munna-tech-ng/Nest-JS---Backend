import { Body, Controller, Get, HttpStatus, Post, UseGuards, Request, Res, Headers } from "@nestjs/common";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { CheckAuthUseCase } from "../../application/use-cases/check-auth.use-case";
import { RefreshTokenUseCase } from "../../application/use-cases/refresh-token.use-case";
import { LoginRequestDto } from "./http-dto/login.request.dto";
import { RefreshTokenRequestDto } from "./http-dto/refresh-token.request.dto";
import { AuthUserMapper } from "./http-dto/auth-user.mapper";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { RegisterRequestDto } from "./http-dto/register.request.dto";
import { BaseMaper } from "src/core/dto/base.maper.dto";
import { JwtAuthGuard } from "../../infrastructure/guards/jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginApiDocs } from "./swagger/login.swagger";
import { RegisterApiDocs } from "./swagger/register.swagger";
import { RefreshTokenApiDocs } from "./swagger/refresh-token.swagger";
import { FastifyReply, FastifyRequest } from "fastify";
import { CookieService } from "../../infrastructure/providers/cookie.service";
import { LogoutApiDocs } from "./swagger/logout.swagger";
import { InvalidTokenException } from "../../domain/exceptions";


@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
        private readonly checkAuthUseCase: CheckAuthUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly cookieService: CookieService,
    ) { }

    @Post("login")
    @LoginApiDocs()
    async login(
        @Body() body: LoginRequestDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<BaseMaper> {
        const result = await this.loginUseCase.execute(body);
        const data = {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            refreshTokenExpiresAt: result.refreshTokenExpiresAt,
            user: AuthUserMapper.toDto(result.user),
        };

        // Set HTTP-only cookies for web clients
        this.cookieService.setAuthCookies(
            response,
            result.accessToken,
            result.refreshToken,
            body.rememberMe ?? false,
        );

        return {
            title: "Login Success",
            message: "Your login has been successful",
            error: false,
            statusCode: HttpStatus.OK,
            data
        };
    }

    @Post("register")
    @RegisterApiDocs()
    async register(
        @Body() body: RegisterRequestDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<BaseMaper> {
        await this.registerUseCase.execute({
            method: body.method as Extract<AuthMethodType, "email" | "firebase">,
            payload: body.payload as { email: string; password: string, name: string } | { idToken: string },
        });

        const loginResult = await this.loginUseCase.execute(body);
        const data = {
            accessToken: loginResult.accessToken,
            refreshToken: loginResult.refreshToken,
            accessTokenExpiresAt: loginResult.accessTokenExpiresAt,
            refreshTokenExpiresAt: loginResult.refreshTokenExpiresAt,
            user: AuthUserMapper.toDto(loginResult.user),
        };

        // Set HTTP-only cookies for web clients
        this.cookieService.setAuthCookies(
            response,
            loginResult.accessToken,
            loginResult.refreshToken,
            body.rememberMe ?? false,
        );

        return {
            title: "Registration Complete",
            message: "Your registration has been successful",
            error: false,
            statusCode: HttpStatus.OK,
            data
        };
    }

    @Post("refresh")
    @RefreshTokenApiDocs()
    async refresh(
        @Body() body: RefreshTokenRequestDto,
        @Request() req: FastifyRequest,
        @Headers("refresh-token") headerToken?: string,
        @Res({ passthrough: true }) response?: FastifyReply,
    ): Promise<BaseMaper> {
        // Get refresh token from: 1) cookie, 2) header, 3) body
        const cookieToken = (req.cookies as { sso_refresh_token?: string })?.sso_refresh_token;
        const refreshToken = cookieToken || headerToken || body.refreshToken;

        if (!refreshToken) {
            throw new InvalidTokenException();
        }

        const result = await this.refreshTokenUseCase.execute(refreshToken);
        const data = {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            refreshTokenExpiresAt: result.refreshTokenExpiresAt,
            user: AuthUserMapper.toDto(result.user),
        };

        // Update cookies if response object is available (web client)
        if (response) {
            // Use same rememberMe logic - check if original cookie had extended expiration
            // For simplicity, we'll use default expiration (can be enhanced later)
            this.cookieService.setAuthCookies(
                response,
                result.accessToken,
                result.refreshToken,
                false, // Default to false for refresh - can be enhanced
            );
        }

        return {
            title: "Token Refreshed",
            message: "Your tokens have been successfully refreshed",
            error: false,
            statusCode: HttpStatus.OK,
            data,
        };
    }

    @Post("logout")
    @LogoutApiDocs()
    logout(
        @Res() response: FastifyReply,
    ): void {
        // Clear HTTP-only cookies BEFORE sending response
        this.cookieService.clearAuthCookies(response);

        // Manually send response to ensure cookies are set before response is sent
        const responseData: BaseMaper = {
            title: "Logout Successful",
            message: "You have been successfully logged out",
            error: false,
            statusCode: HttpStatus.OK,
            data: null,
        };

        // Send response with cleared cookies
        response.code(HttpStatus.OK).send(responseData);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth("JWT-auth")
    @ApiOperation({ summary: "Get current user information", description: "Retrieves the authenticated user's information. Requires Bearer token in Authorization header." })
    @ApiResponse({ status: 200, description: "User information retrieved successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing Bearer token" })
    async me(@Request() req: any): Promise<BaseMaper> {
        const userId = req.user.userId;
        const result = await this.checkAuthUseCase.execute(userId);
        const data = AuthUserMapper.toDto(result.user);
        return {
            title: "User Information",
            message: "Your information has been successfully retrieved",
            error: false,
            statusCode: HttpStatus.OK,
            data
        };
    }
}
