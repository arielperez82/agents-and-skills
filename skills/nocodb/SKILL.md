---
name: nocodb
description: NocoDB setup, integration, and operations for database UI and administration. Use when setting up NocoDB locally with Docker, connecting NocoDB to external databases (Supabase, PostgreSQL), creating views and relationships, configuring security (RLS bypass, image scanning), managing backups, or troubleshooting NocoDB connectivity issues. Includes two-database architecture patterns (metadata DB vs external data source), NC_DB connection string configuration, view creation via UI, relationship auto-detection via FK constraints, and operational procedures (backup, monitoring, error handling). Reference NocoDB documentation at https://nocodb.com/docs for official guidance.
---

# NocoDB Skill

NocoDB setup, integration, and operational procedures for database UI and administration. This skill covers the complete NocoDB lifecycle from local Docker setup through production deployment patterns.

## Quick Start

### Local Setup with Docker

```bash
# 1. Create docker-compose.yml (see references/setup.md)
docker-compose up -d

# 2. Access NocoDB UI
open http://localhost:8080

# 3. Login with admin credentials from .env
# NC_ADMIN_EMAIL and NC_ADMIN_PASSWORD

# 4. Add external data source (Supabase) via UI
# NocoDB UI → Data Sources → Add New → PostgreSQL
```

**See:** [references/setup.md](references/setup.md) for complete Docker Compose configuration.

## Architecture Overview

NocoDB uses a **two-database architecture**:

1. **Metadata DB** (local PostgreSQL container)
   - Stores NocoDB's own configuration (workspaces, users, views, API tokens)
   - Configured via `NC_DB` environment variable
   - Format: `pg://nocodb_metadata:5432?u=nocodb&p=${PASSWORD}&d=nocodb_meta`
   - **Reference:** NocoDB documentation for `NC_DB` connection string format

2. **External Data Source** (Supabase PostgreSQL)
   - Contains application data (entity, contact, thread, etc.)
   - Added via NocoDB UI (NOT via `NC_DB`)
   - Connection configured in NocoDB UI → Data Sources

**Key Principle:** Metadata DB is separate from external data sources to prevent production data leakage into local dev metadata.

**See:** [references/architecture.md](references/architecture.md) for detailed architecture patterns.

## Core Capabilities

### 1. Docker Setup

- Docker Compose configuration with metadata DB service
- Environment variable management
- Health check configuration
- Container security (non-root user, resource limits)

**See:** [references/setup.md](references/setup.md)

### 2. External Database Connection

- Supabase PostgreSQL connection (direct or pooler)
- Connection mode selection (Session vs Transaction)
- Connection pooling configuration
- SSL/TLS verification

**See:** [references/architecture.md](references/architecture.md) for connection patterns.

### 3. View Creation

- Manual UI view creation steps (NocoDB v0.255.0)
- Relationship auto-detection via Foreign Key constraints
- View configuration backup/restore
- View export/import limitations

**See:** [references/views.md](references/views.md)

### 4. Security Configuration

- RLS bypass implications and mitigation
- Image vulnerability scanning (Trivy)
- Error message sanitization
- Audit logging requirements

**See:** [references/security.md](references/security.md)

### 5. Operations

- Metadata DB backup automation
- Monitoring and alerting
- Error handling (Supabase unavailability)
- Troubleshooting guide

**See:** [references/operations.md](references/operations.md)

## Reference Navigation

### Architecture & Setup

- **[architecture.md](references/architecture.md)** - Two-database architecture, connection patterns, Supabase integration
- **[setup.md](references/setup.md)** - Docker Compose configuration, environment variables, health checks

### Views & Relationships

- **[views.md](references/views.md)** - View creation via UI, relationship auto-detection, backup/restore

### Security

- **[security.md](references/security.md)** - RLS bypass, image scanning, audit logging, error sanitization

### Operations

- **[operations.md](references/operations.md)** - Backup automation, monitoring, error handling, troubleshooting

## Scripts

Automation scripts for common NocoDB operations:

- **setup-nocodb.sh** - Docker Compose initialization and validation
- **backup-metadata.sh** - Metadata DB backup automation
- **scan-image.sh** - Trivy vulnerability scanning wrapper

**Usage:**

```bash
# Setup NocoDB
./scripts/setup-nocodb.sh

# Backup metadata DB
./scripts/backup-metadata.sh

# Scan image for vulnerabilities
./scripts/scan-image.sh nocodb/nocodb:0.255.0
```

## NocoDB Documentation

**Official Documentation:** https://nocodb.com/docs

**Key Documentation Sections:**

- [Getting Started](https://nocodb.com/docs/tags/getting-started)
- [Data Sources](https://nocodb.com/docs/product-docs/data-sources) - External database connection
- [Connect](https://nocodb.com/docs/tags/connect) - Connection configuration
- [Views](https://nocodb.com/docs/product-docs/view) - View creation and management

**When in doubt, refer to official NocoDB documentation for authoritative guidance.**

## Common Patterns

### Connection String Format

**NC_DB (Metadata DB):**

```
pg://nocodb_metadata:5432?u=nocodb&p=${NOCODB_METADATA_PASSWORD}&d=nocodb_meta
```

**External Data Source (Supabase):**

- Direct connection: `db.{PROJECT_REF}.supabase.co:5432`
- Session pooler: `aws-0-${REGION}.pooler.supabase.com:5432`
- **Avoid:** Transaction pooler (port 6543) - incompatible with schema introspection

### View Creation Workflow

1. Navigate to table in NocoDB UI
2. Create new Grid view (or use default)
3. Configure columns, filters, sorts
4. Verify relationships (requires FK constraints in schema)
5. Save view with descriptive name

**See:** [references/views.md](references/views.md) for detailed steps.

### Backup Strategy

**Metadata DB:**

```bash
docker exec nocodb_metadata pg_dump -U nocodb nocodb_meta > backups/nocodb-metadata-$(date +%Y%m%d).sql
```

**View Configurations:**

- Backup metadata DB (includes all views)
- Document view definitions as markdown checklists (fallback)

**See:** [references/operations.md](references/operations.md) for complete backup procedures.

## Best Practices

1. **Always use environment variables** for credentials (never hardcoded)
2. **Scan container images** for vulnerabilities before deployment (Trivy)
3. **Document view configurations** as markdown checklists (NocoDB doesn't support JSON export)
4. **Use Foreign Key constraints** in schema for relationship auto-detection
5. **Monitor connection pool usage** (keep NocoDB max connections below 80% of pool size)
6. **Test error handling** (Supabase unavailability scenarios)
7. **Change default admin password** in production
8. **Use session mode** for Supabase connections (port 5432, not transaction mode 6543)

## Troubleshooting

**Common Issues:**

1. **Relationships not visible:** Verify Foreign Key constraints exist in schema
2. **Connection failures:** Check `NC_DB` format matches NocoDB's expected `pg://` URI schema
3. **Views not persisting:** Verify metadata DB is healthy and NocoDB can write to it
4. **SSL connection errors:** Ensure `sslmode=require` in Supabase connection
5. **Health check failures:** Use HTTP connection test (port 8080), not API endpoint

**See:** [references/operations.md](references/operations.md) for complete troubleshooting guide.

## Resources

- **NocoDB Documentation:** https://nocodb.com/docs
- **NocoDB GitHub:** https://github.com/nocodb/nocodb
- **Supabase Documentation:** https://supabase.com/docs
