import { AuthMethodType } from "../../domain/types/auth-method-type";

export interface LoginInputDto {
    method: AuthMethodType;
    payload: any;
    device?: {
        id: string;
        platform: "android" | "ios" | "macOS" | "windows" | "tv" | "linux" | "web";
    };
}