import type { CodegenConfig } from '@graphql-codegen/cli';

const schemaUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;

const config: CodegenConfig = {
  schema: schemaUrl,
  documents: 'src/api/gql/**/*.graphql',
  generates: {
    'src/api/generated/graphql-api.ts': {
      plugins: [
        {
          add: {
            content: ['/* eslint-disable */', '// @ts-nocheck'],
          },
        },
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        apolloReactHooksImportFrom: '@apollo/client/react',
        gqlImport: '@apollo/client#gql',
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
