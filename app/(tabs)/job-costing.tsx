import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Plus,
  Filter,
  Package,
  Fuel,
  Wrench,
  Users as UsersIcon,
  MoreHorizontal,
  X,
  Camera,
  Upload,
  Check,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Edit3,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { mockJobs } from "@/mocks/jobs";
import { Job, Receipt as ReceiptType } from "@/types";

const { width } = Dimensions.get("window");

export default function JobCostingScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | ReceiptType["category"]>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [newReceipt, setNewReceipt] = useState<{
    jobId: string;
    imageUrl: string;
    amount: string;
    category: ReceiptType["category"];
    vendor: string;
    date: string;
    description: string;
  }>({
    jobId: "",
    imageUrl: "",
    amount: "",
    category: "materials",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedJobForNotes, setSelectedJobForNotes] = useState<string | null>(null);
  const [jobCostingNotes, setJobCostingNotes] = useState<Record<string, string>>({});
  const [tempNoteText, setTempNoteText] = useState("");

  const [costChecklist, setCostChecklist] = useState([
    { id: "1", task: "All receipts uploaded and categorized", completed: false },
    { id: "2", task: "Amounts verified against budget", completed: false },
    { id: "3", task: "Subcontractor invoices received", completed: false },
    { id: "4", task: "Materials costs reconciled", completed: false },
    { id: "5", task: "Fuel and equipment costs logged", completed: false },
    { id: "6", task: "Labor hours and costs calculated", completed: false },
    { id: "7", task: "Final cost matches budget expectations", completed: false },
    { id: "8", task: "Receipts ready for tax filing", completed: false },
  ]);

  const filteredJobs = useMemo(() => {
    let jobs = mockJobs.filter(job => job.budgetedCost !== undefined);
    
    if (selectedFilter === "active") {
      jobs = jobs.filter(j => j.status === "in-progress" || j.status === "scheduled");
    } else if (selectedFilter === "completed") {
      jobs = jobs.filter(j => j.status === "completed");
    }
    
    return jobs;
  }, [selectedFilter]);

  const allReceipts = useMemo(() => {
    const receipts: ReceiptType[] = [];
    mockJobs.forEach(job => {
      if (job.receipts) {
        receipts.push(...job.receipts);
      }
    });
    
    if (selectedCategory !== "all") {
      return receipts.filter(r => r.category === selectedCategory);
    }
    
    return receipts;
  }, [selectedCategory]);

  const stats = useMemo(() => {
    const totalBudgeted = filteredJobs.reduce((sum, job) => sum + (job.budgetedCost || 0), 0);
    const totalActual = filteredJobs.reduce((sum, job) => sum + (job.actualCost || 0), 0);
    const profitMargin = totalBudgeted > 0 ? ((totalBudgeted - totalActual) / totalBudgeted) * 100 : 0;
    
    return { totalBudgeted, totalActual, profitMargin };
  }, [filteredJobs]);

  const getCategoryIcon = (category: ReceiptType["category"]) => {
    const iconProps = { size: 18, color: Colors.light.primary };
    switch (category) {
      case "materials": return <Package {...iconProps} />;
      case "fuel": return <Fuel {...iconProps} />;
      case "rental": return <Wrench {...iconProps} />;
      case "subcontractor": return <UsersIcon {...iconProps} />;
      default: return <MoreHorizontal {...iconProps} />;
    }
  };

  const getStatusColor = (job: Job) => {
    if (!job.budgetedCost) return Colors.light.muted;
    
    const actual = job.actualCost || 0;
    const budget = job.budgetedCost;
    const percentUsed = (actual / budget) * 100;
    
    if (percentUsed >= 100) return "#EF4444";
    if (percentUsed >= 80) return "#F59E0B";
    return "#10B981";
  };

  const getStatusText = (job: Job) => {
    if (!job.budgetedCost) return t("jobCosting.noReceipts");
    
    const actual = job.actualCost || 0;
    const budget = job.budgetedCost;
    const percentUsed = (actual / budget) * 100;
    
    if (percentUsed >= 100) return t("jobCosting.overBudget");
    if (percentUsed >= 80) return t("jobCosting.atRisk");
    return t("jobCosting.onTrack");
  };

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
      Alert.alert(
        "Receipt Uploaded",
        "Receipt has been saved and stored for tax purposes. Cost has been calculated against your budget."
      );
      
      setNewReceipt({
        jobId: "",
        imageUrl: "",
        amount: "",
        category: "materials",
        vendor: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }, 1500);
  };

  const toggleChecklistItem = (id: string) => {
    setCostChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const checklistProgress = useMemo(() => {
    const completed = costChecklist.filter(item => item.completed).length;
    return (completed / costChecklist.length) * 100;
  }, [costChecklist]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{t("jobCosting.title")}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <Text style={styles.statsTitle}>{t("jobCosting.overview")}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t("jobCosting.totalBudgeted")}</Text>
              <Text style={styles.statValue}>${stats.totalBudgeted.toLocaleString()}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t("jobCosting.totalActual")}</Text>
              <Text style={styles.statValue}>${stats.totalActual.toLocaleString()}</Text>
            </View>
            
            <View style={[styles.statItem, styles.statItemFull]}>
              <Text style={styles.statLabel}>{t("jobCosting.profitMargin")}</Text>
              <View style={styles.profitRow}>
                <Text style={styles.statValue}>{stats.profitMargin.toFixed(1)}%</Text>
                {stats.profitMargin >= 0 ? (
                  <TrendingUp size={24} color="#fff" />
                ) : (
                  <TrendingDown size={24} color="#fff" />
                )}
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "all" && styles.filterButtonActive]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text style={[styles.filterText, selectedFilter === "all" && styles.filterTextActive]}>
              {t("jobCosting.allJobs")}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "active" && styles.filterButtonActive]}
            onPress={() => setSelectedFilter("active")}
          >
            <Text style={[styles.filterText, selectedFilter === "active" && styles.filterTextActive]}>
              {t("jobCosting.activeJobs")}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "completed" && styles.filterButtonActive]}
            onPress={() => setSelectedFilter("completed")}
          >
            <Text style={[styles.filterText, selectedFilter === "completed" && styles.filterTextActive]}>
              {t("jobCosting.completedJobs")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("jobCosting.allJobs")}</Text>
            <Filter size={20} color={Colors.light.muted} />
          </View>

          {filteredJobs.map((job) => {
            const actual = job.actualCost || 0;
            const budget = job.budgetedCost || 0;
            const remaining = budget - actual;
            const percentUsed = budget > 0 ? (actual / budget) * 100 : 0;
            
            return (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => router.push(`/job-detail?id=${job.id}`)}
              >
                <View style={styles.jobHeader}>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobName}>{job.clientName}</Text>
                    <Text style={styles.jobService}>{job.service}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(job)}15` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(job) }]}>
                      {getStatusText(job)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(percentUsed, 100)}%`,
                          backgroundColor: getStatusColor(job),
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{percentUsed.toFixed(0)}%</Text>
                </View>

                <View style={styles.costRow}>
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>{t("jobCosting.budget")}</Text>
                    <Text style={styles.costValue}>${budget.toLocaleString()}</Text>
                  </View>
                  
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>{t("jobCosting.actual")}</Text>
                    <Text style={styles.costValue}>${actual.toLocaleString()}</Text>
                  </View>
                  
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>{remaining >= 0 ? t("jobCosting.remaining") : t("jobCosting.overBudget")}</Text>
                    <Text style={[styles.costValue, { color: remaining >= 0 ? "#10B981" : "#EF4444" }]}>
                      ${Math.abs(remaining).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.jobFooter}>
                  {job.receipts && job.receipts.length > 0 && (
                    <View style={styles.receiptsSummary}>
                      <Receipt size={16} color={Colors.light.muted} />
                      <Text style={styles.receiptsSummaryText}>
                        {job.receipts.length} {t("jobCosting.receipts")}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.notesButton}
                    onPress={() => {
                      setSelectedJobForNotes(job.id);
                      setTempNoteText(jobCostingNotes[job.id] || "");
                      setShowNotesModal(true);
                    }}
                  >
                    <Edit3 size={16} color={Colors.light.primary} />
                    <Text style={styles.notesButtonText}>Notes</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("jobCosting.receipts")}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowChecklistModal(true)}
              >
                <FileText size={18} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowUploadModal(true)}
              >
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === "all" && styles.categoryChipActive]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text style={[styles.categoryChipText, selectedCategory === "all" && styles.categoryChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === "materials" && styles.categoryChipActive]}
              onPress={() => setSelectedCategory("materials")}
            >
              <Package size={16} color={selectedCategory === "materials" ? "#fff" : Colors.light.muted} />
              <Text style={[styles.categoryChipText, selectedCategory === "materials" && styles.categoryChipTextActive]}>
                {t("jobCosting.materials")}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === "fuel" && styles.categoryChipActive]}
              onPress={() => setSelectedCategory("fuel")}
            >
              <Fuel size={16} color={selectedCategory === "fuel" ? "#fff" : Colors.light.muted} />
              <Text style={[styles.categoryChipText, selectedCategory === "fuel" && styles.categoryChipTextActive]}>
                {t("jobCosting.fuel")}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === "rental" && styles.categoryChipActive]}
              onPress={() => setSelectedCategory("rental")}
            >
              <Wrench size={16} color={selectedCategory === "rental" ? "#fff" : Colors.light.muted} />
              <Text style={[styles.categoryChipText, selectedCategory === "rental" && styles.categoryChipTextActive]}>
                {t("jobCosting.rental")}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === "subcontractor" && styles.categoryChipActive]}
              onPress={() => setSelectedCategory("subcontractor")}
            >
              <UsersIcon size={16} color={selectedCategory === "subcontractor" ? "#fff" : Colors.light.muted} />
              <Text style={[styles.categoryChipText, selectedCategory === "subcontractor" && styles.categoryChipTextActive]}>
                {t("jobCosting.subcontractor")}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === "other" && styles.categoryChipActive]}
              onPress={() => setSelectedCategory("other")}
            >
              <Text style={[styles.categoryChipText, selectedCategory === "other" && styles.categoryChipTextActive]}>
                {t("jobCosting.other")}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {allReceipts.length > 0 ? (
            allReceipts.map((receipt) => (
              <View key={receipt.id} style={styles.receiptCard}>
                <View style={styles.receiptHeader}>
                  <View style={styles.receiptIcon}>
                    {getCategoryIcon(receipt.category)}
                  </View>
                  <View style={styles.receiptInfo}>
                    <Text style={styles.receiptVendor}>{receipt.vendor}</Text>
                    <Text style={styles.receiptDescription}>{receipt.description}</Text>
                    <Text style={styles.receiptDate}>{new Date(receipt.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.receiptAmount}>${receipt.amount.toLocaleString()}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Receipt size={48} color={Colors.light.muted} />
              <Text style={styles.emptyText}>{t("jobCosting.noReceipts")}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Receipt</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.imageUploadSection}>
              {newReceipt.imageUrl ? (
                <View style={styles.imagePreview}>
                  <Text style={styles.imagePreviewText}>Receipt Image Selected</Text>
                  <TouchableOpacity 
                    style={styles.changeImageButton}
                    onPress={pickReceiptImage}
                  >
                    <Text style={styles.changeImageText}>Change</Text>
                  </TouchableOpacity>
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

            <View style={styles.formSection}>
              <Text style={styles.label}>Job *</Text>
              <View style={styles.inputWrapper}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.jobsScroll}
                >
                  {filteredJobs.map((job) => (
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
                  style={styles.input}
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

              <Text style={styles.label}>Vendor *</Text>
              <TextInput
                style={styles.textInput}
                value={newReceipt.vendor}
                onChangeText={(text) => setNewReceipt({ ...newReceipt, vendor: text })}
                placeholder="Home Depot, Vendor Name, etc."
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Date *</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color={Colors.light.muted} />
                <TextInput
                  style={styles.input}
                  value={newReceipt.date}
                  onChangeText={(text) => setNewReceipt({ ...newReceipt, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newReceipt.description}
                onChangeText={(text) => setNewReceipt({ ...newReceipt, description: text })}
                placeholder="What was purchased?"
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />

              <View style={styles.taxNote}>
                <FileText size={16} color={Colors.light.primary} />
                <Text style={styles.taxNoteText}>
                  All receipts are automatically organized and stored for tax filing purposes
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowUploadModal(false)}
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
                <Text style={styles.submitButtonText}>Upload Receipt</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showChecklistModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChecklistModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cost Verification Checklist</Text>
            <TouchableOpacity onPress={() => setShowChecklistModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.checklistProgress}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Completion</Text>
              <Text style={styles.progressValue}>{checklistProgress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBarLarge}>
              <View 
                style={[styles.progressFillLarge, { width: `${checklistProgress}%` }]} 
              />
            </View>
          </View>

          <ScrollView style={styles.checklistContent}>
            <Text style={styles.checklistDescription}>
              Complete this checklist to ensure accurate cost tracking and tax-ready documentation
            </Text>

            {costChecklist.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() => toggleChecklistItem(item.id)}
              >
                <View style={[
                  styles.checkbox,
                  item.completed && styles.checkboxChecked
                ]}>
                  {item.completed && <Check size={18} color="#fff" />}
                </View>
                <Text style={[
                  styles.checklistItemText,
                  item.completed && styles.checklistItemTextCompleted
                ]}>
                  {item.task}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.checklistFooter}>
              <FileText size={20} color={Colors.light.primary} />
              <Text style={styles.checklistFooterText}>
                Completing this checklist ensures your receipts are organized, costs are accurate, and everything is ready for tax season
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => setShowChecklistModal(false)}
            >
              <Text style={styles.submitButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Job Costing Notes</Text>
            <TouchableOpacity onPress={() => setShowNotesModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Notes & Comments</Text>
              <TextInput
                style={[styles.textInput, styles.notesTextArea]}
                value={tempNoteText}
                onChangeText={setTempNoteText}
                placeholder="Add notes about costs, budget adjustments, vendor issues, or any other important information..."
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={10}
              />
              
              <View style={styles.noteHint}>
                <FileText size={16} color={Colors.light.primary} />
                <Text style={styles.noteHintText}>
                  These notes are stored with the job costing record and can help track budget decisions, cost variances, and vendor performance.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowNotesModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => {
                if (selectedJobForNotes) {
                  setJobCostingNotes({
                    ...jobCostingNotes,
                    [selectedJobForNotes]: tempNoteText,
                  });
                  Alert.alert("Success", "Notes saved successfully");
                }
                setShowNotesModal(false);
              }}
            >
              <Text style={styles.submitButtonText}>Save Notes</Text>
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
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: (width - 88) / 2,
  },
  statItemFull: {
    minWidth: width - 88,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
  },
  profitRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  filterContainer: {
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    textAlign: "center" as const,
  },
  filterTextActive: {
    color: "#fff",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  jobCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  jobHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 16,
  },
  jobInfo: {
    flex: 1,
  },
  jobName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  jobService: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    minWidth: 40,
    textAlign: "right" as const,
  },
  costRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 16,
  },
  costItem: {
    flex: 1,
  },
  costLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  costValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  receiptsSummary: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  receiptsSummaryText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.muted,
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  receiptCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  receiptHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptVendor: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  receiptDescription: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 2,
  },
  receiptDate: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.muted,
    marginTop: 16,
  },
  headerActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.card,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageUploadSection: {
    marginBottom: 24,
  },
  uploadButtons: {
    flexDirection: "row" as const,
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center" as const,
  },
  imagePreview: {
    backgroundColor: `${Colors.light.primary}15`,
    borderRadius: 12,
    padding: 20,
    alignItems: "center" as const,
    gap: 12,
  },
  imagePreviewText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  changeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  formSection: {
    gap: 16,
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
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  categorySelectChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  textInput: {
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
    textAlignVertical: "top" as const,
  },
  budgetAlert: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
    padding: 16,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  taxNoteText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: "row" as const,
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
    alignItems: "center" as const,
    justifyContent: "center" as const,
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
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  checklistProgress: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  progressInfo: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  progressBarLarge: {
    height: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 6,
    overflow: "hidden" as const,
  },
  progressFillLarge: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
  },
  checklistContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  checklistDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 24,
    lineHeight: 20,
  },
  checklistItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checklistItemText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  checklistItemTextCompleted: {
    color: Colors.light.muted,
    textDecorationLine: "line-through" as const,
  },
  checklistFooter: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
    padding: 16,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  checklistFooterText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  jobFooter: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  notesButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Colors.light.primary}15`,
    borderRadius: 8,
  },
  notesButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  notesTextArea: {
    minHeight: 200,
    textAlignVertical: "top" as const,
  },
  noteHint: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
    padding: 16,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 12,
    marginTop: 12,
  },
  noteHintText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
});
