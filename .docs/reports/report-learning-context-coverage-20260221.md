# Coverage Improvement Findings: Extracting Pure Functions from Adapters

  Problem

  When adapter classes mix pure transformation logic with HTTP orchestration, unit coverage sits at ~5-7% per file because unit tests (correctly) don't exercise fetch/retry/URL construction. This drags overall package coverage below thresholds.

  ---
  Pattern: Extract Co-located Pure Functions

  Where: In the same adapter file, above the class definition. Exported as standalone functions.

  What to extract (the extraction recipe):

  ┌────────────────────────────────────────────────┬─────────────────────────────────────┬──────────────────────────────────────────────────────┐
  │                 Function shape                 │               Purpose               │                       Example                        │
  ├────────────────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ parseXxxResponse(data, assetId, quoteCurrency) │ API JSON → domain type (PriceQuote) │ Validation, dynamic key extraction, field mapping    │
  ├────────────────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ resolveXxxAssetId(asset: Asset)                │ Domain asset → provider-specific ID │ 'sBTC' → 'sbtc-2' (CoinGecko) or 38906 (CMC)         │
  ├────────────────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ mapToStorageFormat(record: DomainType)         │ Domain model → storage row          │ camelCase→snake_case, field renames, JSON.stringify  │
  ├────────────────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ toXxxError(err: unknown)                       │ Error normalization                 │ Status extraction from message regex, fallback codes │
  └────────────────────────────────────────────────┴─────────────────────────────────────┴──────────────────────────────────────────────────────┘

  What stays in the class: HTTP orchestration (URL construction, fetch, retry wrapping, header assembly). These are tested in integration tests with MSW.

  Reference implementation: hiro-pox.adapter.ts in stacking-collector — exports parsePoxResponse, parseCycleResponse, accumulateRewardsInRange, shouldStopPaginating alongside the adapter class.

  ---
  Pattern: Structural Function Coverage Gap

  When pure functions and HTTP methods share a file, function coverage will structurally lag behind statement/line/branch coverage by ~5%. This is because:

  - Adapter class methods (fetchPrice, fetchPriceByAsset, ingestPriceData) count as functions
  - Constructors count as functions
  - Retry callbacks and inner async functions count as functions
  - None of these should be exercised in unit tests

  Prescription: Set functions threshold 5% below other thresholds in vitest.unit.config.ts (e.g., functions: 60 when others are 65). This is expected, not a defect.

  Don't split files just for coverage. Co-location keeps related logic together. The functions are exported and independently testable. Splitting into coingecko.helpers.ts adds indirection without benefit.

  ---
  Pattern: Coverage Commands in TDD Workflow

  - test:unit — fast, no coverage overhead, used during RED-GREEN-REFACTOR cycles
  - test:unit with --coverage flag or dedicated test:unit:coverage script — used specifically when working on coverage
  - CI enforces thresholds regardless, so no regression risk from the default being coverage-free

  Coverage configs live in vitest configs:
  - Thresholds: vitest.unit.config.ts → test.coverage.thresholds
  - Include/exclude patterns: vitest.shared.config.ts → coverageConfig

  ---
  Results from price-collector

  ┌────────────┬────────┬────────┬───────────┐
  │   Metric   │ Before │ After  │ Threshold │
  ├────────────┼────────┼────────┼───────────┤
  │ Statements │ 43.54% │ 69.35% │ 65%       │
  ├────────────┼────────┼────────┼───────────┤
  │ Branches   │ 41%    │ 77.08% │ 65%       │
  ├────────────┼────────┼────────┼───────────┤
  │ Functions  │ 50%    │ 61.76% │ 60%       │
  ├────────────┼────────┼────────┼───────────┤
  │ Lines      │ 44.5%  │ 69.66% │ 65%       │
  └────────────┴────────┴────────┴───────────┘

  6 pure functions extracted, 30 new unit tests, zero changes to integration tests.

  ---
  Checklist for New Collector Packages

  When scaffolding a new collector with adapters:

  1. Write adapter class with HTTP orchestration
  2. Extract response parsing into parseXxxResponse — co-located, exported
  3. Extract ID resolution into resolveXxxAssetId — co-located, exported
  4. Extract format mapping if adapter writes to storage — co-located, exported
  5. Write unit tests for extracted functions only
  6. Write integration tests (MSW) for HTTP round-trips
  7. Set functions threshold 5% below other thresholds if adapter-heavy
  8. Verify with pnpm vitest run --config vitest.unit.config.ts --coverage