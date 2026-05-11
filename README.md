# 🏋️ GymWatch

Application web de salle de sport connectée — projet étudiant ISEN 4ème année.

GymWatch permet aux membres d'une salle de sport de réserver des machines en temps réel, de s'inscrire à des cours collectifs, de suivre leurs stats et de gérer leur profil. Un panneau d'administration permet de gérer les machines, les cours et les salles.

**Production → [gymwatch.onrender.com](https://gymwatch.onrender.com)**

---

## Fonctionnalités

- **Authentification** — inscription et connexion sécurisées via JWT
- **Réservation de machines** — statut disponible/occupé en temps réel, réservation en un clic
- **Cours collectifs** — inscription, désinscription, nombre de places restantes
- **Profil utilisateur** — stats (séances, calories, durée), planning hebdomadaire, objectifs
- **Multi-salles** — choix de la salle parmi plusieurs villes
- **Panneau admin** — gestion des machines, cours et salles (compte admin requis)
- **Dark mode** — thème sombre/clair selon les préférences
- **PWA** — installable sur Android et iOS comme une vraie app mobile

---

## Stack technique

| Côté | Technologie |
|------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Node.js + Express 5 |
| Base de données | SQLite (via better-sqlite3) |
| Auth | JWT (jsonwebtoken) |
| PWA | vite-plugin-pwa + Workbox |
| Tests E2E | Playwright (50/50 ✅) |
| Déploiement | Render.com |

---

## Lancer le projet en local

### Prérequis

- [Node.js](https://nodejs.org/) v18 ou plus
- npm v9 ou plus

### Installation

```bash
# Cloner le repo
git clone https://github.com/PierreChtimipi/GymWatch_ISEN.git
cd GymWatch_ISEN

# Installer les dépendances
npm install
```

### Démarrer l'app

```bash
npm run dev
```

Ça lance en parallèle :
- Le **frontend** sur [http://localhost:5173](http://localhost:5173)
- Le **backend** sur [http://localhost:3001](http://localhost:3001)

La base de données SQLite est créée automatiquement au premier démarrage (`gymwatch.db`) avec des données de démo.

### Comptes de démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | valentin@gymwatch.fr | demo1234 |
| Membre | sophie@gymwatch.fr | demo1234 |

---

## Scripts disponibles

```bash
npm run dev          # Lance frontend + backend en mode développement
npm run dev:front    # Lance uniquement le frontend (Vite)
npm run dev:api      # Lance uniquement le backend (Express)
npm run build        # Build de production (frontend)
npm run start        # Démarre le serveur de production
npm run test         # Lance les tests API (Vitest)
npm run test:e2e     # Lance les tests E2E (Playwright)
```

---

## Tests E2E

Les tests couvrent 6 scénarios complets :

1. Authentification (login / register / logout)
2. Réservation de machine
3. Cours collectifs
4. Abonnement salle
5. Profil utilisateur
6. Panneau d'administration

```bash
# S'assurer que le projet tourne (npm run dev), puis :
npm run test:e2e
```

Résultat attendu : **50/50 tests passent** sur Mobile Chrome et Desktop Chrome.

---

## Structure du projet

```
GymWatch_ISEN/
├── src/                  # Frontend React
│   ├── pages/            # Pages de l'app
│   ├── components/       # Composants réutilisables
│   ├── context/          # Contextes React (Auth, Gym)
│   ├── hooks/            # Hooks custom
│   └── api.ts            # Client API
├── server/               # Backend Express
│   ├── routes/           # Routes API
│   ├── database.ts       # Init + seed SQLite
│   └── middleware.ts     # Auth JWT
├── e2e/                  # Tests Playwright
├── public/               # Assets statiques + icônes PWA
└── render.yaml           # Config déploiement Render
```

---

## Déploiement

L'app est déployée sur **Render.com**. En production, Express sert à la fois l'API et le build Vite — un seul service Node.js.

Variables d'environnement à configurer sur Render :

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Clé secrète pour signer les tokens |
| `GYMWATCH_DB` | Chemin vers le fichier SQLite (`/var/data/gymwatch.db`) |
| `PORT` | Port du serveur (géré automatiquement par Render) |

---

## Équipe

Projet réalisé dans le cadre du cours de développement web — ISEN Yncréa, 2025-2026.
