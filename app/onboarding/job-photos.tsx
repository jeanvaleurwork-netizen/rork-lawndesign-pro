import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Shield, TrendingUp } from "lucide-react-native";

export default function JobPhotosScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Camera color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Document every job</Text>
            <Text style={styles.title}>like a professional</Text>
            <Text style={styles.subtitle}>
              Protect yourself and build trust with customers
            </Text>
          </View>

          <View style={styles.photosPreviewContainer}>
            <View style={styles.photoPlaceholder}>
              <Camera color="#3B82F6" size={32} strokeWidth={2} />
              <Text style={styles.photoPlaceholderText}>Before Photos</Text>
            </View>
            <View style={styles.photoPlaceholder}>
              <Camera color="#10B981" size={32} strokeWidth={2} />
              <Text style={styles.photoPlaceholderText}>After Photos</Text>
            </View>
          </View>

          <View style={styles.benefitsContainer}>
            <BenefitItem
              icon={<Shield color="#10B981" size={26} strokeWidth={2.5} />}
              title="Legal protection"
              description="Timestamped photos protect you from disputes"
            />
            <BenefitItem
              icon={<TrendingUp color="#3B82F6" size={26} strokeWidth={2.5} />}
              title="Build trust"
              description="Show professionalism and transparency"
            />
            <BenefitItem
              icon={<Camera color="#8B5CF6" size={26} strokeWidth={2.5} />}
              title="Portfolio building"
              description="Create before/after galleries for marketing"
            />
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              No more &quot;he said/she said&quot; — everything is documented
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/estimates-invoices" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIconContainer}>{icon}</View>
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
    paddingHorizontal: 20,
  },
  photosPreviewContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  photoPlaceholder: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  photoPlaceholderText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  benefitsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  benefitItem: {
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
  benefitIconContainer: {
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
