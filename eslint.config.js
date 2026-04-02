import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "build/",
      "node_modules/",
      ".react-router/",
      "prisma/migrations/",
    ],
  },
  {
    rules: {
      // Allow unused vars prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow explicit any in a convergence engine with dynamic AI outputs
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow non-null assertions — Prisma relations are often known-safe
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  }
);
