import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { FileManagerController } from "./http/filemanager.controller";
import { UploadFileUseCase } from "../application/use-cases/upload-file.use-case";
import { DeleteFileUseCase } from "../application/use-cases/delete-file.use-case";
import { FILE_UPLOAD_SERVICE } from "../domain/contracts/file-upload-service.port";
import { FileUploadService } from "../infrastructure/providers/file-upload.service";
import { STORAGE } from "../domain/contracts/storage.port";
import { LocalStorageProvider } from "../infrastructure/storage/local-storage.provider";
import { FileUploadProcessor } from "../infrastructure/queue/file-upload.processor";
import { QueueModule } from "src/infra/queue/queue.module";

@Module({
  imports: [QueueModule],
  controllers: [FileManagerController],
  providers: [
    UploadFileUseCase,
    DeleteFileUseCase,
    FileUploadProcessor,
    { provide: STORAGE, useClass: LocalStorageProvider },
    { provide: FILE_UPLOAD_SERVICE, useClass: FileUploadService },
  ],
  exports: [FILE_UPLOAD_SERVICE],
})
export class FileManagerModule implements OnModuleInit {
  private readonly logger = new Logger(FileManagerModule.name);

  onModuleInit() {
    this.logger.log("FileManager module ready to serve");
  }
}

