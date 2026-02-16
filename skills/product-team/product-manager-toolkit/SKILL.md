---

# === CORE IDENTITY ===
name: product-manager-toolkit
title: Product Manager Toolkit
description: Comprehensive toolkit for product managers including RICE prioritization, customer interview analysis, PRD templates, discovery frameworks, opportunity scoring, and go-to-market strategies. Use for feature prioritization, user research synthesis, requirement documentation, continuous discovery, and product strategy development.
domain: product
subdomain: product-management

# === WEBSITE DISPLAY ===
difficulty: intermediate
time-saved: "TODO: Quantify time savings"
frequency: "TODO: Estimate usage frequency"
use-cases:
  - Defining product roadmaps and feature prioritization
  - Writing user stories and acceptance criteria
  - Conducting competitive analysis and market research
  - Stakeholder communication and alignment
  - Running continuous discovery with structured interviews and opportunity scoring

# === RELATIONSHIPS ===
related-agents: []
related-skills: []
related-commands: []
orchestrated-by: []

# === TECHNICAL ===
dependencies:
  scripts: []
  references:
    - references/frameworks.md
    - references/templates.md
    - references/tools.md
    - references/discovery-workflow.md
    - references/opportunity-scoring.md
    - references/mom-test.md
  assets: []
compatibility:
  python-version: 3.8+
  platforms: [macos, linux, windows]
tech-stack:
  - Python 3.8+
  - CLI
  - CSV processing
  - JSON export
  - NLP sentiment analysis

# === EXAMPLES ===
examples:
  -
    title: Example Usage
    input: "TODO: Add example input for product-manager-toolkit"
    output: "TODO: Add expected output"

# === ANALYTICS ===
stats:
  downloads: 0
  stars: 0
  rating: 0.0
  reviews: 0

# === VERSIONING ===
version: v1.1.0
author: Claude Skills Team
contributors: []
created: 2025-10-19
updated: 2026-02-16
license: MIT

# === DISCOVERABILITY ===
tags: [analysis, development, manager, product, toolkit, discovery, opportunity-scoring, mom-test, interviews]
featured: false
verified: true
---

# Product Manager Toolkit

## Overview

Essential tools and frameworks for modern product management, from discovery to delivery. This toolkit provides Python automation tools for prioritization and interview analysis, comprehensive frameworks for decision-making, and battle-tested templates for product documentation.

**Core Value:** Structured product management workflows that reduce decision-making time and increase confidence in product bets through quantitative scoring and validated discovery processes.

**Target Audience:** Product managers, product owners, and anyone responsible for deciding what to build and why.

**Use Cases:**
- Feature prioritization and roadmap planning (RICE scoring)
- Continuous discovery with 4-phase workflow
- Customer interview analysis (Mom Test, NLP extraction)
- Opportunity scoring and prioritization
- Requirements documentation (PRDs, user stories)


## Core Capabilities

- **RICE Prioritization Engine** - Quantitative feature scoring with portfolio analysis and capacity planning
- **Customer Interview Analyzer** - NLP-based transcript analysis extracting pain points, JTBD, and sentiment
- **Discovery Workflow** - 4-phase process from problem validation through market viability
- **Opportunity Scoring** - Algorithm for ranking opportunities by importance and satisfaction gap
- **Mom Test Interviewing** - Structured approach to extracting honest customer insights
- **PRD Templates** - Standard, One-Page, Agile Epic, and Feature Brief formats


## Key Workflows

### Workflow 1: Feature Prioritization

**Time:** 1-2 hours per batch

**Steps:**
1. Gather feature requests (customer feedback, sales, tech debt, strategic)
2. Score with RICE: `python scripts/rice_prioritizer.py features.csv`
3. Analyze portfolio (quick wins vs big bets)
4. Generate roadmap with capacity planning

**Expected Output:** Ranked feature list with RICE scores, portfolio balance chart, quarterly roadmap.

**Detailed Methodology:** See [frameworks.md](references/frameworks.md) for RICE, Value vs Effort Matrix, MoSCoW, and Kano Model.

### Workflow 2: Continuous Discovery

**Time:** 4-8 weeks across all phases

**Steps:**
1. Phase 1 - Problem Validation: Conduct 5+ Mom Test interviews (see [mom-test.md](references/mom-test.md))
2. Phase 2 - Opportunity Mapping: Score opportunities using the algorithm (see [opportunity-scoring.md](references/opportunity-scoring.md))
3. Phase 3 - Solution Testing: Prototype and test with 5+ users per iteration
4. Phase 4 - Market Viability: Complete Lean Canvas, assess 4 Big Risks

**Expected Output:** Validated opportunity with score >8, tested solution direction, go/no-go recommendation.

**Full Process:** See [discovery-workflow.md](references/discovery-workflow.md) for phase details, decision gates, and success metrics.

### Workflow 3: Customer Interview Analysis

**Time:** 30 minutes per transcript

**Steps:**
1. Conduct interviews using Mom Test principles (see [mom-test.md](references/mom-test.md))
2. Analyze: `python scripts/customer_interview_analyzer.py transcript.txt`
3. Synthesize findings across interviews
4. Score opportunities from extracted insights (see [opportunity-scoring.md](references/opportunity-scoring.md))

**Expected Output:** Extracted pain points, feature requests, JTBD patterns, sentiment analysis, themes.

### Workflow 4: PRD Development

**Time:** 2-8 hours depending on template

**Steps:**
1. Choose template based on project size (Standard, One-Page, Feature Brief, Agile Epic)
2. Structure: Problem (from discovery) to Solution to Success Metrics
3. Collaborate with engineering, design, sales, support

**Expected Output:** Complete PRD ready for stakeholder review.

**Complete Templates:** See [templates.md](references/templates.md) for all PRD formats with examples.


## Quick Start

### Feature Prioritization
```bash
python scripts/rice_prioritizer.py sample  # Create sample CSV
python scripts/rice_prioritizer.py sample_features.csv --capacity 15
```

### Interview Analysis
```bash
python scripts/customer_interview_analyzer.py interview_transcript.txt
```

### PRD Creation
1. Choose template: Standard, One-Page, Agile Epic, or Feature Brief
2. See [templates.md](references/templates.md) for complete formats
3. Fill sections based on discovery work
4. Review with stakeholders and version control


## Python Tools

### rice_prioritizer.py
RICE framework implementation with portfolio analysis and roadmap generation.

**Key Features:**
- RICE score calculation
- Portfolio balance (quick wins, big bets, fill-ins, time sinks)
- Quarterly roadmap with capacity planning
- Multiple output formats (text/json/csv)

**Usage:**
```bash
# Basic prioritization
python3 scripts/rice_prioritizer.py features.csv

# With team capacity
python3 scripts/rice_prioritizer.py features.csv --capacity 20

# JSON output for tool integration
python3 scripts/rice_prioritizer.py features.csv --output json -f roadmap.json
```

**CSV Format:**
```csv
name,reach,impact,confidence,effort
User Dashboard,500,2,0.8,5
API Rate Limiting,1000,2,0.9,3
```

**Complete Documentation:** See [tools.md](references/tools.md) for full options, output formats, and integration patterns.

### customer_interview_analyzer.py
NLP-based interview analysis for extracting actionable insights.

**Capabilities:**
- Pain point extraction with severity assessment
- Feature request identification and classification
- Jobs-to-be-done pattern recognition
- Sentiment analysis
- Theme extraction and competitor mentions

**Usage:**
```bash
# Analyze interview
python3 scripts/customer_interview_analyzer.py interview.txt

# JSON output for research tools
python3 scripts/customer_interview_analyzer.py interview.txt --output json -f analysis.json
```

**Complete Documentation:** See [tools.md](references/tools.md) for full capabilities, output formats, and batch analysis workflows.


## Reference Documentation

### Frameworks ([frameworks.md](references/frameworks.md))
Detailed frameworks and methodologies:
- Prioritization: RICE (detailed), Value vs Effort Matrix, MoSCoW, Kano Model
- Discovery: Customer Interview Guide, Hypothesis Template, Opportunity Solution Tree
- Metrics: North Star Framework, Funnel Analysis (AARRR), Feature Success Metrics, Cohort Analysis

### Discovery Workflow ([discovery-workflow.md](references/discovery-workflow.md))
4-phase continuous discovery process:
- Phase 1: Problem Validation (Mom Test interviews, 5+ interviews, >60% confirmation)
- Phase 2: Opportunity Mapping (Opportunity Scoring Algorithm, OST, score >8 threshold)
- Phase 3: Solution Testing (Prototypes, >80% task completion)
- Phase 4: Market Viability (Lean Canvas, 4 Big Risks, LTV > 3x CAC)
- Decision gates (G1-G4) with proceed/pivot/kill criteria
- Success metrics and phase transition requirements

### Opportunity Scoring ([opportunity-scoring.md](references/opportunity-scoring.md))
Quantitative opportunity prioritization:
- Formula: `Score = Importance + Max(0, Importance - Satisfaction)`
- Score interpretation (>8 pursue, 5-8 evaluate, <5 deprioritize)
- How to gather Importance and Satisfaction ratings from interviews
- Example calculations with worked scenarios
- Opportunity Solution Tree integration
- Job Mapping (JTBD) for systematic opportunity identification

### Mom Test Interviewing ([mom-test.md](references/mom-test.md))
Customer interview methodology (Rob Fitzpatrick):
- Three rules: talk about their life, ask about past specifics, listen more
- Bad questions vs good questions with rationale
- Signal extraction: strong signals vs weak signals
- Assumption challenging framework
- Hypothesis testing with risk scoring

### Templates ([templates.md](references/templates.md))
Complete templates and best practices:
- PRD Templates: Standard, One-Page, Agile Epic, Feature Brief
- Interview Guides: Discovery interviews, solution validation
- Best Practices: Writing PRDs, prioritization, discovery, stakeholder management
- Common Pitfalls: What to avoid and how to fix

### Tools ([tools.md](references/tools.md))
Python tool documentation and integrations:
- rice_prioritizer.py: Complete usage, options, output formats
- customer_interview_analyzer.py: Full capabilities and workflows
- Integration Patterns: Jira, ProductBoard, Amplitude, Figma, Dovetail, Slack
- Platform Setup: Step-by-step for each tool
- Troubleshooting: Common issues and solutions


## Integration Points

This toolkit integrates with:
- **Analytics:** Amplitude, Mixpanel, Google Analytics
- **Roadmapping:** ProductBoard, Aha!, Roadmunk
- **Design:** Figma, Sketch, Miro
- **Development:** Jira, Linear, GitHub
- **Research:** Dovetail, UserVoice, Pendo
- **Communication:** Slack, Notion, Confluence

See [tools.md](references/tools.md) for detailed integration workflows and platform-specific setup guides.

## Quick Commands

```bash
# Prioritization
python scripts/rice_prioritizer.py features.csv --capacity 15

# Interview Analysis
python scripts/customer_interview_analyzer.py interview.txt

# Create sample data
python scripts/rice_prioritizer.py sample

# JSON outputs for integration
python scripts/rice_prioritizer.py features.csv --output json
python scripts/customer_interview_analyzer.py interview.txt --output json
```
