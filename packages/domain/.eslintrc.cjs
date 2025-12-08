module.exports = {
  root: true,
  extends: ["@domie/eslint-config"],
  rules: {
    // Domain layer should be framework-agnostic
    // No React or framework-specific rules here
    "@typescript-eslint/no-explicit-any": "error", // Stricter for domain
  },
};

