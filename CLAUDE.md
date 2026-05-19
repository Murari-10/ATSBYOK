# ATSBYOK — Claude Code Architecture Guide

## What This Project Is
AI-powered ATS resume optimizer SaaS.
Target: Indian and international job seekers globally.
Key differentiator: Users bring their own free API key
and pay only ₹49/month for the platform.
This makes unlimited optimizations almost free for users
while keeping our AI costs at zero for Power plan users.

## Tech Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase (auth + database + storage)
- Anthropic Claude API (default AI for managed plans)
- Razorpay (all payments — INR + international cards)
- pdf-parse (PDF extraction)
- mammoth (DOCX extraction)
- jsPDF (PDF generation)
- crypto-js (AES-256 BYOK key encryption)

## Plans (source of truth — never hardcode elsewhere)
| Plan | India | Intl | Optimizations | Validity |
|------|-------|------|---------------|----------|
| free | ₹0 | $0 | 2/month | Forever |
| starter | ₹99 one-time | $4.99 | 15 total | 30 days |
| pro | ₹199/month | $9/month | 30/month | Monthly |
| elite | ₹399/month | $18/month | 100/month | Monthly |
| byok | ₹49/month | $2/month | Unlimited | Monthly |

## Hourly Rate Limits
| Plan | Requests/hour |
|------|--------------|
| free | 3 |
| starter | 5 |
| pro | 10 |
| elite | 20 |
| byok | 30 |

## Feature Access (source of truth)
| Feature | free | starter | pro | elite | byok |
|---------|------|---------|-----|-------|------|
| ATS Score | ✅ | ✅ | ✅ | ✅ | ✅ |
| Keyword Analysis | ✅ | ✅ | ✅ | ✅ | ✅ |
| Suggestions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Copy Resume Text | ✅ | ✅ | ✅ | ✅ | ✅ |
| Download PDF | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cold Email Template | ❌ | ✅ | ✅ | ✅ | ✅ |
| LinkedIn Message | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cover Letter | ❌ | ❌ | ❌ | ✅ | ❌ |
| Own API Endpoint | ❌ | ❌ | ❌ | ❌ | ✅ |

## UI Plan Names (internal code uses different names)
| Internal (database/code) | Displayed to user |
|--------------------------|-------------------|
| free | Free |
| starter | Starter |
| pro | Pro |
| elite | Elite |
| byok | BYOK |

## Resume Modes (source of truth)
| Mode | Pages | Style |
|------|-------|-------|
| fresher | 1 page | Clean single-column |
| experienced | 2 pages | Clean single-column |
| mba | 2 pages | Clean single-column |
No photo fields. Summary only. No objective statements.
Page count set automatically — never ask user to choose.

## AI Models (source of truth)
| Plan | Model | Key |
|------|-------|-----|
| free | claude-haiku-4-5 | env ANTHROPIC_API_KEY |
| starter | claude-haiku-4-5 | env ANTHROPIC_API_KEY |
| pro | claude-sonnet-4-6 | env ANTHROPIC_API_KEY |
| elite | claude-sonnet-4-6 | env ANTHROPIC_API_KEY |
| byok | user chosen | user's encrypted key |

## Design System (source of truth)
Primary: #1D9E75
Primary hover: #0F6E56
Primary light bg: #E1F5EE
Text primary: #111827
Text secondary: #6B7280
Text muted: #9CA3AF
Background page: #F9FAFB
Background card: #FFFFFF
Border: #E5E7EB
Font: Inter (via next/font/google)
Border radius buttons: 8px
Border radius cards: 12px

## Logo
Text: "ATS" in #111827 + "BYOK" in #1D9E75
No space between ATS and BYOK
font-weight: 700
No inline styles — use Tailwind classes only

## Navigation Rules (source of truth)
PublicNavbar: / | /pricing | /login
AppNavbar: /dashboard | /dashboard/* | /optimize | /settings
SmartNavbar: /contact | /terms | /privacy | /refund | /cookies
Logo click (logged out) → /
Logo click (logged in) → /dashboard
After Google login → /dashboard
After logout → /

## File Structure
app/
  page.tsx                    ← landing page (PublicNavbar)
  login/page.tsx              ← Google OAuth only
  pricing/page.tsx            ← public pricing (PublicNavbar)
  contact/page.tsx            ← contact form (SmartNavbar)
  terms/page.tsx              ← terms of service (SmartNavbar)
  privacy/page.tsx            ← privacy policy (SmartNavbar)
  refund/page.tsx             ← refund policy (SmartNavbar)
  cookies/page.tsx            ← cookie policy (SmartNavbar)
  not-found.tsx               ← 404 page
  dashboard/
    page.tsx                  ← main dashboard (AppNavbar)
    billing/page.tsx          ← billing management (AppNavbar)
    pricing/page.tsx          ← in-app upgrade page (AppNavbar)
  optimize/page.tsx           ← 4-step wizard + results (AppNavbar)
  settings/page.tsx           ← profile + BYOK + danger (AppNavbar)
  auth/callback/route.ts      ← OAuth code exchange
  api/
    analyze/route.ts          ← main AI analysis
    upload/route.ts           ← file extraction
    usage/route.ts            ← plan + usage info
    cover-letter/route.ts     ← Elite only
    account/delete/route.ts   ← delete account
    byok/
      save/route.ts           ← encrypt + store key
      test/route.ts           ← test connection
      key/route.ts            ← DELETE key
    payment/
      create-order/route.ts   ← Razorpay order/subscription
      verify/route.ts         ← verify payment signature
      cancel/route.ts         ← cancel subscription
    webhooks/
      razorpay/route.ts       ← subscription events

components/
  AppNavbar.tsx               ← logged-in navbar
  PublicNavbar.tsx            ← logged-out navbar
  SmartNavbar.tsx             ← auto-detects session
  Footer.tsx                  ← all pages
  Logo.tsx                    ← shared logo component
  PricingSection.tsx          ← landing page pricing cards
  UpgradeModal.tsx            ← limit-hit upgrade prompt
  LockedFeature.tsx           ← locked feature overlay
  ScoreCircle.tsx             ← circular ATS score display
  CopyButton.tsx              ← copy to clipboard
  Toast.tsx                   ← global notifications

lib/
  ai/router.ts                ← AI provider routing
  supabase/
    admin.ts                  ← service role client
    client.ts                 ← browser client
  utils/
    crypto.ts                 ← AES-256 encrypt/decrypt
    json.ts                   ← cleanJSON, safeParseJSON
    pdf.ts                    ← jsPDF generation
    plan.ts                   ← ALL plan gate functions

types/
  index.ts                    ← ALL shared TypeScript types

supabase/
  schema.sql                  ← database schema + RLS

## Database Tables
profiles: id, full_name, avatar_url, plan, country, currency,
  optimizations_used_this_month, optimizations_reset_date,
  starter_optimizations_used, starter_purchased_at,
  starter_expires_at, razorpay_customer_id,
  razorpay_subscription_id, razorpay_payment_id, created_at

byok_keys: id, user_id, provider, encrypted_api_key,
  selected_model, created_at, updated_at

resume_analyses: id, user_id, original_resume_text,
  job_description, mode, pages, platform, provider_used,
  model_used, ats_score, keyword_match_score, format_score,
  missing_keywords, found_keywords, format_issues,
  suggestions, platform_specific_tips, optimized_resume_text,
  cold_email_subject, cold_email_body,
  linkedin_connection_message, linkedin_followup_message,
  cover_letter, created_at

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_PLAN_ID_PRO_INR
RAZORPAY_PLAN_ID_PRO_USD
RAZORPAY_PLAN_ID_ELITE_INR
RAZORPAY_PLAN_ID_ELITE_USD
RAZORPAY_PLAN_ID_BYOK_INR
RAZORPAY_PLAN_ID_BYOK_USD
RAZORPAY_WEBHOOK_SECRET
BYOK_ENCRYPTION_SECRET
NEXT_PUBLIC_APP_URL

## 10 Critical Rules — Never Violate
1. Always import plan gates from lib/utils/plan.ts
   Never write inline plan === 'elite' checks in components
2. Always import types from types/index.ts
   Never define shared types locally
3. Never make the product sound like a generic AI wrapper
   No "AI will analyze", "powered by AI", "AI-generated"
   Use "ATSBYOK analyzes", "smart suggestions", etc.
4. Always use Tailwind classes — never inline styles
5. Every clickable element must go somewhere real
   No fake buttons, no alert(), no placeholder links
6. Always run npx tsc --noEmit after changes
7. Always update DECISIONS.md when making new decisions
8. Never store unencrypted API keys
9. Always delete uploaded files after text extraction
10. byok plan displays as "BYOK" in all UI
    Internal code and DB keep 'byok' identifier

## Component Modification Rules

### Rule: Always Fix the Source Component, Never the Page
When any UI element needs changing, always ask:
"Is this element coming from a shared component?"

If YES → fix the shared component only.
         Never fix the same thing in individual pages.
If NO  → fix the page, then consider if it should
         be extracted into a shared component.

### Shared Components Map
| UI Element | Source Component | Used In |
|------------|-----------------|---------|
| Navbar (logged out) | components/PublicNavbar.tsx | /, /pricing, /login |
| Navbar (logged in) | components/AppNavbar.tsx | /dashboard/*, /optimize, /settings |
| Navbar (auto) | components/SmartNavbar.tsx | legal pages |
| Footer | components/Footer.tsx | ALL pages |
| Logo | components/Logo.tsx | All navbars |
| Plan badge | components/PlanBadge.tsx | Navbar, dashboard, modal |
| Upgrade prompt | components/UpgradeModal.tsx | /optimize |
| Locked feature | components/LockedFeature.tsx | /optimize results |
| Score display | components/ScoreCircle.tsx | /optimize results |
| Copy button | components/CopyButton.tsx | /optimize results |
| Toast | components/Toast.tsx | layout.tsx (global) |
| Pricing cards | components/PricingSection.tsx | /, /pricing |

### Before Making Any UI Change — Checklist
1. Which component is the source of this UI element?
2. Am I editing the source component or a page?
3. If editing a page — should this be in a component instead?
4. After editing source component — does it look correct
   on ALL pages that use it?

### Forbidden Patterns
NEVER do this:
- Copy-paste a fix into multiple page files
- Override a shared component's style in a page file
- Fix Footer in /dashboard/page.tsx instead of Footer.tsx
- Fix Navbar in /optimize/page.tsx instead of AppNavbar.tsx
- Add the same className to the same element in 3 pages

ALWAYS do this:
- Fix Footer once in components/Footer.tsx
- Fix Navbar once in AppNavbar.tsx or PublicNavbar.tsx
- Fix Logo once in components/Logo.tsx
- Verify the fix appears correctly on all pages that
  use the component

## Known Issues (fix in session order)
1. Contact form is fake (no submission)
2. AI wrapper language may still exist in some UI strings

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files.
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
