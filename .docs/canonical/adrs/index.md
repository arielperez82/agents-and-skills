---
type: index
endeavor: repo
updated: 2026-03-06
---

# ADR Index

Optional index for Architecture Decision Records. ADRs live in this directory with naming `I<nn>-<ACRONYM>-<nnn>-<subject>.md`.

| ADR | Subject | Status | Date |
|-----|---------|--------|------|
| I16-MCEF-001 | [Python stdlib-only for Monte Carlo scripts](I16-MCEF-001-python-stdlib-only.md) | Accepted | 2026-02-20 |
| I16-MCEF-002 | [WSJF complements RICE (not replacement)](I16-MCEF-002-wsjf-complements-rice.md) | Accepted | 2026-02-20 |
| I17-STSR-001 | [tool_use_id as timing pairing key](I17-STSR-001-tool-use-id-timing-pairing-key.md) | Proposed | 2026-02-21 |
| I17-STSR-002 | [File-based timing store for script duration](I17-STSR-002-file-based-timing-store.md) | Proposed | 2026-02-21 |
| I17-STSR-003 | [Dual event registration for PostToolUse/Failure](I17-STSR-003-dual-event-registration-post-tool-use.md) | Proposed | 2026-02-21 |
| I17-STSR-004 | [Project name from cwd basename](I17-STSR-004-project-name-from-cwd-basename.md) | Proposed | 2026-02-21 |
| I18-CREC-001 | [Charter reconciliation ownership at close](I18-CREC-001-charter-reconciliation-ownership.md) | Accepted | 2026-02-22 |
| I18-RLMP-001 | [T1 scripts co-located under tiered-review skill](I18-RLMP-001-scripts-colocated-under-tiered-review-skill.md) | Proposed | 2026-02-25 |
| I18-RLMP-002 | [Symbolic handle pattern for agent context](I18-RLMP-002-symbolic-handle-pattern.md) | Proposed | 2026-02-25 |
| I18-RLMP-003 | [Sequential pre-filters before parallel dispatch](I18-RLMP-003-sequential-prefilters-before-parallel-dispatch.md) | Proposed | 2026-02-25 |
| I05-ATEL-001 | [Drop native OTel path — hooks-only telemetry](I05-ATEL-001-hooks-only-drop-otel-path.md) | Accepted | 2026-03-01 |
| I33-SHLFT-001 | [Separate packages over extending commit-monitor](I33-SHLFT-001-separate-packages-over-extending-commit-monitor.md) | Proposed | 2026-03-06 |
| I33-SHLFT-002 | [review-nudge as PostToolUse nudge, not PreToolUse block](I33-SHLFT-002-review-nudge-post-tool-use-not-pre-tool-use.md) | Proposed | 2026-03-06 |
| I33-SHLFT-003 | [Fail-open design for all hooks](I33-SHLFT-003-fail-open-design-for-all-hooks.md) | Proposed | 2026-03-06 |
| I33-SHLFT-004 | [RED evidence as skill convention, not commit-msg hook](I33-SHLFT-004-red-evidence-as-skill-convention-not-commit-msg-hook.md) | Proposed | 2026-03-06 |

See [charter](../../charters/charter-repo-artifact-conventions.md) for ADR placement and front matter requirements.
