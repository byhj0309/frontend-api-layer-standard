# Frontend API Layer Standard

> React + TypeScript 프로젝트를 위한 **공통 API 레이어 + 에러 표준화** 구현

실무에서 바로 사용할 수 있는 API 호출 구조와 에러 처리 패턴을 제공합니다.

## 🎯 프로젝트 목적

프론트엔드 프로젝트에서 API 호출 코드가 컴포넌트에 흩어져 있으면:
- 중복 코드 발생
- 에러 처리 불일치
- 테스트 어려움
- 유지보수 비용 증가

이 프로젝트는 **API 레이어를 분리하여 일관된 구조**를 제공합니다.

## 📁 폴더 구조

```
src/
├── api/
│   ├── fetcher.ts       # fetch 공통 래퍼
│   ├── httpClient.ts    # HTTP 클라이언트 (baseURL, 메서드별 래퍼)
│   └── example.ts       # 예제 API 호출 함수
├── errors/
│   ├── ApiError.ts      # 공통 에러 클래스
│   └── errorCode.ts     # HTTP 에러 코드 정의
├── types/
│   └── api.ts           # API 요청/응답 타입
├── __tests__/
│   └── fetcher.test.ts  # 유닛 테스트
├── App.tsx
└── main.tsx
```

## ✨ 주요 기능

### 1. fetch 공통 래퍼 (`fetcher.ts`)
- JSON 요청/응답 자동 처리
- `response.ok === false` 시 `ApiError` throw
- 네트워크 에러 처리
- FormData 지원 (파일 업로드)

### 2. HTTP 클라이언트 (`httpClient.ts`)
- baseURL 설정
- GET / POST / PUT / PATCH / DELETE 메서드 제공
- 공통 헤더 설정

### 3. 에러 표준화 (`ApiError.ts`)
- HTTP 상태 코드별 에러 구분 (400, 401, 403, 404, 500)
- 에러 분류 헬퍼 메서드 제공
  - `isAuthError()` - 인증 에러 (401, 403)
  - `isClientError()` - 클라이언트 에러 (4xx)
  - `isServerError()` - 서버 에러 (5xx)

## 🚀 사용 예시

### 기본 사용법

```typescript
import { apiClient } from './api/httpClient';
import { ApiError } from './errors/ApiError';

// GET 요청
const users = await apiClient.get<User[]>('/users');

// POST 요청
const newUser = await apiClient.post<User>('/users', {
  name: '홍길동',
  email: 'hong@example.com'
});
```

### 에러 처리

```typescript
try {
  const user = await apiClient.get<User>('/users/1');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isAuthError()) {
      // 로그인 페이지로 이동
      navigate('/login');
    } else if (error.isServerError()) {
      // 서버 에러 안내
      alert('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      // 기타 에러
      console.error(`[${error.status}] ${error.message}`);
    }
  }
}
```

### 커스텀 클라이언트 생성

```typescript
import { createHttpClient } from './api/httpClient';

// 다른 API 서버용 클라이언트
const externalApi = createHttpClient({
  baseURL: 'https://external-api.com',
  defaultHeaders: {
    'X-API-Key': 'your-api-key'
  }
});

const data = await externalApi.get<SomeData>('/endpoint');
```

## 🧪 테스트

```bash
# 테스트 실행
npm run test

# 테스트 1회 실행
npm run test:run
```

### 테스트 커버리지

| 항목 | 테스트 케이스 |
|------|--------------|
| 성공 케이스 | GET/POST 요청, 204 응답, 커스텀 헤더 |
| 에러 케이스 | 400, 401, 403, 404, 500 상태 코드 |
| 네트워크 에러 | 오프라인, DNS 실패 등 |
| FormData | Content-Type 자동 처리 |

## 🛠 기술 스택

- **React 19** + **TypeScript 5.9**
- **Vite 7** - 빌드 도구
- **Vitest** - 테스트 프레임워크

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트
npm run lint
```

## 🔑 환경 변수

```env
# .env 또는 .env.local
VITE_API_BASE_URL=https://api.example.com
```

설정하지 않으면 기본값 `/api` 사용

## 💡 설계 포인트

| 항목 | 설명 |
|------|------|
| **단일 에러 클래스** | `ApiError` 하나로 모든 HTTP 에러를 일관되게 처리 |
| **타입 안전성** | 제네릭 활용, `any` 사용 금지 |
| **관심사 분리** | UI와 API 로직 분리로 테스트 및 유지보수 용이 |
| **확장성** | `createHttpClient`로 여러 API 서버 대응 가능 |
| **실무 적용** | 과한 추상화 없이 바로 사용 가능한 수준 |

## 📄 License

MIT
