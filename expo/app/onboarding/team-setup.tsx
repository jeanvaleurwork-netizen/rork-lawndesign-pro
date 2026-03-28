import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Users, Plus, X } from "lucide-react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface CrewMember {
  name: string;
  phone: string;
  email: string;
}

export default function TeamSetupScreen() {
  const router = useRouter();
  const { data, updateCrewMembers } = useOnboarding();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(
    data.crewMembers.length > 0 ? data.crewMembers : [{ name: "", phone: "", email: "" }]
  );

  const addCrewMember = () => {
    setCrewMembers([...crewMembers, { name: "", phone: "", email: "" }]);
  };

  const removeCrewMember = (index: number) => {
    if (crewMembers.length > 1) {
      setCrewMembers(crewMembers.filter((_, i) => i !== index));
    }
  };

  const updateCrewMember = (index: number, field: keyof CrewMember, value: string) => {
    const updated = [...crewMembers];
    updated[index][field] = value;
    setCrewMembers(updated);
  };

  const handleSkip = async () => {
    await updateCrewMembers([]);
    router.push("/onboarding/job-tracking" as never);
  };

  const handleContinue = async () => {
    const validMembers = crewMembers.filter(
      (member) => member.name.trim().length > 0 && member.phone.trim().length > 0
    );
    await updateCrewMembers(validMembers);
    router.push("/onboarding/job-tracking" as never);
  };

  return (
    <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Users color="#FFFFFF" size={40} strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Add your crew</Text>
              <Text style={styles.subtitle}>You can add crew members now or skip for later</Text>
            </View>

            <View style={styles.crewContainer}>
              {crewMembers.map((member, index) => (
                <View key={index} style={styles.crewMemberCard}>
                  <View style={styles.crewHeader}>
                    <Text style={styles.crewLabel}>Crew Member {index + 1}</Text>
                    {crewMembers.length > 1 && (
                      <TouchableOpacity onPress={() => removeCrewMember(index)} style={styles.removeButton}>
                        <X color="#EF4444" size={22} strokeWidth={2.5} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor="#999"
                      value={member.name}
                      onChangeText={(value) => updateCrewMember(index, "name", value)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="(555) 123-4567"
                      placeholderTextColor="#999"
                      value={member.phone}
                      onChangeText={(value) => updateCrewMember(index, "phone", value)}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email (optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="john@company.com"
                      placeholderTextColor="#999"
                      value={member.email}
                      onChangeText={(value) => updateCrewMember(index, "email", value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={addCrewMember} activeOpacity={0.8}>
                <Plus color="#1E3A8A" size={24} strokeWidth={2.5} />
                <Text style={styles.addButtonText}>Add Another Crew Member</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.85}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 12,
    lineHeight: 23,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  crewContainer: {
    gap: 20,
    marginBottom: 24,
  },
  crewMemberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  crewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  crewLabel: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#1E3A8A",
  },
  removeButton: {
    padding: 4,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#666666",
    paddingLeft: 2,
  },
  input: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#1E3A8A",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1E3A8A",
  },
  buttonsContainer: {
    gap: 12,
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
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
