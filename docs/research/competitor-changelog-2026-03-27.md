# 엔터프라이즈 AI 플랫폼 변경 사항 스캔 (2026-03-26 ~ 2026-03-27)

> Researched: 2026-03-27
> Researcher: Claude Code (researcher agent)
> Status: Final

## Executive Summary

2026-03-26~27 (1일) 기간 동안 6개 엔터프라이즈 AI 플랫폼 소스를 스캔했다. 해당 기간에 새로운 릴리즈나 발표가 확인된 소스는 없다. 모든 소스의 최신 업데이트는 3월 24일 이전이다. 단, 스캔 과정에서 이전에 수집하지 않았던 최신 변경 사항(Copilot Studio March 2026, Power BI March 2026)을 함께 기록한다.

---

## 스캔 결과 요약

| # | 소스 | URL | 상태 | 3/26-27 변경 |
|---|------|-----|------|-------------|
| 1 | Salesforce Agentforce | salesforce.com/agentforce | 변경 없음 | 페이지 메타데이터 최종 수정: 03-19. 3/26-27 신규 발표 없음 |
| 2 | MS Copilot Studio | learn.microsoft.com/.../whats-new | 변경 없음 | 문서 최종 수정: 03-09. March 2026 항목은 Work IQ (Preview) 1건뿐 |
| 3 | Google Agentspace | cloud.google.com/agentspace/docs/release-notes | 변경 없음 | 최근 항목: 03-24 (OneDrive 필터링, Data Insights agent) |
| 4 | ThoughtSpot | thoughtspot.com/blog | 변경 없음 | 최근 발표: 03-18 (Spotter for Industries). 3/26-27 없음 |
| 5 | Power BI | learn.microsoft.com/.../desktop-latest-update | 변경 없음 | March 2026 업데이트 게시됨 (03-17). 3/26-27 추가 변경 없음 |
| 6 | Hex AI | hex.tech/blog | 변경 없음 | 블로그 최종 갱신: 03-24. 3/26-27 신규 포스트 없음 |

---

## 상세 내역

### 1. Salesforce Agentforce
- **URL**: https://www.salesforce.com/agentforce/
- **상태**: 변경 없음
- **비고**: Spring 2026 릴리즈의 주요 기능(Agentforce Builder, Agent Script, Agentforce Voice, Intelligent Context)은 이미 발표 완료 상태. 3/26-27 신규 발표 없음.

### 2. Microsoft Copilot Studio
- **URL**: https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new
- **상태**: 변경 없음 (3/26-27 해당)
- **March 2026 기록 항목**:
  - (Preview) **Work IQ** 도구 — Microsoft 365 Copilot과 에이전트를 Work IQ 서비스에 연결하여 M365 파일, 이메일, 회의, 채팅 등에서 실시간 업무 인사이트 접근 가능
- **비고**: 문서 최종 수정일 03-09. 3/26-27 추가 항목 없음. February 2026에 Claude Sonnet 4.5/Opus 4.6 모델 지원, prompt builder content moderation 등 주요 업데이트가 있었으나 기 기간 외.

### 3. Google Agentspace
- **URL**: https://cloud.google.com/agentspace/docs/release-notes
- **상태**: 변경 없음 (3/26-27 해당)
- **최근 항목**: 03-24 (Microsoft OneDrive 데이터 스토어 필터링 강화, Data Insights agent GA), 03-23 (DocuSign 데이터 커넥터)
- **비고**: 3/26-27 신규 항목 없음.

### 4. ThoughtSpot
- **URL**: https://www.thoughtspot.com/blog
- **상태**: 변경 없음 (3/26-27 해당)
- **최근 발표**:
  - 03-18: **Spotter for Industries** — Healthcare & Life Sciences 등 산업별 특화 에이전트. 도메인 컨텍스트를 시맨틱 레이어에 매핑
  - 03-13: **Spotter Semantics** — AI 네이티브 시맨틱 레이어. 자연어 쿼리→정확하고 추적 가능한 답변
  - 03-10: 2026 AI 성숙도 리서치 보고서
- **비고**: 3/26-27 신규 포스트 없음. 블로그 콘텐츠가 CSS만 반환되어 웹 검색으로 보완 확인.

### 5. Power BI
- **URL**: https://learn.microsoft.com/en-us/power-bi/fundamentals/desktop-latest-update
- **상태**: 변경 없음 (3/26-27 해당)
- **March 2026 업데이트 주요 내용** (03-17 게시):
  - **Translytical Task Flows (GA)** — 보고서 내에서 직접 데이터 수정/워크플로우 트리거 가능 (write-back)
  - **Modern Visual Defaults (Preview)** — Fluent 2 기반 새 비주얼 기본 테마
  - **Direct Lake in OneLake (GA)** — OneLake 직접 연결 성능 향상
  - **Custom Totals (Preview)** — 테이블/매트릭스 비주얼의 커스텀 합계 행
  - **Copilot UX 업데이트** — Copilot 패널 UI 개편, 진단 정보 포함 피드백
  - **DAX UDF (Preview)** — 사용자 정의 함수 개선 (256 파라미터, JSDoc, TMDL 구문 강조)
  - **TMDL View on Web (Preview)** — 브라우저에서 코드 기반 시맨틱 모델 편집
- **비고**: 월간 업데이트는 03-17에 게시 완료. 3/26-27 추가 변경 없음.

### 6. Hex AI
- **URL**: https://hex.tech/blog/
- **상태**: 변경 없음 (3/26-27 해당)
- **최근 포스트**:
  - ~03-24: "Introducing projects as context" (정확한 날짜 미확인)
  - 03-11: Hex-ClickHouse 파트너십 (chDB 4, 네이티브 Python 지원)
  - 02-26: "The AI Analytics Platform"
  - 01-26: "New in the Hex Claude Connector"
- **비고**: 블로그 최종 갱신 03-24. 3/26-27 신규 콘텐츠 없음.

---

## KonaI-Agent 적용 관련 참고 사항

3/26-27 기간에 신규 변경 사항이 없으므로 즉시 반영할 항목은 없다. 다만, 이번 스캔에서 이전 리포트(3/26)에 포함되지 않았던 엔터프라이즈 플랫폼 동향을 확인했으며, 다음 항목을 후속 리서치 후보로 기록한다:

### 후속 리서치 후보

1. **Power BI Translytical Task Flows** — 보고서 내 데이터 write-back 패턴. KonaI-Agent 라이브보드에서 "보기 → 수정" 전환 없이 인라인 데이터 편집 UI를 설계할 때 참고할 수 있는 GA 사례.

2. **Copilot Studio Work IQ** — M365 업무 맥락(파일, 이메일, 회의)을 에이전트에 실시간 연결하는 패턴. 엔터프라이즈 지식 소스 통합 설계에 참고.

3. **ThoughtSpot Spotter Semantics** — AI 네이티브 시맨틱 레이어를 통한 자연어 → 데이터 쿼리 신뢰성 확보. KonaI-Agent의 데이터 분석 에이전트가 시맨틱 레이어를 활용하는 방식에 참고.

4. **Copilot Studio의 Claude 모델 통합** — Copilot Studio가 Claude Opus 4.6/Sonnet 4.5를 prompt builder와 Computer Use에 통합. 멀티 모델 지원 아키텍처의 참고 사례 (경쟁사도 Anthropic 모델을 적극 채택하는 추세).

---

## Sources
- [Salesforce Agentforce](https://www.salesforce.com/agentforce/) — 제품 페이지 확인
- [Salesforce Agentforce 360 Announcements](https://www.salesforce.com/agentforce/what-is-new/?bc=OTH) — 신규 발표 페이지
- [MS Copilot Studio What's New](https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new) — 월별 변경 사항
- [Google Agentspace Release Notes](https://cloud.google.com/agentspace/docs/release-notes) — 릴리즈 노트
- [ThoughtSpot Spotter for Industries](https://www.globenewswire.com/news-release/2026/03/18/3258096/0/en/ThoughtSpot-Launches-Spotter-for-Industries.html) — 03-18 발표
- [ThoughtSpot Spotter Semantics](https://www.hpcwire.com/bigdatawire/this-just-in/thoughtspot-introduces-spotter-semantics-to-bring-trust-and-context-to-enterprise-ai/) — 03-13 발표
- [Power BI March 2026 Update](https://learn.microsoft.com/en-us/power-bi/fundamentals/desktop-latest-update) — March 2026 업데이트
- [Hex Blog](https://hex.tech/blog/) — 블로그 확인
- [Hex Notebook Agent Updates](https://hex.tech/blog/notebook-agent-updates/) — 에이전트 업데이트
