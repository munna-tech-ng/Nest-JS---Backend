export const multipartConfig = {
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
    // Throw error on unknown content type
    throwFileSizeLimit: true,
    attachFieldsToBody: true,
}
