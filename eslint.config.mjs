import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Flat config (ESLint 9). `next lint` was removed in Next 16, so `npm run lint`
// runs ESLint directly with the same rule set the old .eslintrc.json used.
export default defineConfig([
  ...nextVitals,
  {
    // New React Compiler checks from eslint-plugin-react-hooks v7. They flag
    // patterns that predate the upgrade (Icon, NavBar, ProjectList, RevealText,
    // SoundProvider, lib/hooks), so they warn until those are refactored.
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "graphify-out/**",
  ]),
]);
