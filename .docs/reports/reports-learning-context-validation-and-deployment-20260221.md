# These gaps share a common root cause: the agent focused on creating the thing but not on integrating the thing into the system. 

 Here's what I'd recommend: 
 
 1. Craft needs a "Convention Discovery" phase before coding
 
 When the task is "add a new X" (package, collector, service, module), the agent should first answer: "What do existing X's touch?" Concretely:

 - Find all instances of the nearest analog (e.g., grep -r "liquidity-collector" across the entire repo)
 - Catalog every file that references it: workflows, configs, scripts, Terraform, workspace files, bundler configs
 - That catalog becomes the integration checklist — not just the application code

 This is a pattern-matching task, not a creative task. It should be mechanical and exhaustive.

 2. Separate "build" from "integrate" phases with distinct exit criteria

 Right now craft treats implementation as one phase. It should be two:

 - Build phase: Write the application code, tests, configs within the package boundary. Exit criteria: tests pass, lint passes, coverage meets
 thresholds within the package.
 - Integrate phase: Wire the new package into every system that needs to know about it. Exit criteria: every file that references a sibling
 package also references the new one (or has an explicit reason not to).

 The integrate phase is where all 6 of your gaps live. It's also the phase most likely to be skipped because the agent feels "done" after the
 build phase.

 3. Quality gates should be verified, not assumed

 The agent should actually run the checks, not just write code that it believes will pass:

 - After writing lint config: run lint and show the output
 - After writing tests: run coverage and compare against CI thresholds
 - After modifying lint-staged: make a real commit (or dry-run) to verify hooks fire
 - After modifying Terraform: run fmt -check, validate, and test

 The principle: if CI will run it, the agent should run it locally first. An agent that writes code but doesn't run the verification is doing
 half the job.

 4. The "analog diff" technique for completeness

 When adding the Nth instance of a pattern, the agent should generate what I'd call an "analog diff" — a structured comparison:

 "Liquidity-collector appears in these 14 files. Stacking-collector currently appears in these 8 files. Here are the 6 gaps: ..."

 This is trivially automatable with grep. It should be a standard step in any craft workflow that adds a new instance of an existing pattern.

 5. Craft should distinguish "greenfield" from "Nth-of-kind"

 These are fundamentally different tasks:

 - Greenfield: Design decisions, architecture, scaffolding. The creative work.
 - Nth-of-kind: Follow established patterns exactly. The mechanical work.

 Most "new collector" work is 80% Nth-of-kind. The agent should detect this (there are already 3 collectors — this is clearly a pattern) and
 shift into convention-following mode where completeness matters more than creativity.

 6. Exit checklist should be domain-aware, not generic

 A generic "did you write tests?" checklist misses domain-specific integration points. The craft command (or a post-craft validation phase)
 should support project-specific exit checklists that can be loaded from the repo — something like a .claude/checklists/new-collector.md that the
 agent consults before declaring done.

 This way the project encodes its own definition of done, and the agent enforces it rather than reinventing it each time.

 ---
 The one-sentence summary: The biggest gap isn't in how agents write code — it's in how they verify that new code is fully integrated into the
 existing system. Convention discovery, analog diffing, and local verification of CI checks would have caught all 6 of these issues mechanically.