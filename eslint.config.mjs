import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config({
    files: ["src/**/*.ts", "src/**/*.tsx"], 
    ignores: ["/node_modules/", "*.d.ts", "*.css.ts"]
    languageOptions: { globals: globals.browser },
    plugins: {
      eslintConfigPrettier
    },
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
    ]
  }, 
  {
    ignores: ["/scripts/", "/dist/"],
  }
);
