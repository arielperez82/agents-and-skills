# Strategic Assessment: I32-ASEC Artifact Security Analysis

**Date:** 2026-03-06
**Assessor:** product-director
**Charter:** `.docs/canonical/charters/charter-repo-I32-ASEC-artifact-security-analysis.md`
**Status:** Draft charter under evaluation

---

## 1. Strategic Alignment

**Verdict: STRONG alignment with repo trajectory.**

This repo has invested heavily in agent/skill/command infrastructure (84 agents, 60+ skills, 30+ commands) and has a clear pattern of building tooling that validates, secures, and governs that infrastructure. The security investment arc is visible:

| Initiative | What it built | Gap it addressed |
|---|---|---|
| I21-PIPS | Prompt injection content scanner | Markdown-level injection in agent/skill files |
| I24-PRFX2 | PIPS hardening (ReDoS, redact, base-dir) | Scanner robustness |
| I09-SHSL | ShellCheck in pre-commit/CI | Shell syntax errors |
| Cisco intake | skill-scanner in `/skill/intake` | Deep package-level auditing for external skills |

I32-ASEC addresses the **behavioral and structural security layer** -- the gap between content scanning (PIPS) and deep package auditing (Cisco). This is the natural next step in the security maturity model. The three tools (alignment checker, taint checker, scanner wrapper) are genuinely complementary, not redundant.

**Key alignment points:**
- Directly operationalizes the security-checklist.md (category 4: shell execution risks)
- Extends existing validators (agent-validator, skill-validator) rather than creating parallel tooling
- Follows the repo's established pattern: CLI tool with glob input, JSON output, lint-staged + CI integration
- Addresses a real attack surface: 57 shell scripts in the repo, none analyzed for taint flows

## 2. Value vs. Effort

**Verdict: HIGH value, MODERATE effort. Favorable ratio but scope needs trimming.**

### Value Assessment

| Component | Value | Rationale |
|---|---|---|
| `artifact-alignment-checker` (core: description-vs-tools) | HIGH | Catches the simplest and most common misalignment -- a "read-only" agent with write tools. Immediate, actionable findings across 84 agents. |
| `artifact-alignment-checker` (overlap detection) | MEDIUM | Useful for catalog hygiene but routing is driven by the orchestrating agent, not by description uniqueness. Nice-to-have, not safety-critical. |
| `artifact-alignment-checker` (trust chains) | LOW-MEDIUM | Interesting graph but agents don't have runtime privileges -- they are prompts, not executables. Transitive "tool access" is a prompt-level concept, not a capability grant. The trust chain is only meaningful if agents are auto-dispatched without human review. |
| `bash-taint-checker` | HIGH | 57 shell scripts, zero taint analysis today. ShellCheck catches syntax bugs, not security bugs. Regex-based taint tracking is imprecise but better than nothing. |
| `skill-scanner-wrapper` | MEDIUM | Convenience wrapper. The Cisco scanner is used in intake only (not frequent). Glob expansion and aggregation are nice but not high-impact. |
| Pre-commit/CI integration | HIGH | Force-multiplier for all tools above. Without it, tools gather dust. |

### Effort Assessment

The charter estimates 5 waves. Realistic effort:
- **Wave 1 (walking skeleton):** 1 session. Bash script, frontmatter parsing, lint-staged. Straightforward.
- **Wave 2 (taint checker):** 1-2 sessions. Regex-based source/sink tracking in bash. The hard part is false positive tuning.
- **Wave 3 (full alignment):** 2-3 sessions. Overlap detection (Jaccard), analyzability scoring (grep for eval/exec), trust chain mapping (graph traversal across YAML). This is where complexity hides.
- **Wave 4 (scanner wrapper):** 1 session. Thin shell wrapper. Local LLM routing adds complexity.
- **Wave 5 (integration):** 1-2 sessions. Validator modifications, CI updates, agent updates.

**Total: 6-9 sessions.** This is a medium-sized initiative. The value/effort ratio is favorable for Waves 1, 2, and 5 (high value, low effort). Wave 3 has the worst ratio (moderate value, highest effort). Wave 4 is medium/medium.

## 3. Alternative Approaches

### Option A: Build all 5 waves as chartered (Full scope)
- **Pro:** Complete coverage of the identified gap
- **Con:** Trust chains and overlap detection deliver lower value per effort hour
- **Risk:** Wave 3 scope creep (graph traversal, NLP similarity)

### Option B: Build Waves 1, 2, 5 only (Recommended)
- **What:** Alignment checker (description-vs-tools only), taint checker, pre-commit/CI integration
- **Drop:** Trigger overlap detection, trust chain mapping, skill-scanner wrapper
- **Pro:** Captures ~80% of the security value with ~50% of the effort. The dropped items are interesting but not safety-critical.
- **Con:** Loses the overlap and trust chain analysis

### Option C: Extend existing validators only (Minimal)
- **What:** Add alignment checks directly into `validate_agent.py` and `quick_validate.py` without a separate CLI tool
- **Pro:** Minimal new code, no new scripts to maintain
- **Con:** Loses composability, harder to wire into lint-staged independently, no bash taint analysis

### Option D: Wait for Semgrep bash improvements (Do nothing)
- **Pro:** Zero effort
- **Con:** Semgrep's bash support has been "minimal" for years. Not a viable strategy.

**Recommendation: Option B** -- Build the high-value core (alignment + taint + integration), defer overlap detection and trust chains to a future initiative if needed. Drop the skill-scanner wrapper entirely (it is a convenience, not a capability gap; the scanner works fine file-by-file during the infrequent intake workflow).

## 4. Opportunity Cost

**What we are NOT doing if we pursue I32-ASEC:**

The roadmap is currently empty (Now, Next, and Later are all clear). Two I33 initiatives (I33-SHLFT and I33-WSNK) are in flight but appear to be lightweight process improvements, not competing for the same capacity.

There is no backlog of waiting initiatives that I32-ASEC would displace. The opportunity cost is low.

**However**, this repo is approaching a maturity inflection point. After 31 completed initiatives, the catalog is large (84 agents, 60+ skills). The highest-value work may be shifting from "build more" to "use what we have better" -- improving agent routing accuracy, reducing context costs, improving the developer experience of the existing tooling. I32-ASEC fits this pattern (it is governance tooling, not new capability), so it is well-placed in this lifecycle stage.

## 5. Go/No-Go Recommendation

**GO -- with scope reduction.**

### Proceed with these modifications:

1. **Drop Wave 3 items** (trigger overlap, trust chain mapping). These can be a future I32-ASEC-P2 if the core tools prove valuable. Overlap detection is a catalog hygiene concern, not a security concern. Trust chains are conceptually interesting but agents do not have runtime capabilities -- they are prompt documents.

2. **Drop Wave 4** (skill-scanner wrapper). The Cisco scanner is used infrequently (intake only) and works adequately when invoked directly. A wrapper adds maintenance burden for marginal convenience.

3. **Retain and sequence:**
   - **Wave 1:** `artifact-alignment-checker` -- description-vs-tools alignment, analyzability scoring
   - **Wave 2:** `bash-taint-checker` -- source-to-sink taint analysis
   - **Wave 3 (was 5):** Integration -- validators, pre-commit, CI

4. **Narrow success criteria** to match reduced scope. Drop criteria 2, 3, 8 from the charter. Criteria 6-7 (wrapper glob/no-API-key) become N/A.

### Prioritization guidance for Define phase:

- **Walking skeleton:** `artifact-alignment-checker` with only description-vs-tools check on a single agent file. This proves frontmatter parsing, finding generation, and exit code behavior in under 100 lines of bash.
- **First real value:** Wire the walking skeleton into lint-staged. A developer modifying `agents/security-assessor.md` should get feedback if the description says "assessment" but tools include `Write`.
- **Bash taint checker:** Start with the 5 most dangerous sinks (`eval`, `source`, `bash -c`, pipe to `sh`, `rm -rf $var`) and the 3 most common sources (`$1`-`$N`, `$(curl ...)`, `read`). Expand based on false positive rate from first full scan.
- **Test with real data early:** Run both tools against the actual repo (84 agents, 57 shell scripts) in Wave 1/2. Real findings will drive tuning faster than synthetic test cases.

### Roadmap placement:

Slot I32-ASEC into **Next** on the evergreen roadmap. The two I33 initiatives currently in flight should complete first. I32-ASEC is well-defined and ready to start once capacity frees.

---

## Summary

| Dimension | Assessment |
|---|---|
| Strategic alignment | Strong -- natural next step in security maturity arc |
| Value/effort ratio | Favorable after scope reduction (80% value at 50% effort) |
| Best approach | Option B: core alignment + taint + integration, drop overlap/trust-chain/wrapper |
| Opportunity cost | Low -- roadmap is clear, no competing initiatives |
| Recommendation | **GO** with reduced scope (3 waves instead of 5) |
| Roadmap slot | **Next** (after I33 initiatives complete) |
