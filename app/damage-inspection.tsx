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
  TextInput,
} from "react-native";
import { Stack, router } from "expo-router";
import { Camera, Upload, AlertTriangle, FileText, ArrowLeft, Home, CheckCircle2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { generateObject } from "@rork-ai/toolkit-sdk";


import Colors from "@/constants/colors";
import type { DamageDetection, DamageSeverity, DamageType } from "@/types";


interface InspectionReport {
  damageDetections: DamageDetection[];
  totalEstimatedCost: {
    min: number;
    max: number;
  };
  recommendations: string[];
  summary: string;
}

export default function DamageInspectionScreen() {
  const [propertyAddress, setPropertyAddress] = useState<string>("");
  const [claimNumber, setClaimNumber] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [inspectionReport, setInspectionReport] = useState<InspectionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      setError("Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadedImages([...uploadedImages, result.assets[0].uri]);
      setError(null);
    }
  };

  const handleUploadPhotos = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      setError("Photo library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      setUploadedImages([...uploadedImages, ...newImages]);
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (uploadedImages.length === 0) {
      setError("Please upload at least one photo");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Images = await Promise.all(
        uploadedImages.slice(0, 5).map(async (uri) => await convertImageToBase64(uri))
      );

      const imageMessages = base64Images.map((base64) => ({
        type: "image" as const,
        image: base64,
      }));

      const damageSchema = {
        type: "object",
        properties: {
          damageDetections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["hail", "wind", "impact", "wear", "leak", "structural"], description: "Type of damage" },
                severity: { type: "string", enum: ["minor", "moderate", "severe", "critical"], description: "Severity of damage" },
                location: { type: "string", description: "Location on property (e.g., 'North roof section', 'Front wall')" },
                description: { type: "string", description: "Detailed description of the damage" },
                estimatedCost: {
                  type: "object",
                  properties: {
                    min: { type: "number" },
                    max: { type: "number" },
                  },
                  description: "Estimated repair cost range",
                },
              },
            },
          },
          recommendations: { type: "array", items: { type: "string" }, description: "Repair and maintenance recommendations" },
          summary: { type: "string", description: "Overall summary of damage assessment" },
        },
      };

      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert property damage inspector for insurance claims. Analyze these property photos and identify ALL damage visible. For each damage found, specify:
- Type (hail, wind, impact, wear, leak, structural)
- Severity (minor, moderate, severe, critical)
- Exact location on the property
- Detailed description
- Estimated repair cost range

Be thorough and look for damage that might be missed by human eye. Include damage to roof, walls, gutters, windows, doors, and any structural elements. Provide repair recommendations and an overall summary.`,
              },
              ...imageMessages,
            ],
          },
        ],
        schema: damageSchema as any,
      });

      console.log("[Damage Inspection] AI Response:", result);

      if (!result || typeof result !== 'object') {
        throw new Error("Invalid response from AI");
      }

      const damageDetections = Array.isArray(result.damageDetections) ? result.damageDetections : [];
      const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];
      const summary = typeof result.summary === 'string' ? result.summary : 'Analysis complete';

      const detections = damageDetections.map((d: any, index: number) => ({
        id: d.id || `damage-${index}`,
        type: d.type || 'structural',
        severity: d.severity || 'moderate',
        location: d.location || 'Unknown location',
        description: d.description || 'Damage detected',
        estimatedCost: {
          min: d.estimatedCost?.min || 0,
          max: d.estimatedCost?.max || 0,
        },
        imageUrl: uploadedImages[Math.min(index, uploadedImages.length - 1)],
      }));

      const totalMin = detections.reduce((sum: number, d: DamageDetection) => sum + (d.estimatedCost?.min || 0), 0);
      const totalMax = detections.reduce((sum: number, d: DamageDetection) => sum + (d.estimatedCost?.max || 0), 0);

      setInspectionReport({
        damageDetections: detections,
        totalEstimatedCost: {
          min: totalMin,
          max: totalMax,
        },
        recommendations,
        summary,
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze damage. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: DamageSeverity) => {
    const colorMap = {
      minor: Colors.light.success,
      moderate: Colors.light.warning,
      severe: "#F97316",
      critical: Colors.light.error,
    };
    return colorMap[severity];
  };

  const getSeverityBgColor = (severity: DamageSeverity) => {
    const bgMap = {
      minor: "#D1FAE5",
      moderate: "#FEF3C7",
      severe: "#FED7AA",
      critical: "#FEE2E2",
    };
    return bgMap[severity];
  };

  const getDamageTypeLabel = (type: DamageType) => {
    const labels: Record<DamageType, string> = {
      hail: "Hail Damage",
      wind: "Wind Damage",
      impact: "Impact Damage",
      wear: "Wear & Tear",
      leak: "Water/Leak Damage",
      structural: "Structural Damage",
    };
    return labels[type];
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Damage Inspection",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 4, padding: 8 }}
            >
              <ArrowLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <AlertTriangle color={Colors.light.primary} size={32} />
            </View>
            <Text style={styles.title}>AI Damage Inspection</Text>
            <Text style={styles.subtitle}>
              For insurance claims - Upload photos to detect and document property damage
            </Text>
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.inputLabel}>Property Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="123 Main St, City, State"
              value={propertyAddress}
              onChangeText={setPropertyAddress}
              placeholderTextColor={Colors.light.muted}
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.inputLabel}>Claim Number (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="INS-2024-12345"
              value={claimNumber}
              onChangeText={setClaimNumber}
              placeholderTextColor={Colors.light.muted}
            />
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.sectionLabel}>Upload Damage Photos</Text>

            <View style={styles.uploadButtons}>
              <TouchableOpacity style={styles.uploadButton} onPress={handleTakePhoto}>
                <Camera color={Colors.light.primary} size={24} />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPhotos}>
                <Upload color={Colors.light.primary} size={24} />
                <Text style={styles.uploadButtonText}>Upload Photos</Text>
              </TouchableOpacity>
            </View>
          </View>

          {uploadedImages.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={styles.imagesLabel}>Uploaded Photos ({uploadedImages.length})</Text>
              <View style={styles.imagesGrid}>
                {uploadedImages.map((uri, index) => (
                  <View key={index} style={styles.imageCard}>
                    <Image source={{ uri }} style={styles.thumbnailImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {!inspectionReport && (
                <TouchableOpacity
                  style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
                  onPress={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <ActivityIndicator color="#FFF" />
                      <Text style={styles.analyzeButtonText}>Analyzing Damage...</Text>
                    </>
                  ) : (
                    <>
                      <AlertTriangle color="#FFF" size={20} />
                      <Text style={styles.analyzeButtonText}>Analyze Damage with AI</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {inspectionReport && (
            <View style={styles.resultsSection}>
              <View style={styles.resultHeader}>
                <CheckCircle2 color={Colors.light.success} size={24} />
                <Text style={styles.resultHeaderText}>Inspection Complete</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Assessment Summary</Text>
                <Text style={styles.summaryText}>{inspectionReport.summary}</Text>
              </View>

              <View style={styles.costCard}>
                <Text style={styles.costLabel}>Total Estimated Repair Cost</Text>
                <Text style={styles.costValue}>
                  ${inspectionReport.totalEstimatedCost.min.toLocaleString()} - $
                  {inspectionReport.totalEstimatedCost.max.toLocaleString()}
                </Text>
                <Text style={styles.costNote}>
                  {inspectionReport.damageDetections.length} damage{inspectionReport.damageDetections.length !== 1 ? "s" : ""} detected
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Damage Detections</Text>
                {inspectionReport.damageDetections.map((damage) => (
                  <View key={damage.id} style={styles.damageCard}>
                    <View style={styles.damageHeader}>
                      <View style={styles.damageTypeContainer}>
                        <Text style={styles.damageTypeLabel}>{getDamageTypeLabel(damage.type)}</Text>
                        <View
                          style={[
                            styles.severityBadge,
                            { backgroundColor: getSeverityBgColor(damage.severity) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.severityText,
                              { color: getSeverityColor(damage.severity) },
                            ]}
                          >
                            {damage.severity.charAt(0).toUpperCase() + damage.severity.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {damage.imageUrl && (
                      <Image source={{ uri: damage.imageUrl }} style={styles.damageImage} />
                    )}

                    <View style={styles.damageDetails}>
                      <View style={styles.damageRow}>
                        <Text style={styles.damageLabel}>Location:</Text>
                        <Text style={styles.damageValue}>{damage.location}</Text>
                      </View>

                      <Text style={styles.damageDescription}>{damage.description}</Text>

                      <View style={styles.damageCost}>
                        <Text style={styles.damageCostLabel}>Estimated Repair:</Text>
                        <Text style={styles.damageCostValue}>
                          ${damage.estimatedCost.min.toLocaleString()} - $
                          {damage.estimatedCost.max.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {inspectionReport.recommendations.map((rec, index) => (
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
                  onPress={() => {
                    console.log("Generate insurance report");
                  }}
                >
                  <FileText color="#FFF" size={20} />
                  <Text style={styles.primaryButtonText}>Generate Insurance Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push("/(tabs)/estimates")}
                >
                  <Text style={styles.secondaryButtonText}>Create Repair Estimate</Text>
                </TouchableOpacity>

                <View style={styles.secondaryButtonRow}>
                  <TouchableOpacity
                    style={styles.tertiaryButton}
                    onPress={() => {
                      setUploadedImages([]);
                      setInspectionReport(null);
                      setError(null);
                    }}
                  >
                    <Text style={styles.tertiaryButtonText}>New Inspection</Text>
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
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  infoSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    fontSize: 16,
    color: Colors.light.text,
  },
  uploadSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
    gap: 8,
  },
  uploadButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  imagesSection: {
    marginBottom: 24,
  },
  imagesLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  imageCard: {
    width: "30%",
    aspectRatio: 1,
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700" as const,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.warning,
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
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  costCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
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
    color: Colors.light.error,
    marginBottom: 8,
  },
  costNote: {
    fontSize: 13,
    color: Colors.light.muted,
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
  damageCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  damageHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  damageTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  damageTypeLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
  damageImage: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.light.background,
  },
  damageDetails: {
    padding: 16,
  },
  damageRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  damageLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginRight: 8,
  },
  damageValue: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  damageDescription: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  damageCost: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  damageCostLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  damageCostValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.error,
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
    marginBottom: 20,
  },
  secondaryButtonRow: {
    flexDirection: "row",
    gap: 12,
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
  secondaryButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  tertiaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tertiaryButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "600" as const,
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
});
