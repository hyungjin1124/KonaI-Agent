import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { AgentMarketplaceView } from './AgentMarketplaceView';
import { MOCK_PLUGINS, CATEGORY_LABELS, CATEGORY_LIST, filterPlugins, formatInstalls } from './agentMarketplaceData';

// Mock Radix Dialog (Sheet is built on Dialog)
vi.mock('@radix-ui/react-dialog', () => {
  const Root = ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open !== false ? <>{children}</> : null;
  const Portal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const Overlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    (props, ref) => <div ref={ref} {...props} />,
  );
  Overlay.displayName = 'Overlay';
  const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    (props, ref) => <div ref={ref} {...props} />,
  );
  Content.displayName = 'Content';
  const Title = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props}>{children}</h2>
  );
  const Description = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props}>{children}</p>
  );
  const Close = ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  );
  const Trigger = ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  );

  return { Root, Portal, Overlay, Content, Title, Description, Close, Trigger };
});

describe('AgentMarketplaceView — QA Edge Cases', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  // === 3-1. 데이터 경계 테스트 ===

  describe('Empty state handling', () => {
    it('shows empty state message in catalog when search returns no results', async () => {
      render(<AgentMarketplaceView />);
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, '존재하지않는플러그인xyz');
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
      expect(screen.queryByTestId('plugin-grid')).not.toBeInTheDocument();
    });

    it('shows correct empty state message in installed tab when no plugins are installed', async () => {
      render(<AgentMarketplaceView />);
      // First uninstall all installed plugins by switching to catalog and removing each
      // Instead, go to installed tab and remove all
      const installedTab = screen.getByText(/내 설치/);
      await user.click(installedTab);

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);

      // Remove all installed plugins
      for (const card of cards) {
        const removeBtn = within(card).queryByLabelText(/제거$/);
        if (removeBtn) {
          await user.click(removeBtn);
        }
      }

      // After removing all, should show installed empty state
      expect(screen.getByText('설치된 플러그인이 없습니다.')).toBeInTheDocument();
    });
  });

  describe('Long text handling', () => {
    it('truncates long plugin descriptions with line-clamp', () => {
      render(<AgentMarketplaceView />);
      // Amplitude has a long description - verify card exists and description area has line-clamp
      const card = screen.getByTestId('plugin-card-amplitude-analytics');
      const descElement = within(card).getByText(/사용자 행동 분석/);
      expect(descElement.className).toContain('line-clamp-2');
    });
  });

  describe('Search edge cases', () => {
    it('searches by tag (not just name)', async () => {
      render(<AgentMarketplaceView />);
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, '퍼널');

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      expect(cards).toHaveLength(1);
      expect(screen.getByText('Amplitude Analytics')).toBeInTheDocument();
    });

    it('searches by publisher name', async () => {
      render(<AgentMarketplaceView />);
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, 'HashiCorp');

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      expect(cards).toHaveLength(1);
      expect(screen.getByText('HashiCorp Vault')).toBeInTheDocument();
    });

    it('performs case-insensitive search', async () => {
      render(<AgentMarketplaceView />);
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, 'github');

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      expect(cards).toHaveLength(1);
    });

    it('combines search and category filter correctly', async () => {
      render(<AgentMarketplaceView />);
      // Filter by development category
      await user.click(screen.getByTestId('category-development'));
      // Then search within that category
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, 'GitHub');

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      expect(cards).toHaveLength(1);
    });

    it('resets search results when search is cleared', async () => {
      render(<AgentMarketplaceView />);
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, 'GitHub');
      expect(within(screen.getByTestId('plugin-grid')).getAllByTestId(/^plugin-card-/)).toHaveLength(1);

      await user.clear(searchInput);
      expect(within(screen.getByTestId('plugin-grid')).getAllByTestId(/^plugin-card-/)).toHaveLength(MOCK_PLUGINS.length);
    });
  });

  // === 3-2. 사용자 인터랙션 테스트 ===

  describe('Rapid interactions', () => {
    it('handles rapid install/uninstall clicks correctly', async () => {
      render(<AgentMarketplaceView />);
      const slackCard = screen.getByTestId('plugin-card-slack-integration');

      // Install
      const installBtn = within(slackCard).getByText('설치');
      await user.click(installBtn);
      expect(within(slackCard).getByText('설치됨')).toBeInTheDocument();

      // Immediately uninstall
      const removeBtn = within(slackCard).getByLabelText('Slack Messenger 제거');
      await user.click(removeBtn);
      expect(within(slackCard).getByText('미설치')).toBeInTheDocument();
    });

    it('handles multiple category switches quickly', async () => {
      render(<AgentMarketplaceView />);

      // Click through categories rapidly
      await user.click(screen.getByTestId('category-development'));
      await user.click(screen.getByTestId('category-security'));
      await user.click(screen.getByTestId('category-data_analysis'));

      // Should show data_analysis plugins (final selection)
      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      const expectedCount = MOCK_PLUGINS.filter((p) => p.category === 'data_analysis').length;
      expect(cards).toHaveLength(expectedCount);
    });
  });

  describe('Keyboard navigation', () => {
    it('supports Enter key to open plugin detail', async () => {
      render(<AgentMarketplaceView />);
      const card = screen.getByTestId('plugin-card-github-dev');
      card.focus();
      await user.keyboard('{Enter}');

      const sheet = screen.getByTestId('plugin-detail-sheet');
      expect(sheet).toBeInTheDocument();
      expect(within(sheet).getByText('GitHub Developer')).toBeInTheDocument();
    });

    it('card has tabIndex=0 for keyboard focus', () => {
      render(<AgentMarketplaceView />);
      const card = screen.getByTestId('plugin-card-github-dev');
      expect(card).toHaveAttribute('tabindex', '0');
    });
  });

  // === 3-3. 상태 전환 테스트 ===

  describe('State transitions', () => {
    it('detail sheet reflects install state change', async () => {
      render(<AgentMarketplaceView />);
      // Open detail for an available plugin
      const slackCard = screen.getByTestId('plugin-card-slack-integration');
      await user.click(slackCard);

      const sheet = screen.getByTestId('plugin-detail-sheet');
      // Should show install button
      expect(within(sheet).getByText('설치하기')).toBeInTheDocument();

      // Install from card (not from sheet)
      const cardInstallBtn = within(slackCard).getByText('설치');
      await user.click(cardInstallBtn);

      // Sheet should update to show installed state
      // The currentSelectedPlugin is synced via useMemo
      expect(within(sheet).getByText('비활성화')).toBeInTheDocument();
    });

    it('installed count updates correctly after install', async () => {
      render(<AgentMarketplaceView />);
      const initialInstalledCount = MOCK_PLUGINS.filter(
        (p) => p.status === 'installed' || p.status === 'update_available',
      ).length;

      // The installed tab shows count
      const installedTab = screen.getByText(`내 설치 (${initialInstalledCount})`);
      expect(installedTab).toBeInTheDocument();

      // Install slack
      const slackCard = screen.getByTestId('plugin-card-slack-integration');
      const installBtn = within(slackCard).getByText('설치');
      await user.click(installBtn);

      // Count should increase
      expect(screen.getByText(`내 설치 (${initialInstalledCount + 1})`)).toBeInTheDocument();
    });

    it('installed count updates correctly after uninstall', async () => {
      render(<AgentMarketplaceView />);
      const initialInstalledCount = MOCK_PLUGINS.filter(
        (p) => p.status === 'installed' || p.status === 'update_available',
      ).length;

      // Uninstall Notion
      const notionCard = screen.getByTestId('plugin-card-notion-connector');
      const removeBtn = within(notionCard).getByLabelText('Notion Workspace 제거');
      await user.click(removeBtn);

      expect(screen.getByText(`내 설치 (${initialInstalledCount - 1})`)).toBeInTheDocument();
    });

    it('tab switch preserves category filter', async () => {
      render(<AgentMarketplaceView />);
      // Set category filter
      await user.click(screen.getByTestId('category-development'));

      // Switch to installed tab
      await user.click(screen.getByText(/내 설치/));

      // Switch back to catalog
      await user.click(screen.getByText('카탈로그'));

      // Category filter should still be active
      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      const expectedCount = MOCK_PLUGINS.filter((p) => p.category === 'development').length;
      expect(cards).toHaveLength(expectedCount);
    });
  });

  // === Data helper unit tests ===

  describe('filterPlugins helper', () => {
    it('returns all plugins when no filters applied', () => {
      const result = filterPlugins(MOCK_PLUGINS, '', 'all', 'catalog');
      expect(result).toHaveLength(MOCK_PLUGINS.length);
    });

    it('installed tab includes update_available plugins', () => {
      const result = filterPlugins(MOCK_PLUGINS, '', 'all', 'installed');
      const hasUpdateAvailable = result.some((p) => p.status === 'update_available');
      expect(hasUpdateAvailable).toBe(true);
    });

    it('installed tab excludes available plugins', () => {
      const result = filterPlugins(MOCK_PLUGINS, '', 'all', 'installed');
      const hasAvailable = result.some((p) => p.status === 'available');
      expect(hasAvailable).toBe(false);
    });
  });

  describe('formatInstalls helper', () => {
    it('formats millions correctly', () => {
      expect(formatInstalls(1_500_000)).toBe('1.5M');
    });

    it('formats thousands correctly', () => {
      expect(formatInstalls(12_400)).toBe('12.4K');
    });

    it('formats small numbers as-is', () => {
      expect(formatInstalls(999)).toBe('999');
    });
  });

  // === Detail sheet specific tests ===

  describe('Detail sheet interactions', () => {
    it('displays tool toggle switches only for installed plugins', async () => {
      render(<AgentMarketplaceView />);
      // Open detail for installed plugin (GitHub)
      await user.click(screen.getByTestId('plugin-card-github-dev'));
      const sheet = screen.getByTestId('plugin-detail-sheet');

      // Should have toggle switches for tools
      const toolToggles = within(sheet).getAllByLabelText(/도구 토글$/);
      expect(toolToggles.length).toBeGreaterThan(0);
    });

    it('does not show tool toggles for available (uninstalled) plugins', async () => {
      render(<AgentMarketplaceView />);
      // Open detail for available plugin (Slack)
      await user.click(screen.getByTestId('plugin-card-slack-integration'));
      const sheet = screen.getByTestId('plugin-detail-sheet');

      // Should NOT have toggle switches for tools
      const toolToggles = within(sheet).queryAllByLabelText(/도구 토글$/);
      expect(toolToggles).toHaveLength(0);
    });

    it('displays version number in detail sheet', async () => {
      render(<AgentMarketplaceView />);
      await user.click(screen.getByTestId('plugin-card-github-dev'));
      const sheet = screen.getByTestId('plugin-detail-sheet');
      expect(within(sheet).getByText('v4.2.1')).toBeInTheDocument();
    });

    it('displays rating, installs, and tool count in stats', async () => {
      render(<AgentMarketplaceView />);
      await user.click(screen.getByTestId('plugin-card-github-dev'));
      const sheet = screen.getByTestId('plugin-detail-sheet');

      expect(within(sheet).getByText('4.9')).toBeInTheDocument();
      expect(within(sheet).getByText('67.3K')).toBeInTheDocument();
      expect(within(sheet).getByText('4')).toBeInTheDocument(); // tool count
    });

    it('displays tags for plugin with tags', async () => {
      render(<AgentMarketplaceView />);
      await user.click(screen.getByTestId('plugin-card-github-dev'));
      const sheet = screen.getByTestId('plugin-detail-sheet');

      expect(within(sheet).getByText('코드')).toBeInTheDocument();
      expect(within(sheet).getByText('PR')).toBeInTheDocument();
    });

    it('closes detail sheet and uninstalls plugin via sheet remove button', async () => {
      render(<AgentMarketplaceView />);
      await user.click(screen.getByTestId('plugin-card-github-dev'));

      const sheet = screen.getByTestId('plugin-detail-sheet');
      // Find remove button within sheet
      const removeBtn = within(sheet).getByText('제거');
      await user.click(removeBtn);

      // Plugin should now be uninstalled
      const card = screen.getByTestId('plugin-card-github-dev');
      expect(within(card).getByText('미설치')).toBeInTheDocument();
    });
  });
});
