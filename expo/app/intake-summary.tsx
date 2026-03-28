import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle,
  MapPin,
  Phone,
  AlertCircle,
  Calendar,
  User,
  Wrench,
  Edit3,
  X,
  Send,
  Users,
} from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

export default function IntakeSummaryScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [intakeData, setIntakeData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [crewMatch, setCrewMatch] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const summarizeMutation = trpc.aiIntake.summarize.useMutation({
    onSuccess: (data) => {
      console.log("[Summary] Generated:", data);
      setSummary(data);
      findCrew(data);
    },
    onError: (error) => {
      console.error("[Summary] Error:", error);
      Alert.alert("Error", "Failed to generate summary");
    },
  });

  const findCrewQuery = trpc.aiIntake.findBestCrew.useQuery(
    {
      jobType: summary?.jobType || "",
      address: summary?.customerDetails?.address || "",
      urgency: summary?.urgencyLevel || 1,
      checklist: summary?.crewChecklist || [],
    },
    {
      enabled: false,
    }
  );

  const findCrew = async (summaryData: any) => {
    if (!summaryData) return;

    try {
      const result = await findCrewQuery.refetch();
      if (result.data) {
        setCrewMatch(result.data);
      }
    } catch (error) {
      console.error("[Crew Match] Error:", error);
    }
  };

  useEffect(() => {
    if (params.data) {
      try {
        const parsed = JSON.parse(params.data as string);
        setIntakeData(parsed);

        summarizeMutation.mutate({
          intakeId: params.intakeId as string,
          collectedData: {
            jobType: parsed.jobType || "",
            customerName: parsed.customerName || "",
            phone: parsed.phone || "",
            address: parsed.address || "",
            description: parsed.description || "",
            urgency: parsed.urgency || 1,
            photos: parsed.photos || [],
            answers: parsed.answers || {},
          },
        });
      } catch (error) {
        console.error("[Summary] Parse error:", error);
        Alert.alert("Error", "Invalid intake data");
        router.back();
      }
    }
  }, [params.data]);

  const handleConfirm = () => {
    console.log("[Intake] Confirming request:", summary);
    console.log("[Dispatch] Crew match:", crewMatch);
    
    Alert.alert(
      "Request Submitted",
      crewMatch 
        ? `Your service request has been submitted and assigned to ${crewMatch.assignedCrew.crewName}. You'll receive a call or text shortly to confirm your appointment.`
        : "Your service request has been submitted. You'll receive a call or text shortly to confirm your appointment.",
      [
        {
          text: "OK",
          onPress: () => router.push("/ai-intake-dashboard"),
        },
      ]
    );
  };

  const handleEdit = (field: string, currentValue: string) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only admins can edit intake data");
      return;
    }
    setEditField(field);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editValue.trim()) {
      Alert.alert("Invalid Input", "Value cannot be empty");
      return;
    }

    const updatedSummary = { ...summary };
    
    switch(editField) {
      case "customerName":
        updatedSummary.customerDetails.name = editValue;
        break;
      case "phone":
        updatedSummary.customerDetails.phone = editValue;
        break;
      case "address":
        updatedSummary.customerDetails.address = editValue;
        break;
      case "description":
        updatedSummary.issueDescription = editValue;
        break;
      case "urgency":
        const urgencyNum = parseInt(editValue);
        if (urgencyNum >= 1 && urgencyNum <= 3) {
          updatedSummary.urgencyLevel = urgencyNum;
        }
        break;
    }

    setSummary(updatedSummary);
    setShowEditModal(false);
    Alert.alert("Updated", "Information has been updated successfully");
    
    if (editField === "urgency" || editField === "address") {
      findCrew(updatedSummary);
    }
  };

  const handleDispatchCrew = () => {
    if (!crewMatch) {
      Alert.alert("No Crew Matched", "Unable to find available crew for this job");
      return;
    }

    console.log("[Dispatch] Dispatching crew:", crewMatch);
    Alert.alert(
      "Crew Dispatched",
      `${crewMatch.assignedCrew.crewName} has been notified and will arrive within ${crewMatch.estimatedArrivalWindow}.`,
      [
        { text: "OK", onPress: () => router.push("/ai-intake-dashboard") }
      ]
    );
  };

  if (summarizeMutation.isPending || !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Service Summary",
            headerStyle: { backgroundColor: "#007AFF" },
            headerTintColor: "#fff",
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Creating your service request...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Service Summary",
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.successBanner}>
          <CheckCircle size={48} color="#34C759" />
          <Text style={styles.successTitle}>Request Ready!</Text>
          <Text style={styles.successText}>
            Review your service request below and confirm
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Type</Text>
          <View style={styles.card}>
            <Wrench size={20} color="#007AFF" />
            <Text style={styles.jobType}>{summary.jobType.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {isAdmin && (
              <TouchableOpacity onPress={() => handleEdit("customerName", summary.customerDetails.name)}>
                <Edit3 size={18} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <User size={18} color="#666" />
              <Text style={styles.infoText}>
                {summary.customerDetails.name}
              </Text>
              {isAdmin && (
                <TouchableOpacity onPress={() => handleEdit("customerName", summary.customerDetails.name)}>
                  <Edit3 size={14} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.infoRow}>
              <Phone size={18} color="#666" />
              <Text style={styles.infoText}>
                {summary.customerDetails.phone}
              </Text>
              {isAdmin && (
                <TouchableOpacity onPress={() => handleEdit("phone", summary.customerDetails.phone)}>
                  <Edit3 size={14} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.infoRow}>
              <MapPin size={18} color="#666" />
              <Text style={styles.infoText}>
                {summary.customerDetails.address}
              </Text>
              {isAdmin && (
                <TouchableOpacity onPress={() => handleEdit("address", summary.customerDetails.address)}>
                  <Edit3 size={14} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Issue Description</Text>
            {isAdmin && (
              <TouchableOpacity onPress={() => handleEdit("description", summary.issueDescription)}>
                <Edit3 size={18} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>
              {summary.issueDescription}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Urgency Level</Text>
            {isAdmin && (
              <TouchableOpacity onPress={() => handleEdit("urgency", summary.urgencyLevel.toString())}>
                <Edit3 size={18} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.card, styles.urgencyCard]}>
            <AlertCircle
              size={20}
              color={summary.urgencyLevel === 3 ? "#FF3B30" : "#007AFF"}
            />
            <Text
              style={[
                styles.urgencyText,
                summary.urgencyLevel === 3 && styles.urgentText,
              ]}
            >
              {summary.urgencyLevel === 3
                ? "URGENT"
                : summary.urgencyLevel === 2
                ? "Regular"
                : "Flexible"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Arrival</Text>
          <View style={styles.card}>
            <Calendar size={18} color="#34C759" />
            <Text style={styles.arrivalText}>
              {summary.estimatedArrivalWindow}
            </Text>
          </View>
        </View>

        {crewMatch && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Crew</Text>
            <View style={[styles.card, styles.crewCard]}>
              <View style={styles.crewHeader}>
                <Text style={styles.crewName}>
                  {crewMatch.assignedCrew.crewName}
                </Text>
                <View
                  style={[
                    styles.urgencyBadge,
                    crewMatch.dispatchFlag === "urgent" && styles.urgentBadge,
                  ]}
                >
                  <Text style={styles.urgencyBadgeText}>
                    {crewMatch.dispatchFlag}
                  </Text>
                </View>
              </View>
              <Text style={styles.crewReason}>
                {crewMatch.assignedCrew.reasonAssigned}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crew Checklist</Text>
          <View style={styles.card}>
            {summary.crewChecklist.map((item: string, index: number) => (
              <View key={index} style={styles.checklistItem}>
                <View style={styles.checklistDot} />
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {isAdmin && crewMatch && (
          <TouchableOpacity style={styles.dispatchButton} onPress={handleDispatchCrew}>
            <Send size={20} color="#fff" />
            <Text style={styles.dispatchButtonText}>Dispatch Crew Now</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>
            {isAdmin ? "Save to Dashboard" : "Confirm Service Request"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit {editField}</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>New Value</Text>
            {editField === "description" ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="Enter new value"
                multiline
                numberOfLines={5}
                autoFocus
              />
            ) : (
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="Enter new value"
                autoFocus
                keyboardType={editField === "phone" || editField === "urgency" ? "phone-pad" : "default"}
              />
            )}

            {editField === "urgency" && (
              <Text style={styles.hint}>Enter 1 (Flexible), 2 (Regular), or 3 (Urgent)</Text>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEdit}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  successBanner: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center" as const,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#333",
    marginTop: 12,
  },
  successText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center" as const,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  jobType: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 8,
    width: "100%",
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  descriptionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    flex: 1,
  },
  urgencyCard: {
    gap: 12,
  },
  urgencyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
  urgentText: {
    color: "#FF3B30",
  },
  arrivalText: {
    fontSize: 16,
    color: "#34C759",
    fontWeight: "600" as const,
  },
  crewCard: {
    flexDirection: "column" as const,
    alignItems: "stretch" as const,
    gap: 8,
  },
  crewHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  crewName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#333",
  },
  crewReason: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  urgencyBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentBadge: {
    backgroundColor: "#FF3B30",
  },
  urgencyBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  checklistItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingVertical: 6,
  },
  checklistDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
  },
  checklistText: {
    fontSize: 15,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    marginTop: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500" as const,
  },
  dispatchButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    marginTop: 8,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 8,
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dispatchButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top" as const,
  },
  hint: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: "row" as const,
    gap: 12,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    alignItems: "center" as const,
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center" as const,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
