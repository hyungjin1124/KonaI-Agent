# 컴포넌트 코딩 패턴

## 기본 원칙

1. **함수형 컴포넌트 사용**: 클래스 컴포넌트 대신 함수형 컴포넌트와 Hooks 사용
2. **TypeScript 엄격 모드**: 모든 props와 state에 타입 정의
3. **관심사 분리**: 로직, 스타일, 타입을 별도 파일로 분리
4. **단방향 데이터 흐름**: props를 통한 데이터 전달

## 파일 구조 패턴

```
src/pages/{screen-name}/
├── {ScreenName}.tsx          # 메인 컴포넌트
├── {ScreenName}.styles.ts    # styled-components
├── {ScreenName}.types.ts     # 타입 정의
├── {ScreenName}.hooks.ts     # 커스텀 훅 (선택)
├── {ScreenName}.utils.ts     # 유틸리티 함수 (선택)
├── index.ts                  # 내보내기
└── components/               # 서브 컴포넌트
```

## 컴포넌트 템플릿

### 기본 컴포넌트
```tsx
import React, { useState, useCallback } from 'react';
import { ScreenNameProps } from './ScreenName.types';
import * as S from './ScreenName.styles';

const ScreenName: React.FC<ScreenNameProps> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<StateType>(initialState);

  const handleAction = useCallback(() => {
    // 핸들러 로직
  }, [dependencies]);

  return (
    <S.Container>
      {/* 컴포넌트 내용 */}
    </S.Container>
  );
};

export default ScreenName;
```

### 커스텀 훅 패턴
```tsx
// useScreenNameData.ts
export const useScreenNameData = (params: Params) => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getData(params);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

## 스타일 패턴

### styled-components 사용
```tsx
import styled from 'styled-components';

export const Container = styled.div`
  padding: 24px;
  background: #fff;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

// 조건부 스타일
export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  background: ${props => props.variant === 'primary' ? '#007bff' : '#6c757d'};
  color: white;
`;
```

## 상태 관리 패턴

### 로컬 상태
```tsx
const [formData, setFormData] = useState<FormData>({});
const [errors, setErrors] = useState<Record<string, string>>({});

const handleChange = (field: string, value: unknown) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  setErrors(prev => ({ ...prev, [field]: '' }));
};
```

### 리스트 상태
```tsx
const [items, setItems] = useState<Item[]>([]);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const toggleSelection = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
};
```

## 이벤트 핸들러 패턴

### 폼 제출
```tsx
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();

  // 유효성 검증
  const validationErrors = validate(formData);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setSubmitting(true);
  try {
    await api.submit(formData);
    onSuccess?.();
  } catch (error) {
    setError(error as Error);
  } finally {
    setSubmitting(false);
  }
}, [formData, onSuccess]);
```

### 검색/필터
```tsx
const handleSearch = useCallback(async () => {
  setLoading(true);
  try {
    const results = await api.search(searchParams);
    setData(results);
  } finally {
    setLoading(false);
  }
}, [searchParams]);

// 디바운스 적용
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  [handleSearch]
);
```

## 에러 처리 패턴

```tsx
const [error, setError] = useState<Error | null>(null);

// 에러 바운더리와 함께 사용
if (error) {
  return (
    <S.ErrorContainer>
      <S.ErrorMessage>{error.message}</S.ErrorMessage>
      <S.RetryButton onClick={() => { setError(null); refetch(); }}>
        다시 시도
      </S.RetryButton>
    </S.ErrorContainer>
  );
}
```

## 로딩 상태 패턴

```tsx
if (loading) {
  return (
    <S.LoadingContainer>
      <S.Spinner />
      <S.LoadingText>로딩 중...</S.LoadingText>
    </S.LoadingContainer>
  );
}
```

## 접근성 패턴

```tsx
// 버튼 접근성
<button
  type="button"
  aria-label="검색 실행"
  aria-busy={loading}
  disabled={loading}
>
  {loading ? '검색 중...' : '검색'}
</button>

// 폼 필드 접근성
<label htmlFor="email">이메일</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && <span id="email-error" role="alert">{errors.email}</span>}
```
