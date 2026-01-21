# Supabase Migrations

Complete guide to managing database migrations with Supabase CLI and local development.

## Overview

Supabase provides a built-in migration system via the Supabase CLI. **Do not build custom migration runners** - use Supabase's standard tooling.

## Setup

### Install Supabase CLI

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### Initialize Project

```bash
# Initialize Supabase project (creates supabase/ directory)
supabase init
```

This creates:
- `supabase/config.toml` - Configuration file
- `supabase/migrations/` - Migration files directory

## Migration Workflow

### Creating Migrations

```bash
# Create a new migration with timestamp
supabase migration new <migration_name>

# Example:
supabase migration new core_schema
# Creates: supabase/migrations/20260106164020_core_schema.sql
```

**Migration File Naming:**
- Must follow pattern: `<timestamp>_<name>.sql`
- Timestamp format: `YYYYMMDDHHMMSS`
- Files are applied in timestamp order

### Writing Migration SQL

```sql
-- supabase/migrations/20260106164020_core_schema.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE entity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_entity_name ON entity(name);

-- IMPORTANT: Grant permissions for PostgREST access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure future tables also get grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
```

### Applying Migrations

#### Local Development

```bash
# Reset local database and apply all migrations
supabase db reset

# Apply pending migrations only
supabase db push
```

#### Remote/Production

```bash
# Link to remote project (first time only)
supabase link --project-ref your-project-ref

# Push migrations to remote
supabase db push
```

## Local Development

### Starting Local Supabase

```bash
# Start local Supabase instance (Docker required)
supabase start
```

This starts:
- PostgreSQL database (port 54322)
- PostgREST API (port 54321)
- Supabase Studio (port 54323)
- Auth, Storage, Realtime services

### Getting Connection Details

```bash
# Get all connection details
supabase status

# Get JSON output
supabase status --output json
```

**Local Connection Details:**
- Database: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- API URL: `http://127.0.0.1:54321`
- Anon Key: `sb_publishable_...` (from `supabase status`)

### Environment Variables for Local

Create `.env.local` with local Supabase credentials:

```bash
# From supabase status output
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Testing Migrations Locally

```bash
# 1. Start local Supabase
supabase start

# 2. Apply migrations
supabase db reset

# 3. Run tests (loads .env.local automatically)
cd packages/core
pnpm test

# 4. Verify in Studio
# Open http://127.0.0.1:54323
```

## Important Considerations

### PostgREST Schema Cache

PostgREST (Supabase API layer) caches the database schema. After migrations:

**If tables aren't visible via API:**
1. Restart Supabase: `supabase stop && supabase start`
2. Or reload schema: `docker exec supabase_db_<project> psql -U postgres -d postgres -c "NOTIFY pgrst, 'reload schema';"`

**Best Practice:** Always include GRANT statements in migrations to ensure PostgREST access.

### Migration Best Practices

1. **Always test locally first** - Use `supabase db reset` to test migrations
2. **Include GRANT statements** - Required for PostgREST API access
3. **Use transactions** - Wrap migrations in transactions when possible
4. **Idempotent migrations** - Use `IF NOT EXISTS` where appropriate
5. **One change per migration** - Keep migrations focused and atomic

### Migration File Structure

```sql
-- Migration: Description
-- Step X.X: Brief description

-- Enable extensions (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema changes
CREATE TABLE ...

-- Indexes
CREATE INDEX ...

-- Grants (REQUIRED for PostgREST)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
```

## Common Commands

```bash
# Initialize project
supabase init

# Start local instance
supabase start

# Stop local instance
supabase stop

# Create migration
supabase migration new <name>

# Apply migrations (local)
supabase db reset

# Apply migrations (remote)
supabase db push

# Check status
supabase status

# Link to remote project
supabase link --project-ref <ref>

# View logs
supabase logs
```

## Troubleshooting

### Tables Not Visible via API

**Problem:** Migration applied but tables not accessible via Supabase client.

**Solution:**
1. Check GRANT statements are in migration
2. Reload PostgREST schema: `supabase stop && supabase start`
3. Verify with `supabase status` that services are running

### Migration Fails

**Problem:** Migration SQL has errors.

**Solution:**
1. Test SQL in Supabase Studio SQL Editor first
2. Check migration file syntax
3. Verify dependencies (extensions, tables) exist
4. Use `supabase db reset` to start fresh

### Local Instance Won't Start

**Problem:** Docker issues or port conflicts.

**Solution:**
1. Check Docker is running: `docker ps`
2. Check ports aren't in use: `lsof -i :54321`
3. Stop existing instance: `supabase stop`
4. Check logs: `supabase logs`

## Integration with Testing

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for local Supabase
config({ path: resolve(__dirname, '../../.env.local') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Environment variables loaded automatically
  },
});
```

### Test Workflow

```bash
# 1. Start local Supabase
supabase start

# 2. Apply migrations
supabase db reset

# 3. Run tests (uses .env.local)
pnpm test
```

## Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgREST Documentation](https://postgrest.org/)
