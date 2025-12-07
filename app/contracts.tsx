import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Send,
  Clock,
  X,
} from "lucide-react-native";

import Colors from "@/constants/colors";

import { Contract, ContractStatus } from '@/types';

type MockContract = Contract & {
  clientName: string;
};

const mockContracts: MockContract[] = [
  {
    id: "C-001",
    companyId: "1",
    clientId: "1",
    clientName: "John Smith",
    type: "PROJECT_CONTRACT",
    title: "Landscaping Project Contract",
    bodyHtml: "<h2>Contract Details</h2><p>Complete lawn installation and landscaping for residential property</p>",
    status: "SIGNED",
    totalAmount: 5500,
    startDateEstimated: "2025-12-01",
    endDateEstimated: "2025-12-15",
    createdByUserId: "1",
    createdAt: "2025-11-15T00:00:00Z",
    updatedAt: "2025-11-15T00:00:00Z",
  },
];

export default function ContractsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [contracts] = useState<MockContract[]>(mockContracts);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedContract, setSelectedContract] = useState<MockContract | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | ContractStatus>("all");

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case "DRAFT":
        return Colors.light.muted;
      case "SENT":
        return Colors.light.primary;
      case "SIGNED":
      case "VIEWED":
        return Colors.light.success;
      case "DECLINED":
        return Colors.light.muted;
      case "CANCELLED":
        return Colors.light.error;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusBg = (status: ContractStatus) => {
    switch (status) {
      case "DRAFT":
        return Colors.light.background;
      case "SENT":
        return "#EBF5FF";
      case "SIGNED":
      case "VIEWED":
        return "#D1FAE5";
      case "DECLINED":
        return Colors.light.background;
      case "CANCELLED":
        return "#FEE2E2";
      default:
        return Colors.light.background;
    }
  };

  const handleViewContract = (contract: MockContract) => {
    setSelectedContract(contract);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Contracts",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Contracts</Text>
          <Text style={styles.subtitle}>
            {filteredContracts.length} of {contracts.length} contracts
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("/contract-editor" as any)}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "all" && styles.filterChipActive]}
            onPress={() => setFilterStatus("all")}
          >
            <Text style={[styles.filterChipText, filterStatus === "all" && styles.filterChipTextActive]}>
              All ({contracts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "DRAFT" && styles.filterChipActive]}
            onPress={() => setFilterStatus("DRAFT")}
          >
            <Text style={[styles.filterChipText, filterStatus === "DRAFT" && styles.filterChipTextActive]}>
              Draft ({contracts.filter(c => c.status === "DRAFT").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "SENT" && styles.filterChipActive]}
            onPress={() => setFilterStatus("SENT")}
          >
            <Text style={[styles.filterChipText, filterStatus === "SENT" && styles.filterChipTextActive]}>
              Sent ({contracts.filter(c => c.status === "SENT").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "SIGNED" && styles.filterChipActive]}
            onPress={() => setFilterStatus("SIGNED")}
          >
            <Text style={[styles.filterChipText, filterStatus === "SIGNED" && styles.filterChipTextActive]}>
              Signed ({contracts.filter(c => c.status === "SIGNED").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "CANCELLED" && styles.filterChipActive]}
            onPress={() => setFilterStatus("CANCELLED")}
          >
            <Text style={[styles.filterChipText, filterStatus === "CANCELLED" && styles.filterChipTextActive]}>
              Cancelled ({contracts.filter(c => c.status === "CANCELLED").length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <Search color={Colors.light.muted} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contracts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.muted}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.contractsList}>
          {filteredContracts.map((contract) => (
            <TouchableOpacity
              key={contract.id}
              style={styles.contractCard}
              onPress={() => handleViewContract(contract)}
            >
              <View style={styles.cardHeader}>
                <FileText color={Colors.light.primary} size={24} />
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBg(contract.status) },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: getStatusColor(contract.status) }]}
                  >
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.contractId}>{contract.id}</Text>
              <Text style={styles.clientName}>{contract.clientName}</Text>
              <Text style={styles.contractType} numberOfLines={1}>
                {contract.type === "MSA" ? "Master Service Agreement" : contract.type === "PROJECT_CONTRACT" ? "Project Contract" : "Work Order"}
              </Text>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total Amount:</Text>
                <Text style={styles.amountValue}>
                  ${contract.totalAmount.toLocaleString()}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <Clock color={Colors.light.muted} size={14} />
                <Text style={styles.dateText}>
                  {contract.startDateEstimated
                    ? new Date(contract.startDateEstimated).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contract Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            {selectedContract && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalBody}>
                  <Text style={styles.detailLabel}>Client:</Text>
                  <Text style={styles.detailValue}>{selectedContract.clientName}</Text>

                  <Text style={styles.detailLabel}>Contract Type:</Text>
                  <Text style={styles.detailValue}>
                    {selectedContract.type === "MSA"
                      ? "Master Service Agreement"
                      : selectedContract.type === "PROJECT_CONTRACT"
                      ? "Project Contract"
                      : "Work Order"}
                  </Text>

                  <Text style={styles.detailLabel}>Total Amount:</Text>
                  <Text style={styles.detailValue}>
                    ${selectedContract.totalAmount.toLocaleString()}
                  </Text>

                  {selectedContract.startDateEstimated && (
                    <>
                      <Text style={styles.detailLabel}>Start Date:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedContract.startDateEstimated).toLocaleDateString()}
                      </Text>
                    </>
                  )}

                  {selectedContract.endDateEstimated && (
                    <>
                      <Text style={styles.detailLabel}>Estimated Completion:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedContract.endDateEstimated).toLocaleDateString()}
                      </Text>
                    </>
                  )}

                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>
                    {selectedContract.status.charAt(0) +
                      selectedContract.status.slice(1).toLowerCase()}
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  if (selectedContract) {
                    setModalVisible(false);
                    router.push(`/contract-editor?id=${selectedContract.id}` as any);
                  }
                }}
              >
                <Edit2 color={Colors.light.text} size={18} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Send color={Colors.light.primary} size={18} />
                <Text style={[styles.actionButtonText, { color: Colors.light.primary }]}>
                  Send for E-Signature
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  subtitle: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  contractsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contractCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
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
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  contractId: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  contractType: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.light.text,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalBody: {
    padding: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 20,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  paymentDue: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterScroll: {
    flexDirection: "row" as const,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: "#FFF",
  },
});
