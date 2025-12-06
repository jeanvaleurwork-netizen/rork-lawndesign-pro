import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, MessageSquare, Clock, CheckCircle } from "lucide-react-native";

export default function CrewArrivalScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MapPin color="#FFFFFF" size={42} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Keep customers</Text>
            <Text style={styles.title}>informed automatically</Text>
            <Text style={styles.subtitle}>
              Professional updates like Uber for contractors
            </Text>
          </View>

          <View style={styles.timelineContainer}>
            <TimelineItem
              icon={<MapPin color="#3B82F6" size={22} strokeWidth={2.5} />}
              title="Crew is on the way"
              description="Estimated arrival: 2:30 PM"
              status="active"
            />
            <TimelineItem
              icon={<CheckCircle color="#10B981" size={22} strokeWidth={2.5} />}
              title="Crew has arrived"
              description="Started work at 2:35 PM"
              status="completed"
            />
            <TimelineItem
              icon={<MessageSquare color="#8B5CF6" size={22} strokeWidth={2.5} />}
              title="Work update sent"
              description="Progress photos uploaded"
              status="completed"
            />
            <TimelineItem
              icon={<CheckCircle color="#059669" size={22} strokeWidth={2.5} />}
              title="Job completed"
              description="Invoice sent to customer"
              status="completed"
            />
          </View>

          <View style={styles.benefitsContainer}>
            <BenefitCard
              icon={<Clock color="#3B82F6" size={26} strokeWidth={2.5} />}
              title="Eliminates angry customer calls"
              description="They know when you&apos;re coming"
            />
            <BenefitCard
              icon={<MessageSquare color="#10B981" size={26} strokeWidth={2.5} />}
              title="Builds trust"
              description="Professional communication every step"
            />
            <BenefitCard
              icon={<CheckCircle color="#8B5CF6" size={26} strokeWidth={2.5} />}
              title="Luxury service feel"
              description="Stand out from competitors"
            />
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/onboarding/property-analysis" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function TimelineItem({ icon, title, description, status }: { icon: React.ReactNode; title: string; description: string; status: string }) {
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineIconContainer, status === "active" && styles.timelineIconActive]}>
        {icon}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineDescription}>{description}</Text>
      </View>
    </View>
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
  timelineContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    gap: 20,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 14,
  },
  timelineIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineIconActive: {
    backgroundColor: "#E0EFFF",
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    color: "#666666",
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
