import globals from "globals";
import typescript from "typescript-eslint";
import jsRules from "@joshuaavalon/eslint-config-javascript";
import tsRules from "@joshuaavalon/eslint-config-typescript";
// import importPlugin from "eslint-plugin-import";

export default [
  { ignores: ["node_modules", "dist"] },
  {
    ...jsRules,
    files: [
      "**/*.js",
      "**/*.mjs",
      "**/*.cjs"
    ],
    languageOptions: { globals: { ...globals.node } }
  },
  {
    ...tsRules,
    files: ["**/*.ts", "**/*.tsx"],
    // plugins: { ...tsRules.plugins, import: importPlugin },
    // rules: { ...tsRules.rules, "import/no-cycle": ["error"] },
    // settings: {
    //   ...importPlugin.configs.typescript.settings,
    //   "import/resolver": {
    //     ...importPlugin.configs.typescript.settings["import/resolver"],
    //     typescript: { alwaysTryTypes: true }
    //   }
    // },
    languageOptions: {
      parser: typescript.parser,
      parserOptions: {
        project: true,
        tsconfigDirName: import.meta.dirname,
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.nodeBuiltin
      }
    }
  },
  {
    files: ["**/__tests__/**/*.spec.ts"],
    languageOptions: {
      globals: {
        describe: true,
        it: true
      }
    }
  }
];
