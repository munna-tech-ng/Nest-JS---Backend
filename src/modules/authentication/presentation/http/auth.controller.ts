import { Body, Controller, Get, HttpStatus, Post, UseGuards, Request } from "@nestjs/common";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { CheckAuthUseCase } from "../../application/use-cases/check-auth.use-case";
import { LoginRequestDto } from "./http-dto/login.request.dto";
import { AuthUserMapper } from "./http-dto/auth-user.mapper";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { RegisterRequestDto } from "./http-dto/register.request.dto";
import { BaseMaper } from "src/core/dto/base.maper.dto";
import { JwtAuthGuard } from "../../infrastructure/guards/jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";


@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
        private readonly checkAuthUseCase: CheckAuthUseCase,
    ) { }

    @Post("login")
    async login(@Body() body: LoginRequestDto): Promise<BaseMaper> {
        const result = await this.loginUseCase.execute(body);
        const data = {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            refreshTokenExpiresAt: result.refreshTokenExpiresAt,
            user: AuthUserMapper.toDto(result.user),
        };
        return {
            title: "Login Success",
            message: "You'r login has been successful",
            error: false,
            statusCode: HttpStatus.OK,
            data
        };
    }

    @Post("register")
    async register(@Body() body: RegisterRequestDto): Promise<BaseMaper> {
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

        return {
            title: "Login Success",
            message: "You'r login has been successful",
            error: false,
            statusCode: HttpStatus.OK,
            data
        };
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth("JWT-auth")
    @ApiOperation({ summary: "Get current user information", description: "Retrieves the authenticated user's information. Requires Bearer token in Authorization header." })
    @ApiResponse({ status: 200, description: "User information retrieved successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing Bearer token" })
    async me(@Request() req: any): Promise<BaseMaper> {
        // User is already validated by JwtAuthGuard, userId is available in req.user
        // const userId = req.user.userId;
        const token = req.headers.authorization?.replace("Bearer ", "") ?? "";
        const result = await this.checkAuthUseCase.execute(token);
        const data = AuthUserMapper.toDto(result.user);
        return {
            title: "User Information",
            message: "You'r user information has been successfully retrieved",
            error: false,
            statusCode: HttpStatus.OK,
            data
        };
    }
}
