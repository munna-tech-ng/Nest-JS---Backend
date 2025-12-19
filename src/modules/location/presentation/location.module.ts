import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { LocationController } from "./http/location.controller";
import { SpecialLocationController } from "./http/special-location.controller";
import { CreateLocationUseCase } from "../application/use-cases/create-location.use-case";
import { UpdateLocationUseCase } from "../application/use-cases/update-location.use-case";
import { DeleteLocationUseCase } from "../application/use-cases/delete-location.use-case";
import { DeleteMultipleLocationUseCase } from "../application/use-cases/delete-multiple-location.use-case";
import { GetLocationUseCase } from "../application/use-cases/get-location.use-case";
import { GetLocationsUseCase } from "../application/use-cases/get-locations.use-case";
import { RestoreLocationUseCase } from "../application/use-cases/restore-location.use-case";
import { RestoreMultipleLocationUseCase } from "../application/use-cases/restore-multiple-location.use-case";
import { DeletePermanentLocationUseCase } from "../application/use-cases/delete-permanent-location.use-case";
import { DeletePermanentMultipleLocationUseCase } from "../application/use-cases/delete-permanent-multiple-location.use-case";
import { CreateSpecialLocationUseCase } from "../application/use-cases/create-special-location.use-case";
import { UpdateSpecialLocationUseCase } from "../application/use-cases/update-special-location.use-case";
import { DeleteSpecialLocationUseCase } from "../application/use-cases/delete-special-location.use-case";
import { DeleteMultipleSpecialLocationUseCase } from "../application/use-cases/delete-multiple-special-location.use-case";
import { GetSpecialLocationUseCase } from "../application/use-cases/get-special-location.use-case";
import { GetSpecialLocationsUseCase } from "../application/use-cases/get-special-locations.use-case";
import { RestoreSpecialLocationUseCase } from "../application/use-cases/restore-special-location.use-case";
import { RestoreMultipleSpecialLocationUseCase } from "../application/use-cases/restore-multiple-special-location.use-case";
import { DeletePermanentSpecialLocationUseCase } from "../application/use-cases/delete-permanent-special-location.use-case";
import { DeletePermanentMultipleSpecialLocationUseCase } from "../application/use-cases/delete-permanent-multiple-special-location.use-case";
import { LOCATION_REPO } from "../domain/contracts/location-repository.port";
import { LocationRepository } from "../infrastructure/persistence/location.repository";
import { SPECIAL_LOCATION_REPO } from "../domain/contracts/special-location-repository.port";
import { SpecialLocationRepository } from "../infrastructure/persistence/special-location.repository";

@Module({
  controllers: [LocationController, SpecialLocationController],
  providers: [
    CreateLocationUseCase,
    UpdateLocationUseCase,
    DeleteLocationUseCase,
    DeleteMultipleLocationUseCase,
    GetLocationUseCase,
    GetLocationsUseCase,
    RestoreLocationUseCase,
    RestoreMultipleLocationUseCase,
    DeletePermanentLocationUseCase,
    DeletePermanentMultipleLocationUseCase,
    CreateSpecialLocationUseCase,
    UpdateSpecialLocationUseCase,
    DeleteSpecialLocationUseCase,
    DeleteMultipleSpecialLocationUseCase,
    GetSpecialLocationUseCase,
    GetSpecialLocationsUseCase,
    RestoreSpecialLocationUseCase,
    RestoreMultipleSpecialLocationUseCase,
    DeletePermanentSpecialLocationUseCase,
    DeletePermanentMultipleSpecialLocationUseCase,
    { provide: LOCATION_REPO, useClass: LocationRepository },
    { provide: SPECIAL_LOCATION_REPO, useClass: SpecialLocationRepository },
  ],
  exports: [],
})
export class LocationModule implements OnModuleInit {
  private readonly logger = new Logger(LocationModule.name);

  onModuleInit() {
    this.logger.log("Location module ready to serve");
  }
}

