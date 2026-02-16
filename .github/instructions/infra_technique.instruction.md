# Copilot Instructions

## Objectif
Ces instructions servent de base pour le nouveau projet, en s'appuyant sur les pratiques du dernier TP React.

## Stack cible (TP React)
- React 19 + TypeScript
- Vite
- React Router
- Prettier

## Conventions de code
- Nommage: camelCase pour variables/fonctions, PascalCase pour composants et types.
- Composants fonctionnels uniquement, avec hooks.
- Props typées et exportees explicitement.
- Garder les fonctions petites et focalisees.

## Architecture (inspiree du TP)
- Centraliser les routes dans un composant de navigation (ex: `Navigator`).
- Isoler les composants d'affichage (ex: listes, items, details) des composants de formulaire.
- Conserver les types partages dans un fichier dedie (ex: `types.ts`).

## Routing
- Declarer toutes les routes au meme endroit.
- Utiliser des chemins explicites et des params lisibles.
- Le deep linking doit fonctionner (pas de logique qui casse un refresh).

## Styles
- Styles par page/composant si possible.
- Eviter les styles globaux implicites.
- Preferer des classes claires et un scope minimal.

## Documentation
- Mettre a jour le README pour toute nouvelle feature.
- Ajouter un commentaire JSDoc uniquement pour les fonctions complexes.
- Garder un changelog a jour si le projet en contient un.


## Git workflow
- Commits descriptifs et atomiques.
- Travailler sur une branche de feature.
- Ne pas amender un commit sans demande explicite.
