import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  FileText,
  Calendar,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  TrendingUp,
  Star,
  Home,
  FileCheck,
  MessageCircle,
  CreditCard,
  Wallet,
  X,
  Save,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import NotesManager, { Note } from "@/components/NotesManager";

export default function ClientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, jobs, updateClient } = useData();
  const { isAdmin } = useAuth();

  const client = clients.find((c) => c.id === id);
  const clientJobs = jobs.filter((j) => j.clientId === id);

  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "history" | "documents">("overview");
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);
  const [budgetAmount, setBudgetAmount] = useState<string>(client?.budget?.toString() || "");
  const [budgetNotes, setBudgetNotes] = useState<string>(client?.budgetNotes || "");

  const [clientNotes, setClientNotes] = useState<Note[]>(
    client?.notes
      ? [
          {
            id: "1",
            text: client.notes,
            createdAt: new Date().toISOString(),
            priority: "medium" as const,
          },
        ]
      : []
  );

  const getStatusStyle = (status: string) => {
    const statusMap: Record<string, any> = {
      pending: styles.statuspending,
      scheduled: styles.statusscheduled,
      "in-progress": styles.statusinprogress,
      inprogress: styles.statusinprogress,
      completed: styles.statuscompleted,
      cancelled: styles.statuscancelled,
    };
    return statusMap[status] || styles.statuspending;
  };

  const handleSaveBudget = async () => {
    if (!client) return;

    try {
      const budgetValue = budgetAmount.trim() ? parseFloat(budgetAmount) : undefined;
      
      if (budgetAmount.trim() && (isNaN(budgetValue!) || budgetValue! < 0)) {
        Alert.alert("Invalid Amount", "Please enter a valid budget amount.");
        return;
      }

      await updateClient(client.id, {
        budget: budgetValue,
        budgetNotes: budgetNotes.trim() || undefined,
      });

      setShowBudgetModal(false);
      Alert.alert("Success", "Budget updated successfully!");
    } catch (error) {
      console.error("Error updating budget:", error);
      Alert.alert("Error", "Failed to update budget. Please try again.");
    }
  };

  const BudgetModal = () => (
    <Modal
      visible={showBudgetModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowBudgetModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Client Budget</Text>
            <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
              <X color={Colors.light.muted} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Budget Amount ($)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 5000"
                placeholderTextColor={Colors.light.muted}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Budget Notes</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Add notes about the budget, project scope, etc."
                placeholderTextColor={Colors.light.muted}
                value={budgetNotes}
                onChangeText={setBudgetNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowBudgetModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveBudget}
            >
              <Save color="#FFF" size={18} />
              <Text style={styles.saveButtonText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Client not found</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const TabButton = ({ tab, label, icon: Icon }: { tab: typeof activeTab; label: string; icon: any }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon color={activeTab === tab ? Colors.light.primary : Colors.light.muted} size={18} />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BudgetModal />
      <Stack.Screen
        options={{
          headerShown: true,
          title: client.name,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <ArrowLeft color={Colors.light.primary} size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => isAdmin ? (
            <TouchableOpacity 
              style={styles.headerEditButton}
              onPress={() => router.push(`/client-form?id=${id}` as any)}
            >
              <Edit color={Colors.light.primary} size={20} />
            </TouchableOpacity>
          ) : null,
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.headerCard}>
            <TouchableOpacity style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </Text>
              </View>
              <View style={styles.avatarBadge}>
                <Edit color="#FFF" size={12} />
              </View>
            </TouchableOpacity>
            <Text style={styles.clientName}>{client.name}</Text>
            
            <View style={styles.customerTypeBadge}>
              <Text style={styles.customerTypeBadgeText}>
                {client.customerType === "new" ? "New Customer" : "Recurring Customer"}
              </Text>
            </View>

            {client.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {client.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {isAdmin && client.reliabilityScore && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reliability Score</Text>
              <View style={styles.card}>
                <View style={styles.reliabilityHeader}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreNumber}>{client.reliabilityScore.score}</Text>
                    <Text style={styles.scoreOutOf}>/100</Text>
                  </View>
                  <View style={styles.reliabilityDetails}>
                    <View style={styles.reliabilityItem}>
                      {client.reliabilityScore.paysOnTime && (
                        <TrendingUp color={Colors.light.success} size={16} />
                      )}
                      <Text style={styles.reliabilityLabel}>
                        {client.reliabilityScore.paysOnTime ? "Pays on time" : "Payment delays"}
                      </Text>
                    </View>
                    <View style={styles.reliabilityItem}>
                      {client.reliabilityScore.goodCommunication && (
                        <MessageCircle color={Colors.light.success} size={16} />
                      )}
                      <Text style={styles.reliabilityLabel}>
                        {client.reliabilityScore.goodCommunication ? "Good communication" : "Communication issues"}
                      </Text>
                    </View>
                    <View style={styles.reliabilityItem}>
                      <Star color={Colors.light.warning} size={16} />
                      <Text style={styles.reliabilityLabel}>
                        {client.reliabilityScore.referralsMade} referrals made
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {isAdmin && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Financial Summary</Text>
                <TouchableOpacity 
                  style={styles.editBudgetButton}
                  onPress={() => setShowBudgetModal(true)}
                >
                  <Wallet color={Colors.light.primary} size={16} />
                  <Text style={styles.editBudgetText}>Edit Budget</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <DollarSign color={Colors.light.success} size={24} />
                  <Text style={styles.statValue}>
                    ${((client.lifetimeValue || 0) / 1000).toFixed(1)}K
                  </Text>
                  <Text style={styles.statLabel}>Lifetime Value</Text>
                </View>
                <View style={styles.statCard}>
                  <CreditCard color={client.outstandingBalance ? Colors.light.warning : Colors.light.success} size={24} />
                  <Text style={[styles.statValue, client.outstandingBalance ? styles.warningText : styles.successText]}>
                    ${(client.outstandingBalance || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Outstanding</Text>
                </View>
                <View style={styles.statCard}>
                  <Wallet color={Colors.light.primary} size={24} />
                  <Text style={styles.statValue}>
                    {client.budget ? `${(client.budget / 1000).toFixed(1)}K` : "N/A"}
                  </Text>
                  <Text style={styles.statLabel}>Client Budget</Text>
                </View>
              </View>
              {client.budgetNotes && (
                <View style={styles.budgetNotesCard}>
                  <Text style={styles.budgetNotesLabel}>Budget Notes:</Text>
                  <Text style={styles.budgetNotesText}>{client.budgetNotes}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Briefcase color={Colors.light.primary} size={24} />
                <Text style={styles.statValue}>{client.jobsCount}</Text>
                <Text style={styles.statLabel}>Total Jobs</Text>
              </View>
              <View style={styles.statCard}>
                <FileText color={Colors.light.success} size={24} />
                <Text style={styles.statValue}>{client.estimatesCount}</Text>
                <Text style={styles.statLabel}>Estimates</Text>
              </View>
            </View>
            {isAdmin && client.lastServiceDate && (
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Last Service: {new Date(client.lastServiceDate).toLocaleDateString()}</Text>
                {client.nextScheduledService && (
                  <Text style={styles.dateLabel}>
                    Next Service: {new Date(client.nextScheduledService).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
              <TabButton tab="overview" label="Overview" icon={Home} />
              <TabButton tab="properties" label="Properties" icon={MapPin} />
              <TabButton tab="history" label="History" icon={Calendar} />
              {isAdmin && <TabButton tab="documents" label="Documents" icon={FileCheck} />}
            </ScrollView>
          </View>

          {activeTab === "overview" && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.contactItem}>
                    <Phone color={Colors.light.primary} size={20} />
                    <Text style={styles.contactText}>{client.phone}</Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                  <TouchableOpacity style={styles.contactItem}>
                    <Mail color={Colors.light.primary} size={20} />
                    <Text style={styles.contactText}>{client.email}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {client.arrivalInstructions && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Arrival Instructions</Text>
                  <View style={styles.card}>
                    <View style={styles.instructionItem}>
                      <MapPin color={Colors.light.warning} size={20} />
                      <Text style={styles.instructionText}>
                        {client.arrivalInstructions}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {client.homeownerNotes && client.homeownerNotes.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Homeowner Notes</Text>
                  <View style={styles.card}>
                    {client.homeownerNotes.map((note, index) => (
                      <View key={note.id}>
                        {index > 0 && <View style={styles.divider} />}
                        <View style={styles.noteItem}>
                          <View style={styles.noteHeader}>
                            <View 
                              style={[
                                styles.priorityBadge,
                                note.priority === "high" && styles.priorityHigh,
                                note.priority === "medium" && styles.priorityMedium,
                                note.priority === "low" && styles.priorityLow,
                              ]}
                            >
                              <Text style={styles.priorityText}>
                                {note.priority.toUpperCase()}
                              </Text>
                            </View>
                            <Text style={styles.categoryText}>{note.category}</Text>
                          </View>
                          <Text style={styles.noteText}>{note.instruction}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Client Notes</Text>
                <View style={styles.notesContainer}>
                  <NotesManager
                    notes={clientNotes}
                    onAddNote={(note) => {
                      setClientNotes([...clientNotes, note]);
                    }}
                    onDeleteNote={(noteId) => {
                      setClientNotes(clientNotes.filter((n) => n.id !== noteId));
                    }}
                    title="Notes"
                    placeholder="Add notes about this client..."
                    allowCategories
                    categories={["General", "Preference", "Special Request", "Important", "Follow-up"]}
                    suggestedNotes={[
                      "Prefers morning appointments",
                      "Needs invoice via email",
                      "Very detail-oriented",
                      "Always pays on time",
                      "Interested in additional services",
                    ]}
                    theme="light"
                    maxHeight={400}
                  />
                </View>
              </View>
            </>
          )}

          {activeTab === "properties" && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Properties</Text>
                {isAdmin && (
                  <TouchableOpacity style={styles.addPropertyButton}>
                    <Plus color={Colors.light.primary} size={18} />
                    <Text style={styles.addPropertyText}>Add Property</Text>
                  </TouchableOpacity>
                )}
              </View>
              {client.properties && client.properties.length > 0 ? (
                client.properties.map((property) => (
                  <View key={property.id} style={styles.propertyCard}>
                    {property.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Star color={Colors.light.warning} size={14} />
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                    <View style={styles.propertyHeader}>
                      <MapPin color={Colors.light.primary} size={20} />
                      <Text style={styles.propertyAddress}>{property.address}</Text>
                    </View>
                    <View style={styles.propertyDetails}>
                      <View style={styles.propertyDetailItem}>
                        <Text style={styles.propertyDetailLabel}>Type</Text>
                        <Text style={styles.propertyDetailValue}>
                          {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                        </Text>
                      </View>
                      {property.squareFootage && (
                        <View style={styles.propertyDetailItem}>
                          <Text style={styles.propertyDetailLabel}>Size</Text>
                          <Text style={styles.propertyDetailValue}>{property.squareFootage.toLocaleString()} sq ft</Text>
                        </View>
                      )}
                      {property.lotSize && (
                        <View style={styles.propertyDetailItem}>
                          <Text style={styles.propertyDetailLabel}>Lot</Text>
                          <Text style={styles.propertyDetailValue}>{property.lotSize.toLocaleString()} sq ft</Text>
                        </View>
                      )}
                    </View>
                    {property.notes && (
                      <View style={styles.propertyNotes}>
                        <Text style={styles.propertyNotesText}>{property.notes}</Text>
                      </View>
                    )}
                    {property.photos.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertyPhotos}>
                        {property.photos.map((photo, idx) => (
                          <Image key={idx} source={{ uri: photo }} style={styles.propertyPhoto} />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <MapPin color={Colors.light.muted} size={48} strokeWidth={1.5} />
                  <Text style={styles.emptyStateText}>No properties added yet</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "history" && (
            <>
              {isAdmin && client.interactionLogs && client.interactionLogs.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Interaction History</Text>
                  {client.interactionLogs.map((log) => (
                    <View key={log.id} style={styles.interactionCard}>
                      <View style={styles.interactionHeader}>
                        <View style={styles.interactionTypeIcon}>
                          {log.type === "call" && <Phone color={Colors.light.primary} size={16} />}
                          {log.type === "email" && <Mail color={Colors.light.primary} size={16} />}
                          {log.type === "note" && <FileText color={Colors.light.primary} size={16} />}
                        </View>
                        <View style={styles.interactionInfo}>
                          <Text style={styles.interactionSubject}>{log.subject}</Text>
                          <Text style={styles.interactionDate}>
                            {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.interactionDescription}>{log.description}</Text>
                      <Text style={styles.interactionUser}>By {log.userName}</Text>
                    </View>
                  ))}
                </View>
              )}

              {clientJobs.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Jobs</Text>
                  {clientJobs.slice(0, 5).map((job) => {
                    const completionPercentage = job.checklist 
                      ? Math.round((job.checklist.filter(item => item.completed).length / job.checklist.length) * 100)
                      : job.status === "completed" ? 100 : job.status === "in-progress" ? 50 : 0;
                    
                    return (
                      <TouchableOpacity
                        key={job.id}
                        style={styles.jobCard}
                        onPress={() => router.push({ pathname: "/job-detail", params: { jobId: job.id } })}
                      >
                        <View style={styles.jobHeader}>
                          <Text style={styles.jobService}>{job.service}</Text>
                          <View style={[styles.statusBadge, getStatusStyle(job.status)]}>
                            <Text style={styles.statusText}>{job.status}</Text>
                          </View>
                        </View>
                        <Text style={styles.jobAddress}>{job.propertyAddress}</Text>
                        <View style={styles.jobFooter}>
                          <Calendar color={Colors.light.muted} size={14} />
                          <Text style={styles.jobDate}>
                            {new Date(job.startTime).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
                          </View>
                          <View style={styles.progressBarBackground}>
                            <View 
                              style={[
                                styles.progressBarFill, 
                                { width: `${completionPercentage}%` }
                              ]} 
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {isAdmin && client.paymentRecords && client.paymentRecords.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment History</Text>
                  {client.paymentRecords.map((payment) => (
                    <View key={payment.id} style={styles.paymentCard}>
                      <View style={styles.paymentHeader}>
                        <View style={styles.paymentAmount}>
                          <DollarSign color={Colors.light.success} size={18} />
                          <Text style={styles.paymentValue}>${payment.amount.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.paymentStatusBadge, payment.status === "completed" && styles.paymentStatusCompleted]}>
                          <Text style={styles.paymentStatusText}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.paymentDetails}>
                        <Text style={styles.paymentMethod}>
                          {payment.method.replace("_", " ").charAt(0).toUpperCase() + payment.method.slice(1).replace("_", " ")}
                        </Text>
                        <Text style={styles.paymentDate}>
                          {new Date(payment.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {activeTab === "documents" && isAdmin && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Documents</Text>
                <TouchableOpacity style={styles.addPropertyButton}>
                  <Plus color={Colors.light.primary} size={18} />
                  <Text style={styles.addPropertyText}>Upload</Text>
                </TouchableOpacity>
              </View>
              {client.documents && client.documents.length > 0 ? (
                client.documents.map((doc) => (
                  <View key={doc.id} style={styles.documentCard}>
                    <View style={styles.documentIcon}>
                      <FileCheck color={Colors.light.primary} size={24} />
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{doc.name}</Text>
                      <Text style={styles.documentType}>
                        {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} • {new Date(doc.uploadedDate).toLocaleDateString()}
                      </Text>
                      {doc.notes && <Text style={styles.documentNotes}>{doc.notes}</Text>}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <FileCheck color={Colors.light.muted} size={48} strokeWidth={1.5} />
                  <Text style={styles.emptyStateText}>No documents uploaded</Text>
                </View>
              )}
            </View>
          )}

          {isAdmin && (
            <View style={styles.dangerZone}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    "Delete Client",
                    "Are you sure you want to delete this client? This action cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Delete", 
                        style: "destructive",
                        onPress: () => {
                          router.back();
                        }
                      },
                    ]
                  );
                }}
              >
                <Trash2 color={Colors.light.error} size={20} />
                <Text style={styles.deleteButtonText}>Delete Client</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 40,
  },
  headerBackButton: {
    marginLeft: 16,
    padding: 4,
  },
  headerEditButton: {
    marginRight: 16,
    padding: 4,
  },
  headerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.light.card,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  clientName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  customerTypeBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  customerTypeBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  tag: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "500" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addPropertyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  addPropertyText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
  statsGrid: {
    flexDirection: "row",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 4,
    fontWeight: "500" as const,
  },
  warningText: {
    color: Colors.light.warning,
  },
  successText: {
    color: Colors.light.success,
  },
  dateInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.light.cardLight,
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  reliabilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.light.success,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  scoreOutOf: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  reliabilityDetails: {
    flex: 1,
    gap: 10,
  },
  reliabilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reliabilityLabel: {
    fontSize: 14,
    color: Colors.light.text,
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  tabButtonTextActive: {
    color: "#FFF",
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  noteItem: {
    paddingVertical: 8,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: "#FEE2E2",
  },
  priorityMedium: {
    backgroundColor: "#FEF3C7",
  },
  priorityLow: {
    backgroundColor: "#DBEAFE",
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.light.muted,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  noteText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  notesContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  propertyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    position: "relative",
  },
  primaryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.warning,
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 22,
  },
  propertyDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  propertyDetailItem: {
    flex: 1,
  },
  propertyDetailLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  propertyDetailValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  propertyNotes: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  propertyNotesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  propertyPhotos: {
    marginTop: 8,
  },
  propertyPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  jobCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  jobService: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statuspending: {
    backgroundColor: "#FEF3C7",
  },
  statusscheduled: {
    backgroundColor: "#DBEAFE",
  },
  statusinprogress: {
    backgroundColor: "#E0E7FF",
  },
  statuscompleted: {
    backgroundColor: "#D1FAE5",
  },
  statuscancelled: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textTransform: "capitalize" as const,
  },
  jobAddress: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobDate: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  progressSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  progressPercentage: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "700" as const,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  interactionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  interactionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  interactionTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  interactionInfo: {
    flex: 1,
  },
  interactionSubject: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  interactionDate: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  interactionDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  interactionUser: {
    fontSize: 12,
    color: Colors.light.muted,
    fontStyle: "italic" as const,
  },
  paymentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  paymentValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  paymentStatusCompleted: {
    backgroundColor: "#D1FAE5",
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  paymentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethod: {
    fontSize: 14,
    color: Colors.light.text,
  },
  paymentDate: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  documentType: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  documentNotes: {
    fontSize: 13,
    color: Colors.light.text,
    fontStyle: "italic" as const,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
    marginTop: 16,
  },
  dangerZone: {
    marginTop: 12,
    marginBottom: 40,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.error,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  editBudgetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  editBudgetText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  budgetNotesCard: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  budgetNotesLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginBottom: 6,
  },
  budgetNotesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    fontStyle: "italic" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
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
  modalBody: {
    maxHeight: 400,
  },
  formField: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
