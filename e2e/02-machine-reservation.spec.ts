/**
 * Scénario 2 — Réservation de machine
 *
 * Parcours complet :
 * Login → Ma Salle → Machines → Réserver → badge "Ma réservation" → Annuler
 *
 * Ce scénario valide la feature core de GymWatch :
 * savoir en temps réel si une machine est disponible et la réserver.
 */
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Réservation de machine', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/salle');
    // Attendre que la liste des machines soit chargée
    await page.waitForSelector('.gym-machine-list', { timeout: 8000 });
  });

  test('une machine disponible peut être réservée', async ({ page }) => {
    // Trouver la première machine disponible
    const reserveBtn = page.locator('.machine-card-btn').first();
    await expect(reserveBtn).toBeVisible();
    await expect(reserveBtn).toContainText('Reserver');
    await reserveBtn.click();

    // Toast de confirmation
    await expect(page.locator('.toast--visible')).toContainText('réservée', { timeout: 5000 });

    // Le badge de la carte doit indiquer "Ma réservation"
    await expect(page.locator('.machine-card-badge').first()).toContainText('Ma réservation', { timeout: 5000 });
  });

  test('une réservation peut être annulée', async ({ page }) => {
    // Réserver d'abord
    const firstAvailableBtn = page.locator('.machine-card--available .machine-card-btn').first();
    await firstAvailableBtn.click();
    await page.waitForSelector('.toast--visible', { timeout: 5000 });

    // Annuler la réservation
    const cancelBtn = page.locator('.machine-card-btn--cancel').first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(page.locator('.toast--visible')).toContainText('annulée', { timeout: 5000 });
  });

  test('le filtre "Dispo" n\'affiche que les machines disponibles', async ({ page }) => {
    await page.getByRole('button', { name: 'Dispo' }).click();
    // Toutes les cartes visibles doivent avoir le statut disponible
    const cards = page.locator('.machine-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveClass(/machine-card--available/);
    }
  });

  test('les stats de disponibilité s\'affichent dans l\'en-tête', async ({ page }) => {
    // Ex: "3/10 machines disponibles"
    await expect(page.locator('.page-header')).toContainText(/\d+\/\d+ machines disponibles/);
  });
});
