import { AuthUser } from "src/modules/authentication/domain/entities/auth-user.entity";
import { AuthUserResponseDto } from "./auth.response.dto";

export class AuthUserMapper {    
    static toDto(user: AuthUser): AuthUserResponseDto {
        return {
            email: user.email ? user.email.value : null,
            isGuest: user.isGuest,
            provider: user.provider
        };
    }
}
