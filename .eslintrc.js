module.exports = {
  extends: ['airbnb-base', 'plugin:chai-friendly/recommended'],
  rules: {
    'consistent-return': 0,
    'func-names': 0,
    'comma-dangle': 0,
    'no-underscore-dangle': 0,
    'linebreak-style': 0,
    'operator-linebreak': 0,
    'no-console': 0,
    'arrow-parens': 0,
    'class-methods-use-this': 0,
    'implicit-arrow-linebreak': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'object-curly-newline': 0
  },
  extends: ['airbnb-base', 'plugin:chai-friendly/recommended'],
  parser: 'babel-eslint',
  env: { mocha: true, node: true, es6: true }
};
