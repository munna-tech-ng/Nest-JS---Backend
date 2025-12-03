import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        // Check if Bearer token is present
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Bearer token is required");
        }

        // If there's an error or no user, throw unauthorized
        if (err || !user) {
            throw err || new UnauthorizedException("Invalid or expired token");
        }

        return user;
    }
}

