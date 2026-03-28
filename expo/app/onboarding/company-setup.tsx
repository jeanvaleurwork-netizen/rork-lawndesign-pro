import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Building2 } from "lucide-react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function CompanySetupScreen() {
  const router = useRouter();
  const { data, updateCompanyInfo } = useOnboarding();
  const [companyName, setCompanyName] = useState<string>(data.companyName);
  const [businessPhone, setBusinessPhone] = useState<string>(data.businessPhone);
  const [businessEmail, setBusinessEmail] = useState<string>(data.businessEmail);
  const [businessAddress, setBusinessAddress] = useState<string>(data.businessAddress);

  const handleContinue = async () => {
    await updateCompanyInfo({ companyName, businessPhone, businessEmail, businessAddress });
    router.push("/onboarding/job-tracking" as never);
  };

  const isValid = companyName.trim().length > 0 && 
    businessPhone.trim().length > 0 && 
    businessEmail.trim().length > 0;

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
                <Building2 color="#FFFFFF" size={40} strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Tell us about</Text>
              <Text style={styles.title}>your business</Text>
              <Text style={styles.subtitle}>We&apos;ll use this to customize your experience</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ABC Roofing LLC"
                  placeholderTextColor="#999"
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#999"
                  value={businessPhone}
                  onChangeText={setBusinessPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="hello@mycompany.com"
                  placeholderTextColor="#999"
                  value={businessEmail}
                  onChangeText={setBusinessEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Address (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123 Main St, City, State"
                  placeholderTextColor="#999"
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!isValid}
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
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
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
  formContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    paddingLeft: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 16,
    color: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
});
