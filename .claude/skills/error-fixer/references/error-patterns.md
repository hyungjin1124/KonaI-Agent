# Error Patterns Reference

Detailed patterns for diagnosing pipeline errors.

## Selector Timeout Errors

**Pattern**: `Waiting for selector \`{selector}\` failed: Waiting failed: {timeout}ms exceeded`

**Sources**:
- `waitFor` in screen config - Initial element
- `waitForAfter` in screen config - Post-interaction element
- `interactions[].selector` - Interaction target

**Diagnosis steps**:
1. Extract selector from error message
2. Search `config/screen-states.json` for the selector
3. Identify which screen/state uses it
4. Check component source for matching `data-testid`

**Fix patterns**:

| Scenario | Fix |
|----------|-----|
| Selector missing in component | Add `data-testid="x"` to element |
| Selector typo | Correct in config or component |
| Element conditional | Ensure render condition is met |
| Element delayed | Add `wait` interaction before |
| Wrong component rendered | Check route/state injection |

## Navigation Errors

**Pattern**: `Navigation timeout of {timeout}ms exceeded`

**Causes**:
- Dev server not running
- Wrong URL/route
- Slow initial render
- Network issues

**Fix patterns**:

| Scenario | Fix |
|----------|-----|
| Server down | Start dev server first |
| Wrong route | Update `route` in screen config |
| Slow render | Increase navigation timeout |

## Authentication Errors

**Pattern**: `Authentication failed` or login selector timeout

**Causes**:
- Wrong credentials in `defaultAuth`
- Login form selectors changed
- Auth state not persisting

**Fix patterns**:

| Scenario | Fix |
|----------|-----|
| Bad credentials | Update `config/screen-states.json` defaultAuth |
| Selector changed | Update login selectors in capture script |
| Session lost | Check cookie/localStorage handling |

## Network Errors

**Pattern**: `net::ERR_CONNECTION_REFUSED`, `net::ERR_NAME_NOT_RESOLVED`

**Causes**:
- Server not running
- Wrong port
- DNS/proxy issues

**Fix**: Ensure dev server is running on expected port.

## State Injection Errors

**Pattern**: Element exists but shows wrong content

**Causes**:
- `injectState` not recognized by component
- State key mismatch
- Component ignores injected state

**Fix patterns**:

| Scenario | Fix |
|----------|-----|
| Key mismatch | Match `injectState` keys to component state |
| Not reading state | Component must read from localStorage/window |
