import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  Save,
  Send,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { ContractType } from "@/types";

export default function ContractEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = Boolean(params.id);

  const [contractType, setContractType] = useState<ContractType>("PROJECT_CONTRACT");
  const [clientName, setClientName] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [scopeOfWork, setScopeOfWork] = useState<string>("");
  const [warrantyYears, setWarrantyYears] = useState<string>("1");
  const [notes, setNotes] = useState<string>("");

  const [paymentMilestones, setPaymentMilestones] = useState<
    { id: string; description: string; percent: string }[]
  >([
    { id: "1", description: "Deposit", percent: "30" },
    { id: "2", description: "Progress Payment", percent: "40" },
    { id: "3", description: "Final Payment", percent: "30" },
  ]);

  const handleAddMilestone = () => {
    const newId = (paymentMilestones.length + 1).toString();
    setPaymentMilestones([
      ...paymentMilestones,
      { id: newId, description: "", percent: "0" },
    ]);
  };

  const handleRemoveMilestone = (id: string) => {
    if (paymentMilestones.length <= 1) {
      Alert.alert("Error", "Must have at least one payment milestone");
      return;
    }
    setPaymentMilestones(paymentMilestones.filter((m) => m.id !== id));
  };

  const handleUpdateMilestone = (
    id: string,
    field: "description" | "percent",
    value: string
  ) => {
    setPaymentMilestones(
      paymentMilestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const calculateMilestoneAmount = (percent: string): string => {
    if (!totalAmount || !percent) return "$0";
    const amount = (parseFloat(totalAmount) * parseFloat(percent)) / 100;
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalPercent = (): number => {
    return paymentMilestones.reduce((sum, m) => sum + (parseFloat(m.percent) || 0), 0);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...");
    Alert.alert("Success", "Contract saved as draft");
  };

  const handlePreview = () => {
    console.log("Previewing contract...");
    Alert.alert("Preview", "Opening contract preview...");
  };

  const handleSendForSigning = () => {
    if (!clientName || !projectName || !totalAmount) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    const totalPercent = getTotalPercent();
    if (Math.abs(totalPercent - 100) > 0.01) {
      Alert.alert(
        "Invalid Payment Schedule",
        `Payment milestones must add up to 100%. Current total: ${totalPercent.toFixed(1)}%`
      );
      return;
    }

    Alert.alert(
      "Send for Signature",
      "Are you sure you want to send this contract for client signature?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            console.log("Sending contract for signature...");
            Alert.alert("Success", "Contract sent to client for e-signature!");
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditing ? "Edit Contract" : "New Contract",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ArrowLeft color={Colors.light.primary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contract Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    contractType === "MSA" && styles.typeButtonActive,
                  ]}
                  onPress={() => setContractType("MSA")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      contractType === "MSA" && styles.typeButtonTextActive,
                    ]}
                  >
                    MSA
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    contractType === "PROJECT_CONTRACT" && styles.typeButtonActive,
                  ]}
                  onPress={() => setContractType("PROJECT_CONTRACT")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      contractType === "PROJECT_CONTRACT" && styles.typeButtonTextActive,
                    ]}
                  >
                    Project Contract
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    contractType === "WORK_ORDER" && styles.typeButtonActive,
                  ]}
                  onPress={() => setContractType("WORK_ORDER")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      contractType === "WORK_ORDER" && styles.typeButtonTextActive,
                    ]}
                  >
                    Work Order
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Client Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select or enter client name"
                  placeholderTextColor={Colors.light.muted}
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Project Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Smith Roof Replacement"
                  placeholderTextColor={Colors.light.muted}
                  value={projectName}
                  onChangeText={setProjectName}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Total Contract Amount *</Text>
                <View style={styles.inputWithIcon}>
                  <DollarSign color={Colors.light.muted} size={20} />
                  <TextInput
                    style={[styles.input, styles.inputNoBorder]}
                    placeholder="0.00"
                    placeholderTextColor={Colors.light.muted}
                    value={totalAmount}
                    onChangeText={setTotalAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Start Date</Text>
                  <View style={styles.inputWithIcon}>
                    <Calendar color={Colors.light.muted} size={20} />
                    <TextInput
                      style={[styles.input, styles.inputNoBorder]}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor={Colors.light.muted}
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </View>
                </View>

                <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>End Date</Text>
                  <View style={styles.inputWithIcon}>
                    <Calendar color={Colors.light.muted} size={20} />
                    <TextInput
                      style={[styles.input, styles.inputNoBorder]}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor={Colors.light.muted}
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scope of Work</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the work to be performed..."
                placeholderTextColor={Colors.light.muted}
                value={scopeOfWork}
                onChangeText={setScopeOfWork}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Payment Schedule</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddMilestone}>
                  <Plus color={Colors.light.primary} size={18} />
                </TouchableOpacity>
              </View>

              {paymentMilestones.map((milestone, index) => (
                <View key={milestone.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneHeader}>
                    <Text style={styles.milestoneNumber}>Payment {index + 1}</Text>
                    {paymentMilestones.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveMilestone(milestone.id)}
                      >
                        <Trash2 color={Colors.light.error} size={18} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Description (e.g., Deposit, Progress Payment)"
                    placeholderTextColor={Colors.light.muted}
                    value={milestone.description}
                    onChangeText={(value) =>
                      handleUpdateMilestone(milestone.id, "description", value)
                    }
                  />

                  <View style={styles.percentRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.fieldLabel}>Percentage</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor={Colors.light.muted}
                        value={milestone.percent}
                        onChangeText={(value) =>
                          handleUpdateMilestone(milestone.id, "percent", value)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.fieldLabel}>Amount</Text>
                      <View style={styles.amountDisplay}>
                        <Text style={styles.amountText}>
                          {calculateMilestoneAmount(milestone.percent)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.totalPercentCard}>
                <Text style={styles.totalPercentLabel}>Total Percentage:</Text>
                <Text
                  style={[
                    styles.totalPercentValue,
                    Math.abs(getTotalPercent() - 100) < 0.01
                      ? styles.totalPercentCorrect
                      : styles.totalPercentIncorrect,
                  ]}
                >
                  {getTotalPercent().toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Warranty & Additional Terms</Text>
              
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Workmanship Warranty (Years)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={Colors.light.muted}
                  value={warrantyYears}
                  onChangeText={setWarrantyYears}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any additional terms, conditions, or notes..."
                  placeholderTextColor={Colors.light.muted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={handleSaveDraft}>
            <Save color={Colors.light.text} size={20} />
            <Text style={styles.footerButtonText}>Save Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerButton}
            onPress={handlePreview}
          >
            <Eye color={Colors.light.text} size={20} />
            <Text style={styles.footerButtonText}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.primaryButton]}
            onPress={handleSendForSigning}
          >
            <Send color="#FFF" size={20} />
            <Text style={[styles.footerButtonText, styles.primaryButtonText]}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBackButton: {
    marginLeft: 16,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  typeButtonTextActive: {
    color: "#FFF",
  },
  formField: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginHorizontal: -8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputNoBorder: {
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 10,
  },
  milestoneCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  milestoneNumber: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  percentRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  amountDisplay: {
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  totalPercentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  totalPercentLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  totalPercentValue: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  totalPercentCorrect: {
    color: Colors.light.success,
  },
  totalPercentIncorrect: {
    color: Colors.light.error,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  primaryButtonText: {
    color: "#FFF",
  },
});
