import {
  Controller,
  Delete,
  HttpStatus,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBody } from "@nestjs/swagger";
import { BaseMaper } from "src/core/dto/base.maper.dto";
import { UploadFileUseCase } from "../../application/use-cases/upload-file.use-case";
import { DeleteFileUseCase } from "../../application/use-cases/delete-file.use-case";
import { FastifyRequest } from "fastify";
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
  @ApiQuery({ name: "queue", required: false, type: Boolean, description: "Queue the upload for background processing" })
  @ApiQuery({ name: "folder", required: false, type: String, description: "Folder name (e.g., 'flags', 'images')" })
  @ApiQuery({ name: "subfolder", required: false, type: String, description: "Subfolder name" })
  async uploadFile(
    @Query("queue") queue?: string,
    @Query("folder") folder?: string,
    @Query("subfolder") subfolder?: string,
    @Req() req?: FastifyRequest,
  ): Promise<BaseMaper> {
    const fastifyRequest = req as any;
    
    if (!fastifyRequest.isMultipart) {
      return {
        title: "Upload Failed",
        message: "Request must be multipart/form-data",
        error: true,
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
      };
    }

    const data = await fastifyRequest.file();
    
    if (!data) {
      return {
        title: "Upload Failed",
        message: "No file provided",
        error: true,
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
      };
    }

    // Handle Fastify stream upload for queued uploads
    let fileData: Buffer | NodeJS.ReadableStream;
    let fileSize = 0;
    
    if (queue === "true") {
      // Use stream for queued uploads
      fileData = data.file;
      // For queued uploads, we'll need to read the stream to get size
      // But we'll pass 0 and let the processor handle it
      fileSize = 0;
    } else {
      // Convert stream to buffer for immediate upload
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      fileData = Buffer.concat(chunks);
      fileSize = fileData.length;
    }

    const result = await this.uploadFileUseCase.execute(
      {
        filename: data.filename,
        data: fileData,
        mimetype: data.mimetype,
        size: fileSize,
        originalName: data.filename,
      },
      {
        queue: queue === "true",
        folder: folder,
        subfolder: subfolder,
      }
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

