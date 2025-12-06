import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Send,
  Download,
  Eye,
  FileEdit,
  Save,
  Trash2,
  X,
  Calendar,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { mockInvoices } from "@/mocks/invoices";
import { Invoice } from "@/types";

type InvoiceFilter = "all" | "sent" | "paid" | "overdue";

export default function InvoicesScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<InvoiceFilter>("all");

  const invoices = useMemo(() => mockInvoices, []);

  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    if (selectedFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === selectedFilter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((inv) =>
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });
  }, [invoices, selectedFilter, searchQuery]);

  const stats = useMemo(() => {
    const paid = invoices.filter((inv) => inv.status === "paid");
    const pending = invoices.filter((inv) => inv.status === "sent");
    const overdue = invoices.filter((inv) => inv.status === "overdue");

    const paidAmount = paid.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = pending.reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = overdue.reduce((sum, inv) => sum + inv.amount, 0);

    return {
      paid: { count: paid.length, amount: paidAmount },
      pending: { count: pending.length, amount: pendingAmount },
      overdue: { count: overdue.length, amount: overdueAmount },
    };
  }, [invoices]);

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return Colors.light.success;
      case "sent":
        return Colors.light.info;
      case "overdue":
        return Colors.light.error;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle color={Colors.light.success} size={16} />;
      case "sent":
        return <Send color={Colors.light.info} size={16} />;
      case "overdue":
        return <AlertCircle color={Colors.light.error} size={16} />;
      default:
        return <Clock color={Colors.light.textSecondary} size={16} />;
    }
  };

  const handleSendReminder = (invoice: Invoice) => {
    Alert.alert(
      "Send Reminder",
      `Send payment reminder to ${invoice.clientName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            console.log("[Invoice] Sending reminder for:", invoice.id);
            Alert.alert("Success", "Payment reminder sent successfully");
          },
        },
      ]
    );
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    amount: "",
    dueDate: "",
    items: "",
    notes: "",
  });
  const [drafts, setDrafts] = useState<any[]>([]);

  const handleViewInvoice = (invoice: Invoice) => {
    console.log("[Invoice] Viewing invoice:", invoice.id);
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.amount) {
      Alert.alert("Missing Information", "Please enter client name and amount");
      return;
    }
    console.log("[Invoice] Creating invoice:", newInvoice);
    Alert.alert("Success", "Invoice created and sent to client");
    setShowCreateModal(false);
    setNewInvoice({
      clientName: "",
      amount: "",
      dueDate: "",
      items: "",
      notes: "",
    });
  };

  const handleSaveDraft = () => {
    if (!newInvoice.clientName) {
      Alert.alert("Missing Information", "Please enter at least a client name");
      return;
    }
    const draft = { ...newInvoice, id: Date.now().toString(), savedAt: new Date().toISOString() };
    setDrafts([...drafts, draft]);
    console.log("[Invoice] Draft saved:", draft);
    Alert.alert("Draft Saved", "Invoice draft saved successfully");
    setShowCreateModal(false);
    setNewInvoice({
      clientName: "",
      amount: "",
      dueDate: "",
      items: "",
      notes: "",
    });
  };

  const handleEditDraft = (draft: any) => {
    setNewInvoice({
      clientName: draft.clientName,
      amount: draft.amount,
      dueDate: draft.dueDate,
      items: draft.items,
      notes: draft.notes,
    });
    setDrafts(drafts.filter(d => d.id !== draft.id));
    setShowCreateModal(true);
    setShowDraftModal(false);
  };

  const handleDeleteDraft = (draftId: string) => {
    Alert.alert(
      "Delete Draft",
      "Are you sure you want to delete this draft?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDrafts(drafts.filter(d => d.id !== draftId));
            Alert.alert("Deleted", "Draft deleted successfully");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Invoices</Text>
            <Text style={styles.headerSubtitle}>Create & manage invoices</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {drafts.length > 0 && (
              <TouchableOpacity 
                style={styles.draftsButton}
                onPress={() => setShowDraftModal(true)}
              >
                <FileEdit color={Colors.light.primary} size={18} />
                <Text style={styles.draftsCount}>{drafts.length}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: Colors.light.success }]}>
            <View style={styles.statIcon}>
              <CheckCircle color={Colors.light.success} size={20} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Paid</Text>
              <Text style={[styles.statValue, { color: Colors.light.success }]}>
                ${stats.paid.amount.toLocaleString()}
              </Text>
              <Text style={styles.statCount}>{stats.paid.count} invoices</Text>
            </View>
          </View>

          <View style={[styles.statCard, { borderLeftColor: Colors.light.info }]}>
            <View style={styles.statIcon}>
              <Clock color={Colors.light.info} size={20} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={[styles.statValue, { color: Colors.light.info }]}>
                ${stats.pending.amount.toLocaleString()}
              </Text>
              <Text style={styles.statCount}>{stats.pending.count} invoices</Text>
            </View>
          </View>

          <View style={[styles.statCard, { borderLeftColor: Colors.light.error }]}>
            <View style={styles.statIcon}>
              <AlertCircle color={Colors.light.error} size={20} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Overdue</Text>
              <Text style={[styles.statValue, { color: Colors.light.error }]}>
                ${stats.overdue.amount.toLocaleString()}
              </Text>
              <Text style={styles.statCount}>{stats.overdue.count} invoices</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color={Colors.light.textSecondary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search invoices..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          {(["all", "sent", "paid", "overdue"] as InvoiceFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.invoicesList}>
          {filteredInvoices.map((invoice) => (
            <TouchableOpacity
              key={invoice.id}
              style={styles.invoiceCard}
              onPress={() => handleViewInvoice(invoice)}
              activeOpacity={0.7}
            >
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceClient}>
                  <Text style={styles.invoiceClientName}>{invoice.clientName}</Text>
                  <Text style={styles.invoiceId}>#{invoice.id}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(invoice.status) + "20" },
                  ]}
                >
                  {getStatusIcon(invoice.status)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(invoice.status) },
                    ]}
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.invoiceDetails}>
                <View style={styles.invoiceDetailRow}>
                  <Text style={styles.invoiceDetailLabel}>Amount:</Text>
                  <Text style={styles.invoiceAmount}>
                    ${invoice.amount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.invoiceDetailRow}>
                  <Text style={styles.invoiceDetailLabel}>Created:</Text>
                  <Text style={styles.invoiceDetailValue}>
                    {new Date(invoice.createdDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.invoiceDetailRow}>
                  <Text style={styles.invoiceDetailLabel}>Due:</Text>
                  <Text
                    style={[
                      styles.invoiceDetailValue,
                      invoice.status === "overdue" && { color: Colors.light.error },
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

              {invoice.status === "sent" || invoice.status === "overdue" ? (
                <View style={styles.invoiceActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewInvoice(invoice)}
                  >
                    <Eye color={Colors.light.primary} size={16} />
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleSendReminder(invoice)}
                  >
                    <Send color="#fff" size={16} />
                    <Text style={styles.actionButtonTextWhite}>Remind</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Download color={Colors.light.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.invoiceActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewInvoice(invoice)}
                  >
                    <Eye color={Colors.light.primary} size={16} />
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Download color={Colors.light.textSecondary} size={16} />
                    <Text style={styles.actionButtonText}>Download</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {filteredInvoices.length === 0 && (
          <View style={styles.emptyState}>
            <DollarSign color={Colors.light.textSecondary} size={48} />
            <Text style={styles.emptyStateText}>No invoices found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first invoice to get started"}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Invoice</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Client Name *</Text>
              <TextInput
                style={styles.input}
                value={newInvoice.clientName}
                onChangeText={(text) => setNewInvoice({ ...newInvoice, clientName: text })}
                placeholder="Enter client name"
                placeholderTextColor={Colors.light.textSecondary}
              />

              <Text style={styles.label}>Amount *</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.inputField}
                  value={newInvoice.amount}
                  onChangeText={(text) => setNewInvoice({ ...newInvoice, amount: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <Text style={styles.label}>Due Date</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.inputField}
                  value={newInvoice.dueDate}
                  onChangeText={(text) => setNewInvoice({ ...newInvoice, dueDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <Text style={styles.label}>Line Items</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newInvoice.items}
                onChangeText={(text) => setNewInvoice({ ...newInvoice, items: text })}
                placeholder="Labor, Materials, etc. (one per line)"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newInvoice.notes}
                onChangeText={(text) => setNewInvoice({ ...newInvoice, notes: text })}
                placeholder="Additional notes or payment terms"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.draftButton}
              onPress={handleSaveDraft}
            >
              <Save size={18} color={Colors.light.primary} />
              <Text style={styles.draftButtonText}>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateInvoice}
            >
              <Text style={styles.createButtonText}>Create & Send</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showDraftModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDraftModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invoice Drafts</Text>
            <TouchableOpacity onPress={() => setShowDraftModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {drafts.map((draft) => (
              <View key={draft.id} style={styles.draftCard}>
                <View style={styles.draftHeader}>
                  <Text style={styles.draftClient}>{draft.clientName}</Text>
                  {draft.amount && (
                    <Text style={styles.draftAmount}>${draft.amount}</Text>
                  )}
                </View>
                <Text style={styles.draftDate}>
                  Saved {new Date(draft.savedAt).toLocaleDateString()}
                </Text>
                <View style={styles.draftActions}>
                  <TouchableOpacity
                    style={styles.draftActionButton}
                    onPress={() => handleEditDraft(draft)}
                  >
                    <FileEdit size={16} color={Colors.light.primary} />
                    <Text style={styles.draftActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.draftActionButton}
                    onPress={() => handleDeleteDraft(draft.id)}
                  >
                    <Trash2 size={16} color={Colors.light.error} />
                    <Text style={[styles.draftActionText, { color: Colors.light.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {drafts.length === 0 && (
              <View style={styles.emptyDrafts}>
                <FileEdit size={48} color={Colors.light.textSecondary} />
                <Text style={styles.emptyDraftsText}>No drafts saved</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 4,
  },
  statIcon: {
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 2,
  },
  statCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  invoicesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  invoiceCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  invoiceClient: {
    flex: 1,
  },
  invoiceClientName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  invoiceId: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  invoiceDetails: {
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  invoiceDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceDetailLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  invoiceDetailValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  invoiceActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  actionButtonTextWhite: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  draftsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    position: "relative" as const,
  },
  draftsCount: {
    position: "absolute" as const,
    top: -4,
    right: -4,
    backgroundColor: Colors.light.error,
    color: "#fff",
    fontSize: 10,
    fontWeight: "700" as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: "center" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formSection: {
    gap: 16,
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: -8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
  modalFooter: {
    flexDirection: "row" as const,
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  draftButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  draftCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  draftHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  draftClient: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  draftAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  draftDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  draftActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  draftActionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  draftActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  emptyDrafts: {
    alignItems: "center" as const,
    paddingVertical: 60,
  },
  emptyDraftsText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
});
