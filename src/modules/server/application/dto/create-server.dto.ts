export class CreateServerDto {
  name: string;
  ip: string;
  port?: number;
  status?: string;
  isPremium?: boolean;
  isActive?: boolean;
  ccu?: number;
  maxCcu?: number;
  bandwidth?: number;
  speed?: number;
  priority?: number;
  flag?: string;
  locationId?: number;
  description?: string;
  categoryIds?: number[];
  tagIds?: number[];
}

