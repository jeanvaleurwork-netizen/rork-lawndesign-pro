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
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Download,
  Plus,
  X,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { Invoice } from "@/types";

const mockInvoices: Invoice[] = [
  {
    id: "INV-00121",
    jobId: "1",
    clientId: "1",
    clientName: "Smith Residence",
    amount: 4536,
    status: "paid",
    dueDate: "2025-12-05",
    createdDate: "2025-11-25",
  },
  {
    id: "INV-00122",
    jobId: "2",
    clientId: "2",
    clientName: "Johnson Backyard",
    amount: 6210,
    status: "sent",
    dueDate: "2025-12-10",
    createdDate: "2025-11-26",
  },
  {
    id: "INV-00123",
    jobId: "3",
    clientId: "3",
    clientName: "Lee Patio Project",
    amount: 10125,
    status: "overdue",
    dueDate: "2025-11-20",
    createdDate: "2025-11-10",
  },
  {
    id: "INV-00124",
    jobId: "4",
    clientId: "4",
    clientName: "Martinez Property",
    amount: 3080,
    status: "sent",
    dueDate: "2025-12-15",
    createdDate: "2025-11-28",
  },
];

export default function InvoicesPaymentsScreen() {
  const [selectedTab, setSelectedTab] = useState<"invoices" | "payments">("invoices");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    amount: "",
    dueDate: "",
  });

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return Colors.light.success;
      case "sent":
        return Colors.light.primary;
      case "overdue":
        return Colors.light.error;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusBgColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "#D1FAE5";
      case "sent":
        return "#EBF5FF";
      case "overdue":
        return "#FEE2E2";
      default:
        return "#F3F4F6";
    }
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle color={Colors.light.success} size={18} />;
      case "sent":
        return <Clock color={Colors.light.primary} size={18} />;
      case "overdue":
        return <AlertCircle color={Colors.light.error} size={18} />;
      default:
        return null;
    }
  };

  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleCreateInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.amount || !newInvoice.dueDate) {
      return;
    }

    const invoice: Invoice = {
      id: `INV-${String(invoices.length + 121).padStart(5, "0")}`,
      jobId: String(invoices.length + 1),
      clientId: String(invoices.length + 1),
      clientName: newInvoice.clientName,
      amount: parseFloat(newInvoice.amount),
      status: "sent",
      dueDate: newInvoice.dueDate,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setInvoices([invoice, ...invoices]);
    setShowCreateModal(false);
    setNewInvoice({ clientName: "", amount: "", dueDate: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Invoices & Payments",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus color="#FFF" size={20} />
            <Text style={styles.createButtonText}>Create New Invoice</Text>
          </TouchableOpacity>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <DollarSign color={Colors.light.success} size={20} />
              </View>
              <Text style={styles.statValue}>
                ${paidAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Paid</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock color={Colors.light.primary} size={20} />
              </View>
              <Text style={styles.statValue}>
                ${pendingAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AlertCircle color={Colors.light.error} size={20} />
              </View>
              <Text style={styles.statValue}>
                ${overdueAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "invoices" && styles.tabActive]}
              onPress={() => setSelectedTab("invoices")}
            >
              <Text
                style={[styles.tabText, selectedTab === "invoices" && styles.tabTextActive]}
              >
                Invoices
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "payments" && styles.tabActive]}
              onPress={() => setSelectedTab("payments")}
            >
              <Text
                style={[styles.tabText, selectedTab === "payments" && styles.tabTextActive]}
              >
                Payment History
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === "invoices" ? (
            <View style={styles.section}>
              {invoices.map((invoice) => (
                <TouchableOpacity key={invoice.id} style={styles.invoiceCard}>
                  <View style={styles.invoiceHeader}>
                    <View style={styles.invoiceHeaderLeft}>
                      <View style={styles.invoiceIconContainer}>
                        <FileText color={Colors.light.primary} size={20} />
                      </View>
                      <View style={styles.invoiceInfo}>
                        <Text style={styles.invoiceNumber}>{invoice.id}</Text>
                        <Text style={styles.clientName}>{invoice.clientName}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBgColor(invoice.status) },
                      ]}
                    >
                      {getStatusIcon(invoice.status)}
                      <Text
                        style={[styles.statusText, { color: getStatusColor(invoice.status) }]}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.invoiceBody}>
                    <View style={styles.invoiceRow}>
                      <Text style={styles.invoiceLabel}>Amount</Text>
                      <Text style={styles.invoiceAmount}>
                        ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Text>
                    </View>

                    <View style={styles.invoiceRow}>
                      <View style={styles.dateContainer}>
                        <Calendar color={Colors.light.muted} size={14} />
                        <Text style={styles.dateLabel}>Due Date</Text>
                      </View>
                      <Text
                        style={[
                          styles.dateValue,
                          invoice.status === "overdue" && styles.overdueDate,
                        ]}
                      >
                        {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.invoiceActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Send color={Colors.light.primary} size={16} />
                      <Text style={styles.actionButtonText}>Send</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                      <Download color={Colors.light.primary} size={16} />
                      <Text style={styles.actionButtonText}>Download</Text>
                    </TouchableOpacity>

                    {invoice.status !== "paid" && (
                      <TouchableOpacity style={styles.collectButton}>
                        <Text style={styles.collectButtonText}>Collect Payment</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentIconContainer}>
                    <CheckCircle color={Colors.light.success} size={20} />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentAmount}>$4,536.00</Text>
                    <Text style={styles.paymentClient}>Smith Residence</Text>
                  </View>
                </View>
                <View style={styles.paymentFooter}>
                  <Text style={styles.paymentDate}>Nov 25, 2025</Text>
                  <View style={styles.paymentMethodBadge}>
                    <Text style={styles.paymentMethodText}>Credit Card</Text>
                  </View>
                </View>
              </View>

              <View style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentIconContainer}>
                    <CheckCircle color={Colors.light.success} size={20} />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentAmount}>$2,850.00</Text>
                    <Text style={styles.paymentClient}>Martinez Property</Text>
                  </View>
                </View>
                <View style={styles.paymentFooter}>
                  <Text style={styles.paymentDate}>Nov 18, 2025</Text>
                  <View style={styles.paymentMethodBadge}>
                    <Text style={styles.paymentMethodText}>ACH Transfer</Text>
                  </View>
                </View>
              </View>

              <View style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentIconContainer}>
                    <CheckCircle color={Colors.light.success} size={20} />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentAmount}>$5,750.00</Text>
                    <Text style={styles.paymentClient}>Johnson Backyard</Text>
                  </View>
                </View>
                <View style={styles.paymentFooter}>
                  <Text style={styles.paymentDate}>Nov 15, 2025</Text>
                  <View style={styles.paymentMethodBadge}>
                    <Text style={styles.paymentMethodText}>Check</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Invoice</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter client name"
                placeholderTextColor={Colors.light.muted}
                value={newInvoice.clientName}
                onChangeText={(text) => setNewInvoice({ ...newInvoice, clientName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={Colors.light.muted}
                keyboardType="decimal-pad"
                value={newInvoice.amount}
                onChangeText={(text) => setNewInvoice({ ...newInvoice, amount: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Due Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.light.muted}
                value={newInvoice.dueDate}
                onChangeText={(text) => setNewInvoice({ ...newInvoice, dueDate: text })}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreateInvoice}
              >
                <Text style={styles.modalCreateButtonText}>Create Invoice</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
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
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  tabTextActive: {
    color: "#FFF",
  },
  section: {
    marginBottom: 20,
  },
  invoiceCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  invoiceHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  invoiceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  invoiceBody: {
    marginBottom: 16,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  invoiceLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  invoiceAmount: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  overdueDate: {
    color: Colors.light.error,
    fontWeight: "600" as const,
  },
  invoiceActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "500" as const,
  },
  collectButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  collectButtonText: {
    fontSize: 13,
    color: "#FFF",
    fontWeight: "600" as const,
  },
  paymentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentClient: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  paymentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentDate: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  paymentMethodBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  modalCreateButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 10,
  },
  modalCreateButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
