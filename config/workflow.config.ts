/**
 * 워크플로우 설정
 * 화면 생성 및 파이프라인 동작을 커스터마이징
 */

export interface WorkflowConfig {
  // 기본 설정
  defaultLocale: 'ko-KR' | 'en-US';
  outputRootDir: string;

  // 서버 설정
  devServer: {
    port: number;
    startTimeout: number;
    healthCheckUrl: string;
    command: string;
    args: string[];
  };

  // 캡처 설정
  capture: {
    defaultViewport: { width: number; height: number };
    waitStrategy: 'networkidle0' | 'networkidle2' | 'load' | 'domcontentloaded';
    screenshotFormat: 'png' | 'jpeg' | 'webp';
    fullPage: boolean;
    timeout: number;
    headless: boolean;
  };

  // 명세서 설정
  spec: {
    formats: ('md' | 'docx')[];
    templateDir: string;
    includeScreenshots: boolean;
    companyName: string;
    projectName: string;
  };

  // Git 설정
  git: {
    enabled: boolean;
    autoPush: boolean;
    defaultBranch: string;
    branchNamingPattern: string;
    commitMessagePattern: string;
  };

  // 접근성 검증 설정
  a11y: {
    enabled: boolean;
    standard: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA';
    failOnError: boolean;
  };
}

/**
 * 기본 워크플로우 설정
 */
export const defaultWorkflowConfig: WorkflowConfig = {
  defaultLocale: 'ko-KR',
  outputRootDir: 'outputs',

  devServer: {
    port: 3000,
    startTimeout: 30000,
    healthCheckUrl: '/',
    command: 'npm',
    args: ['run', 'dev'],
  },

  capture: {
    defaultViewport: { width: 1920, height: 1080 },
    waitStrategy: 'networkidle0',
    screenshotFormat: 'png',
    fullPage: false,
    timeout: 30000,
    headless: true,
  },

  spec: {
    formats: ['md', 'docx'],
    templateDir: 'templates/spec',
    includeScreenshots: true,
    companyName: 'KonaI',
    projectName: 'KonaI-Agent',
  },

  git: {
    enabled: true,
    autoPush: false,
    defaultBranch: 'main',
    branchNamingPattern: 'feature/screen-{screenId}',
    commitMessagePattern: '[{type}] {screenId}: {message}',
  },

  a11y: {
    enabled: true,
    standard: 'WCAG2AA',
    failOnError: false,
  },
};

/**
 * 설정 로드
 */
export function loadWorkflowConfig(customConfig?: Partial<WorkflowConfig>): WorkflowConfig {
  return {
    ...defaultWorkflowConfig,
    ...customConfig,
    devServer: {
      ...defaultWorkflowConfig.devServer,
      ...customConfig?.devServer,
    },
    capture: {
      ...defaultWorkflowConfig.capture,
      ...customConfig?.capture,
    },
    spec: {
      ...defaultWorkflowConfig.spec,
      ...customConfig?.spec,
    },
    git: {
      ...defaultWorkflowConfig.git,
      ...customConfig?.git,
    },
    a11y: {
      ...defaultWorkflowConfig.a11y,
      ...customConfig?.a11y,
    },
  };
}

/**
 * 환경별 설정
 */
export const environmentConfigs: Record<string, Partial<WorkflowConfig>> = {
  development: {
    capture: {
      defaultViewport: { width: 1920, height: 1080 },
      waitStrategy: 'networkidle0',
      screenshotFormat: 'png',
      fullPage: false,
      timeout: 30000,
      headless: false, // 개발 시 브라우저 표시
    },
    git: {
      enabled: true,
      autoPush: false,
      defaultBranch: 'main',
      branchNamingPattern: 'feature/screen-{screenId}',
      commitMessagePattern: '[{type}] {screenId}: {message}',
    },
  },
  production: {
    capture: {
      defaultViewport: { width: 1920, height: 1080 },
      waitStrategy: 'networkidle0',
      screenshotFormat: 'png',
      fullPage: false,
      timeout: 60000, // 프로덕션에서는 더 긴 타임아웃
      headless: true,
    },
    git: {
      enabled: true,
      autoPush: true, // 프로덕션에서는 자동 푸시
      defaultBranch: 'main',
      branchNamingPattern: 'feature/screen-{screenId}',
      commitMessagePattern: '[{type}] {screenId}: {message}',
    },
    a11y: {
      enabled: true,
      standard: 'WCAG2AA',
      failOnError: true, // 프로덕션에서는 접근성 오류 시 실패
    },
  },
  ci: {
    capture: {
      defaultViewport: { width: 1920, height: 1080 },
      waitStrategy: 'networkidle0',
      screenshotFormat: 'png',
      fullPage: false,
      timeout: 60000,
      headless: true,
    },
    git: {
      enabled: false, // CI에서는 Git 작업 비활성화
      autoPush: false,
      defaultBranch: 'main',
      branchNamingPattern: 'feature/screen-{screenId}',
      commitMessagePattern: '[{type}] {screenId}: {message}',
    },
  },
};

/**
 * 환경에 따른 설정 로드
 */
export function loadConfigForEnvironment(env?: string): WorkflowConfig {
  const environment = env || process.env.NODE_ENV || 'development';
  const envConfig = environmentConfigs[environment] || {};
  return loadWorkflowConfig(envConfig);
}
