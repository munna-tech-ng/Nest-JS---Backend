import {
  Controller,
  Delete,
  HttpStatus,
  Post,
  Query,
  Req,
  Body,
} from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBody } from "@nestjs/swagger";
import { BaseMaper } from "src/core/dto/base.maper.dto";
import { UploadFileUseCase } from "../../application/use-cases/upload-file.use-case";
import { DeleteFileUseCase } from "../../application/use-cases/delete-file.use-case";
import { FastifyRequest } from "fastify";
import { getGenericValue, isMultipartRequest } from "src/core/utils/multipart.util";
import { UploadFileResponseDto } from "./http-dto/upload-file.response.dto";
import { UploadFileRequestDto } from "./http-dto/upload-file.request.dto";

@ApiTags("File Manager")
@Controller("files")
export class FileManagerController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
  ) {}

  @Post("upload")
  @ApiOperation({ summary: "Upload a file" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "File to upload",
    type: UploadFileRequestDto,
  })
  @ApiResponse({ status: 201, description: "File uploaded successfully", type: UploadFileResponseDto })
  async uploadFile(
    @Body() body?: UploadFileRequestDto,
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

    if (!isMultipartRequest(req)) {
      return {
        title: "Upload Failed",
        message: "Request must be multipart/form-data",
        error: true,
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
      };
    }

    if (!body?.file) {
      return {
        title: "Upload Failed",
        message: "No file provided",
        error: true,
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
      };
    }

    const fileBuffer = await body?.file.toBuffer();
    // cover to mb
    const fileSize = Number((fileBuffer.length / 1024 / 1024).toFixed(2));

    const fileData = {
      filename: body?.file.filename,
      data: fileBuffer,
      mimetype: body?.file.mimetype,
      size: fileSize,
      originalName: body?.file.filename,
    };

    const storageData = {
      queue: getGenericValue<boolean>(body?.queue) ?? false,
      folder: getGenericValue<string>(body?.folder) ?? "",
      subfolder: getGenericValue<string>(body?.subfolder) ?? "",
    };

    // Upload file - service handles stream to buffer conversion
    const result = await this.uploadFileUseCase.execute(
      fileData,
      storageData
    );

    return {
      title: result.queued ? "File Queued" : "File Uploaded",
      message: result.queued 
        ? "File has been queued for upload" 
        : "File has been uploaded successfully",
      error: false,
      statusCode: HttpStatus.CREATED,
      data: result,
    };
  }

  @Delete()
  @ApiOperation({ summary: "Delete a file" })
  @ApiResponse({ status: 200, description: "File deleted successfully" })
  @ApiQuery({ name: "path", required: true, type: String, description: "File path to delete" })
  async deleteFile(@Query("path") path: string): Promise<BaseMaper> {
    await this.deleteFileUseCase.execute(path);
    return {
      title: "File Deleted",
      message: "File has been deleted successfully",
      error: false,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }
}

