# /spec:generate

기존 화면의 명세서를 (재)생성합니다.

## 워크플로우
1. 대상 화면 선택 (단일 또는 전체)
2. 화면 상태 정보 로드
3. 스크린샷 확인
4. 명세서 생성 (Markdown, DOCX)

## 입력 파라미터
- **화면 ID**: 특정 화면 ID (예: "SCR-003") 또는 "all" (전체)
- **출력 형식**: md, docx, all (기본값: all)
- **템플릿**: 사용할 명세서 템플릿 (기본값: standard)

## 명세서 구조

### Markdown 명세서
```markdown
# {화면명} 화면명세서

## 1. 화면 개요
- 화면 ID: {screenId}
- 화면명: {screenName}
- 화면 타입: {screenType}
- 작성일: {createdAt}
- 최종 수정일: {updatedAt}

## 2. 화면 설명
{description}

## 3. 화면 구성
### 3.1 주요 구성요소
- 검색 영역
- 데이터 그리드/폼
- 액션 버튼

### 3.2 UI 컴포넌트 목록
{components}

## 4. 화면 캡처
![초기 화면]({screenshot1})
![입력 화면]({screenshot2})

## 5. 기능 명세
### 5.1 조회 기능
### 5.2 입력/수정 기능
### 5.3 삭제 기능

## 6. 데이터 필드
{dataFields}

## 7. 유효성 검증 규칙
{validationRules}

## 8. 변경 이력
{changeLog}
```

### DOCX 명세서
- Markdown과 동일한 구조
- 회사 템플릿 적용
- 스크린샷 자동 삽입
- 목차 자동 생성

## 실행 단계

1. **화면 정보 수집**
   - `config/screen-states.json` 로드
   - 컴포넌트 코드 분석

2. **스크린샷 수집**
   - `outputs/screenshots/{screenId}/` 디렉터리 확인
   - 이미지 파일 경로 수집

3. **명세서 생성**
   - `scripts/core/spec-builder.ts` 실행
   - 템플릿 + 데이터 병합

4. **파일 저장**
   - Markdown: `outputs/specs/{screenId}.md`
   - DOCX: `outputs/specs/{screenId}.docx`

## 사용 예시

```
User: /spec:generate
Assistant: 명세서를 생성할 화면을 선택해주세요.

User:
- 화면 ID: SCR-003
- 출력 형식: all

# 또는 전체 생성
User: /spec:generate --all
```

## 옵션
- `--all`: 모든 화면의 명세서 생성
- `--format md`: Markdown만 생성
- `--format docx`: DOCX만 생성
- `--template custom`: 커스텀 템플릿 사용
