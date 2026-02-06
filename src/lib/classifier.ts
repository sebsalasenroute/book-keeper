import { prisma } from "./db";
import { CATEGORIES } from "./constants";

interface ClassificationResult {
  category: string;
  source: "PRIOR_YEAR" | "RULE" | "AI";
  confidence: number;
  explanation: string;
}

const SIMULATED_PRIOR_YEAR: Record<string, string> = {
  "amazon": "Office Expenses",
  "staples": "Office Expenses",
  "uber": "Travel",
  "air canada": "Travel",
  "westjet": "Travel",
  "tim hortons": "Meals & Entertainment",
  "starbucks": "Meals & Entertainment",
  "mcdonald": "Meals & Entertainment",
  "shell": "Vehicle",
  "petro-canada": "Vehicle",
  "esso": "Vehicle",
  "google": "Software / Subscriptions",
  "microsoft": "Software / Subscriptions",
  "adobe": "Software / Subscriptions",
  "slack": "Software / Subscriptions",
  "facebook": "Advertising",
  "google ads": "Advertising",
  "td bank": "Bank Charges",
  "rbc": "Bank Charges",
  "scotiabank": "Bank Charges",
  "deloitte": "Professional Fees",
  "kpmg": "Professional Fees",
};

export async function classifyTransaction(
  vendorRaw: string,
  tenantId: string
): Promise<ClassificationResult> {
  const vendorLower = vendorRaw.toLowerCase();

  // 1. Check prior year mapping (highest priority)
  for (const [keyword, category] of Object.entries(SIMULATED_PRIOR_YEAR)) {
    if (vendorLower.includes(keyword)) {
      return {
        category,
        source: "PRIOR_YEAR",
        confidence: 95,
        explanation: `Matched prior-year mapping: "${keyword}" → ${category}`,
      };
    }
  }

  // 2. Check vendor rules from DB
  const rules = await prisma.vendorRule.findMany({
    where: { tenantId },
  });

  for (const rule of rules) {
    if (vendorLower.includes(rule.vendorContains.toLowerCase())) {
      return {
        category: rule.category,
        source: "RULE",
        confidence: 85,
        explanation: `Matched vendor rule: "${rule.vendorContains}" → ${rule.category}`,
      };
    }
  }

  // 3. Simulated AI suggestion (low confidence, random category)
  const aiCategories = CATEGORIES.filter((c) => c !== "Uncategorized");
  const randomCategory =
    aiCategories[Math.floor(Math.random() * aiCategories.length)];
  const randomConfidence = 30 + Math.floor(Math.random() * 40); // 30-69

  return {
    category: randomCategory,
    source: "AI",
    confidence: randomConfidence,
    explanation: `AI suggestion based on vendor name analysis (simulated)`,
  };
}
