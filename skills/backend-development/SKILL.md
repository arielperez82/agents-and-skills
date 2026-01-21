---
name: backend-development
description: Build robust backend systems with modern technologies (Node.js, Python, Go, Rust), frameworks (NestJS, FastAPI, Django), databases (PostgreSQL, MongoDB, Redis), APIs (REST, GraphQL, gRPC), authentication (OAuth 2.1, JWT), testing strategies, security best practices (OWASP Top 10), performance optimization, scalability patterns (microservices, caching, sharding), DevOps practices (Docker, Kubernetes, CI/CD), and monitoring. Use when designing APIs, implementing authentication, optimizing database queries, setting up CI/CD pipelines, handling security vulnerabilities, building microservices, or developing production-ready backend systems.
license: MIT
version: 1.0.0
---

# Backend Development Skill

Production-ready backend development with modern technologies, best practices, and proven patterns.

## When to Use

- Designing RESTful, GraphQL, or gRPC APIs
- Building authentication/authorization systems
- Optimizing database queries and schemas
- Implementing caching and performance optimization
- OWASP Top 10 security mitigation
- Designing scalable microservices
- Testing strategies (unit, integration, E2E)
- CI/CD pipelines and deployment
- Monitoring and debugging production systems

## Technology Selection Guide

**Languages:** Node.js/TypeScript (full-stack), Python (data/ML), Go (concurrency), Rust (performance)
**Frameworks:** NestJS, FastAPI, Django, Express, Gin
**Databases:** PostgreSQL (ACID), MongoDB (flexible schema), Redis (caching)
**APIs:** REST (simple), GraphQL (flexible), gRPC (performance)

See: `references/backend-technologies.md` for detailed comparisons

## Reference Navigation

**Core Technologies:**
- `backend-technologies.md` - Languages, frameworks, databases, message queues, ORMs
- `backend-api-design.md` - REST, GraphQL, gRPC patterns and best practices

**Security & Authentication:**
- `backend-security.md` - OWASP Top 10 2025, security best practices, input validation
- `backend-authentication.md` - OAuth 2.1, JWT, RBAC, MFA, session management

**Performance & Architecture:**
- `backend-performance.md` - Caching, query optimization, load balancing, scaling
- `backend-architecture.md` - Microservices, event-driven, CQRS, saga patterns

**Quality & Operations:**
- `backend-testing.md` - Testing strategies, frameworks, tools, CI/CD testing
- `backend-code-quality.md` - SOLID principles, design patterns, clean code
- `backend-devops.md` - Docker, Kubernetes, deployment strategies, monitoring
- `backend-debugging.md` - Debugging strategies, profiling, logging, production debugging
- `backend-mindset.md` - Problem-solving, architectural thinking, collaboration

## Key Best Practices (2025)

**Security:** Argon2id passwords, parameterized queries (98% SQL injection reduction), OAuth 2.1 + PKCE, rate limiting, security headers

**Performance:** Redis caching (90% DB load reduction), database indexing (30% I/O reduction), CDN (50%+ latency cut), connection pooling

**Testing:** 70-20-10 pyramid (unit-integration-E2E), Vitest 50% faster than Jest, contract testing for microservices, 83% migrations fail without tests

**DevOps:** Blue-green/canary deployments, feature flags (90% fewer failures), Kubernetes 84% adoption, Prometheus/Grafana monitoring, OpenTelemetry tracing

## Quick Decision Matrix

| Need | Choose |
|------|--------|
| Fast development | Node.js + NestJS |
| Data/ML integration | Python + FastAPI |
| High concurrency | Go + Gin |
| Max performance | Rust + Axum |
| ACID transactions | PostgreSQL |
| Flexible schema | MongoDB |
| Caching | Redis |
| Internal services | gRPC |
| Public APIs | GraphQL/REST |
| Real-time events | Kafka |

## Implementation Checklist

**API:** Choose style → Design schema → Validate input → Add auth → Rate limiting → Documentation → Error handling

**Database:** Choose DB → Design schema → Create indexes → Connection pooling → Migration strategy → Backup/restore → Test performance

**For Supabase projects:** Use Supabase CLI for migrations (`supabase migration new`, `supabase db push`), test locally with `supabase start` and `supabase db reset`, always include GRANT statements in migrations. See `databases/references/supabase-migrations.md`.

**Security:** OWASP Top 10 → Parameterized queries → OAuth 2.1 + JWT → Security headers → Rate limiting → Input validation → Argon2id passwords

## Row Level Security (RLS) Patterns

**📘 For comprehensive RLS strategy, patterns, and decision framework, see: [`supabase/migrations/RLS_POLICY_STRATEGY.md`](../../supabase/migrations/RLS_POLICY_STRATEGY.md)**

### RLS Coverage Requirement

**CRITICAL: RLS must be enabled on all application tables (100% coverage)**

```sql
-- ✅ CORRECT - Enable RLS on application tables
ALTER TABLE entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread ENABLE ROW LEVEL SECURITY;
-- ... all application tables

-- ❌ WRONG - Missing RLS on application tables
-- Tables exposed without access control
```

### RLS Policy Patterns

**Common RLS policy patterns for application tables:**

```sql
-- Pattern 1: Users can only access their own data
CREATE POLICY "Users access own data" ON user_data
  FOR ALL USING (auth.uid()::text = user_id);

-- Pattern 2: Role-based access (admins + own data)
CREATE POLICY "Admin or own data" ON sensitive_table
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid()::text = owner_id
  );

-- Pattern 3: Public read, authenticated write
CREATE POLICY "Public read" ON public_data
  FOR SELECT USING (true);
  
CREATE POLICY "Authenticated write" ON public_data
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Pattern 4: System tables (service role only)
-- RLS enabled + no policies = service role only access
ALTER TABLE configuration ENABLE ROW LEVEL SECURITY;
-- No policies = blocks anon/authenticated, allows service role
```

### RLS Testing Pattern

**Test RLS enforcement for all operations:**

```typescript
// Test RLS blocks anon access
describe('RLS enforcement', () => {
  it('blocks anon client from reading', async () => {
    const { data } = await anonClient.from('entity').select('id').limit(1);
    expect(data).toEqual([]);
  });

  it('blocks anon client from writing', async () => {
    const { error } = await anonClient.from('entity').insert({ /* data */ });
    expect(error?.code).toBe('42501');
  });

  it('allows service role access', async () => {
    const { data, error } = await serviceClient.from('entity').select('id').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

### RLS Coverage Checklist

**Before production deployment, verify:**
- [ ] RLS enabled on all application tables (100% coverage)
- [ ] RLS policies defined and tested
- [ ] Security tests verify RLS enforcement for all operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] Service role access verified (where required)
- [ ] RLS policy strategy documented (see [`RLS_POLICY_STRATEGY.md`](../../supabase/migrations/RLS_POLICY_STRATEGY.md))

**Testing:** Unit 70% → Integration 20% → E2E 10% → Load tests → Migration tests → Contract tests (microservices)

**Deployment:** Docker → CI/CD → Blue-green/canary → Feature flags → Monitoring → Logging → Health checks

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OAuth 2.1: https://oauth.net/2.1/
- OpenTelemetry: https://opentelemetry.io/