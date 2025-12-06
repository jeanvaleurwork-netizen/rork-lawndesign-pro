import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
} from "react-native";
import { router, Stack } from "expo-router";
import { ChevronLeft, Plus, Star, DollarSign, Briefcase, Shield, FileText, Phone, Mail } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Subcontractor } from "@/types";

export default function SubcontractorsScreen() {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([
    {
      id: "1",
      businessName: "Elite Plumbing Services",
      contactName: "Mike Rodriguez",
      email: "mike@eliteplumbing.com",
      phone: "(512) 555-0123",
      trade: "Plumbing",
      licenseNumber: "PL-45821",
      insuranceExpiry: "2026-03-15",
      rating: 4.8,
      jobsCompleted: 28,
      totalPaid: 45600,
      w9OnFile: true,
      coiOnFile: true,
    },
    {
      id: "2",
      businessName: "Apex Electrical Co",
      contactName: "Sarah Chen",
      email: "sarah@apexelectric.com",
      phone: "(512) 555-0456",
      trade: "Electrical",
      licenseNumber: "EL-78942",
      insuranceExpiry: "2025-12-01",
      rating: 4.9,
      jobsCompleted: 42,
      totalPaid: 68200,
      w9OnFile: true,
      coiOnFile: false,
      notes: "COI needs renewal",
    },
    {
      id: "3",
      businessName: "Professional HVAC Solutions",
      contactName: "Tom Williams",
      email: "tom@prohvac.com",
      phone: "(512) 555-0789",
      trade: "HVAC",
      rating: 4.5,
      jobsCompleted: 15,
      totalPaid: 32100,
      w9OnFile: true,
      coiOnFile: true,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subcontractor | null>(null);

  const totalPaid = subcontractors.reduce((sum, s) => sum + s.totalPaid, 0);
  const avgRating = subcontractors.reduce((sum, s) => sum + s.rating, 0) / subcontractors.length;
  const needsAttention = subcontractors.filter(s => !s.w9OnFile || !s.coiOnFile).length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Subcontractors",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <Briefcase color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>{subcontractors.length}</Text>
          <Text style={styles.statLabel}>Active Subs</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.warning + "20" }]}>
            <Star color={Colors.light.warning} size={20} />
          </View>
          <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <DollarSign color={Colors.light.success} size={20} />
          </View>
          <Text style={styles.statValue}>${(totalPaid / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Total Paid</Text>
        </View>
      </View>

      {needsAttention > 0 && (
        <View style={styles.alertBanner}>
          <Shield color={Colors.light.error} size={20} />
          <Text style={styles.alertText}>
            {needsAttention} subcontractor{needsAttention > 1 ? "s" : ""} need{needsAttention === 1 ? "s" : ""} compliance docs
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Subcontractors</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {subcontractors.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={styles.subCard}
              onPress={() => setSelectedSub(sub)}
            >
              <View style={styles.subHeader}>
                <View style={styles.subHeaderLeft}>
                  <View style={[styles.subIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                    <Briefcase color={Colors.light.primary} size={24} />
                  </View>
                  <View>
                    <Text style={styles.businessName}>{sub.businessName}</Text>
                    <Text style={styles.contactName}>{sub.contactName}</Text>
                  </View>
                </View>
                <View style={styles.ratingContainer}>
                  <Star color={Colors.light.warning} size={16} fill={Colors.light.warning} />
                  <Text style={styles.ratingText}>{sub.rating}</Text>
                </View>
              </View>

              <View style={styles.tradeBadge}>
                <Text style={styles.tradeText}>{sub.trade}</Text>
              </View>

              <View style={styles.subDetails}>
                <View style={styles.detailRow}>
                  <Briefcase color={Colors.light.muted} size={14} />
                  <Text style={styles.detailText}>{sub.jobsCompleted} jobs completed</Text>
                </View>
                <View style={styles.detailRow}>
                  <DollarSign color={Colors.light.muted} size={14} />
                  <Text style={styles.detailText}>${sub.totalPaid.toLocaleString()} paid</Text>
                </View>
              </View>

              <View style={styles.complianceRow}>
                <View style={[styles.complianceBadge, sub.w9OnFile && styles.compliant]}>
                  <Text style={[styles.complianceText, sub.w9OnFile && styles.compliantText]}>
                    W9 {sub.w9OnFile ? "✓" : "✗"}
                  </Text>
                </View>
                <View style={[styles.complianceBadge, sub.coiOnFile && styles.compliant]}>
                  <Text style={[styles.complianceText, sub.coiOnFile && styles.compliantText]}>
                    COI {sub.coiOnFile ? "✓" : "✗"}
                  </Text>
                </View>
                {sub.licenseNumber && (
                  <View style={[styles.complianceBadge, styles.compliant]}>
                    <Text style={[styles.complianceText, styles.compliantText]}>Licensed</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={selectedSub !== null} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedSub && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selectedSub.businessName}</Text>
                    <Text style={styles.modalSubtitle}>{selectedSub.contactName}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedSub(null)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Contact Information</Text>
                    <TouchableOpacity style={styles.contactItem}>
                      <Phone color={Colors.light.primary} size={18} />
                      <Text style={styles.contactValue}>{selectedSub.phone}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactItem}>
                      <Mail color={Colors.light.primary} size={18} />
                      <Text style={styles.contactValue}>{selectedSub.email}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Business Details</Text>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Trade:</Text>
                      <Text style={styles.detailValue}>{selectedSub.trade}</Text>
                    </View>
                    {selectedSub.licenseNumber && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>License #:</Text>
                        <Text style={styles.detailValue}>{selectedSub.licenseNumber}</Text>
                      </View>
                    )}
                    {selectedSub.insuranceExpiry && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Insurance Expires:</Text>
                        <Text style={styles.detailValue}>{new Date(selectedSub.insuranceExpiry).toLocaleDateString()}</Text>
                      </View>
                    )}
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Rating:</Text>
                      <View style={styles.detailValueRow}>
                        <Star color={Colors.light.warning} size={16} fill={Colors.light.warning} />
                        <Text style={styles.detailValue}>{selectedSub.rating} / 5.0</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Performance</Text>
                    <View style={styles.perfCard}>
                      <View style={styles.perfItem}>
                        <Text style={styles.perfValue}>{selectedSub.jobsCompleted}</Text>
                        <Text style={styles.perfLabel}>Jobs Completed</Text>
                      </View>
                      <View style={styles.perfDivider} />
                      <View style={styles.perfItem}>
                        <Text style={styles.perfValue}>${selectedSub.totalPaid.toLocaleString()}</Text>
                        <Text style={styles.perfLabel}>Total Paid</Text>
                      </View>
                    </View>
                  </View>

                  {selectedSub.notes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Notes</Text>
                      <Text style={styles.notesText}>{selectedSub.notes}</Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.actionButton}>
                    <FileText color="#FFF" size={18} />
                    <Text style={styles.actionButtonText}>View Jobs History</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Subcontractor</Text>

            <Text style={styles.label}>Business Name</Text>
            <TextInput style={styles.input} placeholder="Company name" />

            <Text style={styles.label}>Contact Name</Text>
            <TextInput style={styles.input} placeholder="Primary contact" />

            <Text style={styles.label}>Trade</Text>
            <TextInput style={styles.input} placeholder="e.g., Plumbing, Electrical" />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} placeholder="(555) 555-5555" keyboardType="phone-pad" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder="email@company.com" keyboardType="email-address" />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>Add Subcontractor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    textAlign: "center",
  },
  alertBanner: {
    backgroundColor: Colors.light.error + "20",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 13,
    color: Colors.light.error,
    fontWeight: "500" as const,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  subCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  subIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  businessName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  contactName: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.warning + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.warning,
  },
  tradeBadge: {
    backgroundColor: Colors.light.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  tradeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  subDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  complianceRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  complianceBadge: {
    backgroundColor: Colors.light.error + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compliant: {
    backgroundColor: Colors.light.success + "20",
  },
  complianceText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.error,
  },
  compliantText: {
    color: Colors.light.success,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.light.muted,
    marginTop: 2,
  },
  closeButton: {
    fontSize: 28,
    color: Colors.light.muted,
    padding: 4,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  contactValue: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: "500" as const,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  detailValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  perfCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
  },
  perfItem: {
    flex: 1,
    alignItems: "center",
  },
  perfValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  perfLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
  },
  perfDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.background,
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
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
