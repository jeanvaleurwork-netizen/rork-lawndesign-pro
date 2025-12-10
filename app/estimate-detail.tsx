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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  Plus,
  Trash2,
  Send,
  FileText,
  CheckCircle,
  X,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Edit3,
  Save,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { LineItem, Estimate, EstimateStatus, Client } from "@/types";
import { useData } from "@/contexts/DataContext";

export default function EstimateDetailScreen() {
  const params = useLocalSearchParams();
  const { estimates, addEstimate, updateEstimate, clients, addClient, updateClient } = useData();
  
  const estimateId = params.id as string | undefined;
  const existingEstimate = estimateId
    ? estimates.find((e) => e.id === estimateId)
    : undefined;

  const [lineItems, setLineItems] = useState<LineItem[]>(
    existingEstimate?.lineItems || []
  );
  const [notes, setNotes] = useState<string>(existingEstimate?.notes || "");
  const [status, setStatus] = useState<EstimateStatus>(
    existingEstimate?.status || "draft"
  );
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    existingEstimate
      ? clients.find((c) => c.name === existingEstimate.clientName)
      : undefined
  );
  const [showClientPicker, setShowClientPicker] = useState<boolean>(false);
  const [showNewClientForm, setShowNewClientForm] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [editedBudget, setEditedBudget] = useState<string>("");
  const [editedBudgetNotes, setEditedBudgetNotes] = useState<string>("");

  const [newClientName, setNewClientName] = useState<string>("");
  const [newClientEmail, setNewClientEmail] = useState<string>("");
  const [newClientPhone, setNewClientPhone] = useState<string>("");
  const [newClientAddress, setNewClientAddress] = useState<string>("");

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: "New Item",
      quantity: 1,
      unit: "unit",
      rate: 0,
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleStartEditBudget = () => {
    if (selectedClient) {
      setEditedBudget(selectedClient.budget?.toString() || "");
      setEditedBudgetNotes(selectedClient.budgetNotes || "");
      setIsEditingBudget(true);
    }
  };

  const handleCancelEditBudget = () => {
    setIsEditingBudget(false);
    setEditedBudget("");
    setEditedBudgetNotes("");
  };

  const handleSaveBudget = async () => {
    if (!selectedClient) return;

    const budgetValue = parseFloat(editedBudget);
    if (isNaN(budgetValue) || budgetValue < 0) {
      Alert.alert("Invalid Budget", "Please enter a valid budget amount.");
      return;
    }

    try {
      const updatedClient: Client = {
        ...selectedClient,
        budget: budgetValue,
        budgetNotes: editedBudgetNotes.trim(),
      };

      await updateClient(selectedClient.id, updatedClient);
      setSelectedClient(updatedClient);
      setIsEditingBudget(false);
      Alert.alert("Success", "Client budget updated successfully!");
    } catch (error) {
      console.error("Error updating budget:", error);
      Alert.alert("Error", "Failed to update budget. Please try again.");
    }
  };

  const handleCreateNewClient = async () => {
    if (!newClientName.trim()) {
      Alert.alert("Name Required", "Please enter a client name.");
      return;
    }

    if (!newClientEmail.trim() && !newClientPhone.trim()) {
      Alert.alert("Contact Required", "Please provide at least an email or phone number.");
      return;
    }

    const newClient: Client = {
      id: `client_${Date.now()}`,
      businessId: "business_1",
      name: newClientName.trim(),
      email: newClientEmail.trim(),
      phone: newClientPhone.trim(),
      notes: newClientAddress.trim(),
      tags: [],
      jobsCount: 0,
      estimatesCount: 0,
      customerType: "new",
      homeownerNotes: newClientAddress.trim() ? [
        {
          id: `note_${Date.now()}`,
          instruction: newClientAddress.trim(),
          category: "property" as const,
          priority: "medium" as const,
        }
      ] : [],
    };

    try {
      await addClient(newClient);
      setSelectedClient(newClient);
      setShowNewClientForm(false);
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      setNewClientAddress("");
      Alert.alert("Success", "Client created and saved!");
    } catch (error) {
      console.error("Error creating client:", error);
      Alert.alert("Error", "Failed to create client. Please try again.");
    }
  };

  const handleSaveEstimate = async () => {
    if (!selectedClient) {
      Alert.alert("Client Required", "Please select or create a client for this estimate.");
      return;
    }

    if (lineItems.length === 0) {
      Alert.alert("Line Items Required", "Please add at least one line item.");
      return;
    }

    setIsSaving(true);
    try {
      const estimate: Estimate = {
        id: estimateId || `estimate_${Date.now()}`,
        businessId: "business_1",
        propertyId: `property_${selectedClient.id}`,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        propertyAddress: selectedClient.homeownerNotes?.[0]?.instruction || selectedClient.notes || "Address not available",
        status,
        lineItems,
        subtotal,
        tax,
        total,
        notes,
        createdDate: existingEstimate?.createdDate || new Date().toISOString(),
      };

      if (estimateId) {
        await updateEstimate(estimateId, estimate);
        Alert.alert("Success", "Estimate updated successfully!");
      } else {
        await addEstimate(estimate);
        Alert.alert("Success", "Estimate created successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Error saving estimate:", error);
      Alert.alert("Error", "Failed to save estimate. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEstimate = async () => {
    if (!estimateId && !selectedClient) {
      Alert.alert("Save First", "Please save the estimate before sending.");
      return;
    }

    await handleSaveEstimate();
    setStatus("sent");
    Alert.alert("Success", "Estimate sent to client!");
  };

  const handleConvertToJob = () => {
    Alert.alert("Convert to Job", "This will create a new job from this estimate", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Convert",
        onPress: () => {
          router.push("/job-detail");
        },
      },
    ]);
  };

  const getStatusColor = () => {
    switch (status) {
      case "draft":
        return Colors.light.muted;
      case "sent":
        return Colors.light.primary;
      case "approved":
        return Colors.light.success;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case "draft":
        return "#F3F4F6";
      case "sent":
        return "#EBF5FF";
      case "approved":
        return "#D1FAE5";
      case "declined":
        return "#FEE2E2";
      default:
        return "#F3F4F6";
    }
  };

  const ClientPickerModal = () => (
    <Modal
      visible={showClientPicker}
      animationType="slide"
      transparent
      onRequestClose={() => setShowClientPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Client</Text>
            <TouchableOpacity onPress={() => setShowClientPicker(false)}>
              <X color={Colors.light.muted} size={24} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.createNewClientButton}
            onPress={() => {
              setShowClientPicker(false);
              setShowNewClientForm(true);
            }}
          >
            <Plus color={Colors.light.primary} size={20} />
            <Text style={styles.createNewClientText}>Create New Client</Text>
          </TouchableOpacity>

          <ScrollView style={styles.clientList}>
            {clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientItem}
                onPress={() => {
                  setSelectedClient(client);
                  setShowClientPicker(false);
                }}
              >
                <View style={styles.clientInfo}>
                  <Text style={styles.clientItemName}>{client.name}</Text>
                  <Text style={styles.clientItemDetail}>
                    {client.phone} • {client.email}
                  </Text>
                </View>
                <ChevronRight color={Colors.light.muted} size={20} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const NewClientFormModal = () => (
    <Modal
      visible={showNewClientForm}
      animationType="slide"
      onRequestClose={() => setShowNewClientForm(false)}
    >
      <SafeAreaView style={styles.fullScreenModal}>
        <View style={styles.fullScreenModalHeader}>
          <TouchableOpacity onPress={() => setShowNewClientForm(false)} style={styles.closeButton}>
            <X color={Colors.light.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.fullScreenModalTitle}>New Client</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.fullScreenModalContent}
        >
          <ScrollView 
            style={styles.fullScreenFormScroll}
            contentContainerStyle={styles.fullScreenFormContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formField}>
              <View style={styles.fieldLabel}>
                <User color={Colors.light.primary} size={18} />
                <Text style={styles.fieldLabelText}>Client Name *</Text>
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="John Smith"
                placeholderTextColor={Colors.light.muted}
                value={newClientName}
                onChangeText={setNewClientName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formField}>
              <View style={styles.fieldLabel}>
                <Mail color={Colors.light.primary} size={18} />
                <Text style={styles.fieldLabelText}>Email</Text>
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="john@example.com"
                placeholderTextColor={Colors.light.muted}
                value={newClientEmail}
                onChangeText={setNewClientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formField}>
              <View style={styles.fieldLabel}>
                <Phone color={Colors.light.primary} size={18} />
                <Text style={styles.fieldLabelText}>Phone Number</Text>
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="(555) 123-4567"
                placeholderTextColor={Colors.light.muted}
                value={newClientPhone}
                onChangeText={setNewClientPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formField}>
              <View style={styles.fieldLabel}>
                <MapPin color={Colors.light.primary} size={18} />
                <Text style={styles.fieldLabelText}>Property Address</Text>
              </View>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="123 Main Street, Austin, TX 78701"
                placeholderTextColor={Colors.light.muted}
                value={newClientAddress}
                onChangeText={setNewClientAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.createClientButton}
              onPress={handleCreateNewClient}
            >
              <Text style={styles.createClientButtonText}>Add Client</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: estimateId ? "Edit Estimate" : "New Estimate",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ClientPickerModal />
      <NewClientFormModal />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.headerCard}>
            {selectedClient ? (
              <>
                <View style={styles.headerRow}>
                  <View style={styles.clientBadge}>
                    <User color={Colors.light.primary} size={16} />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor() }]}>
                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.clientInfoSection}
                  onPress={() => setShowClientPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clientName}>{selectedClient.name}</Text>
                  
                  <View style={styles.clientDetailsGrid}>
                    {selectedClient.phone && (
                      <View style={styles.detailRow}>
                        <Phone color={Colors.light.primary} size={16} />
                        <Text style={styles.detailText}>{selectedClient.phone}</Text>
                      </View>
                    )}
                    {selectedClient.email && (
                      <View style={styles.detailRow}>
                        <Mail color={Colors.light.primary} size={16} />
                        <Text style={styles.detailText}>{selectedClient.email}</Text>
                      </View>
                    )}
                    {(selectedClient.homeownerNotes?.[0]?.instruction || selectedClient.notes) && (
                      <View style={styles.detailRow}>
                        <MapPin color={Colors.light.primary} size={16} />
                        <Text style={styles.detailText}>
                          {selectedClient.homeownerNotes?.[0]?.instruction || selectedClient.notes}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.changeClientHint}>
                    <Text style={styles.changeClientText}>Tap to change client</Text>
                    <ChevronRight color={Colors.light.muted} size={16} />
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.headerRow}>
                  <Text style={styles.selectClientTitle}>Client Information</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor() }]}>
                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.emptyClientState}>
                  <View style={styles.emptyClientIcon}>
                    <User color={Colors.light.muted} size={32} strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyClientTitle}>No client selected</Text>
                  <Text style={styles.emptyClientSubtext}>Choose an existing client or create a new one</Text>
                  
                  <View style={styles.clientActionButtons}>
                    <TouchableOpacity
                      style={styles.selectExistingButton}
                      onPress={() => setShowClientPicker(true)}
                    >
                      <Text style={styles.selectExistingText}>Select Existing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.createNewButton}
                      onPress={() => setShowNewClientForm(true)}
                    >
                      <Plus color="#FFF" size={18} />
                      <Text style={styles.createNewText}>Create New</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <TouchableOpacity style={styles.addButton} onPress={addLineItem}>
                <Plus color={Colors.light.primary} size={18} />
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            {lineItems.length === 0 ? (
              <View style={styles.emptyLineItems}>
                <FileText color={Colors.light.muted} size={32} strokeWidth={1.5} />
                <Text style={styles.emptyLineItemsText}>No line items added yet</Text>
                <Text style={styles.emptyLineItemsSubtext}>Tap &quot;Add Item&quot; to start building your estimate</Text>
              </View>
            ) : (
              lineItems.map((item) => (
              <View key={item.id} style={styles.lineItemCard}>
                <View style={styles.lineItemHeader}>
                  <TextInput
                    style={styles.itemNameInput}
                    value={item.name}
                    onChangeText={(text) => updateLineItem(item.id, "name", text)}
                    placeholder="Item name"
                    placeholderTextColor={Colors.light.muted}
                  />
                  <TouchableOpacity onPress={() => removeLineItem(item.id)}>
                    <Trash2 color={Colors.light.error} size={20} />
                  </TouchableOpacity>
                </View>

                <View style={styles.lineItemInputs}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Qty</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={item.quantity.toString()}
                      onChangeText={(text) =>
                        updateLineItem(item.id, "quantity", parseFloat(text) || 0)
                      }
                      keyboardType="numeric"
                      placeholderTextColor={Colors.light.muted}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Unit</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={item.unit}
                      onChangeText={(text) => updateLineItem(item.id, "unit", text)}
                      placeholder="unit"
                      placeholderTextColor={Colors.light.muted}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Rate</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={item.rate.toString()}
                      onChangeText={(text) =>
                        updateLineItem(item.id, "rate", parseFloat(text) || 0)
                      }
                      keyboardType="numeric"
                      placeholderTextColor={Colors.light.muted}
                    />
                  </View>
                </View>

                <View style={styles.lineItemFooter}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amountValue}>
                    ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
              ))
            )}
          </View>

          {selectedClient && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Client Budget</Text>
                {!isEditingBudget ? (
                  <TouchableOpacity 
                    style={styles.editBudgetButton}
                    onPress={handleStartEditBudget}
                  >
                    <Edit3 color={Colors.light.primary} size={18} />
                    <Text style={styles.editBudgetButtonText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.budgetEditActions}>
                    <TouchableOpacity 
                      style={styles.cancelBudgetButton}
                      onPress={handleCancelEditBudget}
                    >
                      <Text style={styles.cancelBudgetButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.saveBudgetButton}
                      onPress={handleSaveBudget}
                    >
                      <Save color="#FFF" size={16} />
                      <Text style={styles.saveBudgetButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.budgetCard}>
                {!isEditingBudget ? (
                  <>
                    <View style={styles.budgetHeader}>
                      <View style={styles.budgetIconContainer}>
                        <DollarSign color={Colors.light.primary} size={20} />
                      </View>
                      <View style={styles.budgetHeaderText}>
                        <Text style={styles.budgetLabel}>Available Budget</Text>
                        <Text style={styles.budgetAmount}>
                          {selectedClient.budget 
                            ? `${selectedClient.budget.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                            : "No budget set"
                          }
                        </Text>
                      </View>
                    </View>

                    {selectedClient.budgetNotes && (
                      <View style={styles.budgetNotesContainer}>
                        <Text style={styles.budgetNotesLabel}>Budget Notes:</Text>
                        <Text style={styles.budgetNotesText}>{selectedClient.budgetNotes}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.budgetEditForm}>
                    <View style={styles.formField}>
                      <View style={styles.fieldLabel}>
                        <DollarSign color={Colors.light.primary} size={18} />
                        <Text style={styles.fieldLabelText}>Budget Amount</Text>
                      </View>
                      <TextInput
                        style={styles.formInput}
                        placeholder="5000.00"
                        placeholderTextColor={Colors.light.muted}
                        value={editedBudget}
                        onChangeText={setEditedBudget}
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={styles.formField}>
                      <View style={styles.fieldLabel}>
                        <FileText color={Colors.light.primary} size={18} />
                        <Text style={styles.fieldLabelText}>Budget Notes</Text>
                      </View>
                      <TextInput
                        style={[styles.formInput, styles.textArea]}
                        placeholder="Budget for seasonal lawn maintenance and improvements"
                        placeholderTextColor={Colors.light.muted}
                        value={editedBudgetNotes}
                        onChangeText={setEditedBudgetNotes}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                )}

                {total > 0 && selectedClient.budget && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.budgetComparisonRow}>
                      <Text style={styles.budgetComparisonLabel}>This Estimate:</Text>
                      <Text style={styles.budgetComparisonValue}>
                        ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={styles.budgetComparisonRow}>
                      <Text style={styles.budgetComparisonLabel}>Remaining:</Text>
                      <Text
                        style={[
                          styles.budgetComparisonValue,
                          {
                            color:
                              selectedClient.budget - total < 0
                                ? Colors.light.error
                                : Colors.light.success,
                          },
                        ]}
                      >
                        ${(selectedClient.budget - total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Text>
                    </View>

                    {total > selectedClient.budget && (
                      <View style={styles.budgetWarning}>
                        <AlertCircle color={Colors.light.error} size={16} />
                        <Text style={styles.budgetWarningText}>
                          Estimate exceeds client budget by $
                          {(total - selectedClient.budget).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    )}

                    {total <= selectedClient.budget && total > selectedClient.budget * 0.9 && (
                      <View style={styles.budgetInfo}>
                        <TrendingUp color="#F59E0B" size={16} />
                        <Text style={styles.budgetInfoText}>
                          Estimate is {((total / selectedClient.budget) * 100).toFixed(0)}% of budget
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cost Breakdown</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (8.25%)</Text>
                <Text style={styles.summaryValue}>
                  ${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes to Client</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes, terms, or special instructions..."
              placeholderTextColor={Colors.light.muted}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEstimate}
              disabled={isSaving}
            >
              <FileText color={Colors.light.primary} size={20} />
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : estimateId ? "Update Estimate" : "Save Estimate"}
              </Text>
            </TouchableOpacity>

            {status === "draft" && estimateId && (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendEstimate}
                disabled={isSaving}
              >
                <Send color="#FFF" size={20} />
                <Text style={styles.sendButtonText}>Send to Client</Text>
              </TouchableOpacity>
            )}

            {status === "approved" && (
              <TouchableOpacity style={styles.convertButton} onPress={handleConvertToJob}>
                <CheckCircle color="#FFF" size={20} />
                <Text style={styles.convertButtonText}>Convert to Job</Text>
              </TouchableOpacity>
            )}
          </View>
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
  headerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  address: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 4,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  measurementCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
  },
  measurementLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  measurementGrid: {
    flexDirection: "row",
    gap: 16,
  },
  measurementItem: {
    flex: 1,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  measurementUnit: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500" as const,
  },
  lineItemCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  lineItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginRight: 12,
  },
  lineItemInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 6,
  },
  smallInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  lineItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.light.text,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  notesInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    fontSize: 15,
    color: Colors.light.text,
    minHeight: 100,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  previewButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  convertButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  convertButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  selectClientButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectClientText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  saveButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "600" as const,
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
    maxHeight: "80%",
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
  clientList: {
    flex: 1,
  },
  clientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  clientInfo: {
    flex: 1,
  },
  clientItemName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  clientItemDetail: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  createNewClientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.background,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
  },
  createNewClientText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  formScroll: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  fieldLabelText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
    minHeight: 80,
    paddingTop: 14,
  },
  createClientButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  createClientButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  propertyAddressText: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  clientBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  clientInfoSection: {
    marginTop: 16,
  },
  clientDetailsGrid: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 15,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 22,
  },
  changeClientHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  changeClientText: {
    fontSize: 13,
    color: Colors.light.muted,
    fontWeight: "500" as const,
  },
  selectClientTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  emptyClientState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyClientIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyClientTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  emptyClientSubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center" as const,
    marginBottom: 20,
  },
  clientActionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  selectExistingButton: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  selectExistingText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  createNewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createNewText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  emptyLineItems: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  emptyLineItemsText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  emptyLineItemsSubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  fullScreenModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    padding: 4,
  },
  fullScreenModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  fullScreenModalContent: {
    flex: 1,
  },
  fullScreenFormScroll: {
    flex: 1,
  },
  fullScreenFormContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  budgetCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  budgetHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  budgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF5FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  budgetHeaderText: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  budgetNotesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  budgetNotesLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  budgetNotesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    fontStyle: "italic" as const,
  },
  budgetComparisonRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 8,
  },
  budgetComparisonLabel: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  budgetComparisonValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  budgetWarning: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  budgetWarningText: {
    fontSize: 13,
    color: Colors.light.error,
    fontWeight: "600" as const,
    flex: 1,
  },
  budgetInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  budgetInfoText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "600" as const,
    flex: 1,
  },
  editBudgetButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  editBudgetButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  budgetEditActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  cancelBudgetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelBudgetButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  saveBudgetButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  saveBudgetButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  budgetEditForm: {
    gap: 16,
  },
});
