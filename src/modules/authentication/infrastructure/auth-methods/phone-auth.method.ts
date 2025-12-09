import { AuthMethodType } from "../../domain/types/auth-method-type";
import { AuthMethodPort } from "../../domain/contracts/auth-method.port";
import { AUTH_USER_REPO, AuthUserRepositoryPort } from "../../domain/contracts/auth-user-repository.port";
import { Inject } from "@nestjs/common";
import { AuthUser } from "../../domain/entities/auth-user.entity";
import { Phone } from "../../domain/value-objects/phone.vo";
import { InvalidPhoneNumberException, UserAlreadyExistsException, UserNotFoundException } from "../../domain/exceptions/auth.exceptions";
import { randomUUID } from "crypto";
import { Email } from "../../domain/value-objects/email.vo";

export class PhoneAuthMethod implements AuthMethodPort {
    readonly type: AuthMethodType = "phone";

    constructor(
        @Inject(AUTH_USER_REPO)
        private readonly users: AuthUserRepositoryPort,
    ) { }

    async login(payload: { phone: string, otp: string }): Promise<AuthUser> {
        const phone = Phone.create(payload.phone);
        if (!phone) throw new InvalidPhoneNumberException();
        const user = await this.users.findByPhone(phone);
        if (!user) throw new UserNotFoundException();
        return user;
    }

    async register(payload: { name: string, phone: string, otp: string }): Promise<AuthUser> {
        const phone = Phone.create(payload.phone);
        if (!phone) throw new InvalidPhoneNumberException();
        const user = await this.users.findByPhone(phone);
        if (user) throw new UserAlreadyExistsException();
        const passwordHash: string = await this.users.generatePasswordHash(payload.otp);
        const newUser = new AuthUser(randomUUID(), Email.create(phone.value), payload.name ?? "User", false, null, "phone", false, phone);
        await this.users.save({ user: newUser, passwordHash, provider: "phone" });
        return newUser;
    }
}