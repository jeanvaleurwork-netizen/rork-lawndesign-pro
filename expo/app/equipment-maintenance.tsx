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
import {
  ChevronLeft,
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { Equipment, EquipmentStatus, MaintenanceRecord } from "@/types";

const statusColors: Record<EquipmentStatus, string> = {
  available: Colors.light.success,
  "in-use": Colors.light.primary,
  maintenance: Colors.light.warning,
  broken: Colors.light.error,
  retired: Colors.light.muted,
};

export default function EquipmentMaintenanceScreen() {
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: "1",
      name: "Skid Steer Loader",
      type: "Heavy Equipment",
      serialNumber: "SS-2023-4521",
      purchaseDate: "2023-01-15",
      purchasePrice: 45000,
      currentValue: 38000,
      status: "in-use",
      assignedTo: "Team A",
      hoursUsed: 1240,
      lastMaintenanceDate: "2025-10-15",
      nextMaintenanceDate: "2025-12-15",
      maintenanceHistory: [
        {
          id: "1",
          date: "2025-10-15",
          type: "routine",
          description: "Oil change, filter replacement, hydraulic check",
          cost: 450,
          performedBy: "John's Equipment Service",
          nextServiceDue: "2025-12-15",
        },
      ],
    },
    {
      id: "2",
      name: "Concrete Mixer",
      type: "Equipment",
      purchaseDate: "2022-06-10",
      purchasePrice: 3200,
      currentValue: 2100,
      status: "maintenance",
      hoursUsed: 850,
      lastMaintenanceDate: "2025-11-20",
      nextMaintenanceDate: "2025-11-30",
      maintenanceHistory: [
        {
          id: "1",
          date: "2025-11-20",
          type: "repair",
          description: "Drum bearing replacement",
          cost: 380,
          performedBy: "Mike - In House",
          partsReplaced: ["Bearing assembly", "Belt"],
        },
      ],
    },
    {
      id: "3",
      name: "Commercial Mower",
      type: "Lawn Equipment",
      serialNumber: "CM-2024-8832",
      purchaseDate: "2024-03-01",
      purchasePrice: 8500,
      currentValue: 7200,
      status: "available",
      hoursUsed: 420,
      lastMaintenanceDate: "2025-11-01",
      nextMaintenanceDate: "2026-01-01",
      maintenanceHistory: [
        {
          id: "1",
          date: "2025-11-01",
          type: "routine",
          description: "Blade sharpening, oil change, air filter",
          cost: 120,
          performedBy: "Sarah - In House",
          nextServiceDue: "2026-01-01",
        },
      ],
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const needsMaintenance = equipment.filter((e) => {
    if (!e.nextMaintenanceDate) return false;
    const daysUntil = Math.ceil((new Date(e.nextMaintenanceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && e.status !== "maintenance";
  }).length;

  const totalValue = equipment.reduce((sum, e) => sum + e.currentValue, 0);
  const maintenanceCost = equipment.reduce(
    (sum, e) => sum + e.maintenanceHistory.reduce((s, m) => s + m.cost, 0),
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Equipment & Maintenance",
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
          <Text style={styles.statValue}>{needsMaintenance}</Text>
          <Text style={styles.statLabel}>Needs Service</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <DollarSign color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>${(totalValue / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.error + "20" }]}>
            <Wrench color={Colors.light.error} size={20} />
          </View>
          <Text style={styles.statValue}>${(maintenanceCost / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Maint. Cost</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Equipment Fleet</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {equipment.map((item) => {
            const statusColor = statusColors[item.status];
            const daysUntilService = item.nextMaintenanceDate
              ? Math.ceil((new Date(item.nextMaintenanceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.equipmentCard}
                onPress={() => setSelectedEquipment(item)}
              >
                <View style={styles.equipmentHeader}>
                  <View style={styles.equipmentHeaderLeft}>
                    <View style={[styles.equipmentIcon, { backgroundColor: statusColor + "20" }]}>
                      <Wrench color={statusColor} size={24} />
                    </View>
                    <View>
                      <Text style={styles.equipmentName}>{item.name}</Text>
                      <Text style={styles.equipmentType}>{item.type}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.equipmentDetails}>
                  {item.assignedTo && (
                    <View style={styles.detailRow}>
                      <MapPin color={Colors.light.muted} size={16} />
                      <Text style={styles.detailText}>Assigned: {item.assignedTo}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Clock color={Colors.light.muted} size={16} />
                    <Text style={styles.detailText}>{item.hoursUsed} hours used</Text>
                  </View>
                  {item.nextMaintenanceDate && (
                    <View style={styles.detailRow}>
                      <Calendar color={daysUntilService && daysUntilService <= 7 ? Colors.light.warning : Colors.light.muted} size={16} />
                      <Text style={[
                        styles.detailText,
                        daysUntilService && daysUntilService <= 7 && { color: Colors.light.warning, fontWeight: "600" },
                      ]}>
                        Service {daysUntilService && daysUntilService > 0 ? `in ${daysUntilService} days` : "overdue"}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.equipmentFooter}>
                  <View>
                    <Text style={styles.footerLabel}>Current Value</Text>
                    <Text style={styles.footerValue}>${item.currentValue.toLocaleString()}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.footerLabel}>Maintenance</Text>
                    <Text style={styles.footerValue}>
                      ${item.maintenanceHistory.reduce((s, m) => s + m.cost, 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={selectedEquipment !== null} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEquipment && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedEquipment.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedEquipment(null)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Equipment Info</Text>
                    {selectedEquipment.serialNumber && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Serial Number:</Text>
                        <Text style={styles.detailValue}>{selectedEquipment.serialNumber}</Text>
                      </View>
                    )}
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Purchase Date:</Text>
                      <Text style={styles.detailValue}>{new Date(selectedEquipment.purchaseDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Purchase Price:</Text>
                      <Text style={styles.detailValue}>${selectedEquipment.purchasePrice.toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Hours Used:</Text>
                      <Text style={styles.detailValue}>{selectedEquipment.hoursUsed} hours</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Maintenance History</Text>
                    {selectedEquipment.maintenanceHistory.map((record) => (
                      <View key={record.id} style={styles.maintenanceRecord}>
                        <View style={styles.recordHeader}>
                          <Text style={styles.recordDate}>{new Date(record.date).toLocaleDateString()}</Text>
                          <View style={[styles.recordTypeBadge, { backgroundColor: Colors.light.primary + "20" }]}>
                            <Text style={[styles.recordType, { color: Colors.light.primary }]}>{record.type}</Text>
                          </View>
                        </View>
                        <Text style={styles.recordDescription}>{record.description}</Text>
                        <View style={styles.recordFooter}>
                          <Text style={styles.recordPerformedBy}>By: {record.performedBy}</Text>
                          <Text style={styles.recordCost}>${record.cost.toLocaleString()}</Text>
                        </View>
                        {record.partsReplaced && record.partsReplaced.length > 0 && (
                          <View style={styles.partsContainer}>
                            <Text style={styles.partsLabel}>Parts:</Text>
                            {record.partsReplaced.map((part, idx) => (
                              <Text key={idx} style={styles.partItem}>• {part}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addMaintenanceButton}>
                      <Plus color={Colors.light.primary} size={18} />
                      <Text style={styles.addMaintenanceText}>Add Maintenance Record</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Equipment</Text>

            <Text style={styles.label}>Equipment Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Skid Steer Loader" />

            <Text style={styles.label}>Type</Text>
            <TextInput style={styles.input} placeholder="e.g., Heavy Equipment" />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Purchase Date</Text>
                <TextInput style={styles.input} placeholder="MM/DD/YYYY" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Purchase Price</Text>
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
                <Text style={styles.saveButtonText}>Add Equipment</Text>
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
    textAlign: "center",
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
  equipmentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  equipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  equipmentHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  equipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  equipmentType: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  equipmentDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  equipmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  footerLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  closeButton: {
    fontSize: 28,
    color: Colors.light.muted,
    padding: 4,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  maintenanceRecord: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  recordTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recordType: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  recordDescription: {
    fontSize: 13,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  recordFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordPerformedBy: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  recordCost: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.error,
  },
  partsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  partsLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  partItem: {
    fontSize: 12,
    color: Colors.light.text,
    marginLeft: 4,
  },
  addMaintenanceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
  },
  addMaintenanceText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500" as const,
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
