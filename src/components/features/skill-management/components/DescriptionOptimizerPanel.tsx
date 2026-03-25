import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import TriggerAccuracyChart from './TriggerAccuracyChart';

interface TriggerQuery {
  id: number;
  text: string;
  shouldTrigger: boolean;
}

interface OptimizationResult {
  originalDescription: string;
  optimizedDescription: string;
  accuracy: number;
  iterations: { iteration: number; accuracy: number }[];
  queryResults: { queryId: number; text: string; shouldTrigger: boolean; didTrigger: boolean }[];
}

interface DescriptionOptimizerPanelProps {
  skillTitle: string;
  currentDescription: string;
  onApply?: (newDescription: string) => void;
}

const DescriptionOptimizerPanel: React.FC<DescriptionOptimizerPanelProps> = ({
  skillTitle,
  currentDescription,
  onApply,
}) => {
  const [queries, setQueries] = useState<TriggerQuery[]>([
    { id: 1, text: '', shouldTrigger: true },
    { id: 2, text: '', shouldTrigger: false },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const addQuery = useCallback(() => {
    setQueries((prev) => [
      ...prev,
      { id: Date.now(), text: '', shouldTrigger: true },
    ]);
  }, []);

  const removeQuery = useCallback((id: number) => {
    setQueries((prev) => (prev.length <= 2 ? prev : prev.filter((q) => q.id !== id)));
  }, []);

  const updateQuery = useCallback((id: number, field: 'text' | 'shouldTrigger', value: string | boolean) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setResult(null);

    // Simulate optimization (3 iterations)
    setTimeout(() => {
      const iterations = [
        { iteration: 1, accuracy: 0.55 + Math.random() * 0.15 },
        { iteration: 2, accuracy: 0.72 + Math.random() * 0.12 },
        { iteration: 3, accuracy: 0.85 + Math.random() * 0.12 },
      ];

      const queryResults = queries
        .filter((q) => q.text.trim())
        .map((q) => ({
          queryId: q.id,
          text: q.text,
          shouldTrigger: q.shouldTrigger,
          didTrigger: q.shouldTrigger ? Math.random() > 0.15 : Math.random() > 0.8,
        }));

      setResult({
        originalDescription: currentDescription,
        optimizedDescription: currentDescription + ' 이 스킬은 사용자의 요청에 따라 정확한 결과를 생성합니다.',
        accuracy: iterations[iterations.length - 1].accuracy,
        iterations,
        queryResults,
      });
      setIsRunning(false);
    }, 3000);
  }, [queries, currentDescription]);

  const canRun = queries.filter((q) => q.text.trim()).length >= 2;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          현재 설명
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-600 mb-1">{skillTitle}</p>
          <p className="text-sm text-gray-700">{currentDescription}</p>
        </div>
      </div>

      {/* Trigger queries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            트리거 테스트 쿼리
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={addQuery}
            disabled={queries.length >= 8}
          >
            <Plus size={12} />
            추가
          </Button>
        </div>

        <div className="space-y-2">
          {queries.map((q) => (
            <div key={q.id} className="flex items-center gap-2">
              <button
                onClick={() => updateQuery(q.id, 'shouldTrigger', !q.shouldTrigger)}
                className={`shrink-0 px-2 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  q.shouldTrigger
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-red-600 bg-red-50 border-red-200'
                }`}
              >
                {q.shouldTrigger ? 'Should' : 'Should Not'}
              </button>
              <Input
                value={q.text}
                onChange={(e) => updateQuery(q.id, 'text', e.target.value)}
                placeholder="예: 지난 분기 매출 보고서 작성해줘"
                className="flex-1 bg-white"
              />
              {queries.length > 2 && (
                <button
                  onClick={() => removeQuery(q.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        className="w-full bg-gray-900 hover:bg-black text-white gap-2"
        onClick={handleRun}
        disabled={!canRun || isRunning}
      >
        {isRunning ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            최적화 중...
          </>
        ) : (
          <>
            <Play size={14} />
            설명 최적화 실행
          </>
        )}
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Accuracy chart */}
          <TriggerAccuracyChart iterations={result.iterations} />

          {/* Query results */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              쿼리별 결과
            </h4>
            <div className="space-y-1.5">
              {result.queryResults.map((qr) => {
                const isCorrect = qr.shouldTrigger === qr.didTrigger;
                return (
                  <div
                    key={qr.queryId}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle size={13} className="text-green-500 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-red-500 shrink-0" />
                    )}
                    <span className="text-gray-700 flex-1 truncate">{qr.text}</span>
                    <span className={`shrink-0 font-medium ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {isCorrect ? '정확' : '오류'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optimized description */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs font-bold text-blue-700 mb-2">최적화된 설명</p>
            <p className="text-sm text-blue-900">{result.optimizedDescription}</p>
            {onApply && (
              <Button
                size="sm"
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onApply(result.optimizedDescription)}
              >
                적용하기
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionOptimizerPanel;
