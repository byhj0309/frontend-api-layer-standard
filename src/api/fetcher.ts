import { ApiError } from '../errors/ApiError.ts';
import type { RequestOptions, ServerErrorResponse } from '../types/api.ts';

const DEFAULT_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
};

/**
 * 요청 body를 직렬화
 */
function serializeBody(
  body: RequestOptions['body']
): BodyInit | undefined {
  if (!body) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

/**
 * 요청 헤더를 생성 (FormData인 경우 Content-Type 제외)
 */
function createHeaders(
  customHeaders: HeadersInit | undefined,
  body: RequestOptions['body']
): HeadersInit {
  // FormData는 브라우저가 자동으로 Content-Type을 설정함
  if (body instanceof FormData) {
    return { ...customHeaders };
  }
  return { ...DEFAULT_HEADERS, ...customHeaders };
}

/**
 * 응답에서 에러 메시지 추출
 */
async function extractErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const errorBody = (await response.json()) as ServerErrorResponse;
    return errorBody.message ?? errorBody.error;
  } catch {
    // JSON 파싱 실패 시 undefined 반환
    return undefined;
  }
}

/**
 * fetch 공통 래퍼
 *
 * - JSON 요청/응답을 기본으로 처리
 * - response.ok가 false면 ApiError를 throw
 * - 네트워크 에러도 ApiError로 변환
 *
 * @example
 * const user = await fetcher<User>('/api/users/1');
 * const newUser = await fetcher<User>('/api/users', {
 *   method: 'POST',
 *   body: { name: 'John' }
 * });
 */
export async function fetcher<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...restOptions } = options;

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: createHeaders(customHeaders, body),
    body: serializeBody(body),
  };

  let response: Response;

  try {
    response = await fetch(endpoint, fetchOptions);
  } catch (error) {
    // 네트워크 에러 (오프라인, DNS 실패 등)
    throw new ApiError({
      status: 0,
      message:
        error instanceof Error
          ? `네트워크 오류: ${error.message}`
          : '네트워크 오류가 발생했습니다.',
      endpoint,
    });
  }

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response);
    throw new ApiError({
      status: response.status,
      message: errorMessage,
      endpoint,
    });
  }

  // 204 No Content 처리
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError({
      status: response.status,
      message: '응답을 파싱할 수 없습니다.',
      endpoint,
    });
  }
}

