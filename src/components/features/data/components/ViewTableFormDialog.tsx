'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DOMAIN_LIST } from '../data/viewTableMockData';
import type {
  ViewTable,
  NonErpFormData,
  NonErpSourceType,
  ViewTableDomain,
  JiraSourceConfig,
  ExcelSourceConfig,
  ApiSourceConfig,
  EtcSourceConfig,
} from '../types/data.types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ViewTableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingViewTable: ViewTable | null;
  onSave: (data: NonErpFormData) => void;
}

const SOURCE_TYPES: NonErpSourceType[] = ['Jira', 'Excel', 'API', '기타'];

// ── Component ─────────────────────────────────────────────────────────────────

export function ViewTableFormDialog({
  open,
  onOpenChange,
  editingViewTable,
  onSave,
}: ViewTableFormDialogProps) {
  const isEdit = editingViewTable !== null;

  const [viewId, setViewId] = useState('');
  const [viewName, setViewName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState<NonErpSourceType>('Jira');
  const [domain, setDomain] = useState<ViewTableDomain>('생산');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Jira config
  const [jiraUrl, setJiraUrl] = useState('');
  const [jiraProject, setJiraProject] = useState('');
  const [jiraJql, setJiraJql] = useState('');
  const [jiraAuthMethod, setJiraAuthMethod] = useState<JiraSourceConfig['authMethod']>('api_token');
  const [jiraAuthCredential, setJiraAuthCredential] = useState('');

  // Excel config
  const [excelFileName, setExcelFileName] = useState('');
  const [excelSheet, setExcelSheet] = useState('');
  const [excelHeaderRow, setExcelHeaderRow] = useState('1');

  // API config
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiMethod, setApiMethod] = useState<ApiSourceConfig['httpMethod']>('GET');
  const [apiAuthMethod, setApiAuthMethod] = useState<ApiSourceConfig['authMethod']>('bearer');
  const [apiAuthCredential, setApiAuthCredential] = useState('');
  const [apiBody, setApiBody] = useState('');
  const [apiMapping, setApiMapping] = useState('');

  // 기타 config
  const [etcDescription, setEtcDescription] = useState('');
  const [etcOwner, setEtcOwner] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setErrors({});
      if (editingViewTable) {
        setViewId(editingViewTable.viewId);
        setViewName(editingViewTable.viewName);
        setDescription(editingViewTable.description);
        setSourceType((editingViewTable.sourceType as NonErpSourceType) ?? 'Jira');
        setDomain(editingViewTable.domain);
        setIsActive(editingViewTable.isActive);
        // restore source config if it exists
        const sc = editingViewTable.sourceConfig;
        if (sc && 'jiraUrl' in sc) {
          setJiraUrl(sc.jiraUrl);
          setJiraProject(sc.projectKey);
          setJiraJql(sc.jqlQuery);
          setJiraAuthMethod(sc.authMethod);
          setJiraAuthCredential(sc.authCredential ?? '');
        } else if (sc && 'fileName' in sc) {
          setExcelFileName(sc.fileName);
          setExcelSheet(sc.sheetName);
          setExcelHeaderRow(String(sc.headerRow));
        } else if (sc && 'endpoint' in sc) {
          setApiEndpoint(sc.endpoint);
          setApiMethod(sc.httpMethod);
          setApiAuthMethod(sc.authMethod);
          setApiAuthCredential(sc.authCredential ?? '');
          setApiBody(sc.requestBody ?? '');
          setApiMapping(sc.responseMapping ?? '');
        } else if (sc && 'owner' in sc) {
          setEtcDescription(sc.description);
          setEtcOwner(sc.owner);
        }
      } else {
        setViewId('');
        setViewName('');
        setDescription('');
        setSourceType('Jira');
        setDomain('생산');
        setIsActive(true);
        setJiraUrl('');
        setJiraProject('');
        setJiraJql('');
        setJiraAuthMethod('api_token');
        setJiraAuthCredential('');
        setExcelFileName('');
        setExcelSheet('');
        setExcelHeaderRow('1');
        setApiEndpoint('');
        setApiMethod('GET');
        setApiAuthMethod('bearer');
        setApiAuthCredential('');
        setApiBody('');
        setApiMapping('');
        setEtcDescription('');
        setEtcOwner('');
      }
    }
  }, [open, editingViewTable]);

  const buildSourceConfig = () => {
    if (sourceType === 'Jira') {
      return { jiraUrl, projectKey: jiraProject, jqlQuery: jiraJql, authMethod: jiraAuthMethod, authCredential: jiraAuthCredential || undefined } satisfies JiraSourceConfig;
    }
    if (sourceType === 'Excel') {
      return { fileName: excelFileName, sheetName: excelSheet, headerRow: parseInt(excelHeaderRow, 10) || 1 } satisfies ExcelSourceConfig;
    }
    if (sourceType === 'API') {
      return { endpoint: apiEndpoint, httpMethod: apiMethod, authMethod: apiAuthMethod, authCredential: apiAuthCredential || undefined, requestBody: apiBody || undefined, responseMapping: apiMapping || undefined } satisfies ApiSourceConfig;
    }
    return { description: etcDescription, owner: etcOwner } satisfies EtcSourceConfig;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!viewId.trim()) newErrors.viewId = '필수 항목입니다.';
    if (!viewName.trim()) newErrors.viewName = '필수 항목입니다.';
    if (sourceType === 'Jira' && !jiraUrl.trim()) newErrors.jiraUrl = '필수 항목입니다.';
    if (sourceType === 'API' && !apiEndpoint.trim()) newErrors.apiEndpoint = '필수 항목입니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      viewId,
      viewName,
      description,
      sourceType,
      sourceConfig: buildSourceConfig(),
      domain,
      isActive,
    });
    onOpenChange(false);
  };

  const clearError = (key: string) => {
    if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? <p className="text-xs text-red-500 mt-1">{errors[name]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? '비ERP 데이터 소스 수정' : '비ERP 데이터 소스 등록'}
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            ERP 뷰테이블은 백엔드 마이그레이션으로 등록됩니다. 이 화면에서는 비ERP 소스만 등록 가능합니다.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* view_id */}
          <div className="space-y-1.5">
            <Label className="text-xs">뷰테이블 ID <span className="text-red-500">*</span></Label>
            <Input
              value={viewId}
              onChange={(e) => { setViewId(e.target.value); clearError('viewId'); }}
              placeholder="v_jira_status"
              disabled={isEdit}
              className={`text-sm h-9 ${errors.viewId ? 'border-red-400' : ''}`}
            />
            <FieldError name="viewId" />
          </div>

          {/* view_name */}
          <div className="space-y-1.5">
            <Label className="text-xs">표시명 <span className="text-red-500">*</span></Label>
            <Input
              value={viewName}
              onChange={(e) => { setViewName(e.target.value); clearError('viewName'); }}
              placeholder="Jira 이슈 현황"
              className={`text-sm h-9 ${errors.viewName ? 'border-red-400' : ''}`}
            />
            <FieldError name="viewName" />
          </div>

          {/* description */}
          <div className="space-y-1.5">
            <Label className="text-xs">설명</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="에이전트가 질의에 적합한 뷰를 선택할 때 참조하는 설명"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              rows={2}
            />
          </div>

          {/* source_type */}
          <div className="space-y-1.5">
            <Label className="text-xs">소스 유형 <span className="text-red-500">*</span></Label>
            <Select value={sourceType} onValueChange={(v) => setSourceType(v as NonErpSourceType)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPES.map((st) => (
                  <SelectItem key={st} value={st}>{st}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* source_config — dynamic by sourceType */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600">{sourceType} 연결 설정</p>

            {sourceType === 'Jira' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Jira URL <span className="text-red-500">*</span></Label>
                  <Input value={jiraUrl} onChange={(e) => { setJiraUrl(e.target.value); clearError('jiraUrl'); }} placeholder="https://jira.example.com" className={`text-sm h-9 ${errors.jiraUrl ? 'border-red-400' : ''}`} />
                  <FieldError name="jiraUrl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">프로젝트 키</Label>
                  <Input value={jiraProject} onChange={(e) => setJiraProject(e.target.value)} placeholder="PROJ" className="text-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">JQL 쿼리</Label>
                  <Input value={jiraJql} onChange={(e) => setJiraJql(e.target.value)} placeholder='status = "Done"' className="text-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">인증 방식</Label>
                  <Select value={jiraAuthMethod} onValueChange={(v) => setJiraAuthMethod(v as JiraSourceConfig['authMethod'])}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_token">API Token</SelectItem>
                      <SelectItem value="oauth">OAuth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {jiraAuthMethod === 'api_token' ? 'API Token' : 'OAuth Token'}
                  </Label>
                  <Input
                    type="password"
                    value={jiraAuthCredential}
                    onChange={(e) => setJiraAuthCredential(e.target.value)}
                    placeholder={jiraAuthMethod === 'api_token' ? 'Jira API Token 입력' : 'OAuth Access Token 입력'}
                    className="text-sm h-9"
                  />
                </div>
              </>
            )}

            {sourceType === 'Excel' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">파일 업로드</Label>
                  <Input type="file" accept=".xlsx,.xls" className="text-sm h-9" onChange={(e) => setExcelFileName(e.target.files?.[0]?.name ?? '')} />
                  {excelFileName && <p className="text-xs text-gray-500">{excelFileName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">시트명</Label>
                  <Input value={excelSheet} onChange={(e) => setExcelSheet(e.target.value)} placeholder="Sheet1" className="text-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">헤더 행</Label>
                  <Input type="number" value={excelHeaderRow} onChange={(e) => setExcelHeaderRow(e.target.value)} placeholder="1" className="text-sm h-9 w-24" />
                </div>
              </>
            )}

            {sourceType === 'API' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">API 엔드포인트 <span className="text-red-500">*</span></Label>
                  <Input value={apiEndpoint} onChange={(e) => { setApiEndpoint(e.target.value); clearError('apiEndpoint'); }} placeholder="https://api.example.com/v1/data" className={`text-sm h-9 ${errors.apiEndpoint ? 'border-red-400' : ''}`} />
                  <FieldError name="apiEndpoint" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">HTTP 메서드</Label>
                  <Select value={apiMethod} onValueChange={(v) => setApiMethod(v as ApiSourceConfig['httpMethod'])}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">인증 방식</Label>
                  <Select value={apiAuthMethod} onValueChange={(v) => setApiAuthMethod(v as ApiSourceConfig['authMethod'])}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {apiAuthMethod !== '기타' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {apiAuthMethod === 'bearer' ? 'Bearer Token' : 'Basic Auth (base64)'}
                    </Label>
                    <Input
                      type="password"
                      value={apiAuthCredential}
                      onChange={(e) => setApiAuthCredential(e.target.value)}
                      placeholder={apiAuthMethod === 'bearer' ? 'Bearer Token 입력' : 'Base64 인코딩된 자격증명 입력'}
                      className="text-sm h-9"
                    />
                  </div>
                )}
                {apiMethod === 'POST' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">요청 본문 (선택)</Label>
                    <textarea value={apiBody} onChange={(e) => setApiBody(e.target.value)} placeholder='{"key": "value"}' className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono text-xs" rows={3} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs">응답 매핑 (선택)</Label>
                  <Input value={apiMapping} onChange={(e) => setApiMapping(e.target.value)} placeholder="data.items" className="text-sm h-9" />
                </div>
              </>
            )}

            {sourceType === '기타' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">설명</Label>
                  <textarea value={etcDescription} onChange={(e) => setEtcDescription(e.target.value)} placeholder="데이터 소스에 대한 설명" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">담당자</Label>
                  <Input value={etcOwner} onChange={(e) => setEtcOwner(e.target.value)} placeholder="담당자 이름" className="text-sm h-9" />
                </div>
              </>
            )}
          </div>

          {/* domain */}
          <div className="space-y-1.5">
            <Label className="text-xs">도메인 <span className="text-red-500">*</span></Label>
            <Select value={domain} onValueChange={(v) => setDomain(v as ViewTableDomain)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOMAIN_LIST.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* is_active */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">활성 여부</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            className="bg-[#FF3C42] hover:bg-[#e63539] text-white"
            onClick={handleSave}
          >
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
