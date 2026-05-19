export type Plan = "free" | "starter" | "pro" | "elite" | "byok";
export type Currency = "INR" | "USD";
export type Mode = "fresher" | "experienced" | "mba";
export type Provider = "anthropic" | "openrouter" | "gemini" | "groq";
export type Platform =
  | "Naukri"
  | "LinkedIn"
  | "Indeed"
  | "Internshala"
  | "Greenhouse"
  | "Workday"
  | "Lever"
  | "Jobvite"
  | "Shine"
  | "Generic ATS";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  plan: Plan;
  country: string;
  currency: Currency;
  optimizations_used_this_month: number;
  optimizations_reset_date: string;
  starter_optimizations_used: number;
  starter_purchased_at: string | null;
  starter_expires_at: string | null;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface ByokKey {
  id: string;
  user_id: string;
  provider: Provider;
  encrypted_api_key: string;
  selected_model: string;
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  title: string;
  description: string;
  before: string;
  after: string;
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  original_resume_text: string;
  job_description: string;
  mode: Mode;
  pages: number;
  platform: string;
  provider_used: string;
  model_used: string;
  ats_score: number;
  keyword_match_score: number;
  format_score: number;
  missing_keywords: string[];
  found_keywords: string[];
  format_issues: string[];
  suggestions: Suggestion[];
  platform_specific_tips: string[];
  optimized_resume_text: string;
  cold_email_subject: string | null;
  cold_email_body: string | null;
  linkedin_connection_message: string | null;
  linkedin_followup_message: string | null;
  cover_letter: string | null;
  created_at: string;
}

export interface UsageInfo {
  plan: Plan;
  country: string;
  currency: Currency;
  used: number;
  limit: number | null;
  starter_expires_at: string | null;
  provider: string | null;
  model: string | null;
}

export interface PlanPricing {
  INR: { starter: number; pro: number; elite: number; byok: number };
  USD: { starter: number; pro: number; elite: number; byok: number };
}

export const PLAN_LIMITS: Record<Plan, number | null> = {
  free: 2,
  starter: 15,
  pro: 30,
  elite: 100,
  byok: null,
};

export const HOURLY_LIMITS: Record<Plan, number> = {
  free: 3,
  starter: 5,
  pro: 10,
  elite: 20,
  byok: 30,
};

export const PRICING: PlanPricing = {
  INR: { starter: 99, pro: 199, elite: 399, byok: 49 },
  USD: { starter: 4.99, pro: 9, elite: 18, byok: 2 },
};
