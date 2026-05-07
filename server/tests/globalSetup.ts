/**
 * Exécuté avant chaque fichier de test (setupFiles).
 * Pointe la DB sur :memory: pour éviter toute interaction avec gymwatch.db.
 */
process.env.GYMWATCH_DB = ":memory:";
