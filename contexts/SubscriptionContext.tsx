import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from "@/lib/trpc";

export type SubscriptionTier = "starter" | "pro" | "enterprise" | "elite" | "elitePlus" | "none";

export interface SubscriptionDetails {
  tier: SubscriptionTier;
  aiCredits: number;
  billingCycle: "monthly" | "annual";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  autoRenew: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status?: "active" | "canceled" | "past_due" | "incomplete" | "trialing";
}

const SUBSCRIPTION_STORAGE_KEY = "@contractoros_subscription";

const TIER_PRICES = {
  starter: { monthly: 99, annual: 1188 },
  pro: { monthly: 299, annual: 3588 },
  enterprise: { monthly: 999, annual: 11988 },
  elite: { monthly: 1999, annual: 23988 },
  elitePlus: { monthly: 2499, annual: 29988 },
};

const TIER_AI_CREDITS = {
  starter: 50,
  pro: 300,
  enterprise: 1500,
  elite: 3000,
  elitePlus: 5000,
};

const TIER_FEATURES = {
  starter: [
    "estimates_invoices",
    "crew_clock",
    "customer_portal",
    "basic_contracts",
    "ai_phone_intake",
    "job_scheduling",
    "job_tracking",
  ],
  pro: [
    "estimates_invoices",
    "crew_clock",
    "customer_portal",
    "unlimited_contracts",
    "legal_suite",
    "job_profit_analysis",
    "full_crew_management",
    "scheduling",
    "receipt_scanning",
    "ai_phone_intake",
    "job_scheduling",
    "job_tracking",
    "crew_portal",
    "gps_timecards",
    "material_tracking",
  ],
  enterprise: [
    "estimates_invoices",
    "crew_clock",
    "customer_portal",
    "unlimited_contracts",
    "legal_suite",
    "job_profit_analysis",
    "full_crew_management",
    "scheduling",
    "receipt_scanning",
    "ai_phone_intake",
    "job_scheduling",
    "job_tracking",
    "crew_portal",
    "gps_timecards",
    "material_tracking",
    "multi_admin",
    "payroll_analytics",
    "subcontractor_management",
    "change_orders",
    "custom_reports",
    "client_dropbox",
    "digital_warranty",
    "ai_pricing",
    "full_branding",
  ],
  elite: [
    "estimates_invoices",
    "crew_clock",
    "customer_portal",
    "unlimited_contracts",
    "legal_suite",
    "job_profit_analysis",
    "full_crew_management",
    "scheduling",
    "receipt_scanning",
    "ai_phone_intake",
    "job_scheduling",
    "job_tracking",
    "crew_portal",
    "gps_timecards",
    "material_tracking",
    "multi_admin",
    "payroll_analytics",
    "subcontractor_management",
    "change_orders",
    "custom_reports",
    "client_dropbox",
    "digital_warranty",
    "ai_pricing",
    "full_branding",
    "ai_operations_manager",
    "business_intelligence",
    "ai_safety_officer",
    "crew_performance_scoring",
    "supplier_optimization",
    "purchasing_automation",
    "custom_integrations",
    "priority_support",
  ],
  elitePlus: [
    "estimates_invoices",
    "crew_clock",
    "customer_portal",
    "unlimited_contracts",
    "legal_suite",
    "job_profit_analysis",
    "full_crew_management",
    "scheduling",
    "receipt_scanning",
    "ai_phone_intake",
    "job_scheduling",
    "job_tracking",
    "crew_portal",
    "gps_timecards",
    "material_tracking",
    "multi_admin",
    "payroll_analytics",
    "subcontractor_management",
    "change_orders",
    "custom_reports",
    "client_dropbox",
    "digital_warranty",
    "ai_pricing",
    "full_branding",
    "ai_operations_manager",
    "business_intelligence",
    "ai_safety_officer",
    "crew_performance_scoring",
    "supplier_optimization",
    "purchasing_automation",
    "custom_integrations",
    "priority_support",
    "multi_location_rollout",
    "regional_pricing_ai",
    "dedicated_account_manager",
    "custom_onboarding",
    "erp_integration",
    "safety_compliance_automation",
    "sop_automation",
    "strategic_planning_ai",
    "white_glove_service",
  ],
  none: [],
};

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [subscription, setSubscription] = useState<SubscriptionDetails>({
    tier: "none",
    aiCredits: 0,
    billingCycle: "monthly",
    autoRenew: true,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        const parsedSubscription = JSON.parse(stored) as SubscriptionDetails;
        setSubscription(parsedSubscription);
        console.log("[Subscription] Loaded:", parsedSubscription.tier);
      } else {
        console.log("[Subscription] No subscription found");
      }
    } catch (error) {
      console.error("[Subscription] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSubscription = async (newSubscription: SubscriptionDetails) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSubscription));
      setSubscription(newSubscription);
      console.log("[Subscription] Saved:", newSubscription.tier);
    } catch (error) {
      console.error("[Subscription] Failed to save:", error);
      throw error;
    }
  };

  const upgradeTier = async (
    tier: SubscriptionTier,
    billingCycle: "monthly" | "annual",
    stripeData?: {
      subscriptionId: string;
      customerId: string;
      status: "active" | "canceled" | "past_due" | "incomplete" | "trialing";
    }
  ) => {
    const newSubscription: SubscriptionDetails = {
      tier,
      aiCredits: (tier !== "none" ? TIER_AI_CREDITS[tier] : 0) || 0,
      billingCycle,
      subscriptionStartDate: new Date().toISOString(),
      autoRenew: true,
      stripeSubscriptionId: stripeData?.subscriptionId,
      stripeCustomerId: stripeData?.customerId,
      status: stripeData?.status || "active",
    };
    await saveSubscription(newSubscription);
  };

  const useAICredits = async (count: number) => {
    if (subscription.aiCredits >= count) {
      const updated = {
        ...subscription,
        aiCredits: subscription.aiCredits - count,
      };
      await saveSubscription(updated);
      return true;
    }
    return false;
  };

  const addAICredits = async (count: number) => {
    const updated = {
      ...subscription,
      aiCredits: subscription.aiCredits + count,
    };
    await saveSubscription(updated);
  };

  const hasFeature = (feature: string): boolean => {
    if (subscription.tier === "none") return false;
    return TIER_FEATURES[subscription.tier]?.includes(feature) || false;
  };

  const canAccessTab = (tabName: string): boolean => {
    const tabFeatureMap: Record<string, string> = {
      "estimates": "estimates_invoices",
      "clients": "estimates_invoices",
      "schedule": "scheduling",
      "payroll": "payroll_analytics",
      "analytics": "advanced_analytics",
      "invoices": "estimates_invoices",
      "receipts": "receipt_scanning",
      "crew": "full_crew_management",
      "business": "estimates_invoices",
    };

    const requiredFeature = tabFeatureMap[tabName];
    if (!requiredFeature) return true;
    
    return hasFeature(requiredFeature);
  };

  const getTierPrice = (tier: SubscriptionTier, cycle: "monthly" | "annual"): number => {
    if (tier === "none") return 0;
    return TIER_PRICES[tier]?.[cycle] || 0;
  };

  const getTierName = (tier: SubscriptionTier): string => {
    const names = {
      starter: "Starter",
      pro: "Pro",
      enterprise: "Enterprise",
      elite: "Elite",
      elitePlus: "Elite PLUS",
      none: "None",
    };
    return names[tier] || "None";
  };

  const updateSubscriptionStatus = async (status: "active" | "canceled" | "past_due" | "incomplete" | "trialing") => {
    const updated = {
      ...subscription,
      status,
    };
    await saveSubscription(updated);
  };

  return {
    subscription,
    isLoading,
    upgradeTier,
    useAICredits,
    addAICredits,
    hasFeature,
    canAccessTab,
    getTierPrice,
    getTierName,
    updateSubscriptionStatus,
    isStarter: subscription.tier === "starter",
    isPro: subscription.tier === "pro",
    isEnterprise: subscription.tier === "enterprise",
    isElite: subscription.tier === "elite",
    isElitePlus: subscription.tier === "elitePlus",
    hasSubscription: subscription.tier !== "none",
    isActive: subscription.status === "active" || subscription.status === "trialing",
  };
});
