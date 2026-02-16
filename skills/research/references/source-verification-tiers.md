# Source Verification Tiers

Reference material for the **research** skill. Defines source reliability tiers, cross-referencing methodology, confidence ratings, and citation standards.

## Source Reputation Tiers

Every source must be classified into a reputation tier before citation.

| Tier | Reputation Score | Examples | Verification Needed |
|------|-----------------|----------|-------------------|
| **High** | 1.0 | Academic (*.edu, arxiv.org, ieee.org), Official (*.gov, w3.org, ietf.org), Technical docs (developer.mozilla.org), Open source foundations (apache.org, cncf.io) | Standard citation |
| **Medium-High** | 0.8 | Industry leaders (martinfowler.com, stackoverflow.com, infoq.com, thoughtworks.com) | Cross-reference with 1+ high-tier source |
| **Medium** | 0.6 | Community platforms (medium.com from verified experts, dev.to, hashnode.com) | Author verification + 3-source cross-reference |
| **Excluded** | 0.0 | Unverified blogs (*.blogspot.com, wordpress.com), quora.com, pastebin.com | Reject. Log warning and find alternative |

### When a Source is Trustworthy

A source is trustworthy when it meets ALL of these criteria:

- Falls in High or Medium-High tier
- Publication date is within freshness thresholds (see below)
- Author or organization has verifiable expertise in the domain
- Content includes citations or references to primary sources
- No detectable commercial bias toward its own products

### When a Source is Suspect

Treat a source as suspect when ANY of these apply:

- Falls in Medium or Excluded tier without additional verification
- Author credentials cannot be verified
- Content makes strong claims without citations
- Source is selling a product or service related to the claim
- Content contradicts multiple high-tier sources without explanation
- Domain or publication has no editorial review process

## Independent Sources Requirement

Major claims require a **minimum of 3 independent sources** before they can be cited with high confidence.

### What Counts as Independent

- Different authors, publishers, or organizations
- Not citing each other as the sole basis for the claim
- Drawn from different source types (e.g., academic + official docs + industry leader)

### What Does NOT Count as Independent

- Source B cites Source A as its only evidence (they count as one source)
- Multiple articles from the same author on different platforms
- Aggregator sites that republish content without original analysis

## Cross-Referencing Methodology

1. **Identify the claim**: Extract the specific assertion to verify
2. **Find independent sources**: Locate 2+ additional sources that are not citing each other (avoid circular references)
3. **Verify independence**: Confirm sources have different authors, publishers, or organizations
4. **Compare claims**: Check if sources agree on substance (minor wording differences are acceptable)
5. **Document result**: Record cross-reference status per finding

### Cross-Reference Status Values

| Status | Definition |
|--------|-----------|
| **Cross-verified** | 3+ independent sources agree on the claim |
| **Partially verified** | 2 sources agree, or sources agree on substance but differ on details |
| **Single-source** | Only one source found; claim is plausible but unconfirmed |
| **Unverified** | No reliable source found; claim should not be cited as fact |
| **Contradicted** | Sources disagree; document both positions and assess which is more authoritative |

### Circular Reference Detection

- If Source B cites Source A, they count as one source, not two
- If multiple sources all reference a single original study, cite the original
- Use primary sources where possible over secondary interpretations
- Trace citation chains back to the originating research or documentation

## Confidence Ratings

Assign a confidence rating to every finding based on source quality and agreement.

| Rating | Criteria |
|--------|----------|
| **High** | 3+ high-reputation sources agree, no contradictions |
| **Medium** | 2+ sources agree, minor contradictions or some medium-trust sources |
| **Low** | Single source or significant contradictions among sources |

### Confidence Modifiers

Reduce confidence by one level when:

- Primary sources are older than the freshness threshold for the domain
- The claim is from a single organization that benefits commercially
- Cross-referencing found partial but not full agreement
- The topic is rapidly evolving and sources may already be outdated

Increase confidence when:

- An official specification or standard directly states the claim
- Multiple independent empirical studies confirm the finding
- The claim is about a stable, well-established concept (architecture patterns, language specifications)

## Source Freshness Rules

Source recency requirements vary by domain.

| Category | Maximum Age | Rationale |
|----------|------------|-----------|
| Security vulnerabilities | 6 months | Threat landscape evolves rapidly; older advisories may be patched |
| Framework versions | 1 year | APIs and best practices change with major releases |
| Cloud service documentation | 1 year | Cloud providers deprecate and launch services frequently |
| API references | 1 year | Breaking changes common in active projects |
| Architecture patterns | Evergreen | Core patterns (CQRS, event sourcing) are stable concepts |
| Methodology references | Evergreen | Foundational works (DDD, TDD, Agile Manifesto) remain relevant |
| Language specifications | Evergreen per version | Spec for a given version is permanent; check which version is current |
| Research papers | 3 years | Academic findings remain valid longer but check for follow-up work |
| Industry trend reports | 1 year | Technology Radar, State of DevOps -- only cite current edition |

### Handling Outdated Sources

When a source exceeds its freshness threshold:

1. Check if a newer version of the same source exists
2. If the core claim is about a stable concept (architecture, methodology), cite with a note: "[Published {year}; concept remains current]"
3. If the claim is time-sensitive (security, framework version), find a current source or document the age limitation in Knowledge Gaps
4. Never cite outdated security advisories as current threat intelligence

## Citation Format

Use numbered citations in research documents:

```
[1] {Author/Organization}. "{Title}". {Publication/Website}. {Date}. {Full URL}. Accessed {YYYY-MM-DD}.
```

### Required Metadata Per Source

- Source URL
- Domain
- Access date
- Reputation tier and score (from tier table)
- Verification status (cross-verified / partially verified / single-source / unverified)

### Paywalled or Restricted Sources

- Mark clearly with "[Paywalled]" or "[Restricted Access]"
- Provide the URL for reference
- Find an open-access alternative when possible (preprints, author copies)
- Note access limitations in Knowledge Gaps section

## Domain Authority Quick Reference

### High-Authority Domains by Category

**Standards Bodies**: ietf.org, w3.org, iso.org, ecma-international.org, unicode.org

**Security**: owasp.org, nist.gov, cve.mitre.org, nvd.nist.gov, cisa.gov

**Cloud Platforms**: docs.aws.amazon.com, cloud.google.com/docs, learn.microsoft.com

**Languages and Frameworks**: typescriptlang.org, docs.python.org, go.dev/doc, rust-lang.org, developer.mozilla.org

**Architecture**: martinfowler.com, microservices.io, c2.com/wiki

**DevOps and SRE**: sre.google, 12factor.net, dora.dev, kubernetes.io/docs

**Databases**: postgresql.org/docs, redis.io/docs, dev.mysql.com/doc

## Source Analysis Table Template

Include this table in every research document to track source quality.

```markdown
| Source | Domain | Reputation | Type | Access Date | Verification |
|--------|--------|------------|------|-------------|--------------|
| {name} | {domain} | {High/Medium-High/Medium} | {academic/official/industry/technical} | {YYYY-MM-DD} | {Cross-verified/Partially verified/Single-source} |

**Reputation Summary**:
- High reputation sources: {count} ({percentage}%)
- Medium-high reputation: {count} ({percentage}%)
- Average reputation score: {0.0-1.0}
```
