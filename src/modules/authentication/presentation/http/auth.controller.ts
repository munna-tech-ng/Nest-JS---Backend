import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { CheckAuthUseCase } from "../../application/use-cases/check-auth.use-case";
import { LoginRequestDto } from "./http-dto/login.request.dto";
import { AuthResponseDto } from "./http-dto/auth.response.dto";
import { AuthUserMapper } from "./http-dto/auth-user.mapper";
import { AuthMethodType } from "../../domain/types/auth-method-type";


@Controller("auth")
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
        private readonly checkAuthUseCase: CheckAuthUseCase,
    ) { }

    @Post("login")
    async login(@Body() body: LoginRequestDto): Promise<AuthResponseDto> {
        const result = await this.loginUseCase.execute(body);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            refreshTokenExpiresAt: result.refreshTokenExpiresAt,
            user: AuthUserMapper.toDto(result.user),
        };
    }

    @Post("register")
    async register(@Body() body: LoginRequestDto): Promise<AuthResponseDto> {
        await this.registerUseCase.execute({
            method: body.method as Extract<AuthMethodType, "email" | "firebase">,
            payload: body.payload as { email: string; password: string } | { idToken: string },
        });

        const loginResult = await this.loginUseCase.execute(body);
        return {
            accessToken: loginResult.accessToken,
            refreshToken: loginResult.refreshToken,
            accessTokenExpiresAt: loginResult.accessTokenExpiresAt,
            refreshTokenExpiresAt: loginResult.refreshTokenExpiresAt,
            user: AuthUserMapper.toDto(loginResult.user),
        };
    }

    @Get("me")
    async me(@Headers("authorization") authHeader: string): Promise<AuthResponseDto> {
        const token = authHeader?.replace("Bearer ", "") ?? "";
        const result = await this.checkAuthUseCase.execute(token);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            refreshTokenExpiresAt: result.refreshTokenExpiresAt,
            user: AuthUserMapper.toDto(result.user),
        };
    }
}
