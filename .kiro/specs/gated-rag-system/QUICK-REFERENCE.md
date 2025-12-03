# Quick Reference: Production Blockers

## Test Everything
```bash
node scripts/test-all-blockers.js
```

## Use in Your Code

### 1. POPIA Sanitiser
```javascript
import { POPIASanitiser } from '@/lib/compliance/popia-sanitiser';

const sanitiser = new POPIASanitiser();
const clean = sanitiser.sanitiseProfile(studentProfile);
const valid = sanitiser.validateSanitised(clean);
```

### 2. Consent Gate
```javascript
import { ConsentGate } from '@/lib/compliance/consent-gate';

// Check consent
const check = ConsentGate.checkConsent(session);
if (!check.allowed) {
  return { error: check.reason };
}

// Or enforce (throws error)
ConsentGate.enforceConsent(session);
```

### 3. Guarded Client
```javascript
import { guardedClient } from '@/lib/llm/guarded-client';

const result = await guardedClient.execute(
  async () => callExternalAPI(),
  { maxTokens: 2000, fallback: defaultResponse }
);

if (result.success) {
  console.log('Cost:', result.metadata.cost);
}
```

### 4. LLM Adapter
```javascript
import { LLMAdapter } from '@/lib/llm/llm-adapter';

// Use default provider (from env)
const provider = LLMAdapter.getDefaultProvider();

// Or specify provider
const claude = LLMAdapter.createProvider('claude');
const openai = LLMAdapter.createProvider('openai');
const mock = LLMAdapter.createProvider('mock');

// Generate text
const result = await provider.generateText('Your prompt');

// Generate JSON
const json = await provider.generateJSON('Your prompt');
```

## All Together (Post-Correction Flow)
```javascript
import { ConsentGate } from '@/lib/compliance/consent-gate';
import { POPIASanitiser } from '@/lib/compliance/popia-sanitiser';
import { LLMAdapter } from '@/lib/llm/llm-adapter';
import { guardedClient } from '@/lib/llm/guarded-client';

export async function enhanceReport(session, draftReport) {
  // 1. Check consent
  const consent = ConsentGate.checkConsent(session);
  if (!consent.allowed) {
    return { report: draftReport, enhanced: false };
  }

  // 2. Sanitise data
  const sanitiser = new POPIASanitiser();
  const cleanProfile = sanitiser.sanitiseProfile(session.profile);

  // 3. Call LLM via adapter
  const provider = LLMAdapter.getDefaultProvider();
  const result = await guardedClient.execute(
    async () => provider.generateText(`Enhance: ${draftReport}`),
    { maxTokens: 3000 }
  );

  // 4. Return enhanced or fallback
  return {
    report: result.success ? result.data : draftReport,
    enhanced: result.success,
    cost: result.metadata?.cost || 0
  };
}
```

## Environment Variables
```bash
# LLM Provider (claude, openai, mock)
LLM_PROVIDER=claude

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Supabase (for audit trail)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Database Setup
```bash
# Run audit tables migration
# Copy SQL from scripts/setup-popia-audit-tables.sql
# Paste into Supabase SQL Editor
# Execute
```

## Switch Providers (< 5 minutes)
```bash
# 1. Change env var
LLM_PROVIDER=openai  # or claude, or mock

# 2. Restart server
npm run dev

# Done! No code changes needed.
```

## Monitoring
```javascript
// Check audit trail
const sanitiser = new POPIASanitiser();
const trail = sanitiser.getAuditTrail();
console.log('PII sanitisations:', trail);

// Check costs
const result = await guardedClient.execute(...);
console.log('Request cost:', result.metadata.cost);
console.log('Tokens used:', result.metadata.tokensUsed);
```

## Troubleshooting

### "ConsentError: User has not consented"
→ Add ConsentCheckbox to assessment form  
→ User must check the box before submission

### "Request timed out after 5000ms"
→ Expected behavior (demo protection)  
→ Fallback response will be used  
→ Check result.fallback

### "Unknown provider: xyz"
→ Valid providers: claude, openai, mock  
→ Check LLM_PROVIDER env var

### "PII detected in sanitised profile"
→ Run validateSanitised() before API call  
→ Check violations array for details

## Files to Know

| File | Purpose |
|------|---------|
| `lib/compliance/popia-sanitiser.js` | Strip PII |
| `lib/compliance/consent-gate.js` | Check consent |
| `lib/llm/guarded-client.js` | Timeout protection |
| `lib/llm/llm-adapter.js` | Vendor abstraction |
| `scripts/test-all-blockers.js` | Test everything |
| `scripts/setup-popia-audit-tables.sql` | Database setup |

## Next Steps

1. ✅ All blockers implemented
2. ⏳ Run database migration
3. ⏳ Add ConsentCheckbox to UI
4. ⏳ Integrate with RAG system
5. ⏳ Deploy to staging

---

**Questions?** See INTEGRATION-GUIDE.md for detailed integration steps.
