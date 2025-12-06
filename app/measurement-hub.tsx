import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  ArrowLeft,
  Satellite,
  Camera,
  Ruler,
  Layers,
  Grid3x3,
  ScanLine,
  MapPin,
  AlertCircle,
  CheckCircle,
  Eye,
  Zap,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface MeasurementTool {
  id: string;
  title: string;
  description: string;
  icon: typeof Satellite;
  color: string;
  route: string;
  features: string[];
  badge?: string;
}

const MEASUREMENT_TOOLS: MeasurementTool[] = [
  {
    id: "aerial",
    title: "Aerial Property Viewer",
    description: "EagleView-style aerial and side views with real-time measurements",
    icon: Satellite,
    color: Colors.light.primary,
    route: "/aerial-viewer",
    features: ["Aerial views", "All sides (N/S/E/W)", "Live measurements", "3D visualization"],
    badge: "NEW",
  },
  {
    id: "property-scan",
    title: "Property Scanner",
    description: "AI-powered measurements from satellite or uploaded photos",
    icon: MapPin,
    color: Colors.light.success,
    route: "/property-scan",
    features: ["Roof measurements", "Siding measurements", "Automated reports", "Photo analysis"],
  },
  {
    id: "backyard",
    title: "Backyard Measurement",
    description: "Measure lawns, patios, and outdoor spaces with AI",
    icon: Ruler,
    color: "#10B981",
    route: "/backyard-measure",
    features: ["Lawn area", "Patio measurements", "Feature detection", "Recommendations"],
  },
  {
    id: "damage",
    title: "Damage Inspection",
    description: "Insurance claims with AI damage detection",
    icon: AlertCircle,
    color: Colors.light.warning,
    route: "/damage-inspection",
    features: ["Damage detection", "Severity analysis", "Cost estimates", "Insurance reports"],
  },
  {
    id: "photo",
    title: "Photo Analysis",
    description: "Instant measurements from photos taken on-site",
    icon: Camera,
    color: Colors.light.accent,
    route: "/photo-analysis",
    features: ["Quick capture", "Material detection", "Instant estimates", "Easy sharing"],
  },
];

const INTEGRATIONS = [
  {
    name: "EagleView",
    description: "Premium aerial imagery and measurements",
    icon: Eye,
    status: "Available",
  },
  {
    name: "Hover",
    description: "3D property models and measurements",
    icon: Grid3x3,
    status: "Available",
  },
  {
    name: "Lightr",
    description: "Real-time LiDAR scanning for interiors",
    icon: ScanLine,
    status: "Coming Soon",
  },
];

export default function MeasurementHubScreen() {
  const renderToolCard = (tool: MeasurementTool) => {
    const IconComponent = tool.icon;
    return (
      <TouchableOpacity
        key={tool.id}
        style={styles.toolCard}
        onPress={() => router.push(tool.route as any)}
      >
        {tool.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tool.badge}</Text>
          </View>
        )}

        <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
          <IconComponent color="#FFF" size={28} />
        </View>

        <View style={styles.toolContent}>
          <Text style={styles.toolTitle}>{tool.title}</Text>
          <Text style={styles.toolDescription}>{tool.description}</Text>

          <View style={styles.featuresList}>
            {tool.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle color={Colors.light.success} size={14} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.launchButton}>
            <Text style={styles.launchButtonText}>Launch Tool</Text>
            <Zap color={tool.color} size={16} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderIntegrations = () => (
    <View style={styles.integrationsSection}>
      <Text style={styles.sectionTitle}>Third-Party Integrations</Text>
      <Text style={styles.sectionSubtitle}>
        Connect with industry-leading measurement platforms
      </Text>

      {INTEGRATIONS.map((integration) => {
        const IconComponent = integration.icon;
        return (
          <View key={integration.name} style={styles.integrationCard}>
            <View style={styles.integrationIcon}>
              <IconComponent color={Colors.light.primary} size={24} />
            </View>

            <View style={styles.integrationContent}>
              <Text style={styles.integrationName}>{integration.name}</Text>
              <Text style={styles.integrationDescription}>{integration.description}</Text>
            </View>

            <View
              style={[
                styles.integrationStatus,
                integration.status === "Available"
                  ? styles.integrationStatusActive
                  : styles.integrationStatusComingSoon,
              ]}
            >
              <Text
                style={[
                  styles.integrationStatusText,
                  integration.status === "Available"
                    ? styles.integrationStatusTextActive
                    : styles.integrationStatusTextComingSoon,
                ]}
              >
                {integration.status}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Measurement Hub",
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
              <Layers color={Colors.light.primary} size={32} />
            </View>
            <Text style={styles.title}>Measurement Hub</Text>
            <Text style={styles.subtitle}>
              Professional property measurement tools powered by AI and satellite imagery
            </Text>
          </View>

          <View style={styles.toolsSection}>
            <Text style={styles.sectionTitle}>Measurement Tools</Text>
            {MEASUREMENT_TOOLS.map(renderToolCard)}
          </View>

          {renderIntegrations()}

          <View style={styles.workflowSection}>
            <Text style={styles.sectionTitle}>Recommended Workflow</Text>

            <View style={styles.workflowStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Start with Aerial Viewer</Text>
                <Text style={styles.stepDescription}>
                  Get comprehensive property overview from all angles
                </Text>
              </View>
            </View>

            <View style={styles.workflowStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Generate Detailed Report</Text>
                <Text style={styles.stepDescription}>
                  Use Property Scanner for precise roof and siding measurements
                </Text>
              </View>
            </View>

            <View style={styles.workflowStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>On-Site Verification</Text>
                <Text style={styles.stepDescription}>
                  Take photos for damage inspection and final verification
                </Text>
              </View>
            </View>

            <View style={styles.workflowStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Create Professional Estimate</Text>
                <Text style={styles.stepDescription}>
                  All measurements automatically populate your estimate
                </Text>
              </View>
            </View>
          </View>
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
    backgroundColor: "#EBF5FF",
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
  toolsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 16,
    lineHeight: 20,
  },
  toolCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    position: "relative",
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: Colors.light.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  toolIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  toolDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  launchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  launchButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  integrationsSection: {
    marginBottom: 32,
  },
  integrationCard: {
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
  integrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  integrationContent: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  integrationStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  integrationStatusActive: {
    backgroundColor: "#D1FAE5",
  },
  integrationStatusComingSoon: {
    backgroundColor: "#FEF3C7",
  },
  integrationStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  integrationStatusTextActive: {
    color: Colors.light.success,
  },
  integrationStatusTextComingSoon: {
    color: Colors.light.warning,
  },
  workflowSection: {
    marginBottom: 20,
  },
  workflowStep: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
});
