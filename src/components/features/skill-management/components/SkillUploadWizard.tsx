import React, { useRef, useState } from 'react';
import { Upload, FileArchive, Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkillCategory, SkillSource, SKILL_CATEGORIES } from '@/types/skill-management.types';

interface UploadMeta {
  title: string;
  description: string;
  category: SkillCategory;
  tags?: string[];
  source?: SkillSource;
  activateImmediately?: boolean;
}

interface SkillUploadWizardProps {
  isOpen: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  onUpload: (file: File, meta: UploadMeta) => void;
}

type Step = 'upload' | 'confirm';

const ALLOWED_EXTENSIONS = ['.zip', '.skill'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// 카테고리 선택 옵션 ('all' 제외)
const CATEGORY_OPTIONS = SKILL_CATEGORIES.filter((c) => c.id !== 'all') as { id: SkillCategory; label: string; emoji: string }[];

const SkillUploadWizard: React.FC<SkillUploadWizardProps> = ({ isOpen, isAdmin = false, onClose, onUpload }) => {
  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SkillCategory>('document');
  const [tagsInput, setTagsInput] = useState('');
  const [source, setSource] = useState<SkillSource>('personal');
  const [activateImmediately, setActivateImmediately] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setCategory('document');
    setTagsInput('');
    setSource('personal');
    setActivateImmediately(false);
    setFileError(null);
    onClose();
  };

  // QW-12: 파일 유형/크기 검증
  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `.zip 또는 .skill 파일만 업로드할 수 있습니다.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `파일 크기는 50MB 이하여야 합니다. (현재: ${formatSize(file.size)})`;
    }
    return null;
  };

  const handleFileSelected = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
    setTitle(file.name.replace(/\.(zip|skill)$/, ''));
    setStep('confirm');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelected(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
  };

  // QW-9: category 포함 + Phase 2: tags, source, activateImmediately
  const handleConfirm = () => {
    if (selectedFile && title.trim()) {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      onUpload(selectedFile, {
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        source,
        activateImmediately,
      });
      handleClose();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' ? '스킬 업로드' : '스킬 정보 확인'}
          </DialogTitle>
        </DialogHeader>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#FF3C42] bg-[#FF3C42]/5'
                  : fileError
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".zip,.skill"
              />
              <div className="p-3 bg-gray-100 rounded-xl mb-3">
                {isDragging ? (
                  <Upload size={22} className="text-[#FF3C42]" />
                ) : (
                  <FileArchive size={22} className="text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                드래그 앤 드롭 또는 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-400">.zip 또는 .skill 파일 지원 (최대 50MB)</p>
            </div>

            {/* QW-12: 파일 검증 오류 표시 */}
            {fileError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="shrink-0" />
                {fileError}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-500 mb-2">파일 요구사항</p>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <AlertCircle size={12} className="text-gray-400 mt-0.5 shrink-0" />
                SKILL.md 파일이 포함되어야 합니다 (YAML frontmatter 포함)
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <AlertCircle size={12} className="text-gray-400 mt-0.5 shrink-0" />
                name, description 필드가 필수입니다
              </div>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedFile && (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
              </div>
            </div>

            {/* Editable meta */}
            <div className="space-y-3">
              {/* FI-4: 필수 마크(*) 추가 */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">
                  스킬 이름 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="스킬 이름을 입력하세요"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">설명 (선택)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="스킬에 대한 간단한 설명을 입력하세요"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>
              {/* QW-9: 카테고리 선택 */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SkillCategory)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phase 2: 태그 입력 */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">태그 (선택)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="예: 보고서, 자동화, 데이터 (쉼표 구분)"
                  className="text-sm"
                />
                {tagsInput && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tagsInput.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Phase 2: 관리자용 source 선택 */}
              {isAdmin && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">공개 범위</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'personal' as SkillSource, label: '개인 전용' },
                      { id: 'org' as SkillSource, label: '조직 배포' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border cursor-pointer transition-colors text-xs font-medium ${
                          source === opt.id
                            ? 'border-gray-900 bg-gray-50 text-gray-900'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="source"
                          value={opt.id}
                          checked={source === opt.id}
                          onChange={() => setSource(opt.id)}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 2: 즉시 활성화 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activateImmediately}
                  onChange={(e) => setActivateImmediately(e.target.checked)}
                  className="rounded border-gray-300 accent-gray-900"
                />
                <span className="text-xs text-gray-700">업로드 후 바로 활성화</span>
              </label>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'confirm' && (
            <Button variant="outline" onClick={() => setStep('upload')}>
              이전
            </Button>
          )}
          {step === 'confirm' && (
            <Button
              onClick={handleConfirm}
              disabled={!title.trim()}
              className="bg-[#1A1A1A] hover:bg-black text-white"
            >
              스킬 추가
            </Button>
          )}
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SkillUploadWizard;
