# Agent Governance Checklist

Security and governance dimensions for agent intake (Phase 2: Stage & Governance Audit). Extends the [optimization rubric](../../agent-optimizer/references/optimization-rubric.md) (B1) with security-specific checks. Used by agent-intake skill and `/agent:intake` command.

## Severity levels

- **Critical:** Must resolve before any incorporation; blocks intake.
- **High:** Should resolve or document before incorporation; intake can proceed with FLAGGED status.
- **Medium:** Recommend fix; document in report.
- **Low:** Informational; optional fix.

---

## 1. Tool permission escalation

**Definition:** Agent `classification.type` implies a trust level; declared `tools` must not exceed that level. Strategic/coordination agents should not request Bash or broad file write unless justified.

**Checks:**
- Strategic agent with `Bash` or `Edit` in tools → flag (classification alignment already in rubric; treat as governance).
- Quality agent with `Write` outside of report paths → flag.
- Coordination agent with `Bash` → document justification (e.g. runs subagent scripts).

**Severity:** Strategic + Bash = **High**. Quality + code-writing tools = **Critical**.

**Grep patterns:**
```bash
# In agent frontmatter body (between --- blocks): classification type + tools
awk '/^classification:/,/^[a-z]/' agent.md | grep -E 'type:|tools:'
# Then manually or script: if type is strategic and tools include Bash → flag
```

---

## 2. Delegation chain safety

**Definition:** No circular delegations; no implicit privilege escalation (e.g. quality agent delegating to an agent that can run arbitrary Bash).

**Checks:**
- Extract all `collaborates-with` → agent names. Build directed graph; detect cycles.
- For each delegating agent: if type is quality/strategic, ensure delegated agents do not introduce broader tool sets without documentation.

**Severity:** Circular delegation = **Critical**. Undocumented privilege escalation = **High**.

**Grep patterns:**
```bash
grep -E 'agent:|collaborates-with' agent.md
```

---

## 3. Skill reference integrity

**Definition:** Every `skills` and `related-skills` entry resolves to an existing file under `skills/` (SKILL.md or agent path).

**Checks:**
- Parse frontmatter `skills:` and `related-skills:`; for each path, verify file exists (same logic as command validator).

**Severity:** Unresolved skill ref = **High** (broken handoffs).

**Grep patterns:**
```bash
# List skill refs from frontmatter
sed -n '/^skills:/,/^[a-z]/p' agent.md
sed -n '/^related-skills:/,/^[a-z]/p' agent.md
```

---

## 4. Conflict with review gates

**Definition:** Agent must not instruct bypassing mandatory quality gates (e.g. "skip tdd-reviewer", "commit without tests"). Per AGENTS.md, tdd-reviewer, ts-enforcer, refactor-assessor are mandatory before commit.

**Checks:**
- Search body for phrases that suggest skipping or bypassing these agents or pre-commit checks.

**Severity:** Explicit bypass of mandatory gate = **Critical**.

**Grep patterns:**
```bash
grep -iE 'skip (tdd|reviewer|ts-enforcer|refactor)|bypass (pre-commit|quality)|commit without (test|lint)' agent.md
```

---

## 5. Credential exposure

**Definition:** No hardcoded paths to `.env`, credentials, or secrets in agent body or referenced scripts.

**Checks:**
- Search for literal `.env`, `credentials`, `secrets`, `API_KEY`, `TOKEN` in context of file paths or "load from".

**Severity:** Hardcoded credential path = **Critical**. Mention of env vars for configuration = **Low** (acceptable).

**Grep patterns:**
```bash
grep -iE '\.env|/credentials|/secrets|api_key\s*=|token\s*=\s*["\'][^"\']+["\']' agent.md
```

---

## 6. MCP tool access

**Definition:** If agent or its workflows use MCP tools, those should be declared (e.g. in frontmatter or a "Tools" section). Undeclared MCP servers make dependency and security review harder.

**Checks:**
- Search for "MCP", "mcp_", "call_mcp" in body. If present, check for a declaration of which MCP servers are used.

**Severity:** Undeclared MCP usage = **Medium**.

**Grep patterns:**
```bash
grep -iE 'mcp|call_mcp' agent.md
```

---

## Summary table (for report)

| Dimension | Critical | High | Medium | Low |
|-----------|----------|------|--------|-----|
| Tool permission escalation | Quality + code tools | Strategic + Bash | — | — |
| Delegation chain safety | Circular delegation | Privilege escalation | — | — |
| Skill reference integrity | — | Unresolved refs | — | — |
| Conflict with review gates | Bypass mandatory gate | — | — | — |
| Credential exposure | Hardcoded credential path | — | — | Env var mention |
| MCP tool access | — | — | Undeclared MCP | — |

**Gate logic:** Any Critical = REJECT. Any High = FLAGGED (can proceed with approval). Medium/Low = document in report.
