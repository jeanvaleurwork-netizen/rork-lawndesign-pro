import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calculator, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react-native";

export default function ProfitCalculatorScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Calculator color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Know your profit</Text>
            <Text style={styles.title}>before you start</Text>
            <Text style={styles.subtitle}>
              Never take a loss again — the app calculates everything
            </Text>
          </View>

          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>Example Job Breakdown:</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Labor cost</Text>
              <Text style={styles.costValue}>$1,200</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Materials cost</Text>
              <Text style={styles.costValue}>$850</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Subcontractors</Text>
              <Text style={styles.costValue}>$400</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Overhead & permits</Text>
              <Text style={styles.costValue}>$250</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.costRow}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalValue}>$2,700</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.totalLabel}>Quote Price</Text>
              <Text style={styles.totalValue}>$3,800</Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Net Profit</Text>
              <Text style={styles.profitValue}>$1,100 (29%)</Text>
            </View>
          </View>

          <View style={styles.benefitsContainer}>
            <BenefitItem
              icon={<CheckCircle color="#10B981" size={24} strokeWidth={2.5} />}
              text="No surprise losses"
            />
            <BenefitItem
              icon={<AlertTriangle color="#F59E0B" size={24} strokeWidth={2.5} />}
              text="Avoid accidental low pricing"
            />
            <BenefitItem
              icon={<TrendingDown color="#EF4444" size={24} strokeWidth={2.5} />}
              text="Stop taking jobs that lose money"
            />
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Never lose money again
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/crew-arrival" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIcon}>{icon}</View>
      <Text style={styles.benefitText}>{text}</Text>
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
    marginBottom: 28,
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
    paddingHorizontal: 20,
  },
  exampleCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  costLabel: {
    fontSize: 15,
    color: "#666666",
    fontWeight: "500" as const,
  },
  costValue: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "600" as const,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "700" as const,
  },
  totalValue: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "700" as const,
  },
  profitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    marginTop: 12,
  },
  profitLabel: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "800" as const,
  },
  profitValue: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "800" as const,
  },
  benefitsContainer: {
    gap: 14,
    marginBottom: 24,
  },
  benefitItem: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    flex: 1,
  },
  highlightBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 28,
  },
  highlightText: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    textAlign: "center",
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
