import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { BaseMaper } from "src/core/dto/base.maper.dto";
import { Inject } from "@nestjs/common";
import { FILE_UPLOAD_SERVICE } from "../../../filemanager/domain/contracts/file-upload-service.port";
import { FileUploadServicePort } from "../../../filemanager/domain/contracts/file-upload-service.port";
import { FastifyRequest } from "fastify";
import { isMultipartRequest, getStringValue, extractMultipartFormFields } from "src/core/utils/multipart.util";
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
import { UpdateFlagRequestDto } from "./http-dto/update-flag.request.dto";
import { LocationMapper } from "./http-dto/location.mapper";

@ApiTags("Locations")
@Controller("locations")
export class LocationController {
  private readonly logger = new Logger(LocationController.name);

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
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: FileUploadServicePort,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: "Create a new location",
    description: "Accepts either:\n1. multipart/form-data: Create location with optional flag image file upload\n2. application/json: Create location with flag path/emoji string"
  })
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiBody({
    description: "Location data. For multipart: can include flag file. For JSON: flag as string path/emoji.",
    type: CreateLocationRequestDto,
    required: false,
  })
  @ApiResponse({ status: 201, description: "Location created successfully" })
  @ApiQuery({ name: "queue", required: false, type: Boolean, description: "Queue the flag upload for background processing (multipart only)" })
  async create(
    @Body() body: CreateLocationRequestDto,
    @Req() req?: FastifyRequest,
    @Query("queue") queue?: string,
  ): Promise<BaseMaper> {
    
    // Initialize flagPath - only use string values, never file objects
    let flagPath: string | undefined = typeof body.flag === 'string' ? body.flag : undefined;
    let requestBody: CreateLocationRequestDto = body;

    // Handle multipart request with file upload
    if (req && isMultipartRequest(req)) {
      const fastifyRequest = req as any;
      
      // Extract text form fields from multipart body (exclude file fields)
      const multipartBody = extractMultipartFormFields(fastifyRequest.body);

      // IMPORTANT: Try file() FIRST - this is the proper Fastify way to get files
      // The body attachment is mainly for text fields, not files
      let flagFile: any = null;
      try {
        // Try to get file with specific field name 'flag' first
        flagFile = await fastifyRequest.file({ 
          limits: { fileSize: 10 * 1024 * 1024 },
          fieldName: 'flag', // Specify the field name
        });
        if (flagFile) {
          this.logger.debug(`Flag file from file() with fieldName 'flag': found - ${flagFile.filename}`);
        } else {
          this.logger.debug(`Flag file from file() with fieldName 'flag': not found`);
        }
      } catch (fileError: any) {
        this.logger.debug(`Error getting file with fieldName 'flag': ${fileError?.message || 'unknown error'}`);
        try {
          // Fallback: try without field name (gets first file)
          flagFile = await fastifyRequest.file({ 
            limits: { fileSize: 10 * 1024 * 1024 },
          });
          if (flagFile) {
            this.logger.debug(`Flag file from file() without fieldName: found - ${flagFile.filename}`);
          } else {
            this.logger.debug(`Flag file from file() without fieldName: not found`);
          }
        } catch (fallbackError: any) {
          this.logger.debug(`Error getting file without fieldName: ${fallbackError?.message || 'unknown error'}`);
        }
      }

      // Check if flag file is in the body (when attachFieldsToBody is enabled) - only if file() didn't work
      const flagFileInBody = !flagFile ? fastifyRequest.body?.flag : null;
      
      // Only check body as a fallback if file() didn't work
      if (!flagFile && flagFileInBody) {
        this.logger.debug(`Flag in body (fallback): ${flagFileInBody ? (typeof flagFileInBody === 'object' ? 'object' : typeof flagFileInBody) : 'not found'}`);
        
        // Log the structure of flagFileInBody for debugging
        if (flagFileInBody && typeof flagFileInBody === 'object') {
          const keys = Object.keys(flagFileInBody);
          this.logger.debug(`Flag object keys: ${keys.join(', ')}`);
          this.logger.debug(`Flag object has 'file': ${'file' in flagFileInBody}`);
          this.logger.debug(`Flag object has 'filename': ${'filename' in flagFileInBody}`);
          this.logger.debug(`Flag object has 'value': ${'value' in flagFileInBody}`);
          this.logger.debug(`Flag object has 'encoding': ${'encoding' in flagFileInBody}`);
          this.logger.debug(`Flag object has 'mimetype': ${'mimetype' in flagFileInBody}`);
          this.logger.debug(`Flag object has 'fieldname': ${'fieldname' in flagFileInBody}`);
          
          // Log a safe representation (avoid logging the actual file stream)
          const safeFlag: any = {};
          for (const key of keys) {
            if (key === 'file') {
              const fileValue = flagFileInBody[key];
              safeFlag[key] = fileValue ? 
                (Buffer.isBuffer(fileValue) ? `[Buffer: ${fileValue.length} bytes]` : '[Stream]') : 
                'null';
            } else {
              safeFlag[key] = flagFileInBody[key];
            }
          }
          this.logger.debug(`Flag object structure: ${JSON.stringify(safeFlag, null, 2)}`);
        }

        // If file is in body (attachFieldsToBody mode), extract it
        // Fastify multipart with attachFieldsToBody: 'keyValues' stores files differently
        this.logger.debug('Attempting to extract flag file from body...');
        
        // Check different possible structures
        if (typeof flagFileInBody === 'object') {
          const bodyFile = flagFileInBody;
          
          // Structure 1: Direct file object with 'file' property (most common)
          if ('file' in bodyFile && bodyFile.file) {
            this.logger.debug('Found file in body with direct file property');
            flagFile = {
              file: bodyFile.file,
              filename: bodyFile.filename || bodyFile.originalname || 'flag.jpg',
              mimetype: bodyFile.mimetype || bodyFile.mimeType || 'application/octet-stream',
              encoding: bodyFile.encoding,
              fieldname: bodyFile.fieldname || bodyFile.fieldName || 'flag',
            };
            this.logger.debug(`Flag file extracted from body (direct): ${flagFile.filename}`);
          }
          // Structure 2: File might have 'value' property (keyValues mode)
          else if ('value' in bodyFile) {
            this.logger.debug('Found file in body with value property (keyValues mode)');
            const value = bodyFile.value;
            // The value might be the file object itself
            if (value && typeof value === 'object') {
              if ('file' in value && value.file) {
                flagFile = {
                  file: value.file,
                  filename: value.filename || value.originalname || 'flag.jpg',
                  mimetype: value.mimetype || value.mimeType || 'application/octet-stream',
                  encoding: value.encoding,
                  fieldname: value.fieldname || value.fieldName || 'flag',
                };
                this.logger.debug(`Flag file extracted from body (value.file): ${flagFile.filename}`);
              } else if ('filename' in value || 'originalname' in value) {
                // Value itself might be the file object
                flagFile = {
                  file: value.file || value.buffer || value,
                  filename: value.filename || value.originalname || 'flag.jpg',
                  mimetype: value.mimetype || value.mimeType || 'application/octet-stream',
                  encoding: value.encoding,
                  fieldname: value.fieldname || value.fieldName || 'flag',
                };
                this.logger.debug(`Flag file extracted from body (value as file): ${flagFile.filename}`);
              }
            }
          }
          // Structure 3: File might be the object itself with filename property
          else if ('filename' in bodyFile || 'originalname' in bodyFile) {
            this.logger.debug('Found file in body with filename property');
            // The file stream might be in a 'file' property or the object itself might be the file data
            if (bodyFile.file) {
              flagFile = {
                file: bodyFile.file,
                filename: bodyFile.filename || bodyFile.originalname || 'flag.jpg',
                mimetype: bodyFile.mimetype || bodyFile.mimeType || 'application/octet-stream',
                encoding: bodyFile.encoding,
                fieldname: bodyFile.fieldname || bodyFile.fieldName || 'flag',
              };
            } else if (bodyFile.buffer || Buffer.isBuffer(bodyFile)) {
              // File might be a buffer
              flagFile = {
                file: bodyFile.buffer || bodyFile,
                filename: bodyFile.filename || bodyFile.originalname || 'flag.jpg',
                mimetype: bodyFile.mimetype || bodyFile.mimeType || 'application/octet-stream',
                encoding: bodyFile.encoding,
                fieldname: bodyFile.fieldname || bodyFile.fieldName || 'flag',
              };
            }
            if (flagFile) {
              this.logger.debug(`Flag file extracted from body (filename): ${flagFile.filename}`);
            }
          }
          // Structure 4: Try to use the object directly if it has common file properties
          else {
            this.logger.debug('Trying to use flag object directly as file...');
            // Check if it looks like a file object (has encoding, mimetype, etc.)
            if (('encoding' in bodyFile || 'mimetype' in bodyFile || 'fieldname' in bodyFile) && 
                (bodyFile.file || bodyFile.buffer || Buffer.isBuffer(bodyFile))) {
              flagFile = {
                file: bodyFile.file || bodyFile.buffer || bodyFile,
                filename: bodyFile.filename || bodyFile.originalname || 'flag.jpg',
                mimetype: bodyFile.mimetype || bodyFile.mimeType || 'application/octet-stream',
                encoding: bodyFile.encoding,
                fieldname: bodyFile.fieldname || bodyFile.fieldName || 'flag',
              };
              this.logger.debug(`Flag file extracted from body (direct object): ${flagFile.filename}`);
            }
          }
        }
        
        if (!flagFile) {
          this.logger.warn(`Could not extract file from body. Available keys: ${flagFileInBody && typeof flagFileInBody === 'object' ? Object.keys(flagFileInBody).join(', ') : 'N/A'}`);
          this.logger.warn(`Please check the Fastify multipart configuration and file structure.`);
        }
      }
        
      if (flagFile) {
        this.logger.debug(`Flag file detected: filename=${flagFile.filename}, mimetype=${flagFile.mimetype}`);
        this.logger.debug(`Flag file data type: ${flagFile.file ? (Buffer.isBuffer(flagFile.file) ? 'Buffer' : typeof flagFile.file) : 'null'}`);
        
        // Validate file data exists
        if (!flagFile.file) {
          this.logger.error(`Flag file detected but file data is missing. Filename: ${flagFile.filename}`);
        } else {
          try {
            // Upload flag file - service handles stream to buffer conversion
            this.logger.debug('Starting file upload...');
            const uploadResult = await this.fileUploadService.uploadFile(
              {
                filename: flagFile.filename,
                data: flagFile.file, // Pass stream directly, service will handle conversion
                mimetype: flagFile.mimetype,
                size: 0, // Size will be calculated by service if needed
                originalName: flagFile.filename,
              },
              {
                queue: queue === "true",
                folder: "flags",
                subfolder: "",
              }
            );

            // Always use the uploaded path (string) - this takes precedence over any body.flag
            flagPath = uploadResult.path;
            this.logger.log(`Flag uploaded successfully: ${flagPath} (queued: ${uploadResult.queued || false})`);
          } catch (uploadError: any) {
            this.logger.error(`Failed to upload flag file: ${uploadError?.message || 'unknown error'}`, uploadError?.stack);
            // Don't throw - allow location creation without flag, but log the error
            flagPath = undefined;
          }
        }
      } else {
        this.logger.debug('No flag file found, checking for flag string in form fields');
        // No file uploaded, use flag string from form fields if provided
        // Only use string values, never file objects or Buffers
        flagPath = (typeof multipartBody.flag === 'string' ? multipartBody.flag : undefined) 
                || (typeof body.flag === 'string' ? body.flag : undefined);
        if (flagPath) {
          this.logger.debug(`Flag string found: ${flagPath}`);
        }
      }

      // Merge multipart text fields with body, ensuring flag is a string path
      // Explicitly construct requestBody to avoid any Buffer/file objects
      // Support both 'lon' and 'lng' for longitude
      const multipartLon = getStringValue(multipartBody.lon) || getStringValue(multipartBody.lng);
      const bodyLon = getStringValue((body as any).lon) || getStringValue(body.lng);
      
      requestBody = {
        name: getStringValue(multipartBody.name) || getStringValue(body.name) || '',
        code: getStringValue(multipartBody.code) || getStringValue(body.code) || '',
        lat: getStringValue(multipartBody.lat) || getStringValue(body.lat),
        lng: multipartLon || bodyLon,
        flag: flagPath, // flagPath is already validated as string or undefined
      };
    } else {
      // JSON request - use flag from body as-is, but ensure it's a string
      // Support both 'lon' and 'lng' for longitude
      const jsonLon = getStringValue((body as any).lon) || getStringValue(body.lng);
      
      requestBody = {
        name: getStringValue(body.name) || '',
        code: getStringValue(body.code) || '',
        lat: getStringValue(body.lat),
        lng: jsonLon,
        flag: getStringValue(body.flag), // Only use if it's a string
      };
    }

    // Final validation: ensure all required fields are strings
    if (!requestBody.name || !requestBody.code) {
      return {
        title: "Validation Failed",
        message: "Name and code are required and must be strings",
        error: true,
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
      };
    }

    const location = await this.createLocationUseCase.execute(requestBody);
    return {
      title: "Location Created",
      message: "Location has been created successfully",
      error: false,
      statusCode: HttpStatus.CREATED,
      data: LocationMapper.toDto(location),
    };
  }

  @Post(":id/flag")
  @ApiOperation({ 
    summary: "Upload or set flag for a location",
    description: "Accepts either:\n1. multipart/form-data: Upload a flag image file\n2. application/json: Set flag path/URL directly\n\nExample JSON: { \"flag\": \"uploads/flags/abc123.jpg\" }"
  })
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiBody({
    description: "For multipart: Flag image file. For JSON: { \"flag\": \"path/to/flag.jpg\" }",
    schema: {
      oneOf: [
        {
          type: "object",
          properties: {
            flag: {
              type: "string",
              format: "binary",
              description: "Flag image file",
            },
          },
        },
        {
          type: "object",
          properties: {
            flag: {
              type: "string",
              example: "uploads/flags/abc123.jpg",
              description: "Flag path or URL",
            },
          },
        },
      ],
    },
    required: false,
  })
  @ApiResponse({ status: 200, description: "Flag uploaded/set successfully" })
  @ApiQuery({ name: "queue", required: false, type: Boolean, description: "Queue the upload for background processing (multipart only)" })
  async uploadFlag(
    @Param("id", ParseIntPipe) id: number,
    @Query("queue") queue?: string,
    @Body() body?: UpdateFlagRequestDto,
    @Req() req?: FastifyRequest,
  ): Promise<BaseMaper> {
    if (!req) {
      return {
        title: "Upload Failed",
        message: "Invalid request",
        error: true,
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
      };
    }

    const isMultipart = isMultipartRequest(req);
    const fastifyRequest = req as any;
    
    // Handle JSON request (application/json)
    if (!isMultipart) {
      if (body?.flag) {
        // Update location with provided flag path/URL
        const location = await this.updateLocationUseCase.execute(id, {
          flag: body.flag,
        });

        return {
          title: "Flag Updated",
          message: "Flag has been updated successfully",
          error: false,
          statusCode: HttpStatus.OK,
          data: {
            location: LocationMapper.toDto(location),
            flag: {
              path: body.flag,
            },
          },
        };
      } else {
        // JSON request but no flag provided
        return {
          title: "Upload Failed",
          message: "Request must be multipart/form-data for file upload or application/json with flag path in body",
          error: true,
          statusCode: HttpStatus.BAD_REQUEST,
          data: null,
        };
      }
    }

    // Handle multipart/form-data (file upload)
    // Only call file() if we're sure it's multipart
    let data;
    try {
      data = await fastifyRequest.file();
    } catch {
      return {
        title: "Upload Failed",
        message: "Failed to process multipart request. Please ensure the request is multipart/form-data.",
        error: true,
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
      };
    }
    
    if (!data) {
      return {
        title: "Upload Failed",
        message: "No file provided",
        error: true,
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
      };
    }

    // Upload flag image - service handles stream to buffer conversion
    const uploadResult = await this.fileUploadService.uploadFile(
      {
        filename: data.filename,
        data: data.file, // Pass stream directly, service will handle conversion
        mimetype: data.mimetype,
        size: 0, // Size will be calculated by service if needed
        originalName: data.filename,
      },
      {
        queue: queue === "true",
        folder: "flags",
        subfolder: "",
      }
    );

    // Update location with flag path
    const location = await this.updateLocationUseCase.execute(id, {
      flag: uploadResult.path,
    });

    return {
      title: uploadResult.queued ? "Flag Queued" : "Flag Uploaded",
      message: uploadResult.queued 
        ? "Flag has been queued for upload" 
        : "Flag has been uploaded and location updated successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: {
        location: LocationMapper.toDto(location),
        flag: {
          filename: uploadResult.filename,
          path: uploadResult.path,
          queued: uploadResult.queued,
        },
      },
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
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "isPaginate", required: false, type: Boolean, example: true })
  @ApiQuery({ name: "orderBy", required: false, type: String, example: "createdAt", enum: ["name", "code", "createdAt", "updatedAt"] })
  @ApiQuery({ name: "sortOrder", required: false, type: String, example: "desc", enum: ["asc", "desc"] })
  async getAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("isPaginate") isPaginate?: string,
    @Query("orderBy") orderBy?: string,
    @Query("sortOrder") sortOrder?: string,
  ): Promise<BaseMaper> {
    const result = await this.getLocationsUseCase.execute({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      isPaginate: isPaginate !== "false",
      orderBy: orderBy,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
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

