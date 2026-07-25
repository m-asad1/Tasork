/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./index.js', 'next/core-web-vitals'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
