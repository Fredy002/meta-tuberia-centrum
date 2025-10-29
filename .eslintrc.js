module.exports = {
  root: true,
  ignorePatterns: ["node_modules/", "build/", "public/build/"],
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
  ],
};
