export const CATEGORIES = [
  "Advertising",
  "Meals & Entertainment",
  "Office Expenses",
  "Professional Fees",
  "Travel",
  "Vehicle",
  "Software / Subscriptions",
  "Bank Charges",
  "Owner Draw / Personal",
  "Uncategorized",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_KEYS: Record<string, Category> = {
  "1": "Advertising",
  "2": "Meals & Entertainment",
  "3": "Office Expenses",
  "4": "Professional Fees",
  "5": "Travel",
  "6": "Vehicle",
  "7": "Software / Subscriptions",
  "8": "Bank Charges",
  "9": "Owner Draw / Personal",
  "0": "Uncategorized",
};

export const PRIMARY_COLOR = "#3B82F6";
