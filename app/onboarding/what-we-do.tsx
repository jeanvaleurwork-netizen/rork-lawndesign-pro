import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Zap, CheckCircle } from "lucide-react-native";

export default function WhatWeDoScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Zap color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Work faster.</Text>
            <Text style={styles.title}>Earn more profit.</Text>
            <Text style={styles.title}>Look professional.</Text>
            <Text style={styles.subtitle}>
              ContractorOS AI helps you run your entire business like a pro
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureCard
              icon={<CheckCircle color="#10B981" size={28} />}
              title="Book jobs & track schedules"
              description="Never miss a job or forget a client again"
            />
            <FeatureCard
              icon={<CheckCircle color="#10B981" size={28} />}
              title="Send estimates & invoices fast"
              description="Win jobs in minutes, not days"
            />
            <FeatureCard
              icon={<CheckCircle color="#10B981" size={28} />}
              title="Calculate cost & profit automatically"
              description="Know your margins before starting any job"
            />
            <FeatureCard
              icon={<CheckCircle color="#10B981" size={28} />}
              title="Keep crew organized & accountable"
              description="Everyone knows what to do and when"
            />
            <FeatureCard
              icon={<CheckCircle color="#10B981" size={28} />}
              title="Store all job photos & testimonials"
              description="Build trust and protect yourself legally"
            />
            <FeatureCard
              icon={<CheckCircle color="#10B981" size={28} />}
              title="Never lose receipts again"
              description="Tax time becomes effortless"
            />
            <FeatureCard
              icon={<CheckCircle color="#10B981" size={28} />}
              title="Accept payments securely"
              description="Get paid faster with built-in payment processing"
            />
            <FeatureCard
              icon={<CheckCircle color="#10B981" size={28} />}
              title="AI helps run your office"
              description="Like having a full-time assistant"
            />
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/admin-or-crew" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
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
    width: 84,
    height: 84,
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
    marginTop: 16,
    lineHeight: 23,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  featuresContainer: {
    gap: 14,
    marginBottom: 32,
  },
  featureCard: {
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
  featureIcon: {
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 19,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
});
