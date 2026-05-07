/**
 * Scénario 1 — Authentification
 *
 * Vérifie que :
 * - Un utilisateur valide peut se connecter et accéder à l'accueil
 * - Un mauvais mot de passe affiche un message d'erreur
 * - La déconnexion ramène à l'écran de login
 */
import { test, expect } from '@playwright/test';
import { login, DEMO_USER } from './helpers/auth';

test.describe('Authentification', () => {
  test('connexion avec identifiants valides → accueil visible', async ({ page }) => {
    await login(page);
    // La navbar et un titre de bienvenue doivent être présents
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('mauvais mot de passe → message d\'erreur', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').fill(DEMO_USER.email);
    await page.getByPlaceholder('Mot de passe').fill('mauvais_mot_de_passe');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.locator('.login-error')).toBeVisible();
  });

  test('email inexistant → message d\'erreur', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').fill('inconnu@test.fr');
    await page.getByPlaceholder('Mot de passe').fill('test1234');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.locator('.login-error')).toBeVisible();
  });

  test('déconnexion → retour à l\'écran de login', async ({ page }) => {
    await login(page);
    // Naviguer vers les paramètres où se trouve le bouton déconnexion
    await page.goto('/settings');
    await page.getByRole('button', { name: /se d.connecter/i }).click();
    // Après déconnexion, le formulaire de login doit réapparaître
    await expect(page.locator('.login-form')).toBeVisible();
  });

  test('inscription d\'un nouvel utilisateur', async ({ page }) => {
    await page.goto('/');
    // Basculer vers le formulaire d'inscription
    await page.getByRole('button', { name: "S'inscrire" }).click();
    const ts = Date.now();
    await page.getByPlaceholder('Prenom').fill(`TestUser${ts}`);
    await page.getByPlaceholder('Email').fill(`test_${ts}@gymwatch.fr`);
    await page.getByPlaceholder('Mot de passe').fill('test1234');
    await page.getByRole('button', { name: "S'inscrire" }).click();
    // Après inscription réussie, la navbar doit apparaître
    await expect(page.locator('.navbar')).toBeVisible({ timeout: 8000 });
  });
});
