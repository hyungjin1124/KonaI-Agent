import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, BarChart3 } from 'lucide-react';
import { TestCase } from './TestCaseForm';

interface EvalRunResult {
  testCaseId: number;
  prompt: string;
  withSkill: { passed: boolean; score: number; timeMs: number };
  withoutSkill: { passed: boolean; score: number; timeMs: number };
}

interface EvalRunnerPanelProps {
  testCases: TestCase[];
  isRunning: boolean;
  onStart: () => void;
  onDone: () => void;
}

const EvalRunnerPanel: React.FC<EvalRunnerPanelProps> = ({
  testCases,
  isRunning,
  onStart,
  onDone,
}) => {
  const [results, setResults] = useState<EvalRunResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const runSimulation = useCallback(() => {
    if (testCases.length === 0) return;
    setResults([]);
    setProgress(0);
    setIsDone(false);
    onStart();

    const total = testCases.length * 2; // with + without per case
    let step = 0;

    testCases.forEach((tc, i) => {
      setTimeout(() => {
        step++;
        setProgress(Math.round((step / total) * 100));
      }, (i + 1) * 800);

      setTimeout(() => {
        step++;
        setProgress(Math.round((step / total) * 100));

        const result: EvalRunResult = {
          testCaseId: tc.id,
          prompt: tc.prompt,
          withSkill: {
            passed: Math.random() > 0.2,
            score: 0.7 + Math.random() * 0.3,
            timeMs: 800 + Math.random() * 2000,
          },
          withoutSkill: {
            passed: Math.random() > 0.5,
            score: 0.4 + Math.random() * 0.4,
            timeMs: 1200 + Math.random() * 3000,
          },
        };
        setResults((prev) => [...prev, result]);

        if (i === testCases.length - 1) {
          setIsDone(true);
        }
      }, (i + 1) * 1600);
    });
  }, [testCases, onStart]);

  useEffect(() => {
    if (isRunning && results.length === 0) {
      runSimulation();
    }
  }, [isRunning, results.length, runSimulation]);

  if (!isRunning && results.length === 0) return null;

  const withSkillPassRate = results.length > 0
    ? results.filter((r) => r.withSkill.passed).length / results.length
    : 0;
  const withoutSkillPassRate = results.length > 0
    ? results.filter((r) => r.withoutSkill.passed).length / results.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Eval 실행 결과
        </h3>
        {isDone && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onDone}>
            완료
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {!isDone && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              실행 중...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {isDone && results.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
            <p className="text-xs text-green-600 mb-1">With Skill</p>
            <p className="text-lg font-bold text-green-700">
              {Math.round(withSkillPassRate * 100)}%
            </p>
            <p className="text-xs text-green-500">{results.filter((r) => r.withSkill.passed).length}/{results.length} 통과</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Without Skill</p>
            <p className="text-lg font-bold text-gray-700">
              {Math.round(withoutSkillPassRate * 100)}%
            </p>
            <p className="text-xs text-gray-400">{results.filter((r) => r.withoutSkill.passed).length}/{results.length} 통과</p>
          </div>
        </div>
      )}

      {/* Individual results */}
      {results.map((r) => (
        <div key={r.testCaseId} className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-2 truncate" title={r.prompt}>
            <BarChart3 size={11} className="inline mr-1" />
            {r.prompt}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-lg p-2 text-center ${r.withSkill.passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {r.withSkill.passed ? (
                  <CheckCircle size={12} className="text-green-500" />
                ) : (
                  <XCircle size={12} className="text-red-500" />
                )}
                <span className="text-xs font-medium">With Skill</span>
              </div>
              <p className="text-xs text-gray-500">
                {Math.round(r.withSkill.score * 100)}점 · {Math.round(r.withSkill.timeMs)}ms
              </p>
            </div>
            <div className={`rounded-lg p-2 text-center ${r.withoutSkill.passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {r.withoutSkill.passed ? (
                  <CheckCircle size={12} className="text-green-500" />
                ) : (
                  <XCircle size={12} className="text-red-500" />
                )}
                <span className="text-xs font-medium">Without Skill</span>
              </div>
              <p className="text-xs text-gray-500">
                {Math.round(r.withoutSkill.score * 100)}점 · {Math.round(r.withoutSkill.timeMs)}ms
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EvalRunnerPanel;
