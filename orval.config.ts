import { defineConfig } from 'orval'

/**
 * Generates TanStack Query hooks and types from the backend OpenAPI spec (section 9.5).
 * Start the backend first, then run: npm run api:gen
 */
export default defineConfig({
  asms: {
    input: {
      target: process.env.OPENAPI_URL ?? 'http://localhost:8080/v3/api-docs',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/endpoints',
      schemas: 'src/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      formatter: 'prettier',
      override: {
        mutator: {
          path: 'src/api/http-client.ts',
          name: 'httpClient',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
})
