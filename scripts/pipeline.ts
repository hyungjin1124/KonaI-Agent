#!/usr/bin/env node
/**
 * KonaI-Agent 통합 자동화 파이프라인 CLI
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

interface PipelineOptions {
  locale: 'ko-KR' | 'en-US';
  url: string;
  output: string;
  format: string;
  skipCapture: boolean;
  skipGenerate: boolean;
  skipValidate: boolean;
}

/**
 * 명령어 실행
 */
async function runCommand(
  command: string,
  args: string[],
  spinner: Ora
): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    const output: string[] = [];

    const proc = spawn(command, args, {
      cwd: path.resolve(__dirname, '..'),
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    proc.stdout?.on('data', (data) => {
      output.push(data.toString());
    });

    proc.stderr?.on('data', (data) => {
      output.push(data.toString());
    });

    proc.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output.join(''),
      });
    });

    proc.on('error', (error) => {
      resolve({
        success: false,
        output: error.message,
      });
    });
  });
}

/**
 * 개발 서버 시작
 */
async function startDevServer(port: number): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'dev'], {
      cwd: path.resolve(__dirname, '..'),
      shell: true,
      detached: true,
      stdio: 'ignore',
    });

    // 서버가 시작될 때까지 대기
    const checkServer = async () => {
      for (let i = 0; i < 30; i++) {
        try {
          const response = await fetch(`http://localhost:${port}`);
          if (response.ok) {
            resolve(proc);
            return;
          }
        } catch {
          // 아직 서버가 준비되지 않음
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      reject(new Error('Server startup timeout'));
    };

    checkServer();
  });
}

/**
 * 프로세스 종료
 */
function killProcess(proc: ChildProcess): void {
  if (proc.pid) {
    try {
      process.kill(-proc.pid);
    } catch {
      proc.kill();
    }
  }
}

program
  .name('konai-pipeline')
  .description('KonaI-Agent 통합 자동화 파이프라인')
  .version('1.0.0');

// 전체 파이프라인 실행
program
  .command('full')
  .description('전체 파이프라인 실행 (캡처 + 문서 생성 + 검증)')
  .option('-l, --locale <locale>', '로케일', 'ko-KR')
  .option('-u, --url <url>', '기본 URL', 'http://localhost:3000')
  .option('-o, --output <dir>', '출력 디렉토리', 'outputs')
  .option('-f, --format <formats>', '문서 포맷', 'md,docx')
  .option('--skip-capture', '캡처 단계 건너뛰기')
  .option('--skip-generate', '문서 생성 건너뛰기')
  .option('--skip-validate', '검증 건너뛰기')
  .action(async (options: Partial<PipelineOptions>) => {
    const startTime = Date.now();
    console.log(chalk.bold.blue('\n🚀 KonaI 자동화 파이프라인\n'));
    console.log(chalk.gray(`로케일: ${options.locale}`));
    console.log(chalk.gray(`출력: ${options.output}`));
    console.log(chalk.gray(`포맷: ${options.format}\n`));

    let devServer: ChildProcess | null = null;
    const results: { step: string; success: boolean; duration: number }[] = [];

    try {
      // 1. 개발 서버 시작 (캡처가 필요한 경우)
      if (!options.skipCapture) {
        const serverSpinner = ora('개발 서버 시작 중...').start();
        try {
          devServer = await startDevServer(3000);
          serverSpinner.succeed('개발 서버 시작됨');
        } catch (error) {
          serverSpinner.warn('개발 서버 시작 실패 - 기존 서버 사용');
        }
      }

      // 2. 스크린샷 캡처
      if (!options.skipCapture) {
        const captureSpinner = ora('스크린샷 캡처 중...').start();
        const captureStart = Date.now();

        const captureResult = await runCommand('npx', [
          'tsx',
          'scripts/capture/index.ts',
          '--scenarios', 'all',
          '--locale', options.locale || 'ko-KR',
          '--output', `${options.output}/screenshots`,
          '--url', options.url || 'http://localhost:3000',
        ], captureSpinner);

        const captureDuration = Date.now() - captureStart;

        if (captureResult.success) {
          captureSpinner.succeed(`스크린샷 캡처 완료 (${(captureDuration / 1000).toFixed(1)}초)`);
        } else {
          captureSpinner.fail('스크린샷 캡처 실패');
          console.log(chalk.red(captureResult.output));
        }

        results.push({
          step: '스크린샷 캡처',
          success: captureResult.success,
          duration: captureDuration,
        });
      }

      // 3. 문서 생성
      if (!options.skipGenerate) {
        const generateSpinner = ora('문서 생성 중...').start();
        const generateStart = Date.now();

        const generateResult = await runCommand('npx', [
          'tsx',
          'scripts/generate/index.ts',
          '--type', 'spec',
          '--locale', options.locale || 'ko-KR',
          '--format', options.format || 'md,docx',
          '--output', `${options.output}/documents`,
          '--screenshots', `${options.output}/screenshots`,
        ], generateSpinner);

        const generateDuration = Date.now() - generateStart;

        if (generateResult.success) {
          generateSpinner.succeed(`문서 생성 완료 (${(generateDuration / 1000).toFixed(1)}초)`);
        } else {
          generateSpinner.fail('문서 생성 실패');
          console.log(chalk.red(generateResult.output));
        }

        results.push({
          step: '문서 생성',
          success: generateResult.success,
          duration: generateDuration,
        });
      }

      // 4. 접근성 검증
      if (!options.skipValidate) {
        const validateSpinner = ora('접근성 검증 중...').start();
        const validateStart = Date.now();

        const validateResult = await runCommand('npx', [
          'tsx',
          'scripts/validate/accessibility.ts',
          '--url', options.url || 'http://localhost:3000',
          '--output', `${options.output}/reports`,
        ], validateSpinner);

        const validateDuration = Date.now() - validateStart;

        if (validateResult.success) {
          validateSpinner.succeed(`접근성 검증 완료 (${(validateDuration / 1000).toFixed(1)}초)`);
        } else {
          validateSpinner.warn('접근성 검증 완료 (일부 위반 발견)');
        }

        results.push({
          step: '접근성 검증',
          success: validateResult.success,
          duration: validateDuration,
        });
      }

      // 결과 요약
      const totalDuration = Date.now() - startTime;
      const successCount = results.filter((r) => r.success).length;
      const totalSteps = results.length;

      console.log(chalk.bold.green('\n✅ 파이프라인 완료\n'));
      console.log(chalk.white('단계별 결과:'));

      for (const result of results) {
        const icon = result.success ? chalk.green('✓') : chalk.red('✗');
        console.log(`  ${icon} ${result.step}: ${(result.duration / 1000).toFixed(1)}초`);
      }

      console.log(chalk.white(`\n총 소요 시간: ${(totalDuration / 1000).toFixed(1)}초`));
      console.log(chalk.white(`성공: ${successCount}/${totalSteps}`));

      // 파이프라인 요약 저장
      const summaryPath = path.join(options.output || 'outputs', 'pipeline-summary.json');
      fs.writeFileSync(
        summaryPath,
        JSON.stringify(
          {
            completedAt: new Date().toISOString(),
            locale: options.locale,
            totalDuration,
            results,
          },
          null,
          2
        )
      );
      console.log(chalk.gray(`\n요약 저장됨: ${summaryPath}`));

    } finally {
      // 개발 서버 종료
      if (devServer) {
        killProcess(devServer);
        console.log(chalk.gray('\n개발 서버 종료됨'));
      }
    }
  });

// 캡처만 실행
program
  .command('capture')
  .description('스크린샷 캡처만 실행')
  .option('-s, --scenario <id>', '특정 시나리오')
  .option('-a, --all', '모든 시나리오')
  .option('-l, --locale <locale>', '로케일', 'ko-KR')
  .option('-u, --url <url>', '기본 URL', 'http://localhost:3000')
  .action(async (options) => {
    const spinner = ora('캡처 시작...').start();

    const args = [
      'tsx', 'scripts/capture/index.ts',
      '--locale', options.locale,
      '--url', options.url,
    ];

    if (options.scenario) {
      args.push('--scenario', options.scenario);
    } else if (options.all) {
      args.push('--scenarios', 'all');
    }

    const result = await runCommand('npx', args, spinner);

    if (result.success) {
      spinner.succeed('캡처 완료');
    } else {
      spinner.fail('캡처 실패');
      console.log(result.output);
    }
  });

// 문서 생성만 실행
program
  .command('generate')
  .description('문서 생성만 실행')
  .option('-t, --type <type>', '문서 유형', 'spec')
  .option('-l, --locale <locale>', '로케일', 'ko-KR')
  .option('-f, --format <formats>', '포맷', 'md,docx')
  .action(async (options) => {
    const spinner = ora('문서 생성 시작...').start();

    const result = await runCommand('npx', [
      'tsx', 'scripts/generate/index.ts',
      '--type', options.type,
      '--locale', options.locale,
      '--format', options.format,
    ], spinner);

    if (result.success) {
      spinner.succeed('문서 생성 완료');
    } else {
      spinner.fail('문서 생성 실패');
      console.log(result.output);
    }
  });

// 접근성 검증만 실행
program
  .command('validate')
  .description('접근성 검증만 실행')
  .option('-u, --url <url>', '기본 URL', 'http://localhost:3000')
  .action(async (options) => {
    const spinner = ora('접근성 검증 시작...').start();

    const result = await runCommand('npx', [
      'tsx', 'scripts/validate/accessibility.ts',
      '--url', options.url,
    ], spinner);

    if (result.success) {
      spinner.succeed('접근성 검증 완료');
    } else {
      spinner.warn('접근성 검증 완료 (위반 사항 발견)');
      console.log(result.output);
    }
  });

// 상태 확인
program
  .command('status')
  .description('파이프라인 상태 확인')
  .action(() => {
    console.log(chalk.blue('\n📊 파이프라인 상태\n'));

    // 출력 디렉토리 확인
    const outputDirs = [
      { name: '스크린샷', path: 'outputs/screenshots' },
      { name: '문서', path: 'outputs/documents' },
      { name: '리포트', path: 'outputs/reports' },
      { name: '로그', path: 'outputs/logs' },
    ];

    for (const dir of outputDirs) {
      const exists = fs.existsSync(dir.path);
      const icon = exists ? chalk.green('✓') : chalk.gray('○');
      let count = 0;

      if (exists) {
        const files = fs.readdirSync(dir.path, { recursive: true });
        count = files.filter((f) => typeof f === 'string' && !f.includes('/')).length;
      }

      console.log(`  ${icon} ${dir.name}: ${exists ? `${count}개 파일` : '없음'}`);
    }

    // 최근 실행 정보
    const summaryPath = 'outputs/pipeline-summary.json';
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      console.log(chalk.blue('\n최근 실행:'));
      console.log(`  완료 시각: ${summary.completedAt}`);
      console.log(`  소요 시간: ${(summary.totalDuration / 1000).toFixed(1)}초`);
    }
  });

program.parse();
