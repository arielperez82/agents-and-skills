# Engineering Team Skills - Claude Code Guidance

This guide covers the 30 production-ready engineering role skills and their Python automation tools.

## Engineering Skills Overview

**Core Engineering (9 skills):**
- senior-architect, senior-frontend, senior-backend, senior-fullstack
- senior-qa, senior-devops, senior-secops
- code-reviewer, senior-security

**Strategic/Leadership (1 skill):**
- cto-advisor

**AI/ML/Data (5 skills):**
- senior-data-scientist, senior-data-engineer, senior-ml-engineer
- senior-prompt-engineer, senior-computer-vision

**Platform & Language (6 skills):**
- senior-ios, senior-mobile, senior-flutter
- senior-java, senior-dotnet, senior-network-infrastructure

**Testing/Quality (2 skills):**
- acceptance-test-design, mutation-testing

**Refactoring/Engineering (1 skill):**
- mikado-method

**Review Optimization (1 skill):**
- tiered-review

**Specialist (6 skills):**
- senior-graphql, senior-observability, technical-writer
- incident-response, legacy-codebase-analyzer
- divio-documentation

**Total Tools:** 44 Python automation tools

## Core Engineering Tools

### 1. Project Scaffolder (`senior-fullstack/scripts/project_scaffolder.py`)

**Purpose:** Production-ready project scaffolding for modern stacks

**Supported Stacks:**
- Next.js + GraphQL + PostgreSQL
- React + REST + MongoDB
- Vue + GraphQL + MySQL
- Express + TypeScript + PostgreSQL

**Features:**
- Docker Compose configuration
- CI/CD pipeline (GitHub Actions)
- Testing infrastructure (Jest, Cypress)
- TypeScript + ESLint + Prettier
- Database migrations

**Usage:**
```bash
# Create new project
python senior-fullstack/scripts/project_scaffolder.py my-project --type nextjs-graphql

# Start services
cd my-project && docker-compose up -d
```

### 2. Code Quality Analyzer (`senior-fullstack/scripts/code_quality_analyzer.py`)

**Purpose:** Comprehensive code quality analysis and metrics

**Features:**
- Security vulnerability scanning
- Performance issue detection
- Test coverage assessment
- Documentation quality
- Dependency analysis
- Actionable recommendations

**Usage:**
```bash
# Analyze project
python senior-fullstack/scripts/code_quality_analyzer.py /path/to/project

# JSON output
python senior-fullstack/scripts/code_quality_analyzer.py /path/to/project --json
```

**Output:**
```
Code Quality Report:
- Overall Score: 85/100
- Security: 90/100 (2 medium issues)
- Performance: 80/100 (3 optimization opportunities)
- Test Coverage: 75% (target: 80%)
- Documentation: 88/100

Recommendations:
1. Update lodash to 4.17.21 (CVE-2020-8203)
2. Optimize database queries in UserService
3. Add integration tests for payment flow
```

### 3. Fullstack Scaffolder (`senior-fullstack/scripts/fullstack_scaffolder.py`)

**Purpose:** Rapid fullstack application generation

**Usage:**
```bash
python senior-fullstack/scripts/fullstack_scaffolder.py my-app --stack nextjs-graphql
```

## AI/ML/Data Tools

### Data Science Tools

**Experiment Designer** (`senior-data-scientist/scripts/experiment_designer.py`)
- A/B test design
- Statistical power analysis
- Sample size calculation

**Feature Engineering Pipeline** (`senior-data-scientist/scripts/feature_engineering_pipeline.py`)
- Automated feature generation
- Correlation analysis
- Feature selection

**Statistical Analyzer** (`senior-data-scientist/scripts/statistical_analyzer.py`)
- Hypothesis testing
- Causal inference
- Regression analysis

### Data Engineering Tools

**Pipeline Orchestrator** (`senior-data-engineer/scripts/pipeline_orchestrator.py`)
- Airflow DAG generation
- Spark job templates
- Data quality checks

**Data Quality Validator** (`senior-data-engineer/scripts/data_quality_validator.py`)
- Schema validation
- Null check enforcement
- Anomaly detection

**ETL Generator** (`senior-data-engineer/scripts/etl_generator.py`)
- Extract-Transform-Load workflows
- CDC (Change Data Capture) patterns
- Incremental loading

### ML Engineering Tools

**Model Deployment Pipeline** (`senior-ml-engineer/scripts/model_deployment_pipeline.py`)
- Containerized model serving
- REST API generation
- Load balancing config

**MLOps Setup Tool** (`senior-ml-engineer/scripts/mlops_setup_tool.py`)
- MLflow configuration
- Model versioning
- Drift monitoring

**LLM Integration Builder** (`senior-ml-engineer/scripts/llm_integration_builder.py`)
- OpenAI API integration
- Prompt templates
- Response parsing

### Prompt Engineering Tools

**Prompt Optimizer** (`senior-prompt-engineer/scripts/prompt_optimizer.py`)
- Prompt A/B testing
- Token optimization
- Few-shot example generation

**RAG System Builder** (`senior-prompt-engineer/scripts/rag_system_builder.py`)
- Vector database setup
- Embedding generation
- Retrieval strategies

**Agent Orchestrator** (`senior-prompt-engineer/scripts/agent_orchestrator.py`)
- Multi-agent workflows
- Tool calling patterns
- State management

### Computer Vision Tools

**Vision Model Trainer** (`senior-computer-vision/scripts/vision_model_trainer.py`)
- Object detection (YOLO, Faster R-CNN)
- Semantic segmentation
- Transfer learning

**Inference Optimizer** (`senior-computer-vision/scripts/inference_optimizer.py`)
- Model quantization
- TensorRT optimization
- ONNX export

**Video Processor** (`senior-computer-vision/scripts/video_processor.py`)
- Frame extraction
- Object tracking
- Scene detection

## Tech Stack Patterns

### Frontend (React/Next.js)
- TypeScript strict mode
- Component-driven architecture
- Atomic design patterns
- State management (Zustand/Jotai)
- Testing (Jest + React Testing Library)

### Backend (Node.js/Express)

- Clean architecture
- Dependency injection
- Repository pattern
- Domain-driven design
- Testing (Vitest + Supertest)

### Fullstack Integration
- GraphQL for API layer
- REST for external services
- WebSocket for real-time
- Redis for caching
- PostgreSQL for persistence

## Development Workflows

### Workflow 1: New Project Setup

```bash
# 1. Scaffold project
python senior-fullstack/scripts/project_scaffolder.py my-app --type nextjs-graphql

# 2. Start services
cd my-app && docker-compose up -d

# 3. Run migrations
npm run migrate

# 4. Start development
npm run dev
```

### Workflow 2: Code Quality Check

```bash
# 1. Analyze codebase
python senior-fullstack/scripts/code_quality_analyzer.py ./

# 2. Fix security issues
npm audit fix

# 3. Run tests
npm test

# 4. Build production
npm run build
```

### Workflow 3: ML Model Deployment

```bash
# 1. Setup MLOps infrastructure
python senior-ml-engineer/scripts/mlops_setup_tool.py

# 2. Deploy model
python senior-ml-engineer/scripts/model_deployment_pipeline.py model.pkl

# 3. Monitor performance
# Check MLflow dashboard
```

## Core Engineering Practices

### TDD (Test-Driven Development) - Universal Requirement

**TDD is every developer's responsibility.** All engineering work follows RED-GREEN-REFACTOR:

1. **RED**: Write failing test first
2. **GREEN**: Minimal code to pass test
3. **REFACTOR**: Improve while keeping tests green

**All engineering skills include TDD support:**
- `engineering-team/core-testing-methodology` skill for TDD patterns
- `tdd-reviewer` agent for methodology coaching
- `qa-engineer` agent for automation infrastructure

**Quality Gates:**
- 100% test coverage required (exceptions documented)
- Tests verify behavior, not implementation
- All tests pass before commits
- TDD evidence in commit history

## Quality Standards

**All engineering tools must:**
- Support modern tech stacks (Next.js, React, Vue, Express)
- Generate production-ready code with comprehensive tests
- Include TDD-compliant testing infrastructure
- Provide Docker configurations
- Support CI/CD integration with quality gates

## Integration Patterns

### GitHub Actions CI/CD

All scaffolders generate GitHub Actions workflows:
```yaml
.github/workflows/
├── test.yml          # Run tests on PR
├── build.yml         # Build and lint
└── deploy.yml        # Deploy to production
```

### Docker Compose

Multi-service development environment:
```yaml
services:
  - app (Next.js)
  - api (GraphQL)
  - db (PostgreSQL)
  - redis (Cache)
```

## Additional Resources

- **Skill Catalog:** `../README.md` — complete skill inventory with "when to use" guidance
- **Agent Catalog:** `../../agents/README.md` — all agents and their skill mappings
- **Agent Authoring Guide:** `../../agents/agent-author.md`
- **Engineering Roadmap:** Repo-level roadmaps live under `.docs/canonical/roadmaps/` when artifact conventions are in use (see `.docs/AGENTS.md`)

---

### Trail of Bits Security & Testing Skills (CC BY-SA 4.0)

Incorporated from [trailofbits/skills](https://github.com/trailofbits/skills):

| Skill | Purpose |
|-------|---------|
| **property-based-testing** | PBT patterns (roundtrip, idempotence, commutativity), generators, Hypothesis/fast-check/proptest |
| **sharp-edges** | API misuse-resistance analysis, footgun detection, 11 language guides |
| **variant-analysis** | Bug variant hunting, CodeQL/Semgrep templates |
| **semgrep-rule-creator** | Custom Semgrep rule authoring with test-first workflow |
| **modern-python** | Modern Python tooling (uv, ruff, ty), pyproject.toml, migration guides |
| **semgrep-scanning** | Semgrep scan orchestration, ruleset selection, SARIF triage |

Additionally, `senior-security` gained references for insecure-defaults detection and differential security review.

**Last Updated:** February 20, 2026
**Skills Deployed:** 36/36 engineering skills production-ready (30 role + 6 Trail of Bits)
**Total Tools:** 44 Python automation tools across core + strategic + AI/ML/Data + platform + specialist
