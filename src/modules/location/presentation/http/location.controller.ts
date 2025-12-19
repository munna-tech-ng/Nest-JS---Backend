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
import { CreateLocationUseCase } from "../../application/use-cases/create-location.use-case";
import { UpdateLocationUseCase } from "../../application/use-cases/update-location.use-case";
import { DeleteLocationUseCase } from "../../application/use-cases/delete-location.use-case";
import { DeleteMultipleLocationUseCase } from "../../application/use-cases/delete-multiple-location.use-case";
import { GetLocationUseCase } from "../../application/use-cases/get-location.use-case";
import { GetLocationsUseCase } from "../../application/use-cases/get-locations.use-case";
import { RestoreLocationUseCase } from "../../application/use-cases/restore-location.use-case";
import { RestoreMultipleLocationUseCase } from "../../application/use-cases/restore-multiple-location.use-case";
import { DeletePermanentLocationUseCase } from "../../application/use-cases/delete-permanent-location.use-case";
import { DeletePermanentMultipleLocationUseCase } from "../../application/use-cases/delete-permanent-multiple-location.use-case";
import { CreateLocationRequestDto } from "./http-dto/create-location.request.dto";
import { UpdateLocationRequestDto } from "./http-dto/update-location.request.dto";
import { DeleteMultipleLocationRequestDto } from "./http-dto/delete-multiple.request.dto";
import { LocationMapper } from "./http-dto/location.mapper";

@ApiTags("Locations")
@Controller("locations")
export class LocationController {
  constructor(
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly deleteLocationUseCase: DeleteLocationUseCase,
    private readonly deleteMultipleLocationUseCase: DeleteMultipleLocationUseCase,
    private readonly getLocationUseCase: GetLocationUseCase,
    private readonly getLocationsUseCase: GetLocationsUseCase,
    private readonly restoreLocationUseCase: RestoreLocationUseCase,
    private readonly restoreMultipleLocationUseCase: RestoreMultipleLocationUseCase,
    private readonly deletePermanentLocationUseCase: DeletePermanentLocationUseCase,
    private readonly deletePermanentMultipleLocationUseCase: DeletePermanentMultipleLocationUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new location" })
  @ApiResponse({ status: 201, description: "Location created successfully" })
  async create(@Body() body: CreateLocationRequestDto): Promise<BaseMaper> {
    const location = await this.createLocationUseCase.execute(body);
    return {
      title: "Location Created",
      message: "Location has been created successfully",
      error: false,
      statusCode: HttpStatus.CREATED,
      data: LocationMapper.toDto(location),
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a location" })
  @ApiResponse({ status: 200, description: "Location updated successfully" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateLocationRequestDto,
  ): Promise<BaseMaper> {
    const location = await this.updateLocationUseCase.execute(id, body);
    return {
      title: "Location Updated",
      message: "Location has been updated successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: LocationMapper.toDto(location),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a location" })
  @ApiResponse({ status: 200, description: "Location deleted successfully" })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deleteLocationUseCase.execute(id);
    return {
      title: "Location Deleted",
      message: "Location has been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("multiple")
  @ApiOperation({ summary: "Delete multiple locations" })
  @ApiResponse({ status: 200, description: "Locations deleted successfully" })
  async deleteMultiple(@Body() body: DeleteMultipleLocationRequestDto): Promise<BaseMaper> {
    await this.deleteMultipleLocationUseCase.execute(body);
    return {
      title: "Locations Deleted",
      message: "Locations have been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a location by ID" })
  @ApiResponse({ status: 200, description: "Location retrieved successfully" })
  async getOne(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    const location = await this.getLocationUseCase.execute(id);
    return {
      title: "Location Retrieved",
      message: "Location has been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: LocationMapper.toDto(location),
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all locations with pagination" })
  @ApiResponse({ status: 200, description: "Locations retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 2 })
  async getAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<BaseMaper> {
    const result = await this.getLocationsUseCase.execute({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return {
      title: "Locations Retrieved",
      message: "Locations have been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: {
        items: LocationMapper.toDtoList(result.items),
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore a deleted location" })
  @ApiResponse({ status: 200, description: "Location restored successfully" })
  async restore(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.restoreLocationUseCase.execute(id);
    return {
      title: "Location Restored",
      message: "Location has been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Post("restore/multiple")
  @ApiOperation({ summary: "Restore multiple deleted locations" })
  @ApiResponse({ status: 200, description: "Locations restored successfully" })
  async restoreMultiple(@Body() body: DeleteMultipleLocationRequestDto): Promise<BaseMaper> {
    await this.restoreMultipleLocationUseCase.execute(body);
    return {
      title: "Locations Restored",
      message: "Locations have been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete(":id/permanent")
  @ApiOperation({ summary: "Permanently delete a location" })
  @ApiResponse({ status: 200, description: "Location permanently deleted" })
  async deletePermanent(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deletePermanentLocationUseCase.execute(id);
    return {
      title: "Location Permanently Deleted",
      message: "Location has been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("permanent/multiple")
  @ApiOperation({ summary: "Permanently delete multiple locations" })
  @ApiResponse({ status: 200, description: "Locations permanently deleted" })
  async deletePermanentMultiple(@Body() body: DeleteMultipleLocationRequestDto): Promise<BaseMaper> {
    await this.deletePermanentMultipleLocationUseCase.execute(body);
    return {
      title: "Locations Permanently Deleted",
      message: "Locations have been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }
}

