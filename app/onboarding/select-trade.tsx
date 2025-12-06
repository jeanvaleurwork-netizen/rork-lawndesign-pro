import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, Circle } from "lucide-react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";

const TRADES = [
  "Roofing",
  "Electrical",
  "Landscaping",
  "HVAC",
  "Plumbing",
  "Painting",
  "Remodeling",
  "General Contracting",
  "Solar & Energy",
  "Restoration",
];

export default function SelectTradeScreen() {
  const router = useRouter();
  const { data, updateTrades } = useOnboarding();
  const [selectedTrades, setSelectedTrades] = useState<string[]>(data.trades);

  const toggleTrade = (trade: string) => {
    if (selectedTrades.includes(trade)) {
      setSelectedTrades(selectedTrades.filter(t => t !== trade));
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  const handleContinue = async () => {
    await updateTrades(selectedTrades);
    router.push("/onboarding/what-we-do" as never);
  };

  return (
    <LinearGradient
      colors={["#1E3A8A", "#3B82F6"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Which services do</Text>
            <Text style={styles.title}>you offer?</Text>
            <Text style={styles.subtitle}>Select all that apply. This helps personalize your experience.</Text>
          </View>

          <View style={styles.tradesContainer}>
            {TRADES.map((trade) => (
              <TouchableOpacity
                key={trade}
                style={[
                  styles.tradeCard,
                  selectedTrades.includes(trade) && styles.tradeCardSelected
                ]}
                onPress={() => toggleTrade(trade)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.tradeText,
                  selectedTrades.includes(trade) && styles.tradeTextSelected
                ]}>{trade}</Text>
                {selectedTrades.includes(trade) ? (
                  <CheckCircle2 color="#1E3A8A" size={24} strokeWidth={2.5} />
                ) : (
                  <Circle color="#1E3A8A" size={24} strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedTrades.length === 0 && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={selectedTrades.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>
              Continue ({selectedTrades.length})
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
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 12,
    lineHeight: 23,
  },
  tradesContainer: {
    gap: 12,
    marginBottom: 32,
  },
  tradeCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tradeCardSelected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderColor: "#1E3A8A",
  },
  tradeText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  tradeTextSelected: {
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
