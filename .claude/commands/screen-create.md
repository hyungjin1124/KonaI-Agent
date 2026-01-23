# /screen:create

새로운 데모 화면을 생성하고 화면명세서까지 자동으로 생성합니다.

## 워크플로우
1. 요구사항 분석 및 확인
2. React 컴포넌트 코드 생성 (TypeScript + Functional Component)
3. 로컬 개발 서버 실행 (npm run dev)
4. Puppeteer를 사용한 스크린샷 캡처
5. 화면명세서 생성 (Markdown + DOCX)
6. Git 커밋 및 푸시 (선택사항)

## 입력 파라미터
사용자에게 다음 정보를 질문합니다:
- **화면 이름**: 한글 화면명 (예: "거래처 관리")
- **화면 타입**: crud, dashboard, form, report, custom 중 선택
- **상세 요구사항**: UI 구성요소, 기능, 데이터 필드 등

## 화면 타입별 특성

### CRUD
- 목록 조회 (테이블/그리드 with 검색, 정렬, 페이징)
- 상세 조회/등록/수정 폼
- 삭제 확인 다이얼로그

### Dashboard
- KPI 카드 (주요 지표 요약)
- 차트 (Line, Bar, Pie)
- 데이터 테이블

### Form
- 입력 필드 그룹
- 유효성 검증
- 제출/취소 버튼

### Report
- 조회 조건
- 결과 테이블
- 내보내기 (Excel, PDF)

## 실행 단계

1. **React 컴포넌트 생성**
   - `src/pages/{screenName}/` 디렉터리 생성
   - 메인 컴포넌트, 서브 컴포넌트, 스타일 파일 생성
   - `frontend-prompt-generator` 스킬 활용

2. **개발 서버 실행**
   - `npm run dev` 실행
   - 서버 준비 상태 확인 (healthcheck)

3. **스크린샷 캡처**
   - Puppeteer 브라우저 실행
   - 화면 상태별 캡처 (초기, 입력, 결과 등)
   - `outputs/screenshots/{screenId}/` 저장

4. **화면명세서 생성**
   - `spec-generator` 스킬 활용
   - Markdown: `outputs/specs/{screenId}.md`
   - DOCX: `outputs/specs/{screenId}.docx`
   - 스크린샷 자동 삽입

5. **Git 커밋** (선택사항)
   - Feature 브랜치 생성: `feature/screen-{screenId}`
   - 커밋 메시지: `[feat] {screenId}: {screenName} 화면 추가`
   - 푸시 여부 확인

## 사용 예시

```
User: /screen:create
Assistant: 새로운 화면을 생성하겠습니다. 다음 정보를 입력해주세요.

User:
- 화면 이름: 거래처 관리
- 화면 타입: crud
- 요구사항: 거래처 목록 조회, 등록, 수정, 삭제 기능. 검색은 거래처명, 사업자번호로 가능. 테이블에는 거래처코드, 거래처명, 대표자, 전화번호, 주소 표시.