/**
 * iop-web-tooling-starter-pack
 * Version: 0.1.3
 */
module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    sourceType: "module"
  },
  rules: {
    "linebreak-style": ["error", "unix"],
    "no-console": "warn",
    "no-param-reassign": "error",
    "space-before-function-paren": "off",
    "vars-on-top": "off"
  }
};
