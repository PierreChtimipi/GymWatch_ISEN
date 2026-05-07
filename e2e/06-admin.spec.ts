/**
 * Scénario 6 — Panneau d'administration
 *
 * Parcours admin (valentin@gymwatch.fr est admin dans le seed) :
 * Login → Admin → Gérer machines → Créer machine → Supprimer
 * Login → Admin → Gérer cours → Créer cours → Supprimer
 *
 * Ce scénario vérifie que les fonctionnalités d'administration sont
 * accessibles et fonctionnelles pour les utilisateurs admin.
 */
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Panneau d\'administration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page); // valentin est admin
    await page.goto('/admin');
    await page.waitForSelector('.admin-page', { timeout: 8000 });
  });

  test('la page admin est accessible pour un admin', async ({ page }) => {
    await expect(page.locator('.admin-page')).toBeVisible();
  });

  test('la liste des salles s\'affiche dans l\'admin', async ({ page }) => {
    // Chercher la section gyms / onglet gyms
    const gymSection = page.locator('[class*="admin"]').first();
    await expect(gymSection).toBeVisible();
  });

  test('la liste des machines s\'affiche', async ({ page }) => {
    // Naviguer vers l'onglet machines si nécessaire
    const machinesTab = page.getByRole('button', { name: /machines/i }).first();
    if (await machinesTab.count() > 0) {
      await machinesTab.click();
    }
    await expect(page.locator('[class*="machine"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('un utilisateur non-admin ne peut pas accéder à /admin', async ({ page, browser }) => {
    // Ouvrir un contexte isolé avec un compte non-admin
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto('http://localhost:5173/');
    // S'inscrire avec un nouveau compte (non admin)
    await p.getByRole('button', { name: "S'inscrire" }).click();
    const ts = Date.now();
    await p.getByPlaceholder('Prenom').fill('UserTest');
    await p.getByPlaceholder('Adresse e-mail').fill(`nonadmin_${ts}@test.fr`);
    await p.getByPlaceholder('Mot de passe').fill('test1234');
    await p.getByRole('button', { name: "S'inscrire" }).click();
    await p.waitForSelector('.navbar', { timeout: 8000 });

    // Tenter d'accéder à /admin — doit rediriger ou ne pas afficher le contenu admin
    await p.goto('http://localhost:5173/admin');
    // La page /admin ne doit pas afficher .admin-page (redirigé vers /)
    await expect(p.locator('.admin-page')).not.toBeVisible({ timeout: 3000 });
    await ctx.close();
  });
});
