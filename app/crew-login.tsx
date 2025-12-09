import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Users } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

export default function CrewLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [loginMethod, setLoginMethod] = useState<"existing" | "crewCode">("existing");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [crewCodeForm, setCrewCodeForm] = useState({
    crewCode: "",
    name: "",
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [validatedCompany, setValidatedCompany] = useState<string | null>(null);

  const validateInviteMutation = trpc.auth.validateInviteCode.useMutation();
  const crewSignupMutation = trpc.auth.crewSignupWithInvite.useMutation();

  const crewLoginMutation = trpc.auth.crewLogin.useMutation();

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert("Missing Information", "Please enter email/phone and password");
      return;
    }

    setIsLoading(true);
    try {
      console.log("[CrewLogin] Attempting crew login:", loginForm.email);
      
      const authSession = await crewLoginMutation.mutateAsync({
        emailOrPhone: loginForm.email,
        password: loginForm.password,
      });
      
      console.log("[CrewLogin] Crew login successful:", authSession.user.name, authSession.user.role);
      await login(authSession);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("[CrewLogin] Failed to login:", error);
      Alert.alert(
        "Login Failed",
        error.message || "Invalid email/phone or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateCode = async () => {
    if (!crewCodeForm.crewCode) {
      Alert.alert("Missing Information", "Please enter invite code");
      return;
    }

    setValidatingCode(true);
    try {
      const result = await validateInviteMutation.mutateAsync({
        code: crewCodeForm.crewCode,
      });

      setValidatedCompany(result.companyName);
      Alert.alert(
        "Code Validated!",
        `You're joining ${result.companyName}. Please complete your profile.`,
        [{ text: "Continue" }]
      );
    } catch (error: any) {
      Alert.alert("Invalid Code", error.message || "Please check the invite code and try again");
      setValidatedCompany(null);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSignupWithCode = async () => {
    if (!crewCodeForm.crewCode || !crewCodeForm.name || !crewCodeForm.phone || !crewCodeForm.password) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    if (crewCodeForm.password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const authSession = await crewSignupMutation.mutateAsync({
        inviteCode: crewCodeForm.crewCode,
        name: crewCodeForm.name,
        phone: crewCodeForm.phone,
        password: crewCodeForm.password,
      });
      
      console.log("[CrewLogin] Crew signup successful:", authSession);
      await login(authSession);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("[CrewLogin] Failed to signup:", error);
      Alert.alert("Signup Failed", error.message || "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0066FF", "#004BB5"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Users color="#FFFFFF" size={40} />
              </View>
              <Text style={styles.title}>Crew Member Login</Text>
              <Text style={styles.subtitle}>
                Access your assigned jobs and upload work photos
              </Text>
            </View>

            <View style={styles.methodSelector}>
              <TouchableOpacity
                style={[styles.methodButton, loginMethod === "existing" && styles.activeMethodButton]}
                onPress={() => setLoginMethod("existing")}
                activeOpacity={0.7}
              >
                <Text style={[styles.methodButtonText, loginMethod === "existing" && styles.activeMethodButtonText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodButton, loginMethod === "crewCode" && styles.activeMethodButton]}
                onPress={() => setLoginMethod("crewCode")}
                activeOpacity={0.7}
              >
                <Text style={[styles.methodButtonText, loginMethod === "crewCode" && styles.activeMethodButtonText]}>
                  Join with Code
                </Text>
              </TouchableOpacity>
            </View>

            {loginMethod === "existing" ? (
              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email or Phone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="crew@company.com"
                    placeholderTextColor="#999999"
                    value={loginForm.email}
                    onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#999999"
                    value={loginForm.password}
                    onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.continueButton, isLoading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#0066FF" />
                  ) : (
                    <Text style={styles.continueButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Join Your Team</Text>
                <Text style={styles.formDescription}>
                  Ask your admin for the crew code to join
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Invite Code</Text>
                  <View style={styles.codeInputRow}>
                    <TextInput
                      style={[styles.input, styles.codeInput]}
                      placeholder="ABC123"
                      placeholderTextColor="#999999"
                      value={crewCodeForm.crewCode}
                      onChangeText={(text) => {
                        setCrewCodeForm({ ...crewCodeForm, crewCode: text.toUpperCase() });
                        setValidatedCompany(null);
                      }}
                      autoCapitalize="characters"
                      editable={!validatedCompany}
                    />
                    {!validatedCompany && (
                      <TouchableOpacity
                        style={styles.validateButton}
                        onPress={handleValidateCode}
                        disabled={validatingCode}
                      >
                        {validatingCode ? (
                          <ActivityIndicator color="#0066FF" size="small" />
                        ) : (
                          <Text style={styles.validateButtonText}>Validate</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  {validatedCompany && (
                    <View style={styles.validatedBanner}>
                      <Text style={styles.validatedText}>✓ Joining {validatedCompany}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Smith"
                    placeholderTextColor="#999999"
                    value={crewCodeForm.name}
                    onChangeText={(text) => setCrewCodeForm({ ...crewCodeForm, name: text })}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(555) 123-4567"
                    placeholderTextColor="#999999"
                    value={crewCodeForm.phone}
                    onChangeText={(text) => setCrewCodeForm({ ...crewCodeForm, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Create Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#999999"
                    value={crewCodeForm.password}
                    onChangeText={(text) => setCrewCodeForm({ ...crewCodeForm, password: text })}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.continueButton, (isLoading || !validatedCompany) && styles.disabledButton]}
                  onPress={handleSignupWithCode}
                  disabled={isLoading || !validatedCompany}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#0066FF" />
                  ) : (
                    <Text style={styles.continueButtonText}>Join Team</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 22,
  },
  methodSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeMethodButton: {
    backgroundColor: "#FFFFFF",
  },
  methodButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.8)",
  },
  activeMethodButtonText: {
    color: "#0066FF",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  continueButton: {
    backgroundColor: "#0066FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  codeInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  codeInput: {
    flex: 1,
  },
  validateButton: {
    backgroundColor: "#EBF5FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
  },
  validateButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0066FF",
  },
  validatedBanner: {
    marginTop: 8,
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  validatedText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#065F46",
  },
});
