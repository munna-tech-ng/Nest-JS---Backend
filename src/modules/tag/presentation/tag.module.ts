import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { TagController } from "./http/tag.controller";
import { CreateTagUseCase } from "../application/use-cases/create-tag.use-case";
import { UpdateTagUseCase } from "../application/use-cases/update-tag.use-case";
import { DeleteTagUseCase } from "../application/use-cases/delete-tag.use-case";
import { DeleteMultipleTagUseCase } from "../application/use-cases/delete-multiple-tag.use-case";
import { GetTagUseCase } from "../application/use-cases/get-tag.use-case";
import { GetTagsUseCase } from "../application/use-cases/get-tags.use-case";
import { RestoreTagUseCase } from "../application/use-cases/restore-tag.use-case";
import { RestoreMultipleTagUseCase } from "../application/use-cases/restore-multiple-tag.use-case";
import { DeletePermanentTagUseCase } from "../application/use-cases/delete-permanent-tag.use-case";
import { DeletePermanentMultipleTagUseCase } from "../application/use-cases/delete-permanent-multiple-tag.use-case";
import { TAG_REPO } from "../domain/contracts/tag-repository.port";
import { TagRepository } from "../infrastructure/persistence/tag.repository";

@Module({
  controllers: [TagController],
  providers: [
    CreateTagUseCase,
    UpdateTagUseCase,
    DeleteTagUseCase,
    DeleteMultipleTagUseCase,
    GetTagUseCase,
    GetTagsUseCase,
    RestoreTagUseCase,
    RestoreMultipleTagUseCase,
    DeletePermanentTagUseCase,
    DeletePermanentMultipleTagUseCase,
    { provide: TAG_REPO, useClass: TagRepository },
  ],
  exports: [],
})
export class TagModule implements OnModuleInit {
  private readonly logger = new Logger(TagModule.name);

  onModuleInit() {
    this.logger.log("Tag module ready to serve");
  }
}

