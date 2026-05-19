# ATSBYOK — Architecture Decision Log

Every significant decision is recorded here.
Before making any architectural change, read this file.
After making a decision, add it immediately.

---

## Decision Log

### [001] Authentication Method
Date: May 2026
Decision: Google OAuth only. No email/password login.
Reason: Simpler UX, no password reset needed,
  users comfortable with Google login.
Status: Implemented ✅

### [002] Payment Gateway
Date: May 2026
Decision: Razorpay only for all plans and regions.
Reason: Supports INR + international cards in one
  integration. Stripe requires US entity.
Status: Implemented ✅

### [003] PDF Generation
Date: May 2026
Decision: jsPDF plain text output for MVP.
Reason: Simpler than html2pdf. Can upgrade later.
Status: Implemented ✅

### [004] Resume Style
Date: May 2026
Decision: Single clean single-column style for all users.
  Page count auto-set by mode:
  fresher = 1 page, experienced = 2 pages, mba = 2 pages.
  No photo. Summary only. No objective statements.
Reason: Reduces decision fatigue. Works everywhere.
Status: Implemented ✅

### [005] AI Model Assignment
Date: May 2026
Decision: claude-haiku-4-5 for free and starter plans.
  claude-sonnet-4-6 for pro and elite.
  Power/BYOK uses user's own key and chosen model.
Reason: Cost control. Haiku good enough for basic use.
  Sonnet for paying users who expect better quality.
Status: Implemented ✅

### [006] Cover Letter Access
Date: May 2026
Decision: Cover Letter Generator is Elite plan only.
  Power/BYOK plan does NOT get cover letter.
Reason: Cover letter is Elite's key differentiator.
  Power is an API access plan not a job hunting plan.
Status: Implemented ✅

### [007] Starter Pack Validity
Date: May 2026
Decision: Starter pack valid 30 days from purchase date.
Reason: Prevents indefinite use of one-time purchase.
  Creates urgency to upgrade to Pro.
Status: Implemented ✅

### [008] Central Types File
Date: May 2026
Decision: All shared TypeScript types in types/index.ts only.
  Never define shared types locally.
Reason: Prevents inconsistency when types change.
Status: Implemented ✅

### [009] File Deletion After Upload
Date: May 2026
Decision: Delete uploaded files from Supabase Storage
  immediately after text extraction.
Reason: Privacy. Only extracted text stored in DB.
Status: Implemented ✅

### [010] Navbar Strategy
Date: May 2026
Decision: Three navbar components:
  PublicNavbar (logged out public pages)
  AppNavbar (logged in app pages)
  SmartNavbar (auto-detects session for legal pages)
Reason: Different navigation needs per context.
Status: Implemented ✅

### [011] No AI Wrapper Language in UI
Date: May 2026
Decision: Never use language that makes ATSBYOK sound
  like a generic AI wrapper.
  No: "AI will analyze", "powered by AI",
  "AI-generated", "our AI", "AI score"
  Yes: "ATSBYOK analyzes", "smart suggestions",
  "your score", "optimization complete"
  Provider names allowed ONLY in Power plan settings
  and server-side code.
Reason: Users buy outcomes not API access.
  Wrapper language reduces perceived value.
Status: To be fixed ⚠️

### [012] BYOK Plan Branding
Date: May 2026
Decision: BYOK plan displayed as "Power" in all UI.
  Internal code and DB keep 'byok' identifier.
Reason: "BYOK" sounds technical. "Power" sounds premium.
  The app name ATSBYOK already communicates BYOK concept.
Status: To be fixed ⚠️

### [013] Plan Gate Functions
Date: May 2026
Decision: All feature gates use functions from 
  lib/utils/plan.ts only.
  Never write inline plan checks in components or pages.
Reason: If gates change, only one file needs updating.
Status: To be fixed ⚠️

### [014] Hourly Rate Limiting
Date: May 2026
Decision: Enforce hourly limits from HOURLY_LIMITS
  constant in /api/analyze using resume_analyses count.
Status: To be fixed ⚠️

### [015] App Name
Date: May 2026
Decision: App named ATSBYOK.
  ATS = core product value (ATS optimization)
  BYOK = key differentiator (bring your own key)
  Logo: "ATS" in #111827, "BYOK" in #1D9E75
  ATS comes first — that's what users search for.
Reason: BYOK is the primary growth and marketing angle.
  Targeting tech-savvy users who know about free API keys.
  Unique positioning: pay only for platform not AI usage.
  Word of mouth: "get a free Groq key + pay ₹49 for
  unlimited resume optimization"
Status: Implemented ✅

### [016] Power Plan Business Model
Date: May 2026
Decision: Power plan users bring their own free API key
  from providers like Groq, OpenRouter, Gemini.
  ATSBYOK charges only ₹49/month for platform access.
  AI cost for Power plan users = ₹0 for ATSBYOK.
  Profit margin on Power plan = ~100%.
Reason: Free API tiers from modern providers are good
  enough for resume optimization. Users get unlimited
  optimizations for almost nothing. We get recurring
  revenue with zero variable cost.
Status: Implemented ✅

### [017] Structured HTML Resume Preview
Date: May 2026
Decision: Parse optimized_resume_text into a structured
  ParsedResume object (lib/utils/resumeParser.ts) and
  render it as an A4-style HTML document preview
  (components/ResumePreview.tsx) instead of a plain textarea.
  Free plan users see name/contact/summary/education/first
  experience entry unlocked; remaining sections blur-locked
  with upgrade prompt.
Reason: Plain textarea output looks unprofessional and
  makes it hard to assess resume quality at a glance.
  HTML preview provides a realistic document feel and
  makes the lock mechanic more compelling for conversion.
  Parser uses line-by-line regex with section heading
  detection; falls back to <pre> display if parsing fails.
Status: Implemented ✅

---

## How to Add a Decision

### [XXX] Decision Title
Date:
Decision:
Reason:
Alternatives considered:
Status: Implemented ✅ / In Progress 🔄 / To be fixed ⚠️
