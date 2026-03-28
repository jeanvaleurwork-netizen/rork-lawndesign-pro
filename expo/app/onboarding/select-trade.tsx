import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
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
  "Tree Service",
  "Pool Service",
  "Pressure Washing",
  "Concrete",
  "Framing",
  "Flooring",
  "Drywall",
  "Masonry",
  "Carpentry",
  "Siding",
  "Fencing",
  "Decking",
  "Gutter Services",
  "Windows & Doors",
  "Tile & Grout",
  "Waterproofing",
  "Demolition",
  "Excavation",
  "Paving & Asphalt",
  "Snow Removal",
  "Chimney Services",
  "Foundation Repair",
  "Insulation",
  "Welding",
  "Metal Fabrication",
  "Locksmith",
  "Garage Door Services",
  "Home Inspection",
  "Pest Control",
  "Septic Services",
  "Well Services",
  "Appliance Repair",
  "Cabinet Installation",
  "Carpet Cleaning",
  "Ceiling Services",
  "Custom Woodworking",
  "Door & Window Repair",
  "Drainage Solutions",
  "Driveway Sealing",
  "Dumpster Rental",
  "Epoxy Flooring",
  "Fence Repair",
  "Fire Sprinkler Services",
  "Glass Services",
  "Grading & Leveling",
  "Handyman Services",
  "Hauling & Junk Removal",
  "Hot Tub Services",
  "Kitchen Remodeling",
  "Lawn Care",
  "Moving Services",
  "Outdoor Lighting",
  "Patio & Deck Installation",
  "Retaining Walls",
  "Roofing Repair",
  "Security Systems",
  "Sewer & Drain Cleaning",
  "Shutter Services",
  "Smart Home Installation",
  "Stucco",
  "Swimming Pool Construction",
  "Trim & Molding",
  "Upholstery Cleaning",
  "Ventilation Services",
  "Water Damage Restoration",
  "Window Cleaning",
  "Other",
];

export default function SelectTradeScreen() {
  const router = useRouter();
  const { data, updateTrades } = useOnboarding();
  const [selectedTrades, setSelectedTrades] = useState<string[]>(data.trades);
  const [otherTrade, setOtherTrade] = useState<string>("");
  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);

  console.log("[Onboarding] Select trade screen mounted");

  const toggleTrade = (trade: string) => {
    if (trade === "Other") {
      setShowOtherInput(!showOtherInput);
      if (showOtherInput) {
        setSelectedTrades(selectedTrades.filter(t => t !== "Other" && !t.startsWith("Other: ")));
        setOtherTrade("");
      }
      return;
    }
    
    if (selectedTrades.includes(trade)) {
      setSelectedTrades(selectedTrades.filter(t => t !== trade));
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  const handleContinue = async () => {
    let finalTrades = [...selectedTrades];
    
    if (showOtherInput && otherTrade.trim()) {
      finalTrades = finalTrades.filter(t => t !== "Other");
      finalTrades.push(`Other: ${otherTrade.trim()}`);
    } else {
      finalTrades = finalTrades.filter(t => t !== "Other" && !t.startsWith("Other: "));
    }
    
    await updateTrades(finalTrades);
    router.push("/onboarding/what-we-do" as never);
  };

  return (
    <LinearGradient
      colors={["#1E3A8A", "#3B82F6"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Which services do</Text>
          <Text style={styles.title}>you offer?</Text>
          <Text style={styles.subtitle}>Select all that apply. This helps personalize your experience.</Text>
        </View>

        <View style={styles.tradesContainer}>
          <ScrollView
            style={styles.tradesScrollView}
            contentContainerStyle={styles.tradesScrollContent}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
          >
            {TRADES.map((trade, index) => (
              <View key={trade} style={{ marginBottom: index === TRADES.length - 1 ? 0 : 12 }}>
                <TouchableOpacity
                  style={[
                    styles.tradeCard,
                    (trade === "Other" ? showOtherInput : selectedTrades.includes(trade)) && styles.tradeCardSelected
                  ]}
                  onPress={() => toggleTrade(trade)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.tradeText,
                    (trade === "Other" ? showOtherInput : selectedTrades.includes(trade)) && styles.tradeTextSelected
                  ]}>{trade}</Text>
                  {(trade === "Other" ? showOtherInput : selectedTrades.includes(trade)) ? (
                    <CheckCircle2 color="#1E3A8A" size={24} strokeWidth={2.5} />
                  ) : (
                    <Circle color="#1E3A8A" size={24} strokeWidth={2} />
                  )}
                </TouchableOpacity>
                {trade === "Other" && showOtherInput && (
                  <View style={styles.otherInputContainer}>
                    <TextInput
                      style={styles.otherInput}
                      placeholder="Please specify your trade..."
                      placeholderTextColor="rgba(26, 26, 26, 0.4)"
                      value={otherTrade}
                      onChangeText={setOtherTrade}
                      autoFocus
                    />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
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
        </View>
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
    paddingTop: 20,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 24,
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
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 24,
    marginBottom: 16,
    overflow: "hidden",
  },
  tradesScrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  tradesScrollContent: {
    paddingBottom: 16,
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "transparent",
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
  otherInputContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  otherInput: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#1E3A8A",
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
