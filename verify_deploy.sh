#!/bin/bash

# ============================================
# Post-Deployment Verification Script
# ============================================

echo "🔍 Running post-deployment verification..."

DOMAIN="http://localhost:8000"
FAILED=0

# ============================================
# Test 1: Homepage loads
# ============================================
echo -n "1. Testing homepage (EN)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/en/)
if [ "$STATUS" = "200" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

echo -n "2. Testing homepage (TR)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/tr/)
if [ "$STATUS" = "200" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

# ============================================
# Test 2: API endpoints
# ============================================
echo -n "3. Testing API health... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/v1/health/)
if [ "$STATUS" = "200" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

echo -n "4. Testing geo detection API... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/v1/geo/detect/)
if [ "$STATUS" = "200" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL (Status: $STATUS)"
    FAILED=$((FAILED + 1))
fi

# ============================================
# Summary
# ============================================
echo ""
echo "======================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ $FAILED test(s) failed!"
    exit 1
fi
