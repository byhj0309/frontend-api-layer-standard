import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetcher } from '../api/fetcher.ts';
import { ApiError } from '../errors/ApiError.ts';
import { HTTP_ERROR_CODE } from '../errors/errorCode.ts';

// fetch mock 타입
type MockFetch = ReturnType<typeof vi.fn>;

describe('fetcher', () => {
  let mockFetch: MockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('성공 케이스', () => {
    it('GET 요청 성공 시 JSON 데이터를 반환한다', async () => {
      const mockData = { id: 1, name: 'Test User' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetcher<typeof mockData>('/api/users/1');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      });
    });

    it('POST 요청 시 body를 JSON으로 직렬화한다', async () => {
      const requestBody = { name: 'New User', email: 'test@example.com' };
      const mockData = { id: 2, ...requestBody };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetcher<typeof mockData>('/api/users', {
        method: 'POST',
        body: requestBody,
      });

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    });

    it('204 No Content 응답 시 undefined를 반환한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await fetcher('/api/users/1', { method: 'DELETE' });

      expect(result).toBeUndefined();
    });

    it('커스텀 헤더를 병합한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await fetcher('/api/protected', {
        headers: { Authorization: 'Bearer token123' },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/protected', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
        body: undefined,
      });
    });
  });

  describe('에러 케이스', () => {
    it('400 Bad Request 에러를 처리한다', async () => {
      const errorMessage = '잘못된 요청 형식입니다.';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: errorMessage }),
      });

      try {
        await fetcher('/api/users');
        expect.fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(HTTP_ERROR_CODE.BAD_REQUEST);
        expect(apiError.message).toBe(errorMessage);
        expect(apiError.isClientError()).toBe(true);
      }
    });

    it('401 Unauthorized 에러를 처리한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: '인증이 필요합니다.' }),
      });

      try {
        await fetcher('/api/protected');
        expect.fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(HTTP_ERROR_CODE.UNAUTHORIZED);
        expect(apiError.isAuthError()).toBe(true);
      }
    });

    it('403 Forbidden 에러를 처리한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: '접근 권한이 없습니다.' }),
      });

      try {
        await fetcher('/api/admin');
        expect.fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(HTTP_ERROR_CODE.FORBIDDEN);
        expect(apiError.isAuthError()).toBe(true);
      }
    });

    it('404 Not Found 에러를 처리한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: '리소스를 찾을 수 없습니다.' }),
      });

      try {
        await fetcher('/api/users/999');
        expect.fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(HTTP_ERROR_CODE.NOT_FOUND);
        expect(apiError.isClientError()).toBe(true);
      }
    });

    it('500 Internal Server Error를 처리한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류가 발생했습니다.' }),
      });

      try {
        await fetcher('/api/users');
        expect.fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR);
        expect(apiError.isServerError()).toBe(true);
      }
    });

    it('네트워크 에러를 처리한다', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      try {
        await fetcher('/api/users');
        expect.fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(0);
        expect(apiError.message).toContain('네트워크 오류');
      }
    });

    it('에러 응답에서 메시지를 추출할 수 없으면 기본 메시지를 사용한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      try {
        await fetcher('/api/users');
        expect.fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.message).toBe('잘못된 요청입니다.');
      }
    });

    it('ApiError에 endpoint 정보가 포함된다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      try {
        await fetcher('/api/users/123');
        expect.fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.endpoint).toBe('/api/users/123');
      }
    });
  });

  describe('FormData 처리', () => {
    it('FormData 전송 시 Content-Type 헤더를 설정하지 않는다', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      await fetcher('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
      expect(callArgs.headers).not.toHaveProperty('Content-Type');
      expect(callArgs.body).toBe(formData);
    });
  });
});

