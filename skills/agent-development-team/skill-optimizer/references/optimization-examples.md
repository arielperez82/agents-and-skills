# Optimization Examples

Worked before/after examples demonstrating skill optimization techniques.

## Example 1: Game Design Skill (Major Refactor)

### Before: 934 lines

```
Content breakdown:
├── Core knowledge: 200 lines (21%)
├── Examples/templates: 450 lines (48%) ← externalizable
├── ASCII diagrams: 180 lines (19%) ← simplifiable
└── Best practices: 104 lines (11%)

Efficiency score: 21% (needs optimization)
```

### After: 280 lines

```
Content breakdown:
├── Core knowledge: 180 lines (64%)
├── Simplified diagrams: 30 lines (11%)
├── Best practices: 50 lines (18%)
└── Reference pointers: 20 lines (7%)

Efficiency score: 64% (good)
Token savings: 70%
```

### What Changed

1. **450 lines of templates/examples** moved to `references/templates.md` and `references/examples.md`
2. **180 lines of ASCII art** compressed to 30 lines using compact notation
3. **Best practices** condensed from 104 to 50 lines by removing redundancy
4. **20 lines of pointers** added to link to externalized content

## Example 2: Chart Simplification

### Before (8 lines, ~200 tokens)

```
┌─────────────────────────────────────┐
│  MDA Framework                       │
│                                      │
│  Mechanics → Dynamics → Aesthetics   │
│  Rules       Behavior    Feeling     │
│                                      │
│  Designer POV ─────────→ Player POV │
└─────────────────────────────────────┘
```

### After (2 lines, ~30 tokens)

```
MDA: Mechanics (rules) → Dynamics (behavior) → Aesthetics (feeling)
     Designer POV ──────────────────────────→ Player POV
```

**Savings: 85%**

## Example 3: Template Externalization

### Before (inline, 50+ lines)

```markdown
## GDD Template

### 1. Overview
- Game name
- Genre, platform
- Target audience
### 2. Gameplay
- Core loop
- Mechanics
... (50 lines of detailed template)
```

### After (3-line pointer + quick reference)

```markdown
## GDD Template

Full template: [references/templates.md#gdd](references/templates.md#gdd)

Quick version (3 essentials):
1. Core experience: one sentence
2. Core loop: what the player repeats
3. Unique hook: why play this one
```

**Savings: 90%** — Full template loads only when explicitly needed.

## Example 4: Data Table Externalization

### Before (large inline table)

```markdown
| Phase | Player HP | Enemy HP | Duration | XP | Gold |
|-------|-----------|----------|----------|----|------|
| Early | 100 | 30-50 | 10-30s | 10-20 | 5-10 |
| Mid | 500 | 200-400 | 30-60s | 50-100 | 20-50 |
| Late | 2000 | 1000+ | 1-3min | 200+ | 100+ |
```

### After (pointer)

```markdown
Balance tables: [references/balance-tables.md](references/balance-tables.md)
```

**Savings: 80%** — Data tables are reference material, not core workflow.
