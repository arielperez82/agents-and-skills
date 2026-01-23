# How to Use Senior GraphQL Skill

Quick start guide for using the GraphQL specialist skill.

## Prerequisites

- Python 3.8+ (for automation tools)
- Node.js 18+ (for generated projects)
- GraphQL schema files (.graphql)

## Quick Start

### 1. Analyze Your Schema

```bash
# Basic analysis
python scripts/schema_analyzer.py path/to/schema.graphql

# Get JSON output for tooling
python scripts/schema_analyzer.py schema.graphql --output json

# Validate against best practices
python scripts/schema_analyzer.py schema.graphql --validate
```

### 2. Generate Resolvers

```bash
# Generate TypeScript resolvers
python scripts/resolver_generator.py schema.graphql --output src/resolvers

# Include DataLoader for N+1 prevention
python scripts/resolver_generator.py schema.graphql --output src/resolvers --dataloader

# Generate with test stubs
python scripts/resolver_generator.py schema.graphql --output src/resolvers --tests
```

### 3. Scaffold Federation Subgraph

```bash
# Create a new subgraph
python scripts/federation_scaffolder.py users-service --entities User,Profile

# With entity references
python scripts/federation_scaffolder.py posts-service --entities Post --references User --port 4002

# Scaffold gateway
python scripts/federation_scaffolder.py gateway --subgraphs users:4001,posts:4002
```

## Common Workflows

### New GraphQL API Project

1. Design your schema in `schema.graphql`
2. Validate: `python scripts/schema_analyzer.py schema.graphql --validate`
3. Generate resolvers: `python scripts/resolver_generator.py schema.graphql --output src/resolvers --dataloader`
4. Implement business logic in generated files
5. Run tests and iterate

### Federation Migration

1. Identify domain boundaries
2. Scaffold subgraphs: `python scripts/federation_scaffolder.py [service] --entities [types]`
3. Configure gateway
4. Migrate queries gradually
5. Test cross-subgraph queries

### Performance Audit

1. Analyze schema complexity: `python scripts/schema_analyzer.py schema.graphql --complexity`
2. Review issues and recommendations
3. Implement DataLoader where needed
4. Add caching for expensive queries
5. Test with load testing tools

## Reference Documentation

- `references/schema-patterns.md` - Schema design best practices
- `references/federation-guide.md` - Apollo Federation architecture
- `references/performance-optimization.md` - Performance tuning guide

## Need Help?

- Check `--help` on any script
- Review SKILL.md for detailed workflows
- Consult reference documentation for patterns
