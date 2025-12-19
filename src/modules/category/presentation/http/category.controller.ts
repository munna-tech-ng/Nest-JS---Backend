import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from "@nestjs/swagger";
import { BaseMaper } from "src/core/dto/base.maper.dto";
import { CreateCategoryUseCase } from "../../application/use-cases/create-category.use-case";
import { UpdateCategoryUseCase } from "../../application/use-cases/update-category.use-case";
import { DeleteCategoryUseCase } from "../../application/use-cases/delete-category.use-case";
import { DeleteMultipleCategoryUseCase } from "../../application/use-cases/delete-multiple-category.use-case";
import { GetCategoryUseCase } from "../../application/use-cases/get-category.use-case";
import { GetCategoriesUseCase } from "../../application/use-cases/get-categories.use-case";
import { RestoreCategoryUseCase } from "../../application/use-cases/restore-category.use-case";
import { RestoreMultipleCategoryUseCase } from "../../application/use-cases/restore-multiple-category.use-case";
import { DeletePermanentCategoryUseCase } from "../../application/use-cases/delete-permanent-category.use-case";
import { DeletePermanentMultipleCategoryUseCase } from "../../application/use-cases/delete-permanent-multiple-category.use-case";
import { CreateCategoryRequestDto } from "./http-dto/create-category.request.dto";
import { UpdateCategoryRequestDto } from "./http-dto/update-category.request.dto";
import { DeleteMultipleCategoryRequestDto } from "./http-dto/delete-multiple.request.dto";
import { CategoryMapper } from "./http-dto/category.mapper";

@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly deleteMultipleCategoryUseCase: DeleteMultipleCategoryUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly restoreCategoryUseCase: RestoreCategoryUseCase,
    private readonly restoreMultipleCategoryUseCase: RestoreMultipleCategoryUseCase,
    private readonly deletePermanentCategoryUseCase: DeletePermanentCategoryUseCase,
    private readonly deletePermanentMultipleCategoryUseCase: DeletePermanentMultipleCategoryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({ status: 201, description: "Category created successfully" })
  async create(@Body() body: CreateCategoryRequestDto): Promise<BaseMaper> {
    const category = await this.createCategoryUseCase.execute(body);
    return {
      title: "Category Created",
      message: "Category has been created successfully",
      error: false,
      statusCode: HttpStatus.CREATED,
      data: CategoryMapper.toDto(category),
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a category" })
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateCategoryRequestDto,
  ): Promise<BaseMaper> {
    const category = await this.updateCategoryUseCase.execute(id, body);
    return {
      title: "Category Updated",
      message: "Category has been updated successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: CategoryMapper.toDto(category),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a category (soft delete)" })
  @ApiResponse({ status: 200, description: "Category deleted successfully" })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deleteCategoryUseCase.execute(id);
    return {
      title: "Category Deleted",
      message: "Category has been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("multiple")
  @ApiOperation({ summary: "Delete multiple categories (soft delete)" })
  @ApiResponse({ status: 200, description: "Categories deleted successfully" })
  async deleteMultiple(@Body() body: DeleteMultipleCategoryRequestDto): Promise<BaseMaper> {
    await this.deleteMultipleCategoryUseCase.execute(body);
    return {
      title: "Categories Deleted",
      message: "Categories have been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a category by ID" })
  @ApiResponse({ status: 200, description: "Category retrieved successfully" })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  async getOne(
    @Param("id", ParseIntPipe) id: number,
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<BaseMaper> {
    const category = await this.getCategoryUseCase.execute(
      id,
      includeDeleted === "true",
    );
    return {
      title: "Category Retrieved",
      message: "Category has been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: CategoryMapper.toDto(category),
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all categories with pagination" })
  @ApiResponse({ status: 200, description: "Categories retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 2 })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  async getAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<BaseMaper> {
    const result = await this.getCategoriesUseCase.execute({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      includeDeleted: includeDeleted === "true",
    });
    return {
      title: "Categories Retrieved",
      message: "Categories have been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: {
        items: CategoryMapper.toDtoList(result.items),
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore a deleted category" })
  @ApiResponse({ status: 200, description: "Category restored successfully" })
  async restore(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.restoreCategoryUseCase.execute(id);
    return {
      title: "Category Restored",
      message: "Category has been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Post("restore/multiple")
  @ApiOperation({ summary: "Restore multiple deleted categories" })
  @ApiResponse({ status: 200, description: "Categories restored successfully" })
  async restoreMultiple(@Body() body: DeleteMultipleCategoryRequestDto): Promise<BaseMaper> {
    await this.restoreMultipleCategoryUseCase.execute(body);
    return {
      title: "Categories Restored",
      message: "Categories have been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete(":id/permanent")
  @ApiOperation({ summary: "Permanently delete a category" })
  @ApiResponse({ status: 200, description: "Category permanently deleted" })
  async deletePermanent(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deletePermanentCategoryUseCase.execute(id);
    return {
      title: "Category Permanently Deleted",
      message: "Category has been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("permanent/multiple")
  @ApiOperation({ summary: "Permanently delete multiple categories" })
  @ApiResponse({ status: 200, description: "Categories permanently deleted" })
  async deletePermanentMultiple(@Body() body: DeleteMultipleCategoryRequestDto): Promise<BaseMaper> {
    await this.deletePermanentMultipleCategoryUseCase.execute(body);
    return {
      title: "Categories Permanently Deleted",
      message: "Categories have been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }
}

