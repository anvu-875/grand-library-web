// 1. Define Error Codes
export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND', // Resource not found
  UNAUTHORIZED = 'UNAUTHORIZED', // Authentication required
  FORBIDDEN = 'FORBIDDEN', // Insufficient permissions
  BAD_REQUEST = 'BAD_REQUEST', // Malformed request syntax
  INVALID_DATA = 'INVALID_DATA', // Data validation failed
  WRONG_DATA = 'WRONG_DATA', // Incorrect data provided
  CONFLICT_DATA = 'CONFLICT_DATA', // Data conflict occurred
  DUPLICATE_DATA = 'DUPLICATE_DATA', // Duplicate entry detected
  EXISTING_DATA = 'EXISTING_DATA', // Data already exists
  MISSING_DATA = 'MISSING_DATA', // Required data missing
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY', // Semantic errors in request
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // Generic server error
}

// 2. Define HTTP Status Codes
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// 3. Map Error Codes to HTTP Status Codes
export const errorCodeToStatus: Record<ErrorCode, HttpStatusCode> = {
  [ErrorCode.NOT_FOUND]: HttpStatusCode.NOT_FOUND,
  [ErrorCode.UNAUTHORIZED]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.FORBIDDEN]: HttpStatusCode.FORBIDDEN,
  [ErrorCode.BAD_REQUEST]: HttpStatusCode.BAD_REQUEST,
  [ErrorCode.INVALID_DATA]: HttpStatusCode.BAD_REQUEST,
  [ErrorCode.WRONG_DATA]: HttpStatusCode.BAD_REQUEST,
  [ErrorCode.CONFLICT_DATA]: HttpStatusCode.CONFLICT,
  [ErrorCode.DUPLICATE_DATA]: HttpStatusCode.CONFLICT,
  [ErrorCode.EXISTING_DATA]: HttpStatusCode.CONFLICT,
  [ErrorCode.MISSING_DATA]: HttpStatusCode.BAD_REQUEST,
  [ErrorCode.UNPROCESSABLE_ENTITY]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.INTERNAL_SERVER_ERROR]: HttpStatusCode.INTERNAL_SERVER_ERROR,
};

// 4. Define Error Object Structure
export type ErrorObj<T> = {
  code: ErrorCode;
  status: HttpStatusCode;
  content: T;
};

// 5. Function to Get Status from Error Code
export function getStatusFromErrorCode(code: ErrorCode): HttpStatusCode {
  return errorCodeToStatus[code] ?? HttpStatusCode.INTERNAL_SERVER_ERROR;
}

// 6. Define Service Return Type
export type ServiceReturn<T, V> = {
  success: boolean;
  status: HttpStatusCode;
  error?: ErrorObj<V>;
  data: T | null;
};

// 7. Overloaded Function to Create Service Return

// Overload for successful response
export function createServiceReturn<T, V>(params: {
  data: T;
  status?: HttpStatusCode.OK | HttpStatusCode.CREATED;
}): ServiceReturn<T, V>;

// Overload for error response
export function createServiceReturn<T, V>(params: {
  error: ErrorObj<V>;
}): ServiceReturn<T, V>;

// Implementation
export function createServiceReturn<T, V>(params: {
  data?: T;
  status?: HttpStatusCode;
  error?: ErrorObj<V>;
}): ServiceReturn<T, V> {
  if (params.error) {
    const statusCode =
      params.error.status ?? HttpStatusCode.INTERNAL_SERVER_ERROR;
    return {
      success: false,
      status: statusCode,
      error: params.error,
      data: null,
    };
  }

  return {
    success: true,
    status: params.status ?? HttpStatusCode.OK,
    data: params.data ?? null,
  };
}

// 8. Function to Create Error Object
export function createError<T>(params: {
  code: ErrorCode;
  content: T;
}): ErrorObj<T> {
  return {
    code: params.code,
    status: getStatusFromErrorCode(params.code),
    content: params.content,
  };
}
