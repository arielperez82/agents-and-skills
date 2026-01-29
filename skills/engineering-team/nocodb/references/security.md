# NocoDB Security Guide

RLS bypass implications, image scanning, audit logging, and error sanitization for NocoDB.

## RLS Bypass Security Risk

### The Problem

NocoDB connects as a **privileged PostgreSQL role** (`postgres.{PROJECT_REF}`), which bypasses application-layer RLS (Row Level Security) expectations.

**Security Implications:**

- NocoDB can read/write ALL data in Supabase (no row-level restrictions)
- RLS policies are bypassed at the PostgreSQL level
- All NocoDB operations must be logged for audit trail

**Critical Distinction:**

- This is about PostgreSQL role privileges, NOT Supabase service role API key
- `SUPABASE_SERVICE_ROLE_KEY` is for Supabase API calls, not PostgreSQL authentication
- `SUPABASE_DB_PASSWORD` is the actual PostgreSQL database password

### Mitigation Strategies

#### 1. IP Allowlist (Production)

Limit NocoDB access to specific IP ranges:

**AWS WAF:**

- Configure IP allowlist rules
- Only allow NocoDB server IPs

**Supabase IP Allowlist:**

- Supabase dashboard → Settings → Database → IP allowlist
- Add NocoDB server IP addresses

#### 2. Dedicated PostgreSQL Role (Future Enhancement)

Create a dedicated `nocodb_user` PostgreSQL role with limited permissions:

```sql
-- Create dedicated role
CREATE ROLE nocodb_user WITH LOGIN PASSWORD 'secure_password';

-- Grant read-only access to specific tables
GRANT SELECT ON entity, contact, thread TO nocodb_user;

-- Or grant read-write with restrictions
GRANT SELECT, INSERT, UPDATE ON entity, contact, thread TO nocodb_user;
```

**When to Implement:**

- When RLS policies are added to application tables (Phase 2)
- Evaluate if NocoDB should use restricted role instead of service role
- Consider read-only access if write access not required

#### 3. Audit Logging

Log all NocoDB operations for security compliance:

**PostgreSQL Audit Logging:**

```sql
-- Enable pgAudit extension
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Configure audit logging
ALTER SYSTEM SET pgaudit.log = 'all';
ALTER SYSTEM SET pgaudit.log_catalog = off;
SELECT pg_reload_conf();
```

**Application-Level Logging:**

- Log all NocoDB authentication events
- Log data access patterns
- Monitor for unusual access patterns

#### 4. Network Isolation

Restrict NocoDB network access in production:

- Use private networks (VPC, VPN)
- Restrict outbound connections
- Use reverse proxy with authentication

### When RLS Policies Are Added (Phase 2)

**Evaluation Checklist:**

- [ ] Should NocoDB use a restricted role instead of service role?
- [ ] Can NocoDB operate with read-only access?
- [ ] What tables/columns does NocoDB need access to?
- [ ] How will RLS policies affect NocoDB's functionality?
- [ ] Document RLS bypass implications in security documentation

## Image Vulnerability Scanning

### Trivy Scanning

**Scan NocoDB Image:**

```bash
# Basic scan
trivy image nocodb/nocodb:0.255.0

# Save results
trivy image nocodb/nocodb:0.255.0 > docs/security/nocodb-image-scan-$(date +%Y%m%d).txt

# JSON output for automation
trivy image --format json nocodb/nocodb:0.255.0 > scan-results.json
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

### Vulnerability Response

**If Critical CVEs Found:**

1. Document mitigation plan
2. Consider alternative image version
3. Check NocoDB security advisories
4. Update to patched version if available

**If High CVEs Found:**

1. Review and document risk
2. Assess exploitability in your environment
3. Plan remediation timeline
4. Monitor for patches

## Error Message Sanitization

### The Risk

Error messages may leak sensitive information:

- Connection strings with passwords
- Stack traces with internal details
- Database schema information
- Credential hints

### Testing Error Scenarios

**Test Connection Failure:**

```bash
# Simulate connection failure
# Change host to invalid.example.com in NocoDB UI external DB config

# Expected: Sanitized error message
# - No credentials in error message
# - No connection strings in logs
# - Generic error: "Connection failed"
```

**Test Authentication Failure:**

```bash
# Use invalid credentials in NocoDB UI

# Expected: Sanitized error message
# - No password hints in error
# - Generic error: "Authentication failed"
```

**Verify Error Messages:**

- Check NocoDB UI error messages (no credentials)
- Check container logs (no connection strings)
- Check application logs (no stack traces with sensitive data)

### Best Practices

1. **Sanitize All Error Messages:**
   - Remove connection strings
   - Remove credentials
   - Remove stack traces in production

2. **Log Separately:**
   - Log detailed errors to secure log storage
   - Show generic errors to users

3. **Test Error Scenarios:**
   - Test connection failures
   - Test authentication failures
   - Verify error messages are sanitized

## Audit Logging

### Authentication Events

Log all NocoDB authentication events:

**Events to Log:**

- Login attempts (success and failure)
- Logout events
- Password changes
- Admin actions

**Log Format:**

```json
{
  "timestamp": "2026-01-08T12:00:00Z",
  "event": "login",
  "user": "admin@trival.local",
  "ip": "127.0.0.1",
  "success": true
}
```

### Data Access Patterns

Log NocoDB data access patterns:

**Events to Log:**

- Table access (read/write)
- View access
- Query patterns
- Unusual access patterns

**Monitoring:**

- Alert on unusual access patterns
- Monitor for privilege escalation attempts
- Track data export activities

### PostgreSQL Audit Logging

**Enable pgAudit:**

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Configure audit logging
ALTER SYSTEM SET pgaudit.log = 'all';
ALTER SYSTEM SET pgaudit.log_catalog = off;
SELECT pg_reload_conf();
```

**Audit Log Location:**

- Check PostgreSQL logs for audit entries
- Configure log rotation
- Archive logs for compliance

## Container Security

### Non-Root User

**Local Dev:**

- Allow root user for local development
- Document that production requires custom image or upstream fix
- Upstream image may not support non-root

**Production:**

- Enforce `user:` in docker-compose or Kubernetes
- Document volume permission steps required
- Verify file permissions/volume ownership

**Check Current User:**

```bash
docker exec nocodb id
# Verify UID != 0 (if enforcing non-root)
```

### Resource Limits

**Document Expected Limits:**

- CPU: `1.0` cores
- Memory: `1G`
- Verify via `docker stats nocodb`

**Production Enforcement:**

- Use proper orchestration (ECS, Kubernetes) where resource limits are enforced
- Set resource requests and limits
- Monitor resource usage

### Network Security

**Port Binding:**

- Bind to `127.0.0.1:8080` (localhost only, not `0.0.0.0`)
- Network isolation for security

**Verify Isolation:**

```bash
# Check port binding
docker port nocodb
# Should show: 127.0.0.1:8080->8080/tcp

# Test remote access (should fail)
nc -zv <host-ip> 8080
```

## Secrets Management

### Environment Variables

**Never:**

- Hardcode credentials in docker-compose.yml
- Commit credentials to version control
- Log connection strings with passwords

**Always:**

- Use environment variables for all credentials
- Verify `.env` is in `.gitignore`
- Use proper secrets management in production (AWS Secrets Manager, etc.)

### Production Secrets

**AWS Secrets Manager:**

```bash
# Store secrets
aws secretsmanager create-secret \
  --name nocodb/metadata-password \
  --secret-string "changeme"

# Retrieve in application
aws secretsmanager get-secret-value \
  --secret-id nocodb/metadata-password
```

**Kubernetes Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nocodb-secrets
type: Opaque
stringData:
  NC_ADMIN_PASSWORD: changeme
  NC_AUTH_JWT_SECRET: changeme
```

## Security Headers

### Local Development

**Check Response Headers:**

```bash
curl -I http://localhost:8080
```

**Note:** CSP/HSTS/X-Frame-Options are typically enforced at reverse proxy/ingress layer in production, not by app container in local mode.

### Production

**Configure at Reverse Proxy/Ingress:**

- Nginx: Add security headers
- Cloudflare: Enable security headers
- AWS ALB: Configure security headers

**Required Headers:**

- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`

## Security Audit Checklist

Create `docs/security/nocodb-security-checklist.md`:

- [ ] Authentication & Authorization
  - [ ] Default password changed
  - [ ] JWT secret generated
  - [ ] Admin access restricted
- [ ] Input Validation
  - [ ] SQL injection testing results documented
  - [ ] XSS testing results documented
- [ ] Network Security
  - [ ] Port binding verified (localhost only)
  - [ ] Reverse proxy configured (production)
  - [ ] WAF configured (production)
- [ ] Audit Logging
  - [ ] Authentication events logged
  - [ ] Data access patterns logged
- [ ] TLS/SSL
  - [ ] Supabase connection `sslmode=require`
  - [ ] HTTPS only in production
- [ ] Container Security
  - [ ] Non-root user (production)
  - [ ] Image vulnerabilities scanned
  - [ ] Resource limits configured
- [ ] Secrets Management
  - [ ] No credentials in logs
  - [ ] Production secrets manager configured

## References

- **NocoDB Security:** https://nocodb.com/docs
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Trivy Documentation:** https://aquasecurity.github.io/trivy/
