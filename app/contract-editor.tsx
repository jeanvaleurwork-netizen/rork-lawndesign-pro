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
  Modal,
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
  Wallet,
  X,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { ContractType, Contract } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getTradeServices } from "@/constants/trades";
import { trpc } from "@/lib/trpc";
import { useData } from "@/contexts/DataContext";
import { generateId } from "@/utils/id-generator";
import * as ContractTemplates from "@/constants/contract-templates";

export default function ContractEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = Boolean(params.id);
  const { organization } = useAuth();
  const { addContract, updateContract } = useData();

  const [selectedTypes, setSelectedTypes] = useState<ContractType[]>([]);
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
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);
  const [clientBudget, setClientBudget] = useState<string>("");
  const [clientBudgetNotes, setClientBudgetNotes] = useState<string>("");

  const [paymentMilestones, setPaymentMilestones] = useState<
    { id: string; description: string; percent: string }[]
  >([
    { id: "1", description: "Deposit", percent: "30" },
    { id: "2", description: "Progress Payment", percent: "40" },
    { id: "3", description: "Final Payment", percent: "30" },
  ]);

  const { clients, updateClient } = useData();

  const availableServices = useMemo(() => {
    if (!organization?.tradeType) return [];
    return getTradeServices(organization.tradeType);
  }, [organization?.tradeType]);

  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");

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
        type: (selectedTypes.length > 0 ? selectedTypes[0] : "PROJECT_CONTRACT") as any,
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

  const toggleContractType = (type: ContractType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const generateContractPreview = (): string => {
    if (selectedTypes.length === 0) {
      return "<p>Please select at least one contract type</p>";
    }

    const finalTotal = selectedServices.length > 0 ? calculateTotalFromServices() : parseFloat(totalAmount || "0");
    const finalScope = generateScopeFromServices();
    
    const primaryType = selectedTypes[0];
    
    const templateVariables: Record<string, string> = {
      company_name: organization?.name || "Your Company",
      company_phone: "(555) 555-5555",
      company_email: "contact@company.com",
      company_license: "License #",
      company_address: "123 Business St",
      client_name: clientName || "Client Name",
      client_email: clientEmail || "client@email.com",
      client_phone: "Client Phone",
      client_property_address: "Property Address",
      project_name: projectName || "Project Name",
      project_address: "Project Address",
      current_date: new Date().toLocaleDateString(),
      contract_total_amount: finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      project_start_date: startDate || "TBD",
      project_end_date: endDate || "TBD",
      scope_of_work: finalScope || "To be determined",
      warranty_years: warrantyYears || "1",
      project_duration_text: "To be determined",
      trade_specific_clauses: "Standard trade terms apply",
      risk_clauses: finalTotal < 5000 ? "<p>Small project terms apply</p>" : "<p>Standard project terms apply</p>",
    };
    
    let paymentScheduleTable = "<table style='width: 100%; border-collapse: collapse; margin: 16px 0;'>";
    paymentScheduleTable += "<thead><tr style='background-color: #f3f4f6;'>";
    paymentScheduleTable += "<th style='padding: 12px; text-align: left; border: 1px solid #e5e7eb;'>Payment</th>";
    paymentScheduleTable += "<th style='padding: 12px; text-align: right; border: 1px solid #e5e7eb;'>Percent</th>";
    paymentScheduleTable += "<th style='padding: 12px; text-align: right; border: 1px solid #e5e7eb;'>Amount</th>";
    paymentScheduleTable += "</tr></thead><tbody>";
    
    paymentMilestones.forEach((m) => {
      const amount = (finalTotal * parseFloat(m.percent || "0")) / 100;
      paymentScheduleTable += "<tr>";
      paymentScheduleTable += `<td style='padding: 12px; border: 1px solid #e5e7eb;'>${m.description}</td>`;
      paymentScheduleTable += `<td style='padding: 12px; text-align: right; border: 1px solid #e5e7eb;'>${m.percent}%</td>`;
      paymentScheduleTable += `<td style='padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: 600;'>${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>`;
      paymentScheduleTable += "</tr>";
    });
    
    paymentScheduleTable += "</tbody></table>";
    templateVariables.payment_schedule_table = paymentScheduleTable;
    
    let templateHtml = "";
    
    switch (primaryType) {
      case "PROJECT_CONTRACT":
        templateHtml = ContractTemplates.PROJECT_CONTRACT_TEMPLATE;
        break;
      case "MSA":
        templateHtml = ContractTemplates.MSA_TEMPLATE;
        break;
      case "WORK_ORDER":
        templateHtml = ContractTemplates.WORK_ORDER_TEMPLATE;
        break;
      default:
        templateHtml = ContractTemplates.PROJECT_CONTRACT_TEMPLATE;
    }
    
    Object.keys(templateVariables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      templateHtml = templateHtml.replace(regex, templateVariables[key]);
    });

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contract Document - ${projectName || "Project"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
            color: #1a202c;
            background: #fff;
          }
          h1 { font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 24px; }
          h2 { font-size: 22px; font-weight: 700; color: #1a202c; margin: 32px 0 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
          h3 { font-size: 18px; font-weight: 600; color: #2d3748; margin: 24px 0 12px; }
          p { margin-bottom: 12px; color: #4a5568; }
          ul, ol { margin-left: 24px; margin-bottom: 16px; }
          li { margin-bottom: 8px; color: #4a5568; }
          .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 32px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .info-block { background: #f7fafc; padding: 16px; border-radius: 8px; }
          .label { font-size: 12px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { font-size: 15px; font-weight: 600; color: #1a202c; margin-top: 4px; }
          .highlight { background: #eef2ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 16px 0; }
          .payment-schedule { background: #f7fafc; padding: 16px; border-radius: 8px; margin: 16px 0; }
          .type-badge { display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; margin: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Contract Agreement</h1>
          <div style="font-size: 14px; color: #718096;">Generated: ${new Date().toLocaleDateString()}</div>
        </div>
    `;

    html += `
      <div style="margin-bottom: 24px;">
        <div class="label">Contract Types Selected:</div>
        <div style="margin-top: 8px;">
          ${selectedTypes.map(type => `<span class="type-badge">${type.replace(/_/g, ' ')}</span>`).join('')}
        </div>
      </div>
    `;

    html += `
      <div class="info-grid">
        <div class="info-block">
          <div class="label">Client Information</div>
          <div class="value">${clientName || 'Not specified'}</div>
          <div style="font-size: 14px; color: #718096; margin-top: 4px;">${clientEmail || 'No email provided'}</div>
        </div>
        <div class="info-block">
          <div class="label">Project Name</div>
          <div class="value">${projectName || 'Not specified'}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <div class="label">Start Date</div>
          <div class="value">${startDate || 'TBD'}</div>
        </div>
        <div class="info-block">
          <div class="label">End Date</div>
          <div class="value">${endDate || 'TBD'}</div>
        </div>
      </div>
    `;

    html += `
      <h2>Scope of Work</h2>
      <div class="highlight">
        ${finalScope ? finalScope.split('\n').map(line => `<p>${line}</p>`).join('') : '<p>No scope defined</p>'}
      </div>
    `;

    if (selectedServices.length > 0) {
      html += `
        <h2>Selected Services</h2>
        <ul>
          ${selectedServices.map(service => {
            const amount = parseFloat(serviceAmounts[service] || "0");
            return `<li><strong>${service}:</strong> ${amount.toLocaleString()}</li>`;
          }).join('')}
        </ul>
      `;
    }

    html += `
      <h2>Financial Terms</h2>
      <div class="highlight">
        <h3 style="margin-top: 0;">Total Contract Amount: ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
      </div>
    `;

    if (paymentMilestones.length > 0) {
      html += `
        <div class="payment-schedule">
          <h3>Payment Schedule</h3>
          <ol>
            ${paymentMilestones.map(m => {
              const amount = (finalTotal * parseFloat(m.percent || "0")) / 100;
              return `<li><strong>${m.description}:</strong> ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${m.percent}%)</li>`;
            }).join('')}
          </ol>
          <p style="margin-top: 12px;"><strong>Total Percentage:</strong> ${getTotalPercent().toFixed(1)}%</p>
        </div>
      `;
    }

    html += `
      <h2>Warranty & Terms</h2>
      <ul>
        <li><strong>Workmanship Warranty:</strong> ${warrantyYears || '1'} year(s)</li>
        ${notes ? `<li><strong>Additional Notes:</strong> ${notes}</li>` : ''}
      </ul>
    `;

    html += `
      <h2>Contract Types & Provisions</h2>
      <p>This contract incorporates the following agreement types and their respective terms:</p>
      <ul>
        ${selectedTypes.map(type => `<li>${type.replace(/_/g, ' ')}</li>`).join('')}
      </ul>
    `;

    html += `
      <div style="margin-top: 60px; padding-top: 40px; border-top: 2px solid #e2e8f0;">
        <h2>Signatures</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px;">
          <div>
            <div style="border-bottom: 2px solid #1a202c; height: 60px; margin-bottom: 8px;"></div>
            <div style="font-size: 12px; color: #718096;">Contractor Signature & Date</div>
          </div>
          <div>
            <div style="border-bottom: 2px solid #1a202c; height: 60px; margin-bottom: 8px;"></div>
            <div style="font-size: 12px; color: #718096;">Client Signature & Date</div>
          </div>
        </div>
      </div>
    `;

    html += `
      <div style="margin-top: 60px; padding: 20px; background: #f7fafc; border-radius: 8px;">
        <h3 style="color: #2d3748;">E-Signature Instructions</h3>
        <p>This contract can be signed electronically via email or through our customer portal. Both methods are legally binding and comply with the ESIGN Act and UETA.</p>
        <ul style="margin-left: 24px; color: #4a5568;">
          <li>Email signature: Sign and return via secure email link</li>
          <li>Portal signature: Sign online through customer portal with authentication</li>
          <li>Digital signature: Upload scanned signature or use stylus/mouse to sign</li>
        </ul>
      </div>
      </body>
      </html>
    `;

    return templateHtml || html;
  };

  const handlePreview = () => {
    if (selectedTypes.length === 0) {
      Alert.alert("No Contract Types", "Please select at least one contract type to preview");
      return;
    }
    const html = generateContractPreview();
    setPreviewHtml(html);
    setShowPreview(true);
  };

  const handleSendForSigning = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert("No Contract Types", "Please select at least one contract type");
      return;
    }

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
      const primaryType = selectedTypes[0];
      
      const contractData = {
        companyId: organization?.id || "demo",
        clientId: "demo-client",
        type: primaryType as any,
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
        additionalNotes: `${notes}\n\nContract Types: ${selectedTypes.join(', ')}`,
      };

      const contract = await createContractMutation.mutateAsync(contractData);

      await sendContractMutation.mutateAsync({
        contractId: contract.id,
        clientEmail: clientEmail,
      });

      Alert.alert(
        "Success",
        `Contract created and sent to ${clientEmail}!\n\nContract ID: ${contract.id}\nContract Types: ${selectedTypes.length}\nTotal Amount: ${finalTotal.toLocaleString()}\nServices: ${selectedServices.length}`,
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
              
              <View style={styles.selectedTypesRow}>
                {selectedTypes.length > 0 ? (
                  <>
                    <Text style={styles.selectedLabel}>{selectedTypes.length} Selected:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                      <View style={styles.selectedChips}>
                        {selectedTypes.map(type => (
                          <TouchableOpacity
                            key={type}
                            style={styles.selectedChip}
                            onPress={() => toggleContractType(type)}
                          >
                            <Text style={styles.selectedChipText}>{type.replace(/_/g, ' ')}</Text>
                            <Check color="#FFF" size={14} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </>
                ) : (
                  <Text style={styles.selectedLabel}>Select one or more contract types below</Text>
                )}
              </View>

              <Text style={styles.categoryLabel}>POPULAR</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { flex: 1 },
                    selectedTypes.includes("MSA") && styles.typeButtonActive,
                  ]}
                  onPress={() => toggleContractType("MSA")}
                >
                  <Building2 color={selectedTypes.includes("MSA") ? "#FFF" : Colors.light.primary} size={20} />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedTypes.includes("MSA") && styles.typeButtonTextActive,
                    ]}
                  >
                    MSA
                  </Text>
                  {selectedTypes.includes("MSA") && (
                    <View style={styles.checkmark}>
                      <Check color="#FFF" size={14} />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { flex: 1 },
                    selectedTypes.includes("PROJECT_CONTRACT") && styles.typeButtonActive,
                  ]}
                  onPress={() => toggleContractType("PROJECT_CONTRACT")}
                >
                  <Hammer color={selectedTypes.includes("PROJECT_CONTRACT") ? "#FFF" : Colors.light.primary} size={20} />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedTypes.includes("PROJECT_CONTRACT") && styles.typeButtonTextActive,
                    ]}
                  >
                    Project
                  </Text>
                  {selectedTypes.includes("PROJECT_CONTRACT") && (
                    <View style={styles.checkmark}>
                      <Check color="#FFF" size={14} />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { flex: 1 },
                    selectedTypes.includes("WORK_ORDER") && styles.typeButtonActive,
                  ]}
                  onPress={() => toggleContractType("WORK_ORDER")}
                >
                  <FileText color={selectedTypes.includes("WORK_ORDER") ? "#FFF" : Colors.light.primary} size={20} />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedTypes.includes("WORK_ORDER") && styles.typeButtonTextActive,
                    ]}
                  >
                    Work Order
                  </Text>
                  {selectedTypes.includes("WORK_ORDER") && (
                    <View style={styles.checkmark}>
                      <Check color="#FFF" size={14} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              
              <Text style={styles.categoryLabel}>PRICING MODELS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                <View style={styles.typeGrid}>
                  {[
                    { type: "TIME_MATERIALS" as ContractType, label: "Time & Materials", desc: "Hourly billing", icon: DollarSign },
                    { type: "FIXED_PRICE" as ContractType, label: "Fixed Price", desc: "Set total cost", icon: Shield },
                    { type: "COST_PLUS" as ContractType, label: "Cost Plus", desc: "Cost + markup", icon: Plus },
                    { type: "LUMP_SUM" as ContractType, label: "Lump Sum", desc: "Single payment", icon: DollarSign },
                    { type: "UNIT_PRICE" as ContractType, label: "Unit Price", desc: "Per unit pricing", icon: Building2 },
                  ].map(({ type, label, desc, icon: Icon }) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeCardButton,
                        selectedTypes.includes(type) && styles.typeCardButtonActive,
                      ]}
                      onPress={() => toggleContractType(type)}
                    >
                      <Icon color={selectedTypes.includes(type) ? "#FFF" : Colors.light.primary} size={24} />
                      <Text style={[styles.typeCardButtonText, selectedTypes.includes(type) && styles.typeCardButtonTextActive]}>
                        {label}
                      </Text>
                      <Text style={[styles.typeCardButtonDesc, selectedTypes.includes(type) && styles.typeCardButtonDescActive]}>
                        {desc}
                      </Text>
                      {selectedTypes.includes(type) && (
                        <View style={styles.checkmark}>
                          <Check color="#FFF" size={14} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <Text style={styles.categoryLabel}>SERVICE AGREEMENTS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                <View style={styles.typeGrid}>
                  {[
                    { type: "SERVICE_AGREEMENT" as ContractType, label: "Service Agreement", desc: "Ongoing service", icon: Sparkles },
                    { type: "MAINTENANCE_AGREEMENT" as ContractType, label: "Maintenance", desc: "Regular upkeep", icon: Shield },
                  ].map(({ type, label, desc, icon: Icon }) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeCardButton,
                        selectedTypes.includes(type) && styles.typeCardButtonActive,
                      ]}
                      onPress={() => toggleContractType(type)}
                    >
                      <Icon color={selectedTypes.includes(type) ? "#FFF" : Colors.light.primary} size={24} />
                      <Text style={[styles.typeCardButtonText, selectedTypes.includes(type) && styles.typeCardButtonTextActive]}>
                        {label}
                      </Text>
                      <Text style={[styles.typeCardButtonDesc, selectedTypes.includes(type) && styles.typeCardButtonDescActive]}>
                        {desc}
                      </Text>
                      {selectedTypes.includes(type) && (
                        <View style={styles.checkmark}>
                          <Check color="#FFF" size={14} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <Text style={styles.categoryLabel}>SPECIALIZED</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                <View style={styles.typeGrid}>
                  {[
                    { type: "DESIGN_BUILD" as ContractType, label: "Design-Build", desc: "Design + construction", icon: Hammer },
                    { type: "SUPPLY_AGREEMENT" as ContractType, label: "Supply Agreement", desc: "Materials only", icon: Building2 },
                    { type: "EQUIPMENT_RENTAL" as ContractType, label: "Equipment Rental", desc: "Rent equipment", icon: Hammer },
                  ].map(({ type, label, desc, icon: Icon }) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeCardButton,
                        selectedTypes.includes(type) && styles.typeCardButtonActive,
                      ]}
                      onPress={() => toggleContractType(type)}
                    >
                      <Icon color={selectedTypes.includes(type) ? "#FFF" : Colors.light.primary} size={24} />
                      <Text style={[styles.typeCardButtonText, selectedTypes.includes(type) && styles.typeCardButtonTextActive]}>
                        {label}
                      </Text>
                      <Text style={[styles.typeCardButtonDesc, selectedTypes.includes(type) && styles.typeCardButtonDescActive]}>
                        {desc}
                      </Text>
                      {selectedTypes.includes(type) && (
                        <View style={styles.checkmark}>
                          <Check color="#FFF" size={14} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <Text style={styles.categoryLabel}>LEGAL & PRELIMINARY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                <View style={styles.typeGrid}>
                  {[
                    { type: "NDA" as ContractType, label: "NDA", desc: "Confidentiality", icon: Shield },
                    { type: "PROPOSAL" as ContractType, label: "Proposal", desc: "Project quote", icon: FileText },
                    { type: "LETTER_OF_INTENT" as ContractType, label: "Letter of Intent", desc: "Formal interest", icon: FileText },
                  ].map(({ type, label, desc, icon: Icon }) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeCardButton,
                        selectedTypes.includes(type) && styles.typeCardButtonActive,
                      ]}
                      onPress={() => toggleContractType(type)}
                    >
                      <Icon color={selectedTypes.includes(type) ? "#FFF" : Colors.light.primary} size={24} />
                      <Text style={[styles.typeCardButtonText, selectedTypes.includes(type) && styles.typeCardButtonTextActive]}>
                        {label}
                      </Text>
                      <Text style={[styles.typeCardButtonDesc, selectedTypes.includes(type) && styles.typeCardButtonDescActive]}>
                        {desc}
                      </Text>
                      {selectedTypes.includes(type) && (
                        <View style={styles.checkmark}>
                          <Check color="#FFF" size={14} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.formField}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Client Name *</Text>
                  <TouchableOpacity
                    style={styles.budgetIconButton}
                    onPress={() => {
                      const foundClient = clients.find(c => c.name === clientName);
                      if (foundClient) {
                        setClientBudget(foundClient.budget?.toString() || "");
                        setClientBudgetNotes(foundClient.budgetNotes || "");
                        setShowBudgetModal(true);
                      } else {
                        Alert.alert("Client Not Found", "Please select an existing client to manage budget.");
                      }
                    }}
                  >
                    <Wallet color={Colors.light.primary} size={20} />
                    <Text style={styles.budgetIconText}>Budget</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Select or enter client name"
                  placeholderTextColor={Colors.light.muted}
                  value={clientName}
                  onChangeText={setClientName}
                />
                {clientName && clients.find(c => c.name === clientName)?.budget && (
                  <View style={styles.budgetChip}>
                    <Wallet color={Colors.light.success} size={14} />
                    <Text style={styles.budgetChipText}>
                      {`Budget: ${clients.find(c => c.name === clientName)?.budget?.toLocaleString()}`}
                    </Text>
                  </View>
                )}
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

      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <ArrowLeft color={Colors.light.primary} size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Contract Preview</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {Platform.OS === 'web' ? (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <View style={{ flex: 1, padding: 20, alignItems: "center", justifyContent: "center" }}>
                <Text style={{color: Colors.light.text, fontSize: 16, textAlign: "center"}}>Preview available in web mode</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showBudgetModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" }}
        >
          <View style={styles.budgetModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Client Budget Management</Text>
              <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.budgetModalScroll}>
              <View style={styles.budgetModalBody}>
                <View style={styles.budgetInfoCard}>
                  <Wallet color={Colors.light.primary} size={32} />
                  <Text style={styles.budgetInfoTitle}>Set Client Budget</Text>
                  <Text style={styles.budgetInfoSubtitle}>
                    Track and manage budget allocation for this client
                  </Text>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Budget Amount</Text>
                  <View style={styles.inputWithIcon}>
                    <DollarSign color={Colors.light.muted} size={20} />
                    <TextInput
                      style={[styles.input, styles.inputNoBorder]}
                      placeholder="0.00"
                      placeholderTextColor={Colors.light.muted}
                      value={clientBudget}
                      onChangeText={setClientBudget}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Budget Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add notes about budget allocation, restrictions, or special terms..."
                    placeholderTextColor={Colors.light.muted}
                    value={clientBudgetNotes}
                    onChangeText={setClientBudgetNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {clientBudget && parseFloat(clientBudget) > 0 && (
                  <View style={styles.budgetSummaryCard}>
                    <Text style={styles.budgetSummaryLabel}>Budget Summary</Text>
                    <Text style={styles.budgetSummaryAmount}>
                      ${parseFloat(clientBudget).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                    {selectedServices.length > 0 && (
                      <View style={styles.budgetComparisonRow}>
                        <Text style={styles.budgetComparisonLabel}>Contract Total:</Text>
                        <Text style={styles.budgetComparisonValue}>
                          ${calculateTotalFromServices().toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                    )}
                    {selectedServices.length > 0 && parseFloat(clientBudget) > 0 && (
                      <View style={styles.budgetComparisonRow}>
                        <Text style={styles.budgetComparisonLabel}>Remaining:</Text>
                        <Text
                          style={[
                            styles.budgetComparisonValue,
                            parseFloat(clientBudget) - calculateTotalFromServices() < 0
                              ? styles.budgetOverText
                              : styles.budgetUnderText,
                          ]}
                        >
                          ${(parseFloat(clientBudget) - calculateTotalFromServices()).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.budgetModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBudgetModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={async () => {
                  const foundClient = clients.find(c => c.name === clientName);
                  if (!foundClient) {
                    Alert.alert("Error", "Client not found");
                    return;
                  }

                  const budgetValue = clientBudget.trim() ? parseFloat(clientBudget) : undefined;
                  if (clientBudget.trim() && (isNaN(budgetValue!) || budgetValue! < 0)) {
                    Alert.alert("Invalid Amount", "Please enter a valid budget amount.");
                    return;
                  }

                  try {
                    await updateClient(foundClient.id, {
                      budget: budgetValue,
                      budgetNotes: clientBudgetNotes.trim() || undefined,
                    });
                    Alert.alert("Success", "Client budget updated successfully!");
                    setShowBudgetModal(false);
                  } catch (error) {
                    console.error("Error updating budget:", error);
                    Alert.alert("Error", "Failed to update budget. Please try again.");
                  }
                }}
              >
                <Save color="#FFF" size={18} />
                <Text style={styles.saveButtonText}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  selectedTypesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginRight: 12,
  },
  selectedChips: {
    flexDirection: "row",
    gap: 8,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  selectedChipText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetIconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  budgetIconText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  budgetChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.success}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  budgetChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.success,
  },
  budgetModalContent: {
    backgroundColor: Colors.light.card,
    marginTop: "auto",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  budgetModalScroll: {
    maxHeight: 500,
  },
  budgetModalBody: {
    padding: 20,
  },
  budgetInfoCard: {
    alignItems: "center",
    backgroundColor: Colors.light.background,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  budgetInfoTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 4,
  },
  budgetInfoSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
  },
  budgetSummaryCard: {
    backgroundColor: Colors.light.background,
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  budgetSummaryLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  budgetSummaryAmount: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 16,
  },
  budgetComparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  budgetComparisonLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  budgetComparisonValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  budgetOverText: {
    color: Colors.light.error,
  },
  budgetUnderText: {
    color: Colors.light.success,
  },
  budgetModalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
