import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Phone, MessageSquare, Clock, CheckCircle2, Calendar, Brain } from "lucide-react-native";

export default function NeverMissCallScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#10B981", "#059669"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Phone color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Never miss a call</Text>
            <Text style={styles.title}>or a lead again</Text>
            <Text style={styles.subtitle}>
              Your AI assistant handles customer calls 24/7
            </Text>
          </View>

          <View style={styles.benefitsContainer}>
            <BenefitCard
              icon={<Clock color="#10B981" size={28} strokeWidth={2.5} />}
              title="Works 24/7"
              description="AI answers calls even when you're on the job site"
            />
            <BenefitCard
              icon={<MessageSquare color="#3B82F6" size={28} strokeWidth={2.5} />}
              title="Gathers all details"
              description="Collects customer info, job type, location, and urgency"
            />
            <BenefitCard
              icon={<Calendar color="#8B5CF6" size={28} strokeWidth={2.5} />}
              title="Books appointments"
              description="Schedules site visits and sends you notifications"
            />
            <BenefitCard
              icon={<CheckCircle2 color="#F59E0B" size={28} strokeWidth={2.5} />}
              title="Qualifies leads"
              description="Filters serious customers from tire kickers"
            />
          </View>

          <View style={styles.exampleContainer}>
            <View style={styles.exampleHeader}>
              <Brain color="#FFFFFF" size={22} strokeWidth={2.5} />
              <Text style={styles.exampleTitle}>AI Phone Conversation:</Text>
            </View>
            <View style={styles.conversationBubble}>
              <Text style={styles.conversationText}>
                <Text style={styles.conversationLabel}>AI:</Text> {`"Thank you for calling. What service do you need?"`}
              </Text>
            </View>
            <View style={[styles.conversationBubble, styles.customerBubble]}>
              <Text style={styles.conversationText}>
                <Text style={styles.conversationLabel}>Customer:</Text> {`"I need my roof repaired after the storm."`}
              </Text>
            </View>
            <View style={styles.conversationBubble}>
              <Text style={styles.conversationText}>
                <Text style={styles.conversationLabel}>AI:</Text> {`"I can help with that. What's your property address?"`}
              </Text>
            </View>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Every missed call is money lost — AI never sleeps, never forgets
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/ai-office" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIcon}>{icon}</View>
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
  },
  benefitsContainer: {
    gap: 14,
    marginBottom: 28,
  },
  benefitCard: {
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
  benefitIcon: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitContent: {
    flex: 1,
    paddingTop: 4,
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
  exampleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  conversationBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  customerBubble: {
    borderLeftColor: "#3B82F6",
  },
  conversationText: {
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  conversationLabel: {
    fontWeight: "700" as const,
    color: "#059669",
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
    color: "#059669",
    letterSpacing: 0.3,
  },
});
