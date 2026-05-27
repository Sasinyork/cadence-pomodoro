import { test, expect } from '@playwright/test';

// Bypass auth — set guest mode in localStorage before each test
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cadence-guest', 'true');
  });
});

test.describe('Guest mode', () => {
  test('loads the dashboard without signing in', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('timer')).toBeVisible();
  });
});

test.describe('Timer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Click body to ensure keyboard events are captured by the window listener
    await page.locator('body').click();
  });

  test('starts when Start is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  });

  test('pauses a running timer', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  });

  test('resets timer back to idle', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  });

  test('skips to the next session', async ({ page }) => {
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByText(/short break/i)).toBeVisible();
  });

  test('space bar starts and pauses the timer', async ({ page }) => {
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  });

  test('bell button toggles sound (active state)', async ({ page }) => {
    const bell = page.getByRole('button', { name: 'Mute sound' });
    await bell.click();
    await expect(page.getByRole('button', { name: 'Enable sound' })).toBeVisible();
    await page.getByRole('button', { name: 'Enable sound' }).click();
    await expect(page.getByRole('button', { name: 'Mute sound' })).toBeVisible();
  });
});

test.describe('Task manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('adds a new task', async ({ page }) => {
    await page.getByRole('button', { name: 'New task' }).click();
    await page.getByPlaceholder('What needs doing?').fill('Write tests');
    await page.getByRole('button', { name: 'Create task' }).click();
    await expect(page.getByText('Write tests').first()).toBeVisible();
  });

  test('deletes a task', async ({ page }) => {
    await page.getByRole('button', { name: 'New task' }).click();
    await page.getByPlaceholder('What needs doing?').fill('Temp task');
    await page.getByRole('button', { name: 'Create task' }).click();
    await expect(page.getByText('Temp task').first()).toBeVisible();

    const card = page.locator('.task-card', { hasText: 'Temp task' }).first();
    await card.hover();
    await card.getByRole('button', { name: /delete/i }).click();
    await expect(page.locator('.task-card', { hasText: 'Temp task' })).not.toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to Analytics via sidebar', async ({ page }) => {
    await page.getByRole('button', { name: 'Analytics' }).click();
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  });

  test('navigates to Settings via sidebar', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByText('Auto-start breaks')).toBeVisible();
  });

  test('keyboard shortcut ⌘⇧2 opens Tasks view', async ({ page }) => {
    await page.locator('body').click();
    await page.keyboard.press('Meta+Shift+2');
    await expect(page.getByText(/active tasks/i)).toBeVisible();
  });
});
