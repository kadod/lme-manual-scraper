import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const LOGIN_EMAIL = 'info@feer-design.com';
const LOGIN_PASSWORD = 'Feer01081012';
const PAGE_LOAD_TIMEOUT = 10000;

// Results tracking
interface PageTestResult {
  url: string;
  status: 'pass' | 'warning' | 'fail';
  statusCode?: number;
  errors: string[];
  warnings: string[];
  loadTime: number;
}

const testResults: PageTestResult[] = [];

// Dashboard pages to test
const dashboardPages = [
  { path: '/dashboard', name: 'Dashboard Home' },
  { path: '/dashboard/messages', name: 'Messages List' },
  { path: '/dashboard/messages/new', name: 'New Message' },
  { path: '/dashboard/messages/templates', name: 'Templates' },
  { path: '/dashboard/messages/step-campaigns', name: 'Step Campaigns' },
  { path: '/dashboard/friends', name: 'Friends List' },
  { path: '/dashboard/friends/tags', name: 'Tags Management' },
  { path: '/dashboard/friends/segments', name: 'Segments' },
  { path: '/dashboard/friends/import', name: 'Import' },
  { path: '/dashboard/forms', name: 'Forms List' },
  { path: '/dashboard/rich-menus', name: 'Rich Menus' },
  { path: '/dashboard/rich-menus/new', name: 'New Rich Menu' },
  { path: '/dashboard/reservations', name: 'Reservations' },
  { path: '/dashboard/reservations/types', name: 'Reservation Types' },
  { path: '/dashboard/reservations/calendar', name: 'Calendar' },
  { path: '/dashboard/reservations/settings', name: 'Reservation Settings' },
  { path: '/dashboard/auto-response', name: 'Auto Response' },
  { path: '/dashboard/analytics', name: 'Analytics Dashboard' },
  { path: '/dashboard/analytics/cross-analysis', name: 'Cross Analysis' },
  { path: '/dashboard/analytics/url-tracking', name: 'URL Tracking' },
  { path: '/dashboard/settings', name: 'Settings Top' },
  { path: '/dashboard/settings/profile', name: 'Profile Settings' },
  { path: '/dashboard/settings/organization', name: 'Organization' },
  { path: '/dashboard/settings/system', name: 'System Settings' },
  { path: '/dashboard/settings/billing', name: 'Billing' },
  { path: '/dashboard/settings/line', name: 'LINE Settings' },
];

// Helper function to login
async function loginToApp(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Fill in login credentials
  await page.fill('input[type="email"], input[name="email"]', LOGIN_EMAIL);
  await page.fill('input[type="password"], input[name="password"]', LOGIN_PASSWORD);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

// Helper function to test a single page
async function testPage(page: Page, pagePath: string, pageName: string): Promise<PageTestResult> {
  const result: PageTestResult = {
    url: pagePath,
    status: 'pass',
    errors: [],
    warnings: [],
    loadTime: 0,
  };

  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    result.errors.push(`Page Error: ${error.message}`);
  });

  try {
    const startTime = Date.now();

    // Navigate to page
    const response = await page.goto(`${BASE_URL}${pagePath}`, {
      timeout: PAGE_LOAD_TIMEOUT,
      waitUntil: 'networkidle'
    });

    result.loadTime = Date.now() - startTime;
    result.statusCode = response?.status();

    // Check HTTP status
    if (response?.status() === 404) {
      result.status = 'fail';
      result.errors.push('404 Not Found');
    } else if (response?.status() && response.status() >= 500) {
      result.status = 'fail';
      result.errors.push(`Server Error: ${response.status()}`);
    }

    // Check for error text on page
    const pageContent = await page.content();
    if (pageContent.includes('404') || pageContent.toLowerCase().includes('page not found')) {
      result.status = 'fail';
      result.errors.push('Page shows 404 error');
    }
    if (pageContent.includes('500') || pageContent.toLowerCase().includes('internal server error')) {
      result.status = 'fail';
      result.errors.push('Page shows 500 error');
    }

    // Check for database errors
    const dbErrorPatterns = [
      /database.*error/i,
      /connection.*refused/i,
      /prisma.*error/i,
      /query.*failed/i,
      /ECONNREFUSED/i,
    ];

    for (const pattern of dbErrorPatterns) {
      if (pattern.test(pageContent)) {
        result.status = 'fail';
        result.errors.push(`Database error detected: ${pattern}`);
      }
    }

    // Take screenshot
    const screenshotDir = path.join(__dirname, '../test-results/screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotName = pagePath.replace(/\//g, '_') + '.png';
    await page.screenshot({
      path: path.join(screenshotDir, screenshotName),
      fullPage: true
    });

    // Wait a bit for any async errors to appear
    await page.waitForTimeout(1000);

    // Add console errors and warnings
    if (consoleErrors.length > 0) {
      result.errors.push(...consoleErrors.map(e => `Console Error: ${e}`));
      if (result.status === 'pass') {
        result.status = 'warning';
      }
    }

    if (consoleWarnings.length > 0) {
      result.warnings.push(...consoleWarnings.map(w => `Console Warning: ${w}`));
    }

    // Check load time
    if (result.loadTime > 5000) {
      result.warnings.push(`Slow page load: ${result.loadTime}ms`);
      if (result.status === 'pass') {
        result.status = 'warning';
      }
    }

    // Final status determination
    if (result.errors.length > 0 && result.status === 'pass') {
      result.status = 'warning';
    }

  } catch (error) {
    result.status = 'fail';
    result.errors.push(`Navigation Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

test.describe('L Message Dashboard E2E Testing', () => {
  test.setTimeout(300000); // 5 minutes timeout for entire test suite

  test('Complete Dashboard Pages Test', async ({ page }) => {
    console.log('\n=== Starting L Message Dashboard E2E Tests ===\n');

    // Step 1: Login
    console.log('Step 1: Logging in...');
    try {
      await loginToApp(page);
      console.log('✓ Login successful\n');
    } catch (error) {
      console.error('✗ Login failed:', error);
      throw error;
    }

    // Step 2: Test all pages
    console.log('Step 2: Testing all dashboard pages...\n');

    for (const pageInfo of dashboardPages) {
      console.log(`Testing: ${pageInfo.name} (${pageInfo.path})`);
      const result = await testPage(page, pageInfo.path, pageInfo.name);
      testResults.push(result);

      // Log immediate result
      if (result.status === 'pass') {
        console.log(`  ✓ PASS - Loaded in ${result.loadTime}ms`);
      } else if (result.status === 'warning') {
        console.log(`  ⚠ WARNING - ${result.errors.length} errors, ${result.warnings.length} warnings`);
      } else {
        console.log(`  ✗ FAIL - ${result.errors.join(', ')}`);
      }
    }

    // Step 3: Generate report
    console.log('\n=== Test Results Summary ===\n');

    const passing = testResults.filter(r => r.status === 'pass');
    const warnings = testResults.filter(r => r.status === 'warning');
    const failing = testResults.filter(r => r.status === 'fail');

    console.log(`Total Pages Tested: ${testResults.length}`);
    console.log(`✓ Passing: ${passing.length}`);
    console.log(`⚠ Warnings: ${warnings.length}`);
    console.log(`✗ Failing: ${failing.length}`);
    console.log(`\nSuccess Rate: ${((passing.length / testResults.length) * 100).toFixed(1)}%\n`);

    // Detailed results
    if (passing.length > 0) {
      console.log('=== PASSING PAGES ===');
      passing.forEach(r => {
        console.log(`  ✓ ${r.url} (${r.loadTime}ms)`);
      });
      console.log();
    }

    if (warnings.length > 0) {
      console.log('=== PAGES WITH WARNINGS ===');
      warnings.forEach(r => {
        console.log(`  ⚠ ${r.url}`);
        r.errors.forEach(e => console.log(`    - ${e}`));
        r.warnings.forEach(w => console.log(`    - ${w}`));
      });
      console.log();
    }

    if (failing.length > 0) {
      console.log('=== FAILING PAGES ===');
      failing.forEach(r => {
        console.log(`  ✗ ${r.url}`);
        r.errors.forEach(e => console.log(`    - ${e}`));
      });
      console.log();
    }

    // Save detailed report to file
    const reportPath = path.join(__dirname, '../test-results/e2e-test-report.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.length,
        passing: passing.length,
        warnings: warnings.length,
        failing: failing.length,
        successRate: ((passing.length / testResults.length) * 100).toFixed(1) + '%',
      },
      results: testResults,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Detailed report saved to: ${reportPath}`);
    console.log(`Screenshots saved to: ${path.join(__dirname, '../test-results/screenshots')}`);

    // Fail the test if there are any failing pages
    expect(failing.length).toBe(0);
  });
});
