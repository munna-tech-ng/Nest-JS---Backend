import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule } from "@nestjs/swagger";
import { GlobalExceptionFilter } from "./core/exceptions/global-exception.filter";
import { swaggerConfig, swaggerOptions } from "./core/config/swagger.config";
import { corsConfig } from "./core/config/cors.config";
import { multipartConfig } from "./core/config/multipart.config";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { join } from "path";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );

    // Enable CORS
    await app.register(fastifyCors, corsConfig);

    // Register cookie plugin
    await app.register(fastifyCookie);

    // Configure Fastify to parse multipart/form-data with config
    await app.register(fastifyMultipart, multipartConfig);

    // Use public as asset directory
    await app.register(fastifyStatic, {
        root: join(process.cwd(), "public"),
        prefix: "/public/",
    });

    // Apply global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Setup Swagger documentation
    const document = SwaggerModule.createDocument(app, swaggerConfig, swaggerOptions);
    SwaggerModule.setup("api-docs", app, document);

    // Run the application
    await app.listen(process.env.PORT ?? 3001, "0.0.0.0");
}

bootstrap().then(() => {
    console.log(`Server is running on  http://127.0.0.1:${process.env.PORT ?? 3001}`);
}).catch((error) => {
    console.error("Error starting server", error);
    process.exit(1);
});
