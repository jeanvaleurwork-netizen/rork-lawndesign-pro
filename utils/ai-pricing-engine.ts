import { Estimate, LineItem } from "@/types";

export interface PricingSuggestion {
  id: string;
  type: "warning" | "tip" | "upsell";
  title: string;
  description: string;
  action?: string;
  impact?: number;
}

export interface UpsellSuggestion {
  id: string;
  name: string;
  description: string;
  estimatedPrice: number;
  reason: string;
  category: string;
}

export function analyzeProfitMargin(
  subtotal: number,
  actualCost?: number
): PricingSuggestion[] {
  const suggestions: PricingSuggestion[] = [];

  if (!actualCost) {
    suggestions.push({
      id: "no-cost-data",
      type: "tip",
      title: "Add Cost Breakdown",
      description: "Track actual costs to monitor profit margins automatically.",
      action: "Add cost breakdown to this estimate",
    });
    return suggestions;
  }

  const profit = subtotal - actualCost;
  const margin = (profit / subtotal) * 100;

  if (margin < 15) {
    suggestions.push({
      id: "low-margin",
      type: "warning",
      title: "Low Profit Margin",
      description: `Profit margin is ${margin.toFixed(1)}%, below recommended 25% minimum. Consider increasing pricing or reducing costs.`,
      impact: (subtotal * 0.25 - profit),
    });
  } else if (margin < 25) {
    suggestions.push({
      id: "below-target",
      type: "tip",
      title: "Below Target Margin",
      description: `Current margin is ${margin.toFixed(1)}%. Aiming for 30-35% would improve profitability.`,
      impact: (subtotal * 0.30 - profit),
    });
  }

  return suggestions;
}

export function analyzeLaborMaterialsRatio(lineItems: LineItem[]): PricingSuggestion[] {
  const suggestions: PricingSuggestion[] = [];

  const laborItems = lineItems.filter(
    (item) => item.category === "labor"
  );
  const materialItems = lineItems.filter(
    (item) => item.category === "materials"
  );

  const laborTotal = laborItems.reduce((sum, item) => sum + item.amount, 0);
  const materialTotal = materialItems.reduce((sum, item) => sum + item.amount, 0);

  if (laborTotal === 0 && materialTotal === 0) {
    return suggestions;
  }

  const ratio = laborTotal / (materialTotal || 1);

  if (ratio < 0.5 && laborTotal > 0) {
    suggestions.push({
      id: "low-labor",
      type: "warning",
      title: "Labor Seems Low",
      description: `Labor is ${ratio.toFixed(1)}x materials cost. Typical range is 0.8x-1.5x. Verify labor hours are accurate.`,
    });
  } else if (ratio > 2 && materialTotal > 0) {
    suggestions.push({
      id: "high-labor",
      type: "warning",
      title: "High Labor Ratio",
      description: `Labor is ${ratio.toFixed(1)}x materials cost. Consider if quote is labor-heavy or if materials are underestimated.`,
    });
  }

  return suggestions;
}

export function suggestMissingFees(lineItems: LineItem[], total: number): PricingSuggestion[] {
  const suggestions: PricingSuggestion[] = [];

  const hasDumpFee = lineItems.some((item) =>
    item.name.toLowerCase().includes("dump") || item.name.toLowerCase().includes("disposal")
  );
  const hasPermitFee = lineItems.some((item) =>
    item.name.toLowerCase().includes("permit")
  );
  const hasTransportation = lineItems.some((item) =>
    item.name.toLowerCase().includes("transport") || item.name.toLowerCase().includes("delivery")
  );

  if (!hasDumpFee && total > 2000) {
    suggestions.push({
      id: "missing-dump",
      type: "tip",
      title: "Consider Disposal Fee",
      description: "For jobs over $2,000, consider adding disposal/dump fees ($150-$400 typical).",
      impact: 250,
    });
  }

  if (!hasPermitFee && total > 5000) {
    suggestions.push({
      id: "missing-permit",
      type: "tip",
      title: "Check Permit Requirements",
      description: "Large projects may require permits. Typical permit fees: $100-$500.",
      impact: 200,
    });
  }

  if (!hasTransportation && total > 3000) {
    suggestions.push({
      id: "missing-transport",
      type: "tip",
      title: "Add Transportation Fee",
      description: "Consider adding delivery/transportation fee for materials and equipment.",
      impact: 150,
    });
  }

  return suggestions;
}

export function getUpsellSuggestions(
  estimateCategory: string,
  currentItems: LineItem[]
): UpsellSuggestion[] {
  const suggestions: UpsellSuggestion[] = [];
  const itemNames = currentItems.map((item) => item.name.toLowerCase());

  const upsellDatabase: Record<string, UpsellSuggestion[]> = {
    patio: [
      {
        id: "patio-seal",
        name: "Paver Sealing",
        description: "Protect pavers from weathering and enhance color",
        estimatedPrice: 450,
        reason: "Extends paver life by 5-10 years",
        category: "Protection",
      },
      {
        id: "patio-lighting",
        name: "Landscape Lighting",
        description: "LED lighting around patio perimeter",
        estimatedPrice: 850,
        reason: "Increases property value and usability",
        category: "Enhancement",
      },
      {
        id: "patio-drainage",
        name: "French Drain System",
        description: "Prevent water pooling around patio",
        estimatedPrice: 650,
        reason: "Prevents foundation damage and extends patio life",
        category: "Protection",
      },
      {
        id: "patio-furniture",
        name: "Built-in Seating",
        description: "Custom stone or block seating wall",
        estimatedPrice: 1200,
        reason: "Adds functionality and visual appeal",
        category: "Enhancement",
      },
    ],
    roofing: [
      {
        id: "roof-gutter",
        name: "Gutter Cleaning & Repair",
        description: "Clean and repair existing gutters",
        estimatedPrice: 350,
        reason: "Prevents water damage to new roof",
        category: "Maintenance",
      },
      {
        id: "roof-seal",
        name: "Attic Ventilation Upgrade",
        description: "Improve attic airflow to extend roof life",
        estimatedPrice: 750,
        reason: "Reduces energy costs and extends shingle life",
        category: "Enhancement",
      },
      {
        id: "roof-storm",
        name: "Storm Damage Protection",
        description: "Impact-resistant shingles upgrade",
        estimatedPrice: 1200,
        reason: "May reduce insurance premiums",
        category: "Protection",
      },
    ],
    lawn: [
      {
        id: "lawn-fertilizer",
        name: "Seasonal Fertilizer Package",
        description: "4-season fertilization program",
        estimatedPrice: 380,
        reason: "Maintains healthy, green lawn year-round",
        category: "Maintenance",
      },
      {
        id: "lawn-aeration",
        name: "Core Aeration Service",
        description: "Annual lawn aeration",
        estimatedPrice: 225,
        reason: "Improves nutrient absorption and root growth",
        category: "Enhancement",
      },
      {
        id: "lawn-pest",
        name: "Pest & Weed Control",
        description: "Quarterly pest and weed treatment",
        estimatedPrice: 450,
        reason: "Protects investment in new lawn",
        category: "Protection",
      },
    ],
    landscaping: [
      {
        id: "landscape-irrigation",
        name: "Drip Irrigation System",
        description: "Automated watering for plant beds",
        estimatedPrice: 950,
        reason: "Reduces water waste and ensures plant health",
        category: "Enhancement",
      },
      {
        id: "landscape-lighting",
        name: "Pathway Lighting",
        description: "Solar or low-voltage path lights",
        estimatedPrice: 650,
        reason: "Improves safety and curb appeal",
        category: "Enhancement",
      },
      {
        id: "landscape-mulch",
        name: "Premium Mulch Upgrade",
        description: "Cedar or rubber mulch instead of standard",
        estimatedPrice: 320,
        reason: "Lasts 2-3x longer than standard mulch",
        category: "Enhancement",
      },
    ],
  };

  const category = estimateCategory.toLowerCase();
  const availableUpsells = upsellDatabase[category] || [];

  availableUpsells.forEach((upsell) => {
    const alreadyIncluded = itemNames.some((name) =>
      name.includes(upsell.name.toLowerCase().split(" ")[0])
    );
    if (!alreadyIncluded) {
      suggestions.push(upsell);
    }
  });

  return suggestions;
}

export function suggestLocalPricing(
  squareFootage?: number,
  serviceType?: string
): PricingSuggestion[] {
  const suggestions: PricingSuggestion[] = [];

  if (!squareFootage || !serviceType) {
    return suggestions;
  }

  const pricingData: Record<string, { min: number; max: number; unit: string }> = {
    patio: { min: 12, max: 20, unit: "per sqft" },
    roofing: { min: 4.5, max: 8, unit: "per sqft" },
    lawn: { min: 0.8, max: 1.5, unit: "per sqft" },
    landscaping: { min: 3, max: 7, unit: "per sqft" },
  };

  const pricing = pricingData[serviceType.toLowerCase()];
  if (pricing) {
    const recommended = (pricing.min + pricing.max) / 2;
    const estimatedPrice = recommended * squareFootage;

    suggestions.push({
      id: "local-pricing",
      type: "tip",
      title: "Local Market Pricing",
      description: `Typical pricing in your area: $${pricing.min}-$${pricing.max} ${pricing.unit}. For ${squareFootage} sqft, consider $${estimatedPrice.toLocaleString()}.`,
      impact: estimatedPrice,
    });
  }

  return suggestions;
}

export function analyzeEstimate(estimate: Estimate): PricingSuggestion[] {
  const allSuggestions: PricingSuggestion[] = [];

  const profitSuggestions = analyzeProfitMargin(
    estimate.subtotal,
    estimate.actualCost
  );
  allSuggestions.push(...profitSuggestions);

  const ratioSuggestions = analyzeLaborMaterialsRatio(estimate.lineItems);
  allSuggestions.push(...ratioSuggestions);

  const feeSuggestions = suggestMissingFees(estimate.lineItems, estimate.total);
  allSuggestions.push(...feeSuggestions);

  return allSuggestions;
}
