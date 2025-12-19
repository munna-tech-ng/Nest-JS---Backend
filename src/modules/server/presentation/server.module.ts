import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { ServerController } from "./http/server.controller";
import { CreateServerUseCase } from "../application/use-cases/create-server.use-case";
import { UpdateServerUseCase } from "../application/use-cases/update-server.use-case";
import { DeleteServerUseCase } from "../application/use-cases/delete-server.use-case";
import { DeleteMultipleServerUseCase } from "../application/use-cases/delete-multiple-server.use-case";
import { GetServerUseCase } from "../application/use-cases/get-server.use-case";
import { GetServersUseCase } from "../application/use-cases/get-servers.use-case";
import { RestoreServerUseCase } from "../application/use-cases/restore-server.use-case";
import { RestoreMultipleServerUseCase } from "../application/use-cases/restore-multiple-server.use-case";
import { DeletePermanentServerUseCase } from "../application/use-cases/delete-permanent-server.use-case";
import { DeletePermanentMultipleServerUseCase } from "../application/use-cases/delete-permanent-multiple-server.use-case";
import { SERVER_REPO } from "../domain/contracts/server-repository.port";
import { ServerRepository } from "../infrastructure/persistence/server.repository";

@Module({
  controllers: [ServerController],
  providers: [
    CreateServerUseCase,
    UpdateServerUseCase,
    DeleteServerUseCase,
    DeleteMultipleServerUseCase,
    GetServerUseCase,
    GetServersUseCase,
    RestoreServerUseCase,
    RestoreMultipleServerUseCase,
    DeletePermanentServerUseCase,
    DeletePermanentMultipleServerUseCase,
    { provide: SERVER_REPO, useClass: ServerRepository },
  ],
  exports: [],
})
export class ServerModule implements OnModuleInit {
  private readonly logger = new Logger(ServerModule.name);

  onModuleInit() {
    this.logger.log("Server module ready to serve");
  }
}

