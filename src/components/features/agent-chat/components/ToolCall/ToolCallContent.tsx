import React, { useMemo, useState, useEffect } from 'react';
import type { ToolCallContentProps } from './types';
import { DEFAULT_DEEP_THINKING_TODOS, DEFAULT_ERP_CONNECTIONS, SCENARIO_TODOS, getScenarioTodosWithStatus, PARALLEL_DATA_QUERIES, DATA_QUERY_RESULTS, PPT_SLIDE_FILES } from './constants';
import StreamingText from '../../../../shared/StreamingText';
import QueryAnalysisBox from './QueryAnalysisBox';

/**
 * 접이식 SPARQL 쿼리 표시 컴포넌트
 */
const CollapsibleSparqlQuery: React.FC<{ query: string }> = ({ query }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-gray-400">{'</>'}</span>
          <span>SPARQL 쿼리</span>
        </span>
        <span className="text-gray-400">
          {isExpanded ? '▲ 접기' : '▼ 펼치기'}
        </span>
      </button>
      {isExpanded && (
        <div className="p-3 bg-gray-900 overflow-x-auto">
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
            {query}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * 도구 호출 상세 내용 컴포넌트
 * - toolType에 따라 다른 내용 렌더링
 * - HITL 도구는 별도 컴포넌트로 분리
 */
const ToolCallContent: React.FC<ToolCallContentProps> = ({
  toolType,
  status,
  input,
  result,
  isHitl,
  hitlOptions,
  selectedOption,
  onHitlSelect,
  pptConfig,
  onPptConfigUpdate,
  onPptSetupComplete,
  validationData,
  onValidationConfirm,
  onValidationModify,
  currentStepId,
  completedStepIds,
  skipStreaming = false,
  onMarkdownFileGenerated,
}) => {
  // 스트리밍 활성화 여부 (skipStreaming이 true면 비활성화)
  const streamingEnabled = !skipStreaming;

  // 슬라이드 계획 도구용: 순차 스트리밍을 위한 활성 파일 인덱스 상태
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);

  // 도구 타입이 변경되면 상태 리셋
  useEffect(() => {
    if (toolType === 'slide_planning') {
      setActiveFileIndex(0);
      setIntroComplete(false);
    }
  }, [toolType]);
  // PPT 초기화 내용
  if (toolType === 'ppt_init') {
    return (
      <div className="text-sm text-gray-600 space-y-1">
        <StreamingText
          content="새 프레젠테이션: Q4 2025 경영 실적 보고서"
          as="p"
          className="font-medium text-gray-800"
          typingSpeed={45}
          showCursor={status === 'running'}
          enabled={streamingEnabled}
        />
        <StreamingText
          content="프레젠테이션이 초기화되었습니다."
          as="p"
          className="text-xs text-gray-500"
          typingSpeed={50}
          startDelay={800}
          showCursor={false}
          enabled={streamingEnabled}
        />
      </div>
    );
  }

  // 심층 사고 (동적 할 일 목록)
  // 시나리오 진행 상태를 기반으로 동적 Todo list 계산
  const scenarioTodos = useMemo(() => {
    if (completedStepIds) {
      return getScenarioTodosWithStatus(currentStepId ?? null, completedStepIds);
    }
    // fallback: 기존 정적 todos
    return SCENARIO_TODOS.map(todo => ({ ...todo, status: 'pending' as const }));
  }, [currentStepId, completedStepIds]);

  if (toolType === 'deep_thinking') {
    // Task 목록은 우측 사이드바 ProgressSection에서만 표시
    // 좌측 패널에서는 Chain-of-Thought 분석 박스만 표시
    return (
      <div className="space-y-4">
        {/* Chain-of-Thought 분석 박스 */}
        <QueryAnalysisBox
          status={status}
          skipStreaming={skipStreaming}
        />
      </div>
    );
  }

  // 데이터 소스 선택 (HITL) - 플로팅 패널에서 선택, 인라인은 상태 표시만
  if (toolType === 'data_source_select') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          {status === 'completed' && selectedOption
            ? `데이터 소스가 선택되었습니다: ${hitlOptions?.find(o => o.id === selectedOption)?.label || selectedOption}`
            : '데이터 소스 선택 대기 중...'}
        </p>
      </div>
    );
  }

  // ERP 연결
  if (toolType === 'erp_connect') {
    const connections = DEFAULT_ERP_CONNECTIONS;
    return (
      <div className="space-y-2">
        <StreamingText
          content="데이터 소스 연결 상태 확인 중..."
          as="p"
          className="text-sm text-gray-600"
          typingSpeed={35}
          showCursor={false}
          enabled={streamingEnabled}
        />
        <div className="space-y-1.5">
          {connections.map((conn, idx) => (
            <div key={conn.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <StreamingText
                  content={conn.name}
                  as="span"
                  className="text-gray-700"
                  typingSpeed={35}
                  startDelay={450 + idx * 450}
                  showCursor={false}
                  enabled={streamingEnabled && (status === 'running' || status === 'completed')}
                />
              </div>
              <StreamingText
                content={`마지막 동기화: ${conn.lastSync}`}
                as="span"
                className="text-xs text-gray-400 min-w-[160px] text-left"
                typingSpeed={25}
                startDelay={600 + idx * 450}
                showCursor={false}
                enabled={streamingEnabled && (status === 'running' || status === 'completed')}
              />
            </div>
          ))}
        </div>
        {status === 'completed' && (
          <StreamingText
            content="모든 데이터 소스가 정상 연결되어 있습니다."
            as="p"
            className="text-xs text-green-600 mt-2"
            typingSpeed={35}
            startDelay={2000}
            showCursor={false}
            enabled={streamingEnabled}
          />
        )}
      </div>
    );
  }

  // 병렬 데이터 조회
  if (toolType === 'parallel_data_query') {
    return (
      <div className="space-y-3">
        <StreamingText
          content="병렬 데이터 조회 실행 중..."
          as="p"
          className="text-sm font-medium text-gray-700"
          typingSpeed={35}
          showCursor={false}
          enabled={streamingEnabled}
        />
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-500">Q4 2025 데이터 조회</span>
          </div>
          <div className="divide-y divide-gray-100">
            {PARALLEL_DATA_QUERIES.map((query, idx) => {
              const isRunning = status === 'running';
              const isCompleted = status === 'completed';
              const queryStatus = isCompleted ? 'completed' : (isRunning && idx <= 2 ? 'running' : 'pending');

              return (
                <div
                  key={query.id}
                  className="px-3 py-2 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={
                      queryStatus === 'completed'
                        ? 'text-green-500'
                        : queryStatus === 'running'
                          ? 'text-blue-500 animate-pulse'
                          : 'text-gray-400'
                    }>
                      {queryStatus === 'completed' ? '✓' : queryStatus === 'running' ? '●' : '○'}
                    </span>
                    <span className="text-gray-500">조회 {idx + 1}:</span>
                    <StreamingText
                      content={`[${query.source}] ${query.query}`}
                      as="span"
                      className="text-gray-700"
                      typingSpeed={30}
                      startDelay={300 + idx * 400}
                      showCursor={false}
                      enabled={streamingEnabled}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{query.period}</span>
                </div>
              );
            })}
          </div>
        </div>
        {status === 'completed' && (
          <div className="flex items-center justify-end">
            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100">
              [보기]
            </span>
          </div>
        )}
      </div>
    );
  }

  // 데이터 조회 (개별 결과 상세 표시)
  if (toolType === 'data_query') {
    // input에서 queryId를 가져와서 해당 결과 데이터를 찾음
    const queryId = (input?.queryId as string) || 'income_statement';
    const queryResult = DATA_QUERY_RESULTS[queryId];

    if (!queryResult) {
      return (
        <div className="text-sm text-gray-500">
          데이터 조회 결과를 불러오는 중...
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">📑 {queryResult.source} 조회</span>
          </div>
          <span className="text-xs text-gray-400">{queryResult.period}</span>
        </div>

        {/* 쿼리명 */}
        <StreamingText
          content={`쿼리: ${queryResult.queryName}`}
          as="p"
          className="text-sm text-gray-600"
          typingSpeed={35}
          showCursor={false}
          enabled={streamingEnabled}
        />

        {/* 결과 테이블 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">계정과목</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Q4 2025</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Q4 2024</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">YoY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {queryResult.data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700">
                    <StreamingText
                      content={row.label}
                      as="span"
                      typingSpeed={25}
                      startDelay={200 + idx * 150}
                      showCursor={false}
                      enabled={streamingEnabled}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-800">
                    <StreamingText
                      content={row.current}
                      as="span"
                      typingSpeed={25}
                      startDelay={300 + idx * 150}
                      showCursor={false}
                      enabled={streamingEnabled}
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    <StreamingText
                      content={row.previous || '-'}
                      as="span"
                      typingSpeed={25}
                      startDelay={400 + idx * 150}
                      showCursor={false}
                      enabled={streamingEnabled}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <StreamingText
                      content={row.change || '-'}
                      as="span"
                      className={row.change?.startsWith('+') ? 'text-green-600' : row.change?.startsWith('-') ? 'text-red-600' : 'text-gray-500'}
                      typingSpeed={25}
                      startDelay={500 + idx * 150}
                      showCursor={status === 'running' && idx === queryResult.data.length - 1}
                      enabled={streamingEnabled}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SPARQL 쿼리 (접이식) */}
        {queryResult.sparqlQuery && (
          <CollapsibleSparqlQuery query={queryResult.sparqlQuery} />
        )}

        {/* 푸터 */}
        {status === 'completed' && (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>데이터 출처: {queryResult.source} &gt; {queryResult.queryName}</span>
            <span>조회 시점: {queryResult.timestamp}</span>
          </div>
        )}
      </div>
    );
  }

  // 데이터 검증 (HITL) - 플로팅 패널에서 확인/수정, 인라인은 상태 표시만
  if (toolType === 'data_validation') {
    return (
      <div className="text-sm text-gray-500">
        {status === 'completed'
          ? '데이터 검증이 완료되었습니다.'
          : '데이터 검증 대기 중...'}
      </div>
    );
  }

  // PPT 세부 설정 (HITL) - 플로팅 패널에서 설정, 인라인은 상태 표시만
  if (toolType === 'ppt_setup') {
    return (
      <div className="text-sm text-gray-500">
        {status === 'completed'
          ? 'PPT 세부 설정이 완료되었습니다.'
          : 'PPT 세부 설정 대기 중...'}
      </div>
    );
  }

  // 웹 검색
  if (toolType === 'web_search') {
    const searches = [
      '2025년 4분기 국내 IT 서비스 시장 성장률',
      '2025년 SaaS 시장 동향 한국',
      '2026년 기업 IT 투자 전망 한국',
    ];
    return (
      <div className="space-y-2">
        <StreamingText
          content="시장 환경 정보 검색 중..."
          as="p"
          className="text-sm text-gray-600"
          typingSpeed={40}
          showCursor={false}
          enabled={streamingEnabled}
        />
        <div className="space-y-1">
          {searches.map((search, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-gray-400">검색어 {idx + 1}:</span>
              <StreamingText
                content={search}
                as="span"
                typingSpeed={40}
                startDelay={500 + idx * 700}
                showCursor={status === 'running' && idx === searches.length - 1}
                enabled={streamingEnabled}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 슬라이드 계획 - 마크다운 파일 순차 생성
  if (toolType === 'slide_planning') {
    // 파일 스트리밍 완료 핸들러
    const handleFileStreamComplete = (file: typeof PPT_SLIDE_FILES[number]) => {
      onMarkdownFileGenerated?.(file);
      setActiveFileIndex(prev => prev + 1);
    };

    return (
      <div className="space-y-2">
        <StreamingText
          content="슬라이드별로 개별 마크다운 파일을 생성하겠습니다."
          as="p"
          className="text-sm text-gray-600"
          typingSpeed={40}
          showCursor={false}
          enabled={streamingEnabled}
          onComplete={() => setIntroComplete(true)}
        />
        {introComplete && (
          <div className="space-y-1.5 mt-3">
            {PPT_SLIDE_FILES.map((file, idx) => (
              <div key={file.id} className="flex items-center gap-2 text-sm min-h-[1.5rem]">
                {/* 이미 완료된 항목 */}
                {idx < activeFileIndex && (
                  <>
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">{file.filename} 생성됨</span>
                  </>
                )}
                {/* 현재 스트리밍 중인 항목 */}
                {idx === activeFileIndex && (
                  <>
                    <span className="text-green-600">✓</span>
                    <StreamingText
                      content={`${file.filename} 생성됨`}
                      as="span"
                      className="text-gray-700"
                      typingSpeed={50}
                      startDelay={idx === 0 ? 200 : 100}
                      showCursor={true}
                      enabled={streamingEnabled}
                      onComplete={() => handleFileStreamComplete(file)}
                    />
                  </>
                )}
                {/* 아직 시작 안 한 항목은 표시하지 않음 */}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 슬라이드 제작 (우측 패널과 동기화)
  if (toolType === 'slide_generation') {
    const currentSlide = (input?.currentSlide as number) || 1;
    const totalSlides = (input?.totalSlides as number) || 8;
    const completedSlides = (input?.completedSlides as number[]) || [];
    const progress = Math.round((completedSlides.length / totalSlides) * 100);
    const isGenerating = status === 'running';

    return (
      <div className="space-y-3">
        {/* 진행 상태 헤더 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {isGenerating
              ? `슬라이드 ${currentSlide}/${totalSlides} 제작 중...`
              : `전체 ${totalSlides}개 슬라이드 완성`}
          </span>
          <span className="text-gray-400">{progress}%</span>
        </div>

        {/* 진행 바 */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 완료된 슬라이드 목록 */}
        {completedSlides.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {completedSlides.map(slideId => (
              <div key={slideId} className="flex items-center gap-2 text-xs text-green-600">
                <span>✓</span>
                <span>슬라이드 {slideId} 완성</span>
              </div>
            ))}
            {isGenerating && currentSlide <= totalSlides && !completedSlides.includes(currentSlide) && (
              <div className="flex items-center gap-2 text-xs text-violet-600 animate-pulse">
                <span>●</span>
                <span>슬라이드 {currentSlide} 제작 중...</span>
              </div>
            )}
          </div>
        )}

        {/* 생성 시작 전 (completedSlides가 비어있고 running 상태일 때) */}
        {completedSlides.length === 0 && isGenerating && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-xs text-violet-600 animate-pulse">
              <span>●</span>
              <span>슬라이드 {currentSlide} 제작 중...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 완료
  if (toolType === 'completion') {
    return (
      <div className="space-y-2">
        <StreamingText
          content="Q4 2025 경영 실적 보고서 PPT가 성공적으로 생성되었습니다!"
          as="p"
          className="text-sm text-green-600 font-medium"
          typingSpeed={45}
          showCursor={status === 'running'}
          enabled={streamingEnabled}
        />
        <div className="text-xs text-gray-500">
          <StreamingText
            content="• 총 슬라이드: 8장"
            as="p"
            typingSpeed={45}
            startDelay={800}
            showCursor={false}
            enabled={streamingEnabled}
          />
          <StreamingText
            content="• 데이터 출처: 영림원 ERP, E2MAX MES, Platform Portal"
            as="p"
            typingSpeed={45}
            startDelay={1000}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>
      </div>
    );
  }

  // Todo 업데이트 (Task 완료 시 표시)
  if (toolType === 'todo_update') {
    const completedCount = scenarioTodos.filter(t => t.status === 'completed').length;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">작업 진행 상황</span>
          <span className="text-gray-500">
            {completedCount}/{scenarioTodos.length} 완료
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          {scenarioTodos.map((todo) => {
            const isCompleted = todo.status === 'completed';
            const isInProgress = todo.status === 'in_progress';

            return (
              <div key={todo.id} className="flex items-center gap-2 text-sm">
                <span className={
                  isCompleted
                    ? 'text-green-500'
                    : isInProgress
                      ? 'text-blue-500 animate-pulse'
                      : 'text-gray-400'
                }>
                  {isCompleted ? '✓' : isInProgress ? '●' : '○'}
                </span>
                <span className={
                  isCompleted
                    ? 'text-gray-400 line-through'
                    : isInProgress
                      ? 'text-gray-800 font-medium'
                      : 'text-gray-600'
                }>
                  {todo.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =============================================
  // 매출 분석 시나리오 신규 도구 (13개)
  // =============================================

  // Phase 1: 분석 준비

  // 1. 요청 분석
  if (toolType === 'request_analysis') {
    const subtools = [
      { label: '키워드 추출', result: '"12월", "경영 실적", "분석"' },
      { label: '분석 범위 파악', result: '재무 실적, 사업부별 성과, 운영 KPI' },
      { label: '작업 계획 수립', result: '5단계 분석 프로세스 구성 완료' },
    ];

    return (
      <div className="space-y-2">
        {subtools.map((subtool, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={subtool.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 400}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={subtool.result}
              as="p"
              className="text-xs text-gray-500 ml-5 mt-1"
              typingSpeed={25}
              startDelay={idx * 400 + 200}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // 2. 분석 범위 확인 (HITL)
  if (toolType === 'analysis_scope_confirm') {
    return (
      <div className="text-sm text-gray-500">
        {status === 'completed'
          ? '분석 범위가 확정되었습니다.'
          : '분석 범위 확인 대기 중...'}
      </div>
    );
  }

  // 3. 데이터 소스 연결
  if (toolType === 'data_source_connect') {
    const connections = [
      { label: 'ERP 시스템 연결', source: '영림원 ERP', desc: '재무/회계 데이터 소스 연결 완료' },
      { label: 'MES 시스템 연결', source: 'E2MAX MES', desc: '생산/물류 데이터 소스 연결 완료' },
      { label: 'CRM/Portal 연결', source: 'Platform Portal', desc: '고객/매출 데이터 소스 연결 완료' },
    ];

    return (
      <div className="space-y-2">
        {connections.map((conn, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <StreamingText
                  content={conn.label}
                  as="span"
                  className="font-medium text-gray-800"
                  typingSpeed={30}
                  startDelay={idx * 500}
                  showCursor={false}
                  enabled={streamingEnabled}
                />
              </div>
              <StreamingText
                content={conn.source}
                as="span"
                className="text-xs text-gray-400"
                typingSpeed={25}
                startDelay={idx * 500 + 150}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={conn.desc}
              as="p"
              className="text-xs text-gray-500 ml-5 mt-1"
              typingSpeed={25}
              startDelay={idx * 500 + 300}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // Phase 2: 데이터 수집

  // 4. 재무 데이터 수집
  if (toolType === 'financial_data_collection') {
    const dataItems = [
      { label: '손익계산서 조회', metrics: '매출액 420억 | 영업이익 63억 | 순이익 48억' },
      { label: '재무상태표 조회', metrics: '총자산 1,250억 | 부채비율 42% | 유동비율 180%' },
      { label: '현금흐름표 조회', metrics: '영업CF +52억 | 투자CF -18억 | 재무CF -12억' },
    ];

    return (
      <div className="space-y-2">
        {dataItems.map((item, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={item.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 450}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={item.metrics}
              as="p"
              className="text-xs text-gray-500 ml-5 mt-1"
              typingSpeed={20}
              startDelay={idx * 450 + 200}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // 5. 사업부별 실적 수집
  if (toolType === 'division_data_collection') {
    const divisions = [
      { label: '플랫폼사업부', change: '전월비 +18%', metrics: '매출 252억 | 영업이익 45억' },
      { label: '솔루션사업부', change: '전월비 +8%', metrics: '매출 105억 | 영업이익 12억' },
      { label: '컨설팅사업부', change: '전월비 +5%', metrics: '매출 63억 | 영업이익 6억' },
    ];

    return (
      <div className="space-y-2">
        {divisions.map((div, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <StreamingText
                  content={div.label}
                  as="span"
                  className="font-medium text-gray-800"
                  typingSpeed={30}
                  startDelay={idx * 450}
                  showCursor={false}
                  enabled={streamingEnabled}
                />
              </div>
              <StreamingText
                content={div.change}
                as="span"
                className="text-xs text-green-600"
                typingSpeed={25}
                startDelay={idx * 450 + 150}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={div.metrics}
              as="p"
              className="text-xs text-gray-500 ml-5 mt-1"
              typingSpeed={20}
              startDelay={idx * 450 + 300}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // 6. 운영 지표 수집
  if (toolType === 'operation_data_collection') {
    const operations = [
      { label: '생산/물류 KPI', source: 'E2MAX MES', metrics: '생산완료율 98.2% | OTD 96.5% | 불량률 0.8%' },
      { label: '고객/매출 지표', source: 'Platform Portal', metrics: '총 고객 847 | 신규 52 | 유지율 94.2%' },
    ];

    return (
      <div className="space-y-2">
        {operations.map((op, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <StreamingText
                  content={op.label}
                  as="span"
                  className="font-medium text-gray-800"
                  typingSpeed={30}
                  startDelay={idx * 500}
                  showCursor={false}
                  enabled={streamingEnabled}
                />
              </div>
              <StreamingText
                content={op.source}
                as="span"
                className="text-xs text-gray-400"
                typingSpeed={25}
                startDelay={idx * 500 + 150}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={op.metrics}
              as="p"
              className="text-xs text-gray-500 ml-5 mt-1"
              typingSpeed={20}
              startDelay={idx * 500 + 300}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // Phase 3: 데이터 분석

  // 7. 매출 동인 분석
  if (toolType === 'revenue_driver_analysis') {
    const drivers = [
      { label: '가격 효과 분석', finding: '고부가 제품 비중 확대로 ASP +8% 상승' },
      { label: '물량 효과 분석', finding: '주요 고객사 수주 확대로 물량 +5% 증가' },
      { label: '제품 믹스 분석', finding: '메탈 카드 비중 12% → 18% 확대' },
    ];

    return (
      <div className="space-y-2">
        {drivers.map((driver, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={driver.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 450}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={`→ ${driver.finding}`}
              as="p"
              className="text-xs text-gray-600 ml-5 mt-1"
              typingSpeed={20}
              startDelay={idx * 450 + 200}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // 8. 수익성 분석
  if (toolType === 'profitability_analysis') {
    const analyses = [
      { label: '원가 구조 분석', finding: '원가율 68% → 62%로 6%p 개선' },
      { label: '마진율 추이 분석', finding: '영업이익률 18.2% (전월비 +2.1%p)' },
      { label: '비용 효율성 분석', finding: '자동화로 단위당 노무비 15% 절감' },
    ];

    return (
      <div className="space-y-2">
        {analyses.map((analysis, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={analysis.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 450}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={`→ ${analysis.finding}`}
              as="p"
              className="text-xs text-gray-600 ml-5 mt-1"
              typingSpeed={20}
              startDelay={idx * 450 + 200}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // 9. 이상 징후 탐지
  if (toolType === 'anomaly_detection') {
    const anomalies = [
      {
        label: '전월/전년 대비 이상치',
        findings: [
          { type: 'positive' as const, text: '매출 +13.5% (전월비) - 연중 최고치' },
          { type: 'warning' as const, text: '재고 회전일 증가 (32일 → 38일)' },
        ],
      },
      { label: '계절성 패턴 분석', finding: '12월 계절적 성수기 효과 반영됨' },
      { label: '리스크 요인 식별', finding: '환율 상승에 따른 수입 원자재 비용 증가 우려', type: 'warning' as const },
    ];

    return (
      <div className="space-y-2">
        {anomalies.map((item, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={item.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 500}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            {'findings' in item ? (
              <div className="ml-5 mt-1 space-y-1">
                {item.findings.map((f, fIdx) => (
                  <StreamingText
                    key={fIdx}
                    content={`${f.type === 'positive' ? '● ' : '▲ '}${f.text}`}
                    as="p"
                    className={`text-xs ${f.type === 'positive' ? 'text-green-600' : 'text-amber-600'}`}
                    typingSpeed={20}
                    startDelay={idx * 500 + 200 + fIdx * 150}
                    showCursor={false}
                    enabled={streamingEnabled}
                  />
                ))}
              </div>
            ) : (
              <StreamingText
                content={`→ ${item.finding}`}
                as="p"
                className={`text-xs ml-5 mt-1 ${item.type === 'warning' ? 'text-amber-600' : 'text-gray-600'}`}
                typingSpeed={20}
                startDelay={idx * 500 + 200}
                showCursor={false}
                enabled={streamingEnabled}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // 10. 데이터 검증 (HITL)
  if (toolType === 'data_verification') {
    return (
      <div className="text-sm text-gray-500">
        {status === 'completed'
          ? '데이터 검증이 완료되었습니다.'
          : '데이터 검증 대기 중...'}
      </div>
    );
  }

  // Phase 4: 인사이트 도출

  // 11. 핵심 인사이트 도출
  if (toolType === 'key_insight_generation') {
    const insights = [
      { label: '성과 하이라이트', finding: '월 매출 420억원 - 연중 최고 실적' },
      { label: '개선 영역 식별', finding: '재고 회전율 개선 필요 (현재 12.4회)' },
      { label: '전략적 시사점', finding: 'CAPEX 조기 집행 검토 (가동률 한계)' },
    ];

    return (
      <div className="space-y-2">
        {insights.map((insight, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={insight.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 450}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={`→ ${insight.finding}`}
              as="p"
              className="text-xs text-gray-600 ml-5 mt-1"
              typingSpeed={20}
              startDelay={idx * 450 + 200}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // 12. 시각화 생성
  if (toolType === 'visualization_generation') {
    const charts = [
      { label: '매출 추이 차트', desc: '월별 매출 및 성장률 추이 생성 완료' },
      { label: '사업부별 비교 차트', desc: '사업부별 매출/이익 비교 생성 완료' },
      { label: 'KPI 대시보드', desc: '핵심 KPI 종합 현황 생성 완료' },
    ];

    return (
      <div className="space-y-2">
        {charts.map((chart, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={chart.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 450}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={chart.desc}
              as="p"
              className="text-xs text-gray-500 ml-5 mt-1"
              typingSpeed={20}
              startDelay={idx * 450 + 200}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // Phase 5: 결과 정리

  // 13. 분석 완료
  if (toolType === 'analysis_completion') {
    const completionItems = [
      { label: '분석 요약', desc: '전체 분석 결과 요약문 생성 완료' },
      { label: '후속 액션 제안', desc: '분석 결과 PPT로 제작 / 상세 리포트 다운로드' },
    ];

    return (
      <div className="space-y-2">
        {completionItems.map((item, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <StreamingText
                content={item.label}
                as="span"
                className="font-medium text-gray-800"
                typingSpeed={30}
                startDelay={idx * 450}
                showCursor={false}
                enabled={streamingEnabled}
              />
            </div>
            <StreamingText
              content={item.desc}
              as="p"
              className="text-xs text-gray-500 ml-5 mt-1"
              typingSpeed={20}
              startDelay={idx * 450 + 200}
              showCursor={false}
              enabled={streamingEnabled}
            />
          </div>
        ))}
      </div>
    );
  }

  // 기본
  return (
    <div className="text-sm text-gray-500">
      도구 상세 정보가 없습니다.
    </div>
  );
};

export default React.memo(ToolCallContent);
