---
type: roadmap
endeavor: repo
status: active
updated: 2026-02-19
---

# Roadmap: agents-and-skills

Evergreen project-level roadmap. Maintained by product-director. Sequences all initiatives by horizon (Now / Next / Later / Done). When a new charter arrives, the product-director evaluates it against this roadmap and slots it into the appropriate horizon.

**Authority:** This roadmap is authority for **sequencing between initiatives**. Charters are authority for **scope within an initiative**. Backlogs are authority for **execution order**. Plans are authority for **how to build**.

## Now

Initiatives actively in progress.

| Initiative | Name | Description | Status | Charter |
|------------|------|-------------|--------|---------|
| I05-ATEL | Agent Telemetry | Telemetry and analytics system tracking agent activations, skill usage, and token consumption via Tinybird | near-complete | [charter](../charters/charter-repo-agent-telemetry.md) |
| I12-CRFT | Craft Command | Full SDLC orchestration command (`/craft`) with phase gates, resume, and auto variants | active | [charter](../charters/charter-repo-I12-CRFT-craft-command.md) |
| I13-RCHG | Review Changes Artifact-Aware | Extend `/review/review-changes` to treat agent/skill/command artifacts as first-class review targets | active | [charter](../charters/charter-repo-I13-RCHG-review-changes-artifact-aware.md) |
| I10-ARFE | Agentic Review Feedback Effectiveness | Confidence-tiered review output and effectiveness tracking for review agents | in-progress | [charter](../charters/charter-repo-agentic-review-feedback-effectiveness.md) |

## Next

Initiatives chartered and ready to start when capacity allows.

| Initiative | Name | Description | Charter |
|------------|------|-------------|---------|
| I07-SDCA | Skills Deploy Claude API | GitHub workflow to detect changed skills, zip, and deploy to Claude Skills API | [charter](../charters/charter-repo-skills-deploy-claude-api.md) |
| I09-SHSL | Shell Script Lint | Shell-scripting skill + Phase 0 conditional + ShellCheck wired in pre-commit and CI | [charter](../charters/charter-repo-I09-SHSL-shell-script-lint.md) |
| I04-SLSE | Sales Enablement | Sales team skills (6) and agents (SDR, AE) with methodology frameworks | [charter](../charters/charter-repo-sales-enablement.md) |
| I03-PRFR | Prioritization Frameworks | Portfolio allocation skill with NPV scoring, supplementary frameworks | [charter](../charters/charter-repo-prioritization-frameworks.md) |
| I14-MATO | Multi-Agent Token Optimization | Token cost optimization for multi-agent orchestration | [charter](../charters/charter-repo-I14-MATO-multi-agent-token-optimization.md) |

## Later

Ideas and potential initiatives not yet chartered or deferred.

_(empty)_

## Done

Completed initiatives.

| Initiative | Name | Description | Charter |
|------------|------|-------------|---------|
| I01-ACM | Artifact Conventions Migration | Established `.docs/` as single source of truth with naming grammar | [charter](../charters/charter-repo-artifact-conventions.md) |
| I02-INNC | Initiative Naming Convention | `I<nn>-<ACRONYM>` naming grammar for cross-initiative traceability | [charter](../charters/charter-repo-initiative-naming-convention.md) |
| I06-AICO | Agent & Command Intake/Optimize | Agent optimizer, command validator, and agent intake pipeline | [charter](../charters/charter-repo-agent-command-intake-optimize.md) |
| I08-NWMI | nWave Methodology Intake | Methodology skills from nWave (TDD, refactoring, debugging, etc.) | [charter](../charters/charter-repo-nwave-methodology-intake.md) |
| I11-PMSI | PM Skills Intake | Product management skills intake (8 skills, 8 Python tools) | [charter](../charters/charter-repo-I11-PMSI-pm-skills-intake.md) |
