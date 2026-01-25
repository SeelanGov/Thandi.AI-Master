#!/bin/bash

# DAY 9 COMPLETION - RUN THIS NOW
# January 23, 2026

echo "🚀 DAY 9 COMPLETION VERIFICATION"
echo "=================================="
echo ""

# Step 1: Check if API key is set
echo "📋 Step 1: Checking API key..."
if [ -z "$ADMIN_API_KEY" ]; then
    echo "⚠️  ADMIN_API_KEY not set. Setting it now..."
    export ADMIN_API_KEY=$(grep ADMIN_API_KEY .env.local | cut -d '=' -f2)
    
    if [ -z "$ADMIN_API_KEY" ]; then
        echo "❌ ERROR: Could not find ADMIN_API_KEY in .env.local"
        echo "Please set it manually:"
        echo "  export ADMIN_API_KEY=your-api-key-here"
        exit 1
    fi
    
    echo "✅ API key set from .env.local"
else
    echo "✅ API key already set"
fi

echo ""
echo "🤖 Step 2: Running Kiro AI verification test..."
echo "This will verify that Kiro AI can monitor Thandi via API"
echo ""

# Step 2: Run Kiro AI test
npm run admin:test:kiro

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ KIRO AI TEST PASSED!"
    echo ""
    echo "📋 Step 3: Manual Testing"
    echo "========================="
    echo "Next, you need to complete manual testing:"
    echo ""
    echo "1. Open the checklist:"
    echo "   open DAY9-MANUAL-TESTING-CHECKLIST-JAN-23-2026.md"
    echo ""
    echo "2. Open the admin dashboard:"
    echo "   open https://thandi.online/admin"
    echo ""
    echo "3. Follow the checklist step-by-step (1-2 hours)"
    echo ""
    echo "4. When done, mark Day 9 as complete in:"
    echo "   .kiro/specs/admin-dashboard/tasks.md"
    echo ""
    echo "🎯 Estimated time remaining: 1-2 hours"
else
    echo ""
    echo "❌ KIRO AI TEST FAILED"
    echo ""
    echo "⚠️  Action Required:"
    echo "1. Review the failed tests above"
    echo "2. Fix the issues in the admin dashboard"
    echo "3. Re-run this script"
    echo ""
    echo "Do NOT proceed to manual testing until this passes!"
    exit 1
fi
