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
import { CreateServerUseCase } from "../../application/use-cases/create-server.use-case";
import { UpdateServerUseCase } from "../../application/use-cases/update-server.use-case";
import { DeleteServerUseCase } from "../../application/use-cases/delete-server.use-case";
import { DeleteMultipleServerUseCase } from "../../application/use-cases/delete-multiple-server.use-case";
import { GetServerUseCase } from "../../application/use-cases/get-server.use-case";
import { GetServersUseCase } from "../../application/use-cases/get-servers.use-case";
import { RestoreServerUseCase } from "../../application/use-cases/restore-server.use-case";
import { RestoreMultipleServerUseCase } from "../../application/use-cases/restore-multiple-server.use-case";
import { DeletePermanentServerUseCase } from "../../application/use-cases/delete-permanent-server.use-case";
import { DeletePermanentMultipleServerUseCase } from "../../application/use-cases/delete-permanent-multiple-server.use-case";
import { CreateServerRequestDto } from "./http-dto/create-server.request.dto";
import { UpdateServerRequestDto } from "./http-dto/update-server.request.dto";
import { DeleteMultipleServerRequestDto } from "./http-dto/delete-multiple.request.dto";
import { ServerMapper } from "./http-dto/server.mapper";
import { LocationMapper } from "src/modules/location/presentation/http/http-dto/location.mapper";
import { Location } from "src/modules/location/domain/entities/location.entity";
import { Server } from "../../domain/entities/server.entity";
import { ConfigService } from "@nestjs/config";

@ApiTags("Servers")
@Controller("servers")
export class ServerController {
  constructor(
    private readonly createServerUseCase: CreateServerUseCase,
    private readonly updateServerUseCase: UpdateServerUseCase,
    private readonly deleteServerUseCase: DeleteServerUseCase,
    private readonly deleteMultipleServerUseCase: DeleteMultipleServerUseCase,
    private readonly getServerUseCase: GetServerUseCase,
    private readonly getServersUseCase: GetServersUseCase,
    private readonly restoreServerUseCase: RestoreServerUseCase,
    private readonly restoreMultipleServerUseCase: RestoreMultipleServerUseCase,
    private readonly deletePermanentServerUseCase: DeletePermanentServerUseCase,
    private readonly deletePermanentMultipleServerUseCase: DeletePermanentMultipleServerUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new server" })
  @ApiResponse({ status: 201, description: "Server created successfully" })
  async create(@Body() body: CreateServerRequestDto): Promise<BaseMaper> {
    const server = await this.createServerUseCase.execute(body);
    return {
      title: "Server Created",
      message: "Server has been created successfully",
      error: false,
      statusCode: HttpStatus.CREATED,
      data: ServerMapper.toDto(server),
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a server" })
  @ApiResponse({ status: 200, description: "Server updated successfully" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateServerRequestDto,
  ): Promise<BaseMaper> {
    const server = await this.updateServerUseCase.execute(id, body);
    return {
      title: "Server Updated",
      message: "Server has been updated successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: ServerMapper.toDto(server),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a server (soft delete)" })
  @ApiResponse({ status: 200, description: "Server deleted successfully" })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deleteServerUseCase.execute(id);
    return {
      title: "Server Deleted",
      message: "Server has been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("multiple")
  @ApiOperation({ summary: "Delete multiple servers (soft delete)" })
  @ApiResponse({ status: 200, description: "Servers deleted successfully" })
  async deleteMultiple(@Body() body: DeleteMultipleServerRequestDto): Promise<BaseMaper> {
    await this.deleteMultipleServerUseCase.execute(body);
    return {
      title: "Servers Deleted",
      message: "Servers have been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a server by ID" })
  @ApiResponse({ status: 200, description: "Server retrieved successfully" })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  async getOne(
    @Param("id", ParseIntPipe) id: number,
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<BaseMaper> {
    const server = await this.getServerUseCase.execute(id, includeDeleted === "true");
    return {
      title: "Server Retrieved",
      message: "Server has been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: ServerMapper.toDto(server),
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all servers with pagination" })
  @ApiResponse({ status: 200, description: "Servers retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  @ApiQuery({ name: "isPaginate", required: false, type: Boolean, example: true })
  @ApiQuery({ name: "orderBy", required: false, type: String, example: "createdAt", enum: ["name", "ip", "status", "createdAt", "updatedAt"] })
  @ApiQuery({ name: "sortOrder", required: false, type: String, example: "desc", enum: ["asc", "desc"] })
  // is group by location
  @ApiQuery({ name: "groupByLocation", required: false, type: Boolean, example: false })
  async getAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("includeDeleted") includeDeleted?: string,
    @Query("isPaginate") isPaginate?: string,
    @Query("orderBy") orderBy?: string,
    @Query("sortOrder") sortOrder?: string,
    @Query("groupByLocation") groupByLocation?: string,
  ): Promise<BaseMaper> {
    const isGrouped = groupByLocation === "true";
    const result = await this.getServersUseCase.execute({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      includeDeleted: includeDeleted === "true",
      isPaginate: isPaginate !== "false",
      orderBy: orderBy,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
      groupByLocation: isGrouped,
    });

    const filePath = LocationMapper.getFileManagerUrl(this.configService.get("APP_URL"));
    
    // Handle both grouped and non-grouped responses
    const items = isGrouped
      ? (result.items as Array<{ location: Location; servers: Server[] }>).map((group) => ({
          location: LocationMapper.toDto(group.location, filePath),
          servers: ServerMapper.toDtoList(group.servers),
        }))
      : ServerMapper.toDtoList(result.items as Server[]);
    
    return {
      title: "Servers Retrieved",
      message: "Servers have been retrieved successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: {
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore a deleted server" })
  @ApiResponse({ status: 200, description: "Server restored successfully" })
  async restore(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.restoreServerUseCase.execute(id);
    return {
      title: "Server Restored",
      message: "Server has been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Post("restore/multiple")
  @ApiOperation({ summary: "Restore multiple deleted servers" })
  @ApiResponse({ status: 200, description: "Servers restored successfully" })
  async restoreMultiple(@Body() body: DeleteMultipleServerRequestDto): Promise<BaseMaper> {
    await this.restoreMultipleServerUseCase.execute(body);
    return {
      title: "Servers Restored",
      message: "Servers have been restored successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete(":id/permanent")
  @ApiOperation({ summary: "Permanently delete a server" })
  @ApiResponse({ status: 200, description: "Server permanently deleted" })
  async deletePermanent(@Param("id", ParseIntPipe) id: number): Promise<BaseMaper> {
    await this.deletePermanentServerUseCase.execute(id);
    return {
      title: "Server Permanently Deleted",
      message: "Server has been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }

  @Delete("permanent/multiple")
  @ApiOperation({ summary: "Permanently delete multiple servers" })
  @ApiResponse({ status: 200, description: "Servers permanently deleted" })
  async deletePermanentMultiple(@Body() body: DeleteMultipleServerRequestDto): Promise<BaseMaper> {
    await this.deletePermanentMultipleServerUseCase.execute(body);
    return {
      title: "Servers Permanently Deleted",
      message: "Servers have been permanently deleted",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }
}

