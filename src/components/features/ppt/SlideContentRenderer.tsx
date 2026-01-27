import React from 'react';
import { SlideContent, StreamingState } from '../agent-chat/types';
import { PPTConfig } from '../../../types';

interface SlideContentRendererProps {
  content: SlideContent;
  config: PPTConfig;
  streamingState?: StreamingState;
  isStreaming?: boolean;
}

const THEME_STYLES = {
  'Corporate Blue': { bg: 'bg-slate-50', accent: 'bg-blue-600', accentText: 'text-blue-600', text: 'text-slate-900', sub: 'text-slate-500' },
  'Modern Dark': { bg: 'bg-gray-900', accent: 'bg-emerald-500', accentText: 'text-emerald-400', text: 'text-white', sub: 'text-gray-400' },
  'Nature Green': { bg: 'bg-stone-50', accent: 'bg-green-700', accentText: 'text-green-700', text: 'text-stone-800', sub: 'text-stone-600' }
};

// Typing cursor component
const TypingCursor: React.FC<{ visible: boolean }> = ({ visible }) => (
  <span className={`inline-block w-0.5 h-5 bg-[#FF3C42] ml-0.5 ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`} />
);

const SlideContentRenderer: React.FC<SlideContentRendererProps> = ({
  content,
  config,
  streamingState,
  isStreaming = false
}) => {
  const themeStyle = THEME_STYLES[config.theme];

  // Get displayed text (either streamed or full)
  const getDisplayedTitle = () => {
    if (isStreaming && streamingState) {
      return streamingState.streamedContent.title;
    }
    return content.title;
  };

  const getDisplayedSubtitle = () => {
    if (isStreaming && streamingState) {
      return streamingState.streamedContent.subtitle;
    }
    return content.subtitle || '';
  };

  const getDisplayedBulletPoints = () => {
    if (isStreaming && streamingState) {
      return streamingState.streamedContent.bulletPoints;
    }
    return content.bulletPoints || [];
  };

  // Determine where cursor should be shown
  const getCursorPosition = () => {
    if (!isStreaming || !streamingState) return null;
    const { streamedContent } = streamingState;

    if (streamedContent.title.length < (content.title?.length || 0)) {
      return 'title';
    }
    if (content.subtitle && streamedContent.subtitle.length < content.subtitle.length) {
      return 'subtitle';
    }
    const originalBullets = content.bulletPoints || [];
    const streamedBullets = streamedContent.bulletPoints;
    if (streamedBullets.length < originalBullets.length) {
      return 'bullet';
    }
    if (streamedBullets.length > 0) {
      const lastBulletIdx = streamedBullets.length - 1;
      if (streamedBullets[lastBulletIdx].length < originalBullets[lastBulletIdx]?.length) {
        return 'bullet';
      }
    }
    return null;
  };

  const cursorPosition = getCursorPosition();
  const cursorVisible = streamingState?.cursorVisible ?? false;

  // Render cover slide
  if (content.type === 'cover') {
    return (
      <div className={`w-full h-full ${themeStyle.bg} flex flex-col relative overflow-hidden`}>
        {/* Header */}
        <div className="absolute top-8 left-10 right-10 flex justify-between items-start">
          <div className={`w-10 h-10 rounded-lg ${themeStyle.accent} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div className={`text-xs font-medium opacity-50 ${themeStyle.text}`}>2025 CONFIDENTIAL</div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-16">
          <div className={`text-sm font-bold uppercase tracking-widest mb-6 ${themeStyle.accentText}`}>
            Business Report
          </div>
          <h1
            className={`text-5xl font-bold mb-6 leading-tight ${themeStyle.text}`}
            style={{ fontFamily: config.titleFont }}
          >
            {getDisplayedTitle()}
            {cursorPosition === 'title' && <TypingCursor visible={cursorVisible} />}
          </h1>
          <p
            className={`text-xl font-light ${themeStyle.sub}`}
            style={{ fontFamily: config.bodyFont }}
          >
            {getDisplayedSubtitle()}
            {cursorPosition === 'subtitle' && <TypingCursor visible={cursorVisible} />}
          </p>
        </div>

        {/* Decorative element */}
        <div className={`absolute bottom-0 right-0 w-1/3 h-full opacity-5 ${themeStyle.text} pointer-events-none`}>
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L100 100 L0 100 Z" />
          </svg>
        </div>
      </div>
    );
  }

  // Render TOC slide
  if (content.type === 'toc') {
    const bullets = getDisplayedBulletPoints();
    return (
      <div className={`w-full h-full ${themeStyle.bg} flex flex-col p-10`}>
        <div className="mb-8">
          <div className={`w-12 h-1 ${themeStyle.accent} mb-4`} />
          <h2
            className={`text-4xl font-bold ${themeStyle.text}`}
            style={{ fontFamily: config.titleFont }}
          >
            {getDisplayedTitle()}
            {cursorPosition === 'title' && <TypingCursor visible={cursorVisible} />}
          </h2>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-6">
          {bullets.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                themeStyle.bg === 'bg-gray-900' ? 'bg-gray-800/50' : 'bg-white/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${themeStyle.accent} flex items-center justify-center text-white font-bold text-sm`}>
                {idx + 1}
              </div>
              <span className={`text-lg ${themeStyle.text}`} style={{ fontFamily: config.bodyFont }}>
                {item}
                {cursorPosition === 'bullet' && idx === bullets.length - 1 && <TypingCursor visible={cursorVisible} />}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render content slide with bullet points
  if (content.type === 'content' || content.type === 'comparison' || content.type === 'summary') {
    const bullets = getDisplayedBulletPoints();
    return (
      <div className={`w-full h-full ${themeStyle.bg} flex flex-col p-10`}>
        <div className="mb-8">
          <div className={`w-12 h-1 ${themeStyle.accent} mb-4`} />
          <h2
            className={`text-3xl font-bold ${themeStyle.text}`}
            style={{ fontFamily: config.titleFont }}
          >
            {getDisplayedTitle()}
            {cursorPosition === 'title' && <TypingCursor visible={cursorVisible} />}
          </h2>
          {content.subtitle && (
            <p className={`mt-2 text-lg ${themeStyle.sub}`}>
              {getDisplayedSubtitle()}
              {cursorPosition === 'subtitle' && <TypingCursor visible={cursorVisible} />}
            </p>
          )}
        </div>
        <div className="flex-1 space-y-4">
          {bullets.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className={`mt-2 w-2 h-2 rounded-full ${themeStyle.accent} flex-shrink-0`} />
              <p
                className={`text-lg leading-relaxed ${themeStyle.text}`}
                style={{ fontFamily: config.bodyFont }}
              >
                {item}
                {cursorPosition === 'bullet' && idx === bullets.length - 1 && <TypingCursor visible={cursorVisible} />}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render chart slide
  if (content.type === 'chart' && content.chartData) {
    const { chartData } = content;
    const maxValue = Math.max(...chartData.values);

    return (
      <div className={`w-full h-full ${themeStyle.bg} flex flex-col p-10`}>
        <div className="mb-6">
          <div className={`w-12 h-1 ${themeStyle.accent} mb-4`} />
          <h2
            className={`text-3xl font-bold ${themeStyle.text}`}
            style={{ fontFamily: config.titleFont }}
          >
            {getDisplayedTitle()}
            {cursorPosition === 'title' && <TypingCursor visible={cursorVisible} />}
          </h2>
          {content.subtitle && (
            <p className={`mt-2 ${themeStyle.sub}`}>{getDisplayedSubtitle()}</p>
          )}
        </div>

        <div className="flex-1 flex items-end justify-center gap-4 pb-8">
          {chartData.type === 'bar' && chartData.values.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={`text-sm font-bold ${themeStyle.text}`}>{value}</div>
              <div
                className={`w-16 rounded-t-lg ${themeStyle.accent} transition-all duration-500`}
                style={{ height: `${(value / maxValue) * 200}px` }}
              />
              <div className={`text-sm ${themeStyle.sub}`}>{chartData.labels[idx]}</div>
            </div>
          ))}

          {chartData.type === 'pie' && (
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {chartData.values.reduce((acc, value, idx) => {
                  const total = chartData.values.reduce((a, b) => a + b, 0);
                  const percentage = (value / total) * 100;
                  const offset = acc.offset;
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

                  acc.elements.push(
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={colors[idx % colors.length]}
                      strokeWidth="20"
                      strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                      strokeDashoffset={-offset * 2.51}
                    />
                  );
                  acc.offset += percentage;
                  return acc;
                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-center ${themeStyle.text}`}>
                  <div className="text-2xl font-bold">{chartData.values.reduce((a, b) => a + b, 0)}%</div>
                </div>
              </div>
            </div>
          )}

          {chartData.type === 'line' && (
            <svg viewBox="0 0 400 200" className="w-full h-48">
              <polyline
                fill="none"
                stroke="#FF3C42"
                strokeWidth="2"
                points={chartData.values.map((v, i) => `${(i / (chartData.values.length - 1)) * 380 + 10},${180 - (v / maxValue) * 160}`).join(' ')}
              />
              {chartData.values.map((v, i) => (
                <circle
                  key={i}
                  cx={(i / (chartData.values.length - 1)) * 380 + 10}
                  cy={180 - (v / maxValue) * 160}
                  r="4"
                  fill="#FF3C42"
                />
              ))}
            </svg>
          )}
        </div>

        {/* Legend */}
        {chartData.type === 'pie' && (
          <div className="flex justify-center gap-4 mt-4">
            {chartData.labels.map((label, idx) => {
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[idx % colors.length] }} />
                  <span className={`text-sm ${themeStyle.sub}`}>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`w-full h-full ${themeStyle.bg} flex items-center justify-center`}>
      <p className={themeStyle.sub}>슬라이드 콘텐츠</p>
    </div>
  );
};

export default SlideContentRenderer;
