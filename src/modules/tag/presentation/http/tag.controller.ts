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
import { CreateTagUseCase } from "../../application/use-cases/create-tag.use-case";
import { UpdateTagUseCase } from "../../application/use-cases/update-tag.use-case";
import { DeleteTagUseCase } from "../../application/use-cases/delete-tag.use-case";
import { DeleteMultipleTagUseCase } from "../../application/use-cases/delete-multiple-tag.use-case";
import { GetTagUseCase } from "../../application/use-cases/get-tag.use-case";
import { GetTagsUseCase } from "../../application/use-cases/get-tags.use-case";
import { RestoreTagUseCase } from "../../application/use-cases/restore-tag.use-case";
import { RestoreMultipleTagUseCase } from "../../application/use-cases/restore-multiple-tag.use-case";
import { DeletePermanentTagUseCase } from "../../application/use-cases/delete-permanent-tag.use-case";
import { DeletePermanentMultipleTagUseCase } from "../../application/use-cases/delete-permanent-multiple-tag.use-case";
import { CreateTagRequestDto } from "./http-dto/create-tag.request.dto";
import { UpdateTagRequestDto } from "./http-dto/update-tag.request.dto";
import { DeleteMultipleTagRequestDto } from "./http-dto/delete-multiple.request.dto";
import { TagMapper } from "./http-dto/tag.mapper";

@ApiTags("Tags")
@Controller("tags")
export class TagController {
  constructor(
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly updateTagUseCase: UpdateTagUseCase,
    private readonly deleteTagUseCase: DeleteTagUseCase,
    private readonly deleteMultipleTagUseCase: DeleteMultipleTagUseCase,
    private readonly getTagUseCase: GetTagUseCase,
    private readonly getTagsUseCase: GetTagsUseCase,
    private readonly restoreTagUseCase: RestoreTagUseCase,
    private readonly restoreMultipleTagUseCase: RestoreMultipleTagUseCase,
    private readonly deletePermanentTagUseCase: DeletePermanentTagUseCase,
    private readonly deletePermanentMultipleTagUseCase: DeletePermanentMultipleTagUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new tag" })
  @ApiResponse({ status: 201, description: "Tag created successfully" })
  async create(@Body() body: CreateTagRequestDto): Promise<BaseMaper> {
    const tag = await this.createTagUseCase.execute(body);
    return {
      title: "Tag Created",
      message: "Tag has been created successfully",
      error: false,
      statusCode: HttpStatus.CREATED,
      data: TagMapper.toDto(tag),
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a tag" })
  @ApiResponse({ status: 200, description: "Tag updated successfully" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTagRequestDto,
  ): Promise<BaseMaper> {
    const tag = await this.updateTagUseCase.execute(id, body);
    return {
      title: "Tag Updated",
      message: "Tag has been updated successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: TagMapper.toDto(tag),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a tag (soft delete)" })
  @ApiResponse({ status: 200, description: "Tag deleted successfully" })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deleteTagUseCase.execute(id);
    return {
      title: "Tag Deleted",
      message: "Tag has been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("multiple")
  @ApiOperation({ summary: "Delete multiple tags (soft delete)" })
  @ApiResponse({ status: 200, description: "Tags deleted successfully" })
  async deleteMultiple(@Body() body: DeleteMultipleTagRequestDto): Promise<BaseMaper> {
    await this.deleteMultipleTagUseCase.execute(body);
    return {
      title: "Tags Deleted",
      message: "Tags have been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a tag by ID" })
  @ApiResponse({ status: 200, description: "Tag retrieved successfully" })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  async getOne(
    @Param("id", ParseIntPipe) id: number,
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<BaseMaper> {
    const tag = await this.getTagUseCase.execute(id, includeDeleted === "true");
    return {
      title: "Tag Retrieved",
      message: "Tag has been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: TagMapper.toDto(tag),
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all tags with pagination" })
  @ApiResponse({ status: 200, description: "Tags retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 2 })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  async getAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<BaseMaper> {
    const result = await this.getTagsUseCase.execute({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      includeDeleted: includeDeleted === "true",
    });
    return {
      title: "Tags Retrieved",
      message: "Tags have been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: {
        items: TagMapper.toDtoList(result.items),
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore a deleted tag" })
  @ApiResponse({ status: 200, description: "Tag restored successfully" })
  async restore(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.restoreTagUseCase.execute(id);
    return {
      title: "Tag Restored",
      message: "Tag has been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Post("restore/multiple")
  @ApiOperation({ summary: "Restore multiple deleted tags" })
  @ApiResponse({ status: 200, description: "Tags restored successfully" })
  async restoreMultiple(@Body() body: DeleteMultipleTagRequestDto): Promise<BaseMaper> {
    await this.restoreMultipleTagUseCase.execute(body);
    return {
      title: "Tags Restored",
      message: "Tags have been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete(":id/permanent")
  @ApiOperation({ summary: "Permanently delete a tag" })
  @ApiResponse({ status: 200, description: "Tag permanently deleted" })
  async deletePermanent(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deletePermanentTagUseCase.execute(id);
    return {
      title: "Tag Permanently Deleted",
      message: "Tag has been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("permanent/multiple")
  @ApiOperation({ summary: "Permanently delete multiple tags" })
  @ApiResponse({ status: 200, description: "Tags permanently deleted" })
  async deletePermanentMultiple(@Body() body: DeleteMultipleTagRequestDto): Promise<BaseMaper> {
    await this.deletePermanentMultipleTagUseCase.execute(body);
    return {
      title: "Tags Permanently Deleted",
      message: "Tags have been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }
}

