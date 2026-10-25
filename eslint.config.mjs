import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description' },
      ],
    },
  },
  // D8: domain/application không tự lấy thời gian hay ngẫu nhiên (dùng port Clock/RandomSource).
  {
    files: ['src/contexts/*/domain/**/*.ts', 'src/contexts/*/application/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Dùng port RandomSource.' },
        { object: 'Date', property: 'now', message: 'Dùng port Clock.' },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'crypto', message: 'Dùng port RandomSource/IdGenerator ở hạ tầng.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'Dùng port Clock.',
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
]);

export default eslintConfig;
