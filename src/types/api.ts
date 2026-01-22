/**
 * API 응답 공통 타입
 */

/**
 * JSON 요청 body 타입
 */
export type JsonBody = Record<string, unknown>;

/**
 * API 요청 옵션
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: JsonBody | FormData;
}

/**
 * API 성공 응답 타입
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * API 실패 응답 타입
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    status: number;
    message: string;
  };
}

/**
 * API 응답 타입 (성공 또는 실패)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 서버에서 내려주는 에러 응답 형식 (예상)
 */
export interface ServerErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Pagination 응답을 위한 제네릭 타입
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

