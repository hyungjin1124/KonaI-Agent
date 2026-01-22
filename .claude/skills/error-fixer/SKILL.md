---
name: error-fixer
description: Diagnose and fix errors in KonaI-Agent capture pipeline. Use when (1) capture errors occur (selector timeouts, navigation failures), (2) error logs exist in outputs/logs/, (3) user reports pipeline failures, or (4) tests fail with timeout/element errors.
---

# Error Fixer

Diagnose and fix errors from the KonaI-Agent capture pipeline by analyzing error logs, tracing root causes, and applying fixes.

## Diagnostic Workflow

### Step 1: Read Error Logs

Check for errors in `outputs/logs/`:
- `errors-*.json` - Structured error data
- `error-report-*.md` - Human-readable report

Error structure:
```json
{
  "screenId": "SCR-001",
  "stateId": "error",
  "error": "Error message here",
  "timestamp": "ISO timestamp"
}
```

### Step 2: Identify Error Type

| Error Pattern | Type | Root Cause |
|---------------|------|------------|
| `Waiting for selector ... failed` | Selector Timeout | Element doesn't exist or wrong selector |
| `Navigation timeout` | Navigation | Slow page load or wrong URL |
| `Authentication failed` | Auth | Wrong credentials or login selector |
| `net::ERR_*` | Network | Server down or CORS issue |

### Step 3: Trace to Source

For **selector timeouts**, the most common error:

1. Extract selector from error: `[data-testid='error-message']`
2. Find in `config/screen-states.json`:
   - `waitFor` - Initial element to wait for
   - `waitForAfter` - Element after interactions
   - `interactions[].selector` - Interaction targets
3. Check target component for actual `data-testid` attributes

### Step 4: Apply Fix

**Selector not in component**: Add the `data-testid` to the React component.

```tsx
// Before
<div className="error">{errorMessage}</div>

// After
<div className="error" data-testid="error-message">{errorMessage}</div>
```

**Selector typo in config**: Update `config/screen-states.json`.

**Timing issue**: Increase delay or add explicit wait.

```json
{
  "interactions": [
    { "action": "click", "selector": "[data-testid='button']" },
    { "action": "wait", "duration": 2000 }
  ]
}
```

## Common Fixes

### Login Error State (SCR-001/error)

The `waitForAfter: [data-testid='error-message']` expects the component to render an error message element after clicking login with empty fields.

Fix: Ensure `LoginView.tsx` renders `data-testid="error-message"` on validation failure.

### Dashboard Elements (SCR-002)

Check that after login, the dashboard renders:
- `[data-testid='dashboard-container']`
- `[data-testid='notification-bell']`
- `[data-testid='profile-button']`

### Modal/Dropdown States

For `waitForAfter` on modals/dropdowns, ensure:
1. Click handler triggers state change
2. Conditional render includes the `data-testid`
3. Animation completes before timeout (default 10s)

## References

- [Error patterns detail](references/error-patterns.md) - Full error pattern reference
