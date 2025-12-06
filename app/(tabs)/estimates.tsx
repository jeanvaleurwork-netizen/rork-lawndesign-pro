import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { ChevronRight, Plus, TrendingUp, DollarSign, FileText, Search, X, Wallet } from "lucide-react-native";

import Colors from "@/constants/colors";
import { EstimateStatus } from "@/types";
import { useData } from "@/contexts/DataContext";

export default function EstimatesScreen() {
  const { estimates, refreshData, clients } = useData();
  const [selectedStatus, setSelectedStatus] = useState<EstimateStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEstimates = useMemo(() => {
    let result = estimates;

    if (selectedStatus !== "all") {
      result = result.filter((est) => est.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (est) =>
          est.clientName.toLowerCase().includes(query) ||
          est.propertyAddress.toLowerCase().includes(query)
      );
    }

    return result;
  }, [estimates, selectedStatus, searchQuery]);

  const statusCounts = {
    all: estimates.length,
    draft: estimates.filter((e) => e.status === "draft").length,
    sent: estimates.filter((e) => e.status === "sent").length,
    approved: estimates.filter((e) => e.status === "approved").length,
    declined: estimates.filter((e) => e.status === "declined").length,
  };

  const getStatusColor = (status: EstimateStatus) => {
    const statusColorMapping = {
      draft: Colors.light.muted,
      sent: Colors.light.primary,
      approved: Colors.light.success,
      declined: Colors.light.error,
    } as const;
    return statusColorMapping[status];
  };

  const getStatusBgColor = (status: EstimateStatus) => {
    const statusBgMapping = {
      draft: "#F3F4F6",
      sent: "#EBF5FF",
      approved: "#D1FAE5",
      declined: "#FEE2E2",
    } as const;
    return statusBgMapping[status];
  };

  const totalValue = estimates.reduce((sum, est) => sum + est.total, 0);
  const approvedValue = estimates
    .filter((e) => e.status === "approved")
    .reduce((sum, est) => sum + est.total, 0);
  const conversionRate = estimates.length > 0
    ? Math.round((statusCounts.approved / estimates.length) * 100)
    : 0;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Estimates</Text>
          <Text style={styles.headerSubtitle}>Manage your proposals</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("/estimate-detail")}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={Colors.light.muted} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client or address..."
            placeholderTextColor={Colors.light.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X color={Colors.light.muted} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <FileText color={Colors.light.primary} size={18} />
            </View>
            <Text style={styles.statValue}>{estimates.length}</Text>
            <Text style={styles.statLabel}>Total Estimates</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}>
              <DollarSign color={Colors.light.success} size={18} />
            </View>
            <Text style={styles.statValue}>${(totalValue / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
              <TrendingUp color={Colors.light.warning} size={18} />
            </View>
            <Text style={styles.statValue}>{conversionRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}>
              <DollarSign color={Colors.light.success} size={18} />
            </View>
            <Text style={styles.statValue}>${(approvedValue / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Won Value</Text>
          </View>
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === "all" && styles.filterButtonActive]}
            onPress={() => setSelectedStatus("all")}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === "all" && styles.filterTextActive,
              ]}
            >
              All ({statusCounts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedStatus === "draft" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus("draft")}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === "draft" && styles.filterTextActive,
              ]}
            >
              Drafts ({statusCounts.draft})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === "sent" && styles.filterButtonActive]}
            onPress={() => setSelectedStatus("sent")}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === "sent" && styles.filterTextActive,
              ]}
            >
              Sent ({statusCounts.sent})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedStatus === "approved" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus("approved")}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === "approved" && styles.filterTextActive,
              ]}
            >
              Approved ({statusCounts.approved})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedStatus === "declined" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus("declined")}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === "declined" && styles.filterTextActive,
              ]}
            >
              Declined ({statusCounts.declined})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      >
        {filteredEstimates.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <FileText color={Colors.light.muted} size={48} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyStateTitle}>
              {searchQuery.trim() 
                ? "No estimates found" 
                : selectedStatus === "all" 
                  ? "No estimates yet"
                  : `No ${selectedStatus} estimates`
              }
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim()
                ? "Try adjusting your search or filters"
                : selectedStatus === "all"
                  ? "Create your first estimate to get started"
                  : `Switch to another status or create a new estimate`
              }
            </Text>
            {!searchQuery.trim() && selectedStatus === "all" && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push("/estimate-detail")}
              >
                <Plus color="#FFF" size={20} />
                <Text style={styles.emptyStateButtonText}>Create Estimate</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredEstimates.map((estimate) => {
            const profitMargin = estimate.profitMargin || 0;
            const profitAmount = estimate.profitAmount || 0;
            const client = clients.find((c) => c.id === estimate.clientId || c.name === estimate.clientName);
            const clientBudget = client?.budget;

            
            return (
            <TouchableOpacity 
              key={estimate.id} 
              style={styles.estimateCard}
              onPress={() => router.push(`/estimate-detail?id=${estimate.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.clientName}>{estimate.clientName}</Text>
                  <Text style={styles.propertyAddress}>{estimate.propertyAddress}</Text>
                </View>
                <ChevronRight color={Colors.light.muted} size={20} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.amountContainer}>
                  <View>
                    <Text style={styles.amount}>
                      ${estimate.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </Text>
                    {profitAmount > 0 && (
                      <View style={styles.profitRow}>
                        <Text style={styles.profitLabel}>Profit: </Text>
                        <Text style={styles.profitAmount}>
                          ${profitAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </Text>
                        <View style={[styles.profitBadge, profitMargin >= 30 ? styles.profitBadgeHigh : profitMargin >= 20 ? styles.profitBadgeMedium : styles.profitBadgeLow]}>
                          <Text style={styles.profitBadgeText}>{profitMargin.toFixed(1)}%</Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBgColor(estimate.status) },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusColor(estimate.status) }]}
                    >
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {clientBudget && (
                  <View style={styles.budgetRow}>
                    <View style={styles.budgetInfo}>
                      <Wallet color={Colors.light.primary} size={14} />
                      <Text style={styles.budgetLabel}>Client Budget:</Text>
                      <Text style={styles.budgetValue}>
                        ${clientBudget.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                    <View style={styles.budgetComparison}>
                      <Text
                        style={[
                          styles.budgetRemainingText,
                          {
                            color:
                              clientBudget - estimate.total < 0
                                ? Colors.light.error
                                : clientBudget - estimate.total < clientBudget * 0.1
                                ? "#F59E0B"
                                : Colors.light.success,
                          },
                        ]}
                      >
                        {clientBudget - estimate.total < 0 ? "Over by " : "Remaining: "}
                        ${Math.abs(clientBudget - estimate.total).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                  </View>
                )}

                <Text style={styles.date}>
                  {new Date(estimate.createdDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statsScroll: {
    maxHeight: 120,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  statCard: {
    width: 120,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    textAlign: "center",
    fontWeight: "500" as const,
  },
  filterScroll: {
    maxHeight: 60,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  filterTextActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  estimateCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  cardBody: {
    gap: 8,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  date: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: "center" as const,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.light.muted,
    textAlign: "center" as const,
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  profitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  profitLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    fontWeight: "500" as const,
  },
  profitAmount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.success,
  },
  profitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  profitBadgeHigh: {
    backgroundColor: "#D1FAE5",
  },
  profitBadgeMedium: {
    backgroundColor: "#FEF3C7",
  },
  profitBadgeLow: {
    backgroundColor: "#FEE2E2",
  },
  profitBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  budgetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  budgetLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    fontWeight: "500" as const,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  budgetComparison: {
    flexDirection: "row",
    alignItems: "center",
  },
  budgetRemainingText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
