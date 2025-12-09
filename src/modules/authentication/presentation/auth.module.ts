import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { AuthController } from "./http/auth.controller";
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { RegisterUseCase } from "../application/use-cases/register.use-case";
import { CheckAuthUseCase } from "../application/use-cases/check-auth.use-case";
import { RefreshTokenUseCase } from "../application/use-cases/refresh-token.use-case";
import { AUTH_USER_REPO } from "../domain/contracts/auth-user-repository.port";
import { AuthUserRepository } from "../infrastructure/persistence/auth-user.repository";
import { TOKEN_SERVICE } from "../domain/contracts/token-service.port";
import { JwtTokenService } from "../infrastructure/providers/jwt-token.service";
import { EmailAuthMethod } from "../infrastructure/auth-methods/email-auth.method";
import { FirebaseAuthMethod } from "../infrastructure/auth-methods/firebase-auth.method";
import { CodeAuthMethod } from "../infrastructure/auth-methods/code-auth.method";
import { GuestAuthMethod } from "../infrastructure/auth-methods/guest-auth.method";
import { AUTH_METHODS } from "../domain/contracts/auth-method.port";
import { JwtModule } from "@nestjs/jwt";
import { FirebaseAdminService } from "../infrastructure/providers/firebase-admin.service";
import { CookieService } from "../infrastructure/providers/cookie.service";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../infrastructure/guards/jwt.strategy";
import { PhoneAuthMethod } from "../infrastructure/auth-methods/phone-auth.method";
import { AuthUserService } from "../application/services/auth-user-service";
import { AUTH_SERVICE } from "../domain/contracts/auth-service-port";
import { AuthServiceRepository } from "../infrastructure/persistence/auth-service.repository";

@Module({
    controllers: [AuthController],
    imports: [
        PassportModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET ?? "jwt-secret",
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [
        LoginUseCase,
        RegisterUseCase,
        CheckAuthUseCase,
        RefreshTokenUseCase,

        { provide: AUTH_USER_REPO, useClass: AuthUserRepository },
        { provide: TOKEN_SERVICE, useClass: JwtTokenService },

        FirebaseAdminService,
        JwtStrategy,
        CookieService,
        EmailAuthMethod,
        FirebaseAuthMethod,
        CodeAuthMethod,
        GuestAuthMethod,
        PhoneAuthMethod,
        AuthUserService,

        {
            provide: AUTH_METHODS,
            useFactory: (
                email: EmailAuthMethod,
                firebase: FirebaseAuthMethod,
                code: CodeAuthMethod,
                guest: GuestAuthMethod,
                phone: PhoneAuthMethod,
            ) => [email, firebase, code, guest, phone],
            inject: [EmailAuthMethod, FirebaseAuthMethod, CodeAuthMethod, GuestAuthMethod, PhoneAuthMethod],
        },

        {
            provide: AUTH_SERVICE,
            useClass: AuthServiceRepository,
        }
    ],
    exports: []
})
export class AuthModule implements OnModuleInit {
    private readonly logger: Logger = new Logger(AuthModule.name);

    onModuleInit() {
        this.logger.log("Auth module ready to serve");
    }
}