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
import { Stack } from "expo-router";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Send,
  CheckCircle,
  Clock,
  X,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { Contract } from "@/types";

const mockContracts: Contract[] = [
  {
    id: "C-001",
    clientId: "1",
    clientName: "John Smith",
    contractType: "project",
    scopeOfWork: "Complete lawn installation and landscaping for residential property",
    terms: ["50% deposit required before starting work", "Final payment due upon completion"],
    exclusions: ["Tree removal", "Underground utility work"],
    warranties: ["1-year warranty on sod installation", "6-month warranty on plantings"],
    disclaimers: ["Weather delays may affect completion timeline"],
    totalAmount: 5500,
    paymentSchedule: [
      { id: "p1", description: "Deposit (50%)", amount: 2750, dueDate: "2025-12-01", status: "paid" },
      { id: "p2", description: "Final Payment", amount: 2750, dueDate: "2025-12-15", status: "pending" },
    ],
    startDate: "2025-12-01",
    completionDate: "2025-12-15",
    status: "active",
  },
];

export default function ContractsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [contracts] = useState<Contract[]>(mockContracts);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter((contract) =>
    contract.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Contract["status"]) => {
    switch (status) {
      case "draft":
        return Colors.light.muted;
      case "sent":
        return Colors.light.primary;
      case "signed":
      case "active":
        return Colors.light.success;
      case "completed":
        return Colors.light.muted;
      case "cancelled":
        return Colors.light.error;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusBg = (status: Contract["status"]) => {
    switch (status) {
      case "draft":
        return Colors.light.background;
      case "sent":
        return "#EBF5FF";
      case "signed":
      case "active":
        return "#D1FAE5";
      case "completed":
        return Colors.light.background;
      case "cancelled":
        return "#FEE2E2";
      default:
        return Colors.light.background;
    }
  };

  const handleViewContract = (contract: Contract) => {
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
          <Text style={styles.subtitle}>{contracts.length} total contracts</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
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
                {contract.contractType.charAt(0).toUpperCase() + contract.contractType.slice(1)} Contract
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
                  {new Date(contract.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
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

                  <Text style={styles.detailLabel}>Scope of Work:</Text>
                  <Text style={styles.detailValue}>{selectedContract.scopeOfWork}</Text>

                  <Text style={styles.detailLabel}>Terms:</Text>
                  {selectedContract.terms.map((term, index) => (
                    <Text key={index} style={styles.bulletPoint}>
                      • {term}
                    </Text>
                  ))}

                  <Text style={styles.detailLabel}>Exclusions:</Text>
                  {selectedContract.exclusions.map((exclusion, index) => (
                    <Text key={index} style={styles.bulletPoint}>
                      • {exclusion}
                    </Text>
                  ))}

                  <Text style={styles.detailLabel}>Warranties:</Text>
                  {selectedContract.warranties.map((warranty, index) => (
                    <Text key={index} style={styles.bulletPoint}>
                      • {warranty}
                    </Text>
                  ))}

                  <Text style={styles.detailLabel}>Payment Schedule:</Text>
                  {selectedContract.paymentSchedule.map((payment) => (
                    <View key={payment.id} style={styles.paymentRow}>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentDescription}>{payment.description}</Text>
                        <Text style={styles.paymentDue}>
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.paymentAmount}>${payment.amount.toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionButton}>
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
});
