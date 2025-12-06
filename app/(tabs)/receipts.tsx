import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Receipt as ReceiptIcon, Search, Package, Fuel, Wrench, Users as UsersIcon, FileText, Plus, Camera, Upload, X, DollarSign, Calendar, AlertTriangle, Hash, CreditCard, MapPin, Edit2, Trash2, Eye, CheckCircle } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { mockJobs } from "@/mocks/jobs";
import { Receipt } from "@/types";
import { useData } from "@/contexts/DataContext";

export default function ReceiptsScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [newReceipt, setNewReceipt] = useState<{
    id?: string;
    jobId: string;
    imageUrl: string;
    amount: string;
    category: Receipt["category"];
    vendor: string;
    date: string;
    description: string;
    receiptNumber: string;
    paymentMethod: string;
    taxAmount: string;
    projectName: string;
    location: string;
    notes: string;
  }>({
    jobId: "",
    imageUrl: "",
    amount: "",
    category: "materials",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    receiptNumber: "",
    paymentMethod: "card",
    taxAmount: "",
    projectName: "",
    location: "",
    notes: "",
  });
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  const allReceipts: (Receipt & { clientName: string; jobName: string })[] = useMemo(() => {
    const receipts: (Receipt & { clientName: string; jobName: string })[] = [];
    mockJobs.forEach((job) => {
      if (job.receipts) {
        job.receipts.forEach((receipt) => {
          receipts.push({
            ...receipt,
            clientName: job.clientName,
            jobName: job.service,
          });
        });
      }
    });
    return receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const filteredReceipts = useMemo(() => {
    return allReceipts.filter((receipt) => {
      const matchesSearch =
        receipt.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || receipt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allReceipts, searchQuery, selectedCategory]);

  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);

  const categories = [
    { id: "all", label: "All", icon: null },
    { id: "materials", label: "Materials", icon: Package },
    { id: "fuel", label: "Fuel", icon: Fuel },
    { id: "rental", label: "Rental", icon: Wrench },
    { id: "subcontractor", label: "Subcontractor", icon: UsersIcon },
    { id: "other", label: "Other", icon: null },
  ];

  const jobsWithBudgets = useMemo(() => {
    return mockJobs.filter(job => job.budgetedCost !== undefined);
  }, []);

  const pickReceiptImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions to upload receipts");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewReceipt({ ...newReceipt, imageUrl: result.assets[0].uri });
    }
  };

  const takeReceiptPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera permissions to take receipt photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewReceipt({ ...newReceipt, imageUrl: result.assets[0].uri });
    }
  };

  const handleUploadReceipt = async () => {
    if (!newReceipt.jobId || !newReceipt.amount || !newReceipt.vendor || !newReceipt.imageUrl) {
      Alert.alert("Missing Information", "Please fill in all required fields and upload a receipt image");
      return;
    }

    const amount = parseFloat(newReceipt.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    const job = mockJobs.find(j => j.id === newReceipt.jobId);
    if (job && job.budgetedCost) {
      const newActualCost = (job.actualCost || 0) + amount;
      const remaining = job.budgetedCost - newActualCost;
      
      if (remaining < 0) {
        Alert.alert(
          "Budget Alert",
          `This receipt will put the job ${Math.abs(remaining).toLocaleString()} over budget. Do you want to proceed?`,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Proceed", 
              style: "destructive",
              onPress: () => uploadReceipt()
            }
          ]
        );
        return;
      } else if (remaining < job.budgetedCost * 0.1) {
        Alert.alert(
          "Budget Warning",
          `Only ${remaining.toLocaleString()} remaining in budget after this receipt.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Continue", onPress: () => uploadReceipt() }
          ]
        );
        return;
      }
    }

    uploadReceipt();
  };

  const uploadReceipt = () => {
    setUploadingReceipt(true);
    
    setTimeout(() => {
      console.log("Receipt uploaded:", newReceipt);
      setUploadingReceipt(false);
      setShowUploadModal(false);
      setEditingReceipt(null);
      Alert.alert(
        editingReceipt ? "Receipt Updated" : "Receipt Uploaded",
        editingReceipt 
          ? "Receipt has been updated successfully."
          : "Receipt has been saved and stored for tax purposes. Cost has been calculated against your budget."
      );
      
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setNewReceipt({
      jobId: "",
      imageUrl: "",
      amount: "",
      category: "materials",
      vendor: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      receiptNumber: "",
      paymentMethod: "card",
      taxAmount: "",
      projectName: "",
      location: "",
      notes: "",
    });
  };

  const handleEditReceipt = (receipt: Receipt & { clientName: string; jobName: string }) => {
    setEditingReceipt(receipt);
    setNewReceipt({
      id: receipt.id,
      jobId: receipt.jobId,
      imageUrl: receipt.imageUrl,
      amount: receipt.amount.toString(),
      category: receipt.category,
      vendor: receipt.vendor,
      date: receipt.date,
      description: receipt.description,
      receiptNumber: (receipt as any).receiptNumber || "",
      paymentMethod: (receipt as any).paymentMethod || "card",
      taxAmount: (receipt as any).taxAmount?.toString() || "",
      projectName: (receipt as any).projectName || "",
      location: (receipt as any).location || "",
      notes: receipt.notes || "",
    });
    setShowUploadModal(true);
  };

  const handleDeleteReceipt = (receipt: Receipt) => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            console.log("Receipt deleted:", receipt.id);
            Alert.alert("Success", "Receipt has been deleted.");
          }
        }
      ]
    );
  };

  const handleViewReceipt = (receipt: Receipt & { clientName: string; jobName: string }) => {
    setViewingReceipt(receipt);
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setEditingReceipt(null);
    resetForm();
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 20, color: Colors.light.primary };
    switch (category) {
      case "materials":
        return <Package {...iconProps} />;
      case "fuel":
        return <Fuel {...iconProps} />;
      case "rental":
        return <Wrench {...iconProps} />;
      case "subcontractor":
        return <UsersIcon {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{t("jobCosting.receipts")}</Text>
            <Text style={styles.subtitle}>Track all expenses</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowUploadModal(true)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <ReceiptIcon color="#FFF" size={24} />
        </View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryValue}>${totalAmount.toLocaleString()}</Text>
          <Text style={styles.summaryCount}>{filteredReceipts.length} receipts</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color={Colors.light.muted} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search receipts..."
            placeholderTextColor={Colors.light.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            {category.icon && (
              React.createElement(category.icon, {
                size: 16,
                color: selectedCategory === category.id ? "#fff" : Colors.light.muted,
              })
            )}
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView}>
        {filteredReceipts.length === 0 ? (
          <View style={styles.emptyState}>
            <ReceiptIcon color={Colors.light.muted} size={48} />
            <Text style={styles.emptyStateText}>No receipts found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Receipts will appear here"}
            </Text>
          </View>
        ) : (
          filteredReceipts.map((receipt) => {
            const IconComponent = getCategoryIcon(receipt.category);
            return (
              <View key={receipt.id} style={styles.receiptCard}>
                <TouchableOpacity 
                  style={styles.receiptMainContent}
                  onPress={() => handleViewReceipt(receipt)}
                >
                  <View style={styles.receiptIconContainer}>
                    {IconComponent}
                  </View>
                  <View style={styles.receiptInfo}>
                    <Text style={styles.receiptVendor}>{receipt.vendor}</Text>
                    <Text style={styles.receiptDescription} numberOfLines={1}>
                      {receipt.description}
                    </Text>
                    <Text style={styles.receiptMeta}>
                      {receipt.clientName} • {new Date(receipt.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.receiptRightSection}>
                    <Text style={styles.receiptAmount}>${receipt.amount.toLocaleString()}</Text>
                    {(receipt as any).taxAmount && (
                      <Text style={styles.receiptTax}>+${(receipt as any).taxAmount} tax</Text>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.receiptActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewReceipt(receipt)}
                  >
                    <Eye size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditReceipt(receipt)}
                  >
                    <Edit2 size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteReceipt(receipt)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{editingReceipt ? "Edit Receipt" : "New Receipt"}</Text>
              <Text style={styles.modalSubtitle}>Enter all receipt details</Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <ScrollView 
              style={styles.modalContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Receipt Image</Text>
              <View style={styles.imageUploadSection}>
                {newReceipt.imageUrl ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: newReceipt.imageUrl }} 
                      style={styles.receiptImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <TouchableOpacity 
                        style={styles.changeImageButton}
                        onPress={pickReceiptImage}
                      >
                        <Upload size={18} color="#fff" />
                        <Text style={styles.changeImageText}>Change Image</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadButtons}>
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={takeReceiptPhoto}
                    >
                      <Camera size={32} color={Colors.light.primary} />
                      <Text style={styles.uploadButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={pickReceiptImage}
                    >
                      <Upload size={32} color={Colors.light.primary} />
                      <Text style={styles.uploadButtonText}>Upload from Gallery</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Receipt Information</Text>
              <View style={styles.formSection}>
              <Text style={styles.label}>Job *</Text>
              <View style={styles.inputWrapper}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.jobsScroll}
                >
                  {jobsWithBudgets.map((job) => (
                    <TouchableOpacity
                      key={job.id}
                      style={[
                        styles.jobSelectChip,
                        newReceipt.jobId === job.id && styles.jobSelectChipActive
                      ]}
                      onPress={() => setNewReceipt({ ...newReceipt, jobId: job.id })}
                    >
                      <Text style={[
                        styles.jobSelectChipText,
                        newReceipt.jobId === job.id && styles.jobSelectChipTextActive
                      ]}>
                        {job.clientName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryGrid}>
                {(["materials", "fuel", "rental", "subcontractor", "other"] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categorySelectChip,
                      newReceipt.category === cat && styles.categorySelectChipActive
                    ]}
                    onPress={() => setNewReceipt({ ...newReceipt, category: cat })}
                  >
                    {cat === "materials" && <Package size={18} color={newReceipt.category === cat ? "#fff" : Colors.light.muted} />}
                    {cat === "fuel" && <Fuel size={18} color={newReceipt.category === cat ? "#fff" : Colors.light.muted} />}
                    {cat === "rental" && <Wrench size={18} color={newReceipt.category === cat ? "#fff" : Colors.light.muted} />}
                    {cat === "subcontractor" && <UsersIcon size={18} color={newReceipt.category === cat ? "#fff" : Colors.light.muted} />}
                    <Text style={[
                      styles.categorySelectText,
                      newReceipt.category === cat && styles.categorySelectTextActive
                    ]}>
                      {t(`jobCosting.${cat}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Amount *</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={Colors.light.muted} />
                <TextInput
                  style={styles.inputField}
                  value={newReceipt.amount}
                  onChangeText={(text) => setNewReceipt({ ...newReceipt, amount: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              {newReceipt.jobId && newReceipt.amount && (() => {
                const job = mockJobs.find(j => j.id === newReceipt.jobId);
                if (job && job.budgetedCost) {
                  const amount = parseFloat(newReceipt.amount) || 0;
                  const newActualCost = (job.actualCost || 0) + amount;
                  const remaining = job.budgetedCost - newActualCost;
                  const isOverBudget = remaining < 0;
                  const isNearLimit = remaining < job.budgetedCost * 0.1 && remaining >= 0;
                  
                  if (isOverBudget || isNearLimit) {
                    return (
                      <View style={[styles.budgetAlert, isOverBudget ? styles.budgetAlertDanger : styles.budgetAlertWarning]}>
                        <AlertTriangle size={18} color={isOverBudget ? "#EF4444" : "#F59E0B"} />
                        <Text style={[styles.budgetAlertText, isOverBudget ? styles.budgetAlertTextDanger : styles.budgetAlertTextWarning]}>
                          {isOverBudget 
                            ? `This will exceed budget by ${Math.abs(remaining).toLocaleString()}`
                            : `Only ${remaining.toLocaleString()} remaining in budget`
                          }
                        </Text>
                      </View>
                    );
                  }
                }
                return null;
              })()}

              <Text style={styles.label}>Vendor / Supplier *</Text>
              <TextInput
                style={styles.textInputField}
                value={newReceipt.vendor}
                onChangeText={(text) => setNewReceipt({ ...newReceipt, vendor: text })}
                placeholder="Home Depot, Lowe's, etc."
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Receipt Number</Text>
              <View style={styles.inputContainer}>
                <Hash size={20} color={Colors.light.muted} />
                <TextInput
                  style={styles.inputField}
                  value={newReceipt.receiptNumber}
                  onChangeText={(text) => setNewReceipt({ ...newReceipt, receiptNumber: text })}
                  placeholder="Receipt #12345"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <Text style={styles.label}>Date *</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color={Colors.light.muted} />
                <TextInput
                  style={styles.inputField}
                  value={newReceipt.date}
                  onChangeText={(text) => setNewReceipt({ ...newReceipt, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <Text style={styles.label}>Tax Amount</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={Colors.light.muted} />
                <TextInput
                  style={styles.inputField}
                  value={newReceipt.taxAmount}
                  onChangeText={(text) => setNewReceipt({ ...newReceipt, taxAmount: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              {newReceipt.amount && newReceipt.taxAmount && (() => {
                const subtotal = parseFloat(newReceipt.amount) || 0;
                const tax = parseFloat(newReceipt.taxAmount) || 0;
                const total = subtotal + tax;
                return (
                  <View style={styles.totalCard}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Subtotal:</Text>
                      <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Tax:</Text>
                      <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.totalRowFinal]}>
                      <Text style={styles.totalLabelFinal}>Total:</Text>
                      <Text style={styles.totalValueFinal}>${total.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })()}

              <Text style={styles.label}>Payment Method *</Text>
              <View style={styles.paymentMethodGrid}>
                {[
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "cash", label: "Cash", icon: DollarSign },
                  { id: "check", label: "Check", icon: FileText },
                  { id: "other", label: "Other", icon: Package },
                ].map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodChip,
                      newReceipt.paymentMethod === method.id && styles.paymentMethodChipActive
                    ]}
                    onPress={() => setNewReceipt({ ...newReceipt, paymentMethod: method.id })}
                  >
                    {React.createElement(method.icon, {
                      size: 18,
                      color: newReceipt.paymentMethod === method.id ? "#fff" : Colors.light.muted
                    })}
                    <Text style={[
                      styles.paymentMethodText,
                      newReceipt.paymentMethod === method.id && styles.paymentMethodTextActive
                    ]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              <View style={styles.formSection}>
              <Text style={styles.label}>Project / Job Name</Text>
              <TextInput
                style={styles.textInputField}
                value={newReceipt.projectName}
                onChangeText={(text) => setNewReceipt({ ...newReceipt, projectName: text })}
                placeholder="Kitchen Renovation, Roof Repair, etc."
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Location</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color={Colors.light.muted} />
                <TextInput
                  style={styles.inputField}
                  value={newReceipt.location}
                  onChangeText={(text) => setNewReceipt({ ...newReceipt, location: text })}
                  placeholder="Store location or address"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.textInputField, styles.textArea]}
                value={newReceipt.description}
                onChangeText={(text) => setNewReceipt({ ...newReceipt, description: text })}
                placeholder="What was purchased? List items..."
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.textInputField, styles.textArea]}
                value={newReceipt.notes}
                onChangeText={(text) => setNewReceipt({ ...newReceipt, notes: text })}
                placeholder="Additional notes or comments..."
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />

              </View>
            </View>

            <View style={styles.taxNote}>
              <CheckCircle size={18} color={Colors.light.primary} />
              <Text style={styles.taxNoteText}>
                All receipts are automatically organized and stored for tax filing purposes. Keep this for your records.
              </Text>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
          </KeyboardAvoidingView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={closeModal}
              disabled={uploadingReceipt}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitButton, uploadingReceipt && styles.submitButtonDisabled]}
              onPress={handleUploadReceipt}
              disabled={uploadingReceipt}
            >
              {uploadingReceipt ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingReceipt ? "Update Receipt" : "Save Receipt"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={viewingReceipt !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewingReceipt(null)}
      >
        {viewingReceipt && (
          <SafeAreaView style={styles.viewModalContainer}>
            <View style={styles.viewModalHeader}>
              <Text style={styles.viewModalTitle}>Receipt Details</Text>
              <TouchableOpacity onPress={() => setViewingReceipt(null)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.viewModalContent}>
              {viewingReceipt.imageUrl && (
                <Image 
                  source={{ uri: viewingReceipt.imageUrl }} 
                  style={styles.viewReceiptImage}
                  resizeMode="contain"
                />
              )}
              
              <View style={styles.viewDetailCard}>
                <View style={styles.viewDetailRow}>
                  <Text style={styles.viewDetailLabel}>Vendor:</Text>
                  <Text style={styles.viewDetailValue}>{viewingReceipt.vendor}</Text>
                </View>
                <View style={styles.viewDetailRow}>
                  <Text style={styles.viewDetailLabel}>Amount:</Text>
                  <Text style={[styles.viewDetailValue, styles.viewDetailAmount]}>
                    ${viewingReceipt.amount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.viewDetailRow}>
                  <Text style={styles.viewDetailLabel}>Date:</Text>
                  <Text style={styles.viewDetailValue}>
                    {new Date(viewingReceipt.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.viewDetailRow}>
                  <Text style={styles.viewDetailLabel}>Category:</Text>
                  <View style={styles.viewCategoryBadge}>
                    {getCategoryIcon(viewingReceipt.category)}
                    <Text style={styles.viewCategoryText}>
                      {viewingReceipt.category.charAt(0).toUpperCase() + viewingReceipt.category.slice(1)}
                    </Text>
                  </View>
                </View>
                {(viewingReceipt as any).receiptNumber && (
                  <View style={styles.viewDetailRow}>
                    <Text style={styles.viewDetailLabel}>Receipt #:</Text>
                    <Text style={styles.viewDetailValue}>{(viewingReceipt as any).receiptNumber}</Text>
                  </View>
                )}
                {(viewingReceipt as any).paymentMethod && (
                  <View style={styles.viewDetailRow}>
                    <Text style={styles.viewDetailLabel}>Payment:</Text>
                    <Text style={styles.viewDetailValue}>
                      {(viewingReceipt as any).paymentMethod.charAt(0).toUpperCase() + (viewingReceipt as any).paymentMethod.slice(1)}
                    </Text>
                  </View>
                )}
                <View style={styles.viewDetailRow}>
                  <Text style={styles.viewDetailLabel}>Client:</Text>
                  <Text style={styles.viewDetailValue}>{(viewingReceipt as any).clientName}</Text>
                </View>
                <View style={styles.viewDetailRow}>
                  <Text style={styles.viewDetailLabel}>Job:</Text>
                  <Text style={styles.viewDetailValue}>{(viewingReceipt as any).jobName}</Text>
                </View>
              </View>

              {viewingReceipt.description && (
                <View style={styles.viewDetailCard}>
                  <Text style={styles.viewSectionTitle}>Description</Text>
                  <Text style={styles.viewDescription}>{viewingReceipt.description}</Text>
                </View>
              )}

              {viewingReceipt.notes && (
                <View style={styles.viewDetailCard}>
                  <Text style={styles.viewSectionTitle}>Notes</Text>
                  <Text style={styles.viewDescription}>{viewingReceipt.notes}</Text>
                </View>
              )}

              <View style={styles.viewActions}>
                <TouchableOpacity 
                  style={styles.viewActionButton}
                  onPress={() => {
                    setViewingReceipt(null);
                    handleEditReceipt(viewingReceipt as any);
                  }}
                >
                  <Edit2 size={20} color="#fff" />
                  <Text style={styles.viewActionButtonText}>Edit Receipt</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.viewActionButton, styles.viewActionButtonDanger]}
                  onPress={() => {
                    setViewingReceipt(null);
                    handleDeleteReceipt(viewingReceipt);
                  }}
                >
                  <Trash2 size={20} color="#fff" />
                  <Text style={styles.viewActionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  summaryCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFF",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600" as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  categoryChipTextActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  receiptCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  receiptMainContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  receiptRightSection: {
    alignItems: "flex-end",
  },
  receiptIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  receiptInfo: {
    flex: 1,
  },
  receiptVendor: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  receiptDescription: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 2,
  },
  receiptMeta: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  receiptTax: {
    fontSize: 11,
    color: Colors.light.muted,
    marginTop: 2,
  },
  receiptActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 6,
    gap: 6,
  },
  receiptAmount: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  closeButton: {
    padding: 4,
  },
  keyboardAvoid: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  imageUploadSection: {
    marginBottom: 0,
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  receiptImage: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.light.background,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    alignItems: "center",
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
  uploadButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
  },

  formSection: {
    gap: 16,
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: -8,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  jobsScroll: {
    flexGrow: 0,
  },
  jobSelectChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  jobSelectChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  jobSelectChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  jobSelectChipTextActive: {
    color: "#fff",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categorySelectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categorySelectChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categorySelectText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  categorySelectTextActive: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  textInputField: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  totalCard: {
    backgroundColor: `${Colors.light.primary}08`,
    borderRadius: 8,
    padding: 16,
    gap: 8,
    marginTop: -8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRowFinal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  totalLabelFinal: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  paymentMethodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paymentMethodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: "48%",
    flex: 1,
    maxWidth: "48%",
  },
  paymentMethodChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  paymentMethodTextActive: {
    color: "#fff",
  },
  budgetAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: -8,
  },
  budgetAlertWarning: {
    backgroundColor: "#FEF3C7",
  },
  budgetAlertDanger: {
    backgroundColor: "#FEE2E2",
  },
  budgetAlertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600" as const,
  },
  budgetAlertTextWarning: {
    color: "#92400E",
  },
  budgetAlertTextDanger: {
    color: "#991B1B",
  },
  taxNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  taxNoteText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 19,
  },
  viewModalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  viewModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  viewModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  viewModalContent: {
    flex: 1,
    padding: 20,
  },
  viewReceiptImage: {
    width: "100%",
    height: 250,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 20,
  },
  viewDetailCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  viewDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewDetailLabel: {
    fontSize: 14,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  viewDetailValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
    flex: 1,
    textAlign: "right",
  },
  viewDetailAmount: {
    fontSize: 18,
    color: Colors.light.primary,
    fontWeight: "700" as const,
  },
  viewCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Colors.light.primary}15`,
    borderRadius: 6,
  },
  viewCategoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  viewSectionTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  viewDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  viewActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  viewActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  viewActionButtonDanger: {
    backgroundColor: "#EF4444",
  },
  viewActionButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
