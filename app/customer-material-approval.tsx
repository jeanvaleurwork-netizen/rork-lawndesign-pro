import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import {
  Package,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

export default function CustomerMaterialApprovalScreen() {
  const { approvalId } = useLocalSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const mockApproval = {
    id: approvalId as string,
    projectName: "Roof Replacement Project",
    contractorName: "ABC Roofing Company",
    itemName: "Architectural Shingles",
    brand: "CertainTeed",
    colorFinish: "Weathered Wood",
    modelNumber: "CT-123-WW",
    quantity: "25 squares",
    notes: "High-quality, 30-year warranty. These shingles are impact-resistant and meet all local building codes.",
    imageUrl: "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600",
    specifications: [
      "30-year limited warranty",
      "Class 4 impact rating",
      "Algae resistance",
      "Wind resistance up to 130 mph",
      "Meets ASTM D3462 standards",
    ],
  };

  const handleApprove = async () => {
    Alert.alert(
      "Approve Material Selection",
      `Are you sure you want to approve ${mockApproval.itemName} for your project?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setSubmitting(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 1500));
              Alert.alert(
                "Success!",
                "Material selection approved. Your contractor will be notified.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert("Error", "Failed to submit approval. Please try again.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleDecline = async () => {
    Alert.alert(
      "Decline Material Selection",
      "Are you sure you want to decline this material? Your contractor will be notified and will provide alternative options.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            setSubmitting(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 1500));
              Alert.alert(
                "Material Declined",
                "Your contractor will contact you with alternative options.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert("Error", "Failed to submit response. Please try again.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Material Approval",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Package size={48} color={Colors.light.primary} />
          <Text style={styles.title}>Material Selection for Approval</Text>
          <Text style={styles.subtitle}>{mockApproval.projectName}</Text>
          <Text style={styles.contractorName}>from {mockApproval.contractorName}</Text>
        </View>

        {mockApproval.imageUrl && (
          <Image
            source={{ uri: mockApproval.imageUrl }}
            style={styles.materialImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Material Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Material:</Text>
              <Text style={styles.detailValue}>{mockApproval.itemName}</Text>
            </View>

            {mockApproval.brand && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Brand:</Text>
                <Text style={styles.detailValue}>{mockApproval.brand}</Text>
              </View>
            )}

            {mockApproval.colorFinish && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Color/Finish:</Text>
                <Text style={styles.detailValue}>{mockApproval.colorFinish}</Text>
              </View>
            )}

            {mockApproval.modelNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Model #:</Text>
                <Text style={styles.detailValue}>{mockApproval.modelNumber}</Text>
              </View>
            )}

            {mockApproval.quantity && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity:</Text>
                <Text style={styles.detailValue}>{mockApproval.quantity}</Text>
              </View>
            )}
          </View>
        </View>

        {mockApproval.specifications && mockApproval.specifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specsCard}>
              {mockApproval.specifications.map((spec, idx) => (
                <View key={idx} style={styles.specItem}>
                  <CheckCircle size={16} color={Colors.light.success} />
                  <Text style={styles.specText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {mockApproval.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.notesCard}>
              <Info size={20} color={Colors.light.primary} />
              <Text style={styles.notesText}>{mockApproval.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Please review the material selection carefully. If you have any questions or concerns, contact your contractor before making a decision.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={handleDecline}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <XCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Decline</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={handleApprove}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.light.card,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 4,
  },
  contractorName: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  materialImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#f0f0f0",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  specsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  specText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  notesCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary + "10",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary + "30",
  },
  notesText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  infoText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  declineButton: {
    backgroundColor: Colors.light.error,
  },
  approveButton: {
    backgroundColor: Colors.light.success,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
});
