import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  X,
  ChevronRight,
  User,
  Wrench,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import type { PhoneIntakeLead } from "@/types";

type LeadStatusFilter = "all" | "new" | "contacted" | "scheduled" | "converted";

export default function PhoneIntakeDashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatusFilter>("all");
  const [selectedLead, setSelectedLead] = useState<PhoneIntakeLead | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const phoneIntakesQuery = trpc.aiIntake.getAllPhoneIntakes.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  
  const utils = trpc.useUtils();
  
  const updateStatusMutation = trpc.aiIntake.updatePhoneIntakeStatus.useMutation({
    onSuccess: () => {
      utils.aiIntake.getAllPhoneIntakes.invalidate();
      Alert.alert("Success", "Lead status updated");
      setShowDetailModal(false);
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await phoneIntakesQuery.refetch();
    setRefreshing(false);
  };

  const leads = phoneIntakesQuery.data || [];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || lead.lead_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "#FF9500";
      case "contacted":
        return "#007AFF";
      case "qualified":
        return "#5856D6";
      case "scheduled":
        return "#34C759";
      case "converted":
        return "#30D158";
      case "lost":
        return "#FF3B30";
      default:
        return "#999";
    }
  };

  const getTradeIcon = (trade: string) => {
    return <Wrench size={18} color="#fff" />;
  };

  const handleLeadPress = (lead: PhoneIntakeLead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (newStatus: PhoneIntakeLead["lead_status"]) => {
    if (!selectedLead) return;

    updateStatusMutation.mutate({
      leadId: selectedLead.id,
      status: newStatus,
    });
  };

  const handleConvertToEstimate = () => {
    if (!selectedLead) return;
    Alert.alert("Convert to Estimate", "This will create a new estimate from this lead.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Convert",
        onPress: () => {
          router.push("/estimates" as any);
          setShowDetailModal(false);
        },
      },
    ]);
  };

  const handleConvertToJob = () => {
    if (!selectedLead) return;
    Alert.alert("Convert to Job", "This will create a new job from this lead.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Convert",
        onPress: () => {
          router.push("/schedule" as any);
          setShowDetailModal(false);
        },
      },
    ]);
  };

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.lead_status === "new").length,
    scheduled: leads.filter((l) => l.lead_status === "scheduled").length,
    converted: leads.filter((l) => l.lead_status === "converted").length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Phone Intake Leads",
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" as const },
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Phone size={20} color="#007AFF" />
          <Text style={styles.statValue}>{stats.totalLeads}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <AlertCircle size={20} color="#FF9500" />
          <Text style={styles.statValue}>{stats.newLeads}</Text>
          <Text style={styles.statLabel}>New</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={20} color="#34C759" />
          <Text style={styles.statValue}>{stats.scheduled}</Text>
          <Text style={styles.statLabel}>Scheduled</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle2 size={20} color="#30D158" />
          <Text style={styles.statValue}>{stats.converted}</Text>
          <Text style={styles.statLabel}>Converted</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, or address"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(["all", "new", "contacted", "scheduled", "converted"] as LeadStatusFilter[]).map(
            (filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  statusFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => setStatusFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    statusFilter === filter && styles.filterButtonTextActive,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyState}>
            <Phone size={48} color="#ccc" />
            <Text style={styles.emptyText}>No phone intake leads found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "Try adjusting your search" : "New leads will appear here"}
            </Text>
          </View>
        ) : (
          filteredLeads.map((lead) => (
            <TouchableOpacity
              key={lead.id}
              style={styles.leadCard}
              onPress={() => handleLeadPress(lead)}
            >
              <View style={styles.leadHeader}>
                <View style={styles.leadTitleRow}>
                  <View
                    style={[
                      styles.tradeBadge,
                      {
                        backgroundColor:
                          lead.trade_type === "landscaping"
                            ? "#34C759"
                            : lead.trade_type === "roofing"
                            ? "#FF9500"
                            : "#007AFF",
                      },
                    ]}
                  >
                    {getTradeIcon(lead.trade_type)}
                    <Text style={styles.tradeText}>
                      {lead.trade_type.toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(lead.lead_status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {lead.lead_status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.leadInfo}>
                <User size={16} color="#666" />
                <Text style={styles.leadName}>{lead.contact.full_name}</Text>
              </View>

              <View style={styles.leadInfo}>
                <Phone size={16} color="#666" />
                <Text style={styles.leadText}>{lead.contact.phone}</Text>
              </View>

              <View style={styles.leadInfo}>
                <MapPin size={16} color="#666" />
                <Text style={styles.leadText} numberOfLines={1}>
                  {lead.property.address}
                  {lead.property.city && `, ${lead.property.city}`}
                  {lead.property.state && `, ${lead.property.state}`}
                </Text>
              </View>

              <View style={styles.leadSummary}>
                <MessageSquare size={14} color="#999" />
                <Text style={styles.summaryText} numberOfLines={2}>
                  {lead.job_summary}
                </Text>
              </View>

              {lead.photos_requested && (
                <View style={styles.photoTag}>
                  <ImageIcon size={12} color="#007AFF" />
                  <Text style={styles.photoTagText}>Photos Requested</Text>
                </View>
              )}

              {lead.appointment?.is_scheduled && (
                <View style={styles.appointmentTag}>
                  <Clock size={12} color="#34C759" />
                  <Text style={styles.appointmentTagText}>
                    Scheduled: {new Date(lead.appointment.date).toLocaleDateString()}{" "}
                    {lead.appointment.time_window}
                  </Text>
                </View>
              )}

              <View style={styles.leadFooter}>
                <Text style={styles.timestamp}>
                  {new Date(lead.created_date).toLocaleDateString()} at{" "}
                  {new Date(lead.created_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <ChevronRight size={20} color="#007AFF" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lead Details</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedLead && (
              <>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Contact Information</Text>
                  <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Name</Text>
                      <Text style={styles.detailValue}>
                        {selectedLead.contact.full_name}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailValue}>
                        {selectedLead.contact.phone}
                      </Text>
                    </View>
                    {selectedLead.contact.email && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Email</Text>
                        <Text style={styles.detailValue}>
                          {selectedLead.contact.email}
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Preferred Contact</Text>
                      <Text style={styles.detailValue}>
                        {selectedLead.contact.preferred_contact}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Property Information</Text>
                  <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailValue}>
                        {selectedLead.property.address}
                      </Text>
                    </View>
                    {selectedLead.property.city && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>City</Text>
                        <Text style={styles.detailValue}>
                          {selectedLead.property.city}
                        </Text>
                      </View>
                    )}
                    {selectedLead.property.state && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>State</Text>
                        <Text style={styles.detailValue}>
                          {selectedLead.property.state}
                        </Text>
                      </View>
                    )}
                    {selectedLead.property.zip && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ZIP</Text>
                        <Text style={styles.detailValue}>
                          {selectedLead.property.zip}
                        </Text>
                      </View>
                    )}
                    {selectedLead.property.property_type && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Property Type</Text>
                        <Text style={styles.detailValue}>
                          {selectedLead.property.property_type}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Job Summary</Text>
                  <View style={styles.detailCard}>
                    <Text style={styles.jobSummaryText}>
                      {selectedLead.job_summary}
                    </Text>
                  </View>
                </View>

                {selectedLead.trade_specific_fields && Object.keys(selectedLead.trade_specific_fields).length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      {selectedLead.trade_type.charAt(0).toUpperCase() + selectedLead.trade_type.slice(1).replace(/_/g, ' ')} Details
                    </Text>
                    <View style={styles.detailCard}>
                      {Object.entries(selectedLead.trade_specific_fields).map(([key, value]) => {
                        if (!value) return null;
                        const label = key
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ');
                        return (
                          <View key={key} style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{label}</Text>
                            <Text style={styles.detailValue}>
                              {typeof value === 'object' ? JSON.stringify(value) : value}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {selectedLead.notes_for_admin && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Admin Notes</Text>
                    <View style={styles.detailCard}>
                      <Text style={styles.notesText}>
                        {selectedLead.notes_for_admin}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.actionSection}>
                  <Text style={styles.detailSectionTitle}>Actions</Text>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUpdateStatus("contacted")}
                  >
                    <Text style={styles.actionButtonText}>Mark as Contacted</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUpdateStatus("scheduled")}
                  >
                    <Text style={styles.actionButtonText}>Mark as Scheduled</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryActionButton]}
                    onPress={handleConvertToEstimate}
                  >
                    <Text style={styles.primaryActionButtonText}>Convert to Estimate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryActionButton]}
                    onPress={handleConvertToJob}
                  >
                    <Text style={styles.primaryActionButtonText}>Convert to Job</Text>
                  </TouchableOpacity>
                </View>
              </>
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
    backgroundColor: "#F5F7FA",
  },
  statsContainer: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#333",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  leadCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  leadHeader: {
    marginBottom: 12,
  },
  leadTitleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  tradeBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tradeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600" as const,
  },
  leadInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  leadName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#333",
  },
  leadText: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },
  leadSummary: {
    flexDirection: "row" as const,
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    flex: 1,
  },
  photoTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 8,
    alignSelf: "flex-start" as const,
  },
  photoTagText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500" as const,
  },
  appointmentTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 8,
    alignSelf: "flex-start" as const,
  },
  appointmentTagText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500" as const,
  },
  leadFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 12,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500" as const,
  },
  jobSummaryText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  notesText: {
    fontSize: 15,
    color: "#FF9500",
    lineHeight: 22,
    fontWeight: "500" as const,
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
  primaryActionButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  primaryActionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
