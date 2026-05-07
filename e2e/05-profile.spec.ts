/**
 * Scénario 5 — Gestion du profil
 *
 * Parcours :
 * Login → Profil → Modifier le nom → Sauvegarder
 * Login → Profil → Modifier le plan hebdomadaire
 *
 * Ce scénario vérifie que l'utilisateur peut personnaliser son profil
 * et son planning d'entraînement.
 */
import { test, expect } from '@playwright/test';
import { login, DEMO_USER } from './helpers/auth';

test.describe('Gestion du profil', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/profil');
    await page.waitForSelector('.profile-name', { timeout: 8000 });
  });

  test('le nom de l\'utilisateur s\'affiche', async ({ page }) => {
    await expect(page.locator('.profile-name')).toContainText(DEMO_USER.name);
  });

  test('modifier le nom et sauvegarder', async ({ page }) => {
    const originalName = DEMO_USER.name;

    // Cliquer sur le bouton d'édition du nom
    await page.locator('.profile-name-edit-btn').click();
    const nameInput = page.locator('.profile-name-input');
    await expect(nameInput).toBeVisible();

    // Modifier le nom
    await nameInput.fill('Valentin Test');
    await page.locator('.profile-name-save').click();

    // Le nouveau nom doit s'afficher
    await expect(page.locator('.profile-name')).toContainText('Valentin Test', { timeout: 5000 });

    // Restaurer le nom original
    await page.locator('.profile-name-edit-btn').click();
    await page.locator('.profile-name-input').fill(originalName);
    await page.locator('.profile-name-save').click();
    await expect(page.locator('.profile-name')).toContainText(originalName);
  });

  test('les stats (séances, calories, etc.) sont affichées', async ({ page }) => {
    await expect(page.locator('.profile-stat-label').first()).toBeVisible();
  });

  test('le plan hebdomadaire est éditable', async ({ page }) => {
    // Cliquer sur un jour du plan pour l'éditer
    const dayPlanBtn = page.locator('.profile-plan-value').first();

    if (await dayPlanBtn.count() > 0) {
      await dayPlanBtn.click();
      const planInput = page.locator('.profile-plan-input').first();
      await expect(planInput).toBeVisible();

      const testPlan = 'Push — Pecto, Épaules';
      await planInput.fill(testPlan);
      await page.locator('.profile-plan-save').first().click();

      // Le texte sauvegardé doit apparaître
      await expect(page.locator('.profile-plan-value').first()).toContainText(testPlan, { timeout: 5000 });
    }
  });
});
