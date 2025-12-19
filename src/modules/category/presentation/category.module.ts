import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { CategoryController } from "./http/category.controller";
import { CreateCategoryUseCase } from "../application/use-cases/create-category.use-case";
import { UpdateCategoryUseCase } from "../application/use-cases/update-category.use-case";
import { DeleteCategoryUseCase } from "../application/use-cases/delete-category.use-case";
import { DeleteMultipleCategoryUseCase } from "../application/use-cases/delete-multiple-category.use-case";
import { GetCategoryUseCase } from "../application/use-cases/get-category.use-case";
import { GetCategoriesUseCase } from "../application/use-cases/get-categories.use-case";
import { RestoreCategoryUseCase } from "../application/use-cases/restore-category.use-case";
import { RestoreMultipleCategoryUseCase } from "../application/use-cases/restore-multiple-category.use-case";
import { DeletePermanentCategoryUseCase } from "../application/use-cases/delete-permanent-category.use-case";
import { DeletePermanentMultipleCategoryUseCase } from "../application/use-cases/delete-permanent-multiple-category.use-case";
import { CATEGORY_REPO } from "../domain/contracts/category-repository.port";
import { CategoryRepository } from "../infrastructure/persistence/category.repository";

@Module({
  controllers: [CategoryController],
  providers: [
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    DeleteMultipleCategoryUseCase,
    GetCategoryUseCase,
    GetCategoriesUseCase,
    RestoreCategoryUseCase,
    RestoreMultipleCategoryUseCase,
    DeletePermanentCategoryUseCase,
    DeletePermanentMultipleCategoryUseCase,
    { provide: CATEGORY_REPO, useClass: CategoryRepository },
  ],
  exports: [],
})
export class CategoryModule implements OnModuleInit {
  private readonly logger = new Logger(CategoryModule.name);

  onModuleInit() {
    this.logger.log("Category module ready to serve");
  }
}

