import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["server/tests/**/*.test.ts"],
    setupFiles: ["server/tests/globalSetup.ts"],
    // Chaque fichier de test a son propre module registry → DB fraîche
    isolate: true,
    reporters: ["verbose"],
  },
});
