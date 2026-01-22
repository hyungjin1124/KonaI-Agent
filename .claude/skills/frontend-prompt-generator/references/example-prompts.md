# 예시 프롬프트

## 예시 1: CEO 대시보드

**사용자 요청**: "CEO가 사용할 매출 대시보드 만들어줘. 차트랑 KPI 카드 필요해."

**생성된 프롬프트**:

```markdown
# CEO 매출 대시보드 프론트엔드 개발

## 프로젝트 개요
경영진이 실시간으로 핵심 비즈니스 지표를 모니터링할 수 있는 대시보드. 
직관적인 시각화를 통해 빠른 의사결정을 지원한다.

## 기술 스택
- Framework: React 18
- Language: TypeScript
- Styling: TailwindCSS
- Charts: Recharts
- Icons: Lucide React

## 주요 기능 요구사항
1. **KPI 카드 섹션**: 총 매출, 전월 대비 성장률, 신규 고객 수, 평균 주문 금액을 카드 형태로 표시. 각 카드에 트렌드 아이콘(상승/하락 화살표) 포함
2. **매출 추이 차트**: 최근 12개월 월별 매출을 Line Chart로 시각화. 호버 시 상세 금액 툴팁 표시
3. **카테고리별 매출 비중**: Pie Chart 또는 Donut Chart로 제품 카테고리별 매출 비중 표시
4. **기간 필터**: 이번 달 / 분기 / 연간 전환 버튼

## UI/UX 요구사항
- 레이아웃: 상단에 KPI 카드 4개 가로 배치, 하단에 차트 2개 좌우 배치
- 반응형: 모바일에서 카드와 차트 세로 스택
- 디자인 톤: 깔끔한 기업용 대시보드, 화이트 배경
- 컬러 스킴: Primary #2563EB (파란색), Success #10B981 (초록), Danger #EF4444 (빨강)

## 컴포넌트 구조
src/
├── components/
│   ├── Dashboard.tsx        # 메인 레이아웃
│   ├── KPICard.tsx          # 개별 KPI 카드
│   ├── KPISection.tsx       # KPI 카드 그리드
│   ├── SalesChart.tsx       # 매출 추이 라인 차트
│   ├── CategoryPieChart.tsx # 카테고리 파이 차트
│   └── PeriodFilter.tsx     # 기간 선택 버튼
├── hooks/
│   └── useDashboardData.ts  # 데이터 페칭 훅
└── types/
    └── dashboard.ts         # 타입 정의

## 데이터 구조
interface KPIData {
  totalRevenue: number;
  growthRate: number;      // 전월 대비 %
  newCustomers: number;
  avgOrderValue: number;
}

interface MonthlySales {
  month: string;           // "2024-01"
  revenue: number;
}

interface CategorySales {
  category: string;
  revenue: number;
  percentage: number;
}

## 제약사항
- 초기에는 목업 데이터 사용 (실제 API 연동은 추후)
- 차트 애니메이션은 subtle하게 유지
- 로딩 상태 스켈레톤 UI 필수

## 참고사항
- 숫자 포맷: 천 단위 콤마, 금액은 "₩" 접두사
- 퍼센트는 소수점 1자리까지 표시
```

---

## 예시 2: 할일 관리 앱

**사용자 요청**: "간단한 투두 앱 만들어줘"

**생성된 프롬프트**:

```markdown
# Todo App 프론트엔드 개발

## 프로젝트 개요
개인 할일을 관리하는 심플한 웹 앱. 할일 추가, 완료 체크, 삭제 기능을 제공한다.

## 기술 스택
- Framework: React 18
- Language: TypeScript
- Styling: TailwindCSS
- State: useState (로컬 상태)
- Storage: localStorage (새로고침 후에도 유지)

## 주요 기능 요구사항
1. **할일 추가**: 입력창 + 추가 버튼. Enter 키로도 추가 가능
2. **할일 목록**: 체크박스 + 텍스트 + 삭제 버튼 형태로 표시
3. **완료 처리**: 체크박스 클릭 시 텍스트에 취소선, 하단으로 이동
4. **삭제**: 개별 삭제 버튼 및 "완료된 항목 모두 삭제" 버튼
5. **필터**: 전체 / 진행중 / 완료 탭

## UI/UX 요구사항
- 레이아웃: 중앙 정렬, 최대 너비 480px
- 디자인 톤: 미니멀, 여백 충분히
- 인터랙션: 체크 시 부드러운 전환 애니메이션

## 데이터 구조
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

## 제약사항
- 외부 상태관리 라이브러리 사용 금지 (useState만)
- localStorage에 자동 저장
```

---

## 예시 3: 랜딩 페이지

**사용자 요청**: "SaaS 제품 랜딩페이지 만들어줘. 히어로, 기능 소개, 가격표 섹션 필요해."

**생성된 프롬프트**:

```markdown
# SaaS 랜딩 페이지 프론트엔드 개발

## 프로젝트 개요
B2B SaaS 제품을 소개하는 마케팅 랜딩 페이지. 방문자를 유료 고객으로 전환하는 것이 목표.

## 기술 스택
- Framework: React 18
- Language: TypeScript
- Styling: TailwindCSS
- Animation: Framer Motion (스크롤 애니메이션)
- Icons: Lucide React

## 주요 기능 요구사항
1. **네비게이션**: 로고 + 메뉴(기능/가격/문의) + CTA 버튼. 스크롤 시 고정
2. **히어로 섹션**: 헤드라인 + 서브 카피 + CTA 버튼 + 제품 스크린샷/일러스트
3. **기능 소개**: 3-4개 핵심 기능을 아이콘 + 제목 + 설명 카드로 표시
4. **가격표**: 3개 플랜 (Free/Pro/Enterprise) 비교 테이블
5. **CTA 섹션**: 최종 전환 유도 문구 + 이메일 수집 폼
6. **푸터**: 회사 정보, 링크 모음

## UI/UX 요구사항
- 레이아웃: 풀 와이드 섹션, 내부 컨텐츠는 max-w-6xl
- 반응형: 모바일 우선, 768px/1024px 브레이크포인트
- 디자인 톤: 모던하고 신뢰감 있는 기업 이미지
- 애니메이션: 스크롤 시 페이드인/슬라이드업

## 컴포넌트 구조
src/
├── components/
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── FeatureSection.tsx
│   ├── FeatureCard.tsx
│   ├── PricingSection.tsx
│   ├── PricingCard.tsx
│   ├── CTASection.tsx
│   └── Footer.tsx
└── App.tsx

## 제약사항
- 단일 페이지 (라우팅 없음)
- 이미지는 placeholder 사용 (unsplash 또는 placeholder.com)
- 폼 제출은 console.log로 대체

## 참고사항
- 플랜별 가격과 기능은 목업 데이터로 채워 넣을 것
- Smooth scroll 적용
```
