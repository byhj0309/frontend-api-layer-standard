/**
 * HTTP 에러 코드 상수
 * 서버와 클라이언트 간 일관된 에러 처리를 위해 사용
 */
export const HTTP_ERROR_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpErrorCode =
  (typeof HTTP_ERROR_CODE)[keyof typeof HTTP_ERROR_CODE];

/**
 * HTTP 에러 코드별 기본 메시지
 */
export const HTTP_ERROR_MESSAGE: Record<HttpErrorCode, string> = {
  [HTTP_ERROR_CODE.BAD_REQUEST]: '잘못된 요청입니다.',
  [HTTP_ERROR_CODE.UNAUTHORIZED]: '인증이 필요합니다.',
  [HTTP_ERROR_CODE.FORBIDDEN]: '접근 권한이 없습니다.',
  [HTTP_ERROR_CODE.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR]: '서버 오류가 발생했습니다.',
};

/**
 * HTTP 상태 코드가 정의된 에러 코드인지 확인
 */
export function isKnownErrorCode(status: number): status is HttpErrorCode {
  return Object.values(HTTP_ERROR_CODE).includes(status as HttpErrorCode);
}

