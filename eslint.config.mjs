import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Flat config (ESLint 9). `next lint` was removed in Next 16, so `npm run lint`
// runs ESLint directly with the same rule set the old .eslintrc.json used.
export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "graphify-out/**",
  ]),
]);
