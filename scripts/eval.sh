#!/bin/bash
# =============================================================================
# CodeGlass Eval Harness — scripts/eval.sh
# =============================================================================
# Runs a series of checks against the project and reports a score.
# This is your scalar metric — the number that tells you "is this broken or not?"
#
# HOW IT WORKS:
#   Each check runs independently. Pass = 1 point, Fail = 0 points.
#   Total score at the end tells you the health of the build.
#   Any output from a failed step gets logged so you can see WHY it failed.
#
# HOW TO USE:
#   chmod +x scripts/eval.sh
#   ./scripts/eval.sh
#
# WHAT TO CUSTOMIZE:
#   - Add or remove checks based on your project
#   - The checks below assume a React/TypeScript/Vite project
#   - If your project uses different scripts, update the commands
# =============================================================================

set -e  # Exit on error (we handle errors ourselves below)

SCORE=0
TOTAL=0
FAILURES=""

# --- Helper function ---
run_check() {
  local name="$1"
  local command="$2"
  TOTAL=$((TOTAL + 1))
  
  echo -n "  Checking: $name ... "
  
  # Run the command, capture output, suppress display
  OUTPUT=$(eval "$command" 2>&1)
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ PASS"
    SCORE=$((SCORE + 1))
  else
    echo "❌ FAIL"
    FAILURES="$FAILURES\n--- $name ---\n$OUTPUT\n"
  fi
}

# =============================================================================
# THE CHECKS
# =============================================================================

echo ""
echo "🔍 CodeGlass Eval Harness"
echo "========================="
echo ""

# Check 1: Dependencies install cleanly
run_check "npm install" "npm install --silent 2>&1"

# Check 2: Project builds without errors
run_check "npm run build" "npm run build 2>&1"

# Check 3: Linter passes (remove if no lint script in package.json)
# If your project doesn't have a lint script yet, comment this out
# and add one: "lint": "eslint . --ext .ts,.tsx" in package.json
run_check "npm run lint" "npm run lint 2>&1"

# Check 4: TypeScript type-checking passes
run_check "TypeScript check" "npx tsc --noEmit 2>&1"

# =============================================================================
# OPTIONAL CHECKS — uncomment what applies to your project
# =============================================================================

# Check 5: Tests pass (if you have tests)
# run_check "npm test" "npm test -- --watchAll=false 2>&1"

# Check 6: Supabase types are fresh (if using generated types)
# This checks that the types file exists — doesn't regenerate
# run_check "Supabase types exist" "test -f src/types/database.ts"

# Check 7: No console.log left in production code
# run_check "No console.log" "! grep -r 'console.log' src/ --include='*.ts' --include='*.tsx' | grep -v node_modules"

# Check 8: Environment variables are set (check .env or .env.local exists)
# run_check ".env exists" "test -f .env.local || test -f .env"

# =============================================================================
# RESULTS
# =============================================================================

echo ""
echo "========================="
echo "  SCORE: $SCORE / $TOTAL"
echo "========================="

if [ -n "$FAILURES" ]; then
  echo ""
  echo "FAILURE DETAILS:"
  echo -e "$FAILURES"
fi

echo ""

# Exit with non-zero if anything failed (useful for CI or automation)
if [ $SCORE -lt $TOTAL ]; then
  exit 1
else
  echo "All checks passed. 🎉"
  exit 0
fi
