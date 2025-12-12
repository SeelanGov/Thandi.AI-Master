#!/bin/bash
# Setup Vercel Environment Variables
# Run this script to add all environment variables to Vercel

echo "🔐 Setting up Vercel Environment Variables..."
echo "=============================================="
echo ""
echo "This will add environment variables from .env.local to Vercel"
echo "You'll be prompted to paste each value"
echo ""

# Read from .env.local
source .env.local

echo "Adding GROQ_API_KEY..."
echo "$GROQ_API_KEY" | vercel env add GROQ_API_KEY production

echo "Adding OPENAI_API_KEY..."
echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production

echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo ""
echo "✅ Environment variables added!"
echo ""
echo "🚀 Now redeploy with:"
echo "   vercel --prod"
