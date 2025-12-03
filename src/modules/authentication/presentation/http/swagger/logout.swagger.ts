import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function LogoutApiDocs() {
    return applyDecorators(
        ApiOperation({
            summary: "User Logout",
            description: `Logout the current user and clear authentication cookies.
            
**Note:** This endpoint clears HTTP-only cookies (sso_token and sso_refresh_token) set during login/registration.
No authentication is required to call this endpoint.`,
        }),
        ApiResponse({
            status: 200,
            description: "Logout successful - cookies cleared",
            schema: {
                example: {
                    title: "Logout Successful",
                    message: "You have been successfully logged out",
                    error: false,
                    statusCode: 200,
                    data: null,
                },
            },
        }),
    );
}

