import { Plan, Currency, PRICING } from "@/types";

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
  byok: "BYOK",
};

export function getPlanLabel(plan: Plan): string {
  return PLAN_LABELS[plan] ?? plan;
}

export function getModelForPlan(plan: Plan): string {
  if (plan === "free" || plan === "starter") return "claude-haiku-4-5";
  return "claude-sonnet-4-6";
}

export function getPagesForMode(mode: string): number {
  return mode === "fresher" ? 1 : 2;
}

export function formatCurrency(
  amount: number,
  currency: Currency,
  isMonthly = false
): string {
  const symbol = currency === "INR" ? "₹" : "$";
  const formatted =
    currency === "INR"
      ? `${symbol}${amount}`
      : `${symbol}${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
  return isMonthly ? `${formatted}/mo` : formatted;
}

export function getPlanPrice(
  plan: "starter" | "pro" | "elite" | "byok",
  currency: Currency
): number {
  return PRICING[currency][plan];
}

export function canDownloadPDF(plan: Plan): boolean {
  return plan !== "free";
}

export function canUseColdEmail(plan: Plan): boolean {
  return plan !== "free";
}

export function canUseLinkedIn(plan: Plan): boolean {
  return plan !== "free";
}

export function canUseCoverLetter(plan: Plan): boolean {
  return plan === "elite";
}

export function canUseBYOK(plan: Plan): boolean {
  return plan === "byok";
}

export function isStarterPlan(plan: Plan): boolean {
  return plan === "starter";
}

export function isFreePlan(plan: Plan): boolean {
  return plan === "free";
}

export function isSubscriptionPlan(plan: Plan): boolean {
  return plan === "pro" || plan === "elite" || plan === "byok";
}
