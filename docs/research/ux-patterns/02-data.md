# 엔터프라이즈 AI 에이전트 플랫폼 — 데이터 거버넌스 IA 심층 분석

> 리서치 대상: Snowflake, Databricks, ThoughtSpot, Dify, Microsoft Copilot Studio, OpenAI Frontier
> 작성 기준일: 2026-03-20
> 목적: "데이터" 메뉴 설계를 위한 경쟁/참조 서비스 IA 관찰 기록

---

## Snowflake

### 조사 항목 1: 데이터 소스 연결/관리가 메뉴 구조에서 어디에 위치하는가

Snowsight 좌측 내비게이션 메뉴는 2024~2025년 리뉴얼을 거쳐 기능 중심 그룹으로 재편되었다. 현재 메뉴 구조는 **Projects** (Worksheets, Notebooks, Streamlit, Dashboards, Native Apps), **Ingestion** (커넥터 및 데이터 적재 도구), **Transformation** (Dynamic Tables, Tasks), **AI & ML** (Cortex AI, Snowflake ML), **Monitoring**, **Marketplace**, **Catalog** (Database Explorer, Internal Marketplace), **Governance & security** (Tags & policies, Users & roles, Trust Center), **Compute**, **Admin** 등으로 구성된다. 데이터 소스 연결은 **Ingestion** 그룹 하위에 위치하며, Snowpipe·커넥터·파일 업로드 기능이 포함된다. 데이터 탐색(Database Explorer)은 **Catalog** 그룹에, 거버넌스는 **Governance & security** 그룹에 각각 분리되어 있다.

### 조사 항목 2: 데이터 카탈로그(테이블/컬럼 탐색) UI 구조

Snowflake Horizon Catalog이 카탈로그 역할을 수행한다. Snowsight에서 **Catalog → Database Explorer** 경로로 접근하며, 데이터베이스 → 스키마 → 테이블/뷰 순서의 트리 구조를 제공한다. 테이블을 선택하면 View Details(SQL 정의, 권한 관리), Columns 탭(컬럼명, 타입, 태그, 마스킹 정책), Data Preview 탭(최대 100행 미리보기)이 표시된다. Universal Search를 통해 자연어로 데이터·앱·모델을 검색할 수 있다. Cortex 기반 AI-powered Object Description 기능이 있어, 테이블·뷰·컬럼에 대해 LLM이 자동으로 설명을 생성하고 COMMENT 속성에 저장한다. 시맨틱 뷰(Semantic View)의 경우 Semantic Information 탭에서 logical table, relationship, fact, dimension, metric 정보를 확인할 수 있다.

### 조사 항목 3: 접근 제어 정책 관리 UX (테이블·행·컬럼 레벨)

Snowflake는 DAC(Discretionary Access Control)와 RBAC(Role-Based Access Control)를 결합한다. UI 경로는 **Governance & security → Users & roles → Roles**에서 역할을 생성·관리하며, Roles 그래프로 역할 계층 구조를 시각화할 수 있다. 테이블/뷰에 대한 권한 부여는 **Catalog → Database Explorer**에서 특정 오브젝트 선택 후 Privileges 섹션에서 수행한다. 행 수준 보안(Row Access Policy)은 SQL DDL로 정책을 생성한 뒤 테이블/뷰에 적용하며, 컬럼 수준 보안(Column Masking Policy)도 SQL로 정의 후 태그 기반 또는 직접 적용 방식으로 운영한다. Tag-Based Masking을 통해 태그에 마스킹 정책을 연결하면, 해당 태그가 부착된 모든 컬럼에 자동 적용된다.

### 조사 항목 4: 데이터 정책 생성 방식 (코드? UI? 자연어?)

Row Access Policy, Column Masking Policy 모두 **SQL DDL**로 생성한다 (`CREATE ROW ACCESS POLICY`, `CREATE MASKING POLICY`). 정책 적용(APPLY)은 SQL 또는 Snowsight UI 모두에서 가능하다. Tag 생성은 SQL(`CREATE TAG`)과 Snowsight UI 양쪽에서 지원된다. Data Classification은 Snowsight UI에서 몇 번의 클릭으로 자동 분류를 수행할 수 있으며, 분류 결과에 기반해 시스템 태그를 적용한다. 자연어 기반 정책 생성은 아직 제공되지 않으나, Copilot for Horizon Catalog이 발표되어 AI 기반 거버넌스 지원이 예고되어 있다.

### 조사 항목 5: Knowledge Base / RAG 데이터 관리 위치와 UI

Snowflake는 전통적 Knowledge Base/RAG 관리 메뉴를 별도로 두지 않는다. 대신 **AI & ML** 그룹 하위에 Cortex Search(벡터 유사도 검색), Cortex Analyst(데이터 분석), Cortex Agents(자연어 상호작용) 기능이 위치한다. Snowflake Intelligence는 구조화·비구조화 데이터를 통합하여 시맨틱 뷰와 검색 서비스를 기반으로 AI 에이전트가 데이터를 탐색하도록 한다. 비구조화 문서는 Stage에 저장 후 Cortex Search 서비스로 인덱싱하여 RAG 파이프라인을 구성한다.

### 조사 항목 6: 데이터 거버넌스와 데이터 소스 관리가 같은 메뉴인가 분리인가

**분리**되어 있다. 데이터 소스 관리(연결, 적재)는 **Ingestion** 메뉴에, 데이터 탐색은 **Catalog** 메뉴에, 거버넌스(태그, 정책, 사용자/역할 관리)는 **Governance & security** 메뉴에 각각 독립적으로 배치된다. 3개의 서로 다른 최상위 메뉴 그룹으로 나뉘어 있다.

### 조사 항목 7: 비기술 사용자가 데이터 거버넌스를 이해할 수 있는 수준의 추상화가 있는가

Governance & security → Tags & policies의 Dashboard 인터페이스는 태그/정책의 커버리지(비율), 사용 빈도를 시각적 대시보드로 보여주어 비기술 사용자도 현황을 파악할 수 있다. Data Classification은 UI 클릭만으로 민감 데이터를 자동 분류한다. 다만 정책 자체의 생성은 SQL이 필요하므로 비기술 사용자가 직접 정책을 작성하기는 어렵다. Snowflake Intelligence를 통한 자연어 데이터 질의는 비기술 사용자 접근성을 높이지만, 이는 거버넌스 관리보다는 데이터 소비 측면의 추상화이다.

### 조사 항목 8: 시맨틱 레이어/온톨로지 관리 UI가 있는가

Snowflake는 **Semantic View**라는 기능을 제공한다. Catalog → Database Explorer에서 시맨틱 뷰를 선택하면 Semantic Information 탭에서 logical table, relationship, fact, dimension, metric을 확인하고 "Edit in Cortex Analyst"로 편집할 수 있다. 이는 데이터 간 의미 관계를 정의하는 시맨틱 레이어 역할을 수행한다. 다만 Neo4j 같은 그래프 기반 온톨로지 관리 전용 UI는 제공하지 않는다. Horizon Catalog의 데이터 리니지 기능이 테이블 간 데이터 흐름 관계를 시각화한다.

### 조사 항목 9: 에이전트가 데이터를 탐색하는 경로를 시각화하거나 관리하는 화면이 있는가

Snowflake Intelligence의 에이전트 세션은 로그인한 사용자의 ID, 기본 역할, 기본 웨어하우스를 자동으로 상속받는다. 배경의 에이전트와 도구들도 사용자에게 부여된 권한을 그대로 상속받도록 설계되어 있다. 에이전트의 데이터 탐색 경로 자체를 시각화하는 전용 UI는 관찰되지 않으나, Access History(데이터 접근 이력)와 Query History를 통해 어떤 사용자/에이전트가 어떤 데이터에 접근했는지 사후 추적이 가능하다. Trust Center에서 보안 리스크를 모니터링하는 대시보드가 제공된다.

### 조사 항목 10: 다른 기능과의 연결 지점

- **Catalog → Database Explorer → Governance & security**: Tagged Objects에서 특정 행 선택 시 Database Explorer의 해당 테이블/컬럼 상세 페이지로 이동
- **Governance & security → Tags & policies → Catalog**: Dashboard에서 태그/정책 선택 시 Tagged Objects로 필터가 자동 적용되고, 다시 Database Explorer로 연결
- **AI & ML → Snowflake Intelligence → Governance**: 에이전트 세션이 사용자의 RBAC 역할을 상속하며, Row Access Policy와 Masking Policy가 에이전트 쿼리에도 적용
- **Projects → Worksheets/Notebooks → Catalog**: SQL 에디터에서 데이터베이스 오브젝트를 브라우징할 수 있는 사이드바 카탈로그 네비게이터 내장
- **Admin → Account Settings → Governance & security**: MFA 정책, 네트워크 정책 등 계정 레벨 보안 설정이 거버넌스와 연동
- **Monitoring → Query History → Catalog**: 쿼리 이력에서 참조한 테이블로의 역추적 가능

---

## Databricks

### 조사 항목 1: 데이터 소스 연결/관리가 메뉴 구조에서 어디에 위치하는가

Databricks 워크스페이스의 좌측 사이드바에서 **Catalog** 항목을 클릭하면 Catalog Explorer가 열린다. Catalog Explorer는 데이터 탐색, 거버넌스, 외부 데이터 소스 관리를 통합하는 허브 역할을 한다. Catalog Explorer 상단에 **Delta Sharing**, **Clean Rooms**, **External Data** 탭이 배치되어, 외부 데이터 소스 연결은 이 External Data 섹션에서 관리한다. 데이터 적재(파일 업로드, CSV→Delta Lake)는 좌측 사이드바의 **New** 메뉴에서 "Create or modify table from file upload" 또는 "Add data" UI로 접근한다. 사이드바의 다른 주요 항목으로는 Workspace, Repos, Workflows(Jobs), SQL Editor, Dashboards, ML/Experiments 등이 있다.

### 조사 항목 2: 데이터 카탈로그(테이블/컬럼 탐색) UI 구조

Catalog Explorer는 Unity Catalog의 3-level 네임스페이스(Catalog → Schema → Table/View/Volume/Model/Function)를 트리 구조로 탐색할 수 있다. 테이블 선택 시 Overview(소유자, 생성일, AI 생성 설명), Columns(컬럼명, 타입, 태그, 코멘트), Sample Data(미리보기), Details(스토리지 위치, 파일 포맷), Permissions(소유자, 권한 부여), Lineage(리니지 그래프), History(버전 히스토리), Quality(데이터 품질 모니터) 탭이 제공된다. Quick Access 섹션(Recents, Favorites, Popular)이 Catalog Explorer 진입 시 표시되어 빠른 탐색을 돕는다. Entity Relationship Diagram 기능이 테이블 간 PK/FK 관계를 그래프로 시각화한다. Notebook 및 SQL 에디터 내에서도 사이드바 카탈로그 네비게이터가 내장되어 코드 작성 중 테이블을 탐색할 수 있다.

### 조사 항목 3: 접근 제어 정책 관리 UX (테이블·행·컬럼 레벨)

Unity Catalog는 계층적 권한 모델을 제공한다. 계정 → 메타스토어 → 카탈로그 → 스키마 → 테이블 순서로 권한이 상속된다. Catalog Explorer UI에서 특정 오브젝트의 **Permissions** 탭을 통해 GRANT/REVOKE를 수행할 수 있다. 행·컬럼 레벨 보안은 두 가지 경로로 제공된다. 첫째, **Row Filters & Column Masks**는 개별 테이블에 UDF 기반 필터/마스크 로직을 적용하는 방식이다. 둘째, **ABAC(Attribute-Based Access Control)**는 2025년 Public Preview로 제공되며, Governed Tag를 기반으로 카탈로그/스키마/테이블 레벨에서 정책을 한 번 정의하면 하위 모든 오브젝트에 자동 상속되는 중앙집중적 접근 제어 모델이다. ABAC 정책은 태그 기반으로 동적으로 평가된다.

### 조사 항목 4: 데이터 정책 생성 방식 (코드? UI? 자연어?)

Row Filters, Column Masks, ABAC 정책 모두 **SQL DDL**로 생성한다. Catalog Explorer UI에서 테이블의 Permissions 탭을 통해 GRANT/REVOKE 같은 기본 권한 관리는 UI로 수행 가능하다. 태그 부착은 Catalog Explorer UI에서도 가능하다. Data Classification(자동 민감 데이터 분류)은 Governed Tag를 자동 부여하는 방식으로 작동한다. AI-generated Comments 기능은 카탈로그·테이블·컬럼에 대해 AI가 설명을 자동 생성하여 메타데이터를 풍부하게 한다. Databricks Assistant에 자연어로 리니지를 질문할 수 있다("show me downstream lineages", "who queries this table most often").

### 조사 항목 5: Knowledge Base / RAG 데이터 관리 위치와 UI

Databricks는 별도의 "Knowledge Base" 메뉴를 두지 않는다. 비구조화 데이터는 Unity Catalog의 **Volumes**(파일 기반 데이터 저장)로 관리하며, 이를 Catalog Explorer에서 탐색한다. RAG 파이프라인은 Mosaic AI Vector Search를 통해 벡터 인덱스를 생성하고, 이를 AI Playground 또는 Notebook에서 에이전트에 연결하는 방식이다. 이러한 구성 요소들이 사이드바의 Catalog(데이터), Workspace(노트북), Serving(모델 엔드포인트) 등 여러 메뉴에 분산되어 있다.

### 조사 항목 6: 데이터 거버넌스와 데이터 소스 관리가 같은 메뉴인가 분리인가

**통합**되어 있다. Catalog Explorer 하나의 인터페이스에서 데이터 탐색, 외부 데이터 소스 관리(External Data), 권한 관리(Permissions 탭), 리니지(Lineage 탭), 데이터 품질(Quality 탭), Delta Sharing, Clean Rooms을 모두 관리한다. 사이드바에서 **Catalog** 한 항목만 클릭하면 거버넌스와 데이터 소스 관리가 동일한 맥락에서 접근된다. 사용자/그룹 관리는 별도로 Admin Console(계정 관리)에서 수행한다.

### 조사 항목 7: 비기술 사용자가 데이터 거버넌스를 이해할 수 있는 수준의 추상화가 있는가

Catalog Explorer의 UI는 트리 탐색, 탭 기반 상세 정보, 시각적 리니지 그래프 등으로 비기술 사용자도 데이터 자산을 탐색할 수 있다. AI-generated Comments가 테이블과 컬럼에 자연어 설명을 자동 부여하여 이해도를 높인다. 자연어 데이터 탐색(Explore table data using an LLM) 기능이 Public Preview로 제공되어, 테이블 내용을 자연어로 질문할 수 있다. 다만 정책 생성 자체는 SQL 기반이므로 비기술 사용자가 직접 정책을 작성하기는 어렵다. ABAC의 태그 기반 정책은 한 번 설정되면 자동 상속되므로, 일상적 거버넌스 운영에서의 복잡성은 낮아진다.

### 조사 항목 8: 시맨틱 레이어/온톨로지 관리 UI가 있는가

Databricks는 **AI/BI Dashboard**의 Genie 기능을 통해 시맨틱 레이어를 구현한다. Genie는 자연어 질의를 SQL로 변환할 때 비즈니스 컨텍스트를 참조한다. Entity Relationship Diagram이 Catalog Explorer에서 테이블 간 PK/FK 관계를 시각화한다. 데이터 리니지 그래프가 테이블·컬럼 레벨의 데이터 흐름을 시각화하며, 최대 1년간의 리니지를 기간별로 조회할 수 있다. 별도의 온톨로지 편집기나 그래프 기반 관계 관리 UI는 관찰되지 않는다.

### 조사 항목 9: 에이전트가 데이터를 탐색하는 경로를 시각화하거나 관리하는 화면이 있는가

Databricks의 Mosaic AI Agent Framework에서 에이전트를 생성할 때, 에이전트가 접근 가능한 도구(함수, 벡터 검색 인덱스 등)를 Unity Catalog에 등록한다. 에이전트의 데이터 접근은 Unity Catalog의 권한 모델을 따른다. 에이전트의 실행 경로를 시각화하는 전용 UI는 MLflow의 Trace 기능을 통해 제공되며, 에이전트가 어떤 도구를 호출하고 어떤 데이터를 참조했는지 추적할 수 있다. 시스템 테이블(audit log)을 통해 에이전트의 데이터 접근 이력을 사후 분석할 수 있다.

### 조사 항목 10: 다른 기능과의 연결 지점

- **Catalog Explorer → Notebook/SQL Editor**: 카탈로그에서 테이블 선택 후 "Open in SQL Editor" 또는 사이드바 카탈로그 네비게이터에서 직접 참조
- **Catalog Explorer (Lineage 탭) → Notebook/Job/Dashboard**: 리니지 그래프에서 노드 클릭 시 해당 노트북·잡·대시보드로 이동
- **Catalog Explorer (Permissions 탭) → Admin Console**: 사용자·그룹 관리는 Admin Console에서 수행, 권한 부여는 Catalog Explorer에서 수행
- **Workflows(Jobs) → Catalog**: 잡이 참조하는 테이블의 리니지가 자동 캡처
- **ML/Serving → Catalog**: 모델이 Unity Catalog에 등록되어 카탈로그에서 관리, 모델 리니지도 추적
- **Dashboards → Catalog**: 대시보드가 참조하는 데이터 소스의 리니지가 캡처

---

## ThoughtSpot

### 조사 항목 1: 데이터 소스 연결/관리가 메뉴 구조에서 어디에 위치하는가

ThoughtSpot의 상단 내비게이션 바에 **Data** 탭이 존재한다. Data 탭에서 Connections, Tables, Worksheets, Views를 관리한다. 데이터 소스 연결(Connection)은 Data 탭 내 Connections 섹션에서 생성하며, Snowflake·Redshift·BigQuery·Databricks 등 클라우드 데이터 웨어하우스에 직접 연결한다. Connection 생성 시 연결할 데이터베이스·스키마·테이블을 선택하는 UI가 제공된다. 별도로 좌측 사이드바의 **+ Create new** 버튼에서 Worksheet, Connection 등을 생성할 수도 있다. ThoughtSpot은 "제로 카피" 아키텍처를 표방하며, CDW(클라우드 데이터 웨어하우스)에 직접 쿼리를 전송하는 방식을 기본으로 한다.

### 조사 항목 2: 데이터 카탈로그(테이블/컬럼 탐색) UI 구조

Data 탭에서 Tables, Worksheets, Views의 목록을 확인할 수 있다. 테이블을 선택하면 컬럼 목록(이름, 타입, 설명), 조인 관계, 데이터 미리보기가 표시된다. Worksheet 생성 UI에서는 소스 테이블을 추가하고, 컬럼을 선택·이름 변경하며, 조인 관계를 설정하는 시각적 인터페이스가 제공된다. ThoughtSpot은 SpotterModel이라는 AI 기반 모델링 에이전트를 통해 자연어로 데이터 모델을 설명하면 테이블 관계·차원·측정값을 자동으로 매핑하고, 메타데이터를 자동 생성하는 기능을 제공한다. dbt 통합을 통해 dbt 모델을 자동으로 ThoughtSpot Worksheet로 변환할 수 있다. 외부 데이터 카탈로그 도구(Alation, Atlan 등)와의 통합도 지원한다.

### 조사 항목 3: 접근 제어 정책 관리 UX (테이블·행·컬럼 레벨)

ThoughtSpot의 보안 모델은 Object-Level Security(OLS), Column-Level Security(CLS), Row-Level Security(RLS)의 3계층으로 구성된다. **OLS**: Data 탭에서 테이블/워크시트를 선택 후 Share 기능으로 사용자·그룹에게 Can View 또는 Can Edit 권한을 부여한다. **CLS**: 테이블 공유 시 "Entire Table" 대신 "Specific Columns"를 선택하면, 특정 컬럼만 사용자/그룹에게 공유할 수 있다. 이 UI는 Share 다이얼로그 내에서 컬럼 체크박스로 제어한다. **RLS**: 테이블 상세 페이지에서 Rule 형태의 수식을 작성하여 행 필터를 설정한다. `ts_groups` 또는 `ts_username` 함수를 사용해 현재 로그인한 사용자의 그룹/이름에 기반한 동적 필터링을 구현한다. 기본 모드는 Permissive Security(공유 오브젝트의 데이터를 상위 오브젝트 권한과 무관하게 볼 수 있음)이며, Advanced Security Mode(strict CLS)를 활성화하면 부모 오브젝트까지 명시적 권한이 필요하다.

### 조사 항목 4: 데이터 정책 생성 방식 (코드? UI? 자연어?)

OLS와 CLS는 **UI**(Share 다이얼로그)에서 설정한다. RLS는 **수식 기반 UI**(Rule Assistant)로 설정하며, ThoughtSpot 고유의 수식 언어(예: `ts_groups = "6"`, `ts_username = "jhulbert"`)를 사용한다. SQL이 아닌 ThoughtSpot 수식이므로 학습 곡선이 존재한다. CDW 수준의 보안은 "passthrough security"로 CDW의 기존 접근 제어를 그대로 상속한다. SpotterModel이 자연어로 데이터 모델링을 지원하지만, 보안 정책 생성 자체를 자연어로 수행하는 기능은 관찰되지 않았다.

### 조사 항목 5: Knowledge Base / RAG 데이터 관리 위치와 UI

ThoughtSpot은 BI/분석 플랫폼으로서 별도의 Knowledge Base/RAG 관리 기능을 제공하지 않는다. 자연어 검색(Search) 및 AI 기반 인사이트(SpotIQ, Sage)가 핵심이지만, 이는 CDW의 구조화된 데이터에 직접 쿼리하는 방식이다. 비구조화 문서 기반 RAG 관리 기능은 관찰되지 않았다.

### 조사 항목 6: 데이터 거버넌스와 데이터 소스 관리가 같은 메뉴인가 분리인가

**통합적**이다. Data 탭 하나에서 Connection 관리, 테이블 탐색, Worksheet 관리, 보안 설정(Share/RLS)을 모두 수행한다. 다만 사용자·그룹 관리는 별도의 **Admin Console**(Admin 탭)에서 수행한다. 데이터 소스와 데이터 보안이 Data 탭 내에서 같은 맥락에 있지만, 접근 제어 설정은 각 오브젝트의 Share 다이얼로그 또는 상세 페이지에 분산되어 있어 통합 거버넌스 대시보드는 관찰되지 않았다.

### 조사 항목 7: 비기술 사용자가 데이터 거버넌스를 이해할 수 있는 수준의 추상화가 있는가

Share 다이얼로그를 통한 OLS/CLS 설정은 직관적이며, 비기술 사용자도 "누구에게 어떤 데이터를 공유할지" 수준에서 이해 가능하다. 다만 RLS의 수식 기반 설정은 기술적 이해가 필요하다. SpotterModel이 자연어로 데이터 모델을 자동 구축해주므로, 모델링 측면에서는 비기술 사용자 접근성이 높다. Worksheet는 비기술 사용자가 검색에 사용할 수 있는 "비즈니스 친화적" 뷰 역할을 하며, 컬럼명을 사람이 읽기 쉬운 형태로 자동 변환(예: customer_age → Customer Age)한다.

### 조사 항목 8: 시맨틱 레이어/온톨로지 관리 UI가 있는가

ThoughtSpot의 **Worksheet**가 사실상 시맨틱 레이어 역할을 수행한다. Worksheet에서 테이블 간 조인 관계를 정의하고, 컬럼에 비즈니스 친화적 이름·설명·포맷을 부여하며, 수식(Formulas)으로 파생 측정값을 생성한다. SpotterModel은 자연어로 시맨틱 모델 구축을 지원한다. dbt, Looker 등 외부 모델링 도구의 모델도 Import 가능하다. 그래프 기반 온톨로지 편집 UI는 제공되지 않는다.

### 조사 항목 9: 에이전트가 데이터를 탐색하는 경로를 시각화하거나 관리하는 화면이 있는가

ThoughtSpot의 AI 에이전트(Spotter)는 Worksheet를 기반으로 자연어 질의를 SQL로 변환하여 CDW에 쿼리한다. 에이전트의 탐색 경로를 시각화하는 전용 UI는 관찰되지 않았다. Spotter가 생성한 SQL은 사용자에게 표시되어 어떤 쿼리가 실행되었는지 확인할 수 있다.

### 조사 항목 10: 다른 기능과의 연결 지점

- **Data (Worksheet) → Search/Spotter**: Worksheet가 자연어 검색의 데이터 소스가 됨
- **Data (Table) → Liveboard/Answer**: 테이블/워크시트 기반으로 시각화(Answer)를 생성하고 Liveboard에 고정
- **Data (Table, RLS) → Liveboard**: RLS가 Liveboard에 자동 적용되어 같은 Liveboard를 다른 사용자가 볼 때 다른 데이터가 표시됨
- **Admin Console (Groups) → Data (RLS)**: RLS 규칙이 그룹을 참조하므로, 그룹 관리가 데이터 접근 범위를 결정
- **Data (Connection) → Data (Table/Worksheet)**: 커넥션이 테이블의 소스이며, 테이블이 워크시트의 소스

---

## Dify

### 조사 항목 1: 데이터 소스 연결/관리가 메뉴 구조에서 어디에 위치하는가

Dify의 메인 내비게이션은 상단에 **Studio**(앱 빌더), **Knowledge**(지식 베이스), **Tools**(도구/플러그인), **Plugins**(마켓플레이스) 등으로 구성된다. 데이터 소스 설정은 두 곳에서 관리된다. 첫째, **Knowledge** 메뉴에서 Knowledge Base를 생성할 때 데이터 소스(파일 업로드, 웹 크롤링, Firecrawl API, Tavily 등)를 선택한다. 둘째, **Settings → Data Source** 경로에서 API 키 설정(예: Tavily API Key)을 관리한다. Knowledge Pipeline(v1.9.0+)에서는 비주얼 캔버스에서 데이터 소스 노드를 배치하여 데이터 인제스트 파이프라인을 구성한다.

### 조사 항목 2: 데이터 카탈로그(테이블/컬럼 탐색) UI 구조

Dify는 전통적인 데이터 카탈로그(테이블/컬럼 브라우저)를 제공하지 않는다. **Knowledge** 메뉴에서 Knowledge Base 목록을 확인하고, 각 Knowledge Base 내에서 업로드된 문서 목록과 청크(Chunk) 단위의 내용을 탐색한다. 청크별로 메타데이터, 임베딩 상태, 검색 적중률 등을 확인할 수 있다. v1.1.0에서 메타데이터 기반 필터 검색이 추가되었다. 구조화된 테이블/컬럼 수준의 탐색 UI는 제공되지 않으며, 비구조화 문서 중심의 RAG 데이터 관리 인터페이스이다.

### 조사 항목 3: 접근 제어 정책 관리 UX (테이블·행·컬럼 레벨)

Dify는 테이블·행·컬럼 레벨의 접근 제어를 제공하지 않는다. Knowledge Base 수준에서의 접근 제어는 워크스페이스 멤버십 기반으로 관리된다. Dify Enterprise 버전에서는 팀/워크스페이스별 권한 분리가 지원된다. 개별 Knowledge Base를 특정 앱에만 연결하여 데이터 노출 범위를 제한할 수 있다. 앱을 배포할 때 인증 설정(API Key, OAuth)으로 최종 사용자의 접근을 제어한다.

### 조사 항목 4: 데이터 정책 생성 방식 (코드? UI? 자연어?)

Dify에서의 데이터 정책 설정은 **UI** 기반이다. Knowledge Base 생성 시 청킹 전략, 임베딩 모델, 인덱싱 방식, 검색 모드(벡터/키워드/하이브리드), top-k, 리랭커를 UI에서 설정한다. Knowledge Pipeline에서는 비주얼 캔버스에서 노드를 드래그 앤 드롭하여 파싱→청킹→임베딩 파이프라인을 구성한다. 코드 기반 정책 정의(SQL, 코드)나 자연어 기반 정책 생성은 관찰되지 않았다.

### 조사 항목 5: Knowledge Base / RAG 데이터 관리 위치와 UI

**Knowledge** 최상위 메뉴가 전용 RAG 관리 공간이다. Knowledge Base 생성 → 데이터 소스 선택 → 파싱/청킹 설정 → 임베딩/인덱싱 → 검색 테스트의 전체 RAG 파이프라인을 이 메뉴에서 관리한다. Knowledge Pipeline(v1.9.0+)은 Workflow 캔버스와 유사한 비주얼 에디터로, 각 RAG 처리 단계(데이터 소스→파싱→청킹→임베딩→저장)를 노드로 표현하고 연결한다. 템플릿(간단 문서, 긴 기술 매뉴얼, 복잡한 PDF, 구조화된 테이블용 등)이 제공된다. 멀티모달 Knowledge Base(텍스트+이미지를 단일 시맨틱 공간에 통합)가 지원된다.

### 조사 항목 6: 데이터 거버넌스와 데이터 소스 관리가 같은 메뉴인가 분리인가

Dify에는 명시적인 "데이터 거버넌스" 메뉴가 존재하지 않는다. **Knowledge** 메뉴가 데이터 소스 연결과 RAG 데이터 관리를 통합하며, 접근 제어는 **Settings**(워크스페이스 멤버 관리)와 앱별 인증 설정에 분산되어 있다. 거버넌스 개념이 제품 내에서 별도 기능으로 분리되어 있지 않다.

### 조사 항목 7: 비기술 사용자가 데이터 거버넌스를 이해할 수 있는 수준의 추상화가 있는가

Knowledge Base 생성은 파일 업로드 + 몇 가지 설정 선택으로 가능하여 비기술 사용자도 접근 가능하다. Knowledge Pipeline의 비주얼 캔버스는 각 처리 단계를 시각적 노드로 표현하여 이해도를 높인다. 다만 청킹 전략, 임베딩 모델 선택, 검색 모드 설정 등은 RAG에 대한 기술적 이해를 전제로 한다. 엔터프라이즈 수준의 거버넌스 대시보드(누가 어떤 데이터에 접근했는지 현황 파악)는 관찰되지 않았다.

### 조사 항목 8: 시맨틱 레이어/온톨로지 관리 UI가 있는가

Dify는 시맨틱 레이어나 온톨로지 관리 UI를 제공하지 않는다. Knowledge Base는 비구조화 문서의 벡터 인덱스 기반 검색에 초점을 맞추고 있으며, 데이터 간 의미 관계를 정의하는 별도 인터페이스는 관찰되지 않았다. 워크플로우 캔버스에서 여러 Knowledge Base를 조합하여 사용할 수 있으나, 이는 데이터 흐름 정의이지 의미 관계 정의는 아니다.

### 조사 항목 9: 에이전트가 데이터를 탐색하는 경로를 시각화하거나 관리하는 화면이 있는가

Dify의 Workflow 에디터에서 **Shift+클릭** 시 선택한 노드의 관련 노드와 연결이 하이라이트되고 나머지가 흐려지는 관계 패널(Relationships Panel) 기능이 있어, 에이전트의 데이터 흐름을 시각적으로 추적할 수 있다. 앱 실행 시 각 노드의 입출력을 개별적으로 검사할 수 있는 디버깅 경험이 제공된다. Langfuse 통합을 통한 관찰성(Observability) 기능으로 에이전트의 실행 트레이스를 추적할 수 있다.

### 조사 항목 10: 다른 기능과의 연결 지점

- **Knowledge → Studio (App Builder)**: 앱의 Workflow 또는 Chatflow에 Knowledge Retrieval 노드를 추가하여 Knowledge Base를 참조
- **Knowledge → Workflow (Knowledge Pipeline)**: Knowledge Pipeline에서 데이터 인제스트 파이프라인을 시각적으로 구성
- **Studio (App) → Settings (Authentication)**: 앱 배포 시 인증 설정으로 최종 사용자 접근 제어
- **Tools/Plugins → Studio (App)**: 외부 도구(API, 검색 엔진 등)를 앱의 에이전트가 사용할 도구로 등록
- **Settings → Data Source → Knowledge**: API 키 설정(Tavily 등)이 Knowledge Base 생성 시 데이터 소스 옵션에 반영

---

## Microsoft Copilot Studio

### 조사 항목 1: 데이터 소스 연결/관리가 메뉴 구조에서 어디에 위치하는가

Copilot Studio에서 에이전트(Copilot)를 생성할 때 **Knowledge** 섹션에서 데이터 소스를 추가한다. Knowledge Source로 SharePoint, OneDrive, 공개 웹사이트, Dataverse, 파일 업로드 등을 연결한다. 이는 에이전트 편집 화면 내부에 위치한다. 데이터 연결 자체(Connector)는 Power Platform 생태계의 커넥터 프레임워크를 공유하며, 커넥터 관리는 **Power Platform Admin Center**에서 수행한다. Copilot Studio의 에이전트 편집 화면에는 Topics(대화 흐름), Knowledge(지식 소스), Actions(액션/플로우), Channels(배포 채널) 등의 탭이 있다.

### 조사 항목 2: 데이터 카탈로그(테이블/컬럼 탐색) UI 구조

Copilot Studio 자체에는 전통적인 데이터 카탈로그가 존재하지 않는다. Knowledge Source를 추가할 때 SharePoint 사이트나 특정 URL을 지정하는 수준이다. Dataverse 테이블을 참조할 때는 Dataverse의 테이블/컬럼 구조를 Power Apps의 데이터 관리 인터페이스에서 탐색한다. Power Platform 생태계 전체로 보면, Dataverse의 테이블 디자이너(Power Apps → Tables)에서 테이블·컬럼·관계를 관리할 수 있다.

### 조사 항목 3: 접근 제어 정책 관리 UX (테이블·행·컬럼 레벨)

Copilot Studio의 접근 제어는 여러 계층에서 관리된다. 첫째, **에이전트 수준 인증**: 기본적으로 Microsoft Entra ID 인증이 활성화되어 있어, 에이전트와 대화하는 사용자의 ID가 확인된다. 둘째, **DLP(Data Loss Prevention) 정책**: Power Platform Admin Center에서 설정하며, 커넥터를 Business / Non-business / Blocked 그룹으로 분류하여 데이터 흐름을 통제한다. 같은 그룹 내 커넥터 간에만 데이터 교환이 허용된다. 셋째, **Knowledge Source 제한**: DLP 정책으로 특정 유형의 Knowledge Source(SharePoint, 공개 웹사이트 등)의 사용을 차단할 수 있다. 넷째, **환경(Environment) 격리**: Power Platform 환경 단위로 에이전트와 데이터를 격리한다. 테이블·행·컬럼 레벨의 세밀한 접근 제어는 Copilot Studio 자체보다는 Dataverse의 보안 모델(역할 기반 보안, 레코드 수준 보안, 필드 수준 보안)에 의존한다.

### 조사 항목 4: 데이터 정책 생성 방식 (코드? UI? 자연어?)

DLP 정책은 **Power Platform Admin Center의 UI**에서 생성한다. 커넥터를 드래그 앤 드롭 또는 목록에서 선택하여 Business/Non-business/Blocked 그룹에 배치하는 방식이다. 엔드포인트 필터링으로 특정 SharePoint 사이트 URL이나 웹사이트를 허용/차단할 수 있다. PowerShell cmdlet을 통한 프로그래매틱 관리도 가능하다. 자연어 기반 정책 생성은 관찰되지 않았다. Copilot Studio 에이전트 편집 화면에서는 인증 방식 선택, Knowledge Source 추가 등이 UI 기반으로 이루어진다.

### 조사 항목 5: Knowledge Base / RAG 데이터 관리 위치와 UI

에이전트 편집 화면의 **Knowledge** 탭이 RAG 데이터 관리 위치이다. SharePoint 사이트, OneDrive 파일, 공개 웹사이트 URL, Dataverse, 업로드 파일을 Knowledge Source로 추가한다. Knowledge Source 추가 시 인덱싱이 자동으로 수행되며, Copilot이 사용자 질문에 답변할 때 이 지식을 검색하여 활용한다. 청킹·임베딩 전략 등의 세부 설정을 사용자가 직접 제어하는 UI는 관찰되지 않으며, 플랫폼이 자동 관리한다.

### 조사 항목 6: 데이터 거버넌스와 데이터 소스 관리가 같은 메뉴인가 분리인가

**분리**되어 있으며, 여러 관리 센터에 걸쳐 분산되어 있다. 데이터 소스 연결은 Copilot Studio 에이전트 편집 화면(Knowledge 탭)에서, DLP 정책은 Power Platform Admin Center에서, Microsoft 365 관련 거버넌스(감수성 레이블, Purview DLP)는 Microsoft 365 Admin Center / Microsoft Purview에서, SharePoint 콘텐츠 거버넌스는 SharePoint Admin Center에서 각각 관리한다. 이러한 분산 구조는 Power Platform 생태계의 특성이다.

### 조사 항목 7: 비기술 사용자가 데이터 거버넌스를 이해할 수 있는 수준의 추상화가 있는가

Copilot Studio의 에이전트 빌더 UI는 로우코드 도구로, 비기술 사용자(시민 개발자)가 에이전트를 만들 수 있도록 설계되었다. Knowledge Source 추가는 SharePoint 사이트 URL을 붙여넣는 수준으로 간단하다. 다만 DLP 정책 관리는 IT 관리자 대상이며, Power Platform Admin Center의 커넥터 분류 UI는 비기술 사용자에게는 복잡할 수 있다. 에이전트 빌더에게는 DLP 위반 시 명확한 에러 메시지와 경고가 표시되어, 왜 특정 기능이 차단되었는지 이해할 수 있다. Copilot Studio에서 보안 기본값이 변경될 때 경고를 표시하는 "Security Warning" 기능이 있다.

### 조사 항목 8: 시맨틱 레이어/온톨로지 관리 UI가 있는가

Copilot Studio 자체에는 시맨틱 레이어/온톨로지 관리 UI가 없다. Dataverse의 테이블 간 관계(Relationship) 정의가 데이터 모델링 역할을 수행하며, 이는 Power Apps의 테이블 디자이너에서 관리된다. Microsoft 365 Copilot 생태계 전체로 보면, Microsoft Graph가 조직 데이터 간 의미 관계를 표현하는 역할을 하지만, 이를 직접 편집하는 UI는 Copilot Studio에 포함되어 있지 않다.

### 조사 항목 9: 에이전트가 데이터를 탐색하는 경로를 시각화하거나 관리하는 화면이 있는가

Copilot Studio 에이전트의 대화 흐름은 **Topics** 에디터에서 시각적 캔버스로 설계한다. 에이전트가 Knowledge Source를 검색하는 과정은 "Generative Answers" 노드로 표현된다. 에이전트 실행 시 **Test** 패널에서 각 턴의 처리 과정(어떤 토픽이 트리거되었는지, 어떤 Knowledge Source가 검색되었는지)을 추적할 수 있다. Azure Application Insights 통합으로 에이전트의 실행 로그와 분석 데이터를 수집할 수 있다. Microsoft Purview의 감사 로그에서 Copilot 상호작용 기록을 추적할 수 있다.

### 조사 항목 10: 다른 기능과의 연결 지점

- **Copilot Studio (Knowledge) → SharePoint/OneDrive**: Knowledge Source로 연결된 SharePoint 사이트의 콘텐츠를 검색
- **Copilot Studio (Actions) → Power Automate**: 에이전트가 Power Automate 플로우를 트리거하여 외부 시스템과 상호작용
- **Copilot Studio (Channels) → Microsoft Teams/M365 Copilot**: 에이전트를 Teams 채널이나 M365 Copilot에 배포
- **Power Platform Admin Center (DLP) → Copilot Studio**: DLP 정책이 에이전트의 커넥터 사용과 Knowledge Source 접근을 제한
- **Microsoft Purview (Sensitivity Labels, DLP) → M365 Copilot**: 감수성 레이블이 적용된 문서는 Copilot 응답에서 해당 레이블의 보안 정책을 상속
- **SharePoint Admin Center (SAM) → Copilot**: Oversharing 관리, 비활성 사이트 정리 등이 Copilot이 "보는" 콘텐츠 범위에 영향

---

## OpenAI Frontier

### 조사 항목 1: 데이터 소스 연결/관리가 메뉴 구조에서 어디에 위치하는가

OpenAI Frontier는 2026년 2월에 출시되어 아직 제한된 고객(Uber, State Farm, Intuit, Thermo Fisher 등)에게만 제공되고 있다. 공개된 제품 UI 구조의 상세 정보는 제한적이다. Frontier의 핵심 구성 요소로 **Business Context**, **Agent Execution**, **Evaluation & Optimization**, **Enterprise Security & Governance**의 4개 영역이 발표되었다. Business Context가 데이터 소스 연결 역할을 수행하며, 데이터 웨어하우스·CRM·티켓팅 도구·내부 애플리케이션을 연결하여 AI 에이전트에게 공유 비즈니스 컨텍스트를 제공한다. 이 연결은 오픈 표준 기반으로, 기존 인프라를 재구축하지 않고 통합할 수 있도록 설계되었다고 공개되었다.

### 조사 항목 2: 데이터 카탈로그(테이블/컬럼 탐색) UI 구조

Frontier의 데이터 카탈로그에 해당하는 UI는 공개 문서에서 구체적으로 확인되지 않았다. Business Context가 "시맨틱 레이어"로 설명되며, 에이전트가 참조할 수 있는 데이터 자산의 맵을 제공한다고 발표되었으나, 이를 사용자가 탐색하는 구체적 UI 구조는 아직 공개되지 않았다. OpenAI 내부에서는 데이터 에이전트 운영을 위해 6개 레이어의 컨텍스트(테이블 사용 패턴, 인간 어노테이션, 코드 분석, 기관 지식, 메모리, 런타임 검증)를 구축했다고 알려져 있다.

### 조사 항목 3: 접근 제어 정책 관리 UX (테이블·행·컬럼 레벨)

Frontier는 **Enterprise Identity & Access Management(IAM)**을 핵심으로 내세운다. 에이전트에게 고유 ID를 부여하고, 각 에이전트의 접근 범위를 태스크에 필요한 수준으로만 스코핑(scoping)하여 과잉 권한 부여를 방지한다. 에이전트의 모든 액션은 가시적이고 감사 가능하도록 설계되었다. 기존 엔터프라이즈 IAM 시스템과 통합된다고 발표되었다. 테이블·행·컬럼 레벨의 세밀한 접근 제어 UI의 구체적 형태는 공개되지 않았으나, "explicit permissions"과 "auditable actions"가 내장되어 있다고 설명되었다.

### 조사 항목 4: 데이터 정책 생성 방식 (코드? UI? 자연어?)

구체적인 정책 생성 UX는 공개되지 않았다. Frontier는 "Forward Deployed Engineers"를 고객 팀에 파견하여 아키텍처 설계, 거버넌스 운영화, 프로덕션 에이전트 실행을 지원하는 모델을 채택하고 있어, 초기 단계에서는 엔지니어링 지원이 결합된 형태로 정책이 구성될 것으로 보인다.

### 조사 항목 5: Knowledge Base / RAG 데이터 관리 위치와 UI

Frontier의 에이전트는 "파일 작업, 코드 실행, 도구 사용"이 가능하다고 발표되었으며, 에이전트가 작동하면서 메모리를 구축하여 과거 상호작용을 유용한 컨텍스트로 변환한다. 이 메모리 시스템이 RAG의 역할을 일부 수행하는 것으로 보이지만, 별도의 Knowledge Base 관리 UI는 공개되지 않았다. Business Context가 구조화된 데이터 소스와 비구조화 지식을 통합하는 역할을 한다.

### 조사 항목 6: 데이터 거버넌스와 데이터 소스 관리가 같은 메뉴인가 분리인가

Frontier의 4개 핵심 영역 구분에 따르면, 데이터 소스 연결은 **Business Context** 영역에, 보안·거버넌스는 **Enterprise Security & Governance** 영역에 위치한다. 개념적으로는 분리되어 있으나, 양자가 통합적으로 작동하도록 설계되었다고 설명된다. 구체적인 메뉴 구조는 공개되지 않았다.

### 조사 항목 7: 비기술 사용자가 데이터 거버넌스를 이해할 수 있는 수준의 추상화가 있는가

Frontier는 "기술·비기술 팀 모두가 AI 코워커를 고용할 수 있다"고 표현하며, 에이전트를 ChatGPT 인터페이스, Atlas 워크플로우, 기존 비즈니스 애플리케이션 등 다양한 인터페이스에서 사용할 수 있다고 설명한다. 에이전트 온보딩 과정을 신규 직원 온보딩에 비유하여, 비기술 관리자도 에이전트에게 컨텍스트, 권한, 피드백을 부여하는 개념을 이해할 수 있도록 프레이밍하고 있다. 실제 UI의 추상화 수준은 아직 확인할 수 없다.

### 조사 항목 8: 시맨틱 레이어/온톨로지 관리 UI가 있는가

Frontier의 **Business Context**가 "엔터프라이즈를 위한 시맨틱 레이어"라고 공식 설명된다. 사일로된 데이터 웨어하우스, CRM, 티켓팅 도구, 내부 앱을 연결하여 정보가 어떻게 흐르고, 어디에서 의사결정이 이루어지며, 어떤 결과가 중요한지를 에이전트가 이해하도록 한다. 다만 여러 독립 분석에서 지적하듯, Frontier가 제공하는 것은 "연결 기반 컨텍스트(connectivity-based context)"로, 시스템 간 데이터를 찾고 접근하는 능력이다. "revenue"와 같은 비즈니스 용어의 정의와 계산 규칙을 표준화하는 전통적 시맨틱 레이어(governed translation layer)와는 구별된다. 온톨로지 편집 UI의 구체적 형태는 공개되지 않았다.

### 조사 항목 9: 에이전트가 데이터를 탐색하는 경로를 시각화하거나 관리하는 화면이 있는가

Frontier는 "built-in monitoring and detailed logs"로 에이전트의 액션에 대한 명확한 추적 가능성, 책임 소재, 통제를 제공한다고 발표했다. **Evaluation & Optimization** 영역에서 무엇이 작동하고 무엇이 작동하지 않는지를 보여주는 내장 도구가 포함된다고 설명되었다. 구체적인 시각화 UI는 공개되지 않았으나, 에이전트의 실행 경로와 데이터 접근을 감사할 수 있는 기능이 핵심 가치 제안에 포함되어 있다.

### 조사 항목 10: 다른 기능과의 연결 지점

- **Business Context → Agent Execution**: 연결된 비즈니스 시스템의 데이터를 에이전트가 실행 환경에서 참조
- **Agent Execution → Evaluation & Optimization**: 에이전트 실행 결과가 평가·최적화 루프로 피드백
- **Enterprise Security & Governance → Agent Execution**: IAM 정책과 권한이 에이전트의 런타임 행동을 제한
- **Business Context → 외부 에이전트 앱**: 오픈 표준 기반으로 OpenAI 에이전트뿐 아니라 서드파티 에이전트(Google, Microsoft, Anthropic 등)도 같은 비즈니스 컨텍스트를 참조 가능
- **ChatGPT / Atlas → Agent Execution**: ChatGPT 인터페이스 또는 Atlas 워크플로우를 통해 에이전트와 상호작용
- **Frontier Partner 앱 → Business Context**: Abridge, Clay, Harvey, Sierra 등 파트너 앱이 Frontier의 컨텍스트를 활용

---

## 시각 자료 모음

### Snowflake

- [Snowsight 내비게이션 메뉴 공식 문서](https://docs.snowflake.com/en/user-guide/ui-snowsight-navigation) — Snowsight의 전체 메뉴 그룹(Projects, Ingestion, Transformation, AI & ML, Catalog, Governance & security 등)의 구조를 확인할 수 있는 공식 문서. 메뉴 재편 후의 최신 IA를 파악하는 데 필수.
- [Snowsight Quick Tour](https://docs.snowflake.com/en/user-guide/ui-snowsight-quick-tour) — Snowsight 각 기능 영역별 설명이 포함된 공식 가이드. 거버넌스 기능이 어디에 위치하는지 전체 맥락에서 확인 가능.
- [Snowflake Governance Dashboard 블로그 (Medium)](https://medium.com/snowflake/data-governance-with-tag-based-masking-policy-governance-dashboard-f7f441581128) — 태그 기반 마스킹 정책과 Snowsight Governance Dashboard의 실제 화면 스크린샷 포함. Dashboard와 Tagged Objects 인터페이스의 실제 모습 확인 가능.
- [Snowsight에서 태그 모니터링 (Medium)](https://krkannan.medium.com/snowflake-monitoring-tags-with-snowsight-38f9b9a9969e) — Tags & Policies Dashboard의 Coverage/Prevalence 메트릭 실제 화면 포함.
- [Snowflake Data Governance from Snowsight (Daanalytics)](https://daanalytics.nl/snowflake-data-governance-directly-from-snowsight/) — 자동 Data Classification과 Governance Summary Dashboard를 Snowsight UI에서 수행하는 과정의 스크린샷 포함.
- [Snowflake Horizon Catalog 공식 문서](https://docs.snowflake.com/en/user-guide/snowflake-horizon) — Horizon Catalog의 아키텍처와 기능 범위를 이해하기 위한 공식 자료.
- [Object Tagging 가이드 (Select.dev)](https://select.dev/posts/snowflake-object-tags-guide) — Snowsight에서 Governance 대시보드로 이동하는 경로와 태그 필터링 화면 스크린샷 포함.

### Databricks

- [Databricks Catalog Explorer 공식 문서](https://docs.databricks.com/aws/en/catalog-explorer/) — Catalog Explorer의 기능 범위(데이터 탐색, 권한 관리, AI 기반 탐색 도구)를 설명하는 공식 자료.
- [Catalog Explorer 리뉴얼 블로그](https://www.databricks.com/blog/accelerating-discovery-unity-catalog-revamped-catalog-explorer) — Quick Access, 사이드바 업데이트, Entity Relationship Diagram, 리니지 기간별 조회 등 UI 변경사항의 스크린샷과 설명 포함. 실제 UI 구성을 파악하는 데 가장 유용한 자료.
- [Unity Catalog Data Lineage 데모 비디오](https://www.databricks.com/resources/demos/videos/lakehouse-platform/data-lineage-with-unity-catalog) — Unity Catalog의 데이터 리니지 시각화를 데모하는 공식 영상.
- [Unity Catalog Access Control 공식 문서](https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control) — 권한 모델(RBAC, ABAC, Row Filters, Column Masks)의 계층 구조를 설명하는 공식 문서.
- [ABAC 블로그](https://www.databricks.com/blog/how-scale-data-governance-attribute-based-access-control-unity-catalog) — ABAC 정책의 태그 기반 상속 구조와 작동 방식을 다이어그램으로 설명.
- [Databricks Workspace Navigation 공식 문서](https://docs.databricks.com/aws/en/workspace/navigate-workspace) — 워크스페이스 사이드바의 전체 메뉴 구조(Catalog, Workspace, Repos, Workflows 등)를 설명.

### ThoughtSpot

- [ThoughtSpot Data Connect 제품 페이지](https://www.thoughtspot.com/product/connect) — 데이터 소스 연결, SpotterModel, Worksheet 관리의 제품 개요와 화면 참조. 제로 카피 아키텍처와 시맨틱 모델링의 접근 방식을 이해하는 데 유용.
- [ThoughtSpot Governance 제품 페이지](https://www.thoughtspot.com/product/governance) — 엔터프라이즈 거버넌스, 행·컬럼·오브젝트 레벨 보안의 제품 개요.
- [ThoughtSpot Row-Level Security 설정 가이드 (phData)](https://www.phdata.io/blog/how-to-setup-row-level-security-in-thoughtspot/) — RLS 설정 과정의 단계별 스크린샷(Admin Console, Group 생성, Rule 설정)이 포함된 실전 가이드.
- [ThoughtSpot RLS 튜토리얼 (InterWorks)](https://interworks.com/blog/2023/07/25/thoughtspot-101-row-level-security/) — RLS 구현의 상세 과정과 ACL 테이블 기반 보안 적용 화면 포함.
- [ThoughtSpot Sharing Tables and Columns 공식 문서](https://docs.thoughtspot.com/cloud/latest/share-source-tables.html) — Column Level Security(CLS) 적용 시 Share 다이얼로그에서 "Specific Columns"를 선택하는 UI 흐름 설명.
- [ThoughtSpot Worksheet 생성 공식 문서](https://docs.thoughtspot.com/cloud/10.10.0.cl/worksheets) — Worksheet(시맨틱 레이어) 생성 과정의 소스 추가, 조인 설정, 컬럼 관리 UI 설명.

### Dify

- [Dify Knowledge 공식 문서](https://docs.dify.ai/en/guides/knowledge-base/readme) — Knowledge Base의 RAG 파이프라인 관리 UI와 개념 설명. 청크 관리, 검색 설정 등의 화면 구조를 이해하는 데 유용.
- [Dify Knowledge Pipeline 블로그](https://dify.ai/blog/introducing-knowledge-pipeline) — v1.9.0에서 도입된 Knowledge Pipeline의 비주얼 캔버스 UI, 노드 기반 RAG ETL 파이프라인의 화면 참조. ReactFlow 파이프라인 에디터와의 유사성 관점에서 참고 가치가 높음.
- [Dify v1.9.0 릴리스 노트 (GitHub)](https://github.com/langgenius/dify/discussions/26138) — Knowledge Pipeline과 Queue-based Graph Engine의 기술적 상세 설명.
- [Dify x Tavily 블로그](https://dify.ai/blog/dify-x-tavily-build-knowledge-pipelines-from-live-web-data) — Settings → Data Source에서 API 키를 설정하고 Knowledge Pipeline에서 Tavily를 데이터 소스로 사용하는 흐름 설명.
- [Dify 2025 Summer Highlights](https://dify.ai/blog/2025-dify-summer-highlights) — 비주얼 디버깅, Relationships Panel, 멀티모달 Knowledge Base 등 최신 기능 업데이트 요약.

### Microsoft Copilot Studio

- [Copilot Studio DLP 정책 설정 공식 문서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention) — Power Platform Admin Center에서 Copilot Studio 커넥터를 DLP 정책에 구성하는 과정 설명. 커넥터 그룹 분류(Business/Non-business/Blocked) UX 확인 가능.
- [Copilot Studio Security and Governance 개요](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance) — 보안·거버넌스 기능의 전체 범위(DLP, 데이터 레지던시, 인증, Customer Lockbox 등) 개요.
- [Power Platform DLP 정책 공식 문서](https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention) — DLP 정책의 커넥터 분류 개념과 Copilot Studio 가상 커넥터(Virtual Connectors) 설명.
- [Copilot Studio Governance Guide (PDF)](https://www.firstaigroup.com/wp-content/uploads/2025/08/Microsoft-Copilot-Studio_Governance-and-security-guide.pdf) — Microsoft 공식 거버넌스 가이드. 인증 설정, 환경 전략, DLP, 채널 관리의 체크리스트 형태.
- [Copilot Studio DLP Troubleshooting 공식 문서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-dlp-troubleshooting) — DLP 위반 시 에이전트 빌더에게 표시되는 에러 UI와 Channels 탭의 경고 화면 설명.
- [M365 Copilot Security & Governance Ignite 2025 블로그](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/security-and-governance-innovations-for-microsoft-365-copilot-and-agents-from-ig/4476172) — Purview DLP, SharePoint Admin Agent, Oversharing 관리 등의 최신 거버넌스 기능 스크린샷과 설명.
- [Copilot Governance 실전 가이드 (TechCommunity)](https://techcommunity.microsoft.com/blog/healthcareandlifesciencesblog/copilot-governance-a-practical-guide-from-our-4%E2%80%91part-webinar-series/4469033) — 4부작 웨비나 시리즈의 요약. 환경 전략, DLP, Purview, SharePoint 관리의 실전 적용 가이드.

### OpenAI Frontier

- [OpenAI Frontier 공식 소개 블로그](https://openai.com/index/introducing-openai-frontier/) — Business Context, Agent Execution, Evaluation & Optimization, Enterprise Security & Governance의 4개 핵심 영역 설명. "semantic layer for the enterprise" 개념의 원본 출처.
- [OpenAI Frontier 제품 페이지](https://openai.com/business/frontier/) — 제품 개요, IAM, 감사 로그, Business Context 등의 기능 요약. 제한적이나 제품 구조를 이해할 수 있는 공식 자료.
- [Frontier 분석 (Futurum Group)](https://futurumgroup.com/insights/openai-frontier-close-the-enterprise-ai-opportunity-gap-or-widen-it/) — Business Context의 시맨틱 레이어 접근 방식에 대한 독립 분석. 경쟁 제품과의 포지셔닝 비교.
- [Frontier 상세 가이드 (ALM Corp)](https://almcorp.com/blog/openai-frontier-enterprise-ai-agent-platform-guide/) — 4개 핵심 컴포넌트의 상세 설명, 에이전트 메모리 시스템, 보안 아키텍처 분석.
- [OpenAI Frontier vs Semantic Layers (Atlan)](https://atlan.com/know/open-ai-frontier-vs-semantic-layer/) — Frontier의 "시맨틱 레이어" 주장과 전통적 시맨틱 레이어의 차이를 분석. 연결 기반 컨텍스트 vs 거버넌스 기반 번역 레이어의 구분이 명확하게 설명되어 있어, 온톨로지 기반 아키텍처 설계 시 참고 가치가 높음.
- [Frontier Context Matters (Metadata Weekly)](https://metadataweekly.substack.com/p/openais-frontier-proves-context-matters) — Frontier가 증명한 "컨텍스트"의 중요성과, 이를 실제로 구축하기 위한 조직적 과제를 분석. 컨텍스트를 연결(connectivity), 시맨틱(semantics), 경험(experience)의 3개 축으로 분해.
- [CNBC: OpenAI Frontier 출시 보도](https://www.cnbc.com/2026/02/05/open-ai-frontier-enterprise-customers.html) — 초기 고객 목록과 경쟁 구도(Anthropic, Salesforce, Microsoft와의 관계) 보도.

