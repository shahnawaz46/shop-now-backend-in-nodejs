import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      // "no-console": "warn", // warns about accidental console.log() in production code
      "no-debugger": "error", // prevents debugger statements from reaching production
      "no-implicit-globals": "error", // prevents accidental global variables
    },
  },
]);
