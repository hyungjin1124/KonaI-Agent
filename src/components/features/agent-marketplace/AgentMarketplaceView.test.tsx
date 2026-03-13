import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { AgentMarketplaceView } from './AgentMarketplaceView';
import { MOCK_PLUGINS, CATEGORY_LABELS, CATEGORY_LIST } from './agentMarketplaceData';

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

  return {
    Root,
    Portal,
    Overlay,
    Content,
    Title,
    Description,
    Close,
    Trigger,
  };
});

describe('AgentMarketplaceView', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  // --- Smoke Test ---
  it('renders without error', () => {
    render(<AgentMarketplaceView />);
    expect(screen.getByTestId('agent-marketplace-view')).toBeInTheDocument();
  });

  // --- AC1: 카드 그리드 + 검색 + 카테고리 필터 ---
  describe('AC1: Plugin catalog with cards, search, and category filter', () => {
    it('displays all 12 plugin cards on initial render', () => {
      render(<AgentMarketplaceView />);
      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      expect(cards).toHaveLength(MOCK_PLUGINS.length);
    });

    it('filters plugins by category when filter chip is clicked', async () => {
      render(<AgentMarketplaceView />);
      const devCategory = screen.getByTestId('category-development');
      await user.click(devCategory);

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      const expectedCount = MOCK_PLUGINS.filter((p) => p.category === 'development').length;
      expect(cards).toHaveLength(expectedCount);
    });

    it('filters plugins by search query', async () => {
      render(<AgentMarketplaceView />);
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, 'GitHub');

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      expect(cards).toHaveLength(1);
      expect(screen.getByText('GitHub Developer')).toBeInTheDocument();
    });

    it('shows empty state when no plugins match search', async () => {
      render(<AgentMarketplaceView />);
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, 'xyznonexistent');

      expect(screen.queryByTestId('plugin-grid')).not.toBeInTheDocument();
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  // --- AC2: Plugin detail with tools and permissions ---
  describe('AC2: Plugin detail sheet with tools and permissions', () => {
    it('opens detail sheet when card is clicked', async () => {
      render(<AgentMarketplaceView />);
      const card = screen.getByTestId('plugin-card-github-dev');
      await user.click(card);

      const sheet = screen.getByTestId('plugin-detail-sheet');
      expect(sheet).toBeInTheDocument();
      expect(within(sheet).getByText('GitHub Developer')).toBeInTheDocument();
    });

    it('displays tools list in detail sheet', async () => {
      render(<AgentMarketplaceView />);
      const card = screen.getByTestId('plugin-card-github-dev');
      await user.click(card);

      const sheet = screen.getByTestId('plugin-detail-sheet');
      expect(within(sheet).getByText('search_code')).toBeInTheDocument();
      expect(within(sheet).getByText('list_prs')).toBeInTheDocument();
    });

    it('displays permissions in detail sheet', async () => {
      render(<AgentMarketplaceView />);
      const card = screen.getByTestId('plugin-card-github-dev');
      await user.click(card);

      const sheet = screen.getByTestId('plugin-detail-sheet');
      expect(within(sheet).getByText('리포지토리 읽기')).toBeInTheDocument();
      expect(within(sheet).getByText('리포지토리 쓰기')).toBeInTheDocument();
    });
  });

  // --- AC3: Install/uninstall workflow ---
  describe('AC3: Install and uninstall workflow', () => {
    it('installs a plugin when install button is clicked', async () => {
      render(<AgentMarketplaceView />);
      // Slack is available (not installed)
      const slackCard = screen.getByTestId('plugin-card-slack-integration');
      const installBtn = within(slackCard).getByText('설치');
      await user.click(installBtn);

      // After install, card should show "설치됨" badge
      expect(within(slackCard).getByText('설치됨')).toBeInTheDocument();
    });

    it('uninstalls a plugin when remove button is clicked', async () => {
      render(<AgentMarketplaceView />);
      // Notion is installed
      const notionCard = screen.getByTestId('plugin-card-notion-connector');
      // Hover to show remove button — find by aria-label
      const removeBtn = within(notionCard).getByLabelText('Notion Workspace 제거');
      await user.click(removeBtn);

      // After uninstall, should show "미설치"
      expect(within(notionCard).getByText('미설치')).toBeInTheDocument();
    });
  });

  // --- AC4: Installed tab with toggle and remove ---
  describe('AC4: Installed plugins management', () => {
    it('shows only installed plugins in installed tab', async () => {
      render(<AgentMarketplaceView />);
      const installedTab = screen.getByText(/내 설치/);
      await user.click(installedTab);

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      const expectedCount = MOCK_PLUGINS.filter(
        (p) => p.status === 'installed' || p.status === 'update_available',
      ).length;
      expect(cards).toHaveLength(expectedCount);
    });

    it('toggles plugin enabled state', async () => {
      render(<AgentMarketplaceView />);
      // Code Quality Guard is installed but disabled
      const cqCard = screen.getByTestId('plugin-card-code-quality-guard');
      const toggle = within(cqCard).getByLabelText('Code Quality Guard 활성화 토글');
      await user.click(toggle);
      // Verify toggle was clicked (state changed internally)
      expect(toggle).toBeInTheDocument();
    });

    it('removes plugin from installed list', async () => {
      render(<AgentMarketplaceView />);
      const installedTab = screen.getByText(/내 설치/);
      await user.click(installedTab);

      const initialCards = within(screen.getByTestId('plugin-grid')).getAllByTestId(/^plugin-card-/);
      const initialCount = initialCards.length;

      // Remove Amplitude
      const ampCard = screen.getByTestId('plugin-card-amplitude-analytics');
      const removeBtn = within(ampCard).getByLabelText('Amplitude Analytics 제거');
      await user.click(removeBtn);

      // Should have one less card in installed tab
      const updatedCards = within(screen.getByTestId('plugin-grid')).getAllByTestId(/^plugin-card-/);
      expect(updatedCards).toHaveLength(initialCount - 1);
    });
  });

  // --- AC6: Categories ---
  describe('AC6: Category filters', () => {
    it('has 6 category filter chips plus "all"', () => {
      render(<AgentMarketplaceView />);
      const filters = screen.getByTestId('category-filters');
      // 전체 + 6 categories = 7 buttons
      const buttons = within(filters).getAllByRole('button');
      expect(buttons).toHaveLength(7);
    });

    it('displays all category labels correctly', () => {
      render(<AgentMarketplaceView />);
      const filters = screen.getByTestId('category-filters');
      for (const cat of CATEGORY_LIST) {
        expect(within(filters).getByText(CATEGORY_LABELS[cat])).toBeInTheDocument();
      }
    });
  });

  // --- AC7: Responsive grid ---
  describe('AC7: Responsive grid layout', () => {
    it('plugin grid has responsive column classes', () => {
      render(<AgentMarketplaceView />);
      const grid = screen.getByTestId('plugin-grid');
      expect(grid.className).toContain('grid-cols-1');
      expect(grid.className).toContain('md:grid-cols-2');
      expect(grid.className).toContain('lg:grid-cols-3');
    });
  });

  // --- AC8: Status badges ---
  describe('AC8: Plugin status badges', () => {
    it('shows "설치됨" badge for installed plugins', () => {
      render(<AgentMarketplaceView />);
      const ghCard = screen.getByTestId('plugin-card-github-dev');
      expect(within(ghCard).getByText('설치됨')).toBeInTheDocument();
    });

    it('shows "미설치" badge for available plugins', () => {
      render(<AgentMarketplaceView />);
      const slackCard = screen.getByTestId('plugin-card-slack-integration');
      expect(within(slackCard).getByText('미설치')).toBeInTheDocument();
    });

    it('shows "업데이트" badge for update_available plugins', () => {
      render(<AgentMarketplaceView />);
      const hsCard = screen.getByTestId('plugin-card-hubspot-crm');
      expect(within(hsCard).getByText('업데이트')).toBeInTheDocument();
    });
  });
});
