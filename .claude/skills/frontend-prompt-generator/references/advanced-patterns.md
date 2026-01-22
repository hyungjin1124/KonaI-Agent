# 고급 프롬프트 패턴

## 1. 다단계 프롬프트 분할

대규모 프로젝트는 한 번에 모든 것을 요청하지 말고 단계별로 나눈다.

### 패턴: Phase 기반 분할

**Phase 1 프롬프트 - 기초 구조**:
```markdown
# [프로젝트명] Phase 1: 프로젝트 셋업 및 기초 구조

## 목표
- 프로젝트 초기화 및 의존성 설치
- 폴더 구조 생성
- 기본 라우팅 설정
- 공통 레이아웃 컴포넌트

## 상세 요구사항
[기초 구조에 대한 상세 내용]

## 다음 Phase 예고
Phase 2에서는 핵심 기능 A, B를 구현할 예정
```

**Phase 2 프롬프트 - 핵심 기능**:
```markdown
# [프로젝트명] Phase 2: 핵심 기능 구현

## 현재 상태
Phase 1에서 기본 구조 완료. 다음 파일들이 존재함:
- src/components/Layout.tsx
- src/App.tsx with routing

## 이번 Phase 목표
- 기능 A 구현
- 기능 B 구현

## 상세 요구사항
[핵심 기능에 대한 상세 내용]
```

### 패턴: 기능별 분할

복잡한 앱은 기능 단위로 분리:
1. 인증 기능 프롬프트
2. 대시보드 기능 프롬프트  
3. 설정 페이지 프롬프트
4. 통합 및 폴리싱 프롬프트

---

## 2. API 연동 명세 작성법

백엔드 API가 있는 경우 상세한 명세를 포함한다.

### 패턴: API 스펙 포함

```markdown
## API 연동

### 베이스 설정
- Base URL: `https://api.example.com/v1`
- 인증: Bearer Token (헤더에 `Authorization: Bearer {token}`)

### 엔드포인트 목록

#### GET /users
- 설명: 사용자 목록 조회
- Query params: `page`, `limit`, `search`
- Response:
```json
{
  "data": [
    { "id": "1", "name": "홍길동", "email": "hong@example.com" }
  ],
  "pagination": { "total": 100, "page": 1, "limit": 20 }
}
```

#### POST /users
- 설명: 사용자 생성
- Request body:
```json
{ "name": "string", "email": "string" }
```
- Response: 생성된 사용자 객체

### 에러 처리
- 401: 토큰 만료 → 로그인 페이지로 리다이렉트
- 400: 입력 검증 실패 → 에러 메시지 표시
- 500: 서버 에러 → 일반 에러 메시지 표시
```

---

## 3. 디자인 시스템 연동

기존 디자인 시스템이나 컴포넌트 라이브러리를 사용하는 경우:

### 패턴: 디자인 토큰 명시

```markdown
## 디자인 시스템

### 컬러 토큰
사용 가능한 TailwindCSS 커스텀 컬러:
- `primary-50` ~ `primary-900`: 브랜드 메인 컬러
- `gray-50` ~ `gray-900`: 뉴트럴
- `success`, `warning`, `error`: 시맨틱 컬러

### 타이포그래피
- `text-heading-1`: 32px/40px bold
- `text-heading-2`: 24px/32px semibold
- `text-body`: 16px/24px regular
- `text-caption`: 12px/16px regular

### 스페이싱
4px 단위 시스템 사용 (TailwindCSS 기본)

### 기존 컴포넌트 활용
이미 구현된 공통 컴포넌트:
- `<Button variant="primary|secondary|ghost" size="sm|md|lg" />`
- `<Input label="string" error="string" />`
- `<Card>`, `<Modal>`, `<Dropdown>`

새로운 컴포넌트는 이 패턴을 따라 작성할 것
```

---

## 4. 상태 관리 상세 명세

복잡한 상태 관리가 필요한 경우:

### 패턴: Store 구조 정의

```markdown
## 상태 관리 (Zustand)

### Store 구조
```typescript
// stores/useAuthStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// stores/useCartStore.ts
interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalAmount: number; // derived
}
```

### 상태 흐름
1. 앱 시작 시 `useAuthStore`에서 localStorage 토큰 체크
2. 토큰 있으면 자동 로그인 시도
3. 실패 시 로그인 페이지로 이동
```

---

## 5. 테스트 요구사항 포함

테스트가 필요한 경우:

### 패턴: 테스트 명세 추가

```markdown
## 테스트 요구사항

### 단위 테스트 (Vitest)
- `formatCurrency()` 함수: 다양한 입력값에 대해 올바른 포맷 반환
- `calculateTotal()` 함수: 할인 적용 로직 검증

### 컴포넌트 테스트 (React Testing Library)
- `<LoginForm />`: 유효성 검사 에러 메시지 표시 확인
- `<ProductCard />`: 클릭 시 상세 페이지 이동 확인

### E2E 테스트 (Playwright) - 선택
- 로그인 → 상품 추가 → 결제 플로우
```

---

## 6. 접근성 요구사항

접근성이 중요한 프로젝트:

### 패턴: A11y 체크리스트

```markdown
## 접근성 요구사항 (WCAG 2.1 AA)

### 필수 항목
- 모든 이미지에 alt 텍스트
- 폼 요소에 label 연결
- 색상만으로 정보 구분하지 않기 (아이콘/텍스트 병행)
- 키보드 네비게이션 지원 (Tab, Enter, Escape)
- 포커스 상태 시각적으로 명확히 표시

### 스크린 리더 지원
- 적절한 heading 계층 구조 (h1 → h2 → h3)
- aria-label 필요한 곳에 추가
- 동적 컨텐츠 변경 시 aria-live 사용

### 테스트
- axe DevTools로 자동 검사 통과
- VoiceOver/NVDA로 수동 테스트
```
