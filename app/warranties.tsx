import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router, Stack } from "expo-router";
import { ChevronLeft, Shield, AlertCircle, CheckCircle, Calendar } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Warranty } from "@/types";

export default function WarrantiesScreen() {
  const [warranties] = useState<Warranty[]>([
    {
      id: "1",
      jobId: "3",
      clientId: "3",
      clientName: "Chen Property",
      propertyAddress: "987 Cedar Court, Austin, TX",
      workDescription: "Complete lawn renovation with new irrigation system",
      warrantyType: "both",
      startDate: "2025-11-28",
      expiryDate: "2026-11-28",
      terms: [
        "1-year warranty on all labor and workmanship",
        "Manufacturer warranty applies to all materials",
        "Free repairs for any defects in installation",
      ],
      exclusions: [
        "Damage caused by customer negligence",
        "Weather-related damage",
        "Third-party modifications",
      ],
      status: "active",
      claims: [],
    },
    {
      id: "2",
      jobId: "5",
      clientId: "2",
      clientName: "Lopez Estate",
      propertyAddress: "555 Garden Drive, Austin, TX",
      workDescription: "Full landscaping and hardscape installation",
      warrantyType: "labor",
      startDate: "2024-12-01",
      expiryDate: "2025-12-01",
      terms: [
        "90-day labor warranty",
        "Includes repairs for installation defects",
      ],
      exclusions: [
        "Material defects (covered by manufacturer)",
        "Normal wear and tear",
      ],
      status: "active",
      claims: [
        {
          id: "1",
          warrantyId: "2",
          claimDate: "2025-10-15",
          description: "Paver stones settling unevenly",
          status: "completed",
          resolutionDate: "2025-10-20",
          resolutionNotes: "Releveled pavers and added additional base material",
          cost: 0,
        },
      ],
    },
  ]);

  const activeWarranties = warranties.filter(w => w.status === "active").length;
  const totalClaims = warranties.reduce((sum, w) => sum + w.claims.length, 0);
  const expiringSoon = warranties.filter(w => {
    const daysUntil = Math.ceil((new Date(w.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0 && w.status === "active";
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Warranties",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <Shield color={Colors.light.success} size={20} />
          </View>
          <Text style={styles.statValue}>{activeWarranties}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.warning + "20" }]}>
            <AlertCircle color={Colors.light.warning} size={20} />
          </View>
          <Text style={styles.statValue}>{expiringSoon}</Text>
          <Text style={styles.statLabel}>Expiring Soon</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <CheckCircle color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>{totalClaims}</Text>
          <Text style={styles.statLabel}>Claims</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Warranties</Text>

          {warranties.map((warranty) => {
            const daysUntilExpiry = Math.ceil((new Date(warranty.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

            return (
              <View key={warranty.id} style={styles.warrantyCard}>
                <View style={styles.warrantyHeader}>
                  <View style={[styles.warrantyIcon, { backgroundColor: Colors.light.success + "20" }]}>
                    <Shield color={Colors.light.success} size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{warranty.clientName}</Text>
                    <Text style={styles.propertyAddress}>{warranty.propertyAddress}</Text>
                  </View>
                  {isExpiringSoon && (
                    <View style={styles.expiringBadge}>
                      <AlertCircle color={Colors.light.warning} size={14} />
                    </View>
                  )}
                </View>

                <Text style={styles.workDescription}>{warranty.workDescription}</Text>

                <View style={styles.warrantyDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{warranty.warrantyType === "both" ? "Labor & Materials" : warranty.warrantyType}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Start Date:</Text>
                    <Text style={styles.detailValue}>{new Date(warranty.startDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expires:</Text>
                    <Text style={[styles.detailValue, isExpiringSoon && { color: Colors.light.warning, fontWeight: "600" as const }]}>
                      {new Date(warranty.expiryDate).toLocaleDateString()}
                      {isExpiringSoon && ` (${daysUntilExpiry} days)`}
                    </Text>
                  </View>
                </View>

                <View style={styles.termsSection}>
                  <Text style={styles.termsTitle}>Coverage Terms:</Text>
                  {warranty.terms.slice(0, 2).map((term, idx) => (
                    <Text key={idx} style={styles.termItem}>• {term}</Text>
                  ))}
                </View>

                {warranty.claims.length > 0 && (
                  <View style={styles.claimsSection}>
                    <Text style={styles.claimsTitle}>{warranty.claims.length} Claim{warranty.claims.length > 1 ? "s" : ""}</Text>
                    {warranty.claims.map((claim) => (
                      <View key={claim.id} style={styles.claimItem}>
                        <Text style={styles.claimDescription}>{claim.description}</Text>
                        <View style={[
                          styles.claimStatus,
                          { backgroundColor: claim.status === "completed" ? Colors.light.success + "20" : Colors.light.warning + "20" }
                        ]}>
                          <Text style={[
                            styles.claimStatusText,
                            { color: claim.status === "completed" ? Colors.light.success : Colors.light.warning }
                          ]}>
                            {claim.status}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  warrantyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  warrantyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  warrantyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  propertyAddress: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 2,
  },
  expiringBadge: {
    backgroundColor: Colors.light.warning + "20",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  workDescription: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  warrantyDetails: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
    textTransform: "capitalize",
  },
  termsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginBottom: 12,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  termItem: {
    fontSize: 12,
    color: Colors.light.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  claimsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  claimsTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  claimItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  claimDescription: {
    fontSize: 12,
    color: Colors.light.text,
    flex: 1,
  },
  claimStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  claimStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
});
