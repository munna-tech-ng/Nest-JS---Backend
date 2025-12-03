import { AuthMethodType } from "src/modules/authentication/domain/types/auth-method-type";

export class LoginRequestDto {
    method: AuthMethodType;
    payload: any;
    device?: {
        id: string;
        platform: "android" | "ios" | "macOS" | "windows" | "tv" | "linux" | "web";
    };
}
