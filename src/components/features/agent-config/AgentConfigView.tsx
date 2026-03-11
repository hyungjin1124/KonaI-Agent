/**
 * AgentConfigView — Agent Configuration Management
 *
 * Sectioned card form for managing agent settings:
 * 1. Basic Info (name, description, avatar)
 * 2. Model Selection (model dropdown, temperature, max tokens)
 * 3. Capabilities (feature toggles)
 * 4. System Prompt (textarea + char count)
 * 5. Content Moderation (sensitivity slider)
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Bot, Save, Cpu, Globe, Code, Upload, Image, Database, Mail, Shield, Loader2,
  Check, Info,
} from '../../../components/icons';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  type AgentConfig,
  type AgentCapability,
  AVAILABLE_MODELS,
  MODERATION_LEVELS,
  INITIAL_AGENT_CONFIG,
  AVATAR_COLORS,
} from './agentConfigData';

// --- Icon mapping for capabilities ---
const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  web_search: <Globe size={16} />,
  code_execution: <Code size={16} />,
  file_upload: <Upload size={16} />,
  image_generation: <Image size={16} />,
  data_analysis: <Database size={16} />,
  email_integration: <Mail size={16} />,
};

// --- Section Card wrapper ---
function SectionCard({ title, description, children, testId }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6" data-testid={testId}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// --- Main Component ---
export function AgentConfigView() {
  const [config, setConfig] = useState<AgentConfig>(INITIAL_AGENT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<AgentConfig>(INITIAL_AGENT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(savedConfig),
    [config, savedConfig]
  );

  const promptCharCount = config.systemPrompt.length;
  const currentModeration = MODERATION_LEVELS.find(l => l.value === config.moderationLevel)
    ?? MODERATION_LEVELS[2];

  const updateConfig = useCallback(<K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setShowSaveSuccess(false);
  }, []);

  const toggleCapability = useCallback((capId: string) => {
    setConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities.map(c =>
        c.id === capId ? { ...c, enabled: !c.enabled } : c
      ),
    }));
    setShowSaveSuccess(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSavedConfig({ ...config });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  }, [config]);

  return (
    <div className="space-y-6" data-testid="agent-config-view">
      {/* Section 1: Basic Info */}
      <SectionCard
        title="기본 정보"
        description="에이전트의 이름, 설명, 아바타를 설정합니다."
        testId="section-basic-info"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <Label className="text-xs font-bold text-gray-500 uppercase mb-2 block">아바타</Label>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm"
                style={{ backgroundColor: config.avatarColor }}
                data-testid="agent-avatar"
              >
                <Bot size={28} />
              </div>
              <div className="flex gap-1.5 mt-2">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      config.avatarColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateConfig('avatarColor', color)}
                    aria-label={`아바타 색상 ${color}`}
                  />
                ))}
              </div>
            </div>
            {/* Name + Description */}
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="agent-name" className="text-xs font-bold text-gray-500 uppercase">에이전트 이름</Label>
                <Input
                  id="agent-name"
                  value={config.name}
                  onChange={e => updateConfig('name', e.target.value)}
                  placeholder="에이전트 이름을 입력하세요"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="agent-description" className="text-xs font-bold text-gray-500 uppercase">설명</Label>
                <Textarea
                  id="agent-description"
                  value={config.description}
                  onChange={e => updateConfig('description', e.target.value)}
                  placeholder="에이전트의 역할과 용도를 설명하세요"
                  className="mt-1 min-h-[60px]"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Section 2: Model Settings */}
      <SectionCard
        title="모델 설정"
        description="사용할 AI 모델과 생성 파라미터를 설정합니다."
        testId="section-model"
      >
        <div className="space-y-5">
          {/* Model Select */}
          <div>
            <Label className="text-xs font-bold text-gray-500 uppercase">AI 모델</Label>
            <Select
              value={config.selectedModel}
              onValueChange={v => updateConfig('selectedModel', v)}
            >
              <SelectTrigger className="mt-1" data-testid="model-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="text-gray-400 shrink-0" />
                      <div>
                        <span className="font-medium">{model.name}</span>
                        <span className="text-gray-400 ml-1.5 text-xs">{model.provider}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(() => {
              const selected = AVAILABLE_MODELS.find(m => m.id === config.selectedModel);
              return selected ? (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info size={12} /> {selected.description}
                </p>
              ) : null;
            })()}
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="temperature" className="text-xs font-bold text-gray-500 uppercase">Temperature</Label>
              <span className="text-sm font-mono font-bold text-gray-700" data-testid="temperature-value">{config.temperature.toFixed(1)}</span>
            </div>
            <input
              id="temperature"
              type="range"
              role="slider"
              min={0}
              max={2}
              step={0.1}
              value={config.temperature}
              onChange={e => updateConfig('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Temperature"
              aria-valuemin={0}
              aria-valuemax={2}
              aria-valuenow={config.temperature}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>정확 (0.0)</span>
              <span>균형 (1.0)</span>
              <span>창의적 (2.0)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="max-tokens" className="text-xs font-bold text-gray-500 uppercase">Max Tokens</Label>
              <span className="text-sm font-mono font-bold text-gray-700" data-testid="max-tokens-value">{config.maxTokens.toLocaleString()}</span>
            </div>
            <input
              id="max-tokens"
              type="range"
              role="slider"
              min={256}
              max={16384}
              step={256}
              value={config.maxTokens}
              onChange={e => updateConfig('maxTokens', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Max Tokens"
              aria-valuemin={256}
              aria-valuemax={16384}
              aria-valuenow={config.maxTokens}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>256</span>
              <span>8,192</span>
              <span>16,384</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Capabilities */}
      <SectionCard
        title="기능 설정"
        description="에이전트가 사용할 수 있는 도구와 기능을 활성화/비활성화합니다."
        testId="section-capabilities"
      >
        <div className="space-y-1">
          {config.capabilities.map((cap: AgentCapability) => (
            <div
              key={cap.id}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  cap.enabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {CAPABILITY_ICONS[cap.id] ?? <Bot size={16} />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{cap.name}</div>
                  <div className="text-xs text-gray-500">{cap.description}</div>
                </div>
              </div>
              <Switch
                checked={cap.enabled}
                onCheckedChange={() => toggleCapability(cap.id)}
                aria-label={`${cap.name} 토글`}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 4: System Prompt */}
      <SectionCard
        title="시스템 프롬프트"
        description="에이전트의 기본 행동 지침을 정의합니다."
        testId="section-prompt"
      >
        <div>
          <Textarea
            value={config.systemPrompt}
            onChange={e => updateConfig('systemPrompt', e.target.value)}
            placeholder="에이전트에게 전달할 시스템 프롬프트를 작성하세요..."
            className="min-h-[200px] font-mono text-sm"
            aria-label="시스템 프롬프트"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">
              에이전트의 성격, 응답 스타일, 제한 사항 등을 명시하세요.
            </p>
            <span className={`text-xs font-mono ${promptCharCount > 4000 ? 'text-amber-600 font-bold' : 'text-gray-400'}`} data-testid="char-count">
              {promptCharCount.toLocaleString()}자
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Section 5: Content Moderation */}
      <SectionCard
        title="콘텐츠 모더레이션"
        description="에이전트 응답의 안전 수준을 설정합니다."
        testId="section-moderation"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="moderation" className="text-xs font-bold text-gray-500 uppercase">감도 수준</Label>
            <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
              config.moderationLevel <= 2
                ? 'bg-green-50 text-green-700'
                : config.moderationLevel <= 3
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'
            }`} data-testid="moderation-label">
              {currentModeration.label}
            </span>
          </div>
          <input
            id="moderation"
            type="range"
            role="slider"
            min={1}
            max={5}
            step={1}
            value={config.moderationLevel}
            onChange={e => updateConfig('moderationLevel', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            aria-label="콘텐츠 모더레이션 감도"
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={config.moderationLevel}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-0.5">
            {MODERATION_LEVELS.map(l => (
              <span key={l.value} className={config.moderationLevel === l.value ? 'font-bold text-gray-600' : ''}>
                {l.label}
              </span>
            ))}
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-start gap-2">
              <Shield size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600">{currentModeration.description}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Save Bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm p-4" data-testid="save-bar">
        <div className="text-xs text-gray-400">
          마지막 수정: {config.lastModified} by {config.lastModifiedBy}
        </div>
        <div className="flex items-center gap-3">
          {showSaveSuccess && (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium" data-testid="save-success">
              <Check size={16} /> 저장 완료
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> 저장 중...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" /> 설정 저장
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
