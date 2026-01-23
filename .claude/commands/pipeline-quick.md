# /pipeline:quick

빠른 파이프라인 실행 (최신 변경 화면만 처리).

## 워크플로우
1. Git 변경 파일 감지
2. 영향받은 화면 식별
3. 해당 화면만 캡처 및 명세서 생성
4. 간단한 검증

## 실행 단계

### 1. 변경 감지
```bash
git diff --name-only HEAD
```
- `src/pages/` 하위 변경 파일 확인
- 영향받은 화면 ID 추출

### 2. 대상 화면 확인
```
🔍 변경 감지 결과:
- src/pages/customer-management/CustomerList.tsx
- src/pages/order-form/OrderForm.tsx

📋 영향받은 화면:
- SCR-003: 거래처 관리
- SCR-007: 주문 입력

계속 진행하시겠습니까? (y/n)
```

### 3. 선택적 처리
- 빌드 검증 (변경된 화면만)
- 스크린샷 캡처 (변경된 화면만)
- 명세서 업데이트 (변경된 화면만)

### 4. 결과 요약
```
⚡ Quick Pipeline 실행 완료

📸 캡처: 2개 화면
📄 명세서: 2개 업데이트
⏱️  소요 시간: 42초

변경된 화면:
✅ SCR-003: 거래처 관리
✅ SCR-007: 주문 입력
```

## /pipeline:full과의 차이

| 항목 | pipeline:full | pipeline:quick |
|------|---------------|----------------|
| 대상 화면 | 전체 | 변경된 것만 |
| 빌드 검증 | 전체 프로젝트 | 필요시만 |
| 접근성 검증 | 전체 | 스킵 |
| 소요 시간 | 3-5분 | 30초-1분 |
| 사용 시점 | 릴리스 전, 전체 검증 | 개발 중, 빠른 확인 |

## 사용 예시

```bash
User: /pipeline:quick

# 개발 중 빠른 확인
# 1. 코드 수정
# 2. /pipeline:quick 실행
# 3. 명세서 확인
# 4. 반복
```

## 옵션
- `--force-all`: 변경 여부 무시하고 모든 화면 처리
- `--screens SCR-001`: 특정 화면 강제 지정
- `--no-spec`: 스크린샷만 캡처, 명세서 생성 스킵

## 언제 사용하나요?

### pipeline:quick 사용
- ✅ 개발 중 빠른 확인
- ✅ 특정 화면 수정 후
- ✅ PR 전 변경 사항 검증

### pipeline:full 사용
- ✅ 릴리스 전 전체 검증
- ✅ 명세서 일괄 업데이트
- ✅ 접근성 검증 필요시
- ✅ 통합 문서 생성

## 자동 감지 로직
1. Git staged/unstaged 파일 확인
2. `src/pages/{screenName}/` 패턴 매칭
3. `screen-states.json`에서 screenId 매핑
4. 해당 화면만 처리 대상으로 선정
