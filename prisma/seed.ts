import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.classification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.extraction.deleteMany();
  await prisma.document.deleteMany();
  await prisma.jobQueue.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.vendorRule.deleteMany();
  await prisma.engagement.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: { name: "Maple Leaf Accounting LLP" },
  });

  // Create users
  const junior = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "junior@mapleleaf.ca",
      name: "Sarah Chen",
      role: "JUNIOR",
    },
  });

  const senior = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "senior@mapleleaf.ca",
      name: "David Thompson",
      role: "SENIOR",
    },
  });

  // Create vendor rules
  await prisma.vendorRule.createMany({
    data: [
      { tenantId: tenant.id, vendorContains: "shopify", category: "Software / Subscriptions", appliesGlobally: true },
      { tenantId: tenant.id, vendorContains: "wix", category: "Software / Subscriptions", appliesGlobally: false },
      { tenantId: tenant.id, vendorContains: "canada post", category: "Office Expenses", appliesGlobally: true },
      { tenantId: tenant.id, vendorContains: "purolator", category: "Office Expenses", appliesGlobally: true },
    ],
  });

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: "Northern Lights Consulting Inc.",
        entityType: "CORP",
        province: "ON",
        gstRegistered: true,
      },
    }),
    prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: "Prairie Wind Farm Services",
        entityType: "SOLE_PROP",
        province: "AB",
        gstRegistered: true,
      },
    }),
    prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: "Vancouver Craft Brewery LP",
        entityType: "PARTNERSHIP",
        province: "BC",
        gstRegistered: true,
      },
    }),
    prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: "Maritime Tech Solutions",
        entityType: "CORP",
        province: "NS",
        gstRegistered: false,
      },
    }),
  ]);

  // Create engagements with transactions for first client
  const engagement1 = await prisma.engagement.create({
    data: { clientId: clients[0].id, year: 2025 },
  });

  const engagement2 = await prisma.engagement.create({
    data: { clientId: clients[1].id, year: 2025 },
  });

  const engagement3 = await prisma.engagement.create({
    data: { clientId: clients[2].id, year: 2025 },
  });

  await prisma.engagement.create({
    data: { clientId: clients[3].id, year: 2025 },
  });

  // Create a document for first engagement
  const doc1 = await prisma.document.create({
    data: {
      engagementId: engagement1.id,
      filename: "bank-statement-jan-2025.csv",
      mimeType: "text/csv",
      status: "READY",
    },
  });

  // Seed transactions for Northern Lights
  const txnData = [
    { date: new Date("2025-01-03"), vendorRaw: "Tim Hortons #4521", vendorNorm: "Tim Hortons", amountCents: 1245, description: "Coffee and muffins - client meeting", category: "Meals & Entertainment", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-05"), vendorRaw: "Amazon.ca Marketplace", vendorNorm: "Amazon", amountCents: 15499, description: "Office supplies - printer paper, toner", category: "Office Expenses", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-07"), vendorRaw: "Shell Gas Station #89", vendorNorm: "Shell", amountCents: 8734, description: "Fuel for company vehicle", category: "Vehicle", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-10"), vendorRaw: "Google Workspace", vendorNorm: "Google", amountCents: 1800, description: "Monthly subscription", category: "Software / Subscriptions", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-12"), vendorRaw: "Air Canada YYZ-YVR", vendorNorm: "Air Canada", amountCents: 45600, description: "Flight to Vancouver for conference", category: "Travel", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-15"), vendorRaw: "TD Bank Service Charge", vendorNorm: "TD Bank", amountCents: 2995, description: "Monthly account fee", category: "Bank Charges", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-17"), vendorRaw: "Facebook Ads Manager", vendorNorm: "Facebook", amountCents: 25000, description: "Ad campaign January", category: "Advertising", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-20"), vendorRaw: "Deloitte Advisory", vendorNorm: "Deloitte", amountCents: 350000, description: "Tax advisory services", category: "Professional Fees", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-22"), vendorRaw: "Uber Trip #8843", vendorNorm: "Uber", amountCents: 2340, description: "Ride to client office", category: "Travel", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-25"), vendorRaw: "Starbucks Reserve", vendorNorm: "Starbucks", amountCents: 1875, description: "Team lunch meeting", category: "Meals & Entertainment", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-01-28"), vendorRaw: "Petro-Canada #1177", vendorNorm: "Petro-Canada", amountCents: 7523, description: "Vehicle fuel", category: "Vehicle", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-02-01"), vendorRaw: "Microsoft 365 Business", vendorNorm: "Microsoft", amountCents: 2750, description: "Monthly software subscription", category: "Software / Subscriptions", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-02-03"), vendorRaw: "WestJet YYC-YOW", vendorNorm: "WestJet", amountCents: 38900, description: "Flight to Ottawa", category: "Travel", source: "PRIOR_YEAR" as const, confidence: 95 },
    { date: new Date("2025-02-05"), vendorRaw: "Unknown Vendor Corp", vendorNorm: "Unknown Vendor Corp", amountCents: 12500, description: "Miscellaneous payment", category: "Office Expenses", source: "AI" as const, confidence: 42 },
    { date: new Date("2025-02-07"), vendorRaw: "ACME Services Ltd", vendorNorm: "ACME Services", amountCents: 67800, description: "Consulting services", category: "Professional Fees", source: "AI" as const, confidence: 55 },
    { date: new Date("2025-02-10"), vendorRaw: "Quick Print Express", vendorNorm: "Quick Print Express", amountCents: 4500, description: "Business cards and flyers", category: "Advertising", source: "AI" as const, confidence: 38 },
    { date: new Date("2025-02-12"), vendorRaw: "Shopify Monthly", vendorNorm: "Shopify", amountCents: 7900, description: "E-commerce platform fee", category: "Software / Subscriptions", source: "RULE" as const, confidence: 85 },
    { date: new Date("2025-02-14"), vendorRaw: "Owner Transfer - Personal", vendorNorm: "Owner Transfer", amountCents: 200000, description: "Owner withdrawal", category: "Owner Draw / Personal", source: "AI" as const, confidence: 62 },
    { date: new Date("2025-02-16"), vendorRaw: "Canada Post #5522", vendorNorm: "Canada Post", amountCents: 2345, description: "Courier and postage", category: "Office Expenses", source: "RULE" as const, confidence: 85 },
    { date: new Date("2025-02-18"), vendorRaw: "New Vendor XYZ", vendorNorm: "New Vendor XYZ", amountCents: 9999, description: "Unclassified purchase", category: "Uncategorized", source: "AI" as const, confidence: 15 },
  ];

  // Mix of states for demo
  const states = [
    "SUGGESTED", "SUGGESTED", "SUGGESTED", "PREPARED", "PREPARED",
    "PREPARED", "PREPARED", "REVIEWED", "REVIEWED", "REVIEWED",
    "SUGGESTED", "SUGGESTED", "SUGGESTED", "NEW", "NEW",
    "NEW", "SUGGESTED", "NEW", "SUGGESTED", "NEW",
  ] as const;

  for (let i = 0; i < txnData.length; i++) {
    const t = txnData[i];
    const txn = await prisma.transaction.create({
      data: {
        engagementId: engagement1.id,
        documentId: doc1.id,
        date: t.date,
        vendorRaw: t.vendorRaw,
        vendorNorm: t.vendorNorm,
        amountCents: t.amountCents,
        description: t.description,
        state: states[i],
      },
    });

    await prisma.classification.create({
      data: {
        transactionId: txn.id,
        category: t.category,
        source: t.source,
        confidence: t.confidence,
        explanation: `${t.source === "PRIOR_YEAR" ? "Matched prior-year mapping" : t.source === "RULE" ? "Matched vendor rule" : "AI suggestion"}: "${t.vendorNorm}" → ${t.category}`,
      },
    });
  }

  // Seed some transactions for Prairie Wind
  const doc2 = await prisma.document.create({
    data: {
      engagementId: engagement2.id,
      filename: "expenses-q1-2025.pdf",
      mimeType: "application/pdf",
      status: "READY",
    },
  });

  const prairieVendors = [
    { date: new Date("2025-01-08"), vendorRaw: "John Deere Parts", vendorNorm: "John Deere", amountCents: 125000, description: "Equipment parts", category: "Vehicle", source: "AI" as const, confidence: 55, state: "NEW" as const },
    { date: new Date("2025-01-15"), vendorRaw: "Esso Highway #32", vendorNorm: "Esso", amountCents: 9800, description: "Diesel fuel", category: "Vehicle", source: "PRIOR_YEAR" as const, confidence: 95, state: "SUGGESTED" as const },
    { date: new Date("2025-02-01"), vendorRaw: "Alberta Insurance Group", vendorNorm: "Alberta Insurance", amountCents: 450000, description: "Annual liability insurance", category: "Professional Fees", source: "AI" as const, confidence: 45, state: "NEW" as const },
    { date: new Date("2025-02-10"), vendorRaw: "RBC Monthly Fee", vendorNorm: "RBC", amountCents: 1995, description: "Business account fee", category: "Bank Charges", source: "PRIOR_YEAR" as const, confidence: 95, state: "SUGGESTED" as const },
    { date: new Date("2025-02-20"), vendorRaw: "Slack Technologies", vendorNorm: "Slack", amountCents: 1050, description: "Team communication tool", category: "Software / Subscriptions", source: "PRIOR_YEAR" as const, confidence: 95, state: "PREPARED" as const },
  ];

  for (const t of prairieVendors) {
    const txn = await prisma.transaction.create({
      data: {
        engagementId: engagement2.id,
        documentId: doc2.id,
        date: t.date,
        vendorRaw: t.vendorRaw,
        vendorNorm: t.vendorNorm,
        amountCents: t.amountCents,
        description: t.description,
        state: t.state,
      },
    });

    await prisma.classification.create({
      data: {
        transactionId: txn.id,
        category: t.category,
        source: t.source,
        confidence: t.confidence,
        explanation: `Classification for ${t.vendorNorm}`,
      },
    });
  }

  console.log("✓ Seed data created successfully!");
  console.log(`  Tenant: ${tenant.name}`);
  console.log(`  Users: ${junior.name} (Junior), ${senior.name} (Senior)`);
  console.log(`  Clients: ${clients.length}`);
  console.log(`  Transactions: ${txnData.length + prairieVendors.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
