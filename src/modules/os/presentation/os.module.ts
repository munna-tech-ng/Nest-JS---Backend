import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { OsController } from "./http/os.controller";
import { CreateOsUseCase } from "../application/use-cases/create-os.use-case";
import { UpdateOsUseCase } from "../application/use-cases/update-os.use-case";
import { DeleteOsUseCase } from "../application/use-cases/delete-os.use-case";
import { DeleteMultipleOsUseCase } from "../application/use-cases/delete-multiple-os.use-case";
import { GetOsUseCase } from "../application/use-cases/get-os.use-case";
import { GetOsesUseCase } from "../application/use-cases/get-oses.use-case";
import { RestoreOsUseCase } from "../application/use-cases/restore-os.use-case";
import { RestoreMultipleOsUseCase } from "../application/use-cases/restore-multiple-os.use-case";
import { DeletePermanentOsUseCase } from "../application/use-cases/delete-permanent-os.use-case";
import { DeletePermanentMultipleOsUseCase } from "../application/use-cases/delete-permanent-multiple-os.use-case";
import { OS_REPO } from "../domain/contracts/os-repository.port";
import { OsRepository } from "../infrastructure/persistence/os.repository";

@Module({
  controllers: [OsController],
  providers: [
    CreateOsUseCase,
    UpdateOsUseCase,
    DeleteOsUseCase,
    DeleteMultipleOsUseCase,
    GetOsUseCase,
    GetOsesUseCase,
    RestoreOsUseCase,
    RestoreMultipleOsUseCase,
    DeletePermanentOsUseCase,
    DeletePermanentMultipleOsUseCase,
    { provide: OS_REPO, useClass: OsRepository },
  ],
  exports: [],
})
export class OsModule implements OnModuleInit {
  private readonly logger = new Logger(OsModule.name);

  onModuleInit() {
    this.logger.log("OS module ready to serve");
  }
}

