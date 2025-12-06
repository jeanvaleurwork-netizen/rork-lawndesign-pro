import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Check } from "lucide-react-native";
import { TradeType } from "@/types";
import { TRADE_DEFINITIONS, getAllTradeTypes } from "@/constants/trades";

export default function TradeSelectionScreen() {
  const router = useRouter();
  const [selectedTrade, setSelectedTrade] = useState<TradeType | null>(null);

  const handleContinue = () => {
    if (selectedTrade) {
      router.push({
        pathname: "/subscription",
        params: { tradeType: selectedTrade },
      });
    }
  };

  return (
    <LinearGradient colors={["#0066FF", "#004BB5"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Select Your Trade</Text>
            <Text style={styles.subtitle}>
              Choose the primary service your business provides
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tradesGrid}>
            {getAllTradeTypes().map((tradeType) => {
              const definition = TRADE_DEFINITIONS[tradeType];
              const isSelected = selectedTrade === tradeType;

              return (
                <TouchableOpacity
                  key={tradeType}
                  style={[styles.tradeCard, isSelected && styles.tradeCardSelected]}
                  onPress={() => setSelectedTrade(tradeType)}
                  activeOpacity={0.9}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Check color="#FFF" size={16} strokeWidth={3} />
                    </View>
                  )}
                  <Text style={styles.tradeIcon}>{definition.icon}</Text>
                  <Text
                    style={[
                      styles.tradeName,
                      isSelected && styles.tradeNameSelected,
                    ]}
                  >
                    {definition.name}
                  </Text>
                  <Text
                    style={[
                      styles.tradeDescription,
                      isSelected && styles.tradeDescriptionSelected,
                    ]}
                  >
                    {definition.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedTrade && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedTrade}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerText: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  tradesGrid: {
    gap: 16,
  },
  tradeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
  },
  tradeCardSelected: {
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowOpacity: 0.2,
  },
  checkBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  tradeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  tradeName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 6,
  },
  tradeNameSelected: {
    color: "#0066FF",
  },
  tradeDescription: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 21,
  },
  tradeDescriptionSelected: {
    color: "#444444",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: "transparent",
  },
  continueButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0066FF",
  },
});
