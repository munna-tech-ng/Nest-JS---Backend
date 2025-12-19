import { DocumentBuilder, SwaggerDocumentOptions } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
    .setTitle("Backend 2.0")
    .setDescription("The Backend 2.0 API description")
    .setVersion("1.0")
    .addBearerAuth(
        {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            name: "JWT",
            description: "Enter JWT token",
            in: "header",
        },
        "JWT-auth", // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

export const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
};

