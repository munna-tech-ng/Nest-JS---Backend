import { Inject, Injectable } from "@nestjs/common";
import { ServerRepositoryPort, SERVER_REPO } from "../../domain/contracts/server-repository.port";
import { UpdateServerDto } from "../dto/update-server.dto";
import { Server } from "../../domain/entities/server.entity";
import { ServerNotFoundException, ServerAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class UpdateServerUseCase {
  constructor(
    @Inject(SERVER_REPO)
    private readonly serverRepository: ServerRepositoryPort,
  ) {}

  async execute(id: number, input: UpdateServerDto): Promise<Server> {
    const existing = await this.serverRepository.findById(id);
    if (!existing) {
      throw new ServerNotFoundException(id);
    }

    if (input.name || input.ip) {
      const allServers = await this.serverRepository.findAll({ 
        page: 1, 
        limit: 1000, 
        includeDeleted: false 
      });
      
      if (input.name && input.name !== existing.name) {
        const newName = input.name;
        const nameExists = allServers.items.some(
          srv => srv.id !== id && srv.name.toLowerCase() === newName.toLowerCase()
        );
        if (nameExists) {
          throw new ServerAlreadyExistsException("name", newName);
        }
      }

      if (input.ip && input.ip !== existing.ip) {
        const newIp = input.ip;
        const ipExists = allServers.items.some(
          srv => srv.id !== id && srv.ip === newIp
        );
        if (ipExists) {
          throw new ServerAlreadyExistsException("ip", newIp);
        }
      }
    }

    return await this.serverRepository.update(id, input);
  }
}

