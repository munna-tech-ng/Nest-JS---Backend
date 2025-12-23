export class PaginationDto {
  page?: number = 1;
  limit?: number = 20;
  includeDeleted?: boolean = false;
  isPaginate?: boolean = true;
  orderBy?: string = "createdAt";
  sortOrder?: "asc" | "desc" = "desc";
  groupByLocation?: boolean = false;
}

