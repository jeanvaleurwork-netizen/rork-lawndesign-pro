import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Stack } from "expo-router";
import {
  Phone,
  MessageSquare,
  Bot,
  Settings,
  PhoneMissed,
  PhoneIncoming,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Trash2,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface AILog {
  id: string;
  type: "call" | "text";
  from: string;
  timestamp: string;
  summary: string;
  status: "answered" | "lead-captured" | "scheduled" | "missed";
}

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  color: string;
}

const mockAILogs: AILog[] = [
  {
    id: "1",
    type: "call",
    from: "+1 (512) 555-0145",
    timestamp: "2025-11-29T14:30:00",
    summary: "Customer inquiring about lawn maintenance pricing. Lead captured, quote sent.",
    status: "lead-captured",
  },
  {
    id: "2",
    type: "text",
    from: "+1 (512) 555-0198",
    timestamp: "2025-11-29T12:15:00",
    summary: "Follow-up on estimate. Job scheduled for Dec 5th.",
    status: "scheduled",
  },
  {
    id: "3",
    type: "call",
    from: "+1 (512) 555-0234",
    timestamp: "2025-11-29T10:00:00",
    summary: "New customer requesting backyard design consultation.",
    status: "answered",
  },
  {
    id: "4",
    type: "text",
    from: "+1 (512) 555-0187",
    timestamp: "2025-11-28T16:45:00",
    summary: "Payment confirmation received. Invoice marked as paid.",
    status: "answered",
  },
];

export default function AIOfficeManagerScreen() {
  const [selectedTab, setSelectedTab] = useState<"calls" | "texts" | "automations" | "notes">("calls");
  const [greeting, setGreeting] = useState<string>(
    "Hi, thanks for calling ContractorOS! How can we help you today?"
  );
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Follow up with Johnson",
      content: "Need to call back about the deck project. Mentioned budget is $8k-10k.",
      timestamp: "2025-11-29T15:20:00",
      color: "#FEF3C7",
    },
    {
      id: "2",
      title: "Material order",
      content: "Order lumber for Smith residence by Dec 1st. Confirmed delivery window.",
      timestamp: "2025-11-29T11:00:00",
      color: "#D1FAE5",
    },
    {
      id: "3",
      title: "Staff meeting notes",
      content: "Discuss new safety protocols. Review weekly schedule. Team performance reviews due.",
      timestamp: "2025-11-28T09:30:00",
      color: "#EBF5FF",
    },
  ]);
  const [showAddNote, setShowAddNote] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>("");
  const [newNoteContent, setNewNoteContent] = useState<string>("");

  const getStatusIcon = (status: AILog["status"]) => {
    switch (status) {
      case "answered":
        return <Phone color={Colors.light.primary} size={16} />;
      case "lead-captured":
        return <CheckCircle2 color={Colors.light.success} size={16} />;
      case "scheduled":
        return <Clock color={Colors.light.warning} size={16} />;
      case "missed":
        return <PhoneMissed color={Colors.light.error} size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AILog["status"]) => {
    switch (status) {
      case "answered":
        return Colors.light.primary;
      case "lead-captured":
        return Colors.light.success;
      case "scheduled":
        return Colors.light.warning;
      case "missed":
        return Colors.light.error;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusBg = (status: AILog["status"]) => {
    switch (status) {
      case "answered":
        return "#EBF5FF";
      case "lead-captured":
        return "#D1FAE5";
      case "scheduled":
        return "#FEF3C7";
      case "missed":
        return "#FEE2E2";
      default:
        return "#F3F4F6";
    }
  };

  const noteColors = ["#FEF3C7", "#D1FAE5", "#EBF5FF", "#FEE2E2", "#F3E8FF"];

  const addNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      timestamp: new Date().toISOString(),
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowAddNote(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const automations = [
    { id: "1", name: "Lead Follow-up", description: "Auto-follow up 24h after missed calls", active: true },
    { id: "2", name: "Payment Reminders", description: "Send reminders 3 days before due date", active: true },
    { id: "3", name: "Appointment Confirmations", description: "Confirm jobs 1 day before", active: true },
    { id: "4", name: "Review Requests", description: "Request reviews after job completion", active: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "AI Office Manager",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <PhoneIncoming color={Colors.light.primary} size={20} />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Calls Today</Text>
            </View>

            <View style={styles.statCard}>
              <MessageSquare color={Colors.light.success} size={20} />
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>

            <View style={styles.statCard}>
              <CheckCircle2 color={Colors.light.warning} size={20} />
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Leads Captured</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "calls" && styles.tabActive]}
              onPress={() => setSelectedTab("calls")}
            >
              <Phone
                color={selectedTab === "calls" ? "#FFF" : Colors.light.text}
                size={18}
              />
              <Text style={[styles.tabText, selectedTab === "calls" && styles.tabTextActive]}>
                Calls
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "texts" && styles.tabActive]}
              onPress={() => setSelectedTab("texts")}
            >
              <MessageSquare
                color={selectedTab === "texts" ? "#FFF" : Colors.light.text}
                size={18}
              />
              <Text style={[styles.tabText, selectedTab === "texts" && styles.tabTextActive]}>
                Texts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "automations" && styles.tabActive]}
              onPress={() => setSelectedTab("automations")}
            >
              <Bot
                color={selectedTab === "automations" ? "#FFF" : Colors.light.text}
                size={18}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "automations" && styles.tabTextActive,
                ]}
              >
                Auto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "notes" && styles.tabActive]}
              onPress={() => setSelectedTab("notes")}
            >
              <FileText
                color={selectedTab === "notes" ? "#FFF" : Colors.light.text}
                size={18}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "notes" && styles.tabTextActive,
                ]}
              >
                Notes
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === "notes" ? (
            <View style={styles.section}>
              <View style={styles.notesHeader}>
                <Text style={styles.sectionTitle}>My Notes</Text>
                <TouchableOpacity
                  style={styles.addNoteButton}
                  onPress={() => setShowAddNote(!showAddNote)}
                >
                  <Plus color="#FFF" size={20} />
                </TouchableOpacity>
              </View>

              {showAddNote && (
                <View style={styles.addNoteCard}>
                  <TextInput
                    style={styles.noteTitleInput}
                    value={newNoteTitle}
                    onChangeText={setNewNoteTitle}
                    placeholder="Note title"
                    placeholderTextColor={Colors.light.muted}
                  />
                  <TextInput
                    style={styles.noteContentInput}
                    value={newNoteContent}
                    onChangeText={setNewNoteContent}
                    placeholder="Write your note here..."
                    placeholderTextColor={Colors.light.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowAddNote(false);
                        setNewNoteTitle("");
                        setNewNoteContent("");
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={addNote}
                    >
                      <Text style={styles.saveButtonText}>Save Note</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {notes.length === 0 ? (
                <View style={styles.emptyState}>
                  <FileText color={Colors.light.muted} size={48} />
                  <Text style={styles.emptyStateText}>No notes yet</Text>
                  <Text style={styles.emptyStateSubtext}>Tap the + button to add your first note</Text>
                </View>
              ) : (
                notes.map((note) => (
                  <View key={note.id} style={[styles.noteCard, { backgroundColor: note.color }]}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteTitle}>{note.title}</Text>
                      <TouchableOpacity onPress={() => deleteNote(note.id)}>
                        <Trash2 color={Colors.light.error} size={18} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.noteContent}>{note.content}</Text>
                    <Text style={styles.noteTime}>
                      {new Date(note.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ) : selectedTab === "automations" ? (
            <View style={styles.section}>
              <View style={styles.greetingSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>AI Greeting Message</Text>
                  <TouchableOpacity>
                    <Settings color={Colors.light.primary} size={20} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.greetingInput}
                  value={greeting}
                  onChangeText={setGreeting}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={Colors.light.muted}
                  textAlignVertical="top"
                />
              </View>

              <Text style={styles.sectionTitle}>Automations</Text>
              {automations.map((automation) => (
                <View key={automation.id} style={styles.automationCard}>
                  <View style={styles.automationHeader}>
                    <View style={styles.automationInfo}>
                      <Text style={styles.automationName}>{automation.name}</Text>
                      <Text style={styles.automationDescription}>
                        {automation.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.toggle,
                        automation.active && styles.toggleActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleKnob,
                          automation.active && styles.toggleKnobActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {selectedTab === "calls" ? "Recent Calls" : "Recent Messages"}
              </Text>

              {mockAILogs
                .filter((log) =>
                  selectedTab === "calls" ? log.type === "call" : log.type === "text"
                )
                .map((log) => (
                  <TouchableOpacity key={log.id} style={styles.logCard}>
                    <View style={styles.logHeader}>
                      <View style={styles.logIcon}>
                        {log.type === "call" ? (
                          <Phone color={Colors.light.primary} size={20} />
                        ) : (
                          <MessageSquare color={Colors.light.success} size={20} />
                        )}
                      </View>
                      <View style={styles.logInfo}>
                        <Text style={styles.logFrom}>{log.from}</Text>
                        <Text style={styles.logTime}>
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.logStatusBadge,
                          { backgroundColor: getStatusBg(log.status) },
                        ]}
                      >
                        {getStatusIcon(log.status)}
                        <Text
                          style={[
                            styles.logStatusText,
                            { color: getStatusColor(log.status) },
                          ]}
                        >
                          {log.status
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.logSummary}>{log.summary}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  tabTextActive: {
    color: "#FFF",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  logCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logFrom: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  logStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  logStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  logSummary: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  greetingSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  greetingInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    fontSize: 15,
    color: Colors.light.text,
    minHeight: 80,
  },
  automationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  automationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  automationInfo: {
    flex: 1,
    marginRight: 12,
  },
  automationName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  automationDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.border,
    justifyContent: "center",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.light.success,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addNoteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addNoteCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  noteTitleInput: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  noteContentInput: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 16,
    minHeight: 100,
  },
  noteActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    flex: 1,
  },
  noteContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  noteTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 4,
  },
});
