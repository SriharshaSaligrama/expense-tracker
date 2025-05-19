import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import tanstackRouter from "@tanstack/eslint-plugin-router";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "react": react,
            "@tanstack/router": tanstackRouter,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...tanstackRouter.configs.recommended.rules,
            "react/react-in-jsx-scope": "off"
            // Add custom rules or overrides here
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        files: ["**/*.tsx", "**/*.jsx"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            react,
        },
        rules: {
            ...react.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
        },
    },
];
