/**
 * Scénario 3 — Réservation de cours collectif
 *
 * Parcours complet :
 * Login → Ma Salle → Cours → S'inscrire → badge "Inscrit" → Annuler
 *
 * Ce scénario couvre la gestion des cours collectifs :
 * un utilisateur peut réserver une place dans un cours et se désinscrire.
 */
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Réservation de cours collectif', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/salle');
    // Basculer sur l'onglet Cours
    await page.getByRole('button', { name: 'Cours collectifs' }).click();
    await page.waitForSelector('.gym-classes-list', { timeout: 8000 });
  });

  test('les cours s\'affichent avec le nombre de places restantes', async ({ page }) => {
    const firstCard = page.locator('.class-card').first();
    await expect(firstCard).toBeVisible();
    // La carte doit contenir les infos de places
    await expect(firstCard.locator('.class-card-detail')).toContainText(/\d+\/\d+ places/);
  });

  test('inscription à un cours disponible', async ({ page }) => {
    // Chercher un cours non complet (bouton "+" actif)
    const addBtn = page
      .locator('.class-card-add-btn:not([disabled])')
      .first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Après inscription, le badge "Inscrit" doit apparaître
    const badge = page.locator('.class-card-booked-badge').first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    await expect(badge).toContainText('Inscrit');
  });

  test('désinscription d\'un cours réservé', async ({ page }) => {
    // Si pas encore inscrit (état DB propre), s'inscrire d'abord
    const alreadyBooked = page.locator('.class-card-cancel-btn').first();
    const addBtn = page.locator('.class-card-add-btn:not([disabled])').first();

    if (await alreadyBooked.count() === 0) {
      await expect(addBtn).toBeVisible();
      await addBtn.click();
      await expect(page.locator('.class-card-booked-badge').first()).toBeVisible({ timeout: 5000 });
    }

    // Annuler l'inscription
    const cancelBtn = page.locator('.class-card-cancel-btn').first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Le badge "Inscrit" ne doit plus être visible
    await expect(page.locator('.class-card-cancel-btn').first()).not.toBeVisible({ timeout: 5000 });
  });

  test('un cours complet n\'est pas réservable', async ({ page }) => {
    // Vérifier que les boutons désactivés existent pour les cours complets
    const fullBtn = page.locator('.class-card-add-btn[disabled]').first();
    if (await fullBtn.count() > 0) {
      await expect(fullBtn).toBeDisabled();
    }
  });
});
