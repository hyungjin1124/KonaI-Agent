
import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, ArrowUp, Paperclip, X
} from 'lucide-react';
import LiveboardView from './LiveboardView';
import { AgentContextData } from '../types';

interface ScenarioTriggerData {
  context: AgentContextData | null;
  query: string;
}

interface ChatInterfaceProps {
  onScenarioTrigger?: () => void;
  onAskAgent?: (data: ScenarioTriggerData) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onScenarioTrigger, onAskAgent }) => {
  const [inputValue, setInputValue] = useState('');
  const [activeContext, setActiveContext] = useState<AgentContextData | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset to auto to allow shrinking
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
      const trimmedInput = inputValue.trim();
      if (!trimmedInput) return;

      // 1. PPT Demo Scenario Trigger (Enhanced Fuzzy Match)
      // Matches: "Q4 2025... PPT...", "PPT 생성", "보고서 PPT 만들어줘" etc.
      if (trimmedInput.includes("PPT") && (trimmedInput.includes("보고서") || trimmedInput.includes("생성") || trimmedInput.includes("Q4") || trimmedInput.includes("만들어"))) {
          onScenarioTrigger?.();
          return;
      }

      // 2. Default Analysis / General Query Handler
      if (onAskAgent) {
          // Pass query regardless of whether context exists
          onAskAgent({ 
              context: activeContext, 
              query: trimmedInput 
          });
      }
      
      setInputValue('');
  };

  const handleWidgetContextSelect = (data: AgentContextData) => {
      setActiveContext(data);
      // Optional: Focus the textarea when context is selected
      if (textareaRef.current) {
          textareaRef.current.focus();
      }
  };

  return (
    <div data-testid="dashboard-container" className="flex flex-col w-full h-full bg-[#F7F9FB]">
      {/* Top Input Section */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4 shrink-0 z-10">
        <div className="max-w-4xl mx-auto">
            <div className={`relative bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] focus-within:border-[#FF3C42] focus-within:ring-1 focus-within:ring-[#FF3C42] transition-all shadow-sm flex items-end p-2 gap-2 ${activeContext ? 'pt-10' : ''}`}>
                
                {/* Context Chip Overlay */}
                {activeContext && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100 animate-fade-in-up z-10">
                        <Paperclip size={12} />
                        <span>Context: {activeContext.name} 데이터</span>
                        <button 
                            onClick={() => setActiveContext(null)} 
                            className="ml-1 hover:text-blue-900 rounded-full hover:bg-blue-100 p-0.5 transition-colors"
                        >
                            <X size={12}/>
                        </button>
                    </div>
                )}

                <button className="p-2 mb-0.5 text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50 rounded-lg transition-colors">
                    <Plus size={20} />
                </button>
                
                <textarea
                    ref={textareaRef}
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-[#848383] text-sm font-medium resize-none py-2.5 max-h-[120px] overflow-y-auto custom-scrollbar leading-relaxed"
                    placeholder="데이터 분석, 보고서 생성, 또는 업무 지시를 입력하세요..."
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                
                <div className="flex items-center gap-1 mb-0.5">
                    <button 
                        className={`p-2 rounded-lg transition-all ${inputValue.trim() ? 'bg-[#FF3C42] text-white shadow-sm' : 'bg-gray-100 text-[#848383] cursor-not-allowed'}`}
                        disabled={!inputValue.trim()}
                        onClick={handleSend}
                    >
                        <ArrowUp size={20} />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Main Dashboard Section */}
      <div className="flex-1 overflow-hidden relative">
         {/* Pass the local handler to intercept the widget's 'Ask Agent' event */}
         <LiveboardView onAskAgent={handleWidgetContextSelect} />
      </div>
    </div>
  );
};

export default ChatInterface;
