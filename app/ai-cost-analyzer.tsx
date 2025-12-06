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
  Calculator,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

interface CostAnalysis {
  materialsCost?: number;
  laborCost?: number;
  equipmentCost?: number;
  permitsCost?: number;
  totalMin?: number;
  totalMax?: number;
  factors?: string[];
  recommendations?: string[];
  timelineWeeks?: number;
  analysis?: string;
}

export default function AICostAnalyzerScreen() {
  const [jobType, setJobType] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [materials, setMaterials] = useState<string>("");
  const [laborHours, setLaborHours] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [analysis, setAnalysis] = useState<CostAnalysis | null>(null);

  const analyzeJobCost = trpc.gemini.analyzeJobCost.useMutation({
    onSuccess: (data) => {
      console.log("[AI Cost Analyzer] Analysis received:", data);
      setAnalysis(data as CostAnalysis);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      console.error("[AI Cost Analyzer] Error:", error);
      Alert.alert("Error", "Failed to analyze job cost. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleAnalyze = () => {
    if (!jobType.trim()) {
      Alert.alert("Error", "Please enter a job type");
      return;
    }

    const materialsArray = materials
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m);

    analyzeJobCost.mutate({
      jobType: jobType.trim(),
      area: area ? parseFloat(area) : undefined,
      materials: materialsArray.length > 0 ? materialsArray : undefined,
      laborHours: laborHours ? parseFloat(laborHours) : undefined,
      location: location.trim() || undefined,
    });
  };

  const handleReset = () => {
    setJobType("");
    setArea("");
    setMaterials("");
    setLaborHours("");
    setLocation("");
    setAnalysis(null);
  };

  const renderAnalysisCard = () => {
    if (!analysis) return null;

    if (analysis.analysis && !analysis.totalMin) {
      return (
        <View style={styles.analysisCard}>
          <Text style={styles.analysisText}>{analysis.analysis}</Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.costSummaryCard}>
          <View style={styles.summaryHeader}>
            <Sparkles color="#FFF" size={24} />
            <Text style={styles.summaryTitle}>AI Cost Analysis</Text>
          </View>

          {analysis.totalMin && analysis.totalMax && (
            <View style={styles.estimateRange}>
              <Text style={styles.estimateLabel}>Estimated Total Cost</Text>
              <Text style={styles.estimateValue}>
                ${analysis.totalMin.toLocaleString()} - ${analysis.totalMax.toLocaleString()}
              </Text>
            </View>
          )}

          {analysis.timelineWeeks && (
            <View style={styles.timelineRow}>
              <Clock color="rgba(255, 255, 255, 0.8)" size={18} />
              <Text style={styles.timelineText}>
                Timeline: {analysis.timelineWeeks} week{analysis.timelineWeeks > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        {(analysis.materialsCost || analysis.laborCost || analysis.equipmentCost || analysis.permitsCost) && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Cost Breakdown</Text>

            {analysis.materialsCost !== undefined && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Materials</Text>
                <Text style={styles.breakdownValue}>${analysis.materialsCost.toLocaleString()}</Text>
              </View>
            )}

            {analysis.laborCost !== undefined && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Labor</Text>
                <Text style={styles.breakdownValue}>${analysis.laborCost.toLocaleString()}</Text>
              </View>
            )}

            {analysis.equipmentCost !== undefined && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Equipment</Text>
                <Text style={styles.breakdownValue}>${analysis.equipmentCost.toLocaleString()}</Text>
              </View>
            )}

            {analysis.permitsCost !== undefined && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Permits & Fees</Text>
                <Text style={styles.breakdownValue}>${analysis.permitsCost.toLocaleString()}</Text>
              </View>
            )}
          </View>
        )}

        {analysis.factors && analysis.factors.length > 0 && (
          <View style={styles.factorsCard}>
            <View style={styles.factorsHeader}>
              <AlertCircle color={Colors.light.warning} size={20} />
              <Text style={styles.factorsTitle}>Key Cost Factors</Text>
            </View>
            {analysis.factors.map((factor, index) => (
              <View key={index} style={styles.factorRow}>
                <View style={styles.factorDot} />
                <Text style={styles.factorText}>{factor}</Text>
              </View>
            ))}
          </View>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <View style={styles.recommendationsCard}>
            <View style={styles.recommendationsHeader}>
              <TrendingUp color={Colors.light.success} size={20} />
              <Text style={styles.recommendationsTitle}>Cost Optimization Tips</Text>
            </View>
            {analysis.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationRow}>
                <CheckCircle color={Colors.light.success} size={16} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>New Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createEstimateButton}
            onPress={() => router.push("/estimate-detail")}
          >
            <Text style={styles.createEstimateButtonText}>Create Estimate</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "AI Cost Analyzer",
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
            <Text style={styles.title}>AI-Powered Job Cost Analysis</Text>
            <Text style={styles.subtitle}>
              Get instant cost estimates powered by Gemini AI
            </Text>
          </View>

          {!analysis ? (
            <>
              <View style={styles.inputSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Job Type *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Lawn Installation, Roofing, Deck Building"
                    placeholderTextColor={Colors.light.muted}
                    value={jobType}
                    onChangeText={setJobType}
                    editable={!analyzeJobCost.isPending}
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
                    editable={!analyzeJobCost.isPending}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Materials (comma separated)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g., Sod, Top Soil, Edging, Fertilizer"
                    placeholderTextColor={Colors.light.muted}
                    value={materials}
                    onChangeText={setMaterials}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!analyzeJobCost.isPending}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Estimated Labor Hours</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 16"
                    placeholderTextColor={Colors.light.muted}
                    keyboardType="decimal-pad"
                    value={laborHours}
                    onChangeText={setLaborHours}
                    editable={!analyzeJobCost.isPending}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Austin, TX"
                    placeholderTextColor={Colors.light.muted}
                    value={location}
                    onChangeText={setLocation}
                    editable={!analyzeJobCost.isPending}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    (!jobType.trim() || analyzeJobCost.isPending) && styles.analyzeButtonDisabled,
                  ]}
                  onPress={handleAnalyze}
                  disabled={!jobType.trim() || analyzeJobCost.isPending}
                >
                  {analyzeJobCost.isPending ? (
                    <>
                      <ActivityIndicator color="#FFF" />
                      <Text style={styles.analyzeButtonText}>Analyzing with AI...</Text>
                    </>
                  ) : (
                    <>
                      <Sparkles color="#FFF" size={20} />
                      <Text style={styles.analyzeButtonText}>Analyze with Gemini AI</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Calculator color={Colors.light.primary} size={20} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>How it works</Text>
                  <Text style={styles.infoText}>
                    Our AI analyzes your job details and provides detailed cost breakdowns, 
                    considering materials, labor, equipment, permits, and local market rates.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            renderAnalysisCard()
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
    minHeight: 80,
    paddingTop: 14,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EBF5FF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.light.muted,
    lineHeight: 18,
  },
  analysisCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  analysisText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  costSummaryCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  estimateRange: {
    marginBottom: 16,
  },
  estimateLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  estimateValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timelineText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600" as const,
  },
  breakdownCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  breakdownLabel: {
    fontSize: 15,
    color: Colors.light.text,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  factorsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  factorsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  factorsTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  factorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  factorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.warning,
    marginTop: 6,
  },
  factorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  recommendationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  recommendationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
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
  createEstimateButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createEstimateButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
