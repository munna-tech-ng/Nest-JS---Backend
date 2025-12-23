import { Inject, Injectable } from "@nestjs/common";
import { LocationRepositoryPort, LOCATION_REPO } from "../../domain/contracts/location-repository.port";
import { CreateLocationDto } from "../dto/create-location.dto";
import { Location } from "../../domain/entities/location.entity";
import { LocationAlreadyExistsException } from "../../domain/exceptions";
import { FILE_UPLOAD_SERVICE, FileUploadServicePort } from "src/modules/filemanager/domain/contracts/file-upload-service.port";

@Injectable()
export class CreateLocationUseCase {
  constructor(
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: FileUploadServicePort,
  ) {}

  async execute(input: CreateLocationDto): Promise<Location> {
    // Validate required fields
    const existing = await this.locationRepository.findByCode(input.code.toLowerCase());
    console.log(existing);
    if (existing) {
      throw new LocationAlreadyExistsException("code", input.code);
    }

    const flagData = await input.flag.toBuffer();
    const fileBuffer = await this.fileUploadService.uploadFile({
      filename: input.flag.filename,
      data: flagData,
      mimetype: input.flag.mimetype,
      size: flagData.length,
      originalName: input.flag.filename,
    }, {
      queue: false,
      folder: "flags",
      subfolder: "",
    });

    return await this.locationRepository.create({
      name: input.name,
      code: input.code.toLowerCase(),
      lat: input.lat,
      lng: input.lng,
      flag: fileBuffer.path,
    });
  }
}

