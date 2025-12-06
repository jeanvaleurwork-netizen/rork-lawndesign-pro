import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { X, Save, User, Mail, Phone, MapPin, FileText, Tag, Plus, DollarSign } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useData } from "@/contexts/DataContext";
import { Client, HomeownerNote } from "@/types";

export default function ClientFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { clients, addClient, updateClient } = useData();

  const existingClient = id ? clients.find((c) => c.id === id) : null;

  const [name, setName] = useState<string>(existingClient?.name || "");
  const [email, setEmail] = useState<string>(existingClient?.email || "");
  const [phone, setPhone] = useState<string>(existingClient?.phone || "");
  const [notes, setNotes] = useState<string>(existingClient?.notes || "");
  const [tags, setTags] = useState<string[]>(existingClient?.tags || []);
  const [newTag, setNewTag] = useState<string>("");
  const [arrivalInstructions, setArrivalInstructions] = useState<string>(
    existingClient?.arrivalInstructions || ""
  );
  const [homeownerNotes, setHomeownerNotes] = useState<HomeownerNote[]>(
    existingClient?.homeownerNotes || []
  );
  const [jobsCount, setJobsCount] = useState<number>(existingClient?.jobsCount || 0);
  const [estimatesCount, setEstimatesCount] = useState<number>(existingClient?.estimatesCount || 0);
  const [customerType, setCustomerType] = useState<"new" | "recurring">(
    existingClient?.customerType || "new"
  );
  const [budget, setBudget] = useState<string>(existingClient?.budget?.toString() || "");
  const [budgetNotes, setBudgetNotes] = useState<string>(existingClient?.budgetNotes || "");

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const addTagHandler = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addHomeownerNote = () => {
    const newNote: HomeownerNote = {
      id: `hn_${Date.now()}`,
      instruction: "",
      category: "general",
      priority: "medium",
    };
    setHomeownerNotes([...homeownerNotes, newNote]);
  };

  const updateHomeownerNote = (index: number, updates: Partial<HomeownerNote>) => {
    const updated = [...homeownerNotes];
    updated[index] = { ...updated[index], ...updates };
    setHomeownerNotes(updated);
  };

  const removeHomeownerNote = (index: number) => {
    setHomeownerNotes(homeownerNotes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Client name is required");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      Alert.alert("Validation Error", "Please provide at least an email or phone number");
      return;
    }

    setIsSaving(true);
    try {
      const budgetValue = budget.trim() ? parseFloat(budget) : undefined;
      if (budget.trim() && (isNaN(budgetValue!) || budgetValue! < 0)) {
        Alert.alert("Invalid Budget", "Please enter a valid budget amount");
        setIsSaving(false);
        return;
      }

      const clientData: Client = {
        id: existingClient?.id || `client_${Date.now()}`,
        businessId: existingClient?.businessId || "b1",
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        tags,
        jobsCount,
        estimatesCount,
        arrivalInstructions: arrivalInstructions.trim(),
        homeownerNotes: homeownerNotes.filter((note) => note.instruction.trim()),
        customerType,
        budget: budgetValue,
        budgetNotes: budgetNotes.trim() || undefined,
      };

      if (existingClient) {
        await updateClient(existingClient.id, clientData);
        Alert.alert("Success", "Client updated successfully");
      } else {
        await addClient(clientData);
        Alert.alert("Success", "Client added successfully");
      }

      router.back();
    } catch (error) {
      console.error("[ClientForm] Save failed:", error);
      Alert.alert("Error", "Failed to save client. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color={Colors.light.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingClient ? "Edit Client" : "New Client"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={isSaving}
        >
          <Save color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User color={Colors.light.primary} size={20} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Type</Text>
              <View style={styles.customerTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.customerTypeButton,
                    customerType === "new" && styles.customerTypeButtonActive,
                  ]}
                  onPress={() => setCustomerType("new")}
                >
                  <Text
                    style={[
                      styles.customerTypeButtonText,
                      customerType === "new" && styles.customerTypeButtonTextActive,
                    ]}
                  >
                    New Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.customerTypeButton,
                    customerType === "recurring" && styles.customerTypeButtonActive,
                  ]}
                  onPress={() => setCustomerType("recurring")}
                >
                  <Text
                    style={[
                      styles.customerTypeButtonText,
                      customerType === "recurring" && styles.customerTypeButtonTextActive,
                    ]}
                  >
                    Recurring Customer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Client Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={Colors.light.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWithIcon}>
                <Mail color={Colors.light.muted} size={18} />
                <TextInput
                  style={styles.inputText}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="client@email.com"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputWithIcon}>
                <Phone color={Colors.light.muted} size={18} />
                <TextInput
                  style={styles.inputText}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText color={Colors.light.primary} size={20} />
              <Text style={styles.sectionTitle}>Stats</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statInputGroup}>
                <Text style={styles.label}>Total Jobs</Text>
                <TextInput
                  style={styles.input}
                  value={String(jobsCount)}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setJobsCount(num);
                  }}
                  placeholder="0"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.statInputGroup}>
                <Text style={styles.label}>Estimates</Text>
                <TextInput
                  style={styles.input}
                  value={String(estimatesCount)}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setEstimatesCount(num);
                  }}
                  placeholder="0"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign color={Colors.light.primary} size={20} />
              <Text style={styles.sectionTitle}>Budget Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Client Budget ($)</Text>
              <View style={styles.inputWithIcon}>
                <DollarSign color={Colors.light.muted} size={18} />
                <TextInput
                  style={styles.inputText}
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="e.g., 5000"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.inputHint}>
                Set the client&apos;s budget to help gauge pricing for estimates
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={budgetNotes}
                onChangeText={setBudgetNotes}
                placeholder="Add notes about budget, project scope, constraints, etc..."
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText color={Colors.light.primary} size={20} />
              <Text style={styles.sectionTitle}>Notes & Instructions</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>General Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any important notes about this client..."
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Arrival Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={arrivalInstructions}
                onChangeText={setArrivalInstructions}
                placeholder="Gate codes, parking instructions, etc..."
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Tag color={Colors.light.primary} size={20} />
              <Text style={styles.sectionTitle}>Tags</Text>
            </View>

            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add a tag..."
                placeholderTextColor={Colors.light.muted}
                onSubmitEditing={addTagHandler}
              />
              <TouchableOpacity onPress={addTagHandler} style={styles.addTagButton}>
                <Plus color="#FFF" size={18} />
              </TouchableOpacity>
            </View>

            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => removeTag(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                    <X color={Colors.light.primary} size={14} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin color={Colors.light.primary} size={20} />
              <Text style={styles.sectionTitle}>Homeowner Notes</Text>
            </View>

            {homeownerNotes.map((note, index) => (
              <View key={note.id} style={styles.homeownerNoteCard}>
                <View style={styles.homeownerNoteHeader}>
                  <Text style={styles.homeownerNoteLabel}>Note {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeHomeownerNote(index)}>
                    <X color={Colors.light.error} size={18} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={note.instruction}
                  onChangeText={(text) => updateHomeownerNote(index, { instruction: text })}
                  placeholder="Special instruction for crew..."
                  placeholderTextColor={Colors.light.muted}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.noteMetaRow}>
                  <View style={styles.noteMetaItem}>
                    <Text style={styles.noteMetaLabel}>Category:</Text>
                    <View style={styles.categoryButtons}>
                      {(["pets", "parking", "property", "access", "general"] as const).map(
                        (cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={[
                              styles.categoryButton,
                              note.category === cat && styles.categoryButtonActive,
                            ]}
                            onPress={() => updateHomeownerNote(index, { category: cat })}
                          >
                            <Text
                              style={[
                                styles.categoryButtonText,
                                note.category === cat && styles.categoryButtonTextActive,
                              ]}
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>

                  <View style={styles.noteMetaItem}>
                    <Text style={styles.noteMetaLabel}>Priority:</Text>
                    <View style={styles.categoryButtons}>
                      {(["low", "medium", "high"] as const).map((pri) => (
                        <TouchableOpacity
                          key={pri}
                          style={[
                            styles.priorityButton,
                            note.priority === pri && styles.priorityButtonActive,
                            note.priority === pri &&
                              pri === "high" &&
                              styles.priorityButtonHighActive,
                          ]}
                          onPress={() => updateHomeownerNote(index, { priority: pri })}
                        >
                          <Text
                            style={[
                              styles.priorityButtonText,
                              note.priority === pri && styles.priorityButtonTextActive,
                            ]}
                          >
                            {pri}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addNoteButton} onPress={addHomeownerNote}>
              <Plus color={Colors.light.primary} size={20} />
              <Text style={styles.addNoteButtonText}>Add Homeowner Note</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.light.error,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  inputText: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500" as const,
  },
  homeownerNoteCard: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  homeownerNoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  homeownerNoteLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  noteMetaRow: {
    marginTop: 12,
    gap: 12,
  },
  noteMetaItem: {
    gap: 8,
  },
  noteMetaLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    color: Colors.light.muted,
    fontWeight: "500" as const,
    textTransform: "capitalize",
  },
  categoryButtonTextActive: {
    color: "#FFF",
  },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  priorityButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  priorityButtonHighActive: {
    backgroundColor: Colors.light.error,
    borderColor: Colors.light.error,
  },
  priorityButtonText: {
    fontSize: 12,
    color: Colors.light.muted,
    fontWeight: "500" as const,
    textTransform: "capitalize",
  },
  priorityButtonTextActive: {
    color: "#FFF",
  },
  addNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  addNoteButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  bottomSpacing: {
    height: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statInputGroup: {
    flex: 1,
  },
  customerTypeRow: {
    flexDirection: "row",
    gap: 12,
  },
  customerTypeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  customerTypeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  customerTypeButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  customerTypeButtonTextActive: {
    color: "#FFF",
  },
  inputHint: {
    fontSize: 12,
    color: Colors.light.muted,
    marginTop: 6,
    fontStyle: "italic" as const,
  },
});
