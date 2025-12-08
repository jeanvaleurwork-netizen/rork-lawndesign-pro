import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  TrendingUp, 
  Building2,
  FileText,
  Users,
  Shield,
  BarChart3,
  Star,
} from "lucide-react-native";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Colors from "@/constants/colors";

interface TierFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  id: "basic" | "pro" | "elite" | "enterprise";
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  aiCredits: number;
  popular?: boolean;
  icon: React.ComponentType<any>;
  iconColor: string;
  features: TierFeature[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Start Simple",
    monthlyPrice: 69,
    annualPrice: 828,
    aiCredits: 15,
    icon: FileText,
    iconColor: "#3B82F6",
    features: [
      { text: "Estimates & Invoices", included: true },
      { text: "Basic Contracts", included: true },
      { text: "Crew Clock (5 members)", included: true },
      { text: "Customer Portal Access", included: true },
      { text: "15 AI Credits/month", included: true },
      { text: "Unlimited Contracts", included: false },
      { text: "Full Legal Suite", included: false },
      { text: "Job Profit Analysis", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Scale Revenue",
    monthlyPrice: 149,
    annualPrice: 1788,
    aiCredits: 200,
    popular: true,
    icon: TrendingUp,
    iconColor: "#8B5CF6",
    features: [
      { text: "Everything in Basic", included: true },
      { text: "Unlimited Contracts", included: true },
      { text: "Full Legal Suite", included: true },
      { text: "Job Profit Analysis", included: true },
      { text: "200 AI Credits/month", included: true },
      { text: "Receipt Scanning", included: true },
      { text: "Full Crew Management", included: true },
      { text: "Advanced Scheduling", included: true },
    ],
  },
  {
    id: "elite",
    name: "Business Elite",
    tagline: "Run Everything",
    monthlyPrice: 349,
    annualPrice: 4188,
    aiCredits: 600,
    icon: Crown,
    iconColor: "#F59E0B",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited AI Scanning", included: true },
      { text: "Payroll Analytics", included: true },
      { text: "Priority Support", included: true },
      { text: "600 AI Credits/month", included: true },
      { text: "Damage Detection", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Custom Reports", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Commercial Operations",
    monthlyPrice: 999,
    annualPrice: 11988,
    aiCredits: 2000,
    icon: Building2,
    iconColor: "#10B981",
    features: [
      { text: "Everything in Elite", included: true },
      { text: "Custom Workflows", included: true },
      { text: "Multi-Location Support", included: true },
      { text: "API Integrations", included: true },
      { text: "2000+ AI Credits/month", included: true },
      { text: "Dedicated Engineer", included: true },
      { text: "White-Label Options", included: true },
      { text: "24/7 Priority Support", included: true },
    ],
  },
];

export default function PricingScreen() {
  const router = useRouter();
  const { upgradeTier, subscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleSelectPlan = async (tierId: "basic" | "pro" | "elite" | "enterprise") => {
    if (tierId === "enterprise") {
      Alert.alert(
        "Enterprise Plan",
        "Contact our sales team for a custom enterprise solution.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Contact Sales", onPress: () => console.log("Contact sales") },
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      setSelectedTier(tierId);
      await upgradeTier(tierId, billingCycle);
      Alert.alert(
        "Success!",
        `You've upgraded to ${PRICING_TIERS.find(t => t.id === tierId)?.name}!`,
        [{ text: "Continue", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("[Pricing] Failed to upgrade:", error);
      Alert.alert("Error", "Failed to upgrade subscription. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedTier(null);
    }
  };

  const getPrice = (tier: PricingTier) => {
    return billingCycle === "monthly" ? tier.monthlyPrice : tier.annualPrice;
  };

  const getSavings = (tier: PricingTier) => {
    const monthlyTotal = tier.monthlyPrice * 12;
    const annualPrice = tier.annualPrice;
    const savings = monthlyTotal - annualPrice;
    const savingsPercent = Math.round((savings / monthlyTotal) * 100);
    return { savings, savingsPercent };
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <LinearGradient
          colors={["#1E40AF", "#3B82F6"]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Star color="#FFD700" size={40} fill="#FFD700" />
            <Text style={styles.headerTitle}>Pricing That Grows With You</Text>
            <Text style={styles.headerSubtitle}>
              Transparent. Scalable. AI-Powered. No hidden fees.
            </Text>
          </View>

          <View style={styles.billingToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === "monthly" && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle("monthly")}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === "monthly" && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === "annual" && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle("annual")}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === "annual" && styles.toggleTextActive,
                ]}
              >
                Annual
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 30%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            const price = getPrice(tier);
            const { savingsPercent } = getSavings(tier);
            const isCurrentTier = subscription.tier === tier.id;
            const isTierLoading = isLoading && selectedTier === tier.id;

            return (
              <View key={tier.id} style={styles.tierCard}>
                {tier.popular && (
                  <View style={styles.popularBadge}>
                    <Zap color="#FFF" size={14} fill="#FFF" />
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.tierHeader}>
                  <View style={[styles.tierIcon, { backgroundColor: `${tier.iconColor}15` }]}>
                    <Icon color={tier.iconColor} size={32} />
                  </View>
                  <View style={styles.tierHeaderText}>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierTagline}>{tier.tagline}</Text>
                  </View>
                </View>

                <View style={styles.tierPricing}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceSymbol}>$</Text>
                    <Text style={styles.priceAmount}>{price}</Text>
                    <Text style={styles.pricePeriod}>
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </Text>
                  </View>
                  {billingCycle === "annual" && (
                    <Text style={styles.monthlyEquivalent}>
                      ${Math.round(price / 12)}/month • Save {savingsPercent}%
                    </Text>
                  )}
                </View>

                <View style={styles.aiCreditsCard}>
                  <Zap color={tier.iconColor} size={20} />
                  <Text style={styles.aiCreditsText}>
                    {tier.aiCredits} AI Credits/month
                  </Text>
                </View>

                <View style={styles.featuresContainer}>
                  {tier.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      {feature.included ? (
                        <CheckCircle color={Colors.light.success} size={18} />
                      ) : (
                        <View style={styles.featureNotIncluded} />
                      )}
                      <Text
                        style={[
                          styles.featureText,
                          !feature.included && styles.featureTextDisabled,
                        ]}
                      >
                        {feature.text}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    tier.popular && styles.selectButtonPopular,
                    isCurrentTier && styles.selectButtonCurrent,
                  ]}
                  onPress={() => handleSelectPlan(tier.id)}
                  disabled={isTierLoading || isCurrentTier}
                >
                  {isTierLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.selectButtonText}>
                      {isCurrentTier ? "Current Plan" : tier.id === "enterprise" ? "Contact Sales" : `Choose ${tier.name}`}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.guaranteeCard}>
            <Shield color={Colors.light.success} size={32} />
            <View style={styles.guaranteeText}>
              <Text style={styles.guaranteeTitle}>30-Day Money-Back Guarantee</Text>
              <Text style={styles.guaranteeSubtitle}>
                Cancel anytime • No hidden fees • Full refund within 30 days
              </Text>
            </View>
          </View>

          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I change plans later?</Text>
              <Text style={styles.faqAnswer}>
                Yes! You can upgrade or downgrade at any time. Changes take effect immediately.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What are AI Credits?</Text>
              <Text style={styles.faqAnswer}>
                AI Credits power features like damage detection, cost estimation, and document analysis. Each feature uses 1-5 credits per use.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I buy extra AI Credits?</Text>
              <Text style={styles.faqAnswer}>
                Yes! Additional credits are available at $0.40 each if you run out during the month.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#FFF",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  billingToggle: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    position: "relative" as const,
  },
  toggleButtonActive: {
    backgroundColor: "#FFF",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "rgba(255, 255, 255, 0.8)",
  },
  toggleTextActive: {
    color: Colors.light.primary,
  },
  saveBadge: {
    position: "absolute" as const,
    top: -8,
    right: 8,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: "#FFF",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  tierCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.light.border,
    position: "relative" as const,
  },
  popularBadge: {
    position: "absolute" as const,
    top: -12,
    left: 20,
    right: 20,
    backgroundColor: "#8B5CF6",
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: "#FFF",
    letterSpacing: 1,
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    marginTop: 12,
  },
  tierIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  tierHeaderText: {
    flex: 1,
  },
  tierName: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  tierTagline: {
    fontSize: 15,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  tierPricing: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  priceSymbol: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 56,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -2,
  },
  pricePeriod: {
    fontSize: 18,
    color: Colors.light.muted,
    fontWeight: "600" as const,
    marginTop: 20,
  },
  monthlyEquivalent: {
    fontSize: 14,
    color: Colors.light.success,
    fontWeight: "700" as const,
  },
  aiCreditsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiCreditsText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureNotIncluded: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  featureText: {
    fontSize: 15,
    color: Colors.light.text,
    flex: 1,
  },
  featureTextDisabled: {
    color: Colors.light.muted,
  },
  selectButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  selectButtonPopular: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selectButtonCurrent: {
    backgroundColor: Colors.light.border,
  },
  selectButtonText: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: "#FFF",
    letterSpacing: 0.5,
  },
  guaranteeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: `${Colors.light.success}10`,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: `${Colors.light.success}30`,
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  guaranteeSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  faqSection: {
    marginBottom: 20,
  },
  faqTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 22,
  },
});
