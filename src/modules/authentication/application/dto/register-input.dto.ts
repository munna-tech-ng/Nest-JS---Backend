import { AuthMethodType } from "../../domain/types/auth-method-type";

export interface RegisterInputDto {
    method: Extract<AuthMethodType, "email" | "firebase" | "phone">;
    payload: any;
}