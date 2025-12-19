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
import { CreateOsUseCase } from "../../application/use-cases/create-os.use-case";
import { UpdateOsUseCase } from "../../application/use-cases/update-os.use-case";
import { DeleteOsUseCase } from "../../application/use-cases/delete-os.use-case";
import { DeleteMultipleOsUseCase } from "../../application/use-cases/delete-multiple-os.use-case";
import { GetOsUseCase } from "../../application/use-cases/get-os.use-case";
import { GetOsesUseCase } from "../../application/use-cases/get-oses.use-case";
import { RestoreOsUseCase } from "../../application/use-cases/restore-os.use-case";
import { RestoreMultipleOsUseCase } from "../../application/use-cases/restore-multiple-os.use-case";
import { DeletePermanentOsUseCase } from "../../application/use-cases/delete-permanent-os.use-case";
import { DeletePermanentMultipleOsUseCase } from "../../application/use-cases/delete-permanent-multiple-os.use-case";
import { CreateOsRequestDto } from "./http-dto/create-os.request.dto";
import { UpdateOsRequestDto } from "./http-dto/update-os.request.dto";
import { DeleteMultipleOsRequestDto } from "./http-dto/delete-multiple.request.dto";
import { OsMapper } from "./http-dto/os.mapper";

@ApiTags("Operating Systems")
@Controller("os")
export class OsController {
  constructor(
    private readonly createOsUseCase: CreateOsUseCase,
    private readonly updateOsUseCase: UpdateOsUseCase,
    private readonly deleteOsUseCase: DeleteOsUseCase,
    private readonly deleteMultipleOsUseCase: DeleteMultipleOsUseCase,
    private readonly getOsUseCase: GetOsUseCase,
    private readonly getOsesUseCase: GetOsesUseCase,
    private readonly restoreOsUseCase: RestoreOsUseCase,
    private readonly restoreMultipleOsUseCase: RestoreMultipleOsUseCase,
    private readonly deletePermanentOsUseCase: DeletePermanentOsUseCase,
    private readonly deletePermanentMultipleOsUseCase: DeletePermanentMultipleOsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new OS" })
  @ApiResponse({ status: 201, description: "OS created successfully" })
  async create(@Body() body: CreateOsRequestDto): Promise<BaseMaper> {
    const os = await this.createOsUseCase.execute(body);
    return {
      title: "OS Created",
      message: "OS has been created successfully",
      error: false,
      statusCode: HttpStatus.CREATED,
      data: OsMapper.toDto(os),
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an OS" })
  @ApiResponse({ status: 200, description: "OS updated successfully" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateOsRequestDto,
  ): Promise<BaseMaper> {
    const os = await this.updateOsUseCase.execute(id, body);
    return {
      title: "OS Updated",
      message: "OS has been updated successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: OsMapper.toDto(os),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an OS (soft delete)" })
  @ApiResponse({ status: 200, description: "OS deleted successfully" })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deleteOsUseCase.execute(id);
    return {
      title: "OS Deleted",
      message: "OS has been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("multiple")
  @ApiOperation({ summary: "Delete multiple OS (soft delete)" })
  @ApiResponse({ status: 200, description: "OS deleted successfully" })
  async deleteMultiple(@Body() body: DeleteMultipleOsRequestDto): Promise<BaseMaper> {
    await this.deleteMultipleOsUseCase.execute(body);
    return {
      title: "OS Deleted",
      message: "OS have been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an OS by ID" })
  @ApiResponse({ status: 200, description: "OS retrieved successfully" })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  async getOne(
    @Param("id", ParseIntPipe) id: number,
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<BaseMaper> {
    const os = await this.getOsUseCase.execute(id, includeDeleted === "true");
    return {
      title: "OS Retrieved",
      message: "OS has been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: OsMapper.toDto(os),
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all OS with pagination" })
  @ApiResponse({ status: 200, description: "OS retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  @ApiQuery({ name: "isPaginate", required: false, type: Boolean, example: true })
  @ApiQuery({ name: "orderBy", required: false, type: String, example: "createdAt", enum: ["name", "code", "createdAt", "updatedAt"] })
  @ApiQuery({ name: "sortOrder", required: false, type: String, example: "desc", enum: ["asc", "desc"] })
  async getAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("includeDeleted") includeDeleted?: string,
    @Query("isPaginate") isPaginate?: string,
    @Query("orderBy") orderBy?: string,
    @Query("sortOrder") sortOrder?: string,
  ): Promise<BaseMaper> {
    const result = await this.getOsesUseCase.execute({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      includeDeleted: includeDeleted === "true",
      isPaginate: isPaginate !== "false",
      orderBy: orderBy,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
    });
    return {
      title: "OS Retrieved",
      message: "OS have been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: {
        items: OsMapper.toDtoList(result.items),
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore a deleted OS" })
  @ApiResponse({ status: 200, description: "OS restored successfully" })
  async restore(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.restoreOsUseCase.execute(id);
    return {
      title: "OS Restored",
      message: "OS has been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Post("restore/multiple")
  @ApiOperation({ summary: "Restore multiple deleted OS" })
  @ApiResponse({ status: 200, description: "OS restored successfully" })
  async restoreMultiple(@Body() body: DeleteMultipleOsRequestDto): Promise<BaseMaper> {
    await this.restoreMultipleOsUseCase.execute(body);
    return {
      title: "OS Restored",
      message: "OS have been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete(":id/permanent")
  @ApiOperation({ summary: "Permanently delete an OS" })
  @ApiResponse({ status: 200, description: "OS permanently deleted" })
  async deletePermanent(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deletePermanentOsUseCase.execute(id);
    return {
      title: "OS Permanently Deleted",
      message: "OS has been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("permanent/multiple")
  @ApiOperation({ summary: "Permanently delete multiple OS" })
  @ApiResponse({ status: 200, description: "OS permanently deleted" })
  async deletePermanentMultiple(@Body() body: DeleteMultipleOsRequestDto): Promise<BaseMaper> {
    await this.deletePermanentMultipleOsUseCase.execute(body);
    return {
      title: "OS Permanently Deleted",
      message: "OS have been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }
}

