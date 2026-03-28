import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Zap, TrendingUp, Users, FileCheck, DollarSign, Shield } from "lucide-react-native";

export default function ValuePropScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Zap color="#FFFFFF" size={44} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Here&apos;s what ContractorOS</Text>
            <Text style={styles.title}>helps you do:</Text>
          </View>

          <View style={styles.benefitsContainer}>
            <BenefitCard
              icon={<TrendingUp color="#10B981" size={30} strokeWidth={2.5} />}
              title="Track every job"
              description="From first contact to final payment — never lose track"
            />
            <BenefitCard
              icon={<Users color="#3B82F6" size={30} strokeWidth={2.5} />}
              title="Organize crews"
              description="Everyone knows what to do, where to be, and when"
            />
            <BenefitCard
              icon={<FileCheck color="#8B5CF6" size={30} strokeWidth={2.5} />}
              title="Stay on schedule"
              description="Automated reminders and smart calendar management"
            />
            <BenefitCard
              icon={<DollarSign color="#F59E0B" size={30} strokeWidth={2.5} />}
              title="Send invoices & receive payments"
              description="Professional billing that gets you paid faster"
            />
            <BenefitCard
              icon={<Shield color="#EF4444" size={30} strokeWidth={2.5} />}
              title="Calculate profit per job"
              description="Know your margins before you start the work"
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>+14%</Text>
              <Text style={styles.statLabel}>Profit per job</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>9 hrs</Text>
              <Text style={styles.statLabel}>Saved weekly</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>$3.7K</Text>
              <Text style={styles.statLabel}>Materials saved</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/job-photos" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
    fontSize: 30,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  benefitsContainer: {
    gap: 14,
    marginBottom: 28,
  },
  benefitCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitContent: {
    flex: 1,
    paddingTop: 4,
  },
  benefitTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    fontWeight: "600" as const,
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
