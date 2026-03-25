import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Play } from 'lucide-react';

export interface TestCase {
  id: number;
  prompt: string;
  expectedOutput: string;
}

interface TestCaseFormProps {
  onRun: (testCases: TestCase[]) => void;
  isRunning?: boolean;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({ onRun, isRunning = false }) => {
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 1, prompt: '', expectedOutput: '' },
  ]);

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { id: Date.now(), prompt: '', expectedOutput: '' },
    ]);
  };

  const removeTestCase = (id: number) => {
    if (testCases.length <= 1) return;
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  };

  const updateTestCase = (id: number, field: 'prompt' | 'expectedOutput', value: string) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    );
  };

  const canRun = testCases.some((tc) => tc.prompt.trim());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          테스트 케이스 ({testCases.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={addTestCase}
          disabled={testCases.length >= 5}
        >
          <Plus size={12} />
          추가
        </Button>
      </div>

      <div className="space-y-3">
        {testCases.map((tc, i) => (
          <div key={tc.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-500">테스트 #{i + 1}</span>
              {testCases.length > 1 && (
                <button
                  onClick={() => removeTestCase(tc.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">테스트 프롬프트</label>
              <Input
                value={tc.prompt}
                onChange={(e) => updateTestCase(tc.id, 'prompt', e.target.value)}
                placeholder="예: 지난 분기 매출 보고서를 요약해줘"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">예상 결과 (선택)</label>
              <textarea
                value={tc.expectedOutput}
                onChange={(e) => updateTestCase(tc.id, 'expectedOutput', e.target.value)}
                placeholder="예: 주요 지표와 전분기 대비 변화를 포함한 요약"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none bg-white"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        className="w-full bg-gray-900 hover:bg-black text-white gap-2"
        onClick={() => onRun(testCases)}
        disabled={!canRun || isRunning}
      >
        <Play size={14} />
        {isRunning ? 'Eval 실행 중...' : 'Eval 실행'}
      </Button>
    </div>
  );
};

export default TestCaseForm;
