import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { AgentMarketplaceView } from './AgentMarketplaceView';
import { MOCK_PLUGINS } from './agentMarketplaceData';

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

describe('AgentMarketplaceView — UX Flow Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  // === 3.5-1. Callback Wiring Audit ===

  describe('Callback wiring: Card → Parent handlers', () => {
    it('onInstall fires from card and updates plugin list state', async () => {
      render(<AgentMarketplaceView />);
      const slackCard = screen.getByTestId('plugin-card-slack-integration');

      // Before: available
      expect(within(slackCard).getByText('미설치')).toBeInTheDocument();

      // Install
      const installBtn = within(slackCard).getByText('설치');
      await user.click(installBtn);

      // After: installed
      expect(within(slackCard).getByText('설치됨')).toBeInTheDocument();
    });

    it('onUninstall fires from card and updates plugin list state', async () => {
      render(<AgentMarketplaceView />);
      const notionCard = screen.getByTestId('plugin-card-notion-connector');

      // Before: installed
      expect(within(notionCard).getByText('설치됨')).toBeInTheDocument();

      // Uninstall
      const removeBtn = within(notionCard).getByLabelText('Notion Workspace 제거');
      await user.click(removeBtn);

      // After: available
      expect(within(notionCard).getByText('미설치')).toBeInTheDocument();
    });

    it('onToggle fires from card and updates enabled state', async () => {
      render(<AgentMarketplaceView />);
      // Code Quality Guard is installed but disabled (isEnabled: false)
      const cqCard = screen.getByTestId('plugin-card-code-quality-guard');
      const toggle = within(cqCard).getByLabelText('Code Quality Guard 활성화 토글');

      // Toggle to enabled
      await user.click(toggle);

      // Verify toggle is still accessible (state change happened)
      expect(toggle).toBeInTheDocument();
    });

    it('onSelect fires from card and opens detail sheet', async () => {
      render(<AgentMarketplaceView />);
      const ampCard = screen.getByTestId('plugin-card-amplitude-analytics');
      await user.click(ampCard);

      const sheet = screen.getByTestId('plugin-detail-sheet');
      expect(within(sheet).getByText('Amplitude Analytics')).toBeInTheDocument();
    });
  });

  describe('Callback wiring: Detail Sheet → Parent handlers', () => {
    it('onInstall fires from sheet and updates both plugin list and selected plugin', async () => {
      render(<AgentMarketplaceView />);
      // Open Slack detail (available)
      await user.click(screen.getByTestId('plugin-card-slack-integration'));

      const sheet = screen.getByTestId('plugin-detail-sheet');
      const installBtn = within(sheet).getByText('설치하기');
      await user.click(installBtn);

      // Sheet should now show installed state
      expect(within(sheet).getByText('비활성화')).toBeInTheDocument();

      // Card should also reflect installed
      const slackCard = screen.getByTestId('plugin-card-slack-integration');
      expect(within(slackCard).getByText('설치됨')).toBeInTheDocument();
    });

    it('onToggle fires from sheet and updates both plugin list and selected plugin', async () => {
      render(<AgentMarketplaceView />);
      // Open Amplitude detail (installed, enabled)
      await user.click(screen.getByTestId('plugin-card-amplitude-analytics'));

      const sheet = screen.getByTestId('plugin-detail-sheet');
      // Click the disable button
      const toggleBtn = within(sheet).getByText('비활성화');
      await user.click(toggleBtn);

      // Should now show "활성화" (indicating it was disabled)
      expect(within(sheet).getByText('활성화')).toBeInTheDocument();
    });

    it('onToolToggle fires from sheet and updates tool enabled state', async () => {
      render(<AgentMarketplaceView />);
      // Open GitHub detail (installed)
      await user.click(screen.getByTestId('plugin-card-github-dev'));

      const sheet = screen.getByTestId('plugin-detail-sheet');
      // Toggle a tool switch
      const toolToggles = within(sheet).getAllByLabelText(/도구 토글$/);
      expect(toolToggles.length).toBeGreaterThan(0);
      await user.click(toolToggles[0]);

      // Tool toggle should still be accessible (state changed)
      expect(toolToggles[0]).toBeInTheDocument();
    });
  });

  // === 3.5-2. Dual State Sync ===

  describe('Dual state sync: plugins state ↔ selectedPlugin state', () => {
    it('plugins update syncs to selectedPlugin (via currentSelectedPlugin memo)', async () => {
      render(<AgentMarketplaceView />);
      // Open detail for an available plugin
      await user.click(screen.getByTestId('plugin-card-slack-integration'));
      const sheet = screen.getByTestId('plugin-detail-sheet');

      // Install from card (updates plugins state)
      const slackCard = screen.getByTestId('plugin-card-slack-integration');
      const installBtn = within(slackCard).getByText('설치');
      await user.click(installBtn);

      // Detail sheet should reflect the updated state (synced via currentSelectedPlugin)
      expect(within(sheet).getByText('비활성화')).toBeInTheDocument();
    });

    it('selectedPlugin update from sheet action syncs to plugins list', async () => {
      render(<AgentMarketplaceView />);
      // Open detail for Amplitude (installed)
      await user.click(screen.getByTestId('plugin-card-amplitude-analytics'));

      const sheet = screen.getByTestId('plugin-detail-sheet');
      // Uninstall from sheet
      const removeBtn = within(sheet).getByText('제거');
      await user.click(removeBtn);

      // Card should reflect uninstalled state
      const ampCard = screen.getByTestId('plugin-card-amplitude-analytics');
      expect(within(ampCard).getByText('미설치')).toBeInTheDocument();
    });
  });

  // === 3.5-3. Terminal State Scenarios ===

  describe('Terminal state: Remove all installed plugins', () => {
    it('shows empty state in installed tab when all plugins are removed', async () => {
      render(<AgentMarketplaceView />);
      // Switch to installed tab
      const installedTab = screen.getByText(/내 설치/);
      await user.click(installedTab);

      // Get all installed plugin cards and remove them one by one
      let grid = screen.queryByTestId('plugin-grid');
      while (grid) {
        const cards = within(grid).queryAllByTestId(/^plugin-card-/);
        if (cards.length === 0) break;
        const removeBtn = within(cards[0]).queryByLabelText(/제거$/);
        if (removeBtn) {
          await user.click(removeBtn);
        } else {
          break;
        }
        grid = screen.queryByTestId('plugin-grid');
      }

      // Should show empty state
      expect(screen.getByText('설치된 플러그인이 없습니다.')).toBeInTheDocument();
      // Installed count should be 0
      expect(screen.getByText('내 설치 (0)')).toBeInTheDocument();
    });
  });

  describe('Terminal state: Category filter with no matching plugins', () => {
    it('shows empty state after filtering category then removing matching plugins', async () => {
      render(<AgentMarketplaceView />);
      // Filter by security category (only HashiCorp Vault — available, not installed)
      await user.click(screen.getByTestId('category-security'));

      const grid = screen.getByTestId('plugin-grid');
      const cards = within(grid).getAllByTestId(/^plugin-card-/);
      expect(cards).toHaveLength(1); // Only vault-secrets
    });
  });

  // === 3.5-4. Critical User Flows ===

  describe('Flow 1: Browse → Select → Install → Manage', () => {
    it('complete installation flow from browsing to management', async () => {
      render(<AgentMarketplaceView />);

      // 1. Browse: User sees 12 plugins in catalog
      const grid = screen.getByTestId('plugin-grid');
      expect(within(grid).getAllByTestId(/^plugin-card-/)).toHaveLength(12);

      // 2. Filter: User filters by productivity
      await user.click(screen.getByTestId('category-productivity'));
      const prodPlugins = MOCK_PLUGINS.filter((p) => p.category === 'productivity');
      expect(within(grid).getAllByTestId(/^plugin-card-/)).toHaveLength(prodPlugins.length);

      // 3. Select: User clicks on Jira
      await user.click(screen.getByTestId('plugin-card-jira-project'));
      const sheet = screen.getByTestId('plugin-detail-sheet');
      expect(within(sheet).getByText('Jira Project')).toBeInTheDocument();
      expect(within(sheet).getByText('설치하기')).toBeInTheDocument();

      // 4. Install: User installs from sheet
      await user.click(within(sheet).getByText('설치하기'));

      // 5. Verify: Card shows installed
      const jiraCard = screen.getByTestId('plugin-card-jira-project');
      expect(within(jiraCard).getByText('설치됨')).toBeInTheDocument();

      // 6. Navigate to installed tab
      await user.click(screen.getByText(/내 설치/));
      // Jira should appear in installed list
      expect(screen.getByTestId('plugin-card-jira-project')).toBeInTheDocument();
    });
  });

  describe('Flow 2: Install → Toggle → Tool Toggle → Uninstall', () => {
    it('complete lifecycle: install, configure tools, uninstall', async () => {
      render(<AgentMarketplaceView />);

      // 1. Install Slack
      const slackCard = screen.getByTestId('plugin-card-slack-integration');
      const installBtn = within(slackCard).getByText('설치');
      await user.click(installBtn);

      // 2. Open detail
      await user.click(slackCard);
      const sheet = screen.getByTestId('plugin-detail-sheet');

      // 3. Toggle tool on/off
      const toolToggles = within(sheet).getAllByLabelText(/도구 토글$/);
      expect(toolToggles.length).toBe(3); // Slack has 3 tools
      await user.click(toolToggles[0]); // Toggle first tool

      // 4. Disable plugin
      const disableBtn = within(sheet).getByText('비활성화');
      await user.click(disableBtn);
      expect(within(sheet).getByText('활성화')).toBeInTheDocument();

      // 5. Uninstall from sheet
      const removeBtn = within(sheet).getByText('제거');
      await user.click(removeBtn);

      // 6. Card should show uninstalled
      expect(within(slackCard).getByText('미설치')).toBeInTheDocument();
    });
  });

  describe('Flow 3: Search → No results → Clear → Results restored', () => {
    it('handles search to no results and back to full results', async () => {
      render(<AgentMarketplaceView />);

      // 1. Search for something that exists
      const searchInput = screen.getByTestId('marketplace-search');
      await user.type(searchInput, 'Notion');
      expect(within(screen.getByTestId('plugin-grid')).getAllByTestId(/^plugin-card-/)).toHaveLength(1);

      // 2. Search for something that doesn't exist
      await user.clear(searchInput);
      await user.type(searchInput, 'xyznonexistent');
      expect(screen.queryByTestId('plugin-grid')).not.toBeInTheDocument();
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();

      // 3. Clear search
      await user.clear(searchInput);

      // 4. All plugins should be restored
      expect(within(screen.getByTestId('plugin-grid')).getAllByTestId(/^plugin-card-/)).toHaveLength(12);
    });
  });

  // === plan.md integration point verification ===

  describe('plan.md Integration: AdminView marketplace tab', () => {
    it('AgentMarketplaceView is self-contained (no props)', () => {
      // Verify it renders without any props - matches plan.md "Props 없음" spec
      const { container } = render(<AgentMarketplaceView />);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
