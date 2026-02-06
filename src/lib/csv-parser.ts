import { parse } from "csv-parse/sync";

export interface ParsedTransaction {
  date: string;
  vendor: string;
  amount: number;
  description: string;
}

export function parseCSV(content: string): ParsedTransaction[] {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return (records as Record<string, string>[]).map((row) => {
    const date = row["Date"] || row["date"] || row["Transaction Date"] || "";
    const vendor =
      row["Vendor"] ||
      row["vendor"] ||
      row["Description"] ||
      row["description"] ||
      row["Payee"] ||
      row["payee"] ||
      "";
    const amountStr =
      row["Amount"] ||
      row["amount"] ||
      row["Debit"] ||
      row["debit"] ||
      "0";
    const description =
      row["Description"] ||
      row["description"] ||
      row["Memo"] ||
      row["memo"] ||
      "";

    const amount = Math.round(
      Math.abs(parseFloat(amountStr.replace(/[$,]/g, "")) || 0) * 100
    );

    return { date, vendor, amount, description };
  });
}
