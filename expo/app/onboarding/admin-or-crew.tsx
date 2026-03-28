import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { UserCircle, Users, CheckCircle, ArrowRight } from "lucide-react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function AdminOrCrewScreen() {
  const router = useRouter();
  const { updateRole } = useOnboarding();

  const handleRoleSelection = async (role: "admin" | "crew") => {
    await updateRole(role);
    if (role === "admin") {
      router.push("/onboarding/company-setup" as never);
    } else {
      router.push("/crew-login" as never);
    }
  };

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose your role</Text>
            <Text style={styles.subtitle}>This determines what features you&apos;ll see</Text>
          </View>

          <View style={styles.rolesContainer}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRoleSelection("admin")}
              activeOpacity={0.9}
            >
              <View style={styles.roleIconContainer}>
                <UserCircle color="#1E3A8A" size={52} strokeWidth={2} />
              </View>
              <Text style={styles.roleTitle}>Business Owner / Admin</Text>
              <Text style={styles.roleDescription}>
                Create jobs, assign crews, manage clients, and get paid
              </Text>
              <View style={styles.benefitsList}>
                <BenefitItem text="Full dashboard access" />
                <BenefitItem text="Manage all jobs & estimates" />
                <BenefitItem text="Assign & track crews" />
                <BenefitItem text="Billing & analytics" />
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight color="#1E3A8A" size={26} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRoleSelection("crew")}
              activeOpacity={0.9}
            >
              <View style={styles.roleIconContainer}>
                <Users color="#1E3A8A" size={52} strokeWidth={2} />
              </View>
              <Text style={styles.roleTitle}>Crew Member</Text>
              <Text style={styles.roleDescription}>
                View today&apos;s jobs, upload photos, clock in/out
              </Text>
              <View style={styles.benefitsList}>
                <BenefitItem text="See assigned jobs" />
                <BenefitItem text="Upload photos & receipts" />
                <BenefitItem text="Clock in/out" />
                <BenefitItem text="Add job notes" />
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight color="#1E3A8A" size={26} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitItem}>
      <CheckCircle color="#10B981" size={18} strokeWidth={2.5} />
      <Text style={styles.benefitText}>{text}</Text>
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
  rolesContainer: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  roleIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: "#E0EFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
    marginBottom: 20,
  },
  benefitsList: {
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
    fontWeight: "500" as const,
  },
  arrowContainer: {
    alignSelf: "flex-end",
  },
});
