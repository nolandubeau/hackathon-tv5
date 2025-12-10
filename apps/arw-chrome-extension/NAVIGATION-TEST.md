# ARW Chrome Extension - Navigation Testing Guide

## Overview
This document outlines test scenarios for verifying the navigation inspection fix that prevents data gaps during page transitions. The fix ensures smooth data persistence during navigation with proper retry logic and loading states.

## Test Environment Setup

### Prerequisites
1. **Load Extension:**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select: `/Users/nolandubeau/Documents/Work/HWA/hackathon-tv5/apps/arw-chrome-extension`

2. **Start Media Discovery App:**
   ```bash
   cd /Users/nolandubeau/Documents/Work/HWA/hackathon-tv5/apps/media-discovery
   npm run dev
   ```
   - Default URL: `http://localhost:3000`

3. **Open Monitoring Tools:**
   - Chrome DevTools Console (F12)
   - Extension Sidepanel (click extension icon)
   - DevTools Network tab (for timing analysis)

## Test Scenarios

### Scenario 1: Fresh Page Load
**Objective:** Verify initial inspection on clean page load

**Steps:**
1. Open new tab
2. Navigate to `http://localhost:3000/home`
3. Click ARW extension icon to open sidepanel
4. Observe loading sequence

**Expected Results:**
- ✅ Loading indicator displays immediately
- ✅ Inspection data appears within 2 seconds
- ✅ Badge shows "✓" for ARW compliance
- ✅ No errors in console
- ✅ ARW metadata displayed correctly (components, patterns, etc.)

**Pass Criteria:**
- Clean console (no errors)
- Data loads within timeout window
- UI reflects correct compliance status

---

### Scenario 2: Navigation Between ARW Pages
**Objective:** Verify smooth transitions with data persistence

**Steps:**
1. Start on `/home` page with sidepanel open
2. Verify inspection data is visible
3. Click navigation link to `/about`
4. Wait for inspection to complete
5. Navigate to `/search`
6. Navigate back to `/home` (using browser back or link)

**Expected Results:**
- ✅ Old data stays visible during navigation (dimmed/loading state)
- ✅ Loading badge "..." appears during transition
- ✅ New data loads within 300-500ms
- ✅ No "No ARW data found" errors
- ✅ Smooth transitions without flickering
- ✅ Correct data for each page (verify component counts differ)

**Pass Criteria:**
- No data gaps visible to user
- Each page shows unique inspection data
- Loading states are clear and brief

---

### Scenario 3: Navigation to Non-ARW Page
**Objective:** Verify graceful handling of pages without ARW

**Steps:**
1. Start on `/home` (ARW-enabled page)
2. Verify ARW data is displayed
3. Navigate to external site: `https://google.com`
4. Observe sidepanel behavior

**Expected Results:**
- ✅ Old data clears after 2-second timeout
- ✅ Badge shows empty or "?" (no ARW detected)
- ✅ Sidepanel shows "Not ARW Enabled" or similar message
- ✅ No errors or crashes in console
- ✅ Extension remains functional

**Pass Criteria:**
- Graceful transition to "not found" state
- No console errors
- Can navigate back to ARW page successfully

---

### Scenario 4: Rapid Navigation
**Objective:** Test extension stability under rapid page changes

**Steps:**
1. Rapidly click between pages in quick succession:
   - `/home` → `/about` → `/search` → `/home`
2. Click with < 500ms between transitions
3. Repeat sequence 3 times
4. Monitor console and memory

**Expected Results:**
- ✅ Extension handles rapid changes gracefully
- ✅ No "retry loop" errors in console
- ✅ Latest page data eventually displays
- ✅ No memory leaks (check DevTools Memory tab)
- ✅ No duplicate inspection runs
- ✅ Badge updates correctly for final page

**Pass Criteria:**
- No crashes or error accumulation
- Memory usage stable (< 5MB growth)
- Final state reflects current page accurately

---

### Scenario 5: Browser Back/Forward Navigation
**Objective:** Verify inspection triggers on history navigation

**Steps:**
1. Navigate through pages: `/home` → `/about` → `/search`
2. Click browser **back button** twice
3. Verify current page is `/home`
4. Click browser **forward button** once
5. Verify current page is `/about`

**Expected Results:**
- ✅ Inspection runs on each back/forward action
- ✅ Correct data displayed for each page
- ✅ No stale data from previous loads
- ✅ Badge updates match current page
- ✅ Loading states show during transitions

**Pass Criteria:**
- History navigation treated same as regular navigation
- Data always reflects current page
- No cached incorrect data

---

### Scenario 6: Page Reload (F5)
**Objective:** Verify fresh inspection after hard reload

**Steps:**
1. Load `/home` page with sidepanel open
2. Note current inspection data
3. Press **F5** to reload page
4. Observe inspection sequence

**Expected Results:**
- ✅ Fresh inspection runs (new timestamp)
- ✅ Data loads correctly
- ✅ No cached stale data displayed
- ✅ Loading indicator shows during reload
- ✅ Inspection completes within expected time

**Pass Criteria:**
- Clean re-inspection (not cached)
- Data matches fresh inspection
- No errors during reload

---

### Scenario 7: Chrome Internal Pages
**Objective:** Verify graceful failure on non-inspectable pages

**Steps:**
1. Navigate to `chrome://extensions/`
2. Open ARW extension sidepanel
3. Observe behavior
4. Check console for errors

**Expected Results:**
- ✅ Graceful failure (no crash)
- ✅ Clear "No data available" or similar message
- ✅ No injection errors in console
- ✅ Extension remains stable
- ✅ Badge shows appropriate state (empty or "?")

**Pass Criteria:**
- No console errors related to injection
- User-friendly message displayed
- Extension recovers when navigating to regular page

---

## Console Log Verification

### Expected Successful Logs

Monitor for these patterns indicating correct operation:

```javascript
// Background script - inspection triggered
"Triggering inspection for tab 123"

// Content script - inspection complete
"ARW Inspection Complete: {tabId: 123, url: 'http://localhost:3000/home', arwCompliant: true, ...}"

// Sidepanel - data received
"Received inspection data for tab 123"
```

### Error Patterns to Watch For

**These should NOT appear:**

```javascript
❌ "No ARW data found. Try refreshing the page."
❌ "Failed to inject content script"
❌ "Uncaught TypeError: Cannot read properties of undefined"
❌ "Maximum retry attempts reached"
❌ "Extension context invalidated"
```

### Debugging Tips

If errors occur:
1. Check if content script injected: `chrome.tabs.executeScript` status
2. Verify tab ID matches: `chrome.tabs.query` results
3. Check message passing: `chrome.runtime.sendMessage` / `onMessage`
4. Inspect storage: `chrome.storage.local.get()`

---

## Performance Checks

### Timing Expectations

| Operation | Expected Time | Maximum Acceptable |
|-----------|---------------|-------------------|
| Initial load → Loading state | < 100ms | 200ms |
| Loading state → Data displayed | < 2 seconds | 3 seconds |
| Navigation → Retry attempt | ~300ms | 500ms |
| Retry → Success | < 1 second | 2 seconds |

### Memory Checks

**Procedure:**
1. Open Chrome DevTools → **Memory** tab
2. Click **"Take snapshot"** (baseline)
3. Run all 7 test scenarios
4. Click **"Take snapshot"** again (after tests)
5. Compare heap sizes

**Pass Criteria:**
- Memory growth < 5MB after all tests
- No detached DOM trees accumulating
- No large object leaks visible

### Network Performance

**Monitor in DevTools Network tab:**
- Content script injection: < 50ms
- ARW data extraction: < 100ms
- Message passing: < 10ms

---

## Regression Testing Checklist

Before releasing navigation fix, verify:

- [ ] All 7 scenarios pass
- [ ] Console shows no errors
- [ ] Memory usage stable
- [ ] Performance within expectations
- [ ] Badge updates correctly
- [ ] Loading states are clear
- [ ] No flickering or data gaps
- [ ] Works on Chrome v120+
- [ ] Works on multiple ARW pages
- [ ] Handles non-ARW pages gracefully

---

## Bug Reporting Template

If issues are found during testing, use this template:

```markdown
**Scenario:** [Scenario number/name]

**Environment:**
- Chrome Version: [e.g., 120.0.6099.109]
- Extension Version: [from manifest.json]
- OS: [macOS/Windows/Linux]
- Media Discovery URL: [localhost or deployed]

**Steps to Reproduce:**
1. [detailed step]
2. [detailed step]
3. [detailed step]

**Expected Behavior:**
[What should happen according to test plan]

**Actual Behavior:**
[What actually happened]

**Console Errors:**
```
[Paste full error messages with stack traces]
```

**Screenshots:**
[Attach if UI issue visible]

**Additional Context:**
[Any other relevant information]
```

---

## Success Criteria Summary

✅ **All scenarios must pass with:**
- No errors in console
- Smooth UX with clear loading indicators
- Correct data displayed after navigation
- No memory leaks (< 5MB growth)
- Badge updates appropriately
- Performance within expected ranges
- Graceful handling of edge cases

✅ **User Experience Goals:**
- Zero perceived data gaps during navigation
- Loading states under 300ms
- Clear feedback at all times
- No flickering or jumpy UI

✅ **Technical Goals:**
- Clean console logs
- Efficient retry logic
- Proper error handling
- Memory-safe implementation

---

## Automated Testing Recommendations

For future improvements, consider:
1. **Playwright/Puppeteer** tests for navigation scenarios
2. **Jest** unit tests for retry logic
3. **Performance budgets** in CI/CD
4. **Visual regression** testing for UI states
5. **Memory profiling** automation

---

## Testing Sign-Off

**Tested By:** ___________________
**Date:** ___________________
**Chrome Version:** ___________________
**Result:** [ ] Pass [ ] Fail
**Notes:**

---

**Document Version:** 1.0
**Last Updated:** 2025-12-08
**Related Files:**
- `/apps/arw-chrome-extension/background.js` - Navigation listener
- `/apps/arw-chrome-extension/content.js` - Inspection logic
- `/apps/arw-chrome-extension/sidepanel.js` - UI state management
