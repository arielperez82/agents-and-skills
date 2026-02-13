---
name: tinybird
description: Tinybird Code agent tools and prompts for working with Tinybird projects, datafiles, queries, deployments, tests, and the TypeScript SDK (@tinybirdco/sdk).
---

# Tinybird Agent Skills

Reusable guidance extracted from Tinybird Code (the Tinybird CLI coding agent). Use this skill when working in Tinybird projects, editing datafiles, running build/deploy flows, exploring data, managing tests/secrets, or using the Tinybird TypeScript SDK for type-safe definitions and typed client ingest/query.

## When to Apply

- Creating or updating Tinybird resources (.datasource, .pipe, .connection)
- Working with queries, endpoints, or data exploration
- Managing Tinybird deployments, secrets, or tests
- Reviewing or refactoring Tinybird project files
- Using the Tinybird TypeScript SDK: defining datasources/pipes/endpoints in TypeScript, `tinybird.json` config, SDK CLI (`tinybird dev|build|deploy`), or the typed client for ingest and query

## Rule Files

- `rules/project-files.md`
- `rules/build-deploy.md`
- `rules/datasource-files.md`
- `rules/pipe-files.md`
- `rules/endpoint-files.md`
- `rules/materialized-files.md`
- `rules/sink-files.md`
- `rules/copy-files.md`
- `rules/connection-files.md`
- `rules/sql.md`
- `rules/endpoint-optimization.md`
- `rules/append-data.md`
- `rules/mock-data.md`
- `rules/tests.md`
- `rules/secrets.md`
- `rules/tokens.md`
- `rules/cli-commands.md`
- `rules/data-operations.md`
- `rules/deduplication-patterns.md`
- `rules/local-development.md`
- `rules/events-api-quarantine.md`
- `rules/integration-testing.md`
- `rules/typescript-sdk.md`

## Quick Reference

- **Classic (datafiles):** Project local files are the source of truth; build for Local, deploy for Cloud. Use `tb info` to check CLI context. CLI commands by default target Local; use `tb --cloud <command>` for Cloud and `tb --branch <branch-name> <command>` for a branch.
- **TypeScript SDK:** Use `@tinybirdco/sdk` when you want type-safe definitions and a typed client; configure with `tinybird.json`, sync with `npx tinybird dev|build|deploy` (see `rules/typescript-sdk.md`). Can mix SDK and datafiles via `include`.
- SQL is SELECT-only with Tinybird templating rules and strict parameter handling.
- **Tinybird Local APIs:** SQL API and ClickHouse proxy allow only SELECT/DESCRIBE; use `SELECT ... FINAL` for ReplacingMergeTree dedup and REST for truncate (see `rules/sql.md`, `rules/local-development.md`). Events API quarantine behavior: see `rules/events-api-quarantine.md`. Datasource integration tests: see `rules/integration-testing.md`.
