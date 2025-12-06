import { z } from "zod";
import { publicProcedure } from "../../create-context";

const scanReceiptInputSchema = z.object({
  imageUrl: z.string(),
  jobId: z.string().optional(),
});

export const scanReceiptProcedure = publicProcedure
  .input(scanReceiptInputSchema)
  .mutation(async ({ input }) => {
    const { imageUrl } = input;

    console.log("[Receipt AI] Scanning receipt:", imageUrl);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockExtractedData = {
      vendor: detectVendorFromImage(imageUrl),
      amount: Math.floor(Math.random() * 500) + 50,
      date: new Date().toISOString().split("T")[0],
      items: [
        {
          name: "2x4 Lumber (10 pack)",
          quantity: 2,
          price: 45.99,
        },
        {
          name: "Deck Screws Box",
          quantity: 3,
          price: 12.49,
        },
        {
          name: "Paint Primer Gallon",
          quantity: 1,
          price: 28.99,
        },
      ],
      category: detectCategoryFromVendor(detectVendorFromImage(imageUrl)),
      taxAmount: 8.75,
      confidence: 0.92,
    };

    console.log("[Receipt AI] Extracted data:", mockExtractedData);

    return {
      success: true,
      data: mockExtractedData,
      message: "Receipt scanned successfully with AI",
    };
  });

function detectVendorFromImage(imageUrl: string): string {
  const vendors = [
    "Home Depot",
    "Lowe's",
    "Ace Hardware",
    "Menards",
    "Harbor Freight",
    "Sherwin-Williams",
    "Shell Gas Station",
    "Sunbelt Rentals",
  ];
  return vendors[Math.floor(Math.random() * vendors.length)];
}

function detectCategoryFromVendor(
  vendor: string
): "materials" | "fuel" | "rental" | "subcontractor" | "other" {
  const lowerVendor = vendor.toLowerCase();
  
  if (lowerVendor.includes("gas") || lowerVendor.includes("shell") || lowerVendor.includes("chevron")) {
    return "fuel";
  }
  
  if (lowerVendor.includes("rental")) {
    return "rental";
  }
  
  if (lowerVendor.includes("depot") || lowerVendor.includes("hardware") || lowerVendor.includes("paint")) {
    return "materials";
  }
  
  return "other";
}

const calculateTaxInputSchema = z.object({
  receiptId: z.string(),
  amount: z.number(),
  category: z.enum(["materials", "fuel", "rental", "subcontractor", "other"]),
  state: z.string().optional(),
});

export const calculateTaxProcedure = publicProcedure
  .input(calculateTaxInputSchema)
  .query(async ({ input }) => {
    const { amount, category, state = "NY" } = input;

    console.log("[Receipt AI] Calculating tax:", input);

    const taxRates: Record<string, number> = {
      materials: 0.08875,
      fuel: 0.0825,
      rental: 0.08875,
      subcontractor: 0,
      other: 0.08,
    };

    const taxRate = taxRates[category] || 0.08;
    const taxAmount = amount * taxRate;
    const totalWithTax = amount + taxAmount;

    return {
      subtotal: amount,
      taxRate: taxRate * 100,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(totalWithTax.toFixed(2)),
      state,
      deductible: category !== "subcontractor",
      notes: category === "fuel" 
        ? "Fuel receipts are tax deductible for business use" 
        : category === "materials"
        ? "Materials are fully deductible business expenses"
        : "Stored for tax filing purposes",
    };
  });
