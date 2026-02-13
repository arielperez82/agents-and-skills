# Security Checklist for Skill Intake

Checklist for evaluating sandboxed skills before incorporation into a project's skill pipeline.

## Severity Levels

| Level | Impact | Action |
|-------|--------|--------|
| **Critical** | Immediate risk: data exfiltration, credential theft, system compromise | **REJECT** - Clean sandbox, log rejection |
| **High** | Potential risk: unvetted network calls, broad filesystem access | **FLAG** - Continue with caution, note in report |
| **Medium** | Code quality concern: poor error handling, unvalidated inputs | **NOTE** - Document, address during integration |
| **Low** | Style/convention issues: non-standard patterns, minor concerns | **NOTE** - Document for awareness |

## Checklist

### 1. Network Activity (Critical/High)

- [ ] **Outbound connections**: Does the code make HTTP/HTTPS requests?
  - Check the skill's SKILL.md and requirements for **declared** external services
  - Connections to declared/expected service domains → **OK**
  - Connections to undeclared or unexpected domains → **High** finding
  - Connections to suspicious or unrecognized domains → **Critical** finding
- [ ] **DNS resolution**: Does it resolve arbitrary hostnames?
- [ ] **Socket connections**: Does it open raw sockets?
- [ ] **Data exfiltration**: Could collected data be sent to external services?

### 2. File System Access (Critical/High)

- [ ] **Write locations**: Does it write files outside its own directory?
  - Allowed: `_sandbox/{name}/`, project cache dirs, `/tmp/`
  - Writing to home directory, `/etc/`, or other skills → **Critical**
- [ ] **Read locations**: Does it read sensitive files?
  - Reading `.env`, `~/.ssh/`, `~/.aws/`, credentials files → **Critical**
  - Reading other skills' directories → **High**
- [ ] **File deletion**: Does it delete files?
  - Deleting outside sandbox → **Critical**

### 3. Environment Variables (High)

- [ ] **Accessed variables**: Which env vars does it read?
  - Allowed: API keys explicitly declared in SKILL.md
  - Reading `HOME`, `PATH`, `USER` → **Medium**
  - Reading `AWS_*`, `SSH_*`, `GPG_*`, auth tokens → **Critical**
- [ ] **Variable modification**: Does it set/modify env vars?
  - Modifying `PATH`, `PYTHONPATH` → **High**

### 4. Shell Execution (Critical)

- [ ] **subprocess/os.system**: Does it execute shell commands?
  - Running `pip install` → **Medium** (expected during setup)
  - Running arbitrary commands → **Critical**
  - Running `curl`, `wget` → **High**
- [ ] **eval/exec**: Does it use `eval()` or `exec()` on dynamic content?
  - Any use → **Critical**
- [ ] **pickle/marshal**: Does it deserialize untrusted data?
  - Any use with external data → **Critical**

### 5. Code Obfuscation (Critical)

- [ ] **Minified code**: Are there minified/obfuscated source files?
  - Single-character variable names throughout → **High**
  - Base64-encoded code blocks → **Critical**
  - Compiled bytecode without corresponding source → **Critical**
- [ ] **Dynamic imports**: Does it use `__import__()` or `importlib` with computed strings?
  - With user input → **Critical**
  - With hardcoded strings → **Medium**

### 6. Dependency Chain (High)

- [ ] **Dependency manifest audit**: List all required packages
  - Well-known packages (numpy, pandas, requests, etc.) → **OK**
  - Obscure/low-download packages → **High**
  - Pinned to specific versions with known vulnerabilities → **High**
- [ ] **Transitive dependencies**: Any packages with broad permissions?
- [ ] **Package name squatting**: Do package names look like typosquatting?
  - e.g., `numpyy`, `pands`, `reqeusts` → **Critical**

### 7. Credential Handling (Critical)

- [ ] **Hardcoded secrets**: Are there API keys, passwords, or tokens in the code?
  - Any hardcoded credential → **Critical**
- [ ] **Credential files**: Does it create or reference credential files?
  - Creating `.env`, config files with secrets → **High**
- [ ] **Logging credentials**: Does it log or print sensitive values?
  - Logging API keys, tokens → **High**

### 8. Data Handling (Medium)

- [ ] **Input validation**: Does it validate inputs before processing?
  - No validation on user-supplied inputs → **Medium**
- [ ] **SQL injection**: If using databases, are queries parameterized?
  - String concatenation in queries → **Critical**
- [ ] **Path traversal**: Can user input influence file paths?
  - `../` in file paths from user input → **High**

## Automated Scan Patterns

Use these grep patterns during automated scanning:

```bash
# Network calls
grep -rn "requests\.\|urllib\.\|http\.client\|socket\.\|urlopen\|fetch(" .

# File system writes
grep -rn "open(.*['\"]w['\"])\|\.write(\|os\.remove\|shutil\.rmtree\|os\.unlink\|fs\.writeFile" .

# Shell execution
grep -rn "subprocess\.\|os\.system\|os\.popen\|Popen\|call(\|check_output\|child_process" .

# Eval/exec
grep -rn "eval(\|exec(\|compile(\|__import__\|Function(" .

# Environment access
grep -rn "os\.environ\|os\.getenv\|environ\[\|process\.env" .

# Credential patterns
grep -rn "password\|secret\|token\|api_key\|apikey\|API_KEY" .

# Obfuscation
grep -rn "base64\.\|codecs\.decode\|rot13\|marshal\.loads\|atob(" .

# Pickle deserialization
grep -rn "pickle\.loads\|pickle\.load\|cPickle" .
```

## Report Format

```
## Security Assessment: {skill-name}

### Summary
- Critical: {count}
- High: {count}
- Medium: {count}
- Low: {count}
- Decision: {PROCEED / FLAGGED / REJECTED}

### Findings

#### [{severity}] {finding-title}
- **File**: {path}:{line}
- **Pattern**: {what was found}
- **Risk**: {explanation of the risk}
- **Recommendation**: {how to address}
```
