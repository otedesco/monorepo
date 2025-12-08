module.exports = {
  root: true,
  extends: ["@domie/eslint-config"],
  ignorePatterns: [
    "dist",
    ".next",
    "storybook-static",
    "node_modules",
    "*.config.js",
    "*.config.cjs",
    "*.config.mjs",
    "supabase/migrations/*.sql",
  ],
};

