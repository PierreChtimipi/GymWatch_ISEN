/**
 * Scénario 4 — Abonnement à une salle
 *
 * Parcours complet :
 * Login → Salles → S'inscrire → badge "Abonné" → Se désinscrire
 *
 * Ce scénario vérifie que l'utilisateur peut gérer ses abonnements de salles.
 */
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Abonnement à une salle', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/salles');
    await page.waitForSelector('.gym-list', { timeout: 8000 });
  });

  test('la liste des salles s\'affiche', async ({ page }) => {
    const cards = page.locator('.gym-list-card');
    await expect(cards.first()).toBeVisible();
    // Chaque carte doit avoir un nom de salle
    await expect(cards.first().locator('.gym-list-card-name')).toBeVisible();
  });

  test('les salles déjà abonnées affichent un badge', async ({ page }) => {
    // Valentin est abonné à g1 dans le seed
    const subscribedCard = page.locator('.gym-list-card--subscribed').first();
    await expect(subscribedCard).toBeVisible();
    await expect(subscribedCard.locator('.gym-list-subscribed-badge')).toBeVisible();
  });

  test('inscription à une nouvelle salle puis désinscription', async ({ page }) => {
    // Trouver une salle non abonnée
    const joinBtn = page.locator('.gym-list-btn--join').first();

    if (await joinBtn.count() === 0) {
      // Toutes les salles sont déjà abonnées — se désinscrire d'une d'abord
      const leaveBtn = page.locator('.gym-list-btn--leave').first();
      await leaveBtn.click();
      await page.waitForTimeout(500);
      const joinBtnAfter = page.locator('.gym-list-btn--join').first();
      await expect(joinBtnAfter).toBeVisible();
      await joinBtnAfter.click();
    } else {
      await joinBtn.click();
    }

    // Le badge doit apparaître
    await expect(page.locator('.gym-list-subscribed-badge').first()).toBeVisible({ timeout: 5000 });

    // Désinscription (nettoyage)
    const leaveBtn = page.locator('.gym-list-btn--leave').first();
    await leaveBtn.click();
    await page.waitForTimeout(300);
  });

  test('les stats de fréquentation sont visibles', async ({ page }) => {
    const firstCard = page.locator('.gym-list-card').first();
    await expect(firstCard.locator('.gym-list-stat').first()).toBeVisible();
  });
});
