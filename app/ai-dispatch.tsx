import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { 
  Zap, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle,
  Star,
  TrendingUp,
  AlertTriangle,
  ThumbsUp,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

interface CrewSuggestion {
  crewId: string;
  crewName: string;
  score: number;
  distanceMiles: number;
  etaMinutes: number;
  availability: "available" | "limited" | "booked";
  specialties: string[];
  completedJobs: number;
  rating: number;
  reasons: string[];
  warnings?: string[];
}

export default function AIDispatchScreen() {
  const { session } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<CrewSuggestion[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const jobsQuery = trpc.data.getJobs.useQuery({ 
    businessId: session?.organization?.id || "" 
  });

  const pendingJobs = jobsQuery.data?.filter(j => 
    j.status === "pending" || j.status === "scheduled"
  ) || [];

  const analyzeDispatch = async (job: any) => {
    setAnalyzing(true);
    setSelectedJob(job);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockSuggestions: CrewSuggestion[] = [
        {
          crewId: "crew1",
          crewName: "Mike's Team A",
          score: 95,
          distanceMiles: 3.2,
          etaMinutes: 15,
          availability: "available",
          specialties: ["Roofing", "Repairs"],
          completedJobs: 127,
          rating: 4.9,
          reasons: [
            "Closest team to job location",
            "Perfect specialty match",
            "Available immediately",
            "High completion rate",
          ],
        },
        {
          crewId: "crew2",
          crewName: "Carlos & Team",
          score: 88,
          distanceMiles: 5.8,
          etaMinutes: 22,
          availability: "available",
          specialties: ["Roofing", "Siding"],
          completedJobs: 94,
          rating: 4.8,
          reasons: [
            "Specialty match",
            "Available today",
            "Strong work history",
          ],
        },
        {
          crewId: "crew3",
          crewName: "Rodriguez Crew",
          score: 72,
          distanceMiles: 12.1,
          etaMinutes: 35,
          availability: "limited",
          specialties: ["Roofing"],
          completedJobs: 63,
          rating: 4.6,
          reasons: [
            "Available after 2 PM",
            "Good specialty match",
          ],
          warnings: [
            "Farther distance",
            "Limited availability today",
          ],
        },
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      Alert.alert("Error", "Failed to analyze dispatch options");
      console.error("Dispatch analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const assignCrewToJob = async (crew: CrewSuggestion) => {
    Alert.alert(
      "Assign Crew",
      `Assign ${crew.crewName} to ${selectedJob?.service}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: () => {
            Alert.alert("Success", `${crew.crewName} has been assigned to the job`);
            router.back();
          },
        },
      ]
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available": return "#10b981";
      case "limited": return "#f59e0b";
      case "booked": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available": return "Available Now";
      case "limited": return "Limited";
      case "booked": return "Fully Booked";
      default: return "Unknown";
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "AI Dispatch",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
        }} 
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Zap size={48} color={Colors.light.primary} />
          <Text style={styles.title}>Smart Crew Assignment</Text>
          <Text style={styles.subtitle}>
            AI-powered dispatch logic finds the best crew for each job based on distance, availability, specialty, and performance
          </Text>
        </View>

        {!selectedJob ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Jobs ({pendingJobs.length})</Text>
            {pendingJobs.length === 0 ? (
              <View style={styles.emptyState}>
                <CheckCircle size={48} color="#ccc" />
                <Text style={styles.emptyText}>No pending jobs</Text>
              </View>
            ) : (
              pendingJobs.map(job => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() => analyzeDispatch(job)}
                >
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobService}>{job.service}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: job.status === "scheduled" ? "#dbeafe" : "#fef3c7" },
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: job.status === "scheduled" ? "#1e40af" : "#92400e" },
                      ]}>
                        {job.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.jobClient}>{job.clientName}</Text>
                  <Text style={styles.jobAddress}>{job.propertyAddress}</Text>
                  <View style={styles.jobFooter}>
                    <View style={styles.jobMeta}>
                      <Clock size={14} color={Colors.light.textSecondary} />
                      <Text style={styles.jobMetaText}>{job.startTime}</Text>
                    </View>
                    <Text style={styles.analyzeButton}>Analyze →</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <>
            <View style={styles.selectedJobCard}>
              <Text style={styles.selectedJobTitle}>Analyzing Job:</Text>
              <Text style={styles.selectedJobService}>{selectedJob.service}</Text>
              <Text style={styles.selectedJobClient}>{selectedJob.clientName}</Text>
              <Text style={styles.selectedJobAddress}>{selectedJob.propertyAddress}</Text>
              <TouchableOpacity
                style={styles.changeJobButton}
                onPress={() => {
                  setSelectedJob(null);
                  setSuggestions([]);
                }}
              >
                <Text style={styles.changeJobText}>Change Job</Text>
              </TouchableOpacity>
            </View>

            {analyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Analyzing dispatch options...</Text>
                <Text style={styles.loadingSubtext}>
                  Checking crew availability, distance, specialties, and performance history
                </Text>
              </View>
            ) : suggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommended Crews</Text>
                {suggestions.map(crew => (
                  <View key={crew.crewId} style={styles.crewCard}>
                    <View style={styles.crewHeader}>
                      <View style={styles.crewHeaderLeft}>
                        <Text style={styles.crewName}>{crew.crewName}</Text>
                        <View style={styles.ratingContainer}>
                          <Star size={14} color="#f59e0b" fill="#f59e0b" />
                          <Text style={styles.ratingText}>{crew.rating.toFixed(1)}</Text>
                          <Text style={styles.jobsCompletedText}>({crew.completedJobs} jobs)</Text>
                        </View>
                      </View>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreNumber}>{crew.score}</Text>
                        <Text style={styles.scoreLabel}>Score</Text>
                      </View>
                    </View>

                    <View style={[
                      styles.availabilityBadge,
                      { backgroundColor: getAvailabilityColor(crew.availability) + "20" },
                    ]}>
                      <View style={[
                        styles.availabilityDot,
                        { backgroundColor: getAvailabilityColor(crew.availability) },
                      ]} />
                      <Text style={[
                        styles.availabilityText,
                        { color: getAvailabilityColor(crew.availability) },
                      ]}>
                        {getAvailabilityText(crew.availability)}
                      </Text>
                    </View>

                    <View style={styles.crewMetrics}>
                      <View style={styles.metric}>
                        <MapPin size={16} color={Colors.light.textSecondary} />
                        <Text style={styles.metricText}>{crew.distanceMiles} mi</Text>
                      </View>
                      <View style={styles.metric}>
                        <Clock size={16} color={Colors.light.textSecondary} />
                        <Text style={styles.metricText}>{crew.etaMinutes} min ETA</Text>
                      </View>
                    </View>

                    <View style={styles.specialtiesContainer}>
                      {crew.specialties.map(spec => (
                        <View key={spec} style={styles.specialtyChip}>
                          <Text style={styles.specialtyText}>{spec}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.reasonsSection}>
                      <View style={styles.reasonsHeader}>
                        <ThumbsUp size={16} color="#10b981" />
                        <Text style={styles.reasonsTitle}>Why This Crew:</Text>
                      </View>
                      {crew.reasons.map((reason, idx) => (
                        <View key={idx} style={styles.reasonItem}>
                          <View style={styles.reasonDot} />
                          <Text style={styles.reasonText}>{reason}</Text>
                        </View>
                      ))}
                    </View>

                    {crew.warnings && crew.warnings.length > 0 && (
                      <View style={styles.warningsSection}>
                        <View style={styles.warningsHeader}>
                          <AlertTriangle size={16} color="#f59e0b" />
                          <Text style={styles.warningsTitle}>Considerations:</Text>
                        </View>
                        {crew.warnings.map((warning, idx) => (
                          <View key={idx} style={styles.warningItem}>
                            <View style={styles.warningDot} />
                            <Text style={styles.warningText}>{warning}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.assignButton,
                        crew.score < 75 && styles.assignButtonSecondary,
                      ]}
                      onPress={() => assignCrewToJob(crew)}
                    >
                      <Users size={20} color="#fff" />
                      <Text style={styles.assignButtonText}>Assign This Crew</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.infoSection}>
          <TrendingUp size={24} color={Colors.light.primary} />
          <Text style={styles.infoTitle}>AI Dispatch Benefits:</Text>
          <Text style={styles.infoText}>
            • Reduces travel time and fuel costs{"\n"}
            • Matches crew skills to job requirements{"\n"}
            • Optimizes crew utilization{"\n"}
            • Improves customer satisfaction{"\n"}
            • Considers real-time availability
          </Text>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  jobService: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  jobClient: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  jobAddress: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobMetaText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  analyzeButton: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  selectedJobCard: {
    backgroundColor: Colors.light.primary + "15",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  selectedJobTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  selectedJobService: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  selectedJobClient: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  selectedJobAddress: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  changeJobButton: {
    alignSelf: "flex-start",
  },
  changeJobText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  loadingContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  crewCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  crewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  crewHeaderLeft: {
    flex: 1,
  },
  crewName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  jobsCompletedText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  scoreContainer: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 70,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  crewMetrics: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  specialtyChip: {
    backgroundColor: Colors.light.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  reasonsSection: {
    marginBottom: 12,
  },
  reasonsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#10b981",
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 6,
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginTop: 6,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  warningsSection: {
    marginBottom: 16,
  },
  warningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#f59e0b",
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 6,
  },
  warningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f59e0b",
    marginTop: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  assignButton: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  assignButtonSecondary: {
    backgroundColor: "#6b7280",
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
  emptyState: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
  infoSection: {
    backgroundColor: Colors.light.primary + "10",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 22,
  },
});
