
# MOBILE UI DEPLOYMENT VERIFICATION
# Run this after 5 minutes to verify deployment

echo "🔍 Testing mobile UI deployment..."

# Test main URL
curl -s -o /dev/null -w "%{http_code}" https://thandiai.vercel.app/assessment
echo "Assessment page status: $?"

# Test for mobile viewport
curl -s https://thandiai.vercel.app/assessment | grep -q "width=device-width"
echo "Mobile viewport: $?"

# Test for responsive classes
curl -s https://thandiai.vercel.app/assessment | grep -q "sm:"
echo "Responsive classes: $?"

echo "✅ Verification complete"
