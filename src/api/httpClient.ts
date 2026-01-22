import { fetcher } from './fetcher.ts';
import type { RequestOptions } from '../types/api.ts';

/**
 * HTTP 클라이언트 설정
 */
interface HttpClientConfig {
  baseURL: string;
  defaultHeaders?: HeadersInit;
}

/**
 * HTTP 클라이언트 생성
 *
 * baseURL과 공통 헤더를 설정하여 재사용 가능한 클라이언트를 생성합니다.
 *
 * @example
 * const apiClient = createHttpClient({
 *   baseURL: 'https://api.example.com',
 *   defaultHeaders: { 'X-API-Key': 'secret' }
 * });
 *
 * const user = await apiClient.get<User>('/users/1');
 * const newUser = await apiClient.post<User>('/users', { name: 'John' });
 */
export function createHttpClient(config: HttpClientConfig) {
  const { baseURL, defaultHeaders = {} } = config;

  /**
   * 전체 URL 생성
   */
  function buildURL(endpoint: string): string {
    // endpoint가 절대 URL이면 그대로 사용
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    // baseURL 끝의 / 제거, endpoint 앞의 / 보장
    const base = baseURL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  /**
   * 헤더 병합
   */
  function mergeHeaders(customHeaders?: HeadersInit): HeadersInit {
    return { ...defaultHeaders, ...customHeaders };
  }

  /**
   * body를 RequestOptions['body'] 타입으로 변환
   */
  function toRequestBody(body: object | FormData | undefined): RequestOptions['body'] {
    if (!body || body instanceof FormData) {
      return body;
    }
    return body as Record<string, unknown>;
  }

  return {
    /**
     * GET 요청
     */
    get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
      return fetcher<T>(buildURL(endpoint), {
        ...options,
        method: 'GET',
        headers: mergeHeaders(options?.headers),
      });
    },

    /**
     * POST 요청
     */
    post<T>(
      endpoint: string,
      body?: object | FormData,
      options?: Omit<RequestOptions, 'method' | 'body'>
    ): Promise<T> {
      return fetcher<T>(buildURL(endpoint), {
        ...options,
        method: 'POST',
        body: toRequestBody(body),
        headers: mergeHeaders(options?.headers),
      });
    },

    /**
     * PUT 요청
     */
    put<T>(
      endpoint: string,
      body?: object | FormData,
      options?: Omit<RequestOptions, 'method' | 'body'>
    ): Promise<T> {
      return fetcher<T>(buildURL(endpoint), {
        ...options,
        method: 'PUT',
        body: toRequestBody(body),
        headers: mergeHeaders(options?.headers),
      });
    },

    /**
     * PATCH 요청
     */
    patch<T>(
      endpoint: string,
      body?: object | FormData,
      options?: Omit<RequestOptions, 'method' | 'body'>
    ): Promise<T> {
      return fetcher<T>(buildURL(endpoint), {
        ...options,
        method: 'PATCH',
        body: toRequestBody(body),
        headers: mergeHeaders(options?.headers),
      });
    },

    /**
     * DELETE 요청
     */
    delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
      return fetcher<T>(buildURL(endpoint), {
        ...options,
        method: 'DELETE',
        headers: mergeHeaders(options?.headers),
      });
    },
  };
}

/**
 * 기본 API 클라이언트
 *
 * 환경 변수 VITE_API_BASE_URL을 사용하거나 기본값 사용
 */
export const apiClient = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
});
