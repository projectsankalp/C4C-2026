import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Files / dirs ESLint should never look at.
    // Keep this in sync with .prettierignore.
    ignores: [
      "dist",
      "**/dist/**",
      ".output",
      ".vinxi",
      "**/node_modules/**",
      // WhatsApp session data is opaque third-party state, not source.
      "**/.wwebjs_auth/**",
      "**/.wwebjs_cache/**",
      // Vendored UI library — read-only copy, not maintained here.
      "vendor_ui/**",
      // Static browser bundle served as-is by the simulator.
      "apps/wa-bot/src/simulator/public/**",
      // Generated / report artifacts.
      "**/*.tsbuildinfo",
      "eslint-results.json",
      "lint-detail.txt",
      "lint-summary.txt",
      "**/routeTree.gen.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // shadcn/ui component files conventionally export both a component and its
  // variants/hook helpers in the same module. Disable the react-refresh
  // warning for those generated files; they aren't hot-reloaded individually.
  {
    files: ["src/components/ui/**/*.{ts,tsx}", "src/lib/i18n.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  // Backend / Node-only code: relax browser-only rules and explicit-any (server-side
  // boundaries with Express, Prisma, OpenAI SDKs frequently need narrow `any` casts).
  {
    files: ["apps/wa-bot/**/*.ts", "apps/api/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-refresh/only-export-components": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  eslintPluginPrettier,
);
