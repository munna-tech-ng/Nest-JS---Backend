import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './infra/db/db.module';
import { ConfigModule } from '@nestjs/config';
import configService from "./core/config"
import { AuthModule } from './modules/authentication/presentation/auth.module';
import { CategoryModule } from './modules/category/presentation/category.module';
import { LocationModule } from './modules/location/presentation/location.module';
import { OsModule } from './modules/os/presentation/os.module';
import { TagModule } from './modules/tag/presentation/tag.module';
import { ServerModule } from './modules/server/presentation/server.module';
import { QueueModule } from './infra/queue/queue.module';
import { FileManagerModule } from './modules/filemanager/presentation/filemanager.module';

@Module({
  imports: [
    DBModule,
    QueueModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [...configService],
    }),
    AuthModule,
    CategoryModule,
    LocationModule,
    OsModule,
    TagModule,
    ServerModule,
    FileManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
