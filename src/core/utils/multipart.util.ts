import { FastifyRequest } from "fastify";

/**
 * Check if the request is multipart/form-data
 * @param request Fastify request object
 * @returns true if the request is multipart, false otherwise
 */
export function isMultipartRequest(request: FastifyRequest): boolean {
  const contentType = request.headers['content-type'] || '';
  const fastifyRequest = request as any;
  
  // Check both content-type header and Fastify's internal flag
  return (
    contentType.includes('multipart/form-data') ||
    fastifyRequest.isMultipart === true
  );
}

/**
 * Get the content type from the request
 * @param request Fastify request object
 * @returns The content type or undefined
 */
export function getContentType(request: FastifyRequest): string | undefined {
  return request.headers['content-type'];
}

/**
 * Check if the request is JSON (application/json)
 * @param request Fastify request object
 * @returns true if the request is JSON, false otherwise
 */
export function isJsonRequest(request: FastifyRequest): boolean {
  const contentType = getContentType(request);
  return contentType?.includes('application/json') ?? false;
}

/**
 * Safely extracts a string value from an unknown input.
 * Handles cases where the input might be a Fastify multipart field object ({ value: 'string' }),
 * a direct string, or undefined/null.
 * 
 * @param value The input value
 * @returns The string value, or undefined if not a valid string
 */
export function getStringValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'object' && 'value' in value && typeof (value as any).value === 'string') {
    return (value as any).value;
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

// get value with generic type
export function getGenericValue<T>(value: unknown): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'object' && 'value' in value) {
    return (value as any).value as T;
  }
  return value as T;
}

/**
 * Extract text form fields from multipart request body, excluding file fields.
 * This function safely extracts only string values from multipart form-data,
 * skipping file fields and other non-string values.
 * 
 * @param body The request body from Fastify multipart request
 * @returns An object containing only string form field values
 */
export function extractMultipartFormFields(body: any): Record<string, string> {
  const formFields: Record<string, string> = {};
  
  if (!body || typeof body !== 'object') {
    return formFields;
  }

  for (const [key, value] of Object.entries(body)) {
    // Skip file fields - they will be handled separately
    if (value && typeof value === 'object') {
      // Check if it's a file field (has 'file' property) or a text field (has 'value' property)
      if ('file' in value) {
        // This is a file field, skip it - don't include in formFields
        continue;
      } else if ('value' in value) {
        // This is a text field - only use if value is a string
        const fieldValue = (value as any).value;
        if (typeof fieldValue === 'string') {
          formFields[key] = fieldValue;
        }
      } else if (typeof value === 'string') {
        // Direct string value
        formFields[key] = value;
      }
      // Skip any other object types (could be file objects)
    } else if (typeof value === 'string') {
      // Direct string value
      formFields[key] = value;
    }
    // Skip Buffer, file objects, etc.
  }

  return formFields;
}

