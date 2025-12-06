import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Check } from "lucide-react-native";

export default function SubscriptionOverviewScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Sparkles color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>ContractorOS costs</Text>
            <Text style={styles.title}>less than hiring staff</Text>
            <Text style={styles.subtitle}>
              Get the power of an entire office in your pocket
            </Text>
          </View>

          <View style={styles.replacesContainer}>
            <Text style={styles.replacesTitle}>Replaces:</Text>
            <View style={styles.replacesGrid}>
              <ReplaceItem text="Office assistant" cost="$3,500/mo" />
              <ReplaceItem text="Scheduling software" cost="$200/mo" />
              <ReplaceItem text="Invoice tool" cost="$150/mo" />
              <ReplaceItem text="Crew management" cost="$180/mo" />
              <ReplaceItem text="Profit calculator" cost="$120/mo" />
              <ReplaceItem text="CRM system" cost="$250/mo" />
            </View>
            <View style={styles.totalSavings}>
              <Text style={styles.totalSavingsLabel}>Total value:</Text>
              <Text style={styles.totalSavingsValue}>$4,400/month</Text>
            </View>
          </View>

          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Your Price</Text>
            <Text style={styles.pricingValue}>30 Days Free</Text>
            <Text style={styles.pricingSubtitle}>Then affordable plans starting at $49/mo</Text>
          </View>

          <View style={styles.testimonialsContainer}>
            <TestimonialCard
              quote="Closed 3 more jobs weekly"
              author="Mike R., Roofing Contractor"
            />
            <TestimonialCard
              quote="Saved $4,000 in materials"
              author="Sarah K., Landscaping"
            />
            <TestimonialCard
              quote="Crew accountability changed everything"
              author="James L., General Contractor"
            />
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              All-in-one solution for way less than hiring staff
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/trial-setup" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Start Free Trial</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ReplaceItem({ text, cost }: { text: string; cost: string }) {
  return (
    <View style={styles.replaceItem}>
      <View style={styles.replaceIconContainer}>
        <Check color="#10B981" size={16} strokeWidth={3} />
      </View>
      <Text style={styles.replaceText}>{text}</Text>
      <Text style={styles.replaceCost}>{cost}</Text>
    </View>
  );
}

function TestimonialCard({ quote, author }: { quote: string; author: string }) {
  return (
    <View style={styles.testimonialCard}>
      <Text style={styles.testimonialQuote}>&quot;{quote}&quot;</Text>
      <Text style={styles.testimonialAuthor}>— {author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 14,
    lineHeight: 23,
    textAlign: "center",
  },
  replacesContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  replacesTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  replacesGrid: {
    gap: 10,
  },
  replaceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  replaceIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  replaceText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "600" as const,
    flex: 1,
  },
  replaceCost: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600" as const,
  },
  totalSavings: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#E5E5E5",
  },
  totalSavingsLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  totalSavingsValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#10B981",
  },
  pricingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666666",
    marginBottom: 8,
  },
  pricingValue: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#1E3A8A",
    marginBottom: 6,
  },
  pricingSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  testimonialsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  testimonialCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  testimonialQuote: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 22,
  },
  testimonialAuthor: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    fontStyle: "italic" as const,
  },
  highlightBox: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    marginBottom: 28,
  },
  highlightText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 19,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
});
