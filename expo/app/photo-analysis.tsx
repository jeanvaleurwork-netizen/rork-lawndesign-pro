import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { Camera, Upload, CheckCircle, ArrowRight, Home, ArrowLeft, Sparkles } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { generateObject } from "@rork-ai/toolkit-sdk";

import Colors from "@/constants/colors";


interface AnalysisResult {
  issue: string;
  severity: "low" | "moderate" | "high";
  materialsNeeded: string[];
  estimatedCost: {
    min: number;
    max: number;
  };
  recommendations: string[];
}

export default function PhotoAnalysisScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const handleUploadPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    if (Platform.OS === "web") {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    try {
      const base64Image = await convertImageToBase64(selectedImage);

      const analysisSchema = {
        type: "object",
        properties: {
          issue: { type: "string", description: "Primary issue or problem identified" },
          severity: { type: "string", enum: ["low", "moderate", "high"], description: "Severity level" },
          materialsNeeded: { 
            type: "array", 
            items: { type: "string" },
            description: "List of materials needed with quantities"
          },
          estimatedCost: {
            type: "object",
            properties: {
              min: { type: "number", description: "Minimum estimated cost in dollars" },
              max: { type: "number", description: "Maximum estimated cost in dollars" },
            },
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "Step-by-step recommendations to fix the issue"
          },
        },
      };

      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "You are a professional landscaping and property inspector. Analyze this photo and identify any issues, damage, or maintenance needs. Provide the primary issue, severity level (low/moderate/high), materials needed with quantities, estimated cost range, and step-by-step recommendations to address the issue. Be specific and practical.",
              },
              {
                type: "image",
                image: base64Image,
              },
            ],
          },
        ],
        schema: analysisSchema as any,
      });

      console.log("[Photo Analysis] AI Response:", result);

      if (!result || typeof result !== 'object') {
        throw new Error("Invalid AI response");
      }

      const analysis: AnalysisResult = {
        issue: result.issue || "Unable to identify issue",
        severity: (result.severity === "low" || result.severity === "moderate" || result.severity === "high") 
          ? result.severity 
          : "moderate",
        materialsNeeded: Array.isArray(result.materialsNeeded) ? result.materialsNeeded : [],
        estimatedCost: {
          min: result.estimatedCost?.min || 0,
          max: result.estimatedCost?.max || 0,
        },
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      };

      setAnalysis(analysis);
    } catch (error) {
      console.error("[Photo Analysis] Error:", error);
      const mockAnalysis: AnalysisResult = {
        issue: "Unable to analyze photo. Please try again.",
        severity: "moderate",
        materialsNeeded: [
          "Photo analysis unavailable",
        ],
        estimatedCost: {
          min: 0,
          max: 0,
        },
        recommendations: [
          "Please try uploading a clearer photo",
          "Ensure the image shows the property clearly",
        ],
      };
      setAnalysis(mockAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: AnalysisResult["severity"]) => {
    const colorMap = {
      low: Colors.light.success,
      moderate: Colors.light.warning,
      high: Colors.light.error,
    } as const;
    return colorMap[severity];
  };

  const getSeverityBgColor = (severity: AnalysisResult["severity"]) => {
    const bgMap = {
      low: "#D1FAE5",
      moderate: "#FEF3C7",
      high: "#FEE2E2",
    } as const;
    return bgMap[severity];
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "AI Photo Analysis",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              style={{ marginLeft: 4, padding: 8 }}
            >
              <ArrowLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.headerBanner}>
            <Sparkles color={Colors.light.primary} size={24} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>AI Photo Analysis</Text>
              <Text style={styles.subtitle}>
                Upload or take a photo to detect issues and get instant AI-powered recommendations
              </Text>
            </View>
          </View>

          {!selectedImage ? (
            <View style={styles.uploadSection}>
              <TouchableOpacity style={styles.uploadCard} onPress={handleTakePhoto}>
                <View style={styles.uploadIcon}>
                  <Camera color={Colors.light.primary} size={32} />
                </View>
                <Text style={styles.uploadTitle}>Take Photo</Text>
                <Text style={styles.uploadDescription}>
                  Use camera to capture property condition
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadCard} onPress={handleUploadPhoto}>
                <View style={styles.uploadIcon}>
                  <Upload color={Colors.light.primary} size={32} />
                </View>
                <Text style={styles.uploadTitle}>Upload Photo</Text>
                <Text style={styles.uploadDescription}>
                  Select from gallery or files
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageSection}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />

              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setAnalysis(null);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Change Photo</Text>
                </TouchableOpacity>

                {!analysis && (
                  <TouchableOpacity
                    style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
                    onPress={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <ActivityIndicator color="#FFF" />
                        <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                      </>
                    ) : (
                      <>
                        <Sparkles color="#FFF" size={20} />
                        <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {analysis && (
            <View style={styles.resultsSection}>
              <View style={styles.resultHeader}>
                <CheckCircle color={Colors.light.success} size={24} />
                <Text style={styles.resultHeaderText}>Analysis Complete</Text>
              </View>

              <View style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <Text style={styles.issueLabel}>Issue Detected</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityBgColor(analysis.severity) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        { color: getSeverityColor(analysis.severity) },
                      ]}
                    >
                      {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.issueText}>{analysis.issue}</Text>
              </View>

              <View style={styles.costCard}>
                <Text style={styles.costLabel}>Estimated Cost</Text>
                <Text style={styles.costValue}>
                  ${analysis.estimatedCost.min.toLocaleString()} - $
                  {analysis.estimatedCost.max.toLocaleString()}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Materials Needed</Text>
                {analysis.materialsNeeded.map((material, index) => (
                  <View key={index} style={styles.materialItem}>
                    <View style={styles.materialDot} />
                    <Text style={styles.materialText}>{material}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {analysis.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.recommendationNumber}>
                      <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push("/(tabs)/estimates")}
                >
                  <Text style={styles.primaryButtonText}>Create Estimate</Text>
                  <ArrowRight color="#FFF" size={20} />
                </TouchableOpacity>

                <View style={styles.secondaryButtonRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setSelectedImage(null);
                      setAnalysis(null);
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Analyze Another</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => router.push("/(tabs)")}
                  >
                    <Home color={Colors.light.primary} size={20} />
                    <Text style={styles.homeButtonText}>Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  headerBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  uploadSection: {
    gap: 16,
  },
  uploadCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
  },
  imageSection: {
    marginBottom: 24,
  },
  selectedImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: "row",
    gap: 12,
  },
  analyzeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  resultsSection: {
    marginTop: 24,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  resultHeaderText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  issueCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  issueLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  issueText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  costCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  costLabel: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  costValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  materialItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  materialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  materialText: {
    fontSize: 15,
    color: Colors.light.text,
    flex: 1,
  },
  recommendationItem: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  recommendationNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendationNumberText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    paddingTop: 4,
  },
  actionButtons: {
    gap: 12,
  },
  secondaryButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  homeButton: {
    flex: 1,
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
  homeButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
