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
import { Upload, ArrowLeft, Ruler, Home, CheckCircle, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { generateObject } from "@rork-ai/toolkit-sdk";


import Colors from "@/constants/colors";

interface MeasurementResult {
  totalArea: number;
  lawnArea: number;
  patioArea: number;
  gardenBeds: number;
  walkways: number;
  poolArea: number;
  deckArea: number;
  dimensions: {
    length: number;
    width: number;
  };
  features: string[];
  recommendations: string[];
}

export default function BackyardMeasureScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurements, setMeasurements] = useState<MeasurementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setSelectedImages([...selectedImages, result.assets[0].uri]);
      setMeasurements(null);
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
      setSelectedImages([...selectedImages, ...newImages]);
      setMeasurements(null);
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
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

  const handleMeasure = async () => {
    if (selectedImages.length === 0) {
      setError("Please upload at least one photo");
      return;
    }

    setIsMeasuring(true);
    setError(null);

    try {
      const base64Images = await Promise.all(
        selectedImages.map(async (uri) => await convertImageToBase64(uri))
      );

      const imageMessages = base64Images.map((base64) => ({
        type: "image" as const,
        image: base64,
      }));

      const measurementSchema = {
        type: "object",
        properties: {
          totalArea: { type: "number", description: "Total backyard area in square feet" },
          lawnArea: { type: "number", description: "Lawn/grass area in square feet" },
          patioArea: { type: "number", description: "Patio or concrete area in square feet" },
          gardenBeds: { type: "number", description: "Garden bed area in square feet" },
          walkways: { type: "number", description: "Walkway area in square feet" },
          poolArea: { type: "number", description: "Pool area in square feet (0 if none)" },
          deckArea: { type: "number", description: "Deck area in square feet (0 if none)" },
          dimensions: {
            type: "object",
            properties: {
              length: { type: "number", description: "Approximate length in feet" },
              width: { type: "number", description: "Approximate width in feet" },
            },
          },
          features: { type: "array", items: { type: "string" }, description: "List of notable features in the backyard" },
          recommendations: { type: "array", items: { type: "string" }, description: "Recommendations for landscaping improvements" },
        },
      };

      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze these backyard photos and provide accurate measurements. Estimate the square footage of different areas (lawn, patio, garden beds, etc.), overall dimensions, and identify key features. Also provide landscaping recommendations based on the current condition. Be as accurate as possible with measurements.",
              },
              ...imageMessages,
            ],
          },
        ],
        schema: measurementSchema as any,
      });

      console.log("[Backyard Measure] AI Response:", result);

      if (!result || typeof result !== 'object') {
        throw new Error("Invalid response from AI");
      }

      const measurements: MeasurementResult = {
        totalArea: typeof result.totalArea === 'number' ? result.totalArea : 0,
        lawnArea: typeof result.lawnArea === 'number' ? result.lawnArea : 0,
        patioArea: typeof result.patioArea === 'number' ? result.patioArea : 0,
        gardenBeds: typeof result.gardenBeds === 'number' ? result.gardenBeds : 0,
        walkways: typeof result.walkways === 'number' ? result.walkways : 0,
        poolArea: typeof result.poolArea === 'number' ? result.poolArea : 0,
        deckArea: typeof result.deckArea === 'number' ? result.deckArea : 0,
        dimensions: {
          length: result.dimensions?.length || 0,
          width: result.dimensions?.width || 0,
        },
        features: Array.isArray(result.features) ? result.features : [],
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      };

      setMeasurements(measurements);
    } catch (err) {
      console.error("Measurement error:", err);
      setError("Failed to analyze photos. Please try again.");
    } finally {
      setIsMeasuring(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Backyard Measurement",
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
          <Text style={styles.title}>AI Backyard Measurement</Text>
          <Text style={styles.subtitle}>
            Upload photos of the customer&apos;s backyard to get accurate measurements and area
            calculations
          </Text>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.uploadSection}>
            <TouchableOpacity style={styles.uploadButton} onPress={handleTakePhoto}>
              <Camera color={Colors.light.primary} size={24} />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPhotos}>
              <Upload color={Colors.light.primary} size={24} />
              <Text style={styles.uploadButtonText}>Upload Photos</Text>
            </TouchableOpacity>
          </View>

          {selectedImages.length > 0 && (
            <View style={styles.imagesSection}>
              <View style={styles.imagesSectionHeader}>
                <Text style={styles.imagesSectionTitle}>
                  Selected Photos ({selectedImages.length})
                </Text>
              </View>

              <View style={styles.imagesGrid}>
                {selectedImages.map((uri, index) => (
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

              {!measurements && (
                <TouchableOpacity
                  style={[styles.measureButton, isMeasuring && styles.measureButtonDisabled]}
                  onPress={handleMeasure}
                  disabled={isMeasuring}
                >
                  {isMeasuring ? (
                    <>
                      <ActivityIndicator color="#FFF" />
                      <Text style={styles.measureButtonText}>Analyzing...</Text>
                    </>
                  ) : (
                    <>
                      <Ruler color="#FFF" size={20} />
                      <Text style={styles.measureButtonText}>Measure with AI</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {measurements && (
            <View style={styles.resultsSection}>
              <View style={styles.resultHeader}>
                <CheckCircle color={Colors.light.success} size={24} />
                <Text style={styles.resultHeaderText}>Measurements Complete</Text>
              </View>

              <View style={styles.dimensionsCard}>
                <Text style={styles.dimensionsLabel}>Dimensions</Text>
                <Text style={styles.dimensionsValue}>
                  {measurements.dimensions.length} ft × {measurements.dimensions.width} ft
                </Text>
              </View>

              <View style={styles.measurementsGrid}>
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Total Area</Text>
                  <Text style={styles.measurementValue}>
                    {measurements.totalArea.toLocaleString()}
                  </Text>
                  <Text style={styles.measurementUnit}>sq ft</Text>
                </View>

                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Lawn</Text>
                  <Text style={styles.measurementValue}>
                    {measurements.lawnArea.toLocaleString()}
                  </Text>
                  <Text style={styles.measurementUnit}>sq ft</Text>
                </View>

                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Patio</Text>
                  <Text style={styles.measurementValue}>
                    {measurements.patioArea.toLocaleString()}
                  </Text>
                  <Text style={styles.measurementUnit}>sq ft</Text>
                </View>

                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Garden Beds</Text>
                  <Text style={styles.measurementValue}>
                    {measurements.gardenBeds.toLocaleString()}
                  </Text>
                  <Text style={styles.measurementUnit}>sq ft</Text>
                </View>

                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Walkways</Text>
                  <Text style={styles.measurementValue}>
                    {measurements.walkways.toLocaleString()}
                  </Text>
                  <Text style={styles.measurementUnit}>sq ft</Text>
                </View>

                {measurements.poolArea > 0 && (
                  <View style={styles.measurementCard}>
                    <Text style={styles.measurementLabel}>Pool</Text>
                    <Text style={styles.measurementValue}>
                      {measurements.poolArea.toLocaleString()}
                    </Text>
                    <Text style={styles.measurementUnit}>sq ft</Text>
                  </View>
                )}

                {measurements.deckArea > 0 && (
                  <View style={styles.measurementCard}>
                    <Text style={styles.measurementLabel}>Deck</Text>
                    <Text style={styles.measurementValue}>
                      {measurements.deckArea.toLocaleString()}
                    </Text>
                    <Text style={styles.measurementUnit}>sq ft</Text>
                  </View>
                )}
              </View>

              {measurements.features.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Features Identified</Text>
                  <View style={styles.featuresGrid}>
                    {measurements.features.map((feature, index) => (
                      <View key={index} style={styles.featureTag}>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {measurements.recommendations.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                  {measurements.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <View style={styles.recommendationNumber}>
                        <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push("/(tabs)/estimates")}
                >
                  <Text style={styles.primaryButtonText}>Create Estimate</Text>
                </TouchableOpacity>

                <View style={styles.secondaryButtonRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setSelectedImages([]);
                      setMeasurements(null);
                      setError(null);
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>New Measurement</Text>
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

          {selectedImages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ruler color={Colors.light.muted} size={48} />
              </View>
              <Text style={styles.emptyTitle}>No Photos Selected</Text>
              <Text style={styles.emptyDescription}>
                Upload photos of the customer&apos;s backyard to get started with AI-powered measurements
              </Text>
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
    fontSize: 16,
    color: Colors.light.muted,
    marginBottom: 24,
    lineHeight: 22,
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
  uploadSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
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
  imagesSectionHeader: {
    marginBottom: 16,
  },
  imagesSectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  imageCard: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
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
  measureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  measureButtonDisabled: {
    opacity: 0.6,
  },
  measureButtonText: {
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
  dimensionsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  dimensionsLabel: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  dimensionsValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  measurementCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  measurementLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 8,
    textAlign: "center",
  },
  measurementValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  measurementUnit: {
    fontSize: 12,
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
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureTag: {
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "500" as const,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});
