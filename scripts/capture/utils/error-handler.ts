/**
 * 에러 처리 유틸리티
 */

import * as fs from 'fs';
import * as path from 'path';

export interface CaptureError {
  screenId: string;
  stateId: string;
  error: Error | string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class ErrorHandler {
  private errors: CaptureError[] = [];
  private logDir: string;

  constructor(logDir = 'outputs/logs') {
    this.logDir = logDir;
    this.ensureLogDir();
  }

  /**
   * 에러 기록
   */
  logError(
    screenId: string,
    stateId: string,
    error: Error | string,
    context?: Record<string, unknown>
  ): void {
    const captureError: CaptureError = {
      screenId,
      stateId,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
      context,
    };

    this.errors.push(captureError);
    console.error(`[Error] ${screenId}/${stateId}: ${captureError.error}`);

    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  /**
   * 모든 에러 가져오기
   */
  getErrors(): CaptureError[] {
    return [...this.errors];
  }

  /**
   * 에러 여부 확인
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * 에러 수 반환
   */
  getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * 에러 초기화
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * 에러 리포트 생성
   */
  generateReport(): string {
    if (this.errors.length === 0) {
      return '# Capture Error Report\n\nNo errors occurred during capture.';
    }

    let report = '# Capture Error Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Errors: ${this.errors.length}\n\n`;
    report += '## Errors\n\n';

    for (const error of this.errors) {
      report += `### ${error.screenId} / ${error.stateId}\n`;
      report += `- **Time**: ${error.timestamp}\n`;
      report += `- **Error**: ${error.error}\n`;
      if (error.context) {
        report += `- **Context**: ${JSON.stringify(error.context, null, 2)}\n`;
      }
      report += '\n';
    }

    return report;
  }

  /**
   * 에러 리포트를 파일로 저장
   */
  async saveReport(filename?: string): Promise<string> {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(
      this.logDir,
      filename || `error-report-${timestamp}.md`
    );

    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`[ErrorHandler] Report saved to: ${reportPath}`);

    return reportPath;
  }

  /**
   * 에러를 JSON으로 저장
   */
  async saveErrorsAsJson(filename?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(
      this.logDir,
      filename || `errors-${timestamp}.json`
    );

    fs.writeFileSync(jsonPath, JSON.stringify(this.errors, null, 2), 'utf-8');
    console.log(`[ErrorHandler] Errors saved to: ${jsonPath}`);

    return jsonPath;
  }

  /**
   * 로그 디렉토리 생성
   */
  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
}

/**
 * 재시도 로직이 포함된 함수 실행
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = 2, onRetry } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        console.log(`[Retry] Attempt ${attempt} failed, retrying in ${waitTime}ms...`);

        if (onRetry) {
          onRetry(lastError, attempt);
        }

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

/**
 * 타임아웃이 포함된 함수 실행
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeout: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeout);
  });

  return Promise.race([fn(), timeoutPromise]);
}
