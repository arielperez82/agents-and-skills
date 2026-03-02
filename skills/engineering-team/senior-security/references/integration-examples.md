# Security Integration Examples

> **Reference only — not production-ready.** These examples demonstrate integration patterns. For production use: replace CLI token arguments with environment variables or a credential manager, add `set -euo pipefail` and trap-based cleanup, use `mktemp` for temp files, validate `jq` output, and redact sensitive data from report files.

Bash scripts for integrating security tools into CI/CD and automation workflows.

## Weekly Security Scan Automation

```bash
#!/bin/bash
# weekly-security-scan.sh - Automated weekly security scanning pipeline

DATE=$(date +%Y-%m-%d)
REPORT_DIR="security-reports/$DATE"
mkdir -p "$REPORT_DIR"

echo "Starting weekly security scan - $DATE"

# Threat model validation
python3 ../skills/engineering-team/senior-security/scripts/threat_modeler.py \
  --input ./architecture-docs \
  --output json \
  --file "$REPORT_DIR/threat-model.json"

# Security audit
python3 ../skills/engineering-team/senior-security/scripts/security_auditor.py \
  --input ./ \
  --output json \
  --file "$REPORT_DIR/security-audit.json" \
  --verbose

# Check for critical findings
CRITICAL_COUNT=$(cat "$REPORT_DIR/security-audit.json" | jq '.summary.critical')

if [ "$CRITICAL_COUNT" -gt 0 ]; then
  echo "ALERT: $CRITICAL_COUNT critical vulnerabilities found!"
  cat "$REPORT_DIR/security-audit.json" | jq '.findings[] | select(.severity == "critical")'
fi

# Executive summary
cat "$REPORT_DIR/security-audit.json" | jq '{
  date: "'$DATE'",
  score: .overallScore,
  critical: .summary.critical,
  high: .summary.high,
  medium: .summary.medium,
  low: .summary.low
}' > "$REPORT_DIR/executive-summary.json"

echo "Security scan complete. Reports saved to $REPORT_DIR"
```

## Pre-Production Security Gate

```bash
#!/bin/bash
# pre-production-security-gate.sh - Security gate for production deployments

echo "Running pre-production security gate..."

python3 ../skills/engineering-team/senior-security/scripts/security_auditor.py \
  --input ./ \
  --output json \
  --file security-gate-audit.json

CRITICAL=$(cat security-gate-audit.json | jq '.summary.critical')
HIGH=$(cat security-gate-audit.json | jq '.summary.high')

if [ "$CRITICAL" -gt 0 ]; then
  echo "FAILED: $CRITICAL critical vulnerabilities detected"
  cat security-gate-audit.json | jq '.findings[] | select(.severity == "critical")'
  exit 1
fi

if [ "$HIGH" -gt 5 ]; then
  echo "FAILED: $HIGH high-severity vulnerabilities exceed threshold (max: 5)"
  exit 1
fi

SCORE=$(cat security-gate-audit.json | jq '.overallScore')
if [ "$SCORE" -lt 80 ]; then
  echo "FAILED: Security score $SCORE below minimum threshold (80)"
  exit 1
fi

SECRETS=$(cat security-gate-audit.json | jq '.secrets | length')
if [ "$SECRETS" -gt 0 ]; then
  echo "FAILED: $SECRETS exposed secrets detected"
  exit 1
fi

echo "PASSED: Security gate checks passed (Score: $SCORE/100)"
exit 0
```

## API Security Testing Pipeline

```bash
#!/bin/bash
# api-security-test.sh - Automated API security testing

API_URL=$1
TOKEN=$2

if [ -z "$API_URL" ] || [ -z "$TOKEN" ]; then
  echo "Usage: ./api-security-test.sh <API_URL> <AUTH_TOKEN>"
  exit 1
fi

echo "Testing API security: $API_URL"

cat > pentest-config.json << EOF
{
  "target": "$API_URL",
  "authentication": { "type": "Bearer", "token": "$TOKEN" },
  "tests": ["authentication", "authorization", "injection", "rate-limiting"]
}
EOF

for TEST in authentication authorization injection rate-limiting; do
  echo "Testing $TEST..."
  python3 ../skills/engineering-team/senior-security/scripts/pentest_automator.py \
    --input pentest-config.json \
    --test "$TEST" \
    --output json \
    --file "${TEST}-test-results.json"
done

jq -s 'add' *-test-results.json > api-security-report.json

FAILURES=$(cat api-security-report.json | jq '[.findings[] | select(.passed == false)] | length')
if [ "$FAILURES" -gt 0 ]; then
  echo "WARNING: $FAILURES security tests failed"
  cat api-security-report.json | jq '.findings[] | select(.passed == false)'
else
  echo "SUCCESS: All API security tests passed"
fi

rm pentest-config.json
```
