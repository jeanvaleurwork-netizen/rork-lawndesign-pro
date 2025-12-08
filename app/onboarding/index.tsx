import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Hammer, Calendar, Users, FileText, DollarSign } from "lucide-react-native";

const { height } = Dimensions.get("window");

export default function OnboardingWelcomeScreen() {
  const router = useRouter();

  console.log("[Onboarding] Index screen mounted");

  return (
    <LinearGradient
      colors={["#1E3A8A", "#3B82F6", "#60A5FA"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Hammer color="#FFFFFF" size={52} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.brandName}>ContractorOS AI</Text>
            <Text style={styles.subtitle}>
              Run your entire contracting business{"\n"}in one powerful app
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem
              icon={<Calendar color="#FFFFFF" size={26} />}
              text="Schedule jobs & track schedules"
            />
            <FeatureItem
              icon={<Users color="#FFFFFF" size={26} />}
              text="Keep crew organized & accountable"
            />
            <FeatureItem
              icon={<FileText color="#FFFFFF" size={26} />}
              text="Send estimates & invoices fast"
            />
            <FeatureItem
              icon={<DollarSign color="#FFFFFF" size={26} />}
              text="Calculate cost & profit automatically"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/onboarding/select-trade" as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/role-selection" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <Text style={styles.featureText}>{text}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginTop: height * 0.08,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  brandName: {
    fontSize: 38,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 25,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    gap: 18,
    marginTop: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600" as const,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 14,
    marginTop: 32,
  },
  primaryButton: {
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
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 19,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
