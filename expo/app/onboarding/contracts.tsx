import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FileSignature, Shield, CheckCircle, Zap } from "lucide-react-native";

export default function ContractsScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <FileSignature color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Send and sign</Text>
            <Text style={styles.title}>insurance-compliant contracts</Text>
            <Text style={styles.subtitle}>
              Protect your business legally
            </Text>
          </View>

          <View style={styles.benefitsContainer}>
            <BenefitCard
              icon={<Shield color="#10B981" size={28} strokeWidth={2.5} />}
              title="Legal protection"
              description="Use insurance-approved contract templates"
            />
            <BenefitCard
              icon={<Zap color="#3B82F6" size={28} strokeWidth={2.5} />}
              title="Professional presentation"
              description="Look like a million-dollar company"
            />
            <BenefitCard
              icon={<CheckCircle color="#8B5CF6" size={28} strokeWidth={2.5} />}
              title="Faster approvals"
              description="Customers sign on tablet or phone"
            />
          </View>

          <View style={styles.processContainer}>
            <Text style={styles.processTitle}>How it works:</Text>
            <View style={styles.processSteps}>
              <ProcessStep number="1" text="Choose contract template" />
              <ProcessStep number="2" text="Fill in job details" />
              <ProcessStep number="3" text="Send to customer" />
              <ProcessStep number="4" text="Customer signs digitally" />
              <ProcessStep number="5" text="Both parties get a copy" />
            </View>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Protects you from liability and payment disputes
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/analytics" as never)}
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

function ProcessStep({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.processStep}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
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
    paddingTop: 6,
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
  processContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  processSteps: {
    gap: 12,
  },
  processStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: "#1E3A8A",
  },
  stepText: {
    fontSize: 15,
    color: "#FFFFFF",
    flex: 1,
    fontWeight: "600" as const,
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
