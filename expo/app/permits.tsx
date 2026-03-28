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
} from "react-native";
import { router, Stack } from "expo-router";
import { ChevronLeft, Plus, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Permit, PermitStatus } from "@/types";

const statusColors: Record<PermitStatus, string> = {
  "not-required": Colors.light.muted,
  applying: Colors.light.primary,
  pending: Colors.light.warning,
  approved: Colors.light.success,
  denied: Colors.light.error,
  expired: Colors.light.error,
};

const statusIcons: Record<PermitStatus, any> = {
  "not-required": XCircle,
  applying: Clock,
  pending: AlertTriangle,
  approved: CheckCircle,
  denied: XCircle,
  expired: AlertTriangle,
};

export default function PermitsScreen() {
  const [permits, setPermits] = useState<Permit[]>([
    {
      id: "1",
      jobId: "5",
      propertyAddress: "555 Garden Drive, Austin, TX",
      permitType: "Building Permit",
      permitNumber: "BP-2025-8842",
      status: "approved",
      applicationDate: "2025-11-10",
      approvalDate: "2025-11-20",
      expiryDate: "2026-11-20",
      cost: 850,
      issuingAuthority: "City of Austin",
      inspections: [
        {
          id: "1",
          permitId: "1",
          type: "Foundation",
          scheduledDate: "2025-12-05",
          status: "scheduled",
          inspector: "John Martinez",
        },
      ],
    },
    {
      id: "2",
      jobId: "2",
      propertyAddress: "456 Pine Road, Austin, TX",
      permitType: "Electrical Permit",
      status: "pending",
      applicationDate: "2025-11-25",
      cost: 450,
      issuingAuthority: "City of Austin",
      inspections: [],
    },
    {
      id: "3",
      jobId: "4",
      propertyAddress: "234 Willow Way, Austin, TX",
      permitType: "Plumbing Permit",
      permitNumber: "PP-2025-4521",
      status: "approved",
      applicationDate: "2025-10-15",
      approvalDate: "2025-10-22",
      expiryDate: "2026-10-22",
      cost: 325,
      issuingAuthority: "Travis County",
      inspections: [
        {
          id: "1",
          permitId: "3",
          type: "Rough-in Inspection",
          scheduledDate: "2025-11-28",
          completedDate: "2025-11-28",
          status: "passed",
          inspector: "Sarah Williams",
        },
      ],
    },
  ]);
  const [showModal, setShowModal] = useState(false);

  const pendingPermits = permits.filter((p) => p.status === "pending" || p.status === "applying").length;
  const approvedPermits = permits.filter((p) => p.status === "approved").length;
  const totalCost = permits.reduce((sum, p) => sum + p.cost, 0);
  const upcomingInspections = permits
    .flatMap((p) => p.inspections)
    .filter((i) => i.status === "scheduled" && i.scheduledDate).length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Permits & Inspections",
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
          <Text style={styles.statValue}>{pendingPermits}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <CheckCircle color={Colors.light.success} size={20} />
          </View>
          <Text style={styles.statValue}>{approvedPermits}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <Calendar color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>{upcomingInspections}</Text>
          <Text style={styles.statLabel}>Inspections</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Permits</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {permits.map((permit) => {
            const StatusIcon = statusIcons[permit.status];
            const statusColor = statusColors[permit.status];

            return (
              <View key={permit.id} style={styles.permitCard}>
                <View style={styles.permitHeader}>
                  <View style={styles.permitHeaderLeft}>
                    <View style={[styles.permitIcon, { backgroundColor: statusColor + "20" }]}>
                      <FileText color={statusColor} size={24} />
                    </View>
                    <View>
                      <Text style={styles.permitType}>{permit.permitType}</Text>
                      {permit.permitNumber && (
                        <Text style={styles.permitNumber}>{permit.permitNumber}</Text>
                      )}
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    <StatusIcon color={statusColor} size={14} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{permit.status}</Text>
                  </View>
                </View>

                <Text style={styles.propertyAddress}>{permit.propertyAddress}</Text>

                <View style={styles.permitDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Authority:</Text>
                    <Text style={styles.detailValue}>{permit.issuingAuthority}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Applied:</Text>
                    <Text style={styles.detailValue}>
                      {permit.applicationDate ? new Date(permit.applicationDate).toLocaleDateString() : "N/A"}
                    </Text>
                  </View>
                  {permit.approvalDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Approved:</Text>
                      <Text style={styles.detailValue}>{new Date(permit.approvalDate).toLocaleDateString()}</Text>
                    </View>
                  )}
                  {permit.expiryDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Expires:</Text>
                      <Text style={styles.detailValue}>{new Date(permit.expiryDate).toLocaleDateString()}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cost:</Text>
                    <Text style={styles.detailValue}>${permit.cost.toLocaleString()}</Text>
                  </View>
                </View>

                {permit.inspections.length > 0 && (
                  <View style={styles.inspectionsSection}>
                    <Text style={styles.inspectionsSectionTitle}>Inspections</Text>
                    {permit.inspections.map((inspection) => (
                      <View key={inspection.id} style={styles.inspectionItem}>
                        <View style={styles.inspectionLeft}>
                          <Text style={styles.inspectionType}>{inspection.type}</Text>
                          {inspection.scheduledDate && (
                            <Text style={styles.inspectionDate}>
                              {new Date(inspection.scheduledDate).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                        <View
                          style={[
                            styles.inspectionStatusBadge,
                            {
                              backgroundColor:
                                inspection.status === "passed"
                                  ? Colors.light.success + "20"
                                  : inspection.status === "failed"
                                  ? Colors.light.error + "20"
                                  : Colors.light.warning + "20",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.inspectionStatusText,
                              {
                                color:
                                  inspection.status === "passed"
                                    ? Colors.light.success
                                    : inspection.status === "failed"
                                    ? Colors.light.error
                                    : Colors.light.warning,
                              },
                            ]}
                          >
                            {inspection.status}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Permit</Text>

            <Text style={styles.label}>Permit Type</Text>
            <TextInput style={styles.input} placeholder="e.g., Building, Electrical, Plumbing" />

            <Text style={styles.label}>Property Address</Text>
            <TextInput style={styles.input} placeholder="Select from jobs..." />

            <Text style={styles.label}>Issuing Authority</Text>
            <TextInput style={styles.input} placeholder="e.g., City of Austin" />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Application Date</Text>
                <TextInput style={styles.input} placeholder="MM/DD/YYYY" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Cost</Text>
                <TextInput style={styles.input} placeholder="$0" keyboardType="numeric" />
              </View>
            </View>

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
                <Text style={styles.saveButtonText}>Add Permit</Text>
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
  permitCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  permitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  permitHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  permitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  permitType: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  permitNumber: {
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
  propertyAddress: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 12,
  },
  permitDetails: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  inspectionsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  inspectionsSectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  inspectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  inspectionLeft: {
    flex: 1,
  },
  inspectionType: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  inspectionDate: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  inspectionStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inspectionStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "capitalize",
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
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
