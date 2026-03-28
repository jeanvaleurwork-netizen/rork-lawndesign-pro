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
  Image,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { MapPin, Camera, Satellite, ArrowRight, Home, ArrowLeft, FileText } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { generateObject } from "@rork-ai/toolkit-sdk";

import Colors from "@/constants/colors";
import type { PropertyReport } from "@/types";


export default function PropertyScanScreen() {
  const [address, setAddress] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [propertyReport, setPropertyReport] = useState<PropertyReport | null>(null);
  const [scanMethod, setScanMethod] = useState<"satellite" | "photo" | null>(null);
  const [reportType, setReportType] = useState<"roofing" | "siding" | "painting" | "general">("roofing");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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

  const handleSatelliteScan = async () => {
    if (!address.trim()) {
      setError("Please enter a property address");
      return;
    }

    setIsScanning(true);
    setScanMethod("satellite");
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockReport: PropertyReport = {
        id: Date.now().toString(),
        propertyAddress: address,
        reportType,
        measurements: {
          roof: reportType === "roofing" || reportType === "general" ? {
            totalRoofArea: 2847,
            pitch: "6/12",
            slopes: 8,
            ridgeLength: 48.5,
            hipsLength: 72.3,
            valleysLength: 24.1,
            eavesLength: 156.8,
            rakeLength: 98.2,
            facets: [
              { id: "1", area: 842, pitch: "6/12", aspectDirection: "North" },
              { id: "2", area: 726, pitch: "6/12", aspectDirection: "South" },
              { id: "3", area: 654, pitch: "6/12", aspectDirection: "East" },
              { id: "4", area: 625, pitch: "6/12", aspectDirection: "West" },
            ],
            chimneys: 1,
            skylights: 2,
            vents: 4,
          } : undefined,
          walls: reportType === "siding" || reportType === "painting" || reportType === "general" ? {
            totalWallArea: 3420,
            stories: 2,
            windows: 18,
            doors: 3,
            exteriorWalls: [
              { side: "North", area: 945, height: 20, length: 47.3 },
              { side: "South", area: 891, height: 20, length: 44.6 },
              { side: "East", area: 798, height: 20, length: 39.9 },
              { side: "West", area: 786, height: 20, length: 39.3 },
            ],
          } : undefined,
          lot: {
            totalArea: 8540,
            buildingFootprint: 2140,
            lawnArea: 4820,
            hardscapeArea: 1580,
          },
        },
        images: {
          aerial: [],
          ground: [],
          annotated: [],
        },
        generatedDate: new Date().toISOString(),
      };

      setPropertyReport(mockReport);
    } catch (err) {
      console.error("Scanning error:", err);
      setError("Failed to scan property. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handlePhotoScan = async () => {
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
      setScanMethod("photo");
      setError(null);
    }
  };

  const handleAnalyzePhotos = async () => {
    if (uploadedImages.length === 0) {
      setError("Please upload at least one photo");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const base64Images = await Promise.all(
        uploadedImages.slice(0, 3).map(async (uri) => await convertImageToBase64(uri))
      );

      const imageMessages = base64Images.map((base64) => ({
        type: "image" as const,
        image: base64,
      }));

      const roofSchema = {
        type: "object",
        properties: {
          totalRoofArea: { type: "number", description: "Total roof area in square feet" },
          pitch: { type: "string", description: "Roof pitch (e.g., 6/12, 8/12)" },
          slopes: { type: "number", description: "Number of roof slopes/planes" },
          ridgeLength: { type: "number", description: "Total ridge length in feet" },
          hipsLength: { type: "number", description: "Total hips length in feet" },
          valleysLength: { type: "number", description: "Total valleys length in feet" },
          eavesLength: { type: "number", description: "Total eaves length in feet" },
          rakeLength: { type: "number", description: "Total rake length in feet" },
          facets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                area: { type: "number", description: "Facet area in square feet" },
                pitch: { type: "string", description: "Facet pitch" },
                aspectDirection: { type: "string", description: "Direction facing (North, South, etc.)" },
              },
            },
          },
          chimneys: { type: "number", description: "Number of chimneys" },
          skylights: { type: "number", description: "Number of skylights" },
          vents: { type: "number", description: "Number of vents" },
        },
      };

      const wallSchema = {
        type: "object",
        properties: {
          totalWallArea: { type: "number", description: "Total exterior wall area in square feet" },
          stories: { type: "number", description: "Number of stories" },
          windows: { type: "number", description: "Number of windows" },
          doors: { type: "number", description: "Number of doors" },
          exteriorWalls: {
            type: "array",
            items: {
              type: "object",
              properties: {
                side: { type: "string", description: "Wall side (North, South, East, West)" },
                area: { type: "number", description: "Wall area in square feet" },
                height: { type: "number", description: "Wall height in feet" },
                length: { type: "number", description: "Wall length in feet" },
              },
            },
          },
        },
      };

      let measurements: PropertyReport["measurements"] = {};

      if (reportType === "roofing" || reportType === "general") {
        const roofResult = await generateObject({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze these property photos and provide detailed ROOF measurements. Include roof area, pitch, slopes, ridge/hips/valleys/eaves/rake lengths, facets with their areas and directions, and count chimneys, skylights, and vents. Be as accurate as possible.`,
                },
                ...imageMessages,
              ],
            },
          ],
          schema: roofSchema as any,
        });
        measurements.roof = roofResult as any;
      }

      if (reportType === "siding" || reportType === "painting" || reportType === "general") {
        const wallResult = await generateObject({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze these property photos and provide detailed EXTERIOR WALL measurements. Include total wall area, number of stories, windows, doors, and measurements for each exterior wall side. Be as accurate as possible.`,
                },
                ...imageMessages,
              ],
            },
          ],
          schema: wallSchema as any,
        });
        measurements.walls = wallResult as any;
      }

      const report: PropertyReport = {
        id: Date.now().toString(),
        propertyAddress: address || "Address not provided",
        reportType,
        measurements,
        images: {
          aerial: uploadedImages,
          ground: [],
          annotated: [],
        },
        generatedDate: new Date().toISOString(),
      };

      setPropertyReport(report);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze photos. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleViewReport = () => {
    if (propertyReport) {
      router.push({
        pathname: "/property-report" as any,
        params: { reportData: JSON.stringify(propertyReport) },
      });
    }
  };

  const renderReportTypeSelector = () => (
    <View style={styles.reportTypeSection}>
      <Text style={styles.sectionLabel}>Report Type</Text>
      <View style={styles.reportTypeGrid}>
        {(["roofing", "siding", "painting", "general"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.reportTypeCard, reportType === type && styles.reportTypeCardActive]}
            onPress={() => setReportType(type)}
          >
            <Text style={[styles.reportTypeText, reportType === type && styles.reportTypeTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Property Scan",
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
          <Text style={styles.title}>Property Scanner</Text>
          <Text style={styles.subtitle}>
            Get detailed measurements for roofing, siding, and painting projects using AI
          </Text>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {renderReportTypeSelector()}

          <View style={styles.methodSection}>
            <Text style={styles.sectionLabel}>Scan Method</Text>

            <TouchableOpacity
              style={styles.methodCard}
              onPress={() => !isScanning && setScanMethod("satellite")}
            >
              <View
                style={[
                  styles.methodIcon,
                  scanMethod === "satellite" && styles.methodIconActive,
                ]}
              >
                <Satellite
                  color={scanMethod === "satellite" ? "#FFF" : Colors.light.primary}
                  size={24}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Satellite/Aerial Scan</Text>
                <Text style={styles.methodDescription}>
                  Enter address for AI-powered analysis using aerial imagery
                </Text>
              </View>
              {scanMethod === "satellite" && (
                <View style={styles.selectedIndicator}>
                  <View style={styles.selectedDot} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodCard}
              onPress={() => !isScanning && setScanMethod("photo")}
            >
              <View
                style={[styles.methodIcon, scanMethod === "photo" && styles.methodIconActive]}
              >
                <Camera
                  color={scanMethod === "photo" ? "#FFF" : Colors.light.primary}
                  size={24}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Photo Upload</Text>
                <Text style={styles.methodDescription}>
                  Upload aerial, drone, or ground photos for analysis
                </Text>
              </View>
              {scanMethod === "photo" && (
                <View style={styles.selectedIndicator}>
                  <View style={styles.selectedDot} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {scanMethod === "satellite" && (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Property Address</Text>
              <View style={styles.addressInput}>
                <MapPin color={Colors.light.muted} size={20} />
                <TextInput
                  style={styles.textInput}
                  placeholder="123 Main St, City, State"
                  value={address}
                  onChangeText={setAddress}
                  placeholderTextColor={Colors.light.muted}
                  editable={!isScanning}
                />
              </View>

              <TouchableOpacity
                style={[styles.scanButton, (isScanning || !address.trim()) && styles.scanButtonDisabled]}
                onPress={handleSatelliteScan}
                disabled={isScanning || !address.trim()}
              >
                {isScanning ? (
                  <>
                    <ActivityIndicator color="#FFF" />
                    <Text style={styles.scanButtonText}>Analyzing...</Text>
                  </>
                ) : (
                  <>
                    <Satellite color="#FFF" size={20} />
                    <Text style={styles.scanButtonText}>Generate Report</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {scanMethod === "photo" && (
            <View style={styles.inputSection}>
              {address.trim() === "" && (
                <>
                  <Text style={styles.inputLabel}>Property Address (Optional)</Text>
                  <View style={styles.addressInput}>
                    <MapPin color={Colors.light.muted} size={20} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="123 Main St, City, State"
                      value={address}
                      onChangeText={setAddress}
                      placeholderTextColor={Colors.light.muted}
                      editable={!isScanning}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.uploadButton, isScanning && styles.scanButtonDisabled]}
                onPress={handlePhotoScan}
                disabled={isScanning}
              >
                <Camera color={Colors.light.primary} size={20} />
                <Text style={styles.uploadButtonText}>Upload Photos</Text>
              </TouchableOpacity>

              {uploadedImages.length > 0 && (
                <View style={styles.imagesSection}>
                  <Text style={styles.imagesLabel}>Uploaded Photos ({uploadedImages.length})</Text>
                  <View style={styles.imagesGrid}>
                    {uploadedImages.map((uri, index) => (
                      <View key={index} style={styles.imageCard}>
                        <Image source={{ uri }} style={styles.thumbnailImage} />
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                    onPress={handleAnalyzePhotos}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <ActivityIndicator color="#FFF" />
                        <Text style={styles.scanButtonText}>Analyzing...</Text>
                      </>
                    ) : (
                      <>
                        <FileText color="#FFF" size={20} />
                        <Text style={styles.scanButtonText}>Analyze & Generate Report</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {propertyReport && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Report Generated</Text>
                <View style={styles.successBadge}>
                  <Text style={styles.successText}>Complete</Text>
                </View>
              </View>

              <View style={styles.reportCard}>
                <Text style={styles.reportTypeLabel}>
                  {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                </Text>
                <Text style={styles.reportAddress}>{propertyReport.propertyAddress}</Text>
                <Text style={styles.reportDate}>
                  Generated: {new Date(propertyReport.generatedDate).toLocaleDateString()}
                </Text>
              </View>

              {propertyReport.measurements.roof && (
                <View style={styles.measurementsCard}>
                  <Text style={styles.measurementsTitle}>Roof Measurements</Text>

                  <View style={styles.dataGrid}>
                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Total Area</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.roof.totalRoofArea.toLocaleString()}</Text>
                      <Text style={styles.dataUnit}>sq ft</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Pitch</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.roof.pitch}</Text>
                      <Text style={styles.dataUnit}>rise/run</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Slopes</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.roof.slopes}</Text>
                      <Text style={styles.dataUnit}>planes</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Ridge</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.roof.ridgeLength}</Text>
                      <Text style={styles.dataUnit}>ft</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Hips</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.roof.hipsLength}</Text>
                      <Text style={styles.dataUnit}>ft</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Valleys</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.roof.valleysLength}</Text>
                      <Text style={styles.dataUnit}>ft</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Eaves</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.roof.eavesLength}</Text>
                      <Text style={styles.dataUnit}>ft</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Rakes</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.roof.rakeLength}</Text>
                      <Text style={styles.dataUnit}>ft</Text>
                    </View>
                  </View>

                  <View style={styles.facetsSection}>
                    <Text style={styles.facetsTitle}>Roof Facets</Text>
                    {propertyReport.measurements.roof.facets.map((facet) => (
                      <View key={facet.id} style={styles.facetRow}>
                        <Text style={styles.facetDirection}>{facet.aspectDirection}</Text>
                        <Text style={styles.facetArea}>{facet.area} sq ft</Text>
                        <Text style={styles.facetPitch}>{facet.pitch}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.featuresRow}>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureValue}>{propertyReport.measurements.roof.chimneys}</Text>
                      <Text style={styles.featureLabel}>Chimneys</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureValue}>{propertyReport.measurements.roof.skylights}</Text>
                      <Text style={styles.featureLabel}>Skylights</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureValue}>{propertyReport.measurements.roof.vents}</Text>
                      <Text style={styles.featureLabel}>Vents</Text>
                    </View>
                  </View>
                </View>
              )}

              {propertyReport.measurements.walls && (
                <View style={styles.measurementsCard}>
                  <Text style={styles.measurementsTitle}>Wall Measurements</Text>

                  <View style={styles.dataGrid}>
                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Total Area</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.walls.totalWallArea.toLocaleString()}</Text>
                      <Text style={styles.dataUnit}>sq ft</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Stories</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.walls.stories}</Text>
                      <Text style={styles.dataUnit}>levels</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Windows</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.walls.windows}</Text>
                      <Text style={styles.dataUnit}>count</Text>
                    </View>

                    <View style={styles.dataCard}>
                      <Text style={styles.dataLabel}>Doors</Text>
                      <Text style={styles.dataValue}>{propertyReport.measurements.walls.doors}</Text>
                      <Text style={styles.dataUnit}>count</Text>
                    </View>
                  </View>

                  <View style={styles.facetsSection}>
                    <Text style={styles.facetsTitle}>Exterior Walls</Text>
                    {propertyReport.measurements.walls.exteriorWalls.map((wall, index) => (
                      <View key={index} style={styles.wallRow}>
                        <Text style={styles.wallSide}>{wall.side}</Text>
                        <View style={styles.wallDetails}>
                          <Text style={styles.wallDetailText}>{wall.length} ft × {wall.height} ft</Text>
                          <Text style={styles.wallArea}>{wall.area} sq ft</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleViewReport}>
                  <FileText color="#FFF" size={20} />
                  <Text style={styles.primaryButtonText}>View Full Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push("/(tabs)/estimates")}
                >
                  <Text style={styles.secondaryButtonText}>Create Estimate</Text>
                  <ArrowRight color={Colors.light.text} size={20} />
                </TouchableOpacity>

                <View style={styles.secondaryButtonRow}>
                  <TouchableOpacity
                    style={styles.tertiaryButton}
                    onPress={() => {
                      setPropertyReport(null);
                      setAddress("");
                      setScanMethod(null);
                      setUploadedImages([]);
                      setError(null);
                    }}
                  >
                    <Text style={styles.tertiaryButtonText}>New Scan</Text>
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
  reportTypeSection: {
    marginBottom: 24,
  },
  reportTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reportTypeCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  reportTypeCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: "#EBF5FF",
  },
  reportTypeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  reportTypeTextActive: {
    color: Colors.light.primary,
  },
  methodSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  methodIconActive: {
    backgroundColor: Colors.light.primary,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  addressInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  uploadButton: {
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
    marginTop: 16,
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
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  resultsSection: {
    marginTop: 24,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  successBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  successText: {
    color: Colors.light.success,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  reportCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  reportTypeLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  reportAddress: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  measurementsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  measurementsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  dataCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  dataLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    marginBottom: 6,
    textAlign: "center",
  },
  dataValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  dataUnit: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  facetsSection: {
    marginTop: 8,
  },
  facetsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  facetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  facetDirection: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    flex: 1,
  },
  facetArea: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    flex: 1,
    textAlign: "center",
  },
  facetPitch: {
    fontSize: 14,
    color: Colors.light.muted,
    flex: 1,
    textAlign: "right",
  },
  featuresRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  featureItem: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  featureValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
  },
  wallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  wallSide: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    flex: 1,
  },
  wallDetails: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wallDetailText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  wallArea: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
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
});
