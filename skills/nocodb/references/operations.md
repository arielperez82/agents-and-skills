# NocoDB Operations Guide

Backup automation, monitoring, error handling, and troubleshooting for NocoDB.

## Backup Automation

### Metadata DB Backup

**Backup Command:**

```bash
docker exec nocodb_metadata pg_dump -U nocodb nocodb_meta > backups/nocodb-metadata-$(date +%Y%m%d-%H%M%S).sql
```

**Backup Schedule:**

- Local dev: Manual
- Production: Daily at 2 AM (automated via cron or scheduled task)

**Retention Policy:**

- Keep last 7 days uncompressed (for fast restore)
- Delete older backups: `find backups/ -name "nocodb-metadata-*.sql" -mtime +7 -delete`
- Optional: Compress and archive to S3 if long-term retention needed

**Storage:**

- Local: `backups/` directory
- Production: AWS S3 or similar object storage

### View Configuration Backup

**NocoDB does not support view JSON export/import as of v0.255.0.**

**Backup Methods:**

1. **Metadata DB Backup (Includes Views):**
   - Full metadata DB backup includes all view configurations
   - Restore metadata DB to restore all views

2. **Documentation Fallback:**
   - Store view definitions as markdown checklists in `docs/nocodb-views/`
   - Manual recreation using markdown checklists

**See:** [references/views.md](references/views.md) for view backup procedures.

### Restore Process

**Metadata DB Restore:**

```bash
# Restore from backup
docker exec -i nocodb_metadata psql -U nocodb nocodb_meta < backups/nocodb-metadata-20260108.sql

# Restart NocoDB
docker-compose restart nocodb
```

**View Configuration Restore:**

- Option 1: Restore metadata DB from pg_dump (full restore, includes all views)
- Option 2: Manual recreation using markdown checklists from `docs/nocodb-views/`

## Monitoring

### Container Health Monitoring

**Health Check:**

```bash
# HTTP connection test (authoritative)
curl -f http://localhost:8080

# Check container status
docker ps | grep nocodb

# Check container logs
docker logs nocodb --tail 50
```

**Metadata DB Health:**

```bash
# Check metadata DB is ready
docker exec nocodb_metadata pg_isready -U nocodb

# Check active connections
docker exec nocodb_metadata psql -U nocodb -d nocodb_meta -c "SELECT count(*) FROM pg_stat_activity;"
```

### Resource Monitoring

**Container Stats:**

```bash
docker stats nocodb
# Monitor CPU, memory, network, disk I/O
```

**Alert Thresholds:**

- CPU: Alert if > 80% for 5 minutes
- Memory: Alert if > 90% for 5 minutes
- Disk: Alert if metadata volume > 80% full

### Connection Pool Monitoring

**Check Active Connections:**

```sql
SELECT count(*) FROM pg_stat_activity
WHERE datname = 'postgres'
AND usename = 'postgres.{PROJECT_REF}';
```

**Supabase Dashboard:**

- Database → Connection pooling (shows pool size and mode)
- Alert if connections > 80% of configured max
- Adjust pool size if connection exhaustion detected

### Log Aggregation

**Local Dev:**

```bash
# View container logs
docker logs nocodb

# Follow logs
docker logs -f nocodb
```

**Production:**

- Configure log driver (json-file, syslog, or cloud logging)
- Centralized logging (CloudWatch, Datadog, etc.)
- Log rotation and retention policies

## Error Handling

### Supabase Unavailability Testing

**Test Scenario 1: Connection Failure**

**Linux:**

```bash
# Resolve IP and block
SUPABASE_IP=$(getent hosts db.{PROJECT_REF}.supabase.co | awk '{print $1}')
sudo iptables -A OUTPUT -d $SUPABASE_IP -j DROP

# Cleanup
sudo iptables -D OUTPUT -d $SUPABASE_IP -j DROP
```

**macOS:**

```bash
# Block connection (requires pf enabled)
echo "block drop out quick to db.{PROJECT_REF}.supabase.co" | sudo pfctl -f -

# Cleanup
sudo pfctl -F all
```

**Windows:**

```bash
# Block connection
netsh advfirewall firewall add rule name="Block Supabase" dir=out action=block remoteip=db.{PROJECT_REF}.supabase.co

# Cleanup
netsh advfirewall firewall delete rule name="Block Supabase"
```

**Alternative (Portable):**

- Change host to `invalid.example.com` in NocoDB UI external DB config (simulates DNS failure)

**Expected Behavior:**

- NocoDB UI shows "Connection failed" error (sanitized, no credentials)
- NocoDB continues to function (can view existing views, but can't query data)
- Container logs show sanitized error (no credentials in logs)

**Test Scenario 2: Invalid Connection String**

- Change host to `invalid.example.com` in NocoDB UI
- Expected: Same sanitized error behavior

**Test Scenario 3: Metadata DB Unavailable**

```bash
# Stop metadata DB container
docker-compose stop nocodb_metadata

# Expected: NocoDB fails to start or shows error (metadata DB is critical)
```

### Error Message Documentation

**Document Error Messages for Common Scenarios:**

- Connection failures
- Authentication failures
- Query errors
- Schema introspection errors

**Verify Error Sanitization:**

- No credentials in error messages
- No connection strings in logs
- No stack traces with sensitive data

### Retry Behavior

**NocoDB Default Retry:**

- Document NocoDB's default retry behavior
- Connection retries on failure
- Query retries (if applicable)

**Custom Retry Logic:**

- Implement custom retry if needed
- Exponential backoff
- Maximum retry attempts

## Troubleshooting

### Common Issues

#### 1. Container Won't Start

**Symptoms:**

- Container exits immediately
- Container status shows "Exited"

**Diagnosis:**

```bash
# Check container logs
docker logs nocodb

# Check metadata DB health
docker exec nocodb_metadata pg_isready -U nocodb

# Verify NC_DB format
docker exec nocodb env | grep NC_DB
```

**Solutions:**

- Verify metadata DB health check passes
- Verify `NC_DB` connection string format matches NocoDB's expected `pg://` URI schema
- Check environment variables are set correctly
- Verify network connectivity between containers

#### 2. Can't Access UI

**Symptoms:**

- `curl http://localhost:8080` fails
- Browser shows connection refused

**Diagnosis:**

```bash
# Check port binding
docker port nocodb
# Should show: 127.0.0.1:8080->8080/tcp

# Check if port is listening
ss -lntp | grep 8080

# Test localhost access
curl http://127.0.0.1:8080
```

**Solutions:**

- Verify port binding: `docker port nocodb` (should show `127.0.0.1:8080`)
- Check firewall rules
- Verify container is running: `docker ps | grep nocodb`
- Check container logs for errors

#### 3. Workspace Doesn't Persist

**Symptoms:**

- Workspace disappears after container restart
- Can't create workspace

**Diagnosis:**

```bash
# Verify metadata DB volume
docker volume ls | grep nocodb_metadata_data

# Check metadata DB health
docker exec nocodb_metadata pg_isready -U nocodb

# Verify NC_DB format
docker exec nocodb env | grep NC_DB
```

**Solutions:**

- Verify metadata DB volume exists: `docker volume ls | grep nocodb_metadata_data`
- Check metadata DB health: `docker exec nocodb_metadata pg_isready -U nocodb`
- Verify `NC_DB` format is correct (matches NocoDB's expected `pg://` URI schema)
- Check metadata DB logs: `docker logs nocodb_metadata`

#### 4. Relationships Not Visible

**Symptoms:**

- Relationships don't appear in NocoDB UI
- Can't see linked records

**Diagnosis:**

```sql
-- Check if FK exists
SELECT * FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_name = 'thread';
```

**Solutions:**

- Verify Foreign Key constraints exist in Supabase schema
- Check connection mode is session (port 5432), not transaction (port 6543)
- Restart NocoDB to refresh schema introspection
- Verify `pg_catalog` access (requires session mode)

#### 5. Connection Pool Exhaustion

**Symptoms:**

- Connection errors
- Slow queries
- Timeouts

**Diagnosis:**

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity
WHERE datname = 'postgres'
AND usename = 'postgres.{PROJECT_REF}';
```

**Solutions:**

- Reduce NocoDB max connections (below 80% of pool size)
- Increase Supabase connection pool size
- Monitor connection usage patterns
- Check for connection leaks

#### 6. SSL Connection Errors

**Symptoms:**

- Connection fails with SSL error
- "SSL connection is required" error

**Diagnosis:**

```bash
# Test SSL connection
psql "${SUPABASE_CONNECTION_STRING}?sslmode=require" -c "SELECT 1"

# Test without SSL (should fail)
psql "${SUPABASE_CONNECTION_STRING}?sslmode=disable" -c "SELECT 1"
```

**Solutions:**

- Ensure `sslmode=require` in Supabase connection
- Verify Supabase enforces SSL (test with `sslmode=disable` should fail)
- Check SSL certificate validity

### Debugging Commands

**Container Inspection:**

```bash
# Inspect container
docker inspect nocodb

# Check environment variables
docker exec nocodb env

# Check network connectivity
docker exec nocodb ping -c 3 nocodb_metadata
```

**Database Inspection:**

```bash
# Connect to metadata DB
docker exec -it nocodb_metadata psql -U nocodb -d nocodb_meta

# List tables
\dt

# Check connections
SELECT * FROM pg_stat_activity;
```

**Log Analysis:**

```bash
# View recent logs
docker logs nocodb --tail 100

# Follow logs
docker logs -f nocodb

# Search logs
docker logs nocodb 2>&1 | grep -i error
```

## Production Deployment Considerations

### Container Orchestration

**Kubernetes:**

- Deployments with resource limits
- Health checks (liveness/readiness probes)
- ConfigMaps for configuration
- Secrets for credentials

**ECS/Fargate:**

- Task definitions with resource limits
- Health checks
- Secrets Manager integration
- Service discovery

### High Availability

**Metadata DB:**

- Use managed PostgreSQL (RDS, Cloud SQL)
- Enable automated backups
- Configure replication

**NocoDB:**

- Multiple instances behind load balancer
- Shared metadata DB
- Session affinity (if needed)

### Scaling

**Horizontal Scaling:**

- Multiple NocoDB instances
- Shared metadata DB
- Load balancer

**Vertical Scaling:**

- Increase container resources
- Monitor resource usage
- Adjust based on load

## References

- **NocoDB Documentation:** https://nocodb.com/docs
- **Docker Logging:** https://docs.docker.com/config/containers/logging/
- **PostgreSQL Backup:** https://www.postgresql.org/docs/current/backup.html
