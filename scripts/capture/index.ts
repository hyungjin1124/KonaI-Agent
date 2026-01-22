#!/usr/bin/env node
/**
 * KonaI-Agent 스크린샷 캡처 CLI
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { BrowserManager, closeBrowserManager } from './browser-manager.js';
import { PageCapture } from './page-capture.js';
import { ErrorHandler, withRetry } from './utils/error-handler.js';
import { waitForAllResources } from './utils/wait-helpers.js';
import {
  getAllScreens,
  getScreenById,
  getDefaultAuth,
  getScreenStats,
} from './scenarios/index.js';
import { loadConfig } from '../../config/capture.config.js';
import { CaptureManifest, CaptureResult } from '../../config/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('konai-capture')
  .description('KonaI-Agent 데모 스크린샷 캡처 도구')
  .version('1.0.0');

program
  .option('-s, --scenario <id>', '특정 시나리오 ID만 캡처')
  .option('-a, --scenarios <type>', '시나리오 유형 (all, auth, public)', 'all')
  .option('-l, --locale <locale>', '로케일 (ko-KR, en-US)', 'ko-KR')
  .option('-o, --output <dir>', '출력 디렉토리', 'outputs/screenshots')
  .option('-f, --format <format>', '이미지 포맷 (png, jpeg, webp)', 'png')
  .option('-u, --url <url>', '기본 URL', 'http://localhost:3000')
  .option('--headless <bool>', '헤드리스 모드', 'true')
  .option('--debug', '디버그 모드')
  .action(async (options) => {
    const startTime = Date.now();
    const spinner = ora('캡처 준비 중...').start();
    const errorHandler = new ErrorHandler();

    const config = loadConfig();
    const locale = options.locale as 'ko-KR' | 'en-US';
    const baseUrl = options.url;
    const outputDir = path.join(options.output, locale);

    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 브라우저 매니저 초기화
    const browserManager = new BrowserManager({
      headless: options.headless !== 'false',
    });

    const results: CaptureResult[] = [];
    const auth = getDefaultAuth();

    try {
      spinner.text = '브라우저 시작 중...';
      await browserManager.launch();

      // 캡처할 화면 목록 결정
      let screens = getAllScreens();

      if (options.scenario) {
        const screen = getScreenById(options.scenario);
        if (!screen) {
          spinner.fail(`시나리오를 찾을 수 없습니다: ${options.scenario}`);
          process.exit(1);
        }
        screens = [screen];
      } else if (options.scenarios === 'auth') {
        screens = screens.filter((s) => s.requiresAuth);
      } else if (options.scenarios === 'public') {
        screens = screens.filter((s) => !s.requiresAuth);
      }

      const stats = getScreenStats();
      spinner.succeed(`${screens.length}개 화면, ${screens.reduce((sum, s) => sum + s.states.length, 0)}개 상태 캡처 예정`);

      console.log(chalk.blue(`\n📸 캡처 시작 (로케일: ${locale})\n`));

      // 각 화면별 캡처
      for (let i = 0; i < screens.length; i++) {
        const screen = screens[i];
        const screenSpinner = ora(`[${i + 1}/${screens.length}] ${screen.name} (${screen.id})`).start();

        try {
          const page = await browserManager.newPage();
          const pageCapture = new PageCapture(page, {
            ...config,
            locale,
            outputDir: options.output,
          });

          // 페이지 이동
          await page.goto(`${baseUrl}${screen.route}`, {
            waitUntil: 'networkidle0',
            timeout: 30000,
          });

          // 리소스 로딩 대기
          await waitForAllResources(page);

          // 인증이 필요한 경우
          if (screen.requiresAuth) {
            screenSpinner.text = `[${i + 1}/${screens.length}] ${screen.name} - 로그인 중...`;
            const { StateManager } = await import('./state-manager.js');
            const stateManager = new StateManager(page);
            await stateManager.performLogin(auth.email, auth.password);
            await waitForAllResources(page);
          }

          // 각 상태별 캡처
          for (const state of screen.states) {
            screenSpinner.text = `[${i + 1}/${screens.length}] ${screen.name} - ${state.stateName}`;

            const result = await withRetry(
              () => pageCapture.captureState(screen, state, { locale, format: options.format }),
              { maxRetries: 2, delay: 1000 }
            );

            results.push(result);

            if (!result.success) {
              errorHandler.logError(screen.id, state.stateId, result.error || 'Unknown error');
            }
          }

          await page.close();
          screenSpinner.succeed(`[${i + 1}/${screens.length}] ${screen.name} - ${screen.states.length}개 상태 완료`);

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          screenSpinner.fail(`[${i + 1}/${screens.length}] ${screen.name} - 실패: ${errorMsg}`);
          errorHandler.logError(screen.id, 'all', errorMsg);

          // 실패한 상태들도 결과에 추가
          for (const state of screen.states) {
            results.push({
              screenId: screen.id,
              stateId: state.stateId,
              screenshotPath: '',
              capturedAt: new Date().toISOString(),
              viewport: { width: config.viewport.width, height: config.viewport.height },
              locale,
              success: false,
              error: errorMsg,
            });
          }
        }
      }

      // 매니페스트 생성
      const manifest: CaptureManifest = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        locale,
        totalScreens: screens.length,
        totalStates: results.length,
        results,
      };

      const manifestPath = path.join(options.output, `manifest-${locale}.json`);
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      // 결과 요약
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(chalk.green(`\n✅ 캡처 완료`));
      console.log(chalk.white(`   성공: ${successCount}개`));
      if (failCount > 0) {
        console.log(chalk.red(`   실패: ${failCount}개`));
      }
      console.log(chalk.white(`   소요 시간: ${duration}초`));
      console.log(chalk.white(`   출력 경로: ${outputDir}`));
      console.log(chalk.white(`   매니페스트: ${manifestPath}`));

      // 에러 리포트 저장 (에러가 있는 경우)
      if (errorHandler.hasErrors()) {
        await errorHandler.saveReport();
        await errorHandler.saveErrorsAsJson();
      }

    } catch (error) {
      spinner.fail('캡처 실패');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);

    } finally {
      await closeBrowserManager();
    }
  });

// 통계 명령어
program
  .command('stats')
  .description('시나리오 통계 표시')
  .action(() => {
    const stats = getScreenStats();
    const screens = getAllScreens();

    console.log(chalk.blue('\n📊 시나리오 통계\n'));
    console.log(`총 화면 수: ${stats.totalScreens}`);
    console.log(`총 상태 수: ${stats.totalStates}`);
    console.log(`인증 필요: ${stats.authRequiredCount}개`);
    console.log(`공개 화면: ${stats.publicCount}개`);

    console.log(chalk.blue('\n📋 화면 목록\n'));
    for (const screen of screens) {
      const authBadge = screen.requiresAuth ? chalk.yellow('[AUTH]') : chalk.green('[PUBLIC]');
      console.log(`  ${authBadge} ${screen.id}: ${screen.name} (${screen.states.length}개 상태)`);
    }
  });

// 목록 명령어
program
  .command('list')
  .description('캡처 가능한 시나리오 목록')
  .action(() => {
    const screens = getAllScreens();

    console.log(chalk.blue('\n📋 캡처 가능한 시나리오\n'));

    for (const screen of screens) {
      console.log(chalk.white(`\n${screen.id}: ${screen.name}`));
      console.log(chalk.gray(`  컴포넌트: ${screen.component}`));
      console.log(chalk.gray(`  상태:`));

      for (const state of screen.states) {
        console.log(chalk.gray(`    - ${state.stateId}: ${state.stateName}`));
      }
    }
  });

program.parse();
