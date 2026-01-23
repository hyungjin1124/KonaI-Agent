/**
 * React 컴포넌트 자동 생성기
 * Claude Code의 코드 생성 결과를 파일로 저장하고 관리
 */

import * as fs from 'fs';
import * as path from 'path';

export type ScreenType = 'crud' | 'dashboard' | 'form' | 'report' | 'custom';

export interface GeneratorConfig {
  screenId: string;
  screenName: string;
  screenNameEn: string;
  screenType: ScreenType;
  requirements: string;
  outputDir: string;
}

export interface ComponentTemplate {
  name: string;
  path: string;
  content: string;
}

export interface GenerationResult {
  success: boolean;
  screenId: string;
  files: string[];
  componentPath: string;
  routePath: string;
  error?: string;
}

export interface ParsedRequirements {
  screenType: ScreenType;
  fields: FieldRequirement[];
  actions: ActionRequirement[];
  gridColumns?: GridColumnRequirement[];
  charts?: ChartRequirement[];
}

export interface FieldRequirement {
  name: string;
  nameEn: string;
  type: string;
  required: boolean;
  validation?: string;
}

export interface ActionRequirement {
  name: string;
  type: 'search' | 'create' | 'update' | 'delete' | 'export' | 'custom';
  api?: string;
}

export interface GridColumnRequirement {
  name: string;
  nameEn: string;
  type: string;
  sortable?: boolean;
}

export interface ChartRequirement {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  dataKey: string;
}

export class ReactGenerator {
  private outputDir: string;
  private templatesDir: string;

  constructor(outputDir: string = 'src/pages', templatesDir: string = 'templates/components') {
    this.outputDir = outputDir;
    this.templatesDir = templatesDir;
  }

  /**
   * 새로운 화면 컴포넌트 생성
   */
  async generate(config: GeneratorConfig): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: false,
      screenId: config.screenId,
      files: [],
      componentPath: '',
      routePath: '',
    };

    try {
      // 1. 요구사항 파싱
      const parsed = this.parseRequirements(config.requirements, config.screenType);

      // 2. 디렉터리 생성
      const componentDir = path.join(this.outputDir, this.toKebabCase(config.screenNameEn));
      this.ensureDir(componentDir);

      // 3. 파일 구조 생성
      const files = this.createFileStructure(config, parsed);

      // 4. 파일 저장
      for (const file of files) {
        const filePath = path.join(componentDir, file.name);
        fs.writeFileSync(filePath, file.content, 'utf-8');
        result.files.push(filePath);
      }

      // 5. screen-states.json 업데이트
      await this.updateScreenStates(config);

      result.success = true;
      result.componentPath = componentDir;
      result.routePath = `/${this.toKebabCase(config.screenNameEn)}`;

      console.log(`[ReactGenerator] Generated ${result.files.length} files for ${config.screenId}`);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`[ReactGenerator] Error: ${result.error}`);
    }

    return result;
  }

  /**
   * 기존 컴포넌트 업데이트
   */
  async updateComponent(screenId: string, changes: string): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: false,
      screenId,
      files: [],
      componentPath: '',
      routePath: '',
    };

    try {
      // screen-states.json에서 화면 정보 조회
      const screenConfig = await this.getScreenConfig(screenId);
      if (!screenConfig) {
        throw new Error(`Screen not found: ${screenId}`);
      }

      result.componentPath = path.join(this.outputDir, this.toKebabCase(screenConfig.nameEn));
      result.routePath = screenConfig.route;
      result.success = true;

      console.log(`[ReactGenerator] Ready to update ${screenId}: ${result.componentPath}`);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  /**
   * 요구사항 문자열 파싱
   */
  private parseRequirements(requirements: string, screenType: ScreenType): ParsedRequirements {
    const parsed: ParsedRequirements = {
      screenType,
      fields: [],
      actions: [],
    };

    // 기본 액션 설정
    switch (screenType) {
      case 'crud':
        parsed.actions = [
          { name: '조회', type: 'search' },
          { name: '등록', type: 'create' },
          { name: '수정', type: 'update' },
          { name: '삭제', type: 'delete' },
        ];
        parsed.gridColumns = [];
        break;
      case 'dashboard':
        parsed.actions = [{ name: '조회', type: 'search' }];
        parsed.charts = [];
        break;
      case 'form':
        parsed.actions = [
          { name: '저장', type: 'create' },
          { name: '취소', type: 'custom' },
        ];
        break;
      case 'report':
        parsed.actions = [
          { name: '조회', type: 'search' },
          { name: '내보내기', type: 'export' },
        ];
        parsed.gridColumns = [];
        break;
    }

    return parsed;
  }

  /**
   * 파일 구조 생성
   */
  private createFileStructure(config: GeneratorConfig, parsed: ParsedRequirements): ComponentTemplate[] {
    const files: ComponentTemplate[] = [];
    const componentName = this.toPascalCase(config.screenNameEn);

    // 메인 컴포넌트
    files.push({
      name: `${componentName}.tsx`,
      path: '',
      content: this.generateMainComponent(config, parsed),
    });

    // 스타일 파일
    files.push({
      name: `${componentName}.styles.ts`,
      path: '',
      content: this.generateStyles(config),
    });

    // 타입 정의
    files.push({
      name: `${componentName}.types.ts`,
      path: '',
      content: this.generateTypes(config, parsed),
    });

    // 인덱스 파일
    files.push({
      name: 'index.ts',
      path: '',
      content: `export { default } from './${componentName}';\nexport * from './${componentName}.types';\n`,
    });

    return files;
  }

  /**
   * 메인 컴포넌트 코드 생성
   */
  private generateMainComponent(config: GeneratorConfig, parsed: ParsedRequirements): string {
    const componentName = this.toPascalCase(config.screenNameEn);

    const templateByType: Record<ScreenType, string> = {
      crud: this.getCrudTemplate(componentName, config),
      dashboard: this.getDashboardTemplate(componentName, config),
      form: this.getFormTemplate(componentName, config),
      report: this.getReportTemplate(componentName, config),
      custom: this.getCustomTemplate(componentName, config),
    };

    return templateByType[config.screenType];
  }

  /**
   * CRUD 화면 템플릿
   */
  private getCrudTemplate(componentName: string, config: GeneratorConfig): string {
    return `import React, { useState, useCallback } from 'react';
import { Container, SearchForm, DataGrid, ActionButtons } from './components';
import { ${componentName}Props, ${componentName}Data } from './${componentName}.types';
import * as S from './${componentName}.styles';

/**
 * ${config.screenName} 화면
 * Screen ID: ${config.screenId}
 */
const ${componentName}: React.FC<${componentName}Props> = () => {
  const [data, setData] = useState<${componentName}Data[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});

  const handleSearch = useCallback(async (params: typeof searchParams) => {
    setLoading(true);
    try {
      // TODO: API 호출 구현
      console.log('Search with params:', params);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(() => {
    // TODO: 등록 다이얼로그 열기
    console.log('Open create dialog');
  }, []);

  const handleEdit = useCallback((item: ${componentName}Data) => {
    // TODO: 수정 다이얼로그 열기
    console.log('Edit item:', item);
  }, []);

  const handleDelete = useCallback((item: ${componentName}Data) => {
    // TODO: 삭제 확인 후 처리
    console.log('Delete item:', item);
  }, []);

  return (
    <S.Container>
      <S.Header>
        <h1>${config.screenName}</h1>
      </S.Header>

      <S.SearchSection>
        {/* 검색 영역 */}
        <S.SearchForm onSubmit={(e) => { e.preventDefault(); handleSearch(searchParams); }}>
          {/* TODO: 검색 필드 구현 */}
          <S.SearchButton type="submit">조회</S.SearchButton>
        </S.SearchForm>
      </S.SearchSection>

      <S.ActionSection>
        <S.Button onClick={handleCreate}>등록</S.Button>
      </S.ActionSection>

      <S.GridSection>
        {/* 데이터 그리드 */}
        {loading ? (
          <S.Loading>로딩 중...</S.Loading>
        ) : (
          <S.Table>
            <thead>
              <tr>
                {/* TODO: 컬럼 헤더 구현 */}
                <th>컬럼1</th>
                <th>컬럼2</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  {/* TODO: 데이터 셀 구현 */}
                  <td>{/* item.field1 */}</td>
                  <td>{/* item.field2 */}</td>
                  <td>
                    <S.ActionButton onClick={() => handleEdit(item)}>수정</S.ActionButton>
                    <S.ActionButton onClick={() => handleDelete(item)}>삭제</S.ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </S.Table>
        )}
      </S.GridSection>
    </S.Container>
  );
};

export default ${componentName};
`;
  }

  /**
   * Dashboard 화면 템플릿
   */
  private getDashboardTemplate(componentName: string, config: GeneratorConfig): string {
    return `import React, { useState, useEffect } from 'react';
import { ${componentName}Props, KPIData } from './${componentName}.types';
import * as S from './${componentName}.styles';

/**
 * ${config.screenName} 화면
 * Screen ID: ${config.screenId}
 */
const ${componentName}: React.FC<${componentName}Props> = () => {
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: API 호출 구현
        setKpiData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <S.Loading>로딩 중...</S.Loading>;
  }

  return (
    <S.Container>
      <S.Header>
        <h1>${config.screenName}</h1>
      </S.Header>

      <S.KPISection>
        {/* KPI 카드 영역 */}
        <S.KPICard>
          <S.KPITitle>총 건수</S.KPITitle>
          <S.KPIValue>0</S.KPIValue>
        </S.KPICard>
      </S.KPISection>

      <S.ChartSection>
        {/* 차트 영역 */}
        <S.ChartContainer>
          {/* TODO: 차트 컴포넌트 구현 */}
        </S.ChartContainer>
      </S.ChartSection>

      <S.TableSection>
        {/* 데이터 테이블 영역 */}
      </S.TableSection>
    </S.Container>
  );
};

export default ${componentName};
`;
  }

  /**
   * Form 화면 템플릿
   */
  private getFormTemplate(componentName: string, config: GeneratorConfig): string {
    return `import React, { useState, useCallback } from 'react';
import { ${componentName}Props, FormData } from './${componentName}.types';
import * as S from './${componentName}.styles';

/**
 * ${config.screenName} 화면
 * Screen ID: ${config.screenId}
 */
const ${componentName}: React.FC<${componentName}Props> = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: 유효성 검증 및 API 호출
      console.log('Submit form:', formData);
    } finally {
      setSubmitting(false);
    }
  }, [formData]);

  const handleCancel = useCallback(() => {
    // TODO: 취소 처리 (이전 화면으로 이동 등)
    console.log('Cancel');
  }, []);

  return (
    <S.Container>
      <S.Header>
        <h1>${config.screenName}</h1>
      </S.Header>

      <S.Form onSubmit={handleSubmit}>
        <S.FormSection>
          {/* TODO: 폼 필드 구현 */}
          <S.FormGroup>
            <S.Label>필드명</S.Label>
            <S.Input
              type="text"
              onChange={(e) => handleChange('field1', e.target.value)}
            />
            {errors.field1 && <S.Error>{errors.field1}</S.Error>}
          </S.FormGroup>
        </S.FormSection>

        <S.ButtonSection>
          <S.Button type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </S.Button>
          <S.Button type="button" onClick={handleCancel}>
            취소
          </S.Button>
        </S.ButtonSection>
      </S.Form>
    </S.Container>
  );
};

export default ${componentName};
`;
  }

  /**
   * Report 화면 템플릿
   */
  private getReportTemplate(componentName: string, config: GeneratorConfig): string {
    return `import React, { useState, useCallback } from 'react';
import { ${componentName}Props, ReportData } from './${componentName}.types';
import * as S from './${componentName}.styles';

/**
 * ${config.screenName} 화면
 * Screen ID: ${config.screenId}
 */
const ${componentName}: React.FC<${componentName}Props> = () => {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: API 호출 구현
      console.log('Search report:', searchParams);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleExport = useCallback((format: 'excel' | 'pdf') => {
    // TODO: 내보내기 구현
    console.log('Export as:', format);
  }, []);

  return (
    <S.Container>
      <S.Header>
        <h1>${config.screenName}</h1>
      </S.Header>

      <S.SearchSection>
        {/* 조회 조건 */}
        <S.SearchForm onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          {/* TODO: 검색 조건 필드 구현 */}
          <S.SearchButton type="submit">조회</S.SearchButton>
        </S.SearchForm>
      </S.SearchSection>

      <S.ActionSection>
        <S.Button onClick={() => handleExport('excel')}>Excel</S.Button>
        <S.Button onClick={() => handleExport('pdf')}>PDF</S.Button>
      </S.ActionSection>

      <S.ResultSection>
        {loading ? (
          <S.Loading>로딩 중...</S.Loading>
        ) : (
          <S.Table>
            {/* TODO: 결과 테이블 구현 */}
          </S.Table>
        )}
      </S.ResultSection>
    </S.Container>
  );
};

export default ${componentName};
`;
  }

  /**
   * Custom 화면 템플릿
   */
  private getCustomTemplate(componentName: string, config: GeneratorConfig): string {
    return `import React from 'react';
import { ${componentName}Props } from './${componentName}.types';
import * as S from './${componentName}.styles';

/**
 * ${config.screenName} 화면
 * Screen ID: ${config.screenId}
 */
const ${componentName}: React.FC<${componentName}Props> = () => {
  return (
    <S.Container>
      <S.Header>
        <h1>${config.screenName}</h1>
      </S.Header>

      <S.Content>
        {/* TODO: 커스텀 컨텐츠 구현 */}
      </S.Content>
    </S.Container>
  );
};

export default ${componentName};
`;
  }

  /**
   * 스타일 파일 생성
   */
  private generateStyles(config: GeneratorConfig): string {
    return `import styled from 'styled-components';

export const Container = styled.div\`
  padding: 24px;
  background: #fff;
  min-height: 100vh;
\`;

export const Header = styled.header\`
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
\`;

export const SearchSection = styled.section\`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
\`;

export const SearchForm = styled.form\`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
\`;

export const SearchButton = styled.button\`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
\`;

export const ActionSection = styled.section\`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
\`;

export const Button = styled.button\`
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
\`;

export const ActionButton = styled.button\`
  padding: 4px 8px;
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 4px;

  &:hover {
    background: #007bff;
    color: white;
  }
\`;

export const GridSection = styled.section\`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
\`;

export const Table = styled.table\`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
  }

  tr:hover td {
    background: #f5f5f5;
  }
\`;

export const Loading = styled.div\`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  color: #666;
\`;

// Dashboard 전용 스타일
export const KPISection = styled.section\`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
\`;

export const KPICard = styled.div\`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
\`;

export const KPITitle = styled.div\`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
\`;

export const KPIValue = styled.div\`
  font-size: 32px;
  font-weight: 700;
\`;

export const ChartSection = styled.section\`
  margin-bottom: 24px;
\`;

export const ChartContainer = styled.div\`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  min-height: 300px;
\`;

export const TableSection = styled.section\`
  margin-bottom: 24px;
\`;

// Form 전용 스타일
export const Form = styled.form\`
  max-width: 800px;
\`;

export const FormSection = styled.section\`
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
\`;

export const FormGroup = styled.div\`
  margin-bottom: 16px;
\`;

export const Label = styled.label\`
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
\`;

export const Input = styled.input\`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
\`;

export const Error = styled.span\`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
\`;

export const ButtonSection = styled.section\`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
\`;

// Report 전용 스타일
export const ResultSection = styled.section\`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
\`;

// Custom 전용 스타일
export const Content = styled.main\`
  padding: 24px 0;
\`;
`;
  }

  /**
   * 타입 정의 파일 생성
   */
  private generateTypes(config: GeneratorConfig, parsed: ParsedRequirements): string {
    const componentName = this.toPascalCase(config.screenNameEn);

    return `/**
 * ${config.screenName} 화면 타입 정의
 * Screen ID: ${config.screenId}
 */

export interface ${componentName}Props {
  // 컴포넌트 프롭스
}

export interface ${componentName}Data {
  id: string;
  // TODO: 데이터 필드 정의
  [key: string]: unknown;
}

export interface SearchParams {
  // TODO: 검색 파라미터 정의
  [key: string]: unknown;
}

export interface FormData {
  // TODO: 폼 데이터 정의
  [key: string]: unknown;
}

export interface KPIData {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export interface ReportData {
  // TODO: 리포트 데이터 정의
  [key: string]: unknown;
}
`;
  }

  /**
   * screen-states.json 업데이트
   */
  private async updateScreenStates(config: GeneratorConfig): Promise<void> {
    const configPath = 'config/screen-states.json';

    let screenStates: { screens: Array<{ id: string; name: string; nameEn: string; route: string; component: string; states: unknown[] }> };

    if (fs.existsSync(configPath)) {
      screenStates = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
      screenStates = { screens: [] };
    }

    // 기존 화면이 있으면 업데이트, 없으면 추가
    const existingIndex = screenStates.screens.findIndex(s => s.id === config.screenId);
    const screenEntry = {
      id: config.screenId,
      name: config.screenName,
      nameEn: config.screenNameEn,
      route: `/${this.toKebabCase(config.screenNameEn)}`,
      component: this.toPascalCase(config.screenNameEn),
      states: [
        {
          stateId: 'initial',
          stateName: '초기 상태',
          description: '화면 최초 로드 상태',
        },
      ],
    };

    if (existingIndex >= 0) {
      screenStates.screens[existingIndex] = screenEntry;
    } else {
      screenStates.screens.push(screenEntry);
    }

    fs.writeFileSync(configPath, JSON.stringify(screenStates, null, 2), 'utf-8');
  }

  /**
   * screen-states.json에서 화면 정보 조회
   */
  private async getScreenConfig(screenId: string): Promise<{ nameEn: string; route: string } | null> {
    const configPath = 'config/screen-states.json';

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const screenStates = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const screen = screenStates.screens.find((s: { id: string }) => s.id === screenId);

    return screen || null;
  }

  /**
   * 디렉터리 생성 (재귀)
   */
  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 문자열을 kebab-case로 변환
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * 문자열을 PascalCase로 변환
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}
