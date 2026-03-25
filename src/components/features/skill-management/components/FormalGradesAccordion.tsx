import React, { useState } from 'react';
import { ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import type { EvalAssertion } from '@/types/skill-management.types';

interface FormalGradesAccordionProps {
  assertions: EvalAssertion[];
  label?: string;
}

const FormalGradesAccordion: React.FC<FormalGradesAccordionProps> = ({
  assertions,
  label = '형식화 등급',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const passed = assertions.filter((a) => a.passed).length;
  const failed = assertions.length - passed;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">{label}</span>
          <span className="text-xs text-green-600 font-medium">{passed} passed</span>
          {failed > 0 && (
            <span className="text-xs text-red-500 font-medium">{failed} failed</span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="divide-y divide-gray-100">
          {assertions.map((assertion, idx) => (
            <div key={idx} className="px-4 py-3 flex items-start gap-2.5">
              {assertion.passed ? (
                <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800">{assertion.text}</p>
                <p className="text-xs text-gray-500 mt-0.5">{assertion.evidence}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormalGradesAccordion;
