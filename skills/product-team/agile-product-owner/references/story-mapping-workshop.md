<!-- Source: Product-Manager-Skills by Dean Peters (https://github.com/deanpeters/Product-Manager-Skills)
     Merged from: user-story-mapping + user-story-mapping-workshop
     License: CC BY-NC-SA 4.0 — Attribution required, NonCommercial, ShareAlike
     Adapted for agents-and-skills skill format. -->

# Story Mapping Workshop

## Part 1: Story Mapping Methodology

### Purpose
Visualize the user journey by creating a hierarchical map that breaks down high-level activities into steps and tasks, organized left-to-right as a narrative flow. Use this to build shared understanding across product, design, and engineering, prioritize features based on user workflows, and identify gaps or opportunities in the user experience.

This is not a backlog—it's a strategic artifact that shows *how* users accomplish their goals, which then informs *what* to build.

### Key Concepts

#### The Jeff Patton Story Mapping Framework
Invented by Jeff Patton, story mapping organizes work into a 2D structure:

**Horizontal axis (left-to-right):** User journey over time
- **Backbone:** High-level activities the user performs
- **Steps:** Specific actions within each activity
- **Tasks:** Detailed work required to complete each step

**Vertical axis (top-to-bottom):** Priority and releases
- **Top rows:** Essential tasks (MVP / Release 1)
- **Lower rows:** Nice-to-have tasks (Future releases)

#### Story Map Structure

```
Segment -> Persona -> Narrative (User's goal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Activity 1] -> [Activity 2] -> [Activity 3] -> [Activity 4] -> [Activity 5]
     |              |              |              |              |
  [Step 1.1]     [Step 2.1]     [Step 3.1]     [Step 4.1]     [Step 5.1]
  [Step 1.2]     [Step 2.2]     [Step 3.2]     [Step 4.2]     [Step 5.2]
  [Step 1.3]     [Step 2.3]     [Step 3.3]     [Step 4.3]     [Step 5.3]
     |              |              |              |              |
  [Task 1.1.1]   [Task 2.1.1]   [Task 3.1.1]   [Task 4.1.1]   [Task 5.1.1]
  [Task 1.1.2]   [Task 2.1.2]   [Task 3.1.2]   [Task 4.1.2]   [Task 5.1.2]
  [Task 1.1.3]   [Task 2.1.3]   [Task 3.1.3]   [Task 4.1.3]   [Task 5.1.3]
  ...            ...            ...            ...            ...
```

#### Why This Works
- **User-centric:** Organizes work around user goals, not engineering modules
- **Shared understanding:** Product, design, engineering all see the same journey
- **Prioritization clarity:** Top tasks = MVP, lower tasks = future iterations
- **Gap identification:** Missing steps or tasks become obvious
- **Release planning:** Draw horizontal "release lines" to define scope

#### Anti-Patterns (What This Is NOT)
- **Not a Gantt chart:** This isn't project management—it's user journey visualization
- **Not a feature list:** Activities aren't features—they're user behaviors
- **Not static:** Story maps evolve as you learn more about users

#### When to Use This
- Kicking off a new product or major feature
- Aligning stakeholders on user workflow
- Prioritizing backlog based on user needs
- Identifying MVP vs. future releases
- Onboarding new team members to the product vision

#### When NOT to Use This
- For trivial features (don't map what you already understand)
- When user workflows are constantly changing (map stabilizes workflows)
- As a replacement for user stories (the map informs stories, doesn't replace them)

---

### Application

#### Step 1: Define the Context

##### Segment
Who are you building for?

```markdown
### Segment:
- [Specify the target segment, e.g., "Small business owners using DIY accounting software"]
```

**Quality checks:**
- **Specific:** Not "users" but "enterprise IT admins" or "freelance designers"

---

##### Persona
Provide details about the persona within this segment.

```markdown
### Persona:
- [Describe the persona: demographics, behaviors, pains, goals]
```

**Example:**
- "Sarah, 35-year-old freelance graphic designer, manages 5-10 client projects at once, struggles with invoicing and payment tracking, wants to spend less time on admin and more time designing"

---

#### Step 2: Define the Narrative
What is the user trying to accomplish? Frame this as a Jobs-to-be-Done statement.

```markdown
### Narrative:
- [Concise narrative of the persona's objective, e.g., "Complete a client project from kickoff to final payment"]
```

**Quality checks:**
- **Outcome-focused:** Not "use the product" but "deliver a client project on time and get paid"
- **One sentence:** If it takes more than one sentence, the scope may be too broad

---

#### Step 3: Identify Activities (Backbone)
List 3-5 high-level activities the persona engages in to fulfill the narrative. These form the backbone of your map.

```markdown
### Activities:
1. [Activity 1, e.g., "Negotiate project scope and pricing"]
2. [Activity 2, e.g., "Execute design work"]
3. [Activity 3, e.g., "Deliver final assets to client"]
4. [Activity 4, e.g., "Send invoice and receive payment"]
5. [Activity 5, optional]
```

**Quality checks:**
- **Sequential:** Activities happen in order (left-to-right)
- **User actions:** Describe what the user *does*, not what the product *provides*
- **3-5 activities:** Too few = oversimplified, too many = overwhelming

---

#### Step 4: Break Activities into Steps
For each activity, list 3-5 steps that detail how the activity is carried out.

```markdown
### Steps:

**For Activity 1: [Activity Name]**
- Step 1: [Detail step 1, e.g., "Review client brief"]
- Step 2: [Detail step 2, e.g., "Draft project proposal"]
- Step 3: [Detail step 3, e.g., "Negotiate timeline and budget"]
- Step 4: [Optional step 4]
- Step 5: [Optional step 5]

**For Activity 2: [Activity Name]**
- Step 1: [Detail step 1]
- Step 2: [Detail step 2]
...
```

**Quality checks:**
- **Actionable:** Each step is something the user does
- **Observable:** You could watch someone perform this step
- **Logical sequence:** Steps follow a natural order

---

#### Step 5: Break Steps into Tasks
For each step, list 5-7 tasks that must be completed.

```markdown
### Tasks:

**For Activity 1, Step 1: [Step Name]**
- Task 1: [Detail task 1, e.g., "Read client brief document"]
- Task 2: [Detail task 2, e.g., "Identify key deliverables"]
- Task 3: [Detail task 3, e.g., "Note budget constraints"]
- Task 4: [Detail task 4, e.g., "Clarify timeline expectations"]
- Task 5: [Detail task 5, e.g., "List open questions for client"]
- Task 6: [Optional task 6]
- Task 7: [Optional task 7]

**For Activity 1, Step 2: [Step Name]**
- Task 1: [Detail task 1]
...
```

**Quality checks:**
- **Granular:** Tasks are small, specific actions
- **User-facing or behind-the-scenes:** Include both (e.g., "Send email" and "Receive confirmation")
- **Prioritizable:** You'll prioritize tasks vertically (top = essential, bottom = nice-to-have)

---

#### Step 6: Prioritize Vertically
Arrange tasks top-to-bottom by priority:
- **Top rows:** MVP / Release 1 (must-have)
- **Middle rows:** Release 2 (important but not critical)
- **Bottom rows:** Future / Nice-to-have

Draw horizontal "release lines" to demarcate scope.

---

#### Step 7: Identify Gaps and Opportunities
Review the map and ask:
- Are there missing steps or tasks?
- Are there pain points we're not addressing?
- Are there opportunities to delight users?
- Do all activities flow logically?

---

### Common Pitfalls (Methodology)

#### Pitfall 1: Activities Are Features, Not User Behaviors
**Symptom:** "Activity 1: Use the dashboard. Activity 2: Generate reports."

**Consequence:** You've mapped the product, not the user journey.

**Fix:** Reframe as user actions: "Activity 1: Monitor project progress. Activity 2: Summarize work for stakeholders."

---

#### Pitfall 2: Too Many Activities
**Symptom:** 10+ activities across the backbone

**Consequence:** Map becomes overwhelming and loses focus.

**Fix:** Consolidate. If you have 10 activities, you're likely mixing activities with steps. Aim for 3-5 high-level activities.

---

#### Pitfall 3: Tasks Are Too Vague
**Symptom:** "Task 1: Do the thing"

**Consequence:** Can't prioritize or estimate vague tasks.

**Fix:** Be specific: "Task 1: Enter client email address in the 'Bill To' field."

---

#### Pitfall 4: Ignoring Vertical Prioritization
**Symptom:** All tasks at the same level—no MVP vs. future releases defined

**Consequence:** No clarity on what to build first.

**Fix:** Explicitly prioritize. Draw release lines. Force hard choices about what's MVP.

---

#### Pitfall 5: Mapping in Isolation
**Symptom:** PM creates the map alone, then presents it to the team

**Consequence:** No shared ownership or understanding.

**Fix:** Map collaboratively. Run a story mapping workshop with product, design, and engineering.

---

### Template

```markdown
## User Story Map Template

### Who

#### Segment:
- [Specify the target segment]

#### Persona:
- [Describe the persona and their key characteristics]

### Backbone

#### Narrative:
- [Insert the concise narrative of the persona's objective]

#### Activities:
1. [Describe Activity 1]
2. [Describe Activity 2]
3. [Continue as necessary for up to 5 activities]

#### Steps:
For [Activity 1]:
- Step 1: [Detail Step 1 for Activity 1]
- Step 2: [Detail Step 2 for Activity 1]
- Step 3: [Detail Step 3 for Activity 1]

#### Tasks:
For [Activity 1, Step 1]:
- Task 1: [Detail Task 1 for Step 1 of Activity 1]
- Task 2: [Detail Task 2 for Step 1 of Activity 1]
- Task 3: [Detail Task 3 for Step 1 of Activity 1]
```

---

### Example: Story Map for Freelance Invoicing Product

```markdown
## User Story Map: Freelance Invoicing

### Who

#### Segment:
- Freelance creative professionals (designers, writers, photographers)

#### Persona:
- Sarah, 35, freelance graphic designer
- Manages 5-10 clients at once
- Struggles with invoicing, payment tracking, and follow-ups
- Wants to spend less time on admin, more time designing
- Currently uses Excel + email, which is error-prone and time-consuming

### Backbone

#### Narrative:
- Complete a client project from kickoff to final payment without admin hassle

#### Activities:
1. Negotiate project scope and pricing
2. Execute design work
3. Deliver final assets
4. Send invoice and receive payment
5. Follow up on late payments

### Steps:

**For Activity 1: Negotiate project scope and pricing**
- Step 1: Review client brief
- Step 2: Draft project proposal
- Step 3: Negotiate timeline and budget

**For Activity 2: Execute design work**
- Step 1: Create initial concepts
- Step 2: Share concepts for feedback
- Step 3: Iterate based on feedback
- Step 4: Finalize design

**For Activity 3: Deliver final assets**
- Step 1: Export final files in client-requested formats
- Step 2: Upload files to shared folder or email
- Step 3: Confirm client receipt

**For Activity 4: Send invoice and receive payment**
- Step 1: Create invoice with project details
- Step 2: Send invoice to client
- Step 3: Track payment status
- Step 4: Confirm payment received

**For Activity 5: Follow up on late payments**
- Step 1: Identify overdue invoices
- Step 2: Send payment reminder
- Step 3: Escalate if still unpaid

### Tasks (Sample for Activity 4, Step 1: Create invoice):

**MVP (Release 1):**
- Task 1: Enter client name and contact info
- Task 2: Add line items (description, hours, rate)
- Task 3: Calculate total automatically
- Task 4: Preview invoice before sending

**Release 2:**
- Task 5: Add logo and custom branding
- Task 6: Save invoice templates for repeat clients
- Task 7: Auto-populate line items from project notes

**Future:**
- Task 8: Generate invoices from time tracking data
- Task 9: Multi-currency support
```

---

### References (Methodology)

#### External Frameworks
- Jeff Patton, *User Story Mapping* (2014) — Origin of the story mapping technique
- Teresa Torres, *Continuous Discovery Habits* (2021) — Opportunity solution trees (complementary to story maps)

#### Provenance
- Adapted from `prompts/user-story-mapping.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.

---

## Part 2: Workshop Facilitation Protocol

### Purpose
Guide product managers through creating a user story map by asking adaptive questions about the system, users, workflow, and priorities—then generating a two-dimensional map with backbone (activities), user tasks, and release slices. Use this to move from flat backlogs to visual story maps that communicate the big picture, identify missing functionality, and enable meaningful release planning—avoiding "context-free mulch" where stories lose connection to the overall system narrative.

This is not a backlog generator—it's a visual communication framework that organizes work by user workflow (horizontal) and priority (vertical).

### Key Concepts

#### What is a User Story Map?

A story map (Jeff Patton) organizes user stories in **two dimensions**:

**Horizontal axis (left to right):** Activities arranged in narrative/workflow order—the sequence you'd use explaining the system to someone

**Vertical axis (top to bottom):** Priority within each activity, with the most essential tasks at the top

**Structure:**
```
Backbone (Activities across top)
|
User Tasks (descending vertically by priority)
|
Details/Acceptance Criteria (at the bottom)
```

#### Key Principles

**The Backbone:** Essential activities form the system's structural core—these aren't prioritized against each other; they're the narrative flow.

**Walking Skeleton:** The highest-priority tasks across all activities form the minimal viable product—the smallest end-to-end functionality.

**Ribs:** Supporting tasks descend vertically under each activity, indicating priority through placement.

**Left-to-Right, Top-to-Bottom Build Strategy:** Build incrementally across all major features rather than completing one feature fully before starting another.

#### Why This Works
- **Visual communication:** Story maps remain displayed as information radiators, maintaining focus on the big picture
- **Narrative structure:** Organizes by user workflow, not technical architecture
- **Release planning:** Horizontal slices reveal MVPs and incremental releases
- **Gap identification:** Reveals missing functionality that flat backlogs obscure

#### Anti-Patterns (What This Is NOT)
- **Not a Gantt chart:** Story maps show priority, not time estimates
- **Not technical architecture:** Maps follow user workflow, not system layers (UI -> API -> DB)
- **Not a project plan:** It's a discovery and communication tool, not a schedule

#### When to Use This
- Starting a new product or major feature
- Reframing an existing backlog (moving from flat list to visual map)
- Aligning stakeholders on scope and priorities
- Planning MVP or incremental releases

#### When NOT to Use This
- Single-feature projects (story map overkill)
- When backlog is already well-understood and prioritized
- For technical refactoring work (no user workflow to map)

---

### Workshop Flow

This interactive skill asks **up to 5 adaptive questions**, offering **3-4 enumerated options** at each step.

---

#### Step 0: Gather Context (Before Questions)

Before creating the story map, gather context:

**Product/Feature Context:**
- What system or feature are you mapping?
- Product concept, PRD draft, or existing backlog
- Website copy, positioning materials, or user flows
- Existing user stories (if transitioning from flat backlog)

**User Context:**
- Target personas or user segments
- User research, interviews, or journey maps
- Jobs-to-be-done or problem statements

---

#### Question 1: Define Scope

"What are you mapping? (What's the scope?)"

**Options:**

1. **Entire product** — "Full end-to-end system from discovery to completion" (Common for new products or full rewrites)
2. **Major feature area** — "Specific workflow within a larger product (e.g., 'onboarding,' 'checkout,' 'reporting')" (Common for feature launches)
3. **User journey** — "Specific user goal or job-to-be-done (e.g., 'hire a contractor,' 'file taxes')" (Common for JTBD-driven mapping)
4. **Redesign/refactor** — "Existing product/feature being rebuilt or simplified" (Common for legacy system modernization)

Or describe your specific scope.

---

#### Question 2: Identify Users/Personas

"Who are the primary users for this map? (List personas or user segments.)"

**Options:**

1. **Single persona** — "One primary user type (e.g., 'small business owner')" (Simplifies mapping, good for MVP)
2. **Multiple personas, shared workflow** — "Different user types, same core activities (e.g., 'buyer' and 'seller' both browse listings)" (Common for marketplaces)
3. **Multiple personas, different workflows** — "Different user types with distinct workflows (e.g., 'admin' vs. 'end user')" (Requires separate maps or swim lanes)
4. **Roles within organization** — "Different job functions (e.g., 'PM,' 'designer,' 'engineer')" (Common for internal tools)

Or describe your users.

**Adaptation:** Use personas from context provided in Step 0 (proto-personas, JTBD, etc.)

---

#### Question 3: Generate Backbone (Activities)

"Let's build the backbone—the narrative flow of activities users perform to accomplish their goal."

Generate 5-8 activities based on scope (Q1) and users (Q2), arranged left-to-right in workflow order.

**Example (if Scope = "E-commerce checkout"):**

```
Backbone Activities (left to right):

1. Browse Products
2. Add to Cart
3. Review Cart
4. Enter Shipping Info
5. Enter Payment Info
6. Confirm Order
7. Receive Confirmation
```

"Does this backbone capture the full workflow? Should we add, remove, or reorder activities?"

---

#### Question 4: Generate User Tasks (Under Each Activity)

"Now let's add user tasks under each activity, organized by priority (top = must-have, bottom = nice-to-have)."

Generate 3-5 user tasks per activity, arranged vertically by priority.

**Example (for Activity 2: "Add to Cart"):**

```
Add to Cart (Activity)
|- Add single item to cart (must-have, walking skeleton)
|- Adjust quantity (must-have)
|- Add multiple items at once (should-have)
|- Save item for later (nice-to-have)
|- Add gift wrapping (nice-to-have)
```

Repeat for all backbone activities, showing the full map.

"Does this capture the key tasks? Are priorities correct (top = MVP, bottom = later releases)?"

---

#### Question 5: Identify Release Slices (Walking Skeleton + Increments)

"Let's define release slices by drawing horizontal lines across the map."

Generate 3 release slices:

**Release 1 (Walking Skeleton):** Top-priority tasks across all activities—minimal end-to-end functionality

**Release 2 (Next Increment):** Second-priority tasks that enhance the core workflow

**Release 3 (Polish/Expansion):** Third-priority tasks (nice-to-haves, edge cases, optimizations)

**Example:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Release 1 (Walking Skeleton):
- Browse products (basic list view)
- Add single item to cart
- Review cart (line items + total)
- Enter shipping info (name, address)
- Enter payment info (credit card only)
- Confirm order (basic confirmation)
- Receive email confirmation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Release 2 (Enhanced):
- Product filtering/search
- Adjust quantity in cart
- Save for later
- Multiple shipping options
- Multiple payment methods
- Order tracking link
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Release 3 (Polish):
- Product recommendations
- Guest checkout
- Gift wrapping
- Promo codes
- Advanced payment options
- Post-purchase surveys
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

"Do these release slices make sense? Should we adjust scope or priorities?"

---

### Output: User Story Map

After completing the flow, the output includes:

```markdown
# User Story Map: [Scope from Q1]

**Users:** [From Q2]
**Date:** [Today's date]

---

## Backbone (Activities)

[Activity 1] -> [Activity 2] -> [Activity 3] -> [Activity 4] -> [Activity 5] -> [Activity 6]

---

## Full Story Map

### [Activity 1: Name]
- **[Task 1.1]** — Must-have (Release 1)
- **[Task 1.2]** — Should-have (Release 2)
- **[Task 1.3]** — Nice-to-have (Release 3)

### [Activity 2: Name]
- **[Task 2.1]** — Must-have (Release 1)
- **[Task 2.2]** — Should-have (Release 2)
- **[Task 2.3]** — Nice-to-have (Release 3)

[...repeat for all activities...]

---

## Release Slices

### Release 1: Walking Skeleton (MVP)
**Goal:** Minimal end-to-end functionality

**Stories:**
- [Task 1.1] — [Activity 1]
- [Task 2.1] — [Activity 2]
- [Task 3.1] — [Activity 3]
- [Task 4.1] — [Activity 4]
- [Task 5.1] — [Activity 5]
- [Task 6.1] — [Activity 6]

**Why this is the walking skeleton:** Delivers complete workflow with simplest version of each activity.

---

### Release 2: Enhanced Functionality
**Goal:** Improve core workflow with priority enhancements

**Stories:**
- [Task 1.2] — [Activity 1]
- [Task 2.2] — [Activity 2]
- [Task 3.2] — [Activity 3]
[...]

---

### Release 3: Polish & Expansion
**Goal:** Nice-to-haves, edge cases, optimizations

**Stories:**
- [Task 1.3] — [Activity 1]
- [Task 2.3] — [Activity 2]
[...]

---

## Next Steps

1. **Refine stories:** Write detailed stories with acceptance criteria
2. **Estimate effort:** Score stories (story points, t-shirt sizes)
3. **Validate with stakeholders:** Walk through map left-to-right, confirm priorities
4. **Display map:** Print/post as information radiator for ongoing reference
```

---

### Workshop Examples

#### Example 1: Good Story Map (E-commerce Checkout)

**Q1 Response:** "Major feature area — E-commerce checkout workflow"

**Q2 Response:** "Single persona — Online shopper"

**Q3 - Backbone Generated:**
```
Browse -> Add to Cart -> Review Cart -> Enter Shipping -> Enter Payment -> Confirm -> Receive Confirmation
```

**Q4 - User Tasks Generated:**

```
Browse Products
|- View product list (R1)
|- Search/filter (R2)
|- Product recommendations (R3)

Add to Cart
|- Add single item (R1)
|- Adjust quantity (R2)
|- Save for later (R3)

Review Cart
|- View line items + total (R1)
|- Apply promo code (R2)
|- Estimate shipping cost (R3)

[...etc...]
```

**Q5 - Release Slices:**
- **Release 1:** Walking skeleton—basic flow with no extras
- **Release 2:** Search, quantity adjustment, promo codes
- **Release 3:** Recommendations, guest checkout, gift options

**Why this works:**
- Backbone follows user narrative (not technical layers)
- Walking skeleton delivers end-to-end value
- Incremental releases add sophistication without breaking core flow

---

#### Example 2: Bad Story Map (Technical Layers)

**Backbone (WRONG):**
```
UI Layer -> API Layer -> Database Layer -> Deployment
```

**Why this fails:**
- Not user-centric (users don't care about technical architecture)
- Can't deliver end-to-end value incrementally
- Waterfall thinking disguised as story mapping

**Fix:**
- Map by user workflow: "Sign Up -> Configure Settings -> Invite Team -> Start Project"
- Each release delivers full workflow, not a single layer

---

### Common Pitfalls (Workshop)

#### Pitfall 1: Flat Backlog in Disguise
**Symptom:** Story map is just a vertical list, no horizontal narrative

**Consequence:** Loses communication benefit; still "context-free mulch"

**Fix:** Force horizontal structure—activities across top, tasks descending vertically

---

#### Pitfall 2: Technical Architecture as Backbone
**Symptom:** Backbone = "Frontend -> Backend -> Database"

**Consequence:** Not user-centric, can't deliver value incrementally

**Fix:** Backbone should follow user workflow, not system layers

---

#### Pitfall 3: Feature-Complete Waterfall
**Symptom:** Release 1 = "Build Activity 1 fully," Release 2 = "Build Activity 2 fully"

**Consequence:** No end-to-end value until all activities complete

**Fix:** Walking skeleton = thin slice across ALL activities, incrementally enhanced

---

#### Pitfall 4: Too Much Detail Too Soon
**Symptom:** Trying to map every edge case and acceptance criterion upfront

**Consequence:** Analysis paralysis, lost big picture

**Fix:** Start with backbone + high-level tasks, refine later

---

#### Pitfall 5: Map Hidden in a Tool
**Symptom:** Story map lives in Jira/Miro, never displayed

**Consequence:** Loses value as information radiator

**Fix:** Print/post map physically; make it visible to team daily

---

### Workshop Template

#### Agenda (90-120 minutes)
1. Context and scope (10 min)
2. Personas and narrative (10 min)
3. Build the backbone activities (15 min)
4. Add steps and tasks (20 min)
5. Prioritize vertical slices (15 min)
6. Draft stories and identify split candidates (15 min)
7. Review, risks, and next steps (5 min)

#### Inputs
- Problem statement or JTBD narrative
- Target segment and persona
- Existing research, discovery notes, or backlog (optional)

#### Outputs Checklist
- Story map: backbone, steps, and tasks
- Release slices (Walking Skeleton, Release 2, Release 3)
- Draft user stories for top-priority tasks
- Story splitting candidates with selected split rationale

---

### References (Workshop)

#### External Frameworks
- Jeff Patton, *User Story Mapping* (2014) — Origin of story mapping framework
- Jeff Patton, "The New User Story Backlog is a Map" (blog) — Explains backbone concept

#### Provenance
- Derived from `prompts/user-story-mapping.md` and `user-story-mapping-workshop` in the `https://github.com/deanpeters/product-manager-prompts` repo.
