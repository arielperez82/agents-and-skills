# BDD Scenarios: I29-GTMSO — GTM Sales Ops & Revenue

## US-1: Sales Ops Analyst Agent

### Scenario: Agent file has valid structure
Given a new agent file `agents/sales-ops-analyst.md`
When `/agent/validate` runs against it
Then the agent passes validation with zero errors

### Scenario: Agent has correct classification
Given the sales-ops-analyst agent
When I inspect the classification block
Then type is "implementation", color is "green", field is "sales", model is "sonnet"

### Scenario: Agent references correct core skills
Given the sales-ops-analyst agent
When I inspect the skills list
Then it includes "sales-team/crm-ops" and "sales-team/pipeline-forecasting"

### Scenario: Agent has required collaborations
Given the sales-ops-analyst agent
When I inspect collaborates-with
Then it includes account-executive and marketing-ops-manager

### Scenario: Agent differentiates from account-executive
Given the sales-ops-analyst agent body
When I read the Purpose section
Then it explicitly differentiates system-level pipeline analytics from AE's deal-level intelligence

## US-2: CRM Ops Skill

### Scenario: Skill file exists with valid frontmatter
Given a new skill at `skills/sales-team/crm-ops/SKILL.md`
When I parse the YAML frontmatter
Then all required fields are present (name, description, domain, related-agents)

### Scenario: Skill covers required topics
Given the crm-ops skill body
When I inspect the content
Then it covers CRM data model design, data hygiene practices, and integration patterns

### Scenario: Skill has reference files
Given the crm-ops skill directory
When I list `skills/sales-team/crm-ops/references/`
Then at least 1 reference file exists

## US-3: Pipeline Forecasting Skill

### Scenario: Skill is complementary to pipeline-analytics
Given both `pipeline-analytics` and `pipeline-forecasting` skills
When I compare their coverage
Then pipeline-analytics covers health monitoring and deal risk
And pipeline-forecasting covers forecasting methods and forecast cadence
And neither duplicates the other's primary content

### Scenario: Skill has forecasting benchmarks
Given the pipeline-forecasting skill
When I read the content
Then it includes B2B SaaS pipeline benchmarks

## US-4: Revenue Ops Analyst Agent

### Scenario: Agent has strategic classification
Given the revenue-ops-analyst agent
When I inspect the classification block
Then type is "strategic", color is "blue", field is "sales", model is "sonnet"

### Scenario: Agent covers full-funnel analytics
Given the revenue-ops-analyst agent body
When I read the Purpose section
Then it covers lead-to-renewal funnel, GTM efficiency metrics, and cross-functional alignment

### Scenario: Agent differentiates from sales-ops-analyst
Given the revenue-ops-analyst agent body
When I read the Purpose section
Then it explicitly differentiates company-level cross-GTM analytics from sales-ops pipeline-level analytics

## US-5: Revenue Analytics Skill

### Scenario: Skill complements saas-finance
Given both `revenue-analytics` and `saas-finance` skills
When I compare their coverage
Then revenue-analytics covers operational GTM metrics
And saas-finance covers business/product strategy metrics

## US-6: Cadence Design Skill

### Scenario: Skill differentiates from sales-outreach
Given both `cadence-design` and `sales-outreach` skills
When I compare coverage
Then sales-outreach covers individual message crafting
And cadence-design covers sequence architecture and multi-channel timing

### Scenario: Skill has cadence template reference
Given the cadence-design skill directory
When I list references
Then a cadence template reference file exists

## US-7: Enhance Existing Sales Agents

### Scenario: SDR has cadence-design in related-skills
Given the sales-development-rep agent after enhancement
When I inspect related-skills
Then it includes "sales-team/cadence-design"

### Scenario: SDR has sales-ops-analyst in related-agents
Given the sales-development-rep agent after enhancement
When I inspect related-agents
Then it includes "sales-ops-analyst"

### Scenario: AE has pipeline-forecasting in related-skills
Given the account-executive agent after enhancement
When I inspect related-skills
Then it includes "sales-team/pipeline-forecasting"

### Scenario: AE has sales-ops-analyst in collaborates-with
Given the account-executive agent after enhancement
When I inspect collaborates-with
Then it includes a sales-ops-analyst entry with pipeline data handoff purpose

### Scenario: All modified agents pass validation
Given the modified sales-development-rep and account-executive agents
When `/agent/validate` runs against them
Then both pass with zero errors

## US-8: README Updates

### Scenario: README contains new agent entries
Given the updated agents/README.md
When I search for "sales-ops-analyst" and "revenue-ops-analyst"
Then both entries exist following the existing format
