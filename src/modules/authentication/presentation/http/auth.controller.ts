import { Body, Controller, Get, Headers, HttpStatus, Post } from "@nestjs/common";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { CheckAuthUseCase } from "../../application/use-cases/check-auth.use-case";
import { LoginRequestDto } from "./http-dto/login.request.dto";
import { AuthUserMapper } from "./http-dto/auth-user.mapper";
import { AuthMethodType } from "../../domain/types/auth-method-type";
import { RegisterRequestDto } from "./http-dto/register.request.dto";
import { BaseMaper } from "src/core/dto/base.maper.dto";


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
    async me(@Headers("authorization") authHeader: string): Promise<BaseMaper> {
        console.log(authHeader);
        const token = authHeader?.replace("Bearer ", "") ?? "";
        console.log("hello", token)
        const result = await this.checkAuthUseCase.execute(token);
        const data = {
            user: AuthUserMapper.toDto(result.user),
        };
        return {
            title: "User Information",
            message: "You'r user information has been successfully retrieved",
            error: false,
            statusCode: HttpStatus.OK,
            data
        };
    }
}
