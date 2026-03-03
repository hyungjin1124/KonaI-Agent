# Fix Request: Agent Self-Review / Auto-Validation

## QA 판정: CONDITIONAL PASS
## 수정 사이클: 1/3

### 수정 항목

- [x] **[Major] 자동 수정 버튼 포커스 인디케이터 없음** — `SelfReviewCard.tsx:199-208`
  자동 수정 시도 버튼에 포커스 스타일이 없어 키보드 사용자가 포커스 위치를 확인할 수 없다 (WCAG 2.4.7 위반).
  수정 방향: 헤더 버튼과 동일하게 `focus:outline-none focus:ring-2 focus:ring-blue-500/20` 클래스를 추가한다.
  **수정 완료**: `focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded` 추가.

- [x] **[Major] 증거 라벨 텍스트 대비 부족** — `SelfReviewCheckItem.tsx:89`
  `text-gray-400`(#9CA3AF)이 흰색 배경 대비 약 2.7:1로 WCAG 1.4.3 기준(4.5:1) 미달.
  수정 방향: `text-gray-400` → `text-gray-500`(#6B7280, 약 4.6:1)으로 변경한다.
  **수정 완료**: `text-gray-400` → `text-gray-500` 변경.
