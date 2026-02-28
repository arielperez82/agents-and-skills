---
type: assessment
endeavor: repo
initiative: I22-SFMC
initiative_name: skill-frontmatter-compliance
topic: strategic-value-prioritization
created: 2026-02-28
updated: 2026-02-28
---

# Strategic Assessment: I22-SFMC (Skill Frontmatter API Compliance)

**Verdict:** GO — High-priority blocker for I07-SDCA. Proceed with execution.

---

## 1. Strategic Alignment

**OKR Contribution:**

I22-SFMC directly unblocks I07-SDCA (Skills Deploy Claude API), which is itself a strategic initiative listed in the roadmap's "Done" section as complete. However, I07-SDCA cannot successfully upload skills without API-compliant frontmatter.

**Current state:**
- 179 skills exist in the repo
- I07-SDCA is marked "done" (deployment infrastructure is built) but cannot be fully realized
- **62 skills (35%) fail quick_validate.py** due to non-standard frontmatter keys (title, domain, subdomain, difficulty, etc.)
- These 62 skills cannot be uploaded to Claude API in their current form

**Strategic consequence:**
Skills are a primary distribution channel for this org's methodology and frameworks. The ability to upload them to Claude API represents:
- **Market accessibility:** Make skills discoverable to Claude API users and Claude.ai subscribers
- **Product offering:** Upstream product (Claude) can surface these skills to millions of users
- **Competitive moat:** Rich, documented skills differentiate vs. competitors; API availability amplifies reach

**Blockers removed by I22-SFMC:**
- ✅ Enables I07-SDCA to deploy all 179 skills (currently only ~117 can upload)
- ✅ Unblocks telemetry and skill-catalog integrations that assume 5-key allowlist (e.g., telemetry hooks, packaging tools)
- ✅ Prevents future regressions (enforce compliance for new skills at creation time via skill-creator)

**Alignment with repo strategy:**
- Established in `.docs/AGENTS.md` and roadmap as key infrastructure capability
- Prerequisite for "Skills as Product" narrative (can't be product if it doesn't upload)
- One of the last Phase 0 completeness items for the skill ecosystem

---

## 2. Value vs. Effort

**Value: HIGH**

| Dimension | Impact | Rationale |
|-----------|--------|-----------|
| Market reach | 3x multiplier | 179 skills → Claude API → millions of Claude users (vs. thousands in Claude Code) |
| Product completeness | Enables full cycle | Skills authored → validated → uploaded → discoverable |
| Technical debt reduction | Eliminates forever-compliance debt | Enforcing compliance at creation + validation prevents recurring rework |
| Cross-team blockers | Unblocks 2+ other initiatives | Telemetry analysis, skill packaging, deployment workflows depend on 5-key compliance |

**Effort: MEDIUM (4-5 days)**

| Task | Effort | Rationale |
|------|--------|-----------|
| B1: Document metadata schema | S (small) | Schema already defined in charter; doc is reference material |
| B2: Write migration script + tests | M (medium) | Core mechanical work; requires YAML parsing, idempotency logic, testing |
| B3: Update quick_validate.py | S (small) | Already has error/warn structure; add checks for non-standard keys |
| B4: Run migration on 62 skills | M (medium) | Script is automated; git diff review is manual but parallelizable |
| B5: Update skill-creator | S (small) | Template modification only; minimal changes |
| B6: Update skill-validator docs | S (small) | Documentation update |
| B7: Audit consumers | S (small) | Code search; typically 2-3 places read skill frontmatter |
| B8: Full validation | S (small) | Run validator, count passes |

**Total effort:** ~40-50 engineering hours (5 person-days assuming parallel work). Charter parallelization strategy reduces wall-clock time to 2-3 days (Wave 0 sequential; Waves 1-3 parallel; Wave 4 gate).

**Value/effort ratio:** Very high. 179 skills unlocked for ~50 hours = 3.6 skills per hour of investment.

---

## 3. Alternative Approaches

**Option A (Chosen):** Migrate frontmatter to 5-key allowlist, move extended fields under `metadata` (IN CHARTER)
- ✅ Preserves all extended data (no information loss)
- ✅ Compliant with Claude API spec
- ✅ Enables idempotent script (running on already-compliant skills is a no-op)
- ✅ Documented in charter; minimal ambiguity
- ⚠️ Requires script + validator changes + full catalog migration

**Option B:** Strip extended fields, keep only name + description
- ✅ Simple; manual edits not required
- ❌ Loses ~30 metadata fields per skill (domain, difficulty, tech-stack, etc.)
- ❌ Breaks skill-catalog display, cross-referencing, and filtering
- ❌ Permanent loss; no path to recovery
- ❌ Violates AGENTS.md L7b (methodology skills require rich metadata)

**Option C:** Dual-schema support; accept both 5-key and extended keys in validator
- ✅ No migration needed; skills work as-is
- ❌ Blocks Claude API upload indefinitely
- ❌ Validates against inconsistent schema; confuses tooling
- ❌ Delays the compliance problem; creates technical debt
- ❌ Violates API spec; any tool consuming from API gets 5-key only

**Option D:** Upgrade Claude API allowlist (wait for future API changes)
- ❌ Out of scope; API is external product
- ❌ No timeline; could be 6+ months
- ❌ Skills stuck in purgatory; rework required later if/when spec changes

**Decision:** Option A is correct. Alternatives defer the problem (B, C, D) or lose data (B). Option A is also the only approach that preserves the catalog's semantic richness while complying with the API spec.

---

## 4. Opportunity Cost

**What we're NOT doing if we proceed:**

| Alternative | Status | Notes |
|-------------|--------|-------|
| I21-PIPS (Prompt Injection Protection) | Active (Now) | Unaffected; I22 does not contend for resources |
| Bug fixes or feature work | Deferred | 5 days of engineering capacity |
| Telemetry analysis (I05-ATEL follow-on) | Unblocked | I22 actually unblocks telemetry work; no cost |
| Skill content updates | Unblocked | After I22 migrates, new skills are compliant from creation |

**Net opportunity cost:** LOW. I22 is blocking cleanup work, not novel feature work. Proceeding unblocks downstream work (telemetry, API uploads, new skills) that would otherwise be reworked.

---

## 5. Go/No-Go Recommendation

### RECOMMENDATION: GO (Proceed immediately)

**Criteria met:**
- ✅ **Strategic:** Unblocks I07-SDCA (Skills Deploy API), enables market reach
- ✅ **Value:** High (3.6 skills/hour); unblocks 2+ follow-on initiatives
- ✅ **Effort:** Reasonable (40-50 hours, 2-3 days wall-clock time with parallelization)
- ✅ **Risk:** Low (mechanical migration, idempotent script, reversible with git history)
- ✅ **Timing:** I21-PIPS is active (Now); I22 fits in Next slot; no contention
- ✅ **Precedent:** Similar mechanical migrations (I01-ACM artifact-conventions) completed successfully

**Conditions:**
1. **Execute with Wave-based parallelization** (Waves 0→1→2→3→4 per charter). Full suite can complete in 2-3 days.
2. **Enforce script validation before merge.** All 179 skills must pass `quick_validate.py` exit 0 before I22 is marked complete.
3. **Audit frontmatter consumers** (B7 outcome) to ensure telemetry hooks, packaging tools, etc. don't break.
4. **Update skill-creator template immediately** (B5) so new skills are compliant from creation — prevents regression.

**Expected outcome:**
- All 179 skills API-compliant
- I07-SDCA can deploy to Claude API without manual remediation per skill
- Telemetry and skill-catalog integrations work reliably
- No future skill creation requires migration

**Post-completion signal:**
- Run: `find skills -name SKILL.md | xargs -I {} python quick_validate.py {} 2>&1 | grep -c "exit 0"`
- Expected: `179` (all pass)

---

## Why Now?

1. **I07-SDCA is done but unfulfilled.** The deployment infrastructure is built but can't deploy 62/179 skills. I22 completes the cycle.
2. **Prevents compound rework.** If new skills are created with extended keys before I22 runs, they'll need migration too. Fixing skill-creator in parallel (B5) stops the bleeding.
3. **Low risk window.** No active feature work contending. I21-PIPS can run in parallel without contention.
4. **Foundation for future.** Once API upload works, follow-on work (skill discovery, analytics, ratings) becomes unblocked.

---

## Summary

I22-SFMC is a **high-priority blocker** disguised as a mechanical migration. It unblocks I07-SDCA, enables market reach, and costs ~50 engineering hours for 179 skills' worth of delivery. Proceed immediately using the charter's Wave-based parallelization strategy.

**Next step:** Slot I22-SFMC into Now (or promote from Next) on roadmap-repo.md; dispatch Wave 0 (B1 metadata schema documentation) this week.
