# Token Cost Dataset Maintenance Guide

The ARW Inspector uses a static JSON dataset to calculate cost comparisons between ARW machine views and traditional HTML scraping. This guide explains how to maintain and update the pricing data.

## Dataset Location

**File:** `src/data/token-costs.json`

This file contains pricing information for major AI model providers and their models.

## When to Update

Update the token cost dataset when:

1. **Price Changes** - Any provider announces pricing updates
2. **New Models** - Major providers release new models
3. **Quarterly Reviews** - Regular reviews (recommended: quarterly)
4. **New Providers** - New AI providers enter the market

## Dataset Structure

```json
{
  "version": "2025-01",
  "updated": "2025-01-15",
  "models": [
    {
      "provider": "Anthropic",
      "model": "Claude 3.5 Sonnet",
      "id": "claude-3-5-sonnet-20241022",
      "inputCostPerMToken": 3.0,
      "outputCostPerMToken": 15.0,
      "contextWindow": 200000,
      "category": "flagship",
      "note": "Optional note"
    }
  ]
}
```

### Field Descriptions

- **version**: Dataset version in YYYY-MM format
- **updated**: Last update date in YYYY-MM-DD format
- **models**: Array of model pricing objects

#### Model Object Fields

- **provider**: Provider name (e.g., "Anthropic", "OpenAI", "Google")
- **model**: Human-readable model name
- **id**: Model identifier/slug
- **inputCostPerMToken**: Input cost per million tokens in USD
- **outputCostPerMToken**: Output cost per million tokens in USD
- **contextWindow**: Maximum context window in tokens
- **category**: One of: `"flagship"`, `"fast"`, `"premium"`
- **note** _(optional)_: Additional information (e.g., "Groq hosted pricing")

### Category Guidelines

- **flagship**: Primary production-ready models with balanced cost/performance
- **fast**: Optimized for speed and cost efficiency
- **premium**: High-performance models with premium pricing

## How to Update Pricing

### Step 1: Check Provider Websites

Visit official pricing pages:

- **Anthropic**: https://www.anthropic.com/pricing
- **OpenAI**: https://openai.com/pricing
- **Google (Gemini)**: https://ai.google.dev/pricing
- **Meta (via Groq)**: https://groq.com/pricing
- **xAI (Grok)**: https://x.ai/api
- **Mistral**: https://mistral.ai/pricing
- **Perplexity**: https://www.perplexity.ai/hub/pricing

### Step 2: Update JSON File

1. Open `src/data/token-costs.json`
2. Update the `version` and `updated` fields
3. Modify pricing for existing models or add new models
4. Ensure all costs are in **USD per million tokens**

### Step 3: Add New Models

When adding a new model:

```json
{
  "provider": "Provider Name",
  "model": "Model Display Name",
  "id": "model-identifier",
  "inputCostPerMToken": 0.0,
  "outputCostPerMToken": 0.0,
  "contextWindow": 128000,
  "category": "flagship"
}
```

### Step 4: Remove Deprecated Models

When a model is deprecated:

1. Keep it for 1-2 quarters for historical comparisons
2. Add a note: `"note": "Deprecated - use MODEL_NAME instead"`
3. Remove after 2 quarters if no longer available

## Testing Updates

After updating the dataset:

1. **Syntax Check**: Ensure JSON is valid

   ```bash
   cd tools/arw-inspector
   cat src/data/token-costs.json | jq .
   ```

2. **Visual Check**: Run the inspector and verify:

   ```bash
   npm run dev
   ```

   - Visit the Machine Views tab
   - Verify new models appear in the cost comparison
   - Check that filtering by provider/category works
   - Confirm cost calculations look reasonable

3. **Type Check**: Ensure TypeScript types match
   ```bash
   npm run typecheck
   ```

## Cost Calculation Method

The inspector calculates costs using:

```typescript
cost = (tokens / 1_000_000) * costPerMToken;
```

**Example:**

- Tokens: 1,500
- Input Cost: $3.00 per million tokens
- Calculation: (1,500 / 1,000,000) \* 3.00 = $0.0045

## Token Estimation

The inspector uses approximate token counting:

- **Estimate**: ~4 characters per token
- **Method**: Conservative average across tokenizers
- **Note**: Actual counts vary by model (GPT-4, Claude, Gemini use different tokenizers)

Users see a disclaimer: _"Token estimates are approximations. Actual costs vary by tokenizer and usage patterns."_

## Dynamic Pricing (Future Enhancement)

For dynamic pricing updates, consider:

1. **API Integration**: Fetch live pricing from provider APIs
2. **Caching**: Cache results to avoid rate limits
3. **Fallback**: Use static dataset as fallback

**Implementation Sketch:**

```typescript
// src/utils/pricing.ts
async function fetchLivePricing(): Promise<TokenCostModel[]> {
  try {
    const response = await fetch('https://your-pricing-api.com/models');
    return await response.json();
  } catch (error) {
    // Fallback to static dataset
    return import('../data/token-costs.json').then((m) => m.models);
  }
}
```

## Version History

Track major pricing updates:

| Version | Date       | Changes                        |
| ------- | ---------- | ------------------------------ |
| 2025-01 | 2025-01-15 | Initial dataset with 15 models |

## Contributing

When submitting pricing updates:

1. Create a branch: `update-token-costs-YYYY-MM`
2. Update `token-costs.json`
3. Update version and date fields
4. Test thoroughly
5. Submit PR with provider pricing page links in description

## Questions?

For questions about:

- **Pricing accuracy**: Verify with official provider documentation
- **Missing providers**: Open an issue or submit a PR
- **Calculation methodology**: See `src/utils/tokenizer.ts`

---

**Last Updated:** 2025-01-15
**Dataset Version:** 2025-01
