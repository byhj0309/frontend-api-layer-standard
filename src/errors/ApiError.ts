import {
  type HttpErrorCode,
  HTTP_ERROR_MESSAGE,
  isKnownErrorCode,
} from './errorCode.ts';

interface ApiErrorOptions {
  status: number;
  message?: string;
  endpoint?: string;
}

/**
 * API 요청 실패 시 사용하는 공통 에러 클래스
 *
 * @example
 * throw new ApiError({ status: 401, message: '토큰이 만료되었습니다.' });
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: HttpErrorCode | null;
  readonly endpoint?: string;

  constructor({ status, message, endpoint }: ApiErrorOptions) {
    const errorMessage = message ?? ApiError.getDefaultMessage(status);
    super(errorMessage);

    this.name = 'ApiError';
    this.status = status;
    this.errorCode = isKnownErrorCode(status) ? status : null;
    this.endpoint = endpoint;

    // Error 클래스를 상속할 때 프로토타입 체인 복원
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * HTTP 상태 코드에 따른 기본 에러 메시지 반환
   */
  private static getDefaultMessage(status: number): string {
    if (isKnownErrorCode(status)) {
      return HTTP_ERROR_MESSAGE[status];
    }
    return `알 수 없는 오류가 발생했습니다. (status: ${status})`;
  }

  /**
   * 특정 HTTP 상태 코드인지 확인
   */
  isStatus(status: number): boolean {
    return this.status === status;
  }

  /**
   * 인증 관련 에러인지 확인 (401, 403)
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * 클라이언트 에러인지 확인 (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * 서버 에러인지 확인 (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

