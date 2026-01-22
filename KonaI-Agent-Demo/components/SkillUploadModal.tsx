
import React, { useRef, useState } from 'react';
import { X, Upload, FileArchive } from 'lucide-react';

interface SkillUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const SkillUploadModal: React.FC<SkillUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[#1A1A1A] w-[500px] rounded-xl border border-gray-700 shadow-2xl overflow-hidden text-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">스킬 업로드</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
              h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
              ${isDragging 
                ? 'border-[#FF3C42] bg-[#FF3C42]/10' 
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              }
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".zip,.skill"
            />
            <div className="p-4 bg-gray-700 rounded-lg mb-3">
              {isDragging ? <Upload size={24} className="text-[#FF3C42]" /> : <FileArchive size={24} className="text-gray-400" />}
            </div>
            <p className="text-sm font-medium text-gray-300 mb-1">
              드래그 앤 드롭하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-gray-500">
              .zip 또는 .skill 파일 지원
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-bold text-gray-400">파일 요구사항</h4>
            <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
              <li>.md 파일에는 YAML 형식의 스킬 이름과 설명이 포함되어야 합니다</li>
              <li>.zip 또는 .skill 파일에는 SKILL.md 파일이 포함되어야 합니다</li>
            </ul>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
             <a href="#" className="text-xs text-gray-400 hover:text-[#FF3C42] underline decoration-gray-600 underline-offset-2">스킬 생성에 대해 자세히 알아보기 또는 예시 보기</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillUploadModal;
