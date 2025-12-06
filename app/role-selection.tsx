import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { UserCircle, Users, ArrowRight, CheckCircle } from "lucide-react-native";

export default function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#0066FF", "#004BB5"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>How will you use</Text>
            <Text style={styles.title}>ContractorOS?</Text>
            <Text style={styles.subtitle}>Choose your role to get started</Text>
          </View>

          <View style={styles.rolesContainer}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => router.push("/admin-signup")}
              activeOpacity={0.9}
            >
              <View style={styles.roleIconContainer}>
                <UserCircle color="#0066FF" size={48} strokeWidth={2} />
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
                <ArrowRight color="#0066FF" size={24} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => router.push("/crew-login")}
              activeOpacity={0.9}
            >
              <View style={styles.roleIconContainer}>
                <Users color="#0066FF" size={48} strokeWidth={2} />
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
                <ArrowRight color="#0066FF" size={24} />
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
      <CheckCircle color="#0066FF" size={16} strokeWidth={2.5} />
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
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 12,
    lineHeight: 22,
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
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#E6F0FF",
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
  },
  arrowContainer: {
    alignSelf: "flex-end",
  },
});
