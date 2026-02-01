import React, { useMemo, useState, useEffect } from 'react';
import type { ToolCallContentProps } from './types';
import { DEFAULT_DEEP_THINKING_TODOS, DEFAULT_ERP_CONNECTIONS, SCENARIO_TODOS, getScenarioTodosWithStatus, PARALLEL_DATA_QUERIES, DATA_QUERY_RESULTS } from './constants';
import StreamingText from '../../../../shared/StreamingText';

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
}) => {
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
        />
        <StreamingText
          content="프레젠테이션이 초기화되었습니다."
          as="p"
          className="text-xs text-gray-500"
          typingSpeed={50}
          startDelay={800}
          showCursor={false}
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
    const completedCount = scenarioTodos.filter(t => t.status === 'completed').length;
    const inProgressTodo = scenarioTodos.find(t => t.status === 'in_progress');

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">총: {scenarioTodos.length}개의 Task</span>
          <span className="text-gray-500">
            {completedCount === 0
              ? `남은 Task ${scenarioTodos.length}개`
              : `완료 ${completedCount}/${scenarioTodos.length}`}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          {scenarioTodos.map((todo, idx) => {
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
                <StreamingText
                  content={todo.label}
                  as="span"
                  className={
                    isCompleted
                      ? 'text-gray-400 line-through'
                      : isInProgress
                        ? 'text-gray-800 font-medium'
                        : 'text-gray-600'
                  }
                  typingSpeed={35}
                  startDelay={idx * 250}
                  showCursor={status === 'running' && idx === scenarioTodos.length - 1}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 데이터 소스 선택 (HITL)
  if (toolType === 'data_source_select' && hitlOptions && onHitlSelect) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">경영 실적 보고서 제작을 위해 데이터 소스를 선택해 주세요:</p>
        <div className="space-y-2">
          {hitlOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onHitlSelect(option.id)}
              disabled={status === 'completed'}
              className={`
                w-full p-3 rounded-lg border text-left transition-all
                ${selectedOption === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${status === 'completed' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{option.label}</span>
                    {option.recommended && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                        추천
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
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
                  enabled={status === 'running' || status === 'completed'}
                />
              </div>
              <StreamingText
                content={`마지막 동기화: ${conn.lastSync}`}
                as="span"
                className="text-xs text-gray-400"
                typingSpeed={25}
                startDelay={600 + idx * 450}
                showCursor={false}
                enabled={status === 'running' || status === 'completed'}
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
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-800">
                    <StreamingText
                      content={row.current}
                      as="span"
                      typingSpeed={25}
                      startDelay={300 + idx * 150}
                      showCursor={false}
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    <StreamingText
                      content={row.previous || '-'}
                      as="span"
                      typingSpeed={25}
                      startDelay={400 + idx * 150}
                      showCursor={false}
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

  // 데이터 검증 (HITL)
  if (toolType === 'data_validation' && validationData) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">ERP에서 조회한 Q4 2025 핵심 데이터를 확인해 주세요:</p>
        <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">매출액</span>
              <p className="font-semibold text-gray-800">{validationData.revenue}</p>
              <span className="text-xs text-green-600">{validationData.revenueGrowth}</span>
            </div>
            <div>
              <span className="text-gray-500">영업이익</span>
              <p className="font-semibold text-gray-800">{validationData.operatingProfit}</p>
              <span className="text-xs text-green-600">{validationData.operatingProfitGrowth}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
            <p>데이터 기준일: {validationData.dataDate}</p>
            <p>출처: {validationData.dataSources.join(', ')}</p>
          </div>
        </div>
        {status === 'awaiting-input' && onValidationConfirm && onValidationModify && (
          <div className="flex gap-2">
            <button
              onClick={onValidationConfirm}
              className="flex-1 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              확인
            </button>
            <button
              onClick={onValidationModify}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              수정 요청
            </button>
          </div>
        )}
      </div>
    );
  }

  // PPT 세부 설정 (HITL) - 별도 tool-variant에서 처리
  if (toolType === 'ppt_setup') {
    return (
      <div className="text-sm text-gray-500">
        PPT 세부 설정 UI는 별도 컴포넌트에서 렌더링됩니다.
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
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 슬라이드 계획
  if (toolType === 'slide_planning') {
    const slides = [
      '표지: Q4 2025 경영 실적 보고서',
      'Executive Summary: 핵심 성과 4대 지표',
      '재무 하이라이트: 분기별 추이 + YoY 비교',
      '사업부별 실적: 3개 사업부 심층 분석',
      '운영 KPI: 고객/생산/물류 대시보드',
      '2026년 전망: 가이던스 및 전략 방향',
    ];
    return (
      <div className="space-y-2">
        <StreamingText
          content="슬라이드 구성 계획:"
          as="p"
          className="text-sm text-gray-600"
          typingSpeed={35}
          showCursor={false}
        />
        <div className="space-y-1">
          {slides.map((slide, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                {idx + 1}
              </span>
              <StreamingText
                content={slide}
                as="span"
                className="text-gray-700"
                typingSpeed={35}
                startDelay={300 + idx * 350}
                showCursor={status === 'running' && idx === slides.length - 1}
              />
            </div>
          ))}
        </div>
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
        />
        <div className="text-xs text-gray-500">
          <StreamingText
            content="• 총 슬라이드: 8장"
            as="p"
            typingSpeed={45}
            startDelay={800}
            showCursor={false}
          />
          <StreamingText
            content="• 데이터 출처: 영림원 ERP, E2MAX MES, Platform Portal"
            as="p"
            typingSpeed={45}
            startDelay={1000}
            showCursor={false}
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

  // 기본
  return (
    <div className="text-sm text-gray-500">
      도구 상세 정보가 없습니다.
    </div>
  );
};

export default React.memo(ToolCallContent);
