import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  FileText,
  Send,
  Sparkles,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowLeft,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

export default function AIEstimateGeneratorScreen() {
  const [clientName, setClientName] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [materials, setMaterials] = useState<string>("");
  const [customRequirements, setCustomRequirements] = useState<string>("");
  const [generatedEstimate, setGeneratedEstimate] = useState<string | null>(null);

  const generateEstimate = trpc.gemini.generateEstimate.useMutation({
    onSuccess: (data) => {
      console.log("[AI Estimate Generator] Estimate generated");
      setGeneratedEstimate(data.estimate);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      console.error("[AI Estimate Generator] Error:", error);
      Alert.alert("Error", "Failed to generate estimate. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleGenerate = () => {
    if (!clientName.trim() || !jobType.trim() || !jobDescription.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const materialsArray = materials
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m);

    generateEstimate.mutate({
      clientName: clientName.trim(),
      jobType: jobType.trim(),
      jobDescription: jobDescription.trim(),
      area: area ? parseFloat(area) : undefined,
      materials: materialsArray.length > 0 ? materialsArray : undefined,
      customRequirements: customRequirements.trim() || undefined,
    });
  };

  const handleReset = () => {
    setClientName("");
    setJobType("");
    setJobDescription("");
    setArea("");
    setMaterials("");
    setCustomRequirements("");
    setGeneratedEstimate(null);
  };

  const handleSendToClient = () => {
    Alert.alert(
      "Send Estimate",
      "This estimate will be sent to the client via email.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Alert.alert("Success", "Estimate sent to client!");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "AI Estimate Generator",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 0, padding: 12, backgroundColor: Colors.light.background, borderRadius: 10 }}
            >
              <ArrowLeft color={Colors.light.text} size={26} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Sparkles color={Colors.light.primary} size={32} />
            </View>
            <Text style={styles.title}>AI Estimate Generator</Text>
            <Text style={styles.subtitle}>
              Create professional estimates instantly with Gemini AI
            </Text>
          </View>

          {!generatedEstimate ? (
            <>
              <View style={styles.inputSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Client Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., John Smith"
                    placeholderTextColor={Colors.light.muted}
                    value={clientName}
                    onChangeText={setClientName}
                    editable={!generateEstimate.isPending}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Job Type *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Lawn Installation, Deck Building"
                    placeholderTextColor={Colors.light.muted}
                    value={jobType}
                    onChangeText={setJobType}
                    editable={!generateEstimate.isPending}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Job Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the scope of work..."
                    placeholderTextColor={Colors.light.muted}
                    value={jobDescription}
                    onChangeText={setJobDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!generateEstimate.isPending}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Area (sq ft)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 2500"
                    placeholderTextColor={Colors.light.muted}
                    keyboardType="decimal-pad"
                    value={area}
                    onChangeText={setArea}
                    editable={!generateEstimate.isPending}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Materials (comma separated)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g., Sod, Top Soil, Edging"
                    placeholderTextColor={Colors.light.muted}
                    value={materials}
                    onChangeText={setMaterials}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!generateEstimate.isPending}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Special Requirements</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any special instructions or requirements..."
                    placeholderTextColor={Colors.light.muted}
                    value={customRequirements}
                    onChangeText={setCustomRequirements}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!generateEstimate.isPending}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    (!clientName.trim() || !jobType.trim() || !jobDescription.trim() || generateEstimate.isPending) &&
                      styles.generateButtonDisabled,
                  ]}
                  onPress={handleGenerate}
                  disabled={
                    !clientName.trim() || !jobType.trim() || !jobDescription.trim() || generateEstimate.isPending
                  }
                >
                  {generateEstimate.isPending ? (
                    <>
                      <ActivityIndicator color="#FFF" />
                      <Text style={styles.generateButtonText}>Generating with AI...</Text>
                    </>
                  ) : (
                    <>
                      <Sparkles color="#FFF" size={20} />
                      <Text style={styles.generateButtonText}>Generate Estimate with Gemini</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.featuresCard}>
                <Text style={styles.featuresTitle}>What&apos;s Included</Text>
                <View style={styles.featureRow}>
                  <CheckCircle color={Colors.light.success} size={18} />
                  <Text style={styles.featureText}>Detailed scope of work breakdown</Text>
                </View>
                <View style={styles.featureRow}>
                  <CheckCircle color={Colors.light.success} size={18} />
                  <Text style={styles.featureText}>Materials list with quantities</Text>
                </View>
                <View style={styles.featureRow}>
                  <CheckCircle color={Colors.light.success} size={18} />
                  <Text style={styles.featureText}>Labor & equipment costs</Text>
                </View>
                <View style={styles.featureRow}>
                  <CheckCircle color={Colors.light.success} size={18} />
                  <Text style={styles.featureText}>Professional terms & conditions</Text>
                </View>
                <View style={styles.featureRow}>
                  <Clock color={Colors.light.primary} size={18} />
                  <Text style={styles.featureText}>Estimated timeline</Text>
                </View>
                <View style={styles.featureRow}>
                  <DollarSign color={Colors.light.primary} size={18} />
                  <Text style={styles.featureText}>Payment terms & schedule</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.successCard}>
                <View style={styles.successHeader}>
                  <CheckCircle color={Colors.light.success} size={32} />
                  <Text style={styles.successTitle}>Estimate Generated!</Text>
                </View>
                <Text style={styles.successSubtitle}>
                  Your professional estimate is ready to send
                </Text>
              </View>

              <View style={styles.estimateCard}>
                <View style={styles.estimateHeader}>
                  <FileText color={Colors.light.primary} size={24} />
                  <Text style={styles.estimateTitle}>Professional Estimate</Text>
                </View>

                <ScrollView style={styles.estimateScroll} nestedScrollEnabled>
                  <Text style={styles.estimateText}>{generatedEstimate}</Text>
                </ScrollView>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                  <Text style={styles.resetButtonText}>New Estimate</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sendButton} onPress={handleSendToClient}>
                  <Send color="#FFF" size={18} />
                  <Text style={styles.sendButtonText}>Send to Client</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.viewDetailButton}
                onPress={() => router.push("/estimate-detail")}
              >
                <FileText color={Colors.light.primary} size={18} />
                <Text style={styles.viewDetailButtonText}>Edit in Estimate Builder</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  featuresCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  successCard: {
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.light.muted,
    textAlign: "center",
  },
  estimateCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
    maxHeight: 400,
  },
  estimateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  estimateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  estimateScroll: {
    maxHeight: 300,
    padding: 20,
  },
  estimateText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  resetButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resetButtonText: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: "600" as const,
  },
  sendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  viewDetailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  viewDetailButtonText: {
    color: Colors.light.primary,
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
