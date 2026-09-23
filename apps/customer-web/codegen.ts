import type { CodegenConfig } from '@graphql-codegen/cli';

// Chạy `npm run codegen -w @bta/customer-web` khi apps/api/schema.gql đổi. Output: src/gql/
const config: CodegenConfig = {
  schema: '../api/schema.gql',
  documents: ['src/**/*.{ts,tsx}', '!src/gql/**'],
  ignoreNoDocuments: true,
  generates: {
    'src/gql/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: { scalars: { Money: 'number', DateTime: 'string', Date: 'string', JSON: 'unknown' }, useTypeImports: true },
    },
  },
};
export default config;
