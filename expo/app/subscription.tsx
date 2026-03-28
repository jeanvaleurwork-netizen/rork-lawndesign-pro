import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Crown } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTrade } from "@/contexts/TradeContext";
import { TradeType } from "@/types";

export default function SubscriptionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tradeType?: string }>();
  const { session, login } = useAuth();
  const { setTradeType } = useTrade();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSubscription = async () => {
    if (!session) {
      Alert.alert("Error", "No user session found");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[Subscription] Activating subscription locally:", selectedPlan);
      
      const updatedSession = {
        ...session,
        organization: {
          ...session.organization,
          plan: selectedPlan,
          tradeType: params.tradeType as TradeType,
        },
      };

      await login(updatedSession);
      
      if (params.tradeType) {
        await setTradeType(params.tradeType as TradeType);
      }
      
      console.log("[Subscription] Subscription activated successfully");
      Alert.alert("Success!", `Your ${selectedPlan} subscription has been activated.`, [
        { text: "Continue", onPress: () => router.replace("/(tabs)") }
      ]);
    } catch (error) {
      console.error("[Subscription] Failed to activate subscription:", error);
      Alert.alert("Error", "Failed to activate subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipForNow = () => {
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient colors={["#0066FF", "#004BB5"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.crownContainer}>
              <Crown color="#FFD700" size={48} fill="#FFD700" />
            </View>
            <Text style={styles.title}>Activate Your</Text>
            <Text style={styles.title}>ContractorOS Account</Text>
            <Text style={styles.subtitle}>Choose a plan to unlock full features</Text>
          </View>

          <View style={styles.plansContainer}>
            <TouchableOpacity
              style={[styles.planCard, selectedPlan === "monthly" && styles.selectedCard]}
              onPress={() => setSelectedPlan("monthly")}
              activeOpacity={0.9}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>Monthly Plan</Text>
                  <Text style={styles.planPrice}>$49/month</Text>
                </View>
                {selectedPlan === "monthly" && (
                  <CheckCircle color="#0066FF" size={28} strokeWidth={2.5} />
                )}
              </View>
              <Text style={styles.planDescription}>Full access, billed monthly</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, selectedPlan === "yearly" && styles.selectedCard]}
              onPress={() => setSelectedPlan("yearly")}
              activeOpacity={0.9}
            >
              <View style={styles.planBadge}>
                <Text style={styles.badgeText}>SAVE 20%</Text>
              </View>
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>Yearly Plan</Text>
                  <Text style={styles.planPrice}>$470/year</Text>
                  <Text style={styles.savingsText}>($39/month)</Text>
                </View>
                {selectedPlan === "yearly" && (
                  <CheckCircle color="#0066FF" size={28} strokeWidth={2.5} />
                )}
              </View>
              <Text style={styles.planDescription}>Best value, billed annually</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What&apos;s included:</Text>
            <FeatureItem text="Unlimited jobs & estimates" />
            <FeatureItem text="Unlimited crew members" />
            <FeatureItem text="Client CRM & communication" />
            <FeatureItem text="Photo documentation and AI analysis" />
            <FeatureItem text="Receipt tracking & job costing" />
            <FeatureItem text="Scheduling & route optimization" />
            <FeatureItem text="Invoicing & payments" />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={handleStartSubscription}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#0066FF" />
              ) : (
                <Text style={styles.primaryButtonText}>Start Subscription</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkipForNow} activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Skip for now (Limited features)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <CheckCircle color="#FFFFFF" size={20} strokeWidth={2.5} />
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
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  crownContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 12,
    textAlign: "center",
  },
  plansContainer: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#FFD700",
  },
  planBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FF6B00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#0066FF",
  },
  savingsText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  planDescription: {
    fontSize: 14,
    color: "#666666",
  },
  featuresContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#FFFFFF",
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0066FF",
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textDecorationLine: "underline",
  },
});
