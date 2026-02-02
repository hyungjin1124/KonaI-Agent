import React from 'react';
import { ToolStatus } from '../../types';
import { PPT_QUERY_ANALYSIS } from './constants';
import StreamingText from '../../../../shared/StreamingText';

interface QueryAnalysisBoxProps {
  status: ToolStatus;
  skipStreaming?: boolean;
}

/**
 * 복잡도 바 컴포넌트
 */
const ComplexityBar: React.FC<{ level: 1 | 2 | 3 | 4 | 5 }> = ({ level }) => (
  <span className="font-mono tracking-wider">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < level ? 'text-gray-800' : 'text-gray-300'}>
        {i < level ? '■' : '□'}
      </span>
    ))}
  </span>
);

/**
 * Chain-of-Thought 분석 박스 컴포넌트
 * - 사용자 질의를 분석하는 UI
 * - 핵심 키워드, 암묵적 요구사항, 복잡도 평가 표시
 */
const QueryAnalysisBox: React.FC<QueryAnalysisBoxProps> = ({
  status,
  skipStreaming = false,
}) => {
  const streamingEnabled = !skipStreaming;
  const analysis = PPT_QUERY_ANALYSIS;

  // 스트리밍 타이밍 설정
  const timing = {
    input: 0,
    keywordsHeader: 500,
    keywordsItems: 800,
    keywordsInterval: 300,
    requirementsHeader: 2200,
    requirementsItems: 2500,
    requirementsInterval: 300,
    complexityHeader: 3700,
    complexityItems: 4000,
    complexityInterval: 250,
    conclusion: 5000,
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
      {/* 헤더 */}
      <div className="px-4 py-2.5 bg-gray-100 border-b border-gray-300">
        <span className="font-medium text-gray-700 flex items-center gap-2">
          <span>💭</span>
          <span>사용자 질의 분석</span>
        </span>
      </div>

      <div className="p-4 space-y-4 font-mono text-sm text-gray-700">
        {/* 입력 */}
        <div>
          <StreamingText
            content={`입력: "${analysis.userQuery}"`}
            as="p"
            typingSpeed={25}
            startDelay={timing.input}
            showCursor={false}
            enabled={streamingEnabled}
          />
        </div>

        {/* 핵심 키워드 추출 */}
        <div className="space-y-1">
          <StreamingText
            content="▸ 핵심 키워드 추출"
            as="p"
            className="text-gray-600"
            typingSpeed={30}
            startDelay={timing.keywordsHeader}
            showCursor={false}
            enabled={streamingEnabled}
          />
          {analysis.keywords.map((kw, idx) => (
            <StreamingText
              key={idx}
              content={`  • "${kw.keyword}" → ${kw.category}: ${kw.description}`}
              as="p"
              typingSpeed={25}
              startDelay={timing.keywordsItems + idx * timing.keywordsInterval}
              showCursor={false}
              enabled={streamingEnabled}
            />
          ))}
        </div>

        {/* 암묵적 요구사항 추론 */}
        <div className="space-y-1">
          <StreamingText
            content="▸ 암묵적 요구사항 추론"
            as="p"
            className="text-gray-600"
            typingSpeed={30}
            startDelay={timing.requirementsHeader}
            showCursor={false}
            enabled={streamingEnabled}
          />
          {analysis.implicitRequirements.map((req, idx) => (
            <StreamingText
              key={idx}
              content={`  • ${req}`}
              as="p"
              typingSpeed={25}
              startDelay={timing.requirementsItems + idx * timing.requirementsInterval}
              showCursor={false}
              enabled={streamingEnabled}
            />
          ))}
        </div>

        {/* 작업 복잡도 평가 */}
        <div className="space-y-1">
          <StreamingText
            content="▸ 작업 복잡도 평가"
            as="p"
            className="text-gray-600"
            typingSpeed={30}
            startDelay={timing.complexityHeader}
            showCursor={false}
            enabled={streamingEnabled}
          />
          <StreamingText
            content={`  • 데이터 소스: ${analysis.complexity.dataSource}`}
            as="p"
            typingSpeed={25}
            startDelay={timing.complexityItems}
            showCursor={false}
            enabled={streamingEnabled}
          />
          <StreamingText
            content={`  • 분석 깊이: ${analysis.complexity.analysisDepth}`}
            as="p"
            typingSpeed={25}
            startDelay={timing.complexityItems + timing.complexityInterval}
            showCursor={false}
            enabled={streamingEnabled}
          />
          <StreamingText
            content={`  • 예상 슬라이드: ${analysis.complexity.estimatedSlides}`}
            as="p"
            typingSpeed={25}
            startDelay={timing.complexityItems + timing.complexityInterval * 2}
            showCursor={false}
            enabled={streamingEnabled}
          />
          {/* 복잡도 바 - 스트리밍 없이 표시 (마지막 항목 후 나타남) */}
          <div
            className="flex items-center gap-2 pl-4 transition-opacity duration-300"
            style={{
              opacity: skipStreaming || status === 'completed' ? 1 : 0,
              transitionDelay: skipStreaming ? '0ms' : `${timing.complexityItems + timing.complexityInterval * 3}ms`,
            }}
          >
            <span>• 복잡도:</span>
            <ComplexityBar level={analysis.complexity.level} />
            <span>({analysis.complexity.levelLabel})</span>
          </div>
        </div>

        {/* 결론 */}
        <StreamingText
          content={`→ 결론: ${analysis.conclusion}`}
          as="p"
          className="text-gray-800 font-medium"
          typingSpeed={30}
          startDelay={timing.conclusion}
          showCursor={status === 'running'}
          enabled={streamingEnabled}
        />
      </div>
    </div>
  );
};

export default React.memo(QueryAnalysisBox);
