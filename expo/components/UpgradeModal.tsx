import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Crown, X, Zap, CheckCircle, TrendingUp } from "lucide-react-native";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Colors from "@/constants/colors";

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string;
  title?: string;
  description?: string;
}

export default function UpgradeModal({
  visible,
  onClose,
  feature,
  title = "Upgrade to Unlock This Feature",
  description = "Access premium ContractorOS features to scale your business faster.",
}: UpgradeModalProps) {
  const router = useRouter();
  const { subscription, getTierName } = useSubscription();

  const handleUpgrade = () => {
    onClose();
    router.push("/pricing");
  };

  const recommendedTier = feature === "advanced_analytics" || feature === "damage_detection" ? "elite" : "pro";

  const features = [
    "Unlimited Contracts & Legal Suite",
    "Job Profit Analysis & Costing",
    "Full Crew Management",
    "Receipt Scanning & AI Analysis",
    "Advanced Scheduling",
    "Priority Support",
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color={Colors.light.text} size={24} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconBadge}>
              {recommendedTier === "elite" ? (
                <Crown color="#F59E0B" size={48} fill="#F59E0B" />
              ) : (
                <TrendingUp color="#8B5CF6" size={48} />
              )}
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.currentTierCard}>
            <Text style={styles.currentTierLabel}>Your Current Plan</Text>
            <Text style={styles.currentTierName}>{getTierName(subscription.tier)}</Text>
            {subscription.tier === "none" && (
              <Text style={styles.currentTierNote}>Get started with a paid plan to unlock features</Text>
            )}
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.featuresSectionHeader}>
              <Zap color={Colors.light.primary} size={24} />
              <Text style={styles.featuresSectionTitle}>
                Unlock Premium Features
              </Text>
            </View>
            
            {features.map((featureItem, idx) => (
              <View key={idx} style={styles.featureRow}>
                <CheckCircle color={Colors.light.success} size={20} />
                <Text style={styles.featureText}>{featureItem}</Text>
              </View>
            ))}
          </View>

          <View style={styles.recommendedCard}>
            <View style={styles.recommendedBadge}>
              <Zap color="#FFF" size={16} fill="#FFF" />
              <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
            </View>
            <Text style={styles.recommendedTitle}>
              {recommendedTier === "elite" ? "Business Elite" : "Pro"}
            </Text>
            <View style={styles.recommendedPriceRow}>
              <Text style={styles.recommendedPrice}>
                ${recommendedTier === "elite" ? "349" : "149"}
              </Text>
              <Text style={styles.recommendedPricePeriod}>/month</Text>
            </View>
            <Text style={styles.recommendedDescription}>
              {recommendedTier === "elite"
                ? "Perfect for growing businesses that need advanced analytics and unlimited AI"
                : "Best for contractors ready to scale revenue and improve efficiency"}
            </Text>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>View All Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Maybe Later</Text>
          </TouchableOpacity>

          <Text style={styles.guarantee}>
            30-Day Money-Back Guarantee • Cancel Anytime
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  closeButton: {
    position: "absolute" as const,
    top: 56,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 80,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.light.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  currentTierCard: {
    width: "100%",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  currentTierLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentTierName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  currentTierNote: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 8,
    textAlign: "center",
  },
  featuresSection: {
    width: "100%",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  featuresSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  featuresSectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  featureText: {
    fontSize: 15,
    color: Colors.light.text,
    flex: 1,
  },
  recommendedCard: {
    width: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    position: "relative" as const,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  recommendedBadge: {
    position: "absolute" as const,
    top: -12,
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recommendedBadgeText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: "#FFF",
    letterSpacing: 1,
  },
  recommendedTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#FFF",
    marginTop: 16,
    marginBottom: 12,
  },
  recommendedPriceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  recommendedPrice: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: "#FFF",
    letterSpacing: -2,
  },
  recommendedPricePeriod: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600" as const,
    marginTop: 16,
  },
  recommendedDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  upgradeButton: {
    width: "100%",
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#FFF",
    letterSpacing: 0.5,
  },
  cancelButton: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  guarantee: {
    fontSize: 13,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
