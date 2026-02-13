# Incorporation Decision Framework

Decision matrix for determining how to incorporate a candidate skill into a project's skill pipeline.

## Decision Matrix

| Signal | Decision | Action |
|--------|----------|--------|
| No overlap with existing skills, provides new capability | **ADD** | Install as standalone skill, wire imports to shared foundation |
| Partial overlap, new skill implementation is superior | **MERGE-IN** | Migrate best parts into existing skill, discard rest |
| Partial overlap, existing skill implementation is superior | **ADAPT** | Extract unique capabilities from new skill, integrate into existing |
| Full overlap, new skill is clearly superior | **REPLACE** | Swap out existing skill, migrate all dependents |
| Full overlap, existing skill is superior or equivalent | **REJECT** | Do not incorporate, document reasoning |

## Evaluation Criteria

### Overlap Assessment

Score overlap on a per-capability basis. For each capability in the candidate skill, check against the project's existing skill inventory (discovered dynamically from SKILL.md files):

| Aspect | Questions |
|--------|-----------|
| **Core Functions** | Does it duplicate functions/modules already in existing skills? |
| **Data Sources** | Does it use the same data sources? Can it reuse existing data fetching? |
| **Shared Infrastructure** | Does it duplicate utilities already in a shared/foundation skill? |
| **Output Format** | Does it produce output compatible with existing formatters/consumers? |
| **Visualization** | Does it duplicate charting/visualization already available? |

### Quality Comparison

When overlap exists, compare quality:

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Correctness | High | Are calculations/logic correct? Edge case handling? |
| Test coverage | High | Does it have tests? What's the coverage? |
| Code clarity | Medium | Readability, documentation, naming conventions |
| Performance | Medium | Efficiency for typical workloads |
| Dependency weight | Low | External packages required |

### Pipeline Fit

| Factor | Assessment |
|--------|-----------|
| **Import compatibility** | Can it use the project's existing cross-skill import pattern? |
| **Data flow** | Does it consume data from existing shared infrastructure? |
| **Output format** | Does it produce output compatible with existing conventions? |
| **CLI pattern** | Does it follow the project's CLI conventions? |
| **Cache/state compatibility** | Can it use existing caching or state management? |

## Decision Workflow

```
1. List all capabilities of candidate skill
2. For each capability:
   a. Does an existing skill provide this? → Mark as OVERLAP
   b. Is it a new capability? → Mark as NEW
3. If all NEW → ADD
4. If all OVERLAP:
   a. Compare quality → REPLACE if better, REJECT if worse/equal
5. If mixed:
   a. Assess overlap quality → determines MERGE-IN vs ADAPT
   b. MERGE-IN: new is better on overlapping parts
   c. ADAPT: existing is better on overlapping parts, extract only the NEW parts
```

## Integration Checklist (Post-Decision)

### For ADD
- [ ] Create skill directory under `.claude/skills/{skill-name}/`
- [ ] Add SKILL.md with proper frontmatter (description, capabilities, dependencies)
- [ ] Wire cross-skill imports following the project's existing pattern
- [ ] Ensure entry point follows project CLI conventions
- [ ] Verify cross-skill imports work bidirectionally if needed
- [ ] Update project documentation (MEMORY.md, CLAUDE.md, etc.)

### For MERGE-IN
- [ ] Identify target existing skill for merge
- [ ] List specific functions/modules to migrate
- [ ] Write tests for migrated functionality first
- [ ] Migrate code, adapting to existing conventions
- [ ] Remove duplicated code from candidate
- [ ] Verify existing tests still pass
- [ ] Update target skill's SKILL.md capabilities list

### For ADAPT
- [ ] Identify unique capabilities to extract
- [ ] Determine target skill for integration
- [ ] Write tests for new capabilities first
- [ ] Extract and adapt code to existing patterns
- [ ] Wire into existing skill's workflow
- [ ] Verify existing tests still pass

### For REPLACE
- [ ] Document all dependents of existing skill
- [ ] Create migration plan for each dependent
- [ ] Write compatibility tests for dependent expectations
- [ ] Swap implementation
- [ ] Verify all dependents work
- [ ] Remove old skill, update all references

### For REJECT
- [ ] Document rejection reasoning
- [ ] Note any partial value for future reference
- [ ] Clean up sandbox
