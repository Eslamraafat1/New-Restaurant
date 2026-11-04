import { test, expect } from '@playwright/test';
import { digits, ready } from './helpers.js';

/** On small screens the menu filters live in a bottom sheet; open it when needed. */
async function filters(page) {
  const toggle = page.getByRole('button', { name: 'Filters', exact: true });
  if (await toggle.isVisible()) {
    await toggle.click();
    return page.getByRole('dialog', { name: 'Filters' });
  }
  return page;
}
async function closeFilters(page) {
  const apply = page.getByRole('button', { name: 'Show results' });
  if (await apply.isVisible()) await apply.click();
}

const cards = (page) => page.locator('main article[data-card]');
const resultCount = (page) => page.getByText(/^\d+ dishes$/);

test.describe('Menu', () => {
  test('category page lists only that category and dietary/search filters narrow results', async ({ page }) => {
    await page.goto('/menu/pizza');
    await ready(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pizza/i);
    await expect(resultCount(page)).toHaveText('6 dishes');
    await expect(cards(page)).toHaveCount(6);
    await expect(cards(page).filter({ hasText: 'Classic Smash' })).toHaveCount(0);

    let scope = await filters(page);
    await scope.getByRole('button', { name: 'Vegetarian', exact: true }).click();
    await expect(scope.getByRole('button', { name: 'Vegetarian', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await closeFilters(page);
    await expect(resultCount(page)).toHaveText('3 dishes');
    await expect(cards(page).filter({ hasText: 'Margherita' })).toHaveCount(1);
    await expect(cards(page).filter({ hasText: 'Pepperoni Classic' })).toHaveCount(0);

    scope = await filters(page);
    await scope.getByRole('button', { name: 'Vegetarian', exact: true }).click();
    await scope.getByRole('searchbox', { name: 'Search the menu' }).fill('pepperoni');
    await closeFilters(page);
    await expect(resultCount(page)).toHaveText('1 dishes');
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText('Pepperoni Classic');
  });

  test('sorting by price reorders the dishes', async ({ page }) => {
    await page.goto('/menu/pizza');
    await ready(page);
    const scope = await filters(page);
    await scope.getByRole('combobox', { name: 'Sort' }).selectOption('low');
    await closeFilters(page);
    await expect(cards(page).first()).toContainText('Margherita'); // 140 – cheapest pizza
    const scope2 = await filters(page);
    await scope2.getByRole('combobox', { name: 'Sort' }).selectOption('high');
    await closeFilters(page);
    await expect(cards(page).first()).toContainText('Ranch Supreme'); // 185 – most expensive pizza
  });

  test('full menu groups dishes by category and the category rail jumps to a section', async ({ page }) => {
    await page.goto('/menu');
    await ready(page);
    const rail = page.getByRole('navigation', { name: 'The menu' });
    await expect(rail.getByRole('link')).toHaveCount(9);
    await rail.getByRole('link', { name: 'Burgers' }).click();
    await expect(page).toHaveURL(/#cat-burgers$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Burgers' })).toBeInViewport();
  });
});

test.describe('Ordering', () => {
  const summaryTotal = (page) => page.locator('section[aria-labelledby="sum-h"] dl > div').last().locator('dd');
  // the product page's own button (desktop summary or mobile sticky bar), not the related-dish card buttons ("Add to cart: …")
  const addButton = (page) => page.getByRole('button', { name: /^Add to cart(?!:)/ }).filter({ visible: true }).first();

  test('product customiser updates the live price', async ({ page }) => {
    await page.goto('/product/margherita');
    await ready(page);
    await expect(summaryTotal(page)).toHaveText(/140/);
    await page.locator('label', { hasText: 'Large 14"' }).click(); // +55
    await expect(summaryTotal(page)).toHaveText(/195/);
    await page.locator('label', { hasText: 'Extra pepperoni' }).click(); // +15
    await expect(summaryTotal(page)).toHaveText(/210/);
    await page.locator('label', { hasText: 'Small 8"' }).click(); // −30 instead of +55
    await expect(summaryTotal(page)).toHaveText(/125/);
  });

  test('add to cart → cart count and totals → checkout validation → demo order success', async ({ page }) => {
    await page.goto('/product/margherita');
    await ready(page);
    await expect(page.getByRole('button', { name: 'Cart (0)' })).toBeVisible();
    await page.locator('label', { hasText: 'Large 14"' }).click();
    await addButton(page).click();
    await expect(page.getByRole('button', { name: 'Cart (1)' })).toBeVisible();

    // cart page: subtotal and a demo coupon
    await page.goto('/cart');
    await ready(page);
    const totals = page.locator('dl').filter({ hasText: 'Subtotal' }).first();
    await expect(totals.locator('div').first().locator('dd')).toHaveText(/195/);
    await page.getByRole('textbox', { name: 'Coupon code' }).fill('WELCOME30');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(totals.getByText('Discount')).toBeVisible();

    // checkout: delivery fee applies below the free-delivery threshold (195 − 30 + 30 = 195)
    await page.goto('/checkout');
    await ready(page);
    const summary = page.locator('aside').filter({ hasText: 'Order summary' });
    const total = summary.locator('dl > div').last().locator('dd');
    await expect(total).toHaveText(/195/);
    expect(digits(await summary.locator('dl > div', { hasText: 'Delivery' }).locator('dd').innerText())).toBe('30');

    // empty submit shows inline errors and focuses the first invalid field
    await page.getByRole('button', { name: 'Place demo order' }).click();
    await expect(page.getByText('Please enter your name')).toBeVisible();
    await expect(page.getByText('Enter a valid phone number')).toBeVisible();
    await expect(page.getByText('Enter your delivery address')).toBeVisible();
    await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Full name')).toBeFocused();

    // invalid phone stays blocked
    await page.getByLabel('Full name').fill('Test Customer');
    await page.getByLabel('Phone number').fill('12');
    await page.getByLabel('Delivery address').fill('12 Demo Street, Cairo');
    await page.getByRole('button', { name: 'Place demo order' }).click();
    await expect(page.getByText('Enter a valid phone number')).toBeVisible();
    await expect(page.getByText('Please enter your name')).toHaveCount(0);

    await page.getByLabel('Phone number').fill('+20 100 000 0000');
    await page.getByRole('button', { name: 'Place demo order' }).click();
    await expect(page).toHaveURL(/\/order$/);
    await expect(page.getByRole('heading', { name: 'Demo order accepted' })).toBeVisible();
    await expect(page.getByText(/DEMO-[A-Z0-9]+/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cart (0)' })).toBeVisible();
  });
});
