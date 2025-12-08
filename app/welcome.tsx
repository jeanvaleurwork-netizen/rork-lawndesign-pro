import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Hammer, Users, Calendar, FileText, Phone, Zap } from "lucide-react-native";

const { height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#0066FF", "#004BB5", "#003380"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Hammer color="#FFFFFF" size={48} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>ContractorOS</Text>
            <Text style={styles.subtitle}>The easiest way to run your contracting team</Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem
              icon={<Calendar color="#FFFFFF" size={24} />}
              text="Schedule & manage jobs"
            />
            <FeatureItem
              icon={<Users color="#FFFFFF" size={24} />}
              text="Assign & track crews"
            />
            <FeatureItem
              icon={<FileText color="#FFFFFF" size={24} />}
              text="Create estimates & invoices"
            />
            <FeatureItem
              icon={<Phone color="#FFFFFF" size={24} />}
              text="AI intake - Never miss a call"
            />
            <FeatureItem
              icon={<Zap color="#FFFFFF" size={24} />}
              text="Automate paperwork & quotes"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/onboarding")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/role-selection")}
              activeOpacity={0.8}
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
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: height * 0.12,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    gap: 20,
    marginTop: 60,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500" as const,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 40,
    gap: 14,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0066FF",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 18,
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
