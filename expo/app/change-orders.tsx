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
import { router, Stack } from "expo-router";
import { ChevronLeft, Plus, FileText, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react-native";
import Colors from "@/constants/colors";
import { ChangeOrder } from "@/types";

export default function ChangeOrdersScreen() {
  const [orders, setOrders] = useState<ChangeOrder[]>([
    {
      id: "1",
      jobId: "2",
      clientId: "4",
      clientName: "Johnson Backyard",
      orderNumber: 1,
      description: "Add decorative stone border around garden bed",
      reason: "Client requested additional feature during walkthrough",
      lineItems: [
        { id: "1", name: "Decorative Stone", quantity: 15, unit: "bags", rate: 12, amount: 180 },
        { id: "2", name: "Labor - Stone Installation", quantity: 4, unit: "hours", rate: 75, amount: 300 },
      ],
      subtotal: 480,
      total: 480,
      status: "approved",
      createdDate: "2025-11-26",
      approvedDate: "2025-11-26",
    },
    {
      id: "2",
      jobId: "5",
      clientId: "2",
      clientName: "Lopez Estate",
      orderNumber: 1,
      description: "Upgrade to premium sod variety",
      reason: "Client wants higher quality grass",
      lineItems: [
        { id: "1", name: "Premium Sod Upgrade", quantity: 2000, unit: "sqft", rate: 0.25, amount: 500 },
      ],
      subtotal: 500,
      total: 500,
      status: "pending",
      createdDate: "2025-11-27",
    },
  ]);
  const [showModal, setShowModal] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const approvedOrders = orders.filter((o) => o.status === "approved").length;
  const totalValue = orders.filter((o) => o.status === "approved").reduce((sum, o) => sum + o.total, 0);

  const getStatusColor = (status: ChangeOrder["status"]) => {
    switch (status) {
      case "approved":
        return Colors.light.success;
      case "pending":
        return Colors.light.warning;
      case "declined":
        return Colors.light.error;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusIcon = (status: ChangeOrder["status"]) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "pending":
        return Clock;
      case "declined":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Change Orders",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.warning + "20" }]}>
            <Clock color={Colors.light.warning} size={20} />
          </View>
          <Text style={styles.statValue}>{pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <CheckCircle color={Colors.light.success} size={20} />
          </View>
          <Text style={styles.statValue}>{approvedOrders}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <DollarSign color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>${(totalValue / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Change Orders</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const statusColor = getStatusColor(order.status);

            return (
              <TouchableOpacity key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <View style={[styles.orderIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                      <FileText color={Colors.light.primary} size={20} />
                    </View>
                    <View>
                      <Text style={styles.orderNumber}>CO-{order.orderNumber}</Text>
                      <Text style={styles.clientName}>{order.clientName}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    <StatusIcon color={statusColor} size={14} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
                  </View>
                </View>

                <Text style={styles.orderDescription}>{order.description}</Text>

                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonLabel}>Reason:</Text>
                  <Text style={styles.reasonText}>{order.reason}</Text>
                </View>

                <View style={styles.lineItemsContainer}>
                  {order.lineItems.map((item) => (
                    <View key={item.id} style={styles.lineItem}>
                      <Text style={styles.lineItemName}>{item.name}</Text>
                      <View style={styles.lineItemDetails}>
                        <Text style={styles.lineItemQty}>
                          {item.quantity} {item.unit}
                        </Text>
                        <Text style={styles.lineItemAmount}>${item.amount.toLocaleString()}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.orderDate}>
                    <Text style={styles.orderDateLabel}>Created:</Text>
                    <Text style={styles.orderDateValue}>{new Date(order.createdDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalLabel}>Total:</Text>
                    <Text style={styles.orderTotalValue}>${order.total.toLocaleString()}</Text>
                  </View>
                </View>

                {order.approvedDate && (
                  <View style={styles.approvalInfo}>
                    <CheckCircle color={Colors.light.success} size={14} />
                    <Text style={styles.approvalText}>Approved on {new Date(order.approvedDate).toLocaleDateString()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Change Order</Text>

            <Text style={styles.label}>Client / Job</Text>
            <TextInput style={styles.input} placeholder="Select job..." />

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={2} placeholder="What work needs to be added or changed?" />

            <Text style={styles.label}>Reason for Change</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={2} placeholder="Why is this change necessary?" />

            <Text style={styles.label}>Line Items</Text>
            <View style={styles.lineItemInput}>
              <TextInput style={[styles.input, { flex: 2 }]} placeholder="Item name" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Qty" keyboardType="numeric" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Rate" keyboardType="numeric" />
            </View>
            <TouchableOpacity style={styles.addLineButton}>
              <Plus color={Colors.light.primary} size={16} />
              <Text style={styles.addLineText}>Add Line Item</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>Create Order</Text>
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
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  orderCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  clientName: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  orderDescription: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  reasonContainer: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  lineItemsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  lineItem: {
    marginBottom: 8,
  },
  lineItemName: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  lineItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lineItemQty: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  lineItemAmount: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  orderDate: {
    gap: 4,
  },
  orderDateLabel: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  orderDateValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  orderTotal: {
    alignItems: "flex-end",
    gap: 4,
  },
  orderTotalLabel: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  orderTotalValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  approvalInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  approvalText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: "500" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
    minHeight: 70,
    textAlignVertical: "top",
  },
  lineItemInput: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  addLineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
    marginBottom: 24,
  },
  addLineText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500" as const,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
