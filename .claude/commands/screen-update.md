# /screen:update

기존 화면을 수정하고 명세서를 업데이트합니다.

## 워크플로우
1. 기존 코드 분석 및 확인
2. 수정 사항 적용
3. 개발 서버 재시작 (필요시)
4. 스크린샷 재캡처
5. 명세서 버전 업데이트
6. Git 커밋 (변경 이력 포함)

## 입력 파라미터
- **화면 ID**: 수정할 화면 ID (예: "SCR-003")
- **변경 요구사항**: 수정할 내용 상세 설명

## 실행 단계

### 1. 화면 식별 및 분석
```
🔍 화면 정보 확인
- Screen ID: SCR-003
- Screen Name: 거래처 관리
- 경로: src/pages/customer-management/
- 현재 버전: 1.2.0
```

### 2. 기존 코드 읽기
- 메인 컴포넌트 파일 읽기
- 관련 서브 컴포넌트 확인
- 현재 구조 파악

### 3. 수정 사항 적용
- Edit 도구로 파일 수정
- 타입스크립트 타입 안전성 유지
- 기존 패턴 및 스타일 일관성 유지

### 4. 변경 검증
```bash
# 타입 체크
npm run type-check

# 린트
npm run lint
```

### 5. 스크린샷 재캡처
- 변경된 화면 상태 캡처
- 이전 스크린샷과 비교
- `outputs/screenshots/{screenId}/v{version}/` 저장

### 6. 명세서 업데이트
- 버전 증가 (1.2.0 → 1.3.0)
- 변경 이력 추가
- 수정된 필드/버튼/이벤트 반영
- Markdown 및 DOCX 재생성

### 7. Git 커밋
```bash
git add .
git commit -m "[update] SCR-003: 거래처 검색 조건 추가

- 사업자번호 검색 필드 추가
- 검색 버튼 레이아웃 개선
- 명세서 v1.3.0 업데이트"
```

## 변경 이력 관리

명세서의 changeHistory 섹션에 자동 추가:
```json
{
  "version": "1.3.0",
  "changedAt": "2025-01-23",
  "changedBy": "Claude Code",
  "changeType": "update",
  "description": "거래처 검색 조건 추가 (사업자번호)"
}
```

## 사용 예시

```
User: /screen:update
