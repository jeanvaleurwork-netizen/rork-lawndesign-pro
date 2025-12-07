import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  Camera,
  Phone,
  ChevronLeft,
  Mail,
  Calendar,
  Navigation,
  FileText,
  Users,
  Package,
  Receipt,
  TrendingUp,
  Edit,
  X,
  Plus,
  Trash2,
  Save,
} from "lucide-react-native";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { ChecklistItem as ChecklistItemType } from "@/types";
import NotesManager, { Note } from "@/components/NotesManager";
import Colors from "@/constants/colors";

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export default function JobDetailScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { jobs, clients, updateJob } = useData();
  const { isAdmin } = useAuth();
  
  const job = jobs.find((j) => j.id === jobId);
  const client = job ? clients.find((c) => c.id === job.clientId) : null;

  const [checklist, setChecklist] = useState<ChecklistItemType[]>(
    job?.checklist || [
      { id: "1", task: "Inspect site and prepare", completed: true },
      { id: "2", task: "Set up equipment and materials", completed: false },
      { id: "3", task: "Complete primary work", completed: false },
      { id: "4", task: "Quality check", completed: false },
      { id: "5", task: "Clean up site", completed: false },
      { id: "6", task: "Final walk-through with client", completed: false },
      { id: "7", task: "Upload before photos", completed: false },
      { id: "8", task: "Upload after photos", completed: false },
    ]
  );

  const [materials] = useState<Material[]>([
    {
      id: "1",
      name: "Premium Materials",
      quantity: 25,
      unit: "units",
      unitPrice: 45,
      totalPrice: 1125,
    },
  ]);

  const [photos, setPhotos] = useState<{ uri: string; type: "before" | "during" | "after" }[]>([
    { uri: "https://images.unsplash.com/photo-1632822879474-1970a2f3bb78?w=800", type: "before" },
  ]);

  const receipts = job?.receipts || [];
  
  const [jobNotes, setJobNotes] = useState<Note[]>([
    {
      id: "1",
      text: job?.notes || "Job scheduled and crew assigned",
      createdAt: new Date().toISOString(),
      priority: "medium" as const,
    },
  ]);

  const [timeTracking, setTimeTracking] = useState({
    arrivalTime: job?.startTime || null,
    startTime: null as string | null,
    completedTime: null as string | null,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [checklistModalVisible, setChecklistModalVisible] = useState(false);
  const [editedJobData, setEditedJobData] = useState({
    service: job?.service || "",
    propertyAddress: job?.propertyAddress || "",
    notes: job?.notes || "",
    budgetedCost: job?.budgetedCost?.toString() || "",
    actualCost: job?.actualCost?.toString() || "",
  });
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState("");

  if (!job) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Job not found</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const completionPercentage = Math.round((checklist.filter(item => item.completed).length / checklist.length) * 100);
  const budgetStatus = job.actualCost && job.budgetedCost 
    ? job.actualCost > job.budgetedCost 
      ? "over" 
      : "under"
    : "on-track";

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleSaveJobDetails = () => {
    updateJob(job.id, {
      service: editedJobData.service,
      propertyAddress: editedJobData.propertyAddress,
      notes: editedJobData.notes,
      budgetedCost: parseFloat(editedJobData.budgetedCost) || undefined,
      actualCost: parseFloat(editedJobData.actualCost) || undefined,
    });
    setEditModalVisible(false);
    Alert.alert("Success", "Job details updated successfully");
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItemType = {
      id: Date.now().toString(),
      task: newChecklistItem,
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistItem("");
  };

  const handleDeleteChecklistItem = (id: string) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this checklist item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setChecklist(checklist.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const handleEditChecklistItem = (id: string, currentText: string) => {
    setEditingChecklistId(id);
    setEditingChecklistText(currentText);
  };

  const handleSaveChecklistEdit = () => {
    if (!editingChecklistText.trim() || !editingChecklistId) return;
    setChecklist(
      checklist.map((item) =>
        item.id === editingChecklistId
          ? { ...item, task: editingChecklistText }
          : item
      )
    );
    setEditingChecklistId(null);
    setEditingChecklistText("");
  };

  const handleCallClient = async () => {
    if (!client?.phone) return;
    const phoneNumber = client.phone.replace(/[^0-9]/g, "");
    const url = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to make phone calls on this device");
    }
  };

  const handleEmailClient = async () => {
    if (!client?.email) return;
    const url = `mailto:${client.email}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleNavigate = async () => {
    const address = encodeURIComponent(job.propertyAddress);
    const url = Platform.select({
      ios: `maps://maps.apple.com/?address=${address}`,
      android: `geo:0,0?q=${address}`,
      default: `https://maps.google.com/?q=${address}`,
    });
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleTakePhoto = async (type: "before" | "during" | "after") => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow access to your camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setPhotos([...photos, { uri: result.assets[0].uri, type }]);
    }
  };

  const handleMarkArrival = () => {
    setTimeTracking({ ...timeTracking, arrivalTime: new Date().toISOString() });
  };

  const handleStartWork = () => {
    setTimeTracking({ ...timeTracking, startTime: new Date().toISOString() });
  };

  const handleCompleteJob = () => {
    Alert.alert(
      "Complete Job",
      "Are you sure you want to mark this job as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => {
            setTimeTracking({ ...timeTracking, completedTime: new Date().toISOString() });
            updateJob(job.id, { status: "completed" });
            Alert.alert("Success", "Job marked as completed");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            setEditedJobData({
              service: job?.service || "",
              propertyAddress: job?.propertyAddress || "",
              notes: job?.notes || "",
              budgetedCost: job?.budgetedCost?.toString() || "",
              actualCost: job?.actualCost?.toString() || "",
            });
            setEditModalVisible(true);
          }}
        >
          <Edit color="#FFF" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.jobSummaryCard}>
            <Text style={styles.jobTitle}>{job.service}</Text>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusBadge, 
                job.status === "pending" && styles.status_pending,
                job.status === "scheduled" && styles.status_scheduled,
                job.status === "in-progress" && styles.status_inprogress,
                job.status === "completed" && styles.status_completed,
                job.status === "cancelled" && styles.status_cancelled,
              ]}>
                <Text style={styles.statusText}>{job.status}</Text>
              </View>
              <Text style={styles.jobId}>#{job.id}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Users color={Colors.light.primary} size={20} />
              <Text style={styles.cardTitle}>Crew Assigned</Text>
            </View>
            <View style={styles.crewList}>
              {job.crew.map((member, index) => (
                <View key={index} style={styles.crewMember}>
                  <View style={styles.crewAvatar}>
                    <Text style={styles.crewAvatarText}>
                      {member.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.crewName}>{member}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallClient}>
              <Phone color={Colors.light.primary} size={18} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
              <Navigation color={Colors.light.primary} size={18} />
              <Text style={styles.actionButtonText}>Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push({ pathname: "/estimate-detail", params: { id: job.estimateId } } as any)}
            >
              <FileText color={Colors.light.primary} size={18} />
              <Text style={styles.actionButtonText}>Estimate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmailClient}>
              <Mail color={Colors.light.primary} size={18} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Project Overview</Text>
            <View style={styles.overviewItem}>
              <MapPin color={Colors.light.muted} size={18} />
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Location</Text>
                <Text style={styles.overviewValue}>{job.propertyAddress}</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <Calendar color={Colors.light.muted} size={18} />
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Scheduled Date</Text>
                <Text style={styles.overviewValue}>
                  {new Date(job.startTime).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <Clock color={Colors.light.muted} size={18} />
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Time Window</Text>
                <Text style={styles.overviewValue}>
                  {new Date(job.startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })} - {new Date(job.endTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>
            {client?.arrivalInstructions && (
              <View style={styles.arrivalNotesBox}>
                <Text style={styles.arrivalNotesLabel}>Arrival Instructions</Text>
                <Text style={styles.arrivalNotesText}>{client.arrivalInstructions}</Text>
              </View>
            )}
          </View>

          {isAdmin && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <DollarSign color={Colors.light.primary} size={20} />
                <Text style={styles.cardTitle}>Payment Details</Text>
              </View>
              <View style={styles.paymentGrid}>
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentLabel}>Estimate</Text>
                  <Text style={styles.paymentValue}>
                    ${(job.budgetedCost || 0).toLocaleString()}
                  </Text>
                </View>
                {job.actualCost && (
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>Actual Cost</Text>
                    <Text style={[styles.paymentValue, budgetStatus === "over" && styles.overBudget]}>
                      ${job.actualCost.toLocaleString()}
                    </Text>
                  </View>
                )}
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentLabel}>Budget Status</Text>
                  <View style={[
                    styles.budgetBadge,
                    budgetStatus === "on-track" && styles.budget_ontrack,
                    budgetStatus === "over" && styles.budget_over,
                    budgetStatus === "under" && styles.budget_under,
                  ]}>
                    <Text style={styles.budgetBadgeText}>{budgetStatus}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp color={Colors.light.primary} size={20} />
              <Text style={styles.cardTitle}>Progress</Text>
            </View>
            <View style={styles.progressHeader}>
              <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
              <Text style={styles.progressLabel}>
                {checklist.filter(item => item.completed).length} of {checklist.length} completed
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CheckCircle color={Colors.light.primary} size={20} />
              <Text style={styles.cardTitle}>Checklist</Text>
              <TouchableOpacity 
                style={styles.editChecklistButton}
                onPress={() => setChecklistModalVisible(true)}
              >
                <Edit color={Colors.light.primary} size={18} />
              </TouchableOpacity>
            </View>
            <View style={styles.checklistContainer}>
              {checklist.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.checklistItem,
                    index === checklist.length - 1 && styles.checklistItemLast,
                  ]}
                  onPress={() => handleToggleChecklistItem(item.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      item.completed && styles.checkboxCompleted,
                    ]}
                  >
                    {item.completed && <CheckCircle color={Colors.light.primary} size={16} />}
                  </View>
                  <Text
                    style={[
                      styles.checklistText,
                      item.completed && styles.checklistTextCompleted,
                    ]}
                  >
                    {item.task}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Camera color={Colors.light.primary} size={20} />
              <Text style={styles.cardTitle}>Photos</Text>
            </View>
            
            <View style={styles.photoTypeSection}>
              <Text style={styles.photoTypeLabel}>Before</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosRow}>
                  {photos.filter(p => p.type === "before").map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addPhotoButton} 
                    onPress={() => handleTakePhoto("before")}
                  >
                    <Camera color={Colors.light.primary} size={24} />
                    <Text style={styles.addPhotoText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            <View style={styles.photoTypeSection}>
              <Text style={styles.photoTypeLabel}>During</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosRow}>
                  {photos.filter(p => p.type === "during").map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addPhotoButton} 
                    onPress={() => handleTakePhoto("during")}
                  >
                    <Camera color={Colors.light.primary} size={24} />
                    <Text style={styles.addPhotoText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            <View style={styles.photoTypeSection}>
              <Text style={styles.photoTypeLabel}>After</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosRow}>
                  {photos.filter(p => p.type === "after").map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addPhotoButton} 
                    onPress={() => handleTakePhoto("after")}
                  >
                    <Camera color={Colors.light.primary} size={24} />
                    <Text style={styles.addPhotoText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Package color={Colors.light.primary} size={20} />
              <Text style={styles.cardTitle}>Materials Tracker</Text>
            </View>
            {materials.map((material) => (
              <View key={material.id} style={styles.materialRow}>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{material.name}</Text>
                  <Text style={styles.materialQuantity}>
                    {material.quantity} {material.unit} × ${material.unitPrice} each
                  </Text>
                </View>
                <Text style={styles.materialPrice}>
                  ${material.totalPrice.toLocaleString()}
                </Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addMaterialButton}>
              <Text style={styles.addMaterialText}>+ Add Material</Text>
            </TouchableOpacity>
          </View>

          {isAdmin && receipts.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Receipt color={Colors.light.primary} size={20} />
                <Text style={styles.cardTitle}>Receipt Uploads</Text>
              </View>
              {receipts.map((receipt) => (
                <View key={receipt.id} style={styles.receiptRow}>
                  <View style={styles.receiptInfo}>
                    <Text style={styles.receiptVendor}>{receipt.vendor}</Text>
                    <Text style={styles.receiptCategory}>{receipt.category}</Text>
                  </View>
                  <Text style={styles.receiptAmount}>${receipt.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.card}>
            <NotesManager
              notes={jobNotes}
              onAddNote={(note) => {
                setJobNotes([...jobNotes, note]);
                updateJob(job.id, { notes: note.text });
              }}
              onDeleteNote={(noteId) => {
                setJobNotes(jobNotes.filter((n) => n.id !== noteId));
              }}
              title="Job Notes"
              placeholder="Add notes about this job..."
              allowCategories
              categories={["General", "Issue", "Client Request", "Follow-up", "Important"]}
              suggestedNotes={[
                "Client very satisfied",
                "Need to return for touch-up",
                "Extra materials ordered",
                "Weather delay possible",
                "Client approved changes",
              ]}
              theme="light"
              maxHeight={500}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Clock color={Colors.light.primary} size={20} />
              <Text style={styles.cardTitle}>Time Tracking</Text>
            </View>
            <View style={styles.timeTrackingItem}>
              <Text style={styles.timeTrackingLabel}>Crew Arrival</Text>
              {timeTracking.arrivalTime ? (
                <Text style={styles.timeTrackingValue}>
                  {new Date(timeTracking.arrivalTime).toLocaleTimeString()}
                </Text>
              ) : (
                <TouchableOpacity 
                  style={styles.timeTrackingButton}
                  onPress={handleMarkArrival}
                >
                  <Text style={styles.timeTrackingButtonText}>Mark Arrival</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.timeTrackingItem}>
              <Text style={styles.timeTrackingLabel}>Work Started</Text>
              {timeTracking.startTime ? (
                <Text style={styles.timeTrackingValue}>
                  {new Date(timeTracking.startTime).toLocaleTimeString()}
                </Text>
              ) : (
                <TouchableOpacity 
                  style={styles.timeTrackingButton}
                  onPress={handleStartWork}
                  disabled={!timeTracking.arrivalTime}
                >
                  <Text style={styles.timeTrackingButtonText}>Start Work</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.timeTrackingItem}>
              <Text style={styles.timeTrackingLabel}>Work Completed</Text>
              {timeTracking.completedTime ? (
                <Text style={styles.timeTrackingValue}>
                  {new Date(timeTracking.completedTime).toLocaleTimeString()}
                </Text>
              ) : (
                <Text style={styles.timeTrackingValue}>-</Text>
              )}
            </View>
          </View>

          {job.status !== "completed" && (
            <View style={styles.completionButtons}>
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleCompleteJob}
              >
                <CheckCircle color="#FFF" size={20} />
                <Text style={styles.completeButtonText}>Mark Job Complete</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Job Details</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Type</Text>
                <TextInput
                  style={styles.input}
                  value={editedJobData.service}
                  onChangeText={(text) => setEditedJobData({ ...editedJobData, service: text })}
                  placeholder="Enter service type"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Property Address</Text>
                <TextInput
                  style={styles.input}
                  value={editedJobData.propertyAddress}
                  onChangeText={(text) => setEditedJobData({ ...editedJobData, propertyAddress: text })}
                  placeholder="Enter property address"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budgeted Cost ($)</Text>
                <TextInput
                  style={styles.input}
                  value={editedJobData.budgetedCost}
                  onChangeText={(text) => setEditedJobData({ ...editedJobData, budgetedCost: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Actual Cost ($)</Text>
                <TextInput
                  style={styles.input}
                  value={editedJobData.actualCost}
                  onChangeText={(text) => setEditedJobData({ ...editedJobData, actualCost: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedJobData.notes}
                  onChangeText={(text) => setEditedJobData({ ...editedJobData, notes: text })}
                  placeholder="Add notes about this job..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleSaveJobDetails}
              >
                <Save color="#FFF" size={18} />
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={checklistModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChecklistModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Checklist</Text>
              <TouchableOpacity onPress={() => setChecklistModalVisible(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.addItemSection}>
                <TextInput
                  style={styles.addItemInput}
                  value={newChecklistItem}
                  onChangeText={setNewChecklistItem}
                  placeholder="Add new checklist item..."
                  placeholderTextColor={Colors.light.muted}
                  onSubmitEditing={handleAddChecklistItem}
                />
                <TouchableOpacity 
                  style={styles.addItemButton}
                  onPress={handleAddChecklistItem}
                >
                  <Plus color="#FFF" size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.checklistEditList}>
                {checklist.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.checklistEditItem,
                      index === checklist.length - 1 && styles.checklistEditItemLast,
                    ]}
                  >
                    {editingChecklistId === item.id ? (
                      <View style={styles.editingRow}>
                        <TextInput
                          style={styles.editingInput}
                          value={editingChecklistText}
                          onChangeText={setEditingChecklistText}
                          autoFocus
                        />
                        <TouchableOpacity
                          style={styles.saveEditButton}
                          onPress={handleSaveChecklistEdit}
                        >
                          <Save color={Colors.light.primary} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelEditButton}
                          onPress={() => {
                            setEditingChecklistId(null);
                            setEditingChecklistText("");
                          }}
                        >
                          <X color={Colors.light.muted} size={18} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.checklistEditRow}>
                        <View
                          style={[
                            styles.checkboxSmall,
                            item.completed && styles.checkboxSmallCompleted,
                          ]}
                        >
                          {item.completed && (
                            <CheckCircle color={Colors.light.primary} size={14} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.checklistEditText,
                            item.completed && styles.checklistEditTextCompleted,
                          ]}
                        >
                          {item.task}
                        </Text>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditChecklistItem(item.id, item.task)}
                        >
                          <Edit color={Colors.light.primary} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteChecklistItem(item.id)}
                        >
                          <Trash2 color={Colors.light.error} size={18} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalDoneButton}
                onPress={() => setChecklistModalVisible(false)}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: Colors.light.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  jobSummaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  status_pending: {
    backgroundColor: "#FEF3C7",
  },
  status_scheduled: {
    backgroundColor: "#DBEAFE",
  },
  status_inprogress: {
    backgroundColor: "#E0E7FF",
  },
  status_completed: {
    backgroundColor: "#D1FAE5",
  },
  status_cancelled: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textTransform: "capitalize" as const,
  },
  jobId: {
    fontSize: 14,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  editChecklistButton: {
    marginLeft: "auto",
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  crewList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  crewMember: {
    alignItems: "center",
    width: 70,
  },
  crewAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  crewAvatarText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  crewName: {
    fontSize: 12,
    color: Colors.light.text,
    textAlign: "center",
    fontWeight: "500" as const,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.card,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  overviewItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  overviewContent: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 4,
    fontWeight: "600" as const,
  },
  overviewValue: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  arrivalNotesBox: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  arrivalNotesLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 6,
    fontWeight: "600" as const,
  },
  arrivalNotesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  paymentGrid: {
    gap: 16,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  paymentValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  overBudget: {
    color: Colors.light.error,
  },
  budgetBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  budget_ontrack: {
    backgroundColor: "#D1FAE5",
  },
  budget_over: {
    backgroundColor: "#FEE2E2",
  },
  budget_under: {
    backgroundColor: "#DBEAFE",
  },
  budgetBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textTransform: "capitalize" as const,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
  },
  checklistContainer: {
    gap: 0,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  checklistItemLast: {
    borderBottomWidth: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    borderColor: Colors.light.primary,
    backgroundColor: "transparent",
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  checklistTextCompleted: {
    color: Colors.light.muted,
    textDecorationLine: "line-through",
  },
  photoTypeSection: {
    marginBottom: 20,
  },
  photoTypeLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 10,
  },
  photosRow: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  photoItem: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  materialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  materialQuantity: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  materialPrice: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  addMaterialButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
  },
  addMaterialText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptVendor: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  receiptCategory: {
    fontSize: 13,
    color: Colors.light.muted,
    textTransform: "capitalize" as const,
  },
  receiptAmount: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  timeTrackingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  timeTrackingLabel: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  timeTrackingValue: {
    fontSize: 14,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  timeTrackingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
  },
  timeTrackingButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  completionButtons: {
    marginBottom: 20,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.light.success,
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  bottomPadding: {
    height: 40,
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
  errorButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    padding: 20,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 20,
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
    padding: 14,
    fontSize: 15,
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
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  modalSaveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  addItemSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addItemButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistEditList: {
    gap: 0,
  },
  checklistEditItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  checklistEditItemLast: {
    borderBottomWidth: 0,
  },
  checklistEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkboxSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSmallCompleted: {
    borderColor: Colors.light.primary,
  },
  checklistEditText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  checklistEditTextCompleted: {
    color: Colors.light.muted,
    textDecorationLine: "line-through",
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  editingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editingInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  saveEditButton: {
    padding: 6,
  },
  cancelEditButton: {
    padding: 6,
  },
  modalDoneButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
