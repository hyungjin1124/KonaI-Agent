#!/usr/bin/env node
/**
 * KonaI-Agent 문서 생성 CLI
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { SpecGenerator, GeneratorConfig, GenerationResult } from './spec-generator.js';
import { getAllScreens } from '../capture/scenarios/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('konai-generate')
  .description('KonaI-Agent 문서 생성 도구')
  .version('1.0.0');

program
  .option('-t, --type <type>', '문서 유형 (spec, guide, all)', 'spec')
  .option('-l, --locale <locale>', '로케일 (ko-KR, en-US)', 'ko-KR')
  .option('-f, --format <formats>', '출력 포맷 (md,docx,pdf)', 'md,docx')
  .option('-o, --output <dir>', '출력 디렉토리', 'outputs/documents')
  .option('-s, --screenshots <dir>', '스크린샷 디렉토리', 'outputs/screenshots')
  .option('-m, --manifest <path>', '캡처 매니페스트 경로')
  .option('--screen <id>', '특정 화면만 생성')
  .action(async (options) => {
    const startTime = Date.now();
    const spinner = ora('문서 생성 준비 중...').start();

    const locale = options.locale as 'ko-KR' | 'en-US';
    const formats = options.format.split(',') as ('md' | 'docx' | 'pdf')[];
    const outputDir = options.output;
    const screenshotDir = options.screenshots;

    const config: GeneratorConfig = {
      outputDir,
      screenshotDir,
      locale,
      formats,
    };

    // 출력 디렉토리 생성
    const localeOutputDir = path.join(outputDir, locale);
    for (const format of formats) {
      const formatDir = path.join(localeOutputDir, format);
      if (!fs.existsSync(formatDir)) {
        fs.mkdirSync(formatDir, { recursive: true });
      }
    }

    const generator = new SpecGenerator();
    const results: GenerationResult[] = [];

    try {
      if (options.type === 'spec' || options.type === 'all') {
        spinner.text = '화면 명세서 생성 중...';

        // 매니페스트가 있으면 사용
        const manifestPath =
          options.manifest || path.join(screenshotDir, `manifest-${locale}.json`);

        if (fs.existsSync(manifestPath)) {
          spinner.text = `매니페스트 기반 생성: ${manifestPath}`;
          const specResults = await generator.generateFromManifest(manifestPath, config);
          results.push(...specResults);
        } else {
          // 매니페스트 없이 화면 설정 기반으로 생성
          spinner.text = '화면 설정 기반 생성...';
          const screens = getAllScreens();

          const targetScreens = options.screen
            ? screens.filter((s) => s.id === options.screen)
            : screens;

          for (const screen of targetScreens) {
            const result = await generator.generateForScreen(screen, config);
            results.push(result);
          }
        }
      }

      // 결과 요약
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      spinner.succeed('문서 생성 완료');

      console.log(chalk.green(`\n✅ 생성 완료`));
      console.log(chalk.white(`   성공: ${successCount}개`));
      if (failCount > 0) {
        console.log(chalk.red(`   실패: ${failCount}개`));
      }
      console.log(chalk.white(`   소요 시간: ${duration}초`));
      console.log(chalk.white(`   출력 경로: ${localeOutputDir}`));

      // 생성된 파일 목록
      console.log(chalk.blue('\n📄 생성된 파일:'));
      for (const result of results) {
        if (result.success) {
          console.log(chalk.white(`\n  ${result.screenId}: ${result.screenName}`));
          if (result.files.md) {
            console.log(chalk.gray(`    - MD: ${result.files.md}`));
          }
          if (result.files.docx) {
            console.log(chalk.gray(`    - DOCX: ${result.files.docx}`));
          }
          if (result.files.pdf) {
            console.log(chalk.gray(`    - PDF: ${result.files.pdf}`));
          }
        } else {
          console.log(chalk.red(`\n  ${result.screenId}: 실패 - ${result.error}`));
        }
      }

      // 요약 JSON 저장
      const summaryPath = path.join(localeOutputDir, 'generation-summary.json');
      fs.writeFileSync(
        summaryPath,
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            locale,
            formats,
            totalScreens: results.length,
            successCount,
            failCount,
            results,
          },
          null,
          2
        )
      );
      console.log(chalk.white(`\n   요약: ${summaryPath}`));

    } catch (error) {
      spinner.fail('문서 생성 실패');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// 목록 명령어
program
  .command('list')
  .description('생성 가능한 화면 목록')
  .action(() => {
    const screens = getAllScreens();

    console.log(chalk.blue('\n📋 생성 가능한 화면\n'));

    for (const screen of screens) {
      console.log(chalk.white(`  ${screen.id}: ${screen.name}`));
      console.log(chalk.gray(`    - 컴포넌트: ${screen.component}`));
      console.log(chalk.gray(`    - 상태 수: ${screen.states.length}`));
    }

    console.log(chalk.blue(`\n총 ${screens.length}개 화면`));
  });

// 포맷 검증 명령어
program
  .command('validate <path>')
  .description('생성된 문서 검증')
  .action((docPath) => {
    if (!fs.existsSync(docPath)) {
      console.error(chalk.red(`파일을 찾을 수 없습니다: ${docPath}`));
      process.exit(1);
    }

    const ext = path.extname(docPath).toLowerCase();

    if (ext === '.md') {
      const content = fs.readFileSync(docPath, 'utf-8');
      const lines = content.split('\n').length;
      const hasTitle = content.startsWith('#');
      const hasTable = content.includes('|---');

      console.log(chalk.blue('\n📄 Markdown 검증 결과\n'));
      console.log(`  파일: ${docPath}`);
      console.log(`  라인 수: ${lines}`);
      console.log(`  제목 존재: ${hasTitle ? '✅' : '❌'}`);
      console.log(`  테이블 존재: ${hasTable ? '✅' : '❌'}`);
    } else if (ext === '.docx') {
      const stats = fs.statSync(docPath);
      console.log(chalk.blue('\n📄 DOCX 검증 결과\n'));
      console.log(`  파일: ${docPath}`);
      console.log(`  크기: ${(stats.size / 1024).toFixed(1)} KB`);
      console.log(`  생성일: ${stats.birthtime.toISOString()}`);
    } else {
      console.log(chalk.yellow(`지원하지 않는 형식: ${ext}`));
    }
  });

program.parse();
