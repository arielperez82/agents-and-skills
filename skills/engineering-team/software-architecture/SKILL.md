---
name: software-architecture
description: Guide for quality-focused software architecture covering Clean Architecture, hexagonal (ports and adapters), dependency inversion, and domain-driven design. Use when designing systems, reviewing architecture, or implementing layered separation of concerns.
---

# Software Architecture Development Skill

This skill provides guidance for quality-focused software development and architecture based on Clean Architecture, Hexagonal Architecture (Ports and Adapters), and Domain-Driven Design principles.

## Consolidated References

- [Clean Architecture Principles](references/clean-architecture-principles.md) — The Dependency Rule, layers, boundary crossing, and properties of conforming systems (distilled from Martin, Cockburn, Palermo, Freeman/Pryce)
- [Hexagonal Architecture Patterns](references/hexagonal-architecture-patterns.md) — Concrete implementation patterns with TypeScript examples: directory convention, ports, adapters, factory with overrides, handler-as-factory, fakes over mocks, no-op adapters, error boundaries

## Code Style Rules

### General Principles

- **Early return pattern**: Always use early returns when possible, over nested conditions for better readability
- Avoid code duplication through creation of reusable functions and modules
- Decompose long (more than 80 lines of code) components and functions into multiple smaller components and functions. If they cannot be used anywhere else, keep it in the same file. But if file longer than 200 lines of code, it should be split into multiple files.
- Use arrow functions instead of function declarations when possible

### Best Practices

#### Library-First Approach

- **ALWAYS search for existing solutions before writing custom code**
  - Check npm for existing libraries that solve the problem
  - Evaluate existing services/SaaS solutions
  - Consider third-party APIs for common functionality
- Use libraries instead of writing your own utils or helpers. For example, use `cockatiel` instead of writing your own retry logic.
- **When custom code IS justified:**
  - Specific business logic unique to the domain
  - Performance-critical paths with special requirements
  - When external dependencies would be overkill
  - Security-sensitive code requiring full control
  - When existing solutions don't meet requirements after thorough evaluation

#### Clean Architecture and Hexagonal Architecture

The foundational rule: **source code dependencies can only point inwards**. Business logic must never import from infrastructure. All architectures that follow this rule (Clean Architecture, Hexagonal/Ports and Adapters, Onion Architecture) produce systems that are testable, framework-independent, and database-independent.

See [Clean Architecture Principles](references/clean-architecture-principles.md) for the full theory and [Hexagonal Architecture Patterns](references/hexagonal-architecture-patterns.md) for concrete implementation patterns (TypeScript examples; approach applies to any language).

**Layers (inside out):**

1. **Domain (entities + use cases)** — Pure business logic. No framework imports, no I/O. Depends only on port interfaces.
2. **Ports** — Interfaces that define what the domain needs. Zero implementation. One port, one responsibility.
3. **Adapters** — Concrete implementations of ports. All HTTP, database, serialization code lives here.
4. **Config / Factories** — Dependency wiring. Creates real adapters by default, accepts overrides for tests and alternate runtimes.
5. **Runtime / Entry points** — Reads environment, wires factories, delegates to domain. Lambda handlers, CLI, HTTP servers.

**Directory convention enforces the dependency rule:**

```
src/
├── domain/       # Business logic — imports only from ports/
├── ports/        # Interfaces only — no implementation
├── adapters/     # Implements ports — owns infrastructure concerns
├── config/       # Factories that wire adapters to domain
└── runtime/      # Entry points — read env, wire, delegate
```

**Key patterns:**

- **Dependencies object**: Domain services receive all ports via a typed dependencies interface (not positional params). Makes dependencies explicit and test wiring readable.
- **Factory with overrides**: `createService(config, overrides?)` — real adapters by default, easy injection for tests or alternate runtimes (e.g., CLI skips rate limiting via `NoOpRateLimiter`).
- **Handler-as-factory**: `createHandler(deps)` returns the handler function. The real export just wires and delegates. Keeps entry points testable.
- **Fakes over mocks**: Test doubles are real classes implementing port interfaces — configurable via constructor, inspectable via getters, self-documenting. No `jest.fn()` or `vi.mock()` for domain tests.
- **One adapter, one port**: Each adapter implements exactly one port. Multiple adapters can implement the same port (swap implementations without touching domain).
- **No-op adapter for optional behavior**: Skip capabilities without `if` checks in the domain.
- **Error boundaries at each layer**: Adapters throw typed errors. Domain catches and returns safe defaults. Runtime catches and returns responses. No layer leaks its errors upward.

#### Naming Conventions

- **AVOID** generic names: `utils`, `helpers`, `common`, `shared`
- **USE** domain-specific names: `OrderCalculator`, `UserAuthenticator`, `InvoiceGenerator`
- Follow bounded context naming patterns and ubiquitous language
- Each module should have a single, clear purpose

#### Separation of Concerns

- Do NOT mix business logic with UI components
- Keep database queries out of controllers (they belong in adapters)
- Maintain clear boundaries between contexts
- Ensure proper separation of responsibilities

#### Anti-Patterns to Avoid

- **NIH (Not Invented Here) Syndrome:**
  - Don't build custom auth when Auth0/Supabase exists
  - Don't write custom state management instead of using Redux/Zustand
  - Don't create custom form validation instead of using established libraries
- **Poor Architectural Choices:**
  - Mixing business logic with UI components
  - Database queries directly in controllers
  - Lack of clear separation of concerns
- **Generic Naming Anti-Patterns:**
  - `utils.js` with 50 unrelated functions
  - `helpers/misc.js` as a dumping ground
  - `common/shared.js` with unclear purpose
- Remember: Every line of custom code is a liability that needs maintenance, testing, and documentation

#### Code Quality

- Proper error handling with typed catch blocks
- Break down complex logic into smaller, reusable functions
- Avoid deep nesting (max 3 levels)
- Keep functions focused and under 50 lines when possible
- Keep files focused and under 200 lines of code when possible
