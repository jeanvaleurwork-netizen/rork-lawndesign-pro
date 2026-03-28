import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  Plus,
  Package,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

interface MaterialApproval {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  itemName: string;
  brand?: string;
  colorFinish?: string;
  modelNumber?: string;
  quantity?: string;
  notes?: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  approvedAt?: string;
  createdAt: string;
}

export default function MaterialApprovalsScreen() {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "declined">("all");

  const mockApprovals: MaterialApproval[] = [
    {
      id: "MA-001",
      projectId: "P-001",
      projectName: "Smith Roof Replacement",
      clientName: "John Smith",
      itemName: "Architectural Shingles",
      brand: "CertainTeed",
      colorFinish: "Weathered Wood",
      modelNumber: "CT-123-WW",
      quantity: "25 squares",
      notes: "High-quality, 30-year warranty",
      status: "PENDING",
      createdAt: "2025-12-01T00:00:00Z",
    },
    {
      id: "MA-002",
      projectId: "P-002",
      projectName: "Johnson Backyard",
      clientName: "Sarah Johnson",
      itemName: "Paver Stones",
      brand: "Belgard",
      colorFinish: "Charcoal Gray",
      modelNumber: "BG-456",
      quantity: "800 sq ft",
      status: "APPROVED",
      approvedAt: "2025-12-05T00:00:00Z",
      createdAt: "2025-12-03T00:00:00Z",
    },
  ];

  const [approvals, setApprovals] = useState<MaterialApproval[]>(mockApprovals);

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      approval.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" || approval.status.toLowerCase() === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#f59e0b";
      case "APPROVED":
        return Colors.light.success;
      case "DECLINED":
        return Colors.light.error;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return Clock;
      case "APPROVED":
        return CheckCircle;
      case "DECLINED":
        return XCircle;
      default:
        return Clock;
    }
  };

  const sendApprovalRequest = (approvalId: string) => {
    Alert.alert(
      "Send Approval Request",
      "Send this material selection to the client for approval?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Alert.alert("Success", "Approval request sent to client");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Material Approvals",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
          headerRight: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/material-approval-form" as any)}
            >
              <Plus color={Colors.light.primary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color={Colors.light.muted} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.muted}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === "pending" && styles.filterChipActive]}
            onPress={() => setFilter("pending")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "pending" && styles.filterTextActive,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === "approved" && styles.filterChipActive]}
            onPress={() => setFilter("approved")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "approved" && styles.filterTextActive,
              ]}
            >
              Approved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === "declined" && styles.filterChipActive]}
            onPress={() => setFilter("declined")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "declined" && styles.filterTextActive,
              ]}
            >
              Declined
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          {filteredApprovals.map((approval) => {
            const StatusIcon = getStatusIcon(approval.status);
            return (
              <View key={approval.id} style={styles.approvalCard}>
                <View style={styles.cardHeader}>
                  <Package size={24} color={Colors.light.primary} />
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(approval.status) + "20" },
                    ]}
                  >
                    <StatusIcon size={14} color={getStatusColor(approval.status)} />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(approval.status) },
                      ]}
                    >
                      {approval.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.projectName}>{approval.projectName}</Text>
                <Text style={styles.clientName}>{approval.clientName}</Text>

                <View style={styles.divider} />

                <View style={styles.materialDetails}>
                  <Text style={styles.detailLabel}>Material:</Text>
                  <Text style={styles.detailValue}>{approval.itemName}</Text>

                  {approval.brand && (
                    <>
                      <Text style={styles.detailLabel}>Brand:</Text>
                      <Text style={styles.detailValue}>{approval.brand}</Text>
                    </>
                  )}

                  {approval.colorFinish && (
                    <>
                      <Text style={styles.detailLabel}>Color/Finish:</Text>
                      <Text style={styles.detailValue}>{approval.colorFinish}</Text>
                    </>
                  )}

                  {approval.modelNumber && (
                    <>
                      <Text style={styles.detailLabel}>Model #:</Text>
                      <Text style={styles.detailValue}>{approval.modelNumber}</Text>
                    </>
                  )}

                  {approval.quantity && (
                    <>
                      <Text style={styles.detailLabel}>Quantity:</Text>
                      <Text style={styles.detailValue}>{approval.quantity}</Text>
                    </>
                  )}

                  {approval.notes && (
                    <>
                      <Text style={styles.detailLabel}>Notes:</Text>
                      <Text style={styles.detailValue}>{approval.notes}</Text>
                    </>
                  )}
                </View>

                {approval.status === "PENDING" && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => sendApprovalRequest(approval.id)}
                  >
                    <Send size={18} color="#fff" />
                    <Text style={styles.sendButtonText}>Send for Approval</Text>
                  </TouchableOpacity>
                )}

                {approval.approvedAt && (
                  <Text style={styles.approvedText}>
                    Approved: {new Date(approval.approvedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            );
          })}

          {filteredApprovals.length === 0 && (
            <View style={styles.emptyState}>
              <Package size={64} color="#ccc" />
              <Text style={styles.emptyText}>No material approvals found</Text>
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
  addButton: {
    marginRight: 16,
    padding: 4,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  approvalCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginBottom: 16,
  },
  materialDetails: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 8,
  },
  sendButton: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },
  approvedText: {
    fontSize: 13,
    color: Colors.light.success,
    marginTop: 12,
    fontWeight: "600" as const,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
});
