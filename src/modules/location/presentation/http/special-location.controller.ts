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
import { CreateSpecialLocationUseCase } from "../../application/use-cases/create-special-location.use-case";
import { UpdateSpecialLocationUseCase } from "../../application/use-cases/update-special-location.use-case";
import { DeleteSpecialLocationUseCase } from "../../application/use-cases/delete-special-location.use-case";
import { DeleteMultipleSpecialLocationUseCase } from "../../application/use-cases/delete-multiple-special-location.use-case";
import { GetSpecialLocationUseCase } from "../../application/use-cases/get-special-location.use-case";
import { GetSpecialLocationsUseCase } from "../../application/use-cases/get-special-locations.use-case";
import { RestoreSpecialLocationUseCase } from "../../application/use-cases/restore-special-location.use-case";
import { RestoreMultipleSpecialLocationUseCase } from "../../application/use-cases/restore-multiple-special-location.use-case";
import { DeletePermanentSpecialLocationUseCase } from "../../application/use-cases/delete-permanent-special-location.use-case";
import { DeletePermanentMultipleSpecialLocationUseCase } from "../../application/use-cases/delete-permanent-multiple-special-location.use-case";
import { CreateSpecialLocationRequestDto } from "./http-dto/create-special-location.request.dto";
import { UpdateSpecialLocationRequestDto } from "./http-dto/update-special-location.request.dto";
import { DeleteMultipleSpecialLocationRequestDto } from "./http-dto/delete-multiple.request.dto";
import { SpecialLocationMapper } from "./http-dto/special-location.mapper";

@ApiTags("Special Locations")
@Controller("special-locations")
export class SpecialLocationController {
  constructor(
    private readonly createSpecialLocationUseCase: CreateSpecialLocationUseCase,
    private readonly updateSpecialLocationUseCase: UpdateSpecialLocationUseCase,
    private readonly deleteSpecialLocationUseCase: DeleteSpecialLocationUseCase,
    private readonly deleteMultipleSpecialLocationUseCase: DeleteMultipleSpecialLocationUseCase,
    private readonly getSpecialLocationUseCase: GetSpecialLocationUseCase,
    private readonly getSpecialLocationsUseCase: GetSpecialLocationsUseCase,
    private readonly restoreSpecialLocationUseCase: RestoreSpecialLocationUseCase,
    private readonly restoreMultipleSpecialLocationUseCase: RestoreMultipleSpecialLocationUseCase,
    private readonly deletePermanentSpecialLocationUseCase: DeletePermanentSpecialLocationUseCase,
    private readonly deletePermanentMultipleSpecialLocationUseCase: DeletePermanentMultipleSpecialLocationUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new special location" })
  @ApiResponse({ status: 201, description: "Special location created successfully" })
  async create(@Body() body: CreateSpecialLocationRequestDto): Promise<BaseMaper> {
    const specialLocation = await this.createSpecialLocationUseCase.execute(body);
    return {
      title: "Special Location Created",
      message: "Special location has been created successfully",
      error: false,
      statusCode: HttpStatus.CREATED,
      data: SpecialLocationMapper.toDto(specialLocation),
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a special location" })
  @ApiResponse({ status: 200, description: "Special location updated successfully" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateSpecialLocationRequestDto,
  ): Promise<BaseMaper> {
    const specialLocation = await this.updateSpecialLocationUseCase.execute(id, body);
    return {
      title: "Special Location Updated",
      message: "Special location has been updated successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: SpecialLocationMapper.toDto(specialLocation),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a special location" })
  @ApiResponse({ status: 200, description: "Special location deleted successfully" })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deleteSpecialLocationUseCase.execute(id);
    return {
      title: "Special Location Deleted",
      message: "Special location has been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("multiple")
  @ApiOperation({ summary: "Delete multiple special locations" })
  @ApiResponse({ status: 200, description: "Special locations deleted successfully" })
  async deleteMultiple(@Body() body: DeleteMultipleSpecialLocationRequestDto): Promise<BaseMaper> {
    await this.deleteMultipleSpecialLocationUseCase.execute(body);
    return {
      title: "Special Locations Deleted",
      message: "Special locations have been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a special location by ID" })
  @ApiResponse({ status: 200, description: "Special location retrieved successfully" })
  async getOne(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    const specialLocation = await this.getSpecialLocationUseCase.execute(id);
    return {
      title: "Special Location Retrieved",
      message: "Special location has been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: SpecialLocationMapper.toDto(specialLocation),
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all special locations with pagination" })
  @ApiResponse({ status: 200, description: "Special locations retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "locationId", required: false, type: Number })
  @ApiQuery({ name: "isPaginate", required: false, type: Boolean, example: true })
  @ApiQuery({ name: "orderBy", required: false, type: String, example: "createdAt", enum: ["type", "createdAt", "updatedAt"] })
  @ApiQuery({ name: "sortOrder", required: false, type: String, example: "desc", enum: ["asc", "desc"] })
  async getAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("locationId") locationId?: string,
    @Query("isPaginate") isPaginate?: string,
    @Query("orderBy") orderBy?: string,
    @Query("sortOrder") sortOrder?: string,
  ): Promise<BaseMaper> {
    const result = await this.getSpecialLocationsUseCase.execute({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      locationId: locationId ? parseInt(locationId) : undefined,
      isPaginate: isPaginate !== "false",
      orderBy: orderBy,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
    });
    return {
      title: "Special Locations Retrieved",
      message: "Special locations have been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: {
        items: SpecialLocationMapper.toDtoList(result.items),
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore a deleted special location" })
  @ApiResponse({ status: 200, description: "Special location restored successfully" })
  async restore(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.restoreSpecialLocationUseCase.execute(id);
    return {
      title: "Special Location Restored",
      message: "Special location has been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Post("restore/multiple")
  @ApiOperation({ summary: "Restore multiple deleted special locations" })
  @ApiResponse({ status: 200, description: "Special locations restored successfully" })
  async restoreMultiple(@Body() body: DeleteMultipleSpecialLocationRequestDto): Promise<BaseMaper> {
    await this.restoreMultipleSpecialLocationUseCase.execute(body);
    return {
      title: "Special Locations Restored",
      message: "Special locations have been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete(":id/permanent")
  @ApiOperation({ summary: "Permanently delete a special location" })
  @ApiResponse({ status: 200, description: "Special location permanently deleted" })
  async deletePermanent(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deletePermanentSpecialLocationUseCase.execute(id);
    return {
      title: "Special Location Permanently Deleted",
      message: "Special location has been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("permanent/multiple")
  @ApiOperation({ summary: "Permanently delete multiple special locations" })
  @ApiResponse({ status: 200, description: "Special locations permanently deleted" })
  async deletePermanentMultiple(@Body() body: DeleteMultipleSpecialLocationRequestDto): Promise<BaseMaper> {
    await this.deletePermanentMultipleSpecialLocationUseCase.execute(body);
    return {
      title: "Special Locations Permanently Deleted",
      message: "Special locations have been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }
}

