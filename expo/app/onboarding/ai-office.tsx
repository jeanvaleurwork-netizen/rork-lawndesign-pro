import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Bot, FileText, MessageSquare, Calculator, Sparkles } from "lucide-react-native";

export default function AIOfficeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Bot color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Your digital</Text>
            <Text style={styles.title}>office assistant</Text>
            <Text style={styles.subtitle}>
              Like having a full-time office manager
            </Text>
          </View>

          <View style={styles.aiCapabilitiesContainer}>
            <AICapabilityCard
              icon={<FileText color="#3B82F6" size={28} strokeWidth={2.5} />}
              title="Creates estimates"
              description="Generate professional quotes in seconds"
            />
            <AICapabilityCard
              icon={<MessageSquare color="#10B981" size={28} strokeWidth={2.5} />}
              title="Builds proposals"
              description="Write compelling job proposals automatically"
            />
            <AICapabilityCard
              icon={<Calculator color="#8B5CF6" size={28} strokeWidth={2.5} />}
              title="Helps with pricing"
              description="Suggests competitive rates based on your costs"
            />
            <AICapabilityCard
              icon={<Sparkles color="#F59E0B" size={28} strokeWidth={2.5} />}
              title="Prepares invoices"
              description="Convert estimates to invoices instantly"
            />
          </View>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>Ask your AI assistant:</Text>
            <View style={styles.exampleBubble}>
              <Text style={styles.exampleText}>
                &quot;Create an estimate for roof repair in Brooklyn&quot;
              </Text>
            </View>
            <View style={styles.exampleBubble}>
              <Text style={styles.exampleText}>
                &quot;Write a proposal for landscaping project&quot;
              </Text>
            </View>
            <View style={styles.exampleBubble}>
              <Text style={styles.exampleText}>
                &quot;What should I charge for this job?&quot;
              </Text>
            </View>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Most contractors hate paperwork — AI handles the tedious tasks
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/receipt-scanner" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function AICapabilityCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.capabilityCard}>
      <View style={styles.capabilityIcon}>{icon}</View>
      <View style={styles.capabilityContent}>
        <Text style={styles.capabilityTitle}>{title}</Text>
        <Text style={styles.capabilityDescription}>{description}</Text>
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
  aiCapabilitiesContainer: {
    gap: 14,
    marginBottom: 28,
  },
  capabilityCard: {
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
  capabilityIcon: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  capabilityContent: {
    flex: 1,
    paddingTop: 4,
  },
  capabilityTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  capabilityDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  exampleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 14,
  },
  exampleBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500" as const,
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
