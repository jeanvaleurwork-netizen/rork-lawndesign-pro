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
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import { Clock, Plus, Calendar, X } from "lucide-react-native";

import Colors from "@/constants/colors";

import { AnimatedButton } from "@/components/AnimatedButton";

interface TimeCard {
  id: string;
  date: string;
  regularHours: number;
  overtimeHours: number;
  notes?: string;
  status: "draft" | "submitted" | "approved" | "paid";
}

export default function CrewTimecardsScreen() {

  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [regularHours, setRegularHours] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [notes, setNotes] = useState("");

  const [timeCards, setTimeCards] = useState<TimeCard[]>([
    {
      id: "1",
      date: new Date().toISOString().split("T")[0],
      regularHours: 8,
      overtimeHours: 0,
      notes: "Job site: 123 Main St",
      status: "submitted",
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      regularHours: 8,
      overtimeHours: 2,
      notes: "Job site: 456 Oak Ave",
      status: "approved",
    },
  ]);

  const totalRegularHours = timeCards.reduce((sum, card) => sum + card.regularHours, 0);
  const totalOvertimeHours = timeCards.reduce((sum, card) => sum + card.overtimeHours, 0);
  const totalHours = totalRegularHours + totalOvertimeHours;

  const handleAddTimeCard = () => {
    const newCard: TimeCard = {
      id: Date.now().toString(),
      date,
      regularHours: parseFloat(regularHours) || 0,
      overtimeHours: parseFloat(overtimeHours) || 0,
      notes,
      status: "draft",
    };

    setTimeCards([newCard, ...timeCards]);
    setShowAddModal(false);
    setRegularHours("");
    setOvertimeHours("");
    setNotes("");
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getStatusColor = (status: TimeCard["status"]) => {
    switch (status) {
      case "draft":
        return Colors.light.muted;
      case "submitted":
        return Colors.light.warning;
      case "approved":
        return Colors.light.primary;
      case "paid":
        return Colors.light.success;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusLabel = (status: TimeCard["status"]) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "submitted":
        return "Submitted";
      case "approved":
        return "Approved";
      case "paid":
        return "Paid";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Time Cards</Text>
          <Text style={styles.subtitle}>Track your hours</Text>
        </View>
        <AnimatedButton style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus color="#FFF" size={24} />
        </AnimatedButton>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>This Pay Period</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalHours.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Total Hours</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalRegularHours.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Regular</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalOvertimeHours.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Overtime</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Entries</Text>

          {timeCards.length === 0 && (
            <View style={styles.emptyState}>
              <Clock color={Colors.light.muted} size={64} strokeWidth={1} />
              <Text style={styles.emptyText}>No time cards yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your hours</Text>
            </View>
          )}

          {timeCards.map((card) => (
            <View key={card.id} style={styles.timeCard}>
              <View style={styles.timeCardHeader}>
                <View style={styles.timeCardDate}>
                  <Calendar color={Colors.light.primary} size={18} />
                  <Text style={styles.timeCardDateText}>
                    {new Date(card.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(card.status)}15` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(card.status) }]}>
                    {getStatusLabel(card.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.hoursRow}>
                <View style={styles.hoursItem}>
                  <Text style={styles.hoursValue}>{card.regularHours.toFixed(1)}</Text>
                  <Text style={styles.hoursLabel}>Regular Hours</Text>
                </View>
                {card.overtimeHours > 0 && (
                  <View style={styles.hoursItem}>
                    <Text style={styles.hoursValue}>{card.overtimeHours.toFixed(1)}</Text>
                    <Text style={styles.hoursLabel}>Overtime</Text>
                  </View>
                )}
              </View>

              {card.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{card.notes}</Text>
                </View>
              )}
            </View>
          ))}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Time Card</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X color={Colors.light.muted} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Regular Hours</Text>
                  <TextInput
                    style={styles.input}
                    value={regularHours}
                    onChangeText={setRegularHours}
                    placeholder="8.0"
                    placeholderTextColor={Colors.light.muted}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Overtime Hours</Text>
                  <TextInput
                    style={styles.input}
                    value={overtimeHours}
                    onChangeText={setOvertimeHours}
                    placeholder="0.0"
                    placeholderTextColor={Colors.light.muted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add job site or notes..."
                  placeholderTextColor={Colors.light.muted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddTimeCard}>
                <Text style={styles.saveButtonText}>Add Time Card</Text>
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
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timeCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeCardDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeCardDateText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
  hoursRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  hoursItem: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 12,
  },
  hoursValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  hoursLabel: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  notesContainer: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
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
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
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
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
