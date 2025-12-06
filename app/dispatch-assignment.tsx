import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Zap } from "lucide-react-native";
import { trpc } from "@/lib/trpc";

interface CrewMember {
  id: string;
  name: string;
  trade: string;
  proximity: number;
  availability: boolean;
  currentLoad: number;
  maxJobsPerDay: number;
  matchScore: number;
}

export default function DispatchAssignmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);

  const jobData = params.data ? JSON.parse(params.data as string) : {};

  const mockCrewMembers: CrewMember[] = [
    {
      id: "crew-1",
      name: "Alpha Roofing Team",
      trade: jobData.jobType || "roofing",
      proximity: 3.2,
      availability: true,
      currentLoad: 2,
      maxJobsPerDay: 5,
      matchScore: 95,
    },
    {
      id: "crew-2",
      name: "Beta Construction Crew",
      trade: jobData.jobType || "roofing",
      proximity: 5.8,
      availability: true,
      currentLoad: 4,
      maxJobsPerDay: 5,
      matchScore: 82,
    },
    {
      id: "crew-3",
      name: "Gamma Service Team",
      trade: jobData.jobType || "roofing",
      proximity: 8.1,
      availability: false,
      currentLoad: 5,
      maxJobsPerDay: 5,
      matchScore: 65,
    },
  ];

  const findCrewQuery = trpc.aiIntake.findBestCrew.useQuery(
    {
      jobType: jobData.jobType || "roofing",
      address: jobData.address || "",
      urgency: jobData.urgency || 2,
      checklist: [],
    },
    {
      enabled: false,
    }
  );

  const handleAssignCrew = async () => {
    if (!selectedCrewId) {
      Alert.alert("Error", "Please select a crew member to assign");
      return;
    }

    const selectedCrew = mockCrewMembers.find(c => c.id === selectedCrewId);
    if (!selectedCrew) {
      return;
    }

    try {
      await findCrewQuery.refetch();
      
      Alert.alert(
        "Crew Assigned",
        `${selectedCrew.name} has been assigned to this job. They will be notified automatically.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch {
      Alert.alert("Error", "Failed to assign crew. Please try again.");
    }
  };

  const getUrgencyColor = (urgency: number) => {
    switch (urgency) {
      case 3:
        return "#FF3B30";
      case 2:
        return "#FF9500";
      default:
        return "#34C759";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Assign Crew",
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" as const },
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.jobSummaryCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>Job Summary</Text>
            <View
              style={[
                styles.urgencyBadge,
                { backgroundColor: getUrgencyColor(jobData.urgency || 2) },
              ]}
            >
              <Text style={styles.urgencyText}>
                {jobData.urgency === 3 ? "URGENT" : jobData.urgency === 2 ? "NORMAL" : "LOW"}
              </Text>
            </View>
          </View>

          <View style={styles.jobDetail}>
            <Text style={styles.detailLabel}>Job Type:</Text>
            <Text style={styles.detailValue}>{jobData.jobType?.toUpperCase() || "N/A"}</Text>
          </View>

          <View style={styles.jobDetail}>
            <Text style={styles.detailLabel}>Customer:</Text>
            <Text style={styles.detailValue}>{jobData.customerName || "N/A"}</Text>
          </View>

          <View style={styles.jobDetail}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{jobData.address || "N/A"}</Text>
          </View>

          {jobData.description && (
            <View style={styles.jobDetail}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>{jobData.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommended Crews</Text>
          <Text style={styles.sectionSubtitle}>
            Based on proximity, availability, and skill match
          </Text>

          {mockCrewMembers.map((crew) => (
            <TouchableOpacity
              key={crew.id}
              style={[
                styles.crewCard,
                selectedCrewId === crew.id && styles.crewCardSelected,
                !crew.availability && styles.crewCardDisabled,
              ]}
              onPress={() => crew.availability && setSelectedCrewId(crew.id)}
              disabled={!crew.availability}
            >
              <View style={styles.crewHeader}>
                <View style={styles.crewNameRow}>
                  <Users size={20} color={crew.availability ? "#007AFF" : "#999"} />
                  <Text
                    style={[
                      styles.crewName,
                      !crew.availability && styles.crewNameDisabled,
                    ]}
                  >
                    {crew.name}
                  </Text>
                </View>
                <View style={styles.matchScoreBadge}>
                  <Zap size={14} color="#FF9500" strokeWidth={2.5} />
                  <Text style={styles.matchScoreText}>{crew.matchScore}%</Text>
                </View>
              </View>

              <View style={styles.crewMetrics}>
                <View style={styles.metric}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.metricText}>{crew.proximity} mi away</Text>
                </View>
                <View style={styles.metric}>
                  <Clock size={16} color="#666" />
                  <Text style={styles.metricText}>
                    {crew.currentLoad}/{crew.maxJobsPerDay} jobs
                  </Text>
                </View>
                <View style={styles.metric}>
                  {crew.availability ? (
                    <CheckCircle size={16} color="#34C759" />
                  ) : (
                    <AlertCircle size={16} color="#FF3B30" />
                  )}
                  <Text
                    style={[
                      styles.metricText,
                      { color: crew.availability ? "#34C759" : "#FF3B30" },
                    ]}
                  >
                    {crew.availability ? "Available" : "Busy"}
                  </Text>
                </View>
              </View>

              <View style={styles.crewFooter}>
                <View style={styles.scoreBreakdown}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Proximity</Text>
                    <View style={styles.scoreBar}>
                      <View
                        style={[
                          styles.scoreBarFill,
                          {
                            width: `${100 - crew.proximity * 5}%`,
                            backgroundColor: "#007AFF",
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Availability</Text>
                    <View style={styles.scoreBar}>
                      <View
                        style={[
                          styles.scoreBarFill,
                          {
                            width: `${
                              ((crew.maxJobsPerDay - crew.currentLoad) /
                                crew.maxJobsPerDay) *
                              100
                            }%`,
                            backgroundColor: "#34C759",
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {selectedCrewId === crew.id && (
                <View style={styles.selectedBanner}>
                  <CheckCircle size={18} color="#007AFF" strokeWidth={2.5} />
                  <Text style={styles.selectedText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dispatchInfo}>
          <TrendingUp size={20} color="#5856D6" />
          <Text style={styles.dispatchInfoText}>
            AI will notify the crew and customer automatically upon assignment
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.assignButton,
            (!selectedCrewId || findCrewQuery.isFetching) && styles.assignButtonDisabled,
          ]}
          onPress={handleAssignCrew}
          disabled={!selectedCrewId || findCrewQuery.isFetching}
        >
          <Text style={styles.assignButtonText}>
            {findCrewQuery.isFetching ? "Assigning..." : "Assign Crew & Notify"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  jobSummaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#333",
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgencyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  jobDetail: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500" as const,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#333",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  crewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  crewCardSelected: {
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
  },
  crewCardDisabled: {
    opacity: 0.5,
  },
  crewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  crewNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  crewName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#333",
    flex: 1,
  },
  crewNameDisabled: {
    color: "#999",
  },
  matchScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  matchScoreText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FF9500",
  },
  crewMetrics: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500" as const,
  },
  crewFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 14,
  },
  scoreBreakdown: {
    gap: 10,
  },
  scoreItem: {
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600" as const,
  },
  scoreBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  selectedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E3F2FD",
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#007AFF",
  },
  dispatchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F3E5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dispatchInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#5856D6",
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  assignButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  assignButtonDisabled: {
    opacity: 0.5,
  },
  assignButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700" as const,
  },
});
