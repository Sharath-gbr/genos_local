module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-require-imports': 'off',
    'react/jsx-no-undef': 'off'
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/'
  ]
}; 