import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  UserPlus,
  Settings,
  Crown,
  Shield,
  ClipboardList,
  CreditCard,
  Package,
  Edit,
  Plus,
  BarChart3,
  FileCheck,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "crew";
  title: string;
  status: "active" | "inactive";
  permissions: string[];
};

type EstimateForReview = {
  id: string;
  clientName: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  date: string;
};

export default function AdminDashboardScreen() {
  const { session } = useAuth();
  const { jobs, estimates } = useData();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showEstimateReviewModal, setShowEstimateReviewModal] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateForReview | null>(null);

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john@company.com",
      role: "manager",
      title: "Operations Manager",
      status: "active",
      permissions: ["create_jobs", "schedule_crews", "send_estimates", "send_invoices"],
    },
    {
      id: "2",
      name: "Mike Johnson",
      email: "mike@company.com",
      role: "crew",
      title: "Crew Lead",
      status: "active",
      permissions: ["view_schedule", "upload_photos", "add_notes", "clock_in"],
    },
    {
      id: "3",
      name: "Sarah Wilson",
      email: "sarah@company.com",
      role: "crew",
      title: "Technician",
      status: "active",
      permissions: ["view_schedule", "upload_photos", "add_notes"],
    },
  ]);

  const [pendingEstimates] = useState<EstimateForReview[]>([
    {
      id: "1",
      clientName: "Johnson Residence",
      amount: 4500,
      status: "pending",
      date: "2024-01-15",
    },
    {
      id: "2",
      clientName: "Smith Property",
      amount: 8900,
      status: "pending",
      date: "2024-01-16",
    },
  ]);

  const totalRevenue = estimates
    .filter((e) => e.status === "approved")
    .reduce((sum, est) => sum + est.total, 0);

  const totalCosts = jobs.reduce((sum, job) => sum + (job.actualCost || 0), 0);
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

  const activeCrews = teamMembers.filter((m) => m.role === "crew" && m.status === "active").length;
  const activeManagers = teamMembers.filter((m) => m.role === "manager" && m.status === "active").length;

  const handleApproveEstimate = (estimateId: string) => {
    Alert.alert("Estimate Approved", "The estimate has been approved and sent to the client.");
    setShowEstimateReviewModal(false);
  };

  const handleRejectEstimate = (estimateId: string) => {
    Alert.alert("Estimate Rejected", "The estimate has been rejected.");
    setShowEstimateReviewModal(false);
  };

  if (session?.user.role !== "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Admin Dashboard",
            headerStyle: { backgroundColor: Colors.light.card },
          }}
        />
        <View style={styles.restrictedContainer}>
          <Crown color={Colors.light.warning} size={64} />
          <Text style={styles.restrictedTitle}>Admin Access Only</Text>
          <Text style={styles.restrictedText}>
            This dashboard is only accessible to business owners and administrators.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Admin Control Center",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.adminBadge}>
            <Crown color={Colors.light.warning} size={20} />
            <Text style={styles.adminBadgeText}>Administrator</Text>
          </View>
          <Text style={styles.welcomeText}>Full Business Control</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Dashboard</Text>
          
          <View style={styles.financialGrid}>
            <View style={[styles.financialCard, { backgroundColor: "#10B981" }]}>
              <DollarSign color="#FFF" size={24} />
              <Text style={styles.financialValue}>${totalRevenue.toLocaleString()}</Text>
              <Text style={styles.financialLabel}>Total Revenue</Text>
            </View>

            <View style={[styles.financialCard, { backgroundColor: Colors.light.primary }]}>
              <TrendingUp color="#FFF" size={24} />
              <Text style={styles.financialValue}>{profitMargin.toFixed(1)}%</Text>
              <Text style={styles.financialLabel}>Profit Margin</Text>
            </View>

            <View style={[styles.financialCard, { backgroundColor: "#F59E0B" }]}>
              <FileText color="#FFF" size={24} />
              <Text style={styles.financialValue}>{estimates.length}</Text>
              <Text style={styles.financialLabel}>Total Estimates</Text>
            </View>

            <View style={[styles.financialCard, { backgroundColor: "#8B5CF6" }]}>
              <DollarSign color="#FFF" size={24} />
              <Text style={styles.financialValue}>${totalCosts.toLocaleString()}</Text>
              <Text style={styles.financialLabel}>Total Costs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estimates Pending Approval</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingEstimates.length}</Text>
            </View>
          </View>

          {pendingEstimates.map((estimate) => (
            <TouchableOpacity
              key={estimate.id}
              style={styles.estimateCard}
              onPress={() => {
                setSelectedEstimate(estimate);
                setShowEstimateReviewModal(true);
              }}
            >
              <View style={styles.estimateInfo}>
                <Text style={styles.estimateClient}>{estimate.clientName}</Text>
                <Text style={styles.estimateAmount}>${estimate.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.estimateActions}>
                <TouchableOpacity
                  style={[styles.estimateButton, styles.approveButton]}
                  onPress={() => handleApproveEstimate(estimate.id)}
                >
                  <CheckCircle color="#FFF" size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.estimateButton, styles.rejectButton]}
                  onPress={() => handleRejectEstimate(estimate.id)}
                >
                  <XCircle color="#FFF" size={18} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Management</Text>
            <TouchableOpacity onPress={() => setShowTeamModal(true)}>
              <UserPlus color={Colors.light.primary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.teamStatsRow}>
            <View style={styles.teamStatCard}>
              <Shield color={Colors.light.primary} size={20} />
              <Text style={styles.teamStatValue}>{activeManagers}</Text>
              <Text style={styles.teamStatLabel}>Managers</Text>
            </View>
            <View style={styles.teamStatCard}>
              <Users color={Colors.light.success} size={20} />
              <Text style={styles.teamStatValue}>{activeCrews}</Text>
              <Text style={styles.teamStatLabel}>Crew Members</Text>
            </View>
            <View style={styles.teamStatCard}>
              <ClipboardList color={Colors.light.warning} size={20} />
              <Text style={styles.teamStatValue}>{teamMembers.length}</Text>
              <Text style={styles.teamStatLabel}>Total Team</Text>
            </View>
          </View>

          {teamMembers.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberTitle}>{member.title}</Text>
                <View style={styles.memberRoleBadge}>
                  <Text style={styles.memberRoleText}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.memberActionButton}>
                <Edit color={Colors.light.muted} size={18} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Controls</Text>

          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push("/crew-management")}
          >
            <View style={[styles.controlIcon, { backgroundColor: "#EBF5FF" }]}>
              <Users color={Colors.light.primary} size={24} />
            </View>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Manage Crews</Text>
              <Text style={styles.controlDesc}>Assign jobs, create schedules, track time</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlCard}>
            <View style={[styles.controlIcon, { backgroundColor: "#FEF3C7" }]}>
              <Shield color={Colors.light.warning} size={24} />
            </View>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Roles & Permissions</Text>
              <Text style={styles.controlDesc}>Create roles, set permissions</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push("/business-settings")}
          >
            <View style={[styles.controlIcon, { backgroundColor: "#D1FAE5" }]}>
              <Settings color={Colors.light.success} size={24} />
            </View>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Business Settings</Text>
              <Text style={styles.controlDesc}>Company info, branding, integrations</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push("/contracts")}
          >
            <View style={[styles.controlIcon, { backgroundColor: "#E0E7FF" }]}>
              <FileCheck color="#6366F1" size={24} />
            </View>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Contract Templates</Text>
              <Text style={styles.controlDesc}>Edit insurance verbiage, terms</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push("/analytics")}
          >
            <View style={[styles.controlIcon, { backgroundColor: "#F3E8FF" }]}>
              <BarChart3 color="#A855F7" size={24} />
            </View>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Analytics & Reports</Text>
              <Text style={styles.controlDesc}>Revenue, profit, performance metrics</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push("/subscription")}
          >
            <View style={[styles.controlIcon, { backgroundColor: "#FEE2E2" }]}>
              <CreditCard color="#EF4444" size={24} />
            </View>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Subscription & Billing</Text>
              <Text style={styles.controlDesc}>Manage plan, payment methods</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlCard}>
            <View style={[styles.controlIcon, { backgroundColor: "#DBEAFE" }]}>
              <Package color="#3B82F6" size={24} />
            </View>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Checklist Templates</Text>
              <Text style={styles.controlDesc}>Create trade-specific checklists</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New estimate created for Johnson Residence</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={[styles.activityDot, { backgroundColor: Colors.light.success }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Job completed: Smith Property Roofing</Text>
              <Text style={styles.activityTime}>4 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={[styles.activityDot, { backgroundColor: Colors.light.warning }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New crew member added: Mike Johnson</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEstimateReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEstimateReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Estimate</Text>
              <TouchableOpacity onPress={() => setShowEstimateReviewModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedEstimate && (
              <View style={styles.modalBody}>
                <View style={styles.estimateDetailRow}>
                  <Text style={styles.estimateDetailLabel}>Client</Text>
                  <Text style={styles.estimateDetailValue}>{selectedEstimate.clientName}</Text>
                </View>
                <View style={styles.estimateDetailRow}>
                  <Text style={styles.estimateDetailLabel}>Amount</Text>
                  <Text style={[styles.estimateDetailValue, { color: Colors.light.primary }]}>
                    ${selectedEstimate.amount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.estimateDetailRow}>
                  <Text style={styles.estimateDetailLabel}>Date</Text>
                  <Text style={styles.estimateDetailValue}>{selectedEstimate.date}</Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalApproveButton]}
                    onPress={() => handleApproveEstimate(selectedEstimate.id)}
                  >
                    <CheckCircle color="#FFF" size={20} />
                    <Text style={styles.modalButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalRejectButton]}
                    onPress={() => handleRejectEstimate(selectedEstimate.id)}
                  >
                    <XCircle color="#FFF" size={20} />
                    <Text style={styles.modalButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTeamModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Team Member</Text>
              <TouchableOpacity onPress={() => setShowTeamModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.roleOptions}>
                  <TouchableOpacity style={styles.roleOption}>
                    <Text style={styles.roleOptionText}>Manager</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.roleOption, styles.roleOptionSelected]}>
                    <Text style={styles.roleOptionTextSelected}>Crew</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Crew Lead, Technician, etc."
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <TouchableOpacity style={styles.addButton}>
                <Plus color="#FFF" size={20} />
                <Text style={styles.addButtonText}>Add Team Member</Text>
              </TouchableOpacity>
            </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  adminBadgeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
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
    marginBottom: 16,
  },
  badge: {
    backgroundColor: Colors.light.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  financialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  financialCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  financialValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFF",
    marginTop: 12,
  },
  financialLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  estimateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  estimateInfo: {
    flex: 1,
  },
  estimateClient: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  estimateAmount: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  estimateActions: {
    flexDirection: "row",
    gap: 8,
  },
  estimateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  approveButton: {
    backgroundColor: Colors.light.success,
  },
  rejectButton: {
    backgroundColor: Colors.light.error,
  },
  teamStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  teamStatCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  teamStatValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginVertical: 8,
  },
  teamStatLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  memberTitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 6,
  },
  memberRoleBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  memberRoleText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  memberActionButton: {
    padding: 8,
  },
  controlCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  controlIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  controlInfo: {
    flex: 1,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  controlDesc: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
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
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  modalClose: {
    fontSize: 28,
    color: Colors.light.muted,
    fontWeight: "300" as const,
  },
  modalBody: {
    padding: 20,
  },
  estimateDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  estimateDetailLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  estimateDetailValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  modalApproveButton: {
    backgroundColor: Colors.light.success,
  },
  modalRejectButton: {
    backgroundColor: Colors.light.error,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  roleOptions: {
    flexDirection: "row",
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    alignItems: "center",
  },
  roleOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  roleOptionTextSelected: {
    color: "#FFF",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
