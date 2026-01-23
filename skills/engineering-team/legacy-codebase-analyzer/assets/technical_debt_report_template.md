# Technical Debt Assessment Report

**System Name:** {system_name}
**Version:** {system_version}
**Assessment Date:** {assessment_date}
**Report Version:** {report_version}
**Assessment Period:** {assessment_period}

---

## 1. Executive Summary

{executive_summary_paragraph}

### Key Metrics

| Metric | Value | Target | Gap |
|--------|-------|--------|-----|
| Overall Technical Debt Score | {overall_score}/100 | {target_score}/100 | {score_gap} |
| Critical Vulnerabilities | {critical_vuln_count} | 0 | {vuln_gap} |
| Test Coverage | {test_coverage}% | {target_coverage}% | {coverage_gap}% |
| Code Duplication | {duplication_percentage}% | {target_duplication}% | {duplication_gap}% |
| Technical Debt Ratio | {debt_ratio}% | {target_debt_ratio}% | {debt_ratio_gap}% |
| Estimated Remediation Time | {remediation_time} person-weeks | - | - |

---

## 2. Methodology

### Tools and Techniques Used

{methodology_tools_description}

**Analysis Tools:**
- {tool_1}
- {tool_2}
- {tool_3}
- {tool_4}

**Metrics Collected:**
- {metric_1}
- {metric_2}
- {metric_3}

### Scope

**Included in Analysis:**
- {scope_item_1}
- {scope_item_2}
- {scope_item_3}

**Excluded from Analysis:**
- {exclusion_1}
- {exclusion_2}

### Limitations

{methodology_limitations}

---

## 3. Findings by Category

### 3.1 Security Assessment

**Overall Security Score:** {security_score}/100
**Risk Level:** {security_risk_level}

#### Critical Findings (Immediate Action Required)

{security_critical_findings}

| ID | Severity | Issue | Location | CVSS Score | CWE |
|----|----------|-------|----------|------------|-----|
| {sec_critical_1_id} | Critical | {sec_critical_1_issue} | {sec_critical_1_location} | {sec_critical_1_cvss} | {sec_critical_1_cwe} |
| {sec_critical_2_id} | Critical | {sec_critical_2_issue} | {sec_critical_2_location} | {sec_critical_2_cvss} | {sec_critical_2_cwe} |
| {sec_critical_3_id} | Critical | {sec_critical_3_issue} | {sec_critical_3_location} | {sec_critical_3_cvss} | {sec_critical_3_cwe} |

#### High Priority Findings

{security_high_findings}

| ID | Severity | Issue | Location | CVSS Score |
|----|----------|-------|----------|------------|
| {sec_high_1_id} | High | {sec_high_1_issue} | {sec_high_1_location} | {sec_high_1_cvss} |
| {sec_high_2_id} | High | {sec_high_2_issue} | {sec_high_2_location} | {sec_high_2_cvss} |
| {sec_high_3_id} | High | {sec_high_3_issue} | {sec_high_3_location} | {sec_high_3_cvss} |

#### Recommendations

- **Immediate:** {security_immediate_rec}
- **Short-term:** {security_short_term_rec}
- **Long-term:** {security_long_term_rec}

---

### 3.2 Code Quality Assessment

**Overall Code Quality Score:** {code_quality_score}/100
**Status:** {code_quality_status}

#### Complexity Metrics

| Metric | Current | Threshold | Files Exceeding |
|--------|---------|-----------|-----------------|
| Cyclomatic Complexity (Avg) | {cyclomatic_avg} | {cyclomatic_threshold} | {cyclomatic_violations} |
| Cognitive Complexity (Avg) | {cognitive_avg} | {cognitive_threshold} | {cognitive_violations} |
| Lines of Code per Function (Avg) | {loc_per_function} | {loc_threshold} | {loc_violations} |
| Function Parameters (Max) | {max_parameters} | {param_threshold} | {param_violations} |

#### Code Duplication

- **Total Duplication:** {duplication_percentage}%
- **Duplicated Lines:** {duplicated_lines}
- **Duplicated Blocks:** {duplicated_blocks}
- **Largest Duplicate:** {largest_duplicate_lines} lines

**Major Duplication Areas:**
1. {duplication_area_1}
2. {duplication_area_2}
3. {duplication_area_3}

#### Code Smells

| Smell Type | Count | Severity | Top Locations |
|------------|-------|----------|---------------|
| {smell_1_type} | {smell_1_count} | {smell_1_severity} | {smell_1_locations} |
| {smell_2_type} | {smell_2_count} | {smell_2_severity} | {smell_2_locations} |
| {smell_3_type} | {smell_3_count} | {smell_3_severity} | {smell_3_locations} |

#### Recommendations

- **Immediate:** {quality_immediate_rec}
- **Short-term:** {quality_short_term_rec}
- **Long-term:** {quality_long_term_rec}

---

### 3.3 Architecture Assessment

**Overall Architecture Score:** {architecture_score}/100
**Status:** {architecture_status}

#### Architecture Patterns Identified

**Current Patterns:**
- {current_pattern_1}
- {current_pattern_2}
- {current_pattern_3}

**Recommended Patterns:**
- {recommended_pattern_1}
- {recommended_pattern_2}
- {recommended_pattern_3}

#### Modularity Analysis

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Module Coupling | {coupling_value} | {coupling_target} | {coupling_status} |
| Module Cohesion | {cohesion_value} | {cohesion_target} | {cohesion_status} |
| Circular Dependencies | {circular_deps} | 0 | {circular_status} |
| Average Module Size (LOC) | {module_size_avg} | {module_size_target} | {module_size_status} |

#### Anti-Patterns Detected

1. **{antipattern_1_name}**
   - **Occurrences:** {antipattern_1_count}
   - **Impact:** {antipattern_1_impact}
   - **Location:** {antipattern_1_location}

2. **{antipattern_2_name}**
   - **Occurrences:** {antipattern_2_count}
   - **Impact:** {antipattern_2_impact}
   - **Location:** {antipattern_2_location}

3. **{antipattern_3_name}**
   - **Occurrences:** {antipattern_3_count}
   - **Impact:** {antipattern_3_impact}
   - **Location:** {antipattern_3_location}

#### Recommendations

- **Immediate:** {architecture_immediate_rec}
- **Short-term:** {architecture_short_term_rec}
- **Long-term:** {architecture_long_term_rec}

---

### 3.4 Performance Assessment

**Overall Performance Score:** {performance_score}/100
**Status:** {performance_status}

#### Performance Bottlenecks

| Bottleneck | Type | Impact | Location |
|------------|------|--------|----------|
| {bottleneck_1_name} | {bottleneck_1_type} | {bottleneck_1_impact} | {bottleneck_1_location} |
| {bottleneck_2_name} | {bottleneck_2_type} | {bottleneck_2_impact} | {bottleneck_2_location} |
| {bottleneck_3_name} | {bottleneck_3_type} | {bottleneck_3_impact} | {bottleneck_3_location} |

#### Resource Utilization

- **Memory Usage:** {memory_usage}
- **CPU Usage:** {cpu_usage}
- **Database Query Performance:** {db_query_perf}
- **API Response Times:** {api_response_times}

#### Recommendations

- **Immediate:** {performance_immediate_rec}
- **Short-term:** {performance_short_term_rec}
- **Long-term:** {performance_long_term_rec}

---

### 3.5 Testing Assessment

**Overall Testing Score:** {testing_score}/100
**Status:** {testing_status}

#### Test Coverage

| Type | Coverage | Target | Gap |
|------|----------|--------|-----|
| Unit Tests | {unit_coverage}% | {unit_target}% | {unit_gap}% |
| Integration Tests | {integration_coverage}% | {integration_target}% | {integration_gap}% |
| E2E Tests | {e2e_coverage}% | {e2e_target}% | {e2e_gap}% |
| Overall Coverage | {overall_coverage}% | {overall_target}% | {overall_gap}% |

#### Test Quality Metrics

- **Test Count:** {test_count} total tests
- **Test Execution Time:** {test_execution_time}
- **Flaky Tests:** {flaky_test_count}
- **Skipped Tests:** {skipped_test_count}

#### Coverage Gaps

Critical areas lacking adequate test coverage:
1. {coverage_gap_1}
2. {coverage_gap_2}
3. {coverage_gap_3}
4. {coverage_gap_4}

#### Recommendations

- **Immediate:** {testing_immediate_rec}
- **Short-term:** {testing_short_term_rec}
- **Long-term:** {testing_long_term_rec}

---

## 4. Prioritized Remediation Plan

### Immediate Actions (0-30 Days) - Critical Priority

**Risk Level:** 🔴 Critical
**Estimated Effort:** {immediate_effort} person-weeks
**Dependencies:** {immediate_dependencies}

1. **{immediate_task_1_name}**
   - **Category:** {immediate_task_1_category}
   - **Effort:** {immediate_task_1_effort}
   - **Impact:** {immediate_task_1_impact}
   - **Owner:** {immediate_task_1_owner}

2. **{immediate_task_2_name}**
   - **Category:** {immediate_task_2_category}
   - **Effort:** {immediate_task_2_effort}
   - **Impact:** {immediate_task_2_impact}
   - **Owner:** {immediate_task_2_owner}

3. **{immediate_task_3_name}**
   - **Category:** {immediate_task_3_category}
   - **Effort:** {immediate_task_3_effort}
   - **Impact:** {immediate_task_3_impact}
   - **Owner:** {immediate_task_3_owner}

### Short-Term Actions (1-3 Months) - High Priority

**Risk Level:** 🟠 High
**Estimated Effort:** {short_term_effort} person-weeks
**Dependencies:** {short_term_dependencies}

1. **{short_term_task_1_name}**
   - **Category:** {short_term_task_1_category}
   - **Effort:** {short_term_task_1_effort}
   - **Impact:** {short_term_task_1_impact}
   - **Owner:** {short_term_task_1_owner}

2. **{short_term_task_2_name}**
   - **Category:** {short_term_task_2_category}
   - **Effort:** {short_term_task_2_effort}
   - **Impact:** {short_term_task_2_impact}
   - **Owner:** {short_term_task_2_owner}

3. **{short_term_task_3_name}**
   - **Category:** {short_term_task_3_category}
   - **Effort:** {short_term_task_3_effort}
   - **Impact:** {short_term_task_3_impact}
   - **Owner:** {short_term_task_3_owner}

### Medium-Term Actions (3-6 Months) - Medium Priority

**Risk Level:** 🟡 Medium
**Estimated Effort:** {medium_term_effort} person-weeks
**Dependencies:** {medium_term_dependencies}

1. **{medium_term_task_1_name}**
   - **Category:** {medium_term_task_1_category}
   - **Effort:** {medium_term_task_1_effort}
   - **Impact:** {medium_term_task_1_impact}
   - **Owner:** {medium_term_task_1_owner}

2. **{medium_term_task_2_name}**
   - **Category:** {medium_term_task_2_category}
   - **Effort:** {medium_term_task_2_effort}
   - **Impact:** {medium_term_task_2_impact}
   - **Owner:** {medium_term_task_2_owner}

---

## 5. Appendices

### Appendix A: Full Security Findings

{security_findings_full}

### Appendix B: Code Quality Detailed Report

{code_quality_findings_full}

### Appendix C: Tool Output Summary

{tool_output_summary}

### Appendix D: Glossary of Terms

| Term | Definition |
|------|------------|
| {term_1} | {definition_1} |
| {term_2} | {definition_2} |
| {term_3} | {definition_3} |
| {term_4} | {definition_4} |

---

**Report Prepared By:** {author_name}
**Contact:** {author_contact}
**Report ID:** {report_id}
**Assessment Tools Version:** {tools_version}
**Next Review Date:** {next_review_date}
