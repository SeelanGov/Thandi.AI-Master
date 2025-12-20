#!/bin/bash
# Vercel Environment Variables Setup
# Run these commands to set up environment variables

echo "Setting up Vercel environment variables..."

vercel env add GROQ_API_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

echo "Environment variables setup complete!"
echo "Note: You'll be prompted to enter each value manually."
