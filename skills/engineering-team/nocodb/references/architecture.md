# NocoDB Architecture Patterns

Two-database architecture, connection patterns, and Supabase integration for NocoDB.

## Two-Database Architecture

NocoDB requires **two separate databases**:

### 1. Metadata DB (Local PostgreSQL Container)

**Purpose:** Stores NocoDB's own configuration and metadata.

**Contents:**

- Workspaces
- Users and authentication
- View configurations
- API tokens
- NocoDB application state

**Configuration:**

- Configured via `NC_DB` environment variable
- Service name: `nocodb_metadata` (used in `docker exec` commands)
- Volume name: `nocodb_metadata_data` (for persistence)

**Connection String Format:**

```
pg://nocodb_metadata:5432?u=nocodb&p=${NOCODB_METADATA_PASSWORD}&d=nocodb_meta
```

**Format Reference:** NocoDB documentation for `NC_DB` environment variable - validate format matches NocoDB's expected `pg://` URI schema. Common footgun if format is incorrect.

**PostgreSQL Container Environment:**

- `POSTGRES_USER=nocodb`
- `POSTGRES_DB=nocodb_meta`
- `POSTGRES_PASSWORD=${NOCODB_METADATA_PASSWORD}`

**Key Principle:** Metadata DB is separate from external data sources to prevent production data leakage into local dev metadata.

### 2. External Data Source (Supabase PostgreSQL)

**Purpose:** Contains application data (entity, contact, thread, etc.).

**Configuration:**

- Added via NocoDB UI (NOT via `NC_DB`)
- NocoDB UI → Data Sources → Add New → PostgreSQL

**Connection Details:**

- Host: `db.{PROJECT_REF}.supabase.co` (direct) or `aws-0-${REGION}.pooler.supabase.com` (pooler)
- Port: `5432` (direct or session pooler)
- Username: `postgres.{PROJECT_REF}`
- Password: `${SUPABASE_DB_PASSWORD}` (PostgreSQL password, NOT service role API key)
- Database: `postgres`
- Schema: `public`
- SSL: `sslmode=require` (Supabase enforces SSL)

**Critical Distinction:**

- `NC_DB` is ONLY for metadata storage (local PostgreSQL)
- External data sources are added via NocoDB UI
- This separation prevents production data leakage into local dev metadata

## Supabase Connection Patterns

### Connection Mode Decision

**Supabase Connection Taxonomy** (align with Supabase's current documentation):

1. **Direct Connection**
   - Host: `db.{ref}.supabase.co`
   - Port: `5432`
   - IPv6 by default in Supabase
   - Direct PostgreSQL connection

2. **Supavisor Session Pooler**
   - Host: `aws-0-${REGION}.pooler.supabase.com`
   - Port: `5432`
   - Session mode (compatible with NocoDB)
   - Use if IPv6 unavailable

3. **Supavisor Transaction Pooler**
   - Host: `aws-0-${REGION}.pooler.supabase.com`
   - Port: `6543`
   - Transaction mode (NOT recommended for NocoDB)
   - Incompatible with NocoDB's schema introspection needs

### Decision for NocoDB

**Default:** Direct connection (`db.{ref}.supabase.co:5432`) if IPv6 works in your environment.

**Fallback:** Supavisor session pooler (`*.pooler.supabase.com:5432`) if IPv6 unavailable.

**Avoid:** Transaction pooler (port 6543) - incompatible with NocoDB's schema introspection needs.

**Why Session Mode:**

- NocoDB needs stable session semantics for introspection
- Metadata queries require `pg_catalog` access
- Enables automatic Foreign Key and relationship detection
- Schema changes are detected automatically

### Connection Pooling Configuration

**In NocoDB External DB Settings:**

- Max Connections: `10` (recommended for local dev, adjust for production)
- **Note:** Keep NocoDB max connections below 80% of project's configured pool size
- Idle Timeout: `30000` ms (30 seconds)
- Connection Timeout: `10000` ms (10 seconds)

**Connection Pool Monitoring (Production):**

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity
WHERE datname = 'postgres'
AND usename = 'postgres.{PROJECT_REF}';
```

**Supabase Dashboard:** Database → Connection pooling (shows pool size and mode)

**Alert Threshold:** If connections > 80% of configured max, adjust pool size.

## Relationship Auto-Detection

NocoDB automatically detects relationships **ONLY if Foreign Key constraints exist** in the SQL schema.

### Requirements

1. **Foreign Key Constraints Must Exist:**

   ```sql
   -- Example: thread.contact_id → contact.id
   ALTER TABLE thread
   ADD CONSTRAINT thread_contact_id_fkey
   FOREIGN KEY (contact_id) REFERENCES contact(id);
   ```

2. **NocoDB Introspects Schema:**
   - Reads `pg_catalog` to discover FK constraints
   - Creates relationship links automatically
   - Shows related records in views

### Common Foreign Key Patterns

**Contact → Entity:**

```sql
ALTER TABLE contact
ADD CONSTRAINT contact_entity_id_fkey
FOREIGN KEY (entity_id) REFERENCES entity(id);
```

**Thread → Contact:**

```sql
ALTER TABLE thread
ADD CONSTRAINT thread_contact_id_fkey
FOREIGN KEY (contact_id) REFERENCES contact(id);
```

**Contact Account → Contact:**

```sql
ALTER TABLE contact_account
ADD CONSTRAINT contact_account_contact_id_fkey
FOREIGN KEY (contact_id) REFERENCES contact(id) ON DELETE CASCADE;
```

### Troubleshooting Relationships

**If relationships don't appear:**

1. Verify Foreign Key constraints exist in Supabase schema
2. Check `pg_catalog` access (requires session mode, not transaction mode)
3. Restart NocoDB to refresh schema introspection
4. Verify connection mode is session (port 5432), not transaction (port 6543)

**Cannot create "virtual" relationships** in NocoDB without SQL-level FK constraints.

## Security Architecture

### RLS Bypass Implications

NocoDB connects as a **privileged PostgreSQL role** (`postgres.{PROJECT_REF}`), which bypasses application-layer RLS expectations.

**Security Implications:**

- NocoDB can read/write ALL data in Supabase (no row-level restrictions)
- RLS policies are bypassed at the PostgreSQL level
- All NocoDB operations must be logged for audit trail

**Mitigation Strategies:**

1. **IP Allowlist:** Limit NocoDB access to specific IP ranges (AWS WAF, Supabase IP allowlist)
2. **Dedicated Role:** Create `nocodb_user` PostgreSQL role with limited permissions (future enhancement)
3. **Audit Logging:** Log all NocoDB operations for security compliance
4. **Network Isolation:** Restrict NocoDB network access in production

**When RLS Policies Are Added (Phase 2):**

- Evaluate if NocoDB should use a restricted role instead of service role
- Consider read-only access for NocoDB if write access not required
- Document RLS bypass implications in security documentation

### Connection String Security

**Critical Distinction:**

- `SUPABASE_DB_PASSWORD` = Actual PostgreSQL database password
- `SUPABASE_SERVICE_ROLE_KEY` = JWT API key for Supabase API calls (NOT for PostgreSQL authentication)

**Never:**

- Hardcode credentials in docker-compose.yml
- Commit credentials to version control
- Log connection strings with passwords
- Use service role API key for PostgreSQL authentication

**Always:**

- Use environment variables for all credentials
- Verify `.env` is in `.gitignore`
- Sanitize error messages (no credentials in logs)
- Use proper secrets management in production (AWS Secrets Manager, etc.)

## Architecture Best Practices

1. **Separate Metadata from Data:** Always use separate databases for metadata and application data
2. **Use Session Mode:** Prefer session mode (port 5432) over transaction mode (port 6543)
3. **Foreign Key Constraints:** Always define FK constraints in schema for relationship auto-detection
4. **Connection Pooling:** Monitor and limit connection pool usage (below 80% of max)
5. **Security First:** Document RLS bypass implications and mitigation strategies
6. **Audit Everything:** Log all NocoDB operations for security compliance

## References

- **NocoDB Documentation:** https://nocodb.com/docs/product-docs/data-sources
- **Supabase Connection Pooling:** https://supabase.com/docs/guides/database/connecting-to-postgres
- **PostgreSQL Foreign Keys:** https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK
