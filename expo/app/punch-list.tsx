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
import { ChevronLeft, CheckSquare, Plus, AlertCircle, Circle, X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { PunchListItem } from "@/types";

const priorityColors = {
  low: Colors.light.success,
  medium: Colors.light.primary,
  high: Colors.light.warning,
  critical: Colors.light.error,
};

export default function PunchListScreen() {
  const [items, setItems] = useState<PunchListItem[]>([
    {
      id: "1",
      jobId: "5",
      description: "Touch up paint on front door trim",
      location: "Front Entry",
      category: "Painting",
      priority: "medium",
      status: "open",
      createdDate: "2025-11-25",
      clientReported: false,
    },
    {
      id: "2",
      jobId: "5",
      description: "Fix uneven paver stone in walkway",
      location: "Front Walkway",
      category: "Hardscape",
      priority: "high",
      assignedTo: "John Smith",
      status: "in-progress",
      createdDate: "2025-11-24",
      dueDate: "2025-12-01",
      clientReported: true,
    },
    {
      id: "3",
      jobId: "2",
      description: "Clean excess mortar from stone border",
      location: "Garden Bed",
      category: "Cleanup",
      priority: "low",
      assignedTo: "Mike Chen",
      status: "completed",
      createdDate: "2025-11-20",
      completedDate: "2025-11-27",
      clientReported: false,
    },
  ]);
  const [showModal, setShowModal] = useState(false);

  const openItems = items.filter(i => i.status === "open" || i.status === "in-progress").length;
  const highPriority = items.filter(i => (i.priority === "high" || i.priority === "critical") && i.status !== "completed").length;
  const clientReported = items.filter(i => i.clientReported && i.status !== "completed").length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Punch List",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <Circle color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>{openItems}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.error + "20" }]}>
            <AlertCircle color={Colors.light.error} size={20} />
          </View>
          <Text style={styles.statValue}>{highPriority}</Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.warning + "20" }]}>
            <CheckSquare color={Colors.light.warning} size={20} />
          </View>
          <Text style={styles.statValue}>{clientReported}</Text>
          <Text style={styles.statLabel}>Client Items</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Items</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {items.map((item) => {
            const priorityColor = priorityColors[item.priority];
            const isComplete = item.status === "completed";

            return (
              <View key={item.id} style={[styles.itemCard, isComplete && styles.completedCard]}>
                <View style={styles.itemHeader}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      isComplete && styles.checkboxCompleted,
                      { borderColor: priorityColor },
                    ]}
                  >
                    {isComplete && <CheckSquare color={Colors.light.success} size={20} />}
                  </TouchableOpacity>
                  <View style={styles.itemHeaderText}>
                    <Text style={[styles.itemDescription, isComplete && styles.completedText]}>
                      {item.description}
                    </Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.locationText}>{item.location}</Text>
                      <Text style={styles.dotSeparator}>•</Text>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor + "20" }]}>
                    <Text style={[styles.priorityText, { color: priorityColor }]}>{item.priority}</Text>
                  </View>
                </View>

                {item.assignedTo && (
                  <View style={styles.assignedInfo}>
                    <Text style={styles.assignedLabel}>Assigned to:</Text>
                    <Text style={styles.assignedName}>{item.assignedTo}</Text>
                  </View>
                )}

                {item.clientReported && (
                  <View style={styles.clientBadge}>
                    <AlertCircle color={Colors.light.warning} size={14} />
                    <Text style={styles.clientBadgeText}>Client Reported</Text>
                  </View>
                )}

                <View style={styles.itemFooter}>
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Created:</Text>
                    <Text style={styles.dateValue}>{new Date(item.createdDate).toLocaleDateString()}</Text>
                  </View>
                  {item.dueDate && !isComplete && (
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateLabel}>Due:</Text>
                      <Text style={[styles.dateValue, { color: Colors.light.error }]}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {item.completedDate && (
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateLabel}>Completed:</Text>
                      <Text style={[styles.dateValue, { color: Colors.light.success }]}>
                        {new Date(item.completedDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      item.status === "completed"
                        ? Colors.light.success + "20"
                        : item.status === "in-progress"
                        ? Colors.light.primary + "20"
                        : Colors.light.muted + "20",
                  },
                ]}>
                  <Text style={[
                    styles.statusText,
                    {
                      color:
                        item.status === "completed"
                          ? Colors.light.success
                          : item.status === "in-progress"
                          ? Colors.light.primary
                          : Colors.light.muted,
                    },
                  ]}>
                    {item.status === "in-progress" ? "In Progress" : item.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Punch List Item</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X color={Colors.light.muted} size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={2} placeholder="What needs to be fixed?" />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Location</Text>
                <TextInput style={styles.input} placeholder="e.g., Front Entry" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Category</Text>
                <TextInput style={styles.input} placeholder="e.g., Painting" />
              </View>
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityOptions}>
              {(["low", "medium", "high", "critical"] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[styles.priorityOption, { backgroundColor: priorityColors[priority] + "20" }]}
                >
                  <Text style={[styles.priorityOptionText, { color: priorityColors[priority] }]}>
                    {priority}
                  </Text>
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
                <Text style={styles.saveButtonText}>Add Item</Text>
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
  itemCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  completedCard: {
    opacity: 0.7,
  },
  itemHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: Colors.light.success + "20",
    borderColor: Colors.light.success,
  },
  itemHeaderText: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: Colors.light.muted,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  dotSeparator: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    height: 24,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  assignedInfo: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    paddingLeft: 36,
  },
  assignedLabel: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  assignedName: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  clientBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.warning + "20",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
    marginLeft: 36,
  },
  clientBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.warning,
  },
  itemFooter: {
    flexDirection: "row",
    gap: 16,
    paddingLeft: 36,
    marginBottom: 8,
  },
  dateInfo: {
    flexDirection: "row",
    gap: 4,
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  statusIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginLeft: 36,
  },
  statusText: {
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
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
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  priorityOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  priorityOptionText: {
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
