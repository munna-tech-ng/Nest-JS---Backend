import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './infra/db/db.module';
import { ConfigModule } from '@nestjs/config';
import configService from "./core/config"
import { AuthModule } from './modules/authentication/presentation/auth.module';

@Module({
  imports: [
    DBModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [...configService],
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
