
import React, { useState } from 'react';
import { 
  Search, Calendar, MessageSquare, ChevronRight, ArrowLeft, 
  Trash2, Download, User, Bot, Clock, Filter, MoreHorizontal
} from 'lucide-react';

// --- Types ---

interface HistoryMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface HistorySession {
  id: string;
  title: string;
  summary: string;
  date: string;
  time: string;
  messageCount: number;
  tags?: string[];
  messages: HistoryMessage[];
}

// --- Mock Data ---

const MOCK_HISTORY: HistorySession[] = [
  {
    id: 's1',
    title: 'Q4 2025 경영 실적 보고서 분석',
    summary: '2025년 4분기 매출 데이터 분석 및 주요 성장 요인 도출, PPT 초안 생성 요청',
    date: '2025-12-28',
    time: '14:30',
    messageCount: 8,
    tags: ['Report', 'Finance'],
    messages: [
      { id: 'm1', role: 'user', content: 'Q4 2025 경영 실적 보고서 PPT를 만들어주세요.', timestamp: '14:30' },
      { id: 'm2', role: 'ai', content: '네, Q4 2025 경영 실적 보고서 PPT 초안을 생성하겠습니다. 포함되어야 할 주요 섹션이나 강조하고 싶은 데이터가 있으신가요?', timestamp: '14:30' },
      { id: 'm3', role: 'user', content: '매출 성장률과 영업이익 개선 추이를 강조해주세요.', timestamp: '14:31' },
      { id: 'm4', role: 'ai', content: '알겠습니다. 매출 성장률(YoY +13.5%)과 영업이익률 개선(+2.1%p)을 중심으로 장표를 구성했습니다. 아래 초안을 확인해주세요.', timestamp: '14:32' },
    ]
  },
  {
    id: 's2',
    title: 'DID 사업부 원가 효율성 진단',
    summary: '메탈 카드 공정 자동화 도입에 따른 원가 절감 효과 시뮬레이션 및 경쟁사 벤치마킹',
    date: '2025-12-27',
    time: '09:15',
    messageCount: 12,
    tags: ['DID', 'Cost Analysis'],
    messages: [
      { id: 'm1', role: 'user', content: 'DID 사업부의 메탈 카드 원가율 추이를 보여줘.', timestamp: '09:15' },
      { id: 'm2', role: 'ai', content: '현재 DID 사업부의 메탈 카드 원가율은 13.5%로, 전분기 대비 1.7%p 개선되었습니다. 이는 공정 자동화 도입의 효과로 분석됩니다.', timestamp: '09:15' },
    ]
  },
  {
    id: 's3',
    title: '일본 지사 환율 리스크 대응',
    summary: '엔화 약세 지속에 따른 일본 법인 매출 영향 분석 및 1분기 대응 전략 수립',
    date: '2025-12-26',
    time: '16:45',
    messageCount: 5,
    tags: ['Global', 'Risk'],
    messages: [
      { id: 'm1', role: 'user', content: '엔화 환율 변동이 1분기 매출에 미칠 영향은?', timestamp: '16:45' },
      { id: 'm2', role: 'ai', content: '현재 환율(900원/100엔) 지속 시 환차손으로 인해 매출액 기준 약 -5%의 영향이 예상됩니다. 헷징 전략 검토가 필요합니다.', timestamp: '16:46' },
    ]
  },
  {
    id: 's4',
    title: '신규 플랫폼 서비스 기획',
    summary: '지역화폐 연계 신규 모빌리티 서비스 아이디어 브레인스토밍',
    date: '2025-12-20',
    time: '11:20',
    messageCount: 24,
    tags: ['Platform', 'Ideation'],
    messages: []
  },
  {
    id: 's5',
    title: 'React 컴포넌트 최적화 질문',
    summary: '대시보드 렌더링 성능 개선을 위한 코드 리팩토링 조언',
    date: '2025-12-15',
    time: '10:00',
    messageCount: 6,
    tags: ['Development', 'Coding'],
    messages: []
  }
];

// --- Sub Components ---

const HistoryItemCard: React.FC<{ 
  session: HistorySession; 
  onClick: () => void; 
}> = ({ session, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white p-5 rounded-xl border border-gray-200 hover:border-[#FF3C42] hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 relative"
  >
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#FF3C42] transition-colors line-clamp-1">
          {session.title}
        </h3>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Calendar size={12} /> {session.date} &middot; {session.time}
        </span>
      </div>
      <button className="text-gray-300 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal size={16} />
      </button>
    </div>
    
    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
      {session.summary}
    </p>
    
    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
      <div className="flex gap-2">
        {session.tags?.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-md font-medium">
            #{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
        <MessageSquare size={12} />
        {session.messageCount}
      </div>
    </div>
  </div>
);

const ChatBubble: React.FC<{ message: HistoryMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser ? 'bg-[#FF3C42] text-white' : 'bg-gray-900 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${
            isUser 
              ? 'bg-[#FF3C42] text-white rounded-tr-sm' 
              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
          }`}>
            {message.content}
          </div>
          <span className="text-[10px] text-gray-400 mt-1.5 px-1">
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const ChatHistoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistorySession[]>(MOCK_HISTORY);

  // Filter logic
  const filteredHistory = historyData.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    session.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSession = historyData.find(s => s.id === selectedSessionId);

  // Handlers
  const handleDelete = () => {
    if (selectedSessionId && confirm('이 대화 기록을 삭제하시겠습니까?')) {
        setHistoryData(prev => prev.filter(s => s.id !== selectedSessionId));
        setSelectedSessionId(null);
    }
  };

  // --- Render: Detail View ---
  if (selectedSessionId && selectedSession) {
    return (
      <div className="h-full flex flex-col bg-[#F7F9FB] animate-fade-in-up">
        {/* Detail Header */}
        <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedSessionId(null)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{selectedSession.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} /> {selectedSession.date} {selectedSession.time}
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{selectedSession.messageCount} messages</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="내보내기">
              <Download size={18} />
            </button>
            <button 
                onClick={handleDelete}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                title="삭제"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Detail Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto pb-10">
            {selectedSession.messages.length > 0 ? (
                selectedSession.messages.map(msg => (
                    <ChatBubble key={msg.id} message={msg} />
                ))
            ) : (
                <div className="text-center py-20 text-gray-400 text-sm">
                    저장된 메시지 내용이 없습니다.
                </div>
            )}
          </div>
        </div>
        
        {/* Read-only Input Indicator */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
            이 대화는 종료되었습니다. 새로운 대화를 시작하려면 <span className="font-bold text-black cursor-pointer">새 채팅</span>을 이용해주세요.
        </div>
      </div>
    );
  }

  // --- Render: List View ---
  return (
    <div className="h-full flex flex-col bg-[#F7F9FB] animate-fade-in-up">
      {/* Header */}
      <div className="px-8 py-8 shrink-0">
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">대화 기록 (Chat History)</h1>
            <p className="text-sm text-gray-500">AI 에이전트와 나누었던 과거 대화 내용을 검색하고 관리하세요.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 pb-6 shrink-0 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="대화 주제, 내용 검색..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#FF3C42] focus:ring-1 focus:ring-[#FF3C42] transition-all shadow-sm"
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold transition-colors shadow-sm">
                <Filter size={16} /> 필터
            </button>
        </div>
      </div>

      {/* List Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto">
            {filteredHistory.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {filteredHistory.map(session => (
                        <HistoryItemCard 
                            key={session.id} 
                            session={session} 
                            onClick={() => setSelectedSessionId(session.id)} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">검색 결과가 없습니다.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryView;
