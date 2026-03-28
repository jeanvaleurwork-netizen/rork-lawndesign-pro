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
  Wrench,
  Hammer,
  Wind,
  Droplet,
  Zap,
  TreePine,
  ChevronRight,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface TradeTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Trade {
  id: string;
  name: string;
  icon: any;
  color: string;
  tools: TradeTool[];
}

const trades: Trade[] = [
  {
    id: "roofing",
    name: "Roofing Tools",
    icon: Hammer,
    color: "#EF4444",
    tools: [
      { id: "1", name: "Roof Measurement", description: "Satellite-based measurements", enabled: true },
      { id: "2", name: "Pitch Calculator", description: "Calculate roof pitch", enabled: true },
      { id: "3", name: "Storm Damage Analyzer", description: "AI damage detection", enabled: false },
      { id: "4", name: "Materials Calculator", description: "Auto-calculate needed materials", enabled: true },
    ],
  },
  {
    id: "hvac",
    name: "HVAC Tools",
    icon: Wind,
    color: "#3B82F6",
    tools: [
      { id: "1", name: "Unit Tonnage Calculator", description: "Calculate required BTU/tonnage", enabled: true },
      { id: "2", name: "Repair vs Replace AI", description: "AI recommendation system", enabled: true },
      { id: "3", name: "Parts Generator", description: "Auto-generate parts list", enabled: false },
      { id: "4", name: "Seasonal System Planner", description: "Maintenance scheduling", enabled: true },
    ],
  },
  {
    id: "plumbing",
    name: "Plumbing Tools",
    icon: Droplet,
    color: "#06B6D4",
    tools: [
      { id: "1", name: "Leak Detector", description: "Photo-based leak detection", enabled: true },
      { id: "2", name: "Pipe Type AI", description: "Identify pipe materials", enabled: false },
      { id: "3", name: "Water Damage Scoring", description: "Assess damage severity", enabled: true },
      { id: "4", name: "Parts List Generator", description: "Auto-generate parts needed", enabled: true },
    ],
  },
  {
    id: "electrical",
    name: "Electrical Tools",
    icon: Zap,
    color: "#F59E0B",
    tools: [
      { id: "1", name: "Panel Load Calculator", description: "Calculate panel capacity", enabled: true },
      { id: "2", name: "Wiring Scanner", description: "Photo-based wiring analysis", enabled: false },
      { id: "3", name: "Safety Violation AI", description: "Detect code violations", enabled: true },
      { id: "4", name: "Parts Estimator", description: "Estimate needed materials", enabled: true },
    ],
  },
  {
    id: "landscaping",
    name: "Landscaping Tools",
    icon: TreePine,
    color: "#10B981",
    tools: [
      { id: "1", name: "Lawn Measurement", description: "Satellite-based lawn sizing", enabled: true },
      { id: "2", name: "Materials Calculator", description: "Calculate sod, mulch, etc.", enabled: true },
      { id: "3", name: "Design Samples", description: "Browse completed projects", enabled: true },
      { id: "4", name: "Maintenance Plan Builder", description: "Create maintenance schedules", enabled: true },
    ],
  },
  {
    id: "general",
    name: "General Contracting",
    icon: Wrench,
    color: "#8B5CF6",
    tools: [
      { id: "1", name: "Project Estimator", description: "AI-powered estimates", enabled: true },
      { id: "2", name: "Material Quantity Calculator", description: "Calculate all materials", enabled: true },
      { id: "3", name: "Permit Assistant", description: "Permit requirements helper", enabled: false },
      { id: "4", name: "Timeline Generator", description: "Auto-generate schedules", enabled: true },
    ],
  },
];

export default function TradeToolsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Trade Tools",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Trade-Specific Tools</Text>
            <Text style={styles.subtitle}>
              Enable tools and features specific to your trade
            </Text>
          </View>

          <TouchableOpacity
            style={styles.calculatorCard}
            onPress={() => router.push("/materials-calculator")}
          >
            <View style={styles.calculatorIcon}>
              <Wrench color={Colors.light.primary} size={24} />
            </View>
            <View style={styles.calculatorInfo}>
              <Text style={styles.calculatorTitle}>Materials Calculator</Text>
              <Text style={styles.calculatorDescription}>Calculate materials & costs instantly</Text>
            </View>
            <ChevronRight color={Colors.light.muted} size={20} />
          </TouchableOpacity>

          {trades.map((trade) => {
            const Icon = trade.icon;
            return (
              <TouchableOpacity key={trade.id} style={styles.tradeCard}>
                <View style={styles.tradeHeader}>
                  <View style={styles.tradeHeaderLeft}>
                    <View
                      style={[styles.tradeIconContainer, { backgroundColor: `${trade.color}20` }]}
                    >
                      <Icon color={trade.color} size={24} />
                    </View>
                    <Text style={styles.tradeName}>{trade.name}</Text>
                  </View>
                  <ChevronRight color={Colors.light.muted} size={20} />
                </View>

                <View style={styles.toolsList}>
                  {trade.tools.map((tool) => (
                    <View key={tool.id} style={styles.toolRow}>
                      <View style={styles.toolInfo}>
                        <Text style={styles.toolName}>{tool.name}</Text>
                        <Text style={styles.toolDescription}>{tool.description}</Text>
                      </View>
                      <View
                        style={[
                          styles.toolStatus,
                          tool.enabled ? styles.toolEnabled : styles.toolDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toolStatusText,
                            tool.enabled
                              ? styles.toolStatusTextEnabled
                              : styles.toolStatusTextDisabled,
                          ]}
                        >
                          {tool.enabled ? "Enabled" : "Disabled"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
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
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.muted,
    lineHeight: 22,
  },
  tradeCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tradeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tradeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tradeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tradeName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  toolsList: {
    gap: 12,
  },
  toolRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  toolInfo: {
    flex: 1,
    marginRight: 12,
  },
  toolName: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  toolDescription: {
    fontSize: 13,
    color: Colors.light.muted,
    lineHeight: 18,
  },
  toolStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toolEnabled: {
    backgroundColor: "#D1FAE5",
  },
  toolDisabled: {
    backgroundColor: "#F3F4F6",
  },
  toolStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  toolStatusTextEnabled: {
    color: Colors.light.success,
  },
  toolStatusTextDisabled: {
    color: Colors.light.muted,
  },
  calculatorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF5FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  calculatorIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  calculatorInfo: {
    flex: 1,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  calculatorDescription: {
    fontSize: 13,
    color: Colors.light.muted,
  },
});
