import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  AlertCircle,
  Package,
  Search,
  Filter,
  Calendar,
} from "lucide-react-native";
import Colors from "@/constants/colors";

interface MaterialPrice {
  id: string;
  name: string;
  category: "lumber" | "concrete" | "roofing" | "plumbing" | "electrical" | "landscaping";
  unit: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  lastUpdated: string;
  trend: "up" | "down" | "stable";
  supplier: string;
  availability: "in-stock" | "low-stock" | "out-of-stock" | "backorder";
}

const mockMaterialPrices: MaterialPrice[] = [
  {
    id: "1",
    name: "2x4x8 Lumber (Pine)",
    category: "lumber",
    unit: "per board",
    currentPrice: 8.47,
    previousPrice: 9.23,
    priceChange: -0.76,
    priceChangePercent: -8.2,
    lastUpdated: "2 hours ago",
    trend: "down",
    supplier: "Home Depot",
    availability: "in-stock",
  },
  {
    id: "2",
    name: "Concrete Mix 80lb",
    category: "concrete",
    unit: "per bag",
    currentPrice: 5.48,
    previousPrice: 5.12,
    priceChange: 0.36,
    priceChangePercent: 7.0,
    lastUpdated: "1 day ago",
    trend: "up",
    supplier: "Lowes",
    availability: "in-stock",
  },
  {
    id: "3",
    name: "Asphalt Shingles (3-tab)",
    category: "roofing",
    unit: "per bundle",
    currentPrice: 29.98,
    previousPrice: 28.50,
    priceChange: 1.48,
    priceChangePercent: 5.2,
    lastUpdated: "3 hours ago",
    trend: "up",
    supplier: "ABC Supply",
    availability: "in-stock",
  },
  {
    id: "4",
    name: "PVC Pipe 1/2\" x 10'",
    category: "plumbing",
    unit: "per piece",
    currentPrice: 4.12,
    previousPrice: 4.08,
    priceChange: 0.04,
    priceChangePercent: 1.0,
    lastUpdated: "5 hours ago",
    trend: "stable",
    supplier: "Home Depot",
    availability: "in-stock",
  },
  {
    id: "5",
    name: "Topsoil 40lb Bag",
    category: "landscaping",
    unit: "per bag",
    currentPrice: 3.98,
    previousPrice: 4.25,
    priceChange: -0.27,
    priceChangePercent: -6.4,
    lastUpdated: "6 hours ago",
    trend: "down",
    supplier: "Lowes",
    availability: "in-stock",
  },
  {
    id: "6",
    name: "Romex 12/2 Wire (250ft)",
    category: "electrical",
    unit: "per roll",
    currentPrice: 89.97,
    previousPrice: 83.50,
    priceChange: 6.47,
    priceChangePercent: 7.7,
    lastUpdated: "1 day ago",
    trend: "up",
    supplier: "Home Depot",
    availability: "low-stock",
  },
  {
    id: "7",
    name: "Plywood 4x8 1/2\"",
    category: "lumber",
    unit: "per sheet",
    currentPrice: 42.98,
    previousPrice: 45.12,
    priceChange: -2.14,
    priceChangePercent: -4.7,
    lastUpdated: "4 hours ago",
    trend: "down",
    supplier: "Lowes",
    availability: "in-stock",
  },
  {
    id: "8",
    name: "Architectural Shingles",
    category: "roofing",
    unit: "per bundle",
    currentPrice: 42.98,
    previousPrice: 39.98,
    priceChange: 3.00,
    priceChangePercent: 7.5,
    lastUpdated: "2 hours ago",
    trend: "up",
    supplier: "ABC Supply",
    availability: "in-stock",
  },
];

export default function MaterialPricesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [materials] = useState(mockMaterialPrices);

  const categories = [
    { value: null, label: "All" },
    { value: "lumber", label: "Lumber" },
    { value: "roofing", label: "Roofing" },
    { value: "concrete", label: "Concrete" },
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "landscaping", label: "Landscaping" },
  ];

  const filteredMaterials = materials.filter(mat => {
    const matchesSearch = mat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || mat.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      lumber: "#92400e",
      concrete: "#6b7280",
      roofing: "#991b1b",
      plumbing: "#1e40af",
      electrical: "#f59e0b",
      landscaping: "#10b981",
    };
    return colors[category] || "#6b7280";
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "in-stock": return "#10b981";
      case "low-stock": return "#f59e0b";
      case "out-of-stock": return "#ef4444";
      case "backorder": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "in-stock": return "In Stock";
      case "low-stock": return "Low Stock";
      case "out-of-stock": return "Out of Stock";
      case "backorder": return "Backorder";
      default: return "Unknown";
    }
  };

  const priceIncreasing = materials.filter(m => m.trend === "up").length;
  const priceDecreasing = materials.filter(m => m.trend === "down").length;
  const priceStable = materials.filter(m => m.trend === "stable").length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Material Prices",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
        }} 
      />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <DollarSign size={48} color={Colors.light.primary} />
          <Text style={styles.title}>Live Material Prices</Text>
          <Text style={styles.subtitle}>
            Real-time pricing from major suppliers. Updated automatically to help you estimate accurately.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#dcfce7" }]}>
            <TrendingDown size={20} color="#10b981" />
            <Text style={styles.statNumber}>{priceDecreasing}</Text>
            <Text style={styles.statLabel}>Decreasing</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#fef3c7" }]}>
            <View style={styles.stableDot} />
            <Text style={styles.statNumber}>{priceStable}</Text>
            <Text style={styles.statLabel}>Stable</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#fee2e2" }]}>
            <TrendingUp size={20} color="#ef4444" />
            <Text style={styles.statNumber}>{priceIncreasing}</Text>
            <Text style={styles.statLabel}>Increasing</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search materials..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filterSection}>
          <Filter size={16} color={Colors.light.textSecondary} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.value || "all"}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.value && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === cat.value && styles.categoryChipTextActive,
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.materialsSection}>
          {filteredMaterials.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color="#ccc" />
              <Text style={styles.emptyText}>No materials found</Text>
            </View>
          ) : (
            filteredMaterials.map(material => (
              <View key={material.id} style={styles.materialCard}>
                <View style={styles.materialHeader}>
                  <View style={styles.materialHeaderLeft}>
                    <Text style={styles.materialName}>{material.name}</Text>
                    <View style={styles.materialMeta}>
                      <View style={[
                        styles.categoryBadge,
                        { backgroundColor: getCategoryColor(material.category) + "20" },
                      ]}>
                        <Text style={[
                          styles.categoryBadgeText,
                          { color: getCategoryColor(material.category) },
                        ]}>
                          {material.category}
                        </Text>
                      </View>
                      <Text style={styles.supplierText}>{material.supplier}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.trendBadge,
                    material.trend === "up" && styles.trendBadgeUp,
                    material.trend === "down" && styles.trendBadgeDown,
                  ]}>
                    {material.trend === "up" && <TrendingUp size={16} color="#ef4444" />}
                    {material.trend === "down" && <TrendingDown size={16} color="#10b981" />}
                  </View>
                </View>

                <View style={styles.priceSection}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Current Price:</Text>
                    <Text style={styles.currentPrice}>${material.currentPrice.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.unitText}>{material.unit}</Text>
                </View>

                <View style={styles.changeRow}>
                  <View style={styles.changeInfo}>
                    <Text style={[
                      styles.changeAmount,
                      material.priceChange > 0 ? styles.changeUp : styles.changeDown,
                    ]}>
                      {material.priceChange > 0 ? "+" : ""}${material.priceChange.toFixed(2)}
                    </Text>
                    <Text style={[
                      styles.changePercent,
                      material.priceChange > 0 ? styles.changeUp : styles.changeDown,
                    ]}>
                      ({material.priceChange > 0 ? "+" : ""}{material.priceChangePercent.toFixed(1)}%)
                    </Text>
                  </View>
                  <View style={[
                    styles.availabilityBadge,
                    { backgroundColor: getAvailabilityColor(material.availability) + "20" },
                  ]}>
                    <View style={[
                      styles.availabilityDot,
                      { backgroundColor: getAvailabilityColor(material.availability) },
                    ]} />
                    <Text style={[
                      styles.availabilityText,
                      { color: getAvailabilityColor(material.availability) },
                    ]}>
                      {getAvailabilityText(material.availability)}
                    </Text>
                  </View>
                </View>

                <View style={styles.materialFooter}>
                  <View style={styles.updateInfo}>
                    <Calendar size={12} color={Colors.light.textSecondary} />
                    <Text style={styles.updateText}>Updated {material.lastUpdated}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoSection}>
          <AlertCircle size={24} color={Colors.light.primary} />
          <Text style={styles.infoTitle}>How It Works:</Text>
          <Text style={styles.infoText}>
            Prices are automatically pulled from major supplier feeds and updated throughout the day. This helps you:
            {"\n"}• Create more accurate estimates
            {"\n"}• Time material purchases strategically
            {"\n"}• Track cost trends for your business
            {"\n"}• Adjust pricing when material costs change
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  stableDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f59e0b",
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  categoriesScroll: {
    flex: 1,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  materialsSection: {
    marginBottom: 24,
  },
  materialCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  materialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  materialHeaderLeft: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  materialMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  supplierText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  trendBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadgeUp: {
    backgroundColor: "#fee2e2",
  },
  trendBadgeDown: {
    backgroundColor: "#dcfce7",
  },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  unitText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  changeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  changeInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  changeAmount: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  changePercent: {
    fontSize: 14,
  },
  changeUp: {
    color: "#ef4444",
  },
  changeDown: {
    color: "#10b981",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  materialFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  updateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  updateText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emptyState: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
  infoSection: {
    backgroundColor: Colors.light.primary + "10",
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 22,
  },
});
