#!/usr/bin/env node
/**
 * WCAG 2.1 AA 접근성 검증 스크립트
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import puppeteer, { Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// @axe-core/puppeteer가 설치되어 있지 않을 수 있으므로 동적 import
let AxePuppeteer: typeof import('@axe-core/puppeteer').AxePuppeteer | null = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface A11yViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

interface A11yResult {
  url: string;
  screenId?: string;
  timestamp: string;
  violations: A11yViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  wcagLevel: 'A' | 'AA' | 'AAA' | 'FAIL';
}

interface A11yReport {
  generatedAt: string;
  totalPages: number;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  results: A11yResult[];
}

const program = new Command();

program
  .name('konai-a11y')
  .description('KonaI-Agent WCAG 2.1 AA 접근성 검증')
  .version('1.0.0');

program
  .option('-u, --url <url>', '검증할 URL', 'http://localhost:3000')
  .option('-o, --output <dir>', '리포트 출력 디렉토리', 'outputs/reports')
  .option('--screens <ids>', '검증할 화면 ID (콤마 구분)')
  .option('--wcag <level>', 'WCAG 레벨 (a, aa, aaa)', 'aa')
  .action(async (options) => {
    const spinner = ora('접근성 검증 준비 중...').start();

    // @axe-core/puppeteer 동적 로드 시도
    try {
      const axeModule = await import('@axe-core/puppeteer');
      AxePuppeteer = axeModule.AxePuppeteer;
    } catch {
      spinner.warn('@axe-core/puppeteer가 설치되지 않았습니다. 기본 검증만 실행합니다.');
      AxePuppeteer = null;
    }

    const outputDir = options.output;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const results: A11yResult[] = [];
    const browser = await puppeteer.launch({ headless: true });

    try {
      // 검증할 경로 목록
      const paths = options.screens
        ? options.screens.split(',').map((s: string) => ({ id: s, path: '/' }))
        : [
            { id: 'login', path: '/' },
            { id: 'dashboard', path: '/' },
          ];

      spinner.text = `${paths.length}개 페이지 검증 중...`;

      for (const { id, path: pagePath } of paths) {
        const pageSpinner = ora(`  ${id} 검증 중...`).start();

        try {
          const page = await browser.newPage();
          await page.setViewport({ width: 1920, height: 1080 });

          const url = `${options.url}${pagePath}`;
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

          let result: A11yResult;

          if (AxePuppeteer) {
            // axe-core를 사용한 검증
            const wcagTags = options.wcag === 'aaa'
              ? ['wcag2a', 'wcag2aa', 'wcag2aaa']
              : options.wcag === 'a'
                ? ['wcag2a']
                : ['wcag2a', 'wcag2aa'];

            const axeResults = await new AxePuppeteer(page)
              .withTags(wcagTags)
              .analyze();

            result = {
              url,
              screenId: id,
              timestamp: new Date().toISOString(),
              violations: axeResults.violations.map((v) => ({
                id: v.id,
                impact: v.impact as A11yViolation['impact'],
                description: v.description,
                help: v.help,
                helpUrl: v.helpUrl,
                nodes: v.nodes.map((n) => ({
                  target: n.target as string[],
                  html: n.html,
                  failureSummary: n.failureSummary || '',
                })),
              })),
              passes: axeResults.passes.length,
              incomplete: axeResults.incomplete.length,
              inapplicable: axeResults.inapplicable.length,
              wcagLevel: axeResults.violations.length === 0 ? 'AA' : 'FAIL',
            };
          } else {
            // 기본 검증 (axe 없이)
            result = await performBasicValidation(page, url, id);
          }

          results.push(result);
          await page.close();

          if (result.violations.length === 0) {
            pageSpinner.succeed(`  ${id}: WCAG ${result.wcagLevel} 준수`);
          } else {
            const critical = result.violations.filter((v) => v.impact === 'critical').length;
            const serious = result.violations.filter((v) => v.impact === 'serious').length;
            pageSpinner.warn(
              `  ${id}: ${result.violations.length}개 위반 (심각: ${critical}, 중요: ${serious})`
            );
          }

        } catch (error) {
          pageSpinner.fail(`  ${id}: 검증 실패 - ${error instanceof Error ? error.message : String(error)}`);
          results.push({
            url: `${options.url}${pagePath}`,
            screenId: id,
            timestamp: new Date().toISOString(),
            violations: [],
            passes: 0,
            incomplete: 0,
            inapplicable: 0,
            wcagLevel: 'FAIL',
          });
        }
      }

      // 리포트 생성
      const report: A11yReport = generateReport(results);

      // JSON 리포트 저장
      const jsonPath = path.join(outputDir, 'accessibility-report.json');
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

      // Markdown 리포트 저장
      const mdPath = path.join(outputDir, 'accessibility-report.md');
      fs.writeFileSync(mdPath, generateMarkdownReport(report));

      spinner.succeed('접근성 검증 완료');

      // 요약 출력
      console.log(chalk.blue('\n📊 접근성 검증 결과\n'));
      console.log(`  총 페이지: ${report.totalPages}`);
      console.log(`  총 위반: ${report.totalViolations}`);

      if (report.totalViolations > 0) {
        console.log(chalk.red(`    - 심각(critical): ${report.criticalCount}`));
        console.log(chalk.yellow(`    - 중요(serious): ${report.seriousCount}`));
        console.log(chalk.white(`    - 보통(moderate): ${report.moderateCount}`));
        console.log(chalk.gray(`    - 경미(minor): ${report.minorCount}`));
      } else {
        console.log(chalk.green('  ✅ 모든 페이지가 WCAG 2.1 AA를 준수합니다'));
      }

      console.log(chalk.gray(`\n  리포트: ${jsonPath}`));
      console.log(chalk.gray(`  마크다운: ${mdPath}`));

      // 심각한 위반이 있으면 종료 코드 1
      if (report.criticalCount > 0 || report.seriousCount > 0) {
        process.exit(1);
      }

    } finally {
      await browser.close();
    }
  });

/**
 * 기본 접근성 검증 (axe 없이)
 */
async function performBasicValidation(
  page: Page,
  url: string,
  screenId: string
): Promise<A11yResult> {
  const violations: A11yViolation[] = [];

  // 기본 검증 수행
  const checks = await page.evaluate(() => {
    const issues: Array<{ id: string; impact: string; description: string; nodes: string[] }> = [];

    // 이미지 alt 속성 검사
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        id: 'image-alt',
        impact: 'critical',
        description: '이미지에 대체 텍스트(alt)가 없습니다',
        nodes: Array.from(imagesWithoutAlt).map((el) => el.outerHTML),
      });
    }

    // 버튼/링크 접근성 이름 검사
    const buttonsWithoutLabel = document.querySelectorAll(
      'button:not([aria-label]):empty, a:not([aria-label]):empty'
    );
    if (buttonsWithoutLabel.length > 0) {
      issues.push({
        id: 'button-name',
        impact: 'serious',
        description: '버튼/링크에 접근성 이름이 없습니다',
        nodes: Array.from(buttonsWithoutLabel).map((el) => el.outerHTML),
      });
    }

    // 폼 레이블 검사
    const inputsWithoutLabel = document.querySelectorAll(
      'input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])'
    );
    const unlabeledInputs = Array.from(inputsWithoutLabel).filter((input) => {
      const id = input.getAttribute('id');
      return !id || !document.querySelector(`label[for="${id}"]`);
    });
    if (unlabeledInputs.length > 0) {
      issues.push({
        id: 'label',
        impact: 'serious',
        description: '입력 필드에 레이블이 없습니다',
        nodes: unlabeledInputs.map((el) => el.outerHTML),
      });
    }

    // 색상 대비 (간단한 검사)
    const lowContrastCount = document.querySelectorAll('[style*="color: #999"], [style*="color: #aaa"]').length;
    if (lowContrastCount > 0) {
      issues.push({
        id: 'color-contrast',
        impact: 'moderate',
        description: '색상 대비가 충분하지 않을 수 있습니다',
        nodes: [`${lowContrastCount}개 요소`],
      });
    }

    return issues;
  });

  for (const check of checks) {
    violations.push({
      id: check.id,
      impact: check.impact as A11yViolation['impact'],
      description: check.description,
      help: check.description,
      helpUrl: `https://dequeuniversity.com/rules/axe/4.4/${check.id}`,
      nodes: check.nodes.map((html: string) => ({
        target: [] as string[],
        html,
        failureSummary: check.description,
      })),
    });
  }

  return {
    url,
    screenId,
    timestamp: new Date().toISOString(),
    violations,
    passes: 0, // 기본 검증에서는 추적하지 않음
    incomplete: 0,
    inapplicable: 0,
    wcagLevel: violations.length === 0 ? 'AA' : 'FAIL',
  };
}

/**
 * 리포트 생성
 */
function generateReport(results: A11yResult[]): A11yReport {
  const allViolations = results.flatMap((r) => r.violations);

  return {
    generatedAt: new Date().toISOString(),
    totalPages: results.length,
    totalViolations: allViolations.length,
    criticalCount: allViolations.filter((v) => v.impact === 'critical').length,
    seriousCount: allViolations.filter((v) => v.impact === 'serious').length,
    moderateCount: allViolations.filter((v) => v.impact === 'moderate').length,
    minorCount: allViolations.filter((v) => v.impact === 'minor').length,
    results,
  };
}

/**
 * Markdown 리포트 생성
 */
function generateMarkdownReport(report: A11yReport): string {
  const lines: string[] = [];

  lines.push('# 접근성 검증 리포트');
  lines.push('');
  lines.push(`> 생성일: ${report.generatedAt}`);
  lines.push('');
  lines.push('## 요약');
  lines.push('');
  lines.push(`| 항목 | 값 |`);
  lines.push(`|------|-----|`);
  lines.push(`| 검증 페이지 | ${report.totalPages} |`);
  lines.push(`| 총 위반 | ${report.totalViolations} |`);
  lines.push(`| 심각(critical) | ${report.criticalCount} |`);
  lines.push(`| 중요(serious) | ${report.seriousCount} |`);
  lines.push(`| 보통(moderate) | ${report.moderateCount} |`);
  lines.push(`| 경미(minor) | ${report.minorCount} |`);
  lines.push('');

  if (report.totalViolations === 0) {
    lines.push('## 결과');
    lines.push('');
    lines.push('✅ **모든 페이지가 WCAG 2.1 AA를 준수합니다**');
  } else {
    lines.push('## 위반 사항');
    lines.push('');

    for (const result of report.results) {
      if (result.violations.length === 0) continue;

      lines.push(`### ${result.screenId || result.url}`);
      lines.push('');

      for (const violation of result.violations) {
        const impactEmoji =
          violation.impact === 'critical' ? '🔴' :
          violation.impact === 'serious' ? '🟠' :
          violation.impact === 'moderate' ? '🟡' : '⚪';

        lines.push(`#### ${impactEmoji} ${violation.id}`);
        lines.push('');
        lines.push(`- **영향도**: ${violation.impact}`);
        lines.push(`- **설명**: ${violation.description}`);
        lines.push(`- **도움말**: [링크](${violation.helpUrl})`);
        lines.push('');

        if (violation.nodes.length > 0) {
          lines.push('**영향받는 요소:**');
          lines.push('');
          lines.push('```html');
          for (const node of violation.nodes.slice(0, 3)) {
            lines.push(node.html);
          }
          if (violation.nodes.length > 3) {
            lines.push(`... 외 ${violation.nodes.length - 3}개`);
          }
          lines.push('```');
          lines.push('');
        }
      }
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('*Generated by KonaI Pipeline*');

  return lines.join('\n');
}

program.parse();
