import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Mail, Lock } from "lucide-react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";

export default function TrialSetupScreen() {
  const router = useRouter();
  const { data, completeOnboarding } = useOnboarding();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const userId = `user_${Date.now()}`;
      const orgId = `org_${Date.now()}`;

      await login({
        user: {
          id: userId,
          email,
          firstName: data.companyName?.split(" ")[0] || "User",
          lastName: data.companyName?.split(" ").slice(1).join(" ") || "",
          name: data.companyName || "User",
          phone: data.businessPhone || "",
          role: data.role || "admin",
          organizationId: orgId,
        },
        organization: {
          id: orgId,
          name: data.companyName || "My Company",
          businessName: data.companyName,
          ownerId: userId,
          plan: "none_yet",
          tradeSpecialties: data.trades,
          companyPhone: data.businessPhone,
          companyEmail: data.businessEmail,
          address: data.businessAddress,
        },
      });

      await completeOnboarding();

      console.log("[Onboarding] Account created successfully");
      router.replace("/(tabs)" as never);
    } catch (error) {
      console.error("[Onboarding] Failed to create account:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isValid = email.trim().length > 0 && 
    password.length >= 6 && 
    password === confirmPassword;

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
                <Sparkles color="#FFFFFF" size={40} strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Start Your</Text>
              <Text style={styles.title}>30-Day Free Trial</Text>
              <Text style={styles.subtitle}>No credit card required. Cancel anytime.</Text>
            </View>

            <View style={styles.valuePropsContainer}>
              <View style={styles.valuePropCard}>
                <Text style={styles.valuePropTitle}>ContractorOS costs less than hiring staff</Text>
                <Text style={styles.valuePropSubtitle}>
                  Get the power of an entire office in your pocket
                </Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail color="#666" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock color="#666" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock color="#666" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.createButton, !isValid && styles.createButtonDisabled]}
              onPress={handleCreateAccount}
              disabled={!isValid || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#1E3A8A" />
              ) : (
                <Text style={styles.createButtonText}>Create Account & Start Trial</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
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
    marginBottom: 24,
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
  },
  valuePropsContainer: {
    marginBottom: 28,
  },
  valuePropCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  valuePropTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 24,
  },
  valuePropSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 21,
  },
  formContainer: {
    gap: 18,
    marginBottom: 24,
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
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 18,
    top: 18,
    zIndex: 1,
  },
  input: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 18,
    paddingLeft: 50,
    borderRadius: 14,
    fontSize: 16,
    color: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 19,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
  termsText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
