/**
 * 예제 API 호출 함수
 *
 * 실제 사용 시 이 파일을 참고하여 도메인별로 API 함수를 구성합니다.
 */
import { apiClient } from './httpClient.ts';

/**
 * 사용자 타입 정의
 */
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

/**
 * 사용자 목록 조회
 */
export function getUsers(): Promise<User[]> {
  return apiClient.get<User[]>('/users');
}

/**
 * 사용자 상세 조회
 */
export function getUser(id: number): Promise<User> {
  return apiClient.get<User>(`/users/${id}`);
}

/**
 * 사용자 생성
 */
export function createUser(data: CreateUserRequest): Promise<User> {
  return apiClient.post<User>('/users', data);
}

/**
 * 사용자 수정
 */
export function updateUser(id: number, data: Partial<CreateUserRequest>): Promise<User> {
  return apiClient.patch<User>(`/users/${id}`, data);
}

/**
 * 사용자 삭제
 */
export function deleteUser(id: number): Promise<void> {
  return apiClient.delete<void>(`/users/${id}`);
}

