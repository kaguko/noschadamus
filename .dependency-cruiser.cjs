/** Quy tắc import D1-D7 (docs/03-architecture-api-data.md mục 3). D8 nằm trong eslint.config.mjs. */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'D1-domain-purity',
      comment:
        'domain chỉ import domain cùng context và shared/kernel; không thư viện, không Node API.',
      severity: 'error',
      from: { path: '^src/contexts/([^/]+)/domain/' },
      to: { pathNot: ['^src/contexts/$1/domain/', '^src/shared/kernel/'] },
    },
    {
      name: 'D2-application-boundary',
      comment: 'application chỉ import domain/application cùng context và shared/kernel.',
      severity: 'error',
      from: { path: '^src/contexts/([^/]+)/application/' },
      to: { pathNot: ['^src/contexts/$1/(domain|application)/', '^src/shared/kernel/'] },
    },
    {
      name: 'D3-infrastructure-no-presentation',
      comment: 'infrastructure không import app, components, composition.',
      severity: 'error',
      from: { path: '^src/contexts/[^/]+/infrastructure/' },
      to: { path: '^src/(app|components|composition)/' },
    },
    {
      name: 'D4-no-cross-context',
      comment: 'context này không import context kia (trừ cổng tarot-gateway).',
      severity: 'error',
      from: {
        path: '^src/contexts/([^/]+)/',
        pathNot: '^src/contexts/reading/infrastructure/tarot-gateway\\.ts$',
      },
      to: { path: '^src/contexts/', pathNot: '^src/contexts/$1/' },
    },
    {
      name: 'D4-tarot-gateway-public-api-only',
      comment: 'tarot-gateway chỉ được import tarot/application/public-api.',
      severity: 'error',
      from: { path: '^src/contexts/reading/infrastructure/tarot-gateway\\.ts$' },
      to: {
        path: '^src/contexts/(?!reading/)',
        pathNot: '^src/contexts/tarot/application/public-api\\.ts$',
      },
    },
    {
      name: 'D5-presentation-boundary',
      comment:
        'app/components không import domain/infrastructure trực tiếp (cho phép import chỉ-kiểu).',
      severity: 'error',
      from: { path: '^src/(app|components)/' },
      to: {
        path: '^src/contexts/[^/]+/(domain|infrastructure)/',
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'D6-composition-only-from-app',
      comment: 'chỉ app/ được import composition/.',
      severity: 'error',
      from: { pathNot: '^src/(app|composition)/' },
      to: { path: '^src/composition/' },
    },
    {
      name: 'D7-no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.test\\.tsx?$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json'],
    },
  },
};
