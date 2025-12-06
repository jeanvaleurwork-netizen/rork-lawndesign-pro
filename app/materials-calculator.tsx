import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Stack } from "expo-router";
import {
  Calculator,
  Plus,
  Minus,
  DollarSign,
  ShoppingCart,
  Check,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface Material {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  category: "sod" | "soil" | "mulch" | "hardscape" | "plants" | "labor";
}

export default function MaterialsCalculatorScreen() {
  const [sqFootage, setSqFootage] = useState<string>("");
  const [calculated, setCalculated] = useState<boolean>(false);
  const [materials, setMaterials] = useState<Material[]>([]);

  const handleCalculate = () => {
    const sqFt = parseFloat(sqFootage);
    if (isNaN(sqFt) || sqFt <= 0) return;

    const calculatedMaterials: Material[] = [
      {
        id: "1",
        name: "Premium Bermuda Sod",
        unit: "sq ft",
        unitPrice: 0.45,
        quantity: Math.ceil(sqFt),
        category: "sod",
      },
      {
        id: "2",
        name: "Top Soil",
        unit: "cubic yard",
        unitPrice: 35,
        quantity: Math.ceil(sqFt / 100),
        category: "soil",
      },
      {
        id: "3",
        name: "Premium Mulch",
        unit: "cubic yard",
        unitPrice: 42,
        quantity: Math.ceil((sqFt * 0.2) / 100),
        category: "mulch",
      },
      {
        id: "4",
        name: "Lawn Edging",
        unit: "linear ft",
        unitPrice: 2.5,
        quantity: Math.ceil(Math.sqrt(sqFt) * 4),
        category: "hardscape",
      },
      {
        id: "5",
        name: "Fertilizer Starter",
        unit: "bag (50lb)",
        unitPrice: 28,
        quantity: Math.ceil(sqFt / 5000),
        category: "soil",
      },
      {
        id: "6",
        name: "Installation Labor",
        unit: "hour",
        unitPrice: 65,
        quantity: Math.ceil(sqFt / 500),
        category: "labor",
      },
    ];

    setMaterials(calculatedMaterials);
    setCalculated(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, quantity: Math.max(0, m.quantity + delta) } : m
      )
    );
  };

  const getCategoryColor = (category: Material["category"]) => {
    const colorMap = {
      sod: "#10B981",
      soil: "#8B4513",
      mulch: "#D2691E",
      hardscape: "#6B7280",
      plants: "#059669",
      labor: "#3B82F6",
    } as const;
    return colorMap[category];
  };

  const getCategoryBg = (category: Material["category"]) => {
    const bgMap = {
      sod: "#D1FAE5",
      soil: "#FEF3C7",
      mulch: "#FED7AA",
      hardscape: "#F3F4F6",
      plants: "#D1FAE5",
      labor: "#EBF5FF",
    } as const;
    return bgMap[category];
  };

  const totalCost = materials.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);
  const materialsOnly = materials
    .filter((m) => m.category !== "labor")
    .reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);
  const laborCost = materials
    .filter((m) => m.category === "labor")
    .reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Materials Calculator",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Calculator color={Colors.light.primary} size={32} />
            </View>
            <Text style={styles.title}>Smart Materials Calculator</Text>
            <Text style={styles.subtitle}>
              Calculate materials and costs for any landscaping project
            </Text>
          </View>

          {!calculated ? (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Project Size (Square Feet)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter square footage..."
                placeholderTextColor={Colors.light.muted}
                keyboardType="decimal-pad"
                value={sqFootage}
                onChangeText={setSqFootage}
              />

              <TouchableOpacity
                style={[styles.calculateButton, !sqFootage && styles.calculateButtonDisabled]}
                onPress={handleCalculate}
                disabled={!sqFootage}
              >
                <Calculator color="#FFF" size={20} />
                <Text style={styles.calculateButtonText}>Calculate Materials</Text>
              </TouchableOpacity>

              <View style={styles.quickSizeSection}>
                <Text style={styles.quickSizeTitle}>Quick Sizes:</Text>
                <View style={styles.quickSizeGrid}>
                  {["1000", "2500", "5000", "10000"].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={styles.quickSizeButton}
                      onPress={() => setSqFootage(size)}
                    >
                      <Text style={styles.quickSizeText}>{parseInt(size).toLocaleString()} sq ft</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.projectCard}>
                <Text style={styles.projectLabel}>Project Size</Text>
                <Text style={styles.projectValue}>{parseFloat(sqFootage).toLocaleString()} sq ft</Text>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => {
                    setCalculated(false);
                    setMaterials([]);
                  }}
                >
                  <Text style={styles.changeButtonText}>Change Size</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.costSummaryCard}>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Materials:</Text>
                  <Text style={styles.costValue}>
                    ${materialsOnly.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Labor:</Text>
                  <Text style={styles.costValue}>
                    ${laborCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.costDivider} />
                <View style={styles.costRow}>
                  <Text style={styles.totalLabel}>Total Cost:</Text>
                  <Text style={styles.totalValue}>
                    ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Materials List</Text>

                {materials.map((material) => (
                  <View key={material.id} style={styles.materialCard}>
                    <View style={styles.materialHeader}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: getCategoryColor(material.category) },
                        ]}
                      />
                      <View style={styles.materialInfo}>
                        <Text style={styles.materialName}>{material.name}</Text>
                        <Text style={styles.materialUnit}>
                          ${material.unitPrice.toFixed(2)} / {material.unit}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: getCategoryBg(material.category) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            { color: getCategoryColor(material.category) },
                          ]}
                        >
                          {material.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.materialBody}>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(material.id, -1)}
                        >
                          <Minus color={Colors.light.text} size={16} />
                        </TouchableOpacity>
                        <View style={styles.quantityDisplay}>
                          <Text style={styles.quantityValue}>{material.quantity}</Text>
                          <Text style={styles.quantityUnit}>{material.unit}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(material.id, 1)}
                        >
                          <Plus color={Colors.light.text} size={16} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.materialTotal}>
                        <DollarSign color={Colors.light.primary} size={16} />
                        <Text style={styles.materialTotalText}>
                          ${(material.quantity * material.unitPrice).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.secondaryButton}>
                  <ShoppingCart color={Colors.light.text} size={20} />
                  <Text style={styles.secondaryButtonText}>Send to Supplier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton}>
                  <Check color="#FFF" size={20} />
                  <Text style={styles.primaryButtonText}>Add to Estimate</Text>
                </TouchableOpacity>
              </View>
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
  inputLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  calculateButtonDisabled: {
    opacity: 0.5,
  },
  calculateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  quickSizeSection: {
    marginTop: 8,
  },
  quickSizeTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  quickSizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickSizeButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  quickSizeText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  projectCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  projectLabel: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  projectValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  changeButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  costSummaryCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
  },
  costValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  costDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFF",
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
  materialCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  materialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  materialUnit: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase",
  },
  materialBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quantityDisplay: {
    alignItems: "center",
    minWidth: 60,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  quantityUnit: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  materialTotal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  materialTotalText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
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
  secondaryButtonText: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: "600" as const,
  },
  primaryButton: {
    flex: 1,
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
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
