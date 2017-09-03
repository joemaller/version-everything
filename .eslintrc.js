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
    "no-param-reassign": "error",
    "space-before-function-paren": "off",
    "vars-on-top": "off",
    "no-console": "warn",
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    semi: ["error", "always"]
  }
};
