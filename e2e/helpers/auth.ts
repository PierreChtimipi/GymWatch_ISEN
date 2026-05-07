import type { Page } from '@playwright/test';

export const DEMO_USER = {
  email: 'valentin@gymwatch.fr',
  password: 'demo1234',
  name: 'Valentin',
};

export const ADMIN_USER = {
  email: 'valentin@gymwatch.fr',
  password: 'demo1234',
};

export async function login(page: Page, email = DEMO_USER.email, password = DEMO_USER.password) {
  await page.goto('/');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  // Attendre que le login se termine (la navbar apparaît)
  await page.waitForSelector('.navbar', { timeout: 8000 });
}
