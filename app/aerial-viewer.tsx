import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  ArrowLeft,
  Satellite,
  Home,
  Layers,
  Ruler,
  MapPin,
  Camera,
  RefreshCw,
  Eye,
  Maximize2,
  Grid3x3,
} from "lucide-react-native";

import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

type ViewMode = "aerial" | "north" | "south" | "east" | "west" | "3d";
type MeasurementLayer = "roof" | "walls" | "both" | "none";

interface ViewAngle {
  id: ViewMode;
  label: string;
  icon: typeof Satellite;
}

const VIEW_ANGLES: ViewAngle[] = [
  { id: "aerial", label: "Aerial", icon: Satellite },
  { id: "north", label: "North", icon: Home },
  { id: "south", label: "South", icon: Home },
  { id: "east", label: "East", icon: Home },
  { id: "west", label: "West", icon: Home },
  { id: "3d", label: "3D", icon: Grid3x3 },
];

export default function AerialViewerScreen() {
  const [address, setAddress] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("aerial");
  const [measurementLayer, setMeasurementLayer] = useState<MeasurementLayer>("both");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);

  const handleLoadProperty = async () => {
    if (!address.trim()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPropertyData({
        address,
        coordinates: { lat: 40.7128, lng: -74.006 },
        measurements: {
          roofArea: 2847,
          wallArea: 3420,
          ridgeLength: 48.5,
          perimeter: 168.4,
        },
        views: {
          aerial: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop`,
          north: `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop`,
          south: `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop`,
          east: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop`,
          west: `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop`,
          "3d": `https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop`,
        },
      });
    } catch (error) {
      console.error("Error loading property:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamView = () => {
    setIsStreaming(!isStreaming);
  };

  const getCurrentImageUrl = () => {
    if (!propertyData) return null;
    return propertyData.views[viewMode];
  };

  const renderSearchSection = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchInputContainer}>
        <MapPin color={Colors.light.muted} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter property address"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor={Colors.light.muted}
          returnKeyType="search"
          onSubmitEditing={handleLoadProperty}
        />
        {isLoading && <ActivityIndicator color={Colors.light.primary} />}
      </View>

      {!propertyData && (
        <TouchableOpacity
          style={[styles.loadButton, !address.trim() && styles.loadButtonDisabled]}
          onPress={handleLoadProperty}
          disabled={!address.trim() || isLoading}
        >
          <Satellite color="#FFF" size={20} />
          <Text style={styles.loadButtonText}>Load Property Views</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {VIEW_ANGLES.map((view) => {
          const IconComponent = view.icon;
          return (
            <TouchableOpacity
              key={view.id}
              style={[styles.viewButton, viewMode === view.id && styles.viewButtonActive]}
              onPress={() => setViewMode(view.id)}
            >
              <IconComponent
                color={viewMode === view.id ? "#FFF" : Colors.light.primary}
                size={20}
              />
              <Text
                style={[styles.viewButtonText, viewMode === view.id && styles.viewButtonTextActive]}
              >
                {view.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderPropertyViewer = () => {
    const imageUrl = getCurrentImageUrl();
    if (!imageUrl) return null;

    return (
      <View style={styles.viewerContainer}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.propertyImage} resizeMode="cover" />

          {showMeasurements && (
            <View style={styles.measurementOverlay}>
              {measurementLayer !== "none" && (
                <>
                  <View style={styles.measurementLine} />
                  <View style={[styles.measurementLine, styles.measurementLineVertical]} />
                  <View style={styles.measurementPoint} />
                  <View style={[styles.measurementPoint, styles.measurementPointTopRight]} />
                  <View style={[styles.measurementPoint, styles.measurementPointBottomLeft]} />
                  <View style={[styles.measurementPoint, styles.measurementPointBottomRight]} />

                  <View style={styles.measurementLabel}>
                    <Text style={styles.measurementLabelText}>48.5 ft</Text>
                  </View>
                  <View style={[styles.measurementLabel, styles.measurementLabelVertical]}>
                    <Text style={styles.measurementLabelText}>36.2 ft</Text>
                  </View>
                </>
              )}
            </View>
          )}

          {isStreaming && (
            <View style={styles.streamingIndicator}>
              <View style={styles.streamingDot} />
              <Text style={styles.streamingText}>Live Streaming</Text>
            </View>
          )}
        </View>

        <View style={styles.viewerControls}>
          <TouchableOpacity
            style={[styles.controlButton, showMeasurements && styles.controlButtonActive]}
            onPress={() => setShowMeasurements(!showMeasurements)}
          >
            <Ruler
              color={showMeasurements ? Colors.light.primary : Colors.light.muted}
              size={20}
            />
            <Text
              style={[styles.controlButtonText, showMeasurements && styles.controlButtonTextActive]}
            >
              Measure
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleStreamView}>
            <Eye color={isStreaming ? Colors.light.success : Colors.light.muted} size={20} />
            <Text style={styles.controlButtonText}>
              {isStreaming ? "Streaming" : "Stream"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Camera color={Colors.light.muted} size={20} />
            <Text style={styles.controlButtonText}>Capture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Maximize2 color={Colors.light.muted} size={20} />
            <Text style={styles.controlButtonText}>Full</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMeasurementLayers = () => (
    <View style={styles.layersSection}>
      <Text style={styles.layersTitle}>Measurement Layers</Text>
      <View style={styles.layersButtons}>
        {(["none", "roof", "walls", "both"] as MeasurementLayer[]).map((layer) => (
          <TouchableOpacity
            key={layer}
            style={[
              styles.layerButton,
              measurementLayer === layer && styles.layerButtonActive,
            ]}
            onPress={() => setMeasurementLayer(layer)}
          >
            <Layers
              color={measurementLayer === layer ? "#FFF" : Colors.light.primary}
              size={16}
            />
            <Text
              style={[
                styles.layerButtonText,
                measurementLayer === layer && styles.layerButtonTextActive,
              ]}
            >
              {layer.charAt(0).toUpperCase() + layer.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMeasurementData = () => {
    if (!propertyData) return null;

    return (
      <View style={styles.dataSection}>
        <Text style={styles.dataTitle}>Property Measurements</Text>

        <View style={styles.dataGrid}>
          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Roof Area</Text>
            <Text style={styles.dataValue}>{propertyData.measurements.roofArea}</Text>
            <Text style={styles.dataUnit}>sq ft</Text>
          </View>

          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Wall Area</Text>
            <Text style={styles.dataValue}>{propertyData.measurements.wallArea}</Text>
            <Text style={styles.dataUnit}>sq ft</Text>
          </View>

          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Ridge Length</Text>
            <Text style={styles.dataValue}>{propertyData.measurements.ridgeLength}</Text>
            <Text style={styles.dataUnit}>ft</Text>
          </View>

          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Perimeter</Text>
            <Text style={styles.dataValue}>{propertyData.measurements.perimeter}</Text>
            <Text style={styles.dataUnit}>ft</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/property-scan")}
          >
            <RefreshCw color="#FFF" size={20} />
            <Text style={styles.primaryButtonText}>Generate Full Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(tabs)/estimates")}
          >
            <Text style={styles.secondaryButtonText}>Create Estimate</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderInfoCards = () => (
    <View style={styles.infoSection}>
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Satellite color={Colors.light.primary} size={24} />
          <Text style={styles.infoTitle}>EagleView Integration</Text>
        </View>
        <Text style={styles.infoText}>
          Access high-resolution aerial imagery and precise measurements for accurate estimates
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Grid3x3 color={Colors.light.success} size={24} />
          <Text style={styles.infoTitle}>Real-Time Visualization</Text>
        </View>
        <Text style={styles.infoText}>
          Walk around the property and see measurements update in real-time on your device
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ruler color={Colors.light.accent} size={24} />
          <Text style={styles.infoTitle}>Multi-Angle Views</Text>
        </View>
        <Text style={styles.infoText}>
          View property from all sides - aerial, north, south, east, west, and 3D perspectives
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Aerial Property Viewer",
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
            <Text style={styles.title}>Aerial Property Viewer</Text>
            <Text style={styles.subtitle}>
              Professional property measurements with aerial and side-view imagery
            </Text>
          </View>

          {renderSearchSection()}

          {propertyData ? (
            <>
              {renderViewSelector()}
              {renderPropertyViewer()}
              {renderMeasurementLayers()}
              {renderMeasurementData()}
            </>
          ) : (
            renderInfoCards()
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
    marginBottom: 24,
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
    lineHeight: 22,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  loadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  loadButtonDisabled: {
    opacity: 0.5,
  },
  loadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  viewSelector: {
    marginBottom: 16,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  viewButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  viewButtonTextActive: {
    color: "#FFF",
  },
  viewerContainer: {
    marginBottom: 24,
  },
  imageWrapper: {
    width: "100%",
    height: width - 40,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Colors.light.card,
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  measurementOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  measurementLine: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    height: 2,
    backgroundColor: Colors.light.primary,
  },
  measurementLineVertical: {
    top: "10%",
    left: "30%",
    right: undefined,
    bottom: "10%",
    width: 2,
    height: undefined,
  },
  measurementPoint: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
    borderWidth: 2,
    borderColor: "#FFF",
    top: "30%",
    left: "10%",
    marginTop: -6,
    marginLeft: -6,
  },
  measurementPointTopRight: {
    left: undefined,
    right: "10%",
    marginLeft: 0,
    marginRight: -6,
  },
  measurementPointBottomLeft: {
    top: undefined,
    bottom: "10%",
    marginTop: 0,
    marginBottom: -6,
  },
  measurementPointBottomRight: {
    top: undefined,
    left: undefined,
    bottom: "10%",
    right: "10%",
    marginTop: 0,
    marginLeft: 0,
    marginBottom: -6,
    marginRight: -6,
  },
  measurementLabel: {
    position: "absolute",
    top: "28%",
    left: "50%",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    transform: [{ translateX: -30 }],
  },
  measurementLabelVertical: {
    top: "50%",
    left: "28%",
    transform: [{ translateY: -15 }],
  },
  measurementLabelText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  streamingIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  streamingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.error,
  },
  streamingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  viewerControls: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  controlButtonActive: {
    backgroundColor: "#EBF5FF",
    borderColor: Colors.light.primary,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  controlButtonTextActive: {
    color: Colors.light.primary,
  },
  layersSection: {
    marginBottom: 24,
  },
  layersTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  layersButtons: {
    flexDirection: "row",
    gap: 8,
  },
  layerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  layerButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  layerButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  layerButtonTextActive: {
    color: "#FFF",
  },
  dataSection: {
    marginBottom: 24,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  dataCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dataLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  dataUnit: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  actionButtons: {
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
  infoSection: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
});
