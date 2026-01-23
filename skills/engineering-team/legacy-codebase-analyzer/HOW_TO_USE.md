# How to Use the Legacy Codebase Analyzer Skill

## Quick Start

Hey Claude—I just added the "legacy-codebase-analyzer" skill. Can you analyze this legacy codebase and create a modernization plan?

## Example Invocations

### Example 1: Complete Legacy Analysis
```
Hey Claude—I just added the "legacy-codebase-analyzer" skill. Can you analyze this PHP codebase and identify technical debt, security vulnerabilities, and create a modernization roadmap?
```

### Example 2: Focused Security Audit
```
Hey Claude—I just added the "legacy-codebase-analyzer" skill. Can you scan this legacy Node.js application for security vulnerabilities and outdated dependencies?
```

### Example 3: Modernization Planning
```
Hey Claude—I just added the "legacy-codebase-analyzer" skill. Can you create a prioritized modernization roadmap for this legacy Java monolith with migration recommendations?
```

## What to Provide

When using this skill, provide:

- **Codebase Path**: Directory path to the legacy codebase
- **Technology Context**: Programming languages, frameworks, and tech stack
- **Business Context** (optional): Critical systems, constraints, timeline
- **Focus Areas** (optional): Security, performance, architecture, or specific concerns

## What You'll Get

This skill will provide:

- **Comprehensive Inventory**: File types, languages, dependencies, and codebase structure analysis
- **Technical Debt Score**: Quantified debt metrics with priority rankings and cost estimates
- **Security Assessment**: Vulnerability scanning with CVE references and remediation guidance
- **Modernization Roadmap**: Phased migration plan with effort estimates and risk analysis

## Python Tools Available

This skill includes 7 production-ready Python tools:

- **codebase_inventory.py**: Generate comprehensive codebase inventory with file analysis and dependency mapping
- **technical_debt_scorer.py**: Calculate technical debt scores with priority recommendations
- **security_vulnerability_scanner.py**: Scan for security vulnerabilities and outdated dependencies
- **architecture_health_analyzer.py**: Analyze architecture patterns and identify anti-patterns
- **performance_bottleneck_detector.py**: Detect performance issues and optimization opportunities
- **code_quality_analyzer.py**: Assess code quality metrics and maintainability
- **modernization_roadmap_generator.py**: Generate phased modernization plans with effort estimates

You can run these tools directly:

```bash
python skills/engineering-team/legacy-codebase-analyzer/scripts/codebase_inventory.py /path/to/codebase --help
python skills/engineering-team/legacy-codebase-analyzer/scripts/technical_debt_scorer.py /path/to/codebase --help
python skills/engineering-team/legacy-codebase-analyzer/scripts/security_vulnerability_scanner.py /path/to/codebase --help
```

## Tips for Best Results

1. **Start with Inventory**: Run codebase_inventory.py first to understand the scope and structure before detailed analysis
2. **Prioritize by Risk**: Use technical_debt_scorer.py to identify high-risk areas requiring immediate attention
3. **Security First**: Run security_vulnerability_scanner.py early to identify critical vulnerabilities
4. **Phased Approach**: Use modernization_roadmap_generator.py to create a realistic migration plan with manageable phases

## Related Skills

Consider using these skills together:

- **[Senior Security](../senior-security/)**: Deep security analysis and threat modeling for vulnerability remediation
- **[Senior Architect](../senior-architect/)**: Architecture redesign and modernization strategy guidance
- **[Code Reviewer](../code-reviewer/)**: Detailed code review for refactoring recommendations

---

**Skill**: legacy-codebase-analyzer
**Domain**: engineering
**Version**: v1.0.0
**Last Updated**: 2025-12-13
