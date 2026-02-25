export default {
  '**/*.ts': () => ['pnpm type-check', 'pnpm lint:fix', 'pnpm format:fix .', 'pnpm test:unit'],
};
