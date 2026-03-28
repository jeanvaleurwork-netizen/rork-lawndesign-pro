import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { TradeType } from "@/types";
import { TRADE_DEFINITIONS, getAllTradeTypes } from "@/constants/trades";

export default function BusinessProfileScreen() {
  const router = useRouter();
  const [selectedTrade, setSelectedTrade] = useState<TradeType | null>(null);
  const [formData, setFormData] = useState({
    laborRate: "",
    materialMarkup: "",
  });

  const handleContinue = () => {
    if (!selectedTrade) {
      Alert.alert("Missing Information", "Please select your trade");
      return;
    }
    router.push("/trade-selection" as any);
  };

  return (
    <LinearGradient colors={["#0066FF", "#004BB5"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.stepIndicator}>Step 2 of 4</Text>
              <Text style={styles.title}>Business Profile</Text>
              <Text style={styles.subtitle}>
                Tell us about your trade and pricing
              </Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Your Trade</Text>
                <View style={styles.tradesGrid}>
                  {getAllTradeTypes().map((tradeType) => {
                    const tradeDef = TRADE_DEFINITIONS[tradeType];
                    const isSelected = selectedTrade === tradeType;
                    return (
                      <TouchableOpacity
                        key={tradeType}
                        style={[
                          styles.tradeCard,
                          isSelected && styles.selectedTradeCard,
                        ]}
                        onPress={() => setSelectedTrade(tradeType)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.tradeEmoji}>{tradeDef.icon}</Text>
                        <Text style={styles.tradeName}>{tradeDef.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Default Rates (Optional)</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Hourly Labor Rate</Text>
                  <View style={styles.currencyInput}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="75"
                      placeholderTextColor="#999999"
                      value={formData.laborRate}
                      onChangeText={(text) =>
                        setFormData({ ...formData, laborRate: text })
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.unitLabel}>/hour</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Material Markup</Text>
                  <View style={styles.currencyInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="20"
                      placeholderTextColor="#999999"
                      value={formData.materialMarkup}
                      onChangeText={(text) =>
                        setFormData({ ...formData, materialMarkup: text })
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.unitLabel}>%</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
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
  header: {
    marginBottom: 28,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.8)",
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
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  tradesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tradeCard: {
    width: "31%",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedTradeCard: {
    borderColor: "#0066FF",
    backgroundColor: "#EBF5FF",
  },
  tradeEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  tradeName: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#333333",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333333",
    marginBottom: 8,
  },
  currencyInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666666",
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#666666",
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: "#0066FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
