import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Receipt, FileCheck, DollarSign, TrendingUp } from "lucide-react-native";

export default function ReceiptScannerScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Receipt color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Scan receipts &</Text>
            <Text style={styles.title}>organize tax paperwork</Text>
            <Text style={styles.subtitle}>
              No more lost receipts, notebooks, or shoebox folders
            </Text>
          </View>

          <View style={styles.processContainer}>
            <ProcessStep
              number="1"
              icon={<Receipt color="#3B82F6" size={24} strokeWidth={2.5} />}
              title="Take a photo"
              description="Snap receipt with your phone"
            />
            <ProcessStep
              number="2"
              icon={<FileCheck color="#10B981" size={24} strokeWidth={2.5} />}
              title="Auto-categorized"
              description="AI sorts by job and expense type"
            />
            <ProcessStep
              number="3"
              icon={<DollarSign color="#8B5CF6" size={24} strokeWidth={2.5} />}
              title="Tax ready"
              description="Export for tax time in seconds"
            />
          </View>

          <View style={styles.benefitsContainer}>
            <BenefitCard
              icon={<DollarSign color="#10B981" size={26} strokeWidth={2.5} />}
              title="Save thousands at tax time"
              description="Never miss a deduction again"
            />
            <BenefitCard
              icon={<TrendingUp color="#3B82F6" size={26} strokeWidth={2.5} />}
              title="Track job costs in real-time"
              description="Know your actual spending per job"
            />
            <BenefitCard
              icon={<FileCheck color="#8B5CF6" size={26} strokeWidth={2.5} />}
              title="Organized automatically"
              description="Search receipts by date, job, or amount"
            />
          </View>

          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>Average savings:</Text>
            <Text style={styles.statsValue}>$4,200 per year</Text>
            <Text style={styles.statsSubtitle}>in recovered tax deductions</Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/contracts" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ProcessStep({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.processStep}>
      <View style={styles.processNumber}>
        <Text style={styles.processNumberText}>{number}</Text>
      </View>
      <View style={styles.processIconContainer}>{icon}</View>
      <View style={styles.processContent}>
        <Text style={styles.processTitle}>{title}</Text>
        <Text style={styles.processDescription}>{description}</Text>
      </View>
    </View>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIcon}>{icon}</View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
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
    paddingHorizontal: 12,
  },
  processContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    gap: 20,
  },
  processStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  processNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },
  processNumberText: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  processIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  processContent: {
    flex: 1,
    paddingTop: 2,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  processDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  benefitsContainer: {
    gap: 14,
    marginBottom: 24,
  },
  benefitCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitContent: {
    flex: 1,
    paddingTop: 2,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  statsBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    marginBottom: 28,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
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
