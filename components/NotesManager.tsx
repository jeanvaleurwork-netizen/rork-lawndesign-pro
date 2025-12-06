import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Plus,
  Trash2,
  X,
  FileText,
  Calendar,
} from "lucide-react-native";

export interface Note {
  id: string;
  text: string;
  createdAt: string;
  createdBy?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
}

interface NotesManagerProps {
  notes: Note[];
  onAddNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote?: (noteId: string, updates: Partial<Note>) => void;
  title?: string;
  placeholder?: string;
  allowCategories?: boolean;
  categories?: string[];
  suggestedNotes?: string[];
  readOnly?: boolean;
  maxHeight?: number;
  theme?: "light" | "dark";
}

export default function NotesManager({
  notes,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
  title = "Notes",
  placeholder = "Add a note...",
  allowCategories = false,
  categories = ["General", "Important", "Follow-up", "Issue"],
  suggestedNotes = [],
  readOnly = false,
  maxHeight = 400,
  theme = "light",
}: NotesManagerProps) {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("General");
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");

  const colors = theme === "dark" ? darkColors : lightColors;

  const handleAddNote = () => {
    if (!newNoteText.trim()) {
      Alert.alert("Empty Note", "Please enter some text for the note.");
      return;
    }

    const note: Note = {
      id: `note_${Date.now()}`,
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
      category: allowCategories ? selectedCategory : undefined,
      priority: selectedPriority,
    };

    onAddNote(note);
    setNewNoteText("");
    setSelectedCategory("General");
    setSelectedPriority("medium");
    setShowAddModal(false);
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteNote(noteId),
        },
      ]
    );
  };

  const handleSuggestedNote = (text: string) => {
    const note: Note = {
      id: `note_${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      category: allowCategories ? selectedCategory : undefined,
      priority: selectedPriority,
    };

    onAddNote(note);
  };

  const getPriorityColor = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return colors.muted;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <View style={[styles.container, { maxHeight }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FileText color={colors.primary} size={20} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {notes.length}
            </Text>
          </View>
        </View>
        {!readOnly && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primaryBg }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus color={colors.primary} size={18} />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>
              Add Note
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {suggestedNotes.length > 0 && !readOnly && (
        <View style={styles.suggestedSection}>
          <Text style={[styles.suggestedTitle, { color: colors.muted }]}>
            Quick Add:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestedScroll}
          >
            {suggestedNotes.map((suggested, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestedChip, { backgroundColor: colors.card }]}
                onPress={() => handleSuggestedNote(suggested)}
              >
                <Plus color={colors.primary} size={14} />
                <Text style={[styles.suggestedChipText, { color: colors.text }]}>
                  {suggested}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.notesList}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {notes.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <FileText color={colors.muted} size={32} strokeWidth={1.5} />
            <Text style={[styles.emptyStateText, { color: colors.muted }]}>
              No notes yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
              {readOnly ? "No notes have been added" : "Tap 'Add Note' to get started"}
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <View
              key={note.id}
              style={[styles.noteCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.noteHeader}>
                <View style={styles.noteHeaderLeft}>
                  {note.priority && (
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: getPriorityColor(note.priority) },
                      ]}
                    />
                  )}
                  {note.category && (
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: colors.primaryBg },
                      ]}
                    >
                      <Text
                        style={[styles.categoryText, { color: colors.primary }]}
                      >
                        {note.category}
                      </Text>
                    </View>
                  )}
                </View>
                {!readOnly && (
                  <TouchableOpacity
                    onPress={() => handleDeleteNote(note.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 color="#EF4444" size={16} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.noteText, { color: colors.text }]}>
                {note.text}
              </Text>

              <View style={styles.noteFooter}>
                <Calendar color={colors.muted} size={12} />
                <Text style={[styles.noteDate, { color: colors.muted }]}>
                  {formatDate(note.createdAt)}
                </Text>
                {note.createdBy && (
                  <Text style={[styles.noteAuthor, { color: colors.muted }]}>
                    • {note.createdBy}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add New Note
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <X color={colors.muted} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Note Text *
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={placeholder}
                  placeholderTextColor={colors.muted}
                  value={newNoteText}
                  onChangeText={setNewNoteText}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  autoFocus
                />
              </View>

              {allowCategories && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Category
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryOption,
                          {
                            backgroundColor:
                              selectedCategory === category
                                ? colors.primary
                                : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            {
                              color:
                                selectedCategory === category
                                  ? "#FFF"
                                  : colors.text,
                            },
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Priority
                </Text>
                <View style={styles.priorityOptions}>
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        {
                          backgroundColor:
                            selectedPriority === priority
                              ? getPriorityColor(priority)
                              : colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setSelectedPriority(priority)}
                    >
                      <Text
                        style={[
                          styles.priorityOptionText,
                          {
                            color:
                              selectedPriority === priority
                                ? "#FFF"
                                : colors.text,
                          },
                        ]}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleAddNote}
              >
                <Text style={styles.saveButtonText}>Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const lightColors = {
  background: "#FFFFFF",
  card: "#F9FAFB",
  text: "#111827",
  muted: "#6B7280",
  primary: "#3B82F6",
  primaryBg: "#EBF5FF",
  border: "#E5E7EB",
  badgeBg: "#EBF5FF",
};

const darkColors = {
  background: "#1A1F3A",
  card: "#252B4A",
  text: "#FFFFFF",
  muted: "#A1A1AA",
  primary: "#00D9FF",
  primaryBg: "rgba(0, 217, 255, 0.1)",
  border: "#3F4469",
  badgeBg: "rgba(0, 217, 255, 0.15)",
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  suggestedSection: {
    marginBottom: 12,
  },
  suggestedTitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  suggestedScroll: {
    flexDirection: "row",
  },
  suggestedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  suggestedChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  notesList: {
    flex: 1,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center" as const,
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  noteHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  deleteButton: {
    padding: 4,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noteDate: {
    fontSize: 12,
  },
  noteAuthor: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    borderWidth: 1,
  },
  categoryScroll: {
    flexDirection: "row",
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  priorityOptions: {
    flexDirection: "row",
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
