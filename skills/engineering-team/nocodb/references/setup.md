# NocoDB Setup Guide

Docker Compose configuration, environment variables, and health checks for NocoDB local development.

## Docker Compose Configuration

### Complete docker-compose.yml

```yaml
version: '3.8'

services:
  nocodb_metadata:
    image: postgres:15-alpine
    container_name: nocodb_metadata
    environment:
      POSTGRES_USER: nocodb
      POSTGRES_DB: nocodb_meta
      POSTGRES_PASSWORD: ${NOCODB_METADATA_PASSWORD}
    volumes:
      - nocodb_metadata_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U nocodb']
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - nocodb_network

  nocodb:
    image: nocodb/nocodb:0.255.0
    container_name: nocodb
    ports:
      - '127.0.0.1:8080:8080'
    environment:
      NC_DB: 'pg://nocodb_metadata:5432?u=nocodb&p=${NOCODB_METADATA_PASSWORD}&d=nocodb_meta'
      NC_ADMIN_EMAIL: ${NC_ADMIN_EMAIL}
      NC_ADMIN_PASSWORD: ${NC_ADMIN_PASSWORD}
      NC_AUTH_JWT_SECRET: ${NC_AUTH_JWT_SECRET}
    depends_on:
      nocodb_metadata:
        condition: service_healthy
    healthcheck:
      test: ['CMD-SHELL', 'curl -f http://localhost:8080 || exit 1']
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - nocodb_network

volumes:
  nocodb_metadata_data:
    name: nocodb_metadata_data

networks:
  nocodb_network:
    driver: bridge
```

### Key Configuration Points

**NC_DB Connection String:**

- Format: `pg://nocodb_metadata:5432?u=nocodb&p=${NOCODB_METADATA_PASSWORD}&d=nocodb_meta`
- **Validation:** Format must match NocoDB's expected `pg://` URI schema (see NocoDB documentation)
- Common footgun if format is incorrect

**Port Binding:**

- Bind to `127.0.0.1:8080` (localhost only, not `0.0.0.0`)
- Network isolation for security

**Health Checks:**

- Metadata DB: `pg_isready` check
- NocoDB: HTTP connection test on port 8080 (authoritative method)
- **Note:** NocoDB `/api/v1/health` endpoint is inconsistent across versions - use HTTP check

**Resource Limits:**

- **Note:** Compose v3 `deploy.resources` limits are ignored in local docker-compose (Swarm-only)
- Document expected limits (CPU `1.0`, memory `1G`) but verify via `docker stats`
- Production: Use proper orchestration (ECS, Kubernetes) where resource limits are enforced

## Environment Variables

### .env.example

```bash
# NocoDB Metadata DB
NOCODB_METADATA_PASSWORD=changeme_metadata_password

# NocoDB Admin
NC_ADMIN_EMAIL=admin@trival.local
NC_ADMIN_PASSWORD=changeme123
NC_AUTH_JWT_SECRET=changeme_jwt_secret

# Supabase Connection (for external data source)
SUPABASE_PROJECT_REF=your_project_ref
SUPABASE_DB_HOST=db.${SUPABASE_PROJECT_REF}.supabase.co
SUPABASE_DB_USER=postgres.${SUPABASE_PROJECT_REF}
SUPABASE_DB_NAME=postgres
SUPABASE_DB_PORT=5432
SUPABASE_SSLMODE=require
SUPABASE_DB_PASSWORD=your_supabase_db_password
```

### Environment Variable Details

**NOCODB_METADATA_PASSWORD:**

- Password for local metadata PostgreSQL container
- Generate strong password: `openssl rand -base64 32`

**NC_ADMIN_EMAIL:**

- Admin user email for NocoDB login
- Example: `admin@trival.local`

**NC_ADMIN_PASSWORD:**

- Admin user password (MUST change in production)
- Default: `changeme123` (for local dev only)

**NC_AUTH_JWT_SECRET:**

- JWT secret for authentication
- Generate: `openssl rand -hex 32`

**SUPABASE_DB_PASSWORD:**

- **Critical:** This is the actual PostgreSQL database password
- NOT `SUPABASE_SERVICE_ROLE_KEY` (which is a JWT API key)
- Find in Supabase dashboard: Settings → Database → Database password

**SUPABASE_DB_HOST:**

- Direct connection: `db.${SUPABASE_PROJECT_REF}.supabase.co`
- Session pooler: `aws-0-${REGION}.pooler.supabase.com` (if IPv6 unavailable)

**SUPABASE_DB_PORT:**

- `5432` for direct connection or session pooler
- `6543` for transaction pooler (NOT recommended for NocoDB)

## Setup Steps

### 1. Create .env File

```bash
cp .env.example .env
# Edit .env with your values
```

**Generate Secrets:**

```bash
# Generate metadata DB password
openssl rand -base64 32

# Generate JWT secret
openssl rand -hex 32
```

### 2. Start Containers

```bash
docker-compose up -d
```

**Verify Containers:**

```bash
docker-compose ps
# Both nocodb and nocodb_metadata should be "Up (healthy)"
```

### 3. Verify Metadata DB Connectivity

```bash
# Check metadata DB is ready
docker exec nocodb_metadata pg_isready -U nocodb

# Check NocoDB logs for connection errors
docker logs nocodb
```

### 4. Access NocoDB UI

```bash
open http://localhost:8080
# Or: curl http://localhost:8080
```

**Login:**

- Email: `NC_ADMIN_EMAIL` from `.env`
- Password: `NC_ADMIN_PASSWORD` from `.env`

### 5. Verify NC_DB Format

**Smoke Test:**

1. Create workspace in NocoDB UI (proves metadata writes are working)
2. Restart NocoDB: `docker-compose restart nocodb`
3. Verify workspace persists across restart (proves NC_DB connection string format is correct)

## Health Checks

### Container Health Check

**Primary Method (Authoritative):**

```bash
# HTTP connection test on port 8080
curl -f http://localhost:8080
# Should return 200 OK on login page
```

**Configure in docker-compose:**

```yaml
healthcheck:
  test: ['CMD-SHELL', 'curl -f http://localhost:8080 || exit 1']
  interval: 30s
  timeout: 10s
  retries: 3
```

**Optional (Best-Effort, Version-Dependent):**

```bash
# If NocoDB v0.255.0+ exposes /api/v1/health endpoint
curl -f http://localhost:8080/api/v1/health
```

**Note:** Health endpoint existence/behavior is inconsistent across NocoDB versions. Do not rely on API health endpoint for validation; use container HTTP check as authoritative.

### Metadata DB Health Check

```bash
# Check metadata DB is ready
docker exec nocodb_metadata pg_isready -U nocodb

# Check active connections
docker exec nocodb_metadata psql -U nocodb -d nocodb_meta -c "SELECT count(*) FROM pg_stat_activity;"
```

## Container Security

### Non-Root User Policy

**Local Dev (Option A - Recommended):**

- Allow root user for local development
- Document that production requires custom image or upstream fix
- Upstream image may not support non-root

**Production (Option B - Enforce):**

- Enforce `user:` in docker-compose
- Document volume permission steps required
- Verify file permissions/volume ownership

**Check Current User:**

```bash
docker exec nocodb id
# Verify UID != 0 (if enforcing non-root)
```

### Network Isolation

**Verify Port Binding:**

```bash
# Check port binding
docker port nocodb
# Should show: 127.0.0.1:8080->8080/tcp

# Or use ss
ss -lntp | grep 8080
# Should show: 127.0.0.1:8080
```

**Test Localhost Access:**

```bash
curl http://127.0.0.1:8080
# Should succeed
```

**Test Remote Access (Should Fail):**

```bash
# From another host on LAN
nc -zv <host-ip> 8080
# Should fail (port not exposed to network)
```

**Note:** `curl http://0.0.0.0:8080` is not a valid remote access test (0.0.0.0 is a bind address, not routable).

### Resource Limits

**Check Actual Usage:**

```bash
docker stats nocodb
# Monitor CPU/memory usage
```

**Document Observed Usage:**

- CPU: Typically < 1.0 cores
- Memory: Typically < 1G
- Document patterns for capacity planning

**Note:** Compose v3 `deploy.resources` limits are not enforced in local docker-compose (Swarm-only). Document expected limits but verify via `docker stats`.

## Image Vulnerability Scanning

### Trivy Scan

```bash
# Scan NocoDB image
trivy image nocodb/nocodb:0.255.0

# Save results
trivy image nocodb/nocodb:0.255.0 > docs/security/nocodb-image-scan-$(date +%Y%m%d).txt
```

**Acceptance Criteria:**

- No CRITICAL vulnerabilities (blocking)
- All HIGH vulnerabilities reviewed and documented
- If critical CVEs found: Document mitigation plan or use alternative image version

**Scan Frequency:**

- Initial setup: Run on first deployment
- Re-scan: Weekly for production images (automated in CI/CD)
- Before version upgrades: Always scan new image version
- When new CVEs announced: Subscribe to NocoDB security advisories, re-scan immediately

### Security Headers

**Check Response Headers:**

```bash
curl -I http://localhost:8080
```

**Note:** CSP/HSTS/X-Frame-Options are typically enforced at reverse proxy/ingress layer in production, not by app container in local mode. Document observed headers (informational for local dev).

**Production Requirement:** Configure security headers at ingress/reverse proxy (nginx, Cloudflare, AWS ALB).

## Validation Checklist

Before proceeding to external data source setup:

- [ ] `docker-compose config` validates successfully
- [ ] Both containers healthy (metadata DB health check passes)
- [ ] NocoDB web UI accessible at `http://localhost:8080`
- [ ] Can login with `NC_ADMIN_EMAIL` and `NC_ADMIN_PASSWORD`
- [ ] Can create workspace in NocoDB UI (metadata writes working)
- [ ] Workspace persists across container restart (NC_DB format correct)
- [ ] Container security verified (user, network isolation)
- [ ] Image vulnerabilities scanned (no CRITICAL CVEs)
- [ ] Resource usage documented (CPU, memory)

## Troubleshooting

**Container won't start:**

- Check metadata DB health check passes
- Verify `NC_DB` connection string format matches NocoDB's expected `pg://` URI schema
- Check container logs: `docker logs nocodb`

**Can't access UI:**

- Verify port binding: `docker port nocodb` (should show `127.0.0.1:8080`)
- Test localhost: `curl http://127.0.0.1:8080`
- Check firewall rules

**Workspace doesn't persist:**

- Verify metadata DB volume: `docker volume ls | grep nocodb_metadata_data`
- Check metadata DB health: `docker exec nocodb_metadata pg_isready -U nocodb`
- Verify `NC_DB` format is correct

## References

- **NocoDB Documentation:** https://nocodb.com/docs/tags/getting-started
- **Docker Compose:** https://docs.docker.com/compose/
- **Trivy:** https://aquasecurity.github.io/trivy/
