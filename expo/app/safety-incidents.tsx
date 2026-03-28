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
import { ChevronLeft, AlertOctagon, AlertTriangle, CheckCircle, FileText, Plus } from "lucide-react-native";
import Colors from "@/constants/colors";
import { SafetyIncident, IncidentSeverity } from "@/types";

const severityColors: Record<IncidentSeverity, string> = {
  minor: Colors.light.success,
  moderate: Colors.light.warning,
  serious: Colors.light.error,
  critical: "#9333EA",
};

export default function SafetyIncidentsScreen() {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([
    {
      id: "1",
      jobId: "2",
      date: "2025-11-15",
      time: "14:30",
      location: "456 Pine Road, Austin, TX",
      severity: "minor",
      type: "Minor Cut",
      description: "Worker sustained small cut on hand while handling materials",
      injuredPerson: "Mike Chen",
      medicalAttention: true,
      hospitalName: "First Aid On-Site",
      oshaReportable: false,
      correctiveActions: ["Reminded crew about proper glove usage", "Reviewed material handling procedures"],
      reportedBy: "John Smith - Team Lead",
      reportedDate: "2025-11-15",
      status: "resolved",
    },
    {
      id: "2",
      jobId: "5",
      date: "2025-10-28",
      time: "10:15",
      location: "555 Garden Drive, Austin, TX",
      severity: "moderate",
      type: "Equipment Incident",
      description: "Skid steer nearly tipped on uneven terrain",
      medicalAttention: false,
      oshaReportable: false,
      rootCause: "Operator misjudged ground stability",
      correctiveActions: [
        "Additional safety training for equipment operators",
        "Site assessment protocol updated",
        "Ground stability checks before operation",
      ],
      reportedBy: "Sarah Williams - Supervisor",
      reportedDate: "2025-10-28",
      status: "closed",
    },
  ]);
  const [showModal, setShowModal] = useState(false);

  const openIncidents = incidents.filter(i => i.status === "reported" || i.status === "investigating").length;
  const oshaReportable = incidents.filter(i => i.oshaReportable).length;
  const ytdIncidents = incidents.length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Safety & OSHA",
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
            <AlertTriangle color={Colors.light.warning} size={20} />
          </View>
          <Text style={styles.statValue}>{openIncidents}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.error + "20" }]}>
            <FileText color={Colors.light.error} size={20} />
          </View>
          <Text style={styles.statValue}>{oshaReportable}</Text>
          <Text style={styles.statLabel}>OSHA</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <AlertOctagon color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>{ytdIncidents}</Text>
          <Text style={styles.statLabel}>YTD Total</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety Incidents</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {incidents.map((incident) => {
            const severityColor = severityColors[incident.severity];

            return (
              <View key={incident.id} style={styles.incidentCard}>
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentHeaderLeft}>
                    <View style={[styles.severityIndicator, { backgroundColor: severityColor }]} />
                    <View>
                      <Text style={styles.incidentType}>{incident.type}</Text>
                      <Text style={styles.incidentDate}>
                        {new Date(incident.date).toLocaleDateString()} at {incident.time}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: severityColor + "20" }]}>
                    <Text style={[styles.severityText, { color: severityColor }]}>{incident.severity}</Text>
                  </View>
                </View>

                <Text style={styles.incidentLocation}>{incident.location}</Text>
                <Text style={styles.incidentDescription}>{incident.description}</Text>

                {incident.injuredPerson && (
                  <View style={styles.injuredInfo}>
                    <AlertTriangle color={Colors.light.error} size={16} />
                    <Text style={styles.injuredText}>Injured: {incident.injuredPerson}</Text>
                  </View>
                )}

                <View style={styles.incidentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Medical Attention:</Text>
                    <Text style={styles.detailValue}>{incident.medicalAttention ? "Yes" : "No"}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>OSHA Reportable:</Text>
                    <Text style={[styles.detailValue, incident.oshaReportable && { color: Colors.light.error, fontWeight: "600" as const }]}>
                      {incident.oshaReportable ? "YES" : "No"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: incident.status === "closed" || incident.status === "resolved" ? Colors.light.success : Colors.light.warning }
                    ]}>
                      {incident.status}
                    </Text>
                  </View>
                </View>

                {incident.correctiveActions.length > 0 && (
                  <View style={styles.actionsSection}>
                    <Text style={styles.actionsTitle}>Corrective Actions:</Text>
                    {incident.correctiveActions.map((action, idx) => (
                      <View key={idx} style={styles.actionItem}>
                        <CheckCircle color={Colors.light.success} size={14} />
                        <Text style={styles.actionText}>{action}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.reportedBy}>Reported by {incident.reportedBy}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Safety Incident</Text>

            <Text style={styles.label}>Incident Type</Text>
            <TextInput style={styles.input} placeholder="e.g., Minor Cut, Fall, Equipment" />

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={3} placeholder="Describe what happened..." />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Date</Text>
                <TextInput style={styles.input} placeholder="MM/DD/YYYY" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Time</Text>
                <TextInput style={styles.input} placeholder="HH:MM" />
              </View>
            </View>

            <Text style={styles.label}>Severity Level</Text>
            <View style={styles.severityOptions}>
              {(["minor", "moderate", "serious", "critical"] as IncidentSeverity[]).map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[styles.severityOption, { backgroundColor: severityColors[sev] + "20" }]}
                >
                  <Text style={[styles.severityOptionText, { color: severityColors[sev] }]}>{sev}</Text>
                </TouchableOpacity>
              ))}
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
                <Text style={styles.saveButtonText}>Report Incident</Text>
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
  incidentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  incidentHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  severityIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
  },
  incidentType: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  incidentDate: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  incidentLocation: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  incidentDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  injuredInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.error + "10",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  injuredText: {
    fontSize: 13,
    color: Colors.light.error,
    fontWeight: "500" as const,
  },
  incidentDetails: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
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
    textTransform: "capitalize",
  },
  actionsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginBottom: 12,
  },
  actionsTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 12,
    color: Colors.light.text,
    lineHeight: 18,
    flex: 1,
  },
  reportedBy: {
    fontSize: 11,
    color: Colors.light.muted,
    fontStyle: "italic",
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  severityOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  severityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  severityOptionText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize",
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
