# Fix Request: Natural Language to Chart (Phase 2)

## QA 판정: CONDITIONAL PASS
## 수정 사이클: 1/3

### 수정 항목

- [x] **[Major] handleSend()에서 이전 결과 미정리 (상태 마스킹)** — `src/components/features/general-chat/GeneralChatView.tsx:212,245`
  수정 완료: isDashboardQuery 분기 진입 시 `clearChart()`, processQuery 분기 진입 시 `clearDashboard()` 호출 추가.
  useCallback deps에 clearChart, clearDashboard 추가.

- [x] **[Major] Artifact 사이드바 재오픈 시 previewType 미구분** — `src/components/features/general-chat/GeneralChatView.tsx:505`
  수정 완료: onArtifactSelect에서 `artifact.id.startsWith('dashboard-')` 조건으로 previewType 결정.
  대시보드 아티팩트는 `'dashboard'`, 차트 아티팩트는 `'chart'`로 재오픈.
