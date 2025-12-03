import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule } from "@nestjs/swagger";
import { GlobalExceptionFilter } from "./core/exceptions/global-exception.filter";
import { swaggerConfig, swaggerOptions } from "./core/config/swagger.config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Apply global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Setup Swagger documentation
    const document = SwaggerModule.createDocument(app, swaggerConfig, swaggerOptions);
    SwaggerModule.setup("api", app, document);

    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
