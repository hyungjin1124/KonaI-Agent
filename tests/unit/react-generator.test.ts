/**
 * ReactGenerator 단위 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ReactGenerator, ScreenType, GeneratorConfig } from '../../scripts/core/react-generator';

// fs 모듈 모킹
vi.mock('fs');

describe('ReactGenerator', () => {
  let generator: ReactGenerator;
  const mockOutputDir = 'src/pages';

  beforeEach(() => {
    generator = new ReactGenerator(mockOutputDir);
    vi.clearAllMocks();

    // fs.existsSync 모킹
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ screens: [] }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generate', () => {
    const baseConfig: GeneratorConfig = {
      screenId: 'SCR-001',
      screenName: '테스트 화면',
      screenNameEn: 'TestScreen',
      screenType: 'crud',
      requirements: '목록 조회, 등록, 수정, 삭제',
      outputDir: mockOutputDir,
    };

    it('should generate files for CRUD screen type', async () => {
      const result = await generator.generate(baseConfig);

      expect(result.success).toBe(true);
      expect(result.screenId).toBe('SCR-001');
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.componentPath).toContain('test-screen');
    });

    it('should generate files for Dashboard screen type', async () => {
      const config: GeneratorConfig = {
        ...baseConfig,
        screenType: 'dashboard',
      };

      const result = await generator.generate(config);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should generate files for Form screen type', async () => {
      const config: GeneratorConfig = {
        ...baseConfig,
        screenType: 'form',
      };

      const result = await generator.generate(config);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should generate files for Report screen type', async () => {
      const config: GeneratorConfig = {
        ...baseConfig,
        screenType: 'report',
      };

      const result = await generator.generate(config);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should create directory structure', async () => {
      await generator.generate(baseConfig);

      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('should write all required files', async () => {
      const result = await generator.generate(baseConfig);

      // 최소 4개 파일: tsx, styles.ts, types.ts, index.ts
      expect(result.files.length).toBeGreaterThanOrEqual(4);
      // result.files + screen-states.json 업데이트 (1회 추가)
      expect(fs.writeFileSync).toHaveBeenCalledTimes(result.files.length + 1);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(fs.mkdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await generator.generate(baseConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateComponent', () => {
    it('should return screen config when screen exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        screens: [
          {
            id: 'SCR-001',
            name: '테스트',
            nameEn: 'Test',
            route: '/test',
          },
        ],
      }));

      const result = await generator.updateComponent('SCR-001', 'Update description');

      expect(result.success).toBe(true);
      expect(result.screenId).toBe('SCR-001');
    });

    it('should return error when screen not found', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ screens: [] }));

      const result = await generator.updateComponent('SCR-999', 'Update');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
