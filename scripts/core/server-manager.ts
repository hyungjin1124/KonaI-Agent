/**
 * 로컬 개발 서버 라이프사이클 관리
 */

import { spawn, ChildProcess, exec } from 'child_process';
import * as http from 'http';

export interface ServerConfig {
  port: number;
  startTimeout: number;
  healthCheckUrl: string;
  command: string;
  args: string[];
  cwd?: string;
}

export interface ServerStatus {
  running: boolean;
  port: number;
  pid?: number;
  url: string;
  startedAt?: Date;
}

const DEFAULT_CONFIG: ServerConfig = {
  port: 3000,
  startTimeout: 30000,
  healthCheckUrl: '/',
  command: 'npm',
  args: ['run', 'dev'],
};

export class ServerManager {
  private config: ServerConfig;
  private process: ChildProcess | null = null;
  private startedAt: Date | null = null;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 개발 서버 시작
   */
  async start(port?: number): Promise<void> {
    if (this.isRunning()) {
      console.log('[ServerManager] Server is already running');
      return;
    }

    const usePort = port || this.config.port;
    console.log(`[ServerManager] Starting server on port ${usePort}...`);

    // 포트가 이미 사용 중인지 확인
    const portInUse = await this.isPortInUse(usePort);
    if (portInUse) {
      console.log(`[ServerManager] Port ${usePort} is already in use, assuming server is running`);
      return;
    }

    return new Promise((resolve, reject) => {
      // 환경 변수 설정
      const env = {
        ...process.env,
        PORT: String(usePort),
      };

      this.process = spawn(this.config.command, this.config.args, {
        cwd: this.config.cwd || process.cwd(),
        env,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let output = '';

      this.process.stdout?.on('data', (data) => {
        output += data.toString();
        // Vite/Next.js 등의 ready 메시지 감지
        if (output.includes('ready') || output.includes('Local:') || output.includes('started')) {
          console.log('[ServerManager] Server output detected ready state');
        }
      });

      this.process.stderr?.on('data', (data) => {
        const message = data.toString();
        // 에러가 아닌 경고는 무시
        if (!message.includes('ERROR') && !message.includes('error')) {
          return;
        }
        console.error('[ServerManager] Server error:', message);
      });

      this.process.on('error', (error) => {
        console.error('[ServerManager] Failed to start server:', error);
        reject(error);
      });

      this.process.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          console.error(`[ServerManager] Server exited with code ${code}`);
        }
        this.process = null;
        this.startedAt = null;
      });

      // 서버 준비 상태 대기
      this.waitForReady(this.config.startTimeout)
        .then(() => {
          this.startedAt = new Date();
          console.log(`[ServerManager] Server is ready at ${this.getUrl()}`);
          resolve();
        })
        .catch((error) => {
          this.stop();
          reject(error);
        });
    });
  }

  /**
   * 서버 준비 상태 대기
   */
  async waitForReady(timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 500;
    const url = this.getUrl() + this.config.healthCheckUrl;

    console.log(`[ServerManager] Waiting for server at ${url}...`);

    while (Date.now() - startTime < timeout) {
      try {
        const isReady = await this.healthCheck(url);
        if (isReady) {
          return true;
        }
      } catch {
        // 연결 실패는 예상되는 상황
      }

      await this.sleep(checkInterval);
    }

    throw new Error(`Server did not become ready within ${timeout}ms`);
  }

  /**
   * Health check 수행
   */
  private healthCheck(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(url, (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 304);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * 서버 중지
   */
  async stop(): Promise<void> {
    if (!this.process) {
      console.log('[ServerManager] Server is not running');
      return;
    }

    console.log('[ServerManager] Stopping server...');

    return new Promise((resolve) => {
      if (!this.process) {
        resolve();
        return;
      }

      this.process.on('exit', () => {
        this.process = null;
        this.startedAt = null;
        console.log('[ServerManager] Server stopped');
        resolve();
      });

      // Windows와 Unix 모두 지원
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${this.process.pid} /T /F`);
      } else {
        this.process.kill('SIGTERM');

        // SIGTERM이 작동하지 않으면 SIGKILL
        setTimeout(() => {
          if (this.process) {
            this.process.kill('SIGKILL');
          }
        }, 5000);
      }
    });
  }

  /**
   * 서버 재시작
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.sleep(1000);
    await this.start();
  }

  /**
   * 서버 실행 상태 확인
   */
  isRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }

  /**
   * 서버 URL 반환
   */
  getUrl(): string {
    return `http://localhost:${this.config.port}`;
  }

  /**
   * 서버 상태 조회
   */
  getStatus(): ServerStatus {
    return {
      running: this.isRunning(),
      port: this.config.port,
      pid: this.process?.pid,
      url: this.getUrl(),
      startedAt: this.startedAt || undefined,
    };
  }

  /**
   * 포트 사용 여부 확인
   */
  private isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = http.createServer();

      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve(false);
      });

      server.listen(port);
    });
  }

  /**
   * Sleep 유틸리티
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 싱글톤 인스턴스
 */
let serverInstance: ServerManager | null = null;

export function getServerManager(config?: Partial<ServerConfig>): ServerManager {
  if (!serverInstance) {
    serverInstance = new ServerManager(config);
  }
  return serverInstance;
}

export function resetServerManager(): void {
  if (serverInstance) {
    serverInstance.stop();
    serverInstance = null;
  }
}
