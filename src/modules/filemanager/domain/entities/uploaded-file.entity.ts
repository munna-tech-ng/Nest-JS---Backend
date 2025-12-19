export class UploadedFile {
  constructor(
    public readonly filename: string,
    public readonly path: string,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly uploadedAt: Date,
  ) {}
}

