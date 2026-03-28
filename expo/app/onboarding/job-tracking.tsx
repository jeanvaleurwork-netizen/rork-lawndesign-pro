import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, MapPin, Camera, FileText, DollarSign, Receipt, CheckCircle2, Circle } from "lucide-react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";

const FEATURES = [
  { id: "schedule", label: "Schedule jobs", icon: Calendar },
  { id: "arrival", label: "Track crew arrival", icon: MapPin },
  { id: "photos", label: "Upload job photos", icon: Camera },
  { id: "invoices", label: "Send invoices to customers", icon: FileText },
  { id: "profit", label: "Track profit and costs", icon: DollarSign },
  { id: "receipts", label: "Manage receipts", icon: Receipt },
];

export default function JobTrackingScreen() {
  const router = useRouter();
  const { data, updateJobTrackingFeatures } = useOnboarding();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(data.jobTrackingFeatures);

  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== featureId));
    } else {
      setSelectedFeatures([...selectedFeatures, featureId]);
    }
  };

  const handleContinue = async () => {
    await updateJobTrackingFeatures(selectedFeatures);
    router.push("/onboarding/value-prop" as never);
  };

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>What jobs do you</Text>
            <Text style={styles.title}>want to track?</Text>
            <Text style={styles.subtitle}>Choose the features most important to you</Text>
          </View>

          <View style={styles.featuresContainer}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeatures.includes(feature.id);
              return (
                <TouchableOpacity
                  key={feature.id}
                  style={[
                    styles.featureCard,
                    isSelected && styles.featureCardSelected
                  ]}
                  onPress={() => toggleFeature(feature.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.featureIconContainer, isSelected && styles.featureIconContainerSelected]}>
                    <Icon color={isSelected ? "#1E3A8A" : "#666"} size={26} strokeWidth={2} />
                  </View>
                  <Text style={[styles.featureText, isSelected && styles.featureTextSelected]}>
                    {feature.label}
                  </Text>
                  {isSelected ? (
                    <CheckCircle2 color="#1E3A8A" size={24} strokeWidth={2.5} />
                  ) : (
                    <Circle color="#999" size={24} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedFeatures.length === 0 && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={selectedFeatures.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>
              Continue ({selectedFeatures.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 12,
    lineHeight: 23,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
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
  featureCardSelected: {
    borderWidth: 2.5,
    borderColor: "#1E3A8A",
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconContainerSelected: {
    backgroundColor: "#E0EFFF",
  },
  featureText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    flex: 1,
  },
  featureTextSelected: {
    color: "#1E3A8A",
    fontWeight: "700" as const,
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
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
});
