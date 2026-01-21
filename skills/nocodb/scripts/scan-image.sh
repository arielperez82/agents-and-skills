#!/bin/bash
# scan-image.sh - Trivy vulnerability scanning wrapper for NocoDB images

set -e  # Exit on any error

# Configuration
IMAGE_NAME="${1:-nocodb/nocodb:0.255.0}"
OUTPUT_DIR="${OUTPUT_DIR:-docs/security}"
SCAN_DATE=$(date +%Y%m%d)
OUTPUT_FILE="$OUTPUT_DIR/nocodb-image-scan-$SCAN_DATE.txt"

# Check if trivy is installed
if ! command -v trivy &> /dev/null; then
  echo "❌ Error: trivy is not installed"
  echo "   Install: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
  exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "🔍 Scanning NocoDB image: $IMAGE_NAME"
echo "📄 Output: $OUTPUT_FILE"

# Perform scan
if trivy image --severity HIGH,CRITICAL "$IMAGE_NAME" > "$OUTPUT_FILE" 2>&1; then
  echo "✅ Scan complete"
else
  echo "⚠️  Warning: Scan completed with warnings"
fi

# Check for critical vulnerabilities
CRITICAL_COUNT=$(grep -c "CRITICAL" "$OUTPUT_FILE" 2>/dev/null || echo "0")
HIGH_COUNT=$(grep -c "HIGH" "$OUTPUT_FILE" 2>/dev/null || echo "0")

echo ""
echo "📊 Scan Results:"
echo "   Critical: $CRITICAL_COUNT"
echo "   High: $HIGH_COUNT"

# Display summary
if [ "$CRITICAL_COUNT" -gt 0 ]; then
  echo ""
  echo "🔴 CRITICAL vulnerabilities found:"
  grep "CRITICAL" "$OUTPUT_FILE" | head -10
  echo ""
  echo "❌ Action required: Review and mitigate critical vulnerabilities"
  echo "   See: $OUTPUT_FILE"
  exit 1
elif [ "$HIGH_COUNT" -gt 0 ]; then
  echo ""
  echo "⚠️  HIGH vulnerabilities found:"
  grep "HIGH" "$OUTPUT_FILE" | head -10
  echo ""
  echo "📋 Review high vulnerabilities: $OUTPUT_FILE"
else
  echo ""
  echo "✅ No critical or high vulnerabilities found"
fi

echo ""
echo "📄 Full scan report: $OUTPUT_FILE"
