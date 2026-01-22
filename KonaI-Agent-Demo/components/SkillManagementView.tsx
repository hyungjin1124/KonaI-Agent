
import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import SkillUploadModal from './SkillUploadModal';

interface Skill {
  id: string;
  title: string;
  description: string;
  // author field removed
  isEnabled: boolean;
  type: 'my' | 'example';
}

const mockSkills: Skill[] = [
  // Added sample 'my' skills
  {
    id: 'report-generator',
    title: '비즈니스 리포트 생성기',
    description: '원시 데이터를 입력하면 일일 비즈니스 리포트를 자동으로 생성합니다. 일일 스탠드업 회의나 업무 현황 추적에 유용합니다.',
    isEnabled: true,
    type: 'my'
  },
  {
    id: 'email-polisher',
    title: '이메일 교정 도구',
    description: '작성된 초안을 정중하고 명확한 구조의 전문적인 비즈니스 이메일로 다듬어줍니다.',
    isEnabled: true,
    type: 'my'
  },
  {
    id: 'code-optimizer',
    title: 'React 코드 최적화',
    description: 'React 컴포넌트의 성능 문제를 분석하고 메모이제이션(Memoization) 또는 리팩토링 전략을 제안합니다.',
    isEnabled: false,
    type: 'my'
  },
  // Existing example skills (author removed)
  {
    id: 'algorithmic-art',
    title: '알고리즘 아트 생성',
    description: 'p5.js를 활용하여 시드 기반의 랜덤성과 상호작용 가능한 매개변수로 알고리즘 아트를 생성합니다. 코드 기반의 예술 작품을 제작할 때 사용하세요.',
    isEnabled: true,
    type: 'example'
  },
  {
    id: 'brand-guidelines',
    title: '브랜드 가이드라인 적용',
    description: '모든 결과물에 코나아이(KONA I)의 공식 브랜드 색상과 타이포그래피를 적용하여 일관된 룩앤필을 유지하도록 돕습니다.',
    isEnabled: false,
    type: 'example'
  },
  {
    id: 'canvas-design',
    title: '캔버스 디자인 생성',
    description: '디자인 원칙을 적용하여 .png 및 .pdf 형식의 시각 예술 작품을 제작합니다. 포스터나 그래픽 디자인 요청 시 사용하세요.',
    isEnabled: true,
    type: 'example'
  },
  {
    id: 'doc-coauthoring',
    title: '문서 공동 작성 가이드',
    description: '사용자와 함께 문서를 작성하는 구조화된 워크플로우를 제공합니다. 기술 문서, 제안서, 명세서 작성 시 유용합니다.',
    isEnabled: false,
    type: 'example'
  },
  {
    id: 'internal-comms',
    title: '사내 커뮤니케이션 템플릿',
    description: '회사의 표준 양식을 사용하여 공지사항, 뉴스레터 등 다양한 사내 커뮤니케이션 문서를 쉽고 빠르게 작성할 수 있습니다.',
    isEnabled: false,
    type: 'example'
  },
  {
    id: 'mcp-builder',
    title: 'MCP 서버 빌더',
    description: 'LLM이 외부 서비스와 상호작용할 수 있도록 돕는 고품질 MCP(Model Context Protocol) 서버 제작 가이드를 제공합니다.',
    isEnabled: false,
    type: 'example'
  }
];

const SkillItem: React.FC<{ skill: Skill; onToggle: (id: string) => void }> = ({ skill, onToggle }) => {
  return (
    <div className="flex items-start justify-between py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-4 -mx-4 rounded-xl group">
      <div className="flex-1 pr-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">{skill.title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">{skill.description}</p>
        {/* Author display removed */}
      </div>
      
      <div className="flex items-center gap-4 shrink-0 mt-1">
        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={18} />
        </button>
        <button 
          onClick={() => onToggle(skill.id)}
          className={`w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3C42] ${
            skill.isEnabled ? 'bg-[#FF3C42]' : 'bg-gray-200'
          }`}
        >
          <span 
            className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 absolute top-0.5 left-0.5 ${
              skill.isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} 
          />
        </button>
      </div>
    </div>
  );
};

const SkillManagementView: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'example'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggle = (id: string) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, isEnabled: !skill.isEnabled } : skill
    ));
  };

  const handleUpload = (file: File) => {
    // Mock upload logic
    const newSkill: Skill = {
      id: `custom-skill-${Date.now()}`,
      title: file.name.replace(/\.(zip|skill)$/, ''),
      description: '업로드된 사용자 정의 스킬 패키지입니다.',
      // author removed
      isEnabled: true,
      type: 'my'
    };
    setSkills([newSkill, ...skills]);
    setIsModalOpen(false);
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' ? true : skill.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const mySkills = filteredSkills.filter(s => s.type === 'my');
  const exampleSkills = filteredSkills.filter(s => s.type === 'example');

  return (
    <div className="h-full flex flex-col bg-[#F7F9FB] animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">스킬 관리</h2>
            <p className="text-sm text-gray-500 mt-1">에이전트가 사용할 수 있는 스킬을 관리하고 설정합니다.</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 shrink-0">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
          <div className="relative w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="검색" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#FF3C42] focus:ring-1 focus:ring-[#FF3C42] transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <Plus size={16} />
            추가
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-8 shrink-0">
        <div className="w-full max-w-4xl mx-auto flex gap-2">
          <button 
             onClick={() => setActiveTab('all')}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'all' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
          >
              전체
          </button>
          <button 
             onClick={() => setActiveTab('my')}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'my' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
          >
              내 스킬
          </button>
          <button 
             onClick={() => setActiveTab('example')}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'example' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
          >
              스킬 탐색
          </button>
        </div>
      </div>

      {/* Skills List */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          
          {/* My Skills Section */}
          {(activeTab === 'all' || activeTab === 'my') && (
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">내 스킬 ({mySkills.length})</h3>
                {mySkills.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6">
                    {mySkills.map(skill => (
                        <SkillItem key={skill.id} skill={skill} onToggle={handleToggle} />
                    ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                        <p className="text-sm text-gray-500 font-medium">등록된 나만의 스킬이 없습니다.</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-2 text-sm text-[#FF3C42] hover:underline font-bold">스킬 추가하기</button>
                    </div>
                )}
             </div>
          )}

          {/* Example Skills Section */}
          {(activeTab === 'all' || activeTab === 'example') && (
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">스킬 탐색 ({exampleSkills.length})</h3>
                {exampleSkills.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6">
                    {exampleSkills.map(skill => (
                        <SkillItem key={skill.id} skill={skill} onToggle={handleToggle} />
                    ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400">검색 결과가 없습니다.</div>
                )}
             </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <SkillUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpload={handleUpload} 
      />
    </div>
  );
};

export default SkillManagementView;
