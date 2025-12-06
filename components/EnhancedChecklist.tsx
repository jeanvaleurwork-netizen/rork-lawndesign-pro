import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import {
  Plus,
  X,
  Square,
  CheckSquare,
  Edit2,
  Trash2,
  Flag,
  Calendar,
  Copy,
  ChevronDown,
  ClipboardList,
  Sparkles,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { ChecklistItem } from "@/types";
import { trpc } from "@/lib/trpc";

interface EnhancedChecklistProps {
  checklist: ChecklistItem[];
  onChecklistChange: (checklist: ChecklistItem[]) => void;
  crewMembers: string[];
  jobType?: string;
  jobDescription?: string;
}

const TASK_TEMPLATES = [
  {
    category: "Preparation",
    tasks: [
      "Prepare site and remove debris",
      "Check weather conditions",
      "Review safety protocols",
      "Set up equipment and tools",
    ],
  },
  {
    category: "Installation",
    tasks: [
      "Level ground and prepare surface",
      "Install materials as per plan",
      "Quality check during installation",
      "Document progress with photos",
    ],
  },
  {
    category: "Finishing",
    tasks: [
      "Apply finishing touches",
      "Clean up work area thoroughly",
      "Final inspection and quality check",
      "Client walkthrough and approval",
    ],
  },
];

export function EnhancedChecklist({
  checklist,
  onChecklistChange,
  crewMembers,
  jobType,
  jobDescription,
}: EnhancedChecklistProps) {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newTaskText, setNewTaskText] = useState<string>("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<ChecklistItem["priority"]>("medium");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);
  const [showTaskDatePicker, setShowTaskDatePicker] = useState<boolean>(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<ChecklistItem["priority"] | "all">("all");
  const [editingTask, setEditingTask] = useState<ChecklistItem | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState<boolean>(false);

  const checklistSuggestionsMutation = trpc.ai.checklistSuggestions.useMutation();

  const modalSlideAnim = useRef(new Animated.Value(500)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const taskScaleAnims = useRef<{[key: string]: Animated.Value}>({}).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(modalSlideAnim, {
        toValue: 500,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        setEditingTask(null);
        setNewTaskText("");
        setSelectedAssignee("");
        setSelectedPriority("medium");
        setSelectedCategory("");
        setTaskDueDate(undefined);
      }, 250);
    }
  }, [modalVisible, modalSlideAnim]);

  const filteredChecklist = React.useMemo(() => {
    if (filterPriority === "all") return checklist;
    return checklist.filter((item) => item.priority === filterPriority);
  }, [checklist, filterPriority]);

  const completedTasks = checklist.filter((item) => item.completed).length;
  const totalTasks = checklist.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [progress, progressAnim]);

  const getPriorityColor = (priority?: ChecklistItem["priority"]) => {
    switch (priority) {
      case "high":
        return Colors.light.error;
      case "medium":
        return Colors.light.warning;
      case "low":
        return Colors.light.muted;
      default:
        return Colors.light.muted;
    }
  };

  const handleToggleItem = useCallback(
    (id: string) => {
      if (!taskScaleAnims[id]) {
        taskScaleAnims[id] = new Animated.Value(1);
      }

      Animated.sequence([
        Animated.timing(taskScaleAnims[id], {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(taskScaleAnims[id], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onChecklistChange(
        checklist.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : undefined,
            };
          }
          return item;
        })
      );
    },
    [checklist, onChecklistChange, taskScaleAnims]
  );

  const handleAddTask = useCallback(() => {
    if (newTaskText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        task: newTaskText,
        completed: false,
        assignedTo: selectedAssignee || undefined,
        priority: selectedPriority,
        category: selectedCategory || undefined,
        dueDate: taskDueDate?.toISOString(),
      };
      onChecklistChange([...checklist, newItem]);
      setModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert("Error", "Please enter a task description");
    }
  }, [
    newTaskText,
    selectedAssignee,
    selectedPriority,
    selectedCategory,
    taskDueDate,
    checklist,
    onChecklistChange,
  ]);

  const handleEditTask = useCallback(() => {
    if (!editingTask) return;
    if (newTaskText.trim()) {
      onChecklistChange(
        checklist.map((item) => {
          if (item.id === editingTask.id) {
            return {
              ...item,
              task: newTaskText,
              assignedTo: selectedAssignee || undefined,
              priority: selectedPriority,
              category: selectedCategory || undefined,
              dueDate: taskDueDate?.toISOString(),
            };
          }
          return item;
        })
      );
      setModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert("Error", "Please enter a task description");
    }
  }, [
    editingTask,
    newTaskText,
    selectedAssignee,
    selectedPriority,
    selectedCategory,
    taskDueDate,
    checklist,
    onChecklistChange,
  ]);

  const handleStartEdit = useCallback((item: ChecklistItem) => {
    setEditingTask(item);
    setNewTaskText(item.task);
    setSelectedAssignee(item.assignedTo || "");
    setSelectedPriority(item.priority || "medium");
    setSelectedCategory(item.category || "");
    setTaskDueDate(item.dueDate ? new Date(item.dueDate) : undefined);
    setModalVisible(true);
  }, []);

  const handleRemoveTask = useCallback(
    (id: string) => {
      Alert.alert("Remove Task", "Are you sure you want to remove this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            onChecklistChange(checklist.filter((item) => item.id !== id));
          },
        },
      ]);
    },
    [checklist, onChecklistChange]
  );

  const handleUseTemplate = useCallback((task: string, category: string) => {
    setNewTaskText(task);
    setSelectedCategory(category);
  }, []);

  const handleGetAISuggestions = useCallback(async () => {
    if (!jobType) {
      Alert.alert("Job Type Required", "Please provide a job type to get AI suggestions");
      return;
    }

    setShowAISuggestions(true);

    try {
      const result = await checklistSuggestionsMutation.mutateAsync({
        jobType,
        jobDescription,
        existingTasks: checklist.map(item => item.task),
      });

      if (result.suggestions && Array.isArray(result.suggestions)) {
        result.suggestions.forEach((suggestion: any) => {
          const newItem: ChecklistItem = {
            id: Date.now().toString() + Math.random(),
            task: suggestion.task,
            completed: false,
            priority: suggestion.priority || "medium",
            category: suggestion.category,
          };
          onChecklistChange([...checklist, newItem]);
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", `Added ${result.suggestions.length} AI-suggested tasks`);
      }
    } catch (error) {
      console.error("[Checklist] AI suggestions error:", error);
      Alert.alert("Error", "Failed to get AI suggestions. Please try again.");
    } finally {
      setShowAISuggestions(false);
    }
  }, [jobType, jobDescription, checklist, onChecklistChange, checklistSuggestionsMutation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Job Checklist</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus color={Colors.light.primary} size={18} />
          </TouchableOpacity>
        </View>
        {jobType && (
          <TouchableOpacity
            style={styles.aiButton}
            onPress={handleGetAISuggestions}
            disabled={showAISuggestions}
          >
            {showAISuggestions ? (
              <ActivityIndicator size="small" color={Colors.light.primary} />
            ) : (
              <Sparkles color={Colors.light.primary} size={16} />
            )}
            <Text style={styles.aiButtonText}>AI Suggestions</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.checklistCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <ClipboardList color={Colors.light.primary} size={20} />
            <Text style={styles.progressText}>
              {completedTasks} of {totalTasks} tasks completed
            </Text>
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterPriority === "all" && styles.filterChipActive,
                ]}
                onPress={() => setFilterPriority("all")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterPriority === "all" && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterPriority === "high" && styles.filterChipActive,
                ]}
                onPress={() => setFilterPriority("high")}
              >
                <Flag
                  color={filterPriority === "high" ? "#FFF" : Colors.light.error}
                  size={14}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    filterPriority === "high" && styles.filterChipTextActive,
                  ]}
                >
                  High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterPriority === "medium" && styles.filterChipActive,
                ]}
                onPress={() => setFilterPriority("medium")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterPriority === "medium" && styles.filterChipTextActive,
                  ]}
                >
                  Medium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterPriority === "low" && styles.filterChipActive,
                ]}
                onPress={() => setFilterPriority("low")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterPriority === "low" && styles.filterChipTextActive,
                  ]}
                >
                  Low
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {filteredChecklist.length === 0 ? (
          <Text style={styles.noTasksText}>No tasks found</Text>
        ) : (
          filteredChecklist.map((item) => {
            if (!taskScaleAnims[item.id]) {
              taskScaleAnims[item.id] = new Animated.Value(1);
            }
            return (
            <Animated.View 
              key={item.id} 
              style={[
                styles.taskRow,
                {
                  transform: [{ scale: taskScaleAnims[item.id] }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.checkboxTouchable}
                onPress={() => handleToggleItem(item.id)}
              >
                {item.completed ? (
                  <CheckSquare color={Colors.light.success} size={22} />
                ) : (
                  <Square color={Colors.light.muted} size={22} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.taskContent}
                onPress={() => handleToggleItem(item.id)}
                onLongPress={() => handleStartEdit(item)}
              >
                <View style={styles.taskHeader}>
                  <Text
                    style={[
                      styles.taskText,
                      item.completed && styles.taskTextCompleted,
                    ]}
                    numberOfLines={2}
                  >
                    {item.task}
                  </Text>
                  {item.priority && (
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: `${getPriorityColor(item.priority)}20` },
                      ]}
                    >
                      <Flag color={getPriorityColor(item.priority)} size={10} />
                      <Text
                        style={[
                          styles.priorityText,
                          { color: getPriorityColor(item.priority) },
                        ]}
                      >
                        {item.priority}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.taskMeta}>
                  {item.category && (
                    <Text style={styles.taskMetaItem}>📋 {item.category}</Text>
                  )}
                  {item.assignedTo && (
                    <Text style={styles.taskMetaItem}>👤 {item.assignedTo}</Text>
                  )}
                  {item.dueDate && !item.completed && (
                    <Text style={styles.taskDueDate}>
                      ⏰{" "}
                      {new Date(item.dueDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                  {item.completed && item.completedAt && (
                    <Text style={styles.taskCompletedTime}>
                      ✅{" "}
                      {new Date(item.completedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.taskActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleStartEdit(item)}
                >
                  <Edit2 color={Colors.light.primary} size={16} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveTask(item.id)}>
                  <Trash2 color={Colors.light.error} size={16} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )})
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: modalSlideAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingTask ? "Edit Task" : "Add Checklist Task"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X color={Colors.light.text} size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <View style={styles.modalForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Task Description *</Text>
                    <TextInput
                      style={[styles.input, styles.taskInput]}
                      value={newTaskText}
                      onChangeText={setNewTaskText}
                      placeholder="e.g., Inspect irrigation system"
                      placeholderTextColor={Colors.light.muted}
                      multiline
                      autoFocus
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Priority Level *</Text>
                    <View style={styles.priorityButtons}>
                      <TouchableOpacity
                        style={[
                          styles.priorityButton,
                          selectedPriority === "low" && {
                            backgroundColor: Colors.light.muted,
                            borderColor: Colors.light.muted,
                          },
                        ]}
                        onPress={() => setSelectedPriority("low")}
                      >
                        <Flag
                          color={
                            selectedPriority === "low" ? "#FFF" : Colors.light.muted
                          }
                          size={16}
                        />
                        <Text
                          style={[
                            styles.priorityButtonText,
                            selectedPriority === "low" &&
                              styles.priorityButtonTextActive,
                          ]}
                        >
                          Low
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.priorityButton,
                          selectedPriority === "medium" && {
                            backgroundColor: Colors.light.warning,
                            borderColor: Colors.light.warning,
                          },
                        ]}
                        onPress={() => setSelectedPriority("medium")}
                      >
                        <Flag
                          color={
                            selectedPriority === "medium" ? "#FFF" : Colors.light.warning
                          }
                          size={16}
                        />
                        <Text
                          style={[
                            styles.priorityButtonText,
                            selectedPriority === "medium" &&
                              styles.priorityButtonTextActive,
                          ]}
                        >
                          Medium
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.priorityButton,
                          selectedPriority === "high" && {
                            backgroundColor: Colors.light.error,
                            borderColor: Colors.light.error,
                          },
                        ]}
                        onPress={() => setSelectedPriority("high")}
                      >
                        <Flag
                          color={
                            selectedPriority === "high" ? "#FFF" : Colors.light.error
                          }
                          size={16}
                        />
                        <Text
                          style={[
                            styles.priorityButtonText,
                            selectedPriority === "high" &&
                              styles.priorityButtonTextActive,
                          ]}
                        >
                          High
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedCategory}
                      onChangeText={setSelectedCategory}
                      placeholder="e.g., Preparation, Installation, Finishing"
                      placeholderTextColor={Colors.light.muted}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Due Date & Time (Optional)</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowTaskDatePicker(true)}
                    >
                      <Calendar color={Colors.light.primary} size={18} />
                      <Text style={styles.datePickerText}>
                        {taskDueDate
                          ? taskDueDate.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "Select due date & time"}
                      </Text>
                      {taskDueDate && (
                        <TouchableOpacity onPress={() => setTaskDueDate(undefined)}>
                          <X color={Colors.light.error} size={18} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Assign To (Optional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.assigneeChips}>
                        <TouchableOpacity
                          style={[
                            styles.assigneeChip,
                            selectedAssignee === "" && styles.assigneeChipSelected,
                          ]}
                          onPress={() => setSelectedAssignee("")}
                        >
                          <Text
                            style={[
                              styles.assigneeChipText,
                              selectedAssignee === "" &&
                                styles.assigneeChipTextSelected,
                            ]}
                          >
                            No Assignment
                          </Text>
                        </TouchableOpacity>
                        {crewMembers.map((member) => (
                          <TouchableOpacity
                            key={member}
                            style={[
                              styles.assigneeChip,
                              selectedAssignee === member &&
                                styles.assigneeChipSelected,
                            ]}
                            onPress={() => setSelectedAssignee(member)}
                          >
                            <Text
                              style={[
                                styles.assigneeChipText,
                                selectedAssignee === member &&
                                  styles.assigneeChipTextSelected,
                              ]}
                            >
                              {member}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Quick Add from Templates</Text>
                    {TASK_TEMPLATES.map((template) => (
                      <View key={template.category} style={styles.templateSection}>
                        <TouchableOpacity
                          style={styles.templateHeader}
                          onPress={() =>
                            setExpandedTemplate(
                              expandedTemplate === template.category
                                ? null
                                : template.category
                            )
                          }
                        >
                          <Text style={styles.templateCategory}>
                            {template.category}
                          </Text>
                          <ChevronDown
                            color={Colors.light.muted}
                            size={18}
                            style={{
                              transform: [
                                {
                                  rotate:
                                    expandedTemplate === template.category
                                      ? "180deg"
                                      : "0deg",
                                },
                              ],
                            }}
                          />
                        </TouchableOpacity>
                        {expandedTemplate === template.category && (
                          <View style={styles.templateTasks}>
                            {template.tasks.map((task, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.templateTask}
                                onPress={() =>
                                  handleUseTemplate(task, template.category)
                                }
                              >
                                <Text style={styles.templateTaskText}>{task}</Text>
                                <Copy color={Colors.light.primary} size={14} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalButtonRow}>
                {editingTask && (
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.modalSaveButton, editingTask && { flex: 1 }]}
                  onPress={editingTask ? handleEditTask : handleAddTask}
                >
                  <Text style={styles.modalSaveButtonText}>
                    {editingTask ? "Update Task" : "Add Task"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {showTaskDatePicker && (
        <DateTimePicker
          value={taskDueDate || new Date()}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTaskDatePicker(false);
            if (selectedDate) {
              setTaskDueDate(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  addButton: {
    padding: 4,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: 6,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  checklistCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.success,
    borderRadius: 4,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterChips: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  checkboxTouchable: {
    padding: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 20,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: Colors.light.muted,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  taskMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  taskMetaItem: {
    fontSize: 12,
    color: Colors.light.primary,
  },
  taskDueDate: {
    fontSize: 12,
    color: Colors.light.warning,
  },
  taskCompletedTime: {
    fontSize: 12,
    color: Colors.light.success,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  noTasksText: {
    fontSize: 14,
    color: Colors.light.muted,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 12,
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
    fontWeight: "700",
    color: Colors.light.text,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalForm: {
    padding: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.light.text,
  },
  taskInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  priorityButtons: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  priorityButtonTextActive: {
    color: "#FFF",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  assigneeChips: {
    flexDirection: "row",
    gap: 8,
  },
  assigneeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.border,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  assigneeChipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  assigneeChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  assigneeChipTextSelected: {
    color: "#FFF",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
  templateSection: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.light.background,
  },
  templateCategory: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
  },
  templateTasks: {
    backgroundColor: Colors.light.card,
  },
  templateTask: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  templateTaskText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
