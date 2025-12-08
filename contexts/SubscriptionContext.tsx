import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SubscriptionTier = "basic" | "pro" | "elite" | "enterprise" | "none";

export interface SubscriptionDetails {
  tier: SubscriptionTier;
  aiCredits: number;
  billingCycle: "monthly" | "annual";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  autoRenew: boolean;
}

const SUBSCRIPTION_STORAGE_KEY = "@contractoros_subscription";

const TIER_PRICES = {
  basic: { monthly: 69, annual: 828 },
  pro: { monthly: 149, annual: 1788 },
  elite: { monthly: 349, annual: 4188 },
  enterprise: { monthly: 999, annual: 11988 },
};

const TIER_AI_CREDITS = {
  basic: 15,
  pro: 200,
  elite: 600,
  enterprise: 2000,
};

const TIER_FEATURES = {
  basic: [
    "estimates_invoices",
    "crew_clock",
    "customer_portal",
    "basic_contracts",
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
    "unlimited_ai_scanning",
    "payroll_analytics",
    "priority_support",
    "damage_detection",
    "advanced_analytics",
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
    "unlimited_ai_scanning",
    "payroll_analytics",
    "priority_support",
    "damage_detection",
    "advanced_analytics",
    "custom_workflows",
    "multi_location",
    "api_integrations",
    "dedicated_engineer",
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

  const upgradeTier = async (tier: SubscriptionTier, billingCycle: "monthly" | "annual") => {
    const newSubscription: SubscriptionDetails = {
      tier,
      aiCredits: (tier !== "none" ? TIER_AI_CREDITS[tier] : 0) || 0,
      billingCycle,
      subscriptionStartDate: new Date().toISOString(),
      autoRenew: true,
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
      basic: "Basic",
      pro: "Pro",
      elite: "Business Elite",
      enterprise: "Enterprise",
      none: "None",
    };
    return names[tier] || "None";
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
    isBasic: subscription.tier === "basic",
    isPro: subscription.tier === "pro",
    isElite: subscription.tier === "elite",
    isEnterprise: subscription.tier === "enterprise",
    hasSubscription: subscription.tier !== "none",
  };
});
