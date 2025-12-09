import React, { useState, useMemo } from "react";
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
  FileText,
  Building2,
  Hammer,
  Shield,
  Sparkles,
  Check,
  Mail,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { ContractType, Contract } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getTradeServices } from "@/constants/trades";
import { trpc } from "@/lib/trpc";
import { useData } from "@/contexts/DataContext";
import { generateId } from "@/utils/id-generator";

export default function ContractEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = Boolean(params.id);
  const { organization } = useAuth();
  const { addContract, updateContract } = useData();

  const [contractType, setContractType] = useState<ContractType>("PROJECT_CONTRACT");
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [scopeOfWork, setScopeOfWork] = useState<string>("");
  const [warrantyYears, setWarrantyYears] = useState<string>("1");
  const [notes, setNotes] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceAmounts, setServiceAmounts] = useState<Record<string, string>>({});

  const [paymentMilestones, setPaymentMilestones] = useState<
    { id: string; description: string; percent: string }[]
  >([
    { id: "1", description: "Deposit", percent: "30" },
    { id: "2", description: "Progress Payment", percent: "40" },
    { id: "3", description: "Final Payment", percent: "30" },
  ]);

  const availableServices = useMemo(() => {
    if (!organization?.tradeType) return [];
    return getTradeServices(organization.tradeType);
  }, [organization?.tradeType]);

  const createContractMutation = trpc.contracts.createContract.useMutation();
  const sendContractMutation = trpc.contracts.sendContractForSigning.useMutation();

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

  const toggleService = (service: string) => {
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        const updated = prev.filter(s => s !== service);
        const amounts = { ...serviceAmounts };
        delete amounts[service];
        setServiceAmounts(amounts);
        return updated;
      } else {
        return [...prev, service];
      }
    });
  };

  const updateServiceAmount = (service: string, amount: string) => {
    setServiceAmounts(prev => ({
      ...prev,
      [service]: amount
    }));
  };

  const calculateTotalFromServices = (): number => {
    return selectedServices.reduce((sum, service) => {
      const amount = parseFloat(serviceAmounts[service] || "0");
      return sum + amount;
    }, 0);
  };

  const generateScopeFromServices = (): string => {
    if (selectedServices.length === 0) return scopeOfWork;
    const serviceList = selectedServices.map((service, idx) => {
      const amount = serviceAmounts[service] || "0";
      return `${idx + 1}. ${service} - ${parseFloat(amount).toLocaleString()}`;
    }).join("\n");
    return `${scopeOfWork}\n\nSelected Services:\n${serviceList}`;
  };

  const handleSaveDraft = async () => {
    if (!clientName || !projectName) {
      Alert.alert("Missing Information", "Please fill in at least client name and project name");
      return;
    }

    try {
      const finalTotal = selectedServices.length > 0 ? calculateTotalFromServices() : parseFloat(totalAmount || "0");
      const finalScope = generateScopeFromServices();

      const draftContract: Contract = {
        id: isEditing ? (params.id as string) : generateId("contract"),
        companyId: organization?.id || "demo",
        clientId: "demo-client",
        type: contractType as any,
        title: projectName,
        bodyHtml: `<h2>${projectName}</h2><p>${finalScope}</p>`,
        status: "DRAFT",
        totalAmount: finalTotal,
        startDateEstimated: startDate || undefined,
        endDateEstimated: endDate || undefined,
        createdByUserId: "current-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await updateContract(draftContract.id, draftContract);
        Alert.alert("Success", "Draft contract updated!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        await addContract(draftContract);
        Alert.alert("Success", "Draft contract saved!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }

      console.log("[Contract] Draft saved:", draftContract.id);
    } catch (error) {
      console.error("Error saving draft:", error);
      Alert.alert("Error", "Failed to save draft. Please try again.");
    }
  };

  const handlePreview = () => {
    console.log("Previewing contract...");
    Alert.alert("Preview", "Opening contract preview...");
  };

  const handleSendForSigning = async () => {
    if (!clientName || !projectName || !clientEmail) {
      Alert.alert("Missing Information", "Please fill in client name, project name, and email");
      return;
    }

    if (selectedServices.length === 0 && !scopeOfWork) {
      Alert.alert("Missing Services", "Please select at least one service or add scope of work");
      return;
    }

    const finalTotal = selectedServices.length > 0 ? calculateTotalFromServices() : parseFloat(totalAmount || "0");
    if (finalTotal <= 0) {
      Alert.alert("Invalid Amount", "Total contract amount must be greater than $0");
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

    try {
      const finalScope = generateScopeFromServices();
      
      const contract = await createContractMutation.mutateAsync({
        companyId: organization?.id || "demo",
        clientId: "demo-client",
        type: contractType as any,
        title: projectName,
        totalAmount: finalTotal,
        startDateEstimated: startDate,
        endDateEstimated: endDate,
        scopeOfWork: finalScope,
        warrantyYears: parseInt(warrantyYears) || 1,
        paymentMilestones: paymentMilestones.map(m => ({
          description: m.description,
          percent: parseFloat(m.percent),
          amount: (finalTotal * parseFloat(m.percent)) / 100,
        })),
        additionalNotes: notes,
      });

      await sendContractMutation.mutateAsync({
        contractId: contract.id,
        clientEmail: clientEmail,
      });

      Alert.alert(
        "Success",
        `Contract created and sent to ${clientEmail}!\n\nContract ID: ${contract.id}\nTotal Amount: ${finalTotal.toLocaleString()}\nServices: ${selectedServices.length}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error creating/sending contract:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("404") || errorMessage.includes("Backend not ready")) {
        Alert.alert(
          "Backend Starting",
          "The backend is still starting up. Please wait a moment and try again.\n\nThis is normal on first launch.",
          [
            { text: "OK" },
            { 
              text: "Retry", 
              onPress: () => handleSendForSigning() 
            }
          ]
        );
      } else {
        Alert.alert(
          "Error", 
          `Failed to create and send contract.\n\nDetails: ${errorMessage}`,
          [{ text: "OK" }]
        );
      }
    }
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
              <View style={styles.typeHeaderContainer}>
                <View>
                  <Text style={styles.sectionTitle}>Choose Contract Type</Text>
                  <Text style={styles.sectionSubtitle}>Select the type that best fits your project</Text>
                </View>
                <View style={styles.typeBadge}>
                  <FileText color={Colors.light.primary} size={20} />
                </View>
              </View>
              
              <Text style={styles.categoryLabel}>POPULAR</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { flex: 1 },
                    contractType === "MSA" && styles.typeButtonActive,
                  ]}
                  onPress={() => setContractType("MSA")}
                >
                  <Building2 color={contractType === "MSA" ? "#FFF" : Colors.light.primary} size={20} />
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
                    { flex: 1 },
                    contractType === "PROJECT_CONTRACT" && styles.typeButtonActive,
                  ]}
                  onPress={() => setContractType("PROJECT_CONTRACT")}
                >
                  <Hammer color={contractType === "PROJECT_CONTRACT" ? "#FFF" : Colors.light.primary} size={20} />
                  <Text
                    style={[
                      styles.typeButtonText,
                      contractType === "PROJECT_CONTRACT" && styles.typeButtonTextActive,
                    ]}
                  >
                    Project
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { flex: 1 },
                    contractType === "WORK_ORDER" && styles.typeButtonActive,
                  ]}
                  onPress={() => setContractType("WORK_ORDER")}
                >
                  <FileText color={contractType === "WORK_ORDER" ? "#FFF" : Colors.light.primary} size={20} />
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
              
              <Text style={styles.categoryLabel}>PRICING MODELS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                <View style={styles.typeGrid}>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "TIME_MATERIALS" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("TIME_MATERIALS")}
                  >
                    <DollarSign color={contractType === "TIME_MATERIALS" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "TIME_MATERIALS" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Time & Materials
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "TIME_MATERIALS" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Hourly billing
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "FIXED_PRICE" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("FIXED_PRICE")}
                  >
                    <Shield color={contractType === "FIXED_PRICE" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "FIXED_PRICE" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Fixed Price
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "FIXED_PRICE" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Set total cost
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "COST_PLUS" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("COST_PLUS")}
                  >
                    <Plus color={contractType === "COST_PLUS" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "COST_PLUS" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Cost Plus
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "COST_PLUS" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Cost + markup
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "LUMP_SUM" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("LUMP_SUM")}
                  >
                    <DollarSign color={contractType === "LUMP_SUM" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "LUMP_SUM" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Lump Sum
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "LUMP_SUM" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Single payment
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "UNIT_PRICE" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("UNIT_PRICE")}
                  >
                    <Building2 color={contractType === "UNIT_PRICE" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "UNIT_PRICE" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Unit Price
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "UNIT_PRICE" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Per unit pricing
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <Text style={styles.categoryLabel}>SERVICE AGREEMENTS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                <View style={styles.typeGrid}>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "SERVICE_AGREEMENT" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("SERVICE_AGREEMENT")}
                  >
                    <Sparkles color={contractType === "SERVICE_AGREEMENT" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "SERVICE_AGREEMENT" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Service Agreement
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "SERVICE_AGREEMENT" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Ongoing service
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "MAINTENANCE_AGREEMENT" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("MAINTENANCE_AGREEMENT")}
                  >
                    <Shield color={contractType === "MAINTENANCE_AGREEMENT" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "MAINTENANCE_AGREEMENT" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Maintenance
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "MAINTENANCE_AGREEMENT" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Regular upkeep
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <Text style={styles.categoryLabel}>SPECIALIZED</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                <View style={styles.typeGrid}>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "DESIGN_BUILD" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("DESIGN_BUILD")}
                  >
                    <Hammer color={contractType === "DESIGN_BUILD" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "DESIGN_BUILD" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Design-Build
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "DESIGN_BUILD" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Design + construction
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "SUPPLY_AGREEMENT" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("SUPPLY_AGREEMENT")}
                  >
                    <Building2 color={contractType === "SUPPLY_AGREEMENT" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "SUPPLY_AGREEMENT" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Supply Agreement
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "SUPPLY_AGREEMENT" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Materials only
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "EQUIPMENT_RENTAL" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("EQUIPMENT_RENTAL")}
                  >
                    <Hammer color={contractType === "EQUIPMENT_RENTAL" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "EQUIPMENT_RENTAL" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Equipment Rental
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "EQUIPMENT_RENTAL" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Rent equipment
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <Text style={styles.categoryLabel}>LEGAL & PRELIMINARY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                <View style={styles.typeGrid}>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "NDA" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("NDA")}
                  >
                    <Shield color={contractType === "NDA" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "NDA" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      NDA
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "NDA" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Confidentiality
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "PROPOSAL" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("PROPOSAL")}
                  >
                    <FileText color={contractType === "PROPOSAL" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "PROPOSAL" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Proposal
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "PROPOSAL" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Project quote
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeCardButton,
                      contractType === "LETTER_OF_INTENT" && styles.typeCardButtonActive,
                    ]}
                    onPress={() => setContractType("LETTER_OF_INTENT")}
                  >
                    <FileText color={contractType === "LETTER_OF_INTENT" ? "#FFF" : Colors.light.primary} size={24} />
                    <Text
                      style={[
                        styles.typeCardButtonText,
                        contractType === "LETTER_OF_INTENT" && styles.typeCardButtonTextActive,
                      ]}
                    >
                      Letter of Intent
                    </Text>
                    <Text
                      style={[
                        styles.typeCardButtonDesc,
                        contractType === "LETTER_OF_INTENT" && styles.typeCardButtonDescActive,
                      ]}
                    >
                      Formal interest
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
                <Text style={styles.fieldLabel}>Client Email *</Text>
                <View style={styles.inputWithIcon}>
                  <Mail color={Colors.light.muted} size={20} />
                  <TextInput
                    style={[styles.input, styles.inputNoBorder]}
                    placeholder="client@example.com"
                    placeholderTextColor={Colors.light.muted}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
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

              {selectedServices.length === 0 && (
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Total Contract Amount</Text>
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
                  <Text style={styles.helpText}>Or select services below</Text>
                </View>
              )}

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

            {availableServices.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Select Services</Text>
                    <Text style={styles.sectionSubtitle}>
                      {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                    </Text>
                  </View>
                  {selectedServices.length > 0 && (
                    <View style={styles.totalBadge}>
                      <Text style={styles.totalBadgeText}>
                        ${calculateTotalFromServices().toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.servicesGrid}>
                  {availableServices.map((service) => {
                    const isSelected = selectedServices.includes(service);
                    return (
                      <View key={service} style={styles.serviceContainer}>
                        <TouchableOpacity
                          style={[
                            styles.serviceCard,
                            isSelected && styles.serviceCardActive,
                          ]}
                          onPress={() => toggleService(service)}
                        >
                          <View style={styles.serviceHeader}>
                            <Text
                              style={[
                                styles.serviceText,
                                isSelected && styles.serviceTextActive,
                              ]}
                            >
                              {service}
                            </Text>
                            <View
                              style={[
                                styles.checkbox,
                                isSelected && styles.checkboxActive,
                              ]}
                            >
                              {isSelected && <Check color="#FFF" size={16} />}
                            </View>
                          </View>
                        </TouchableOpacity>
                        {isSelected && (
                          <View style={styles.serviceAmountRow}>
                            <Text style={styles.serviceAmountLabel}>Amount:</Text>
                            <View style={styles.serviceAmountInput}>
                              <DollarSign color={Colors.light.muted} size={16} />
                              <TextInput
                                style={styles.serviceAmountField}
                                placeholder="0.00"
                                placeholderTextColor={Colors.light.muted}
                                value={serviceAmounts[service] || ""}
                                onChangeText={(value) => updateServiceAmount(service, value)}
                                keyboardType="numeric"
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Scope of Work</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe additional work details..."
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
                <View>
                  <Text style={styles.sectionTitle}>Payment Schedule</Text>
                  {selectedServices.length > 0 && (
                    <Text style={styles.sectionSubtitle}>
                      Based on total: ${calculateTotalFromServices().toLocaleString()}
                    </Text>
                  )}
                </View>
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
                          {selectedServices.length > 0
                            ? `${((calculateTotalFromServices() * parseFloat(milestone.percent || "0")) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : calculateMilestoneAmount(milestone.percent)}
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
            disabled={createContractMutation.isPending || sendContractMutation.isPending}
          >
            {createContractMutation.isPending || sendContractMutation.isPending ? (
              <Text style={[styles.footerButtonText, styles.primaryButtonText]}>
                Sending...
              </Text>
            ) : (
              <>
                <Send color="#FFF" size={20} />
                <Text style={[styles.footerButtonText, styles.primaryButtonText]}>
                  Send to Email
                </Text>
              </>
            )}
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
  typeHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  typeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.light.muted,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
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
  typeScrollView: {
    marginTop: 0,
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  typeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  typeButtonTextActive: {
    color: "#FFF",
  },
  typeCardButton: {
    width: 160,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  typeCardButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  typeCardButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  typeCardButtonTextActive: {
    color: "#FFF",
  },
  typeCardButtonDesc: {
    fontSize: 11,
    color: Colors.light.muted,
    textAlign: "center",
  },
  typeCardButtonDescActive: {
    color: "rgba(255, 255, 255, 0.8)",
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
  helpText: {
    fontSize: 12,
    color: Colors.light.muted,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceContainer: {
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  serviceCardActive: {
    backgroundColor: `${Colors.light.primary}10`,
    borderColor: Colors.light.primary,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    flex: 1,
  },
  serviceTextActive: {
    color: Colors.light.primary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  serviceAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  serviceAmountLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginRight: 12,
    width: 70,
  },
  serviceAmountInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  serviceAmountField: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    padding: 0,
  },
  totalBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  totalBadgeText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
