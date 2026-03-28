import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,

} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Plus, 
  Edit,
  Trash2,
  QrCode,
  Calendar,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
  Book,
  ClipboardList,
} from "lucide-react-native";


import Colors from "@/constants/colors";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import type { EquipmentAsset, MaintenanceContract } from "@/types";
import { generateId } from "@/utils/id-generator";



export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    commercialProperties, 
    equipmentAssets, 
    maintenanceContracts, 
    clients,
    addEquipmentAsset,
    deleteEquipmentAsset,
    addMaintenanceContract,
  } = useData();
  const { isAdmin } = useAuth();

  const property = commercialProperties.find((p) => p.id === id);
  const propertyAssets = equipmentAssets.filter((a) => a.propertyId === id);
  const propertyContracts = maintenanceContracts.filter((c) => c.propertyId === id);
  const client = clients.find((c) => c.id === property?.clientId);

  const [activeTab, setActiveTab] = useState<"assets" | "contracts" | "info">("assets");
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [showContractModal, setShowContractModal] = useState<boolean>(false);

  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrAsset, setQRAsset] = useState<EquipmentAsset | null>(null);

  const [assetForm, setAssetForm] = useState({
    name: "",
    assetType: "hvac" as EquipmentAsset["assetType"],
    location: "",
    modelNumber: "",
    serialNumber: "",
    notes: "",
  });

  const [contractForm, setContractForm] = useState({
    contractName: "",
    description: "",
    frequency: "quarterly" as MaintenanceContract["frequency"],
    startDate: new Date().toISOString().split("T")[0],
    nextVisitDate: new Date().toISOString().split("T")[0],
    contractValue: "",
    notes: "",
  });

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Property not found</Text>
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

  const handleSaveAsset = async () => {
    if (!assetForm.name.trim() || !assetForm.location.trim()) {
      Alert.alert("Error", "Please fill in name and location");
      return;
    }

    try {
      const qrValue = `ASSET-${generateId()}`;
      const newAsset: EquipmentAsset = {
        id: generateId(),
        propertyId: property.id,
        name: assetForm.name,
        assetType: assetForm.assetType,
        location: assetForm.location,
        modelNumber: assetForm.modelNumber || undefined,
        serialNumber: assetForm.serialNumber || undefined,
        notes: assetForm.notes || undefined,
        qrCodeValue: qrValue,
        photos: [],
        maintenanceHistory: [],
        createdDate: new Date().toISOString(),
      };

      await addEquipmentAsset(newAsset);
      setShowAssetModal(false);
      setAssetForm({
        name: "",
        assetType: "hvac",
        location: "",
        modelNumber: "",
        serialNumber: "",
        notes: "",
      });
      Alert.alert("Success", "Asset added successfully!");
    } catch (error) {
      console.error("Error adding asset:", error);
      Alert.alert("Error", "Failed to add asset");
    }
  };

  const handleSaveContract = async () => {
    if (!contractForm.contractName.trim() || !contractForm.description.trim()) {
      Alert.alert("Error", "Please fill in contract name and description");
      return;
    }

    try {
      const newContract: MaintenanceContract = {
        id: generateId(),
        propertyId: property.id,
        contractName: contractForm.contractName,
        description: contractForm.description,
        frequency: contractForm.frequency,
        startDate: contractForm.startDate,
        nextVisitDate: contractForm.nextVisitDate,
        contractValue: contractForm.contractValue ? parseFloat(contractForm.contractValue) : undefined,
        autoSchedule: true,
        serviceChecklist: [],
        notes: contractForm.notes || undefined,
        status: "active",
        createdDate: new Date().toISOString(),
      };

      await addMaintenanceContract(newContract);
      setShowContractModal(false);
      setContractForm({
        contractName: "",
        description: "",
        frequency: "quarterly",
        startDate: new Date().toISOString().split("T")[0],
        nextVisitDate: new Date().toISOString().split("T")[0],
        contractValue: "",
        notes: "",
      });
      Alert.alert("Success", "Contract added successfully!");
    } catch (error) {
      console.error("Error adding contract:", error);
      Alert.alert("Error", "Failed to add contract");
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    Alert.alert(
      "Delete Asset",
      "Are you sure you want to delete this asset?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteEquipmentAsset(assetId);
            Alert.alert("Success", "Asset deleted");
          },
        },
      ]
    );
  };

  const handleShowQR = (asset: EquipmentAsset) => {
    setQRAsset(asset);
    setShowQRModal(true);
  };

  const getStatusColor = (status: MaintenanceContract["status"]) => {
    switch (status) {
      case "active": return Colors.light.success;
      case "paused": return Colors.light.warning;
      case "cancelled": return Colors.light.error;
      case "completed": return Colors.light.muted;
      default: return Colors.light.muted;
    }
  };

  const getStatusIcon = (status: MaintenanceContract["status"]) => {
    switch (status) {
      case "active": return <PlayCircle color={Colors.light.success} size={16} />;
      case "paused": return <PauseCircle color={Colors.light.warning} size={16} />;
      case "cancelled": return <XCircle color={Colors.light.error} size={16} />;
      case "completed": return <CheckCircle color={Colors.light.muted} size={16} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: property.name,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <ArrowLeft color={Colors.light.primary} size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => isAdmin ? (
            <TouchableOpacity style={styles.headerEditButton}>
              <Edit color={Colors.light.primary} size={20} />
            </TouchableOpacity>
          ) : null,
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.headerCard}>
            <View style={styles.iconCircle}>
              <Building2 color={Colors.light.primary} size={32} />
            </View>
            <Text style={styles.propertyName}>{property.name}</Text>
            <View style={styles.addressRow}>
              <MapPin color={Colors.light.muted} size={16} />
              <Text style={styles.addressText}>{property.address}</Text>
            </View>
            {client && (
              <Text style={styles.clientText}>Client: {client.name}</Text>
            )}
          </View>

          <View style={styles.propertyInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
              </Text>
            </View>
            {property.squareFootage && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>{property.squareFootage.toLocaleString()} sq ft</Text>
              </View>
            )}
            {property.floors && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Floors</Text>
                <Text style={styles.infoValue}>{property.floors}</Text>
              </View>
            )}
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "assets" && styles.tabButtonActive]}
                onPress={() => setActiveTab("assets")}
              >
                <Book color={activeTab === "assets" ? Colors.light.primary : Colors.light.muted} size={18} />
                <Text style={[styles.tabButtonText, activeTab === "assets" && styles.tabButtonTextActive]}>
                  Assets ({propertyAssets.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "contracts" && styles.tabButtonActive]}
                onPress={() => setActiveTab("contracts")}
              >
                <ClipboardList color={activeTab === "contracts" ? Colors.light.primary : Colors.light.muted} size={18} />
                <Text style={[styles.tabButtonText, activeTab === "contracts" && styles.tabButtonTextActive]}>
                  Contracts ({propertyContracts.length})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {activeTab === "assets" && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Equipment Assets</Text>
                {isAdmin && (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAssetModal(true)}
                  >
                    <Plus color={Colors.light.primary} size={18} />
                    <Text style={styles.addButtonText}>Add Asset</Text>
                  </TouchableOpacity>
                )}
              </View>

              {propertyAssets.map((asset) => (
                <View key={asset.id} style={styles.assetCard}>
                  <View style={styles.assetHeader}>
                    <View style={styles.assetInfo}>
                      <Text style={styles.assetName}>{asset.name}</Text>
                      <Text style={styles.assetType}>
                        {asset.assetType.toUpperCase()} • {asset.location}
                      </Text>
                    </View>
                    {isAdmin && (
                      <View style={styles.assetActions}>
                        <TouchableOpacity 
                          style={styles.iconButton}
                          onPress={() => handleShowQR(asset)}
                        >
                          <QrCode color={Colors.light.primary} size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.iconButton}
                          onPress={() => handleDeleteAsset(asset.id)}
                        >
                          <Trash2 color={Colors.light.error} size={20} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  {(asset.modelNumber || asset.serialNumber) && (
                    <View style={styles.assetDetails}>
                      {asset.modelNumber && (
                        <Text style={styles.assetDetail}>Model: {asset.modelNumber}</Text>
                      )}
                      {asset.serialNumber && (
                        <Text style={styles.assetDetail}>S/N: {asset.serialNumber}</Text>
                      )}
                    </View>
                  )}
                  
                  {asset.notes && (
                    <View style={styles.assetNotes}>
                      <Text style={styles.assetNotesText}>{asset.notes}</Text>
                    </View>
                  )}
                  
                  {asset.maintenanceHistory.length > 0 && (
                    <View style={styles.maintenanceCount}>
                      <Calendar color={Colors.light.muted} size={14} />
                      <Text style={styles.maintenanceCountText}>
                        {asset.maintenanceHistory.length} maintenance record(s)
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {propertyAssets.length === 0 && (
                <View style={styles.emptyState}>
                  <Book color={Colors.light.muted} size={48} strokeWidth={1.5} />
                  <Text style={styles.emptyStateText}>No equipment assets yet</Text>
                  {isAdmin && (
                    <Text style={styles.emptyStateSubtext}>
                      Add equipment to track with QR codes
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === "contracts" && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Maintenance Contracts</Text>
                {isAdmin && (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowContractModal(true)}
                  >
                    <Plus color={Colors.light.primary} size={18} />
                    <Text style={styles.addButtonText}>Add Contract</Text>
                  </TouchableOpacity>
                )}
              </View>

              {propertyContracts.map((contract) => (
                <View key={contract.id} style={styles.contractCard}>
                  <View style={styles.contractHeader}>
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractName}>{contract.contractName}</Text>
                      <Text style={styles.contractDescription}>{contract.description}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      {getStatusIcon(contract.status)}
                      <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
                        {contract.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.contractDetails}>
                    <View style={styles.contractDetailRow}>
                      <Text style={styles.contractDetailLabel}>Frequency:</Text>
                      <Text style={styles.contractDetailValue}>
                        {contract.frequency.charAt(0).toUpperCase() + contract.frequency.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.contractDetailRow}>
                      <Text style={styles.contractDetailLabel}>Next Visit:</Text>
                      <Text style={styles.contractDetailValue}>
                        {new Date(contract.nextVisitDate).toLocaleDateString()}
                      </Text>
                    </View>
                    {contract.contractValue && (
                      <View style={styles.contractDetailRow}>
                        <Text style={styles.contractDetailLabel}>Value:</Text>
                        <Text style={styles.contractDetailValue}>
                          ${contract.contractValue.toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {contract.notes && (
                    <View style={styles.contractNotes}>
                      <Text style={styles.contractNotesText}>{contract.notes}</Text>
                    </View>
                  )}
                </View>
              ))}

              {propertyContracts.length === 0 && (
                <View style={styles.emptyState}>
                  <ClipboardList color={Colors.light.muted} size={48} strokeWidth={1.5} />
                  <Text style={styles.emptyStateText}>No maintenance contracts yet</Text>
                  {isAdmin && (
                    <Text style={styles.emptyStateSubtext}>
                      Create contracts for recurring maintenance
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAssetModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAssetModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Equipment Asset</Text>
              <TouchableOpacity onPress={() => setShowAssetModal(false)}>
                <ArrowLeft color={Colors.light.muted} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Asset Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Rooftop Unit #4"
                  placeholderTextColor={Colors.light.muted}
                  value={assetForm.name}
                  onChangeText={(text) => setAssetForm({ ...assetForm, name: text })}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                  {(["hvac", "electrical", "plumbing", "structural", "other"] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        assetForm.assetType === type && styles.typeButtonActive,
                      ]}
                      onPress={() => setAssetForm({ ...assetForm, assetType: type })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          assetForm.assetType === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Location *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Rooftop, Building A"
                  placeholderTextColor={Colors.light.muted}
                  value={assetForm.location}
                  onChangeText={(text) => setAssetForm({ ...assetForm, location: text })}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Model Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Optional"
                  placeholderTextColor={Colors.light.muted}
                  value={assetForm.modelNumber}
                  onChangeText={(text) => setAssetForm({ ...assetForm, modelNumber: text })}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Serial Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Optional"
                  placeholderTextColor={Colors.light.muted}
                  value={assetForm.serialNumber}
                  onChangeText={(text) => setAssetForm({ ...assetForm, serialNumber: text })}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Additional information"
                  placeholderTextColor={Colors.light.muted}
                  value={assetForm.notes}
                  onChangeText={(text) => setAssetForm({ ...assetForm, notes: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAssetModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAsset}
              >
                <Text style={styles.saveButtonText}>Save Asset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showContractModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowContractModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Maintenance Contract</Text>
              <TouchableOpacity onPress={() => setShowContractModal(false)}>
                <ArrowLeft color={Colors.light.muted} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Contract Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Quarterly HVAC Maintenance"
                  placeholderTextColor={Colors.light.muted}
                  value={contractForm.contractName}
                  onChangeText={(text) => setContractForm({ ...contractForm, contractName: text })}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Description *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="What services are included?"
                  placeholderTextColor={Colors.light.muted}
                  value={contractForm.description}
                  onChangeText={(text) => setContractForm({ ...contractForm, description: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Frequency</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                  {(["monthly", "quarterly", "semi-annual", "annual"] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.typeButton,
                        contractForm.frequency === freq && styles.typeButtonActive,
                      ]}
                      onPress={() => setContractForm({ ...contractForm, frequency: freq })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          contractForm.frequency === freq && styles.typeButtonTextActive,
                        ]}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Contract Value ($)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Optional"
                  placeholderTextColor={Colors.light.muted}
                  value={contractForm.contractValue}
                  onChangeText={(text) => setContractForm({ ...contractForm, contractValue: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Next Visit Date</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.light.muted}
                  value={contractForm.nextVisitDate}
                  onChangeText={(text) => setContractForm({ ...contractForm, nextVisitDate: text })}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Additional information"
                  placeholderTextColor={Colors.light.muted}
                  value={contractForm.notes}
                  onChangeText={(text) => setContractForm({ ...contractForm, notes: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowContractModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveContract}
              >
                <Text style={styles.saveButtonText}>Save Contract</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showQRModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <TouchableOpacity
              style={styles.qrCloseButton}
              onPress={() => setShowQRModal(false)}
            >
              <ArrowLeft color={Colors.light.muted} size={24} />
            </TouchableOpacity>
            
            {qrAsset && (
              <>
                <Text style={styles.qrTitle}>{qrAsset.name}</Text>
                <Text style={styles.qrSubtitle}>{qrAsset.location}</Text>
                
                <View style={styles.qrCodeContainer}>
                  <View style={styles.qrPlaceholder}>
                    <QrCode color={Colors.light.primary} size={120} />
                  </View>
                </View>
                
                <Text style={styles.qrInstructions}>
                  Scan this QR code to view asset details and maintenance history
                </Text>
                <Text style={styles.qrCode}>{qrAsset.qrCodeValue}</Text>
              </>
            )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerBackButton: {
    marginLeft: 8,
  },
  headerEditButton: {
    marginRight: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.error,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  headerCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  clientText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  propertyInfo: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tabButtonActive: {
    backgroundColor: `${Colors.light.primary}10`,
    borderColor: Colors.light.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.muted,
  },
  tabButtonTextActive: {
    color: Colors.light.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  assetCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  assetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  assetType: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  assetActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  assetDetails: {
    marginBottom: 8,
  },
  assetDetail: {
    fontSize: 13,
    color: Colors.light.text,
    marginBottom: 2,
  },
  assetNotes: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  assetNotesText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  maintenanceCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  maintenanceCountText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  contractCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contractHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  contractInfo: {
    flex: 1,
    marginRight: 12,
  },
  contractName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  contractDescription: {
    fontSize: 13,
    color: Colors.light.muted,
    lineHeight: 18,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  contractDetails: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  contractDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contractDetailLabel: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  contractDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
  contractNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  contractNotesText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.muted,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
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
    fontWeight: "700",
    color: Colors.light.text,
  },
  modalBody: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    height: 100,
  },
  typeSelector: {
    flexDirection: "row",
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: `${Colors.light.primary}10`,
    borderColor: Colors.light.primary,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.muted,
  },
  typeButtonTextActive: {
    color: Colors.light.primary,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  qrCloseButton: {
    position: "absolute" as const,
    top: 16,
    right: 16,
    padding: 8,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: "center",
  },
  qrSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 24,
    textAlign: "center",
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 20,
  },
  qrInstructions: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 12,
  },
  qrCode: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: Colors.light.muted,
  },
  qrPlaceholder: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
});
