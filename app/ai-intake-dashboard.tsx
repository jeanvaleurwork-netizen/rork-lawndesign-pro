import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Inbox,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react-native";

interface IntakeJob {
  id: string;
  jobType: string;
  customerName: string;
  address: string;
  urgency: number;
  status: "pending" | "assigned" | "completed";
  createdDate: string;
  assignedCrew?: string;
}

export default function AIIntakeDashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const mockIntakeJobs: IntakeJob[] = [
    {
      id: "1",
      jobType: "roofing",
      customerName: "John Smith",
      address: "123 Main St, Brooklyn, NY",
      urgency: 3,
      status: "pending",
      createdDate: new Date().toISOString(),
    },
    {
      id: "2",
      jobType: "plumbing",
      customerName: "Sarah Johnson",
      address: "456 Oak Ave, Queens, NY",
      urgency: 2,
      status: "assigned",
      createdDate: new Date(Date.now() - 3600000).toISOString(),
      assignedCrew: "Alpha Team",
    },
    {
      id: "3",
      jobType: "landscaping",
      customerName: "Mike Davis",
      address: "789 Pine Rd, Manhattan, NY",
      urgency: 1,
      status: "assigned",
      createdDate: new Date(Date.now() - 7200000).toISOString(),
      assignedCrew: "Beta Team",
    },
  ];

  const stats = {
    todayIntakes: 12,
    pendingAssignment: 3,
    activeJobs: 8,
    avgResponseTime: "4.2 min",
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9500";
      case "assigned":
        return "#007AFF";
      case "completed":
        return "#34C759";
      default:
        return "#999";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} color="#FF9500" />;
      case "assigned":
        return <Users size={16} color="#007AFF" />;
      case "completed":
        return <CheckCircle size={16} color="#34C759" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "AI Intake Dashboard",
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" as const },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Inbox size={24} color="#007AFF" />
            <Text style={styles.statValue}>{stats.todayIntakes}</Text>
            <Text style={styles.statLabel}>Today&apos;s Intakes</Text>
          </View>
          <View style={styles.statCard}>
            <AlertCircle size={24} color="#FF9500" />
            <Text style={styles.statValue}>{stats.pendingAssignment}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#34C759" />
            <Text style={styles.statValue}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#5856D6" />
            <Text style={styles.statValue}>{stats.avgResponseTime}</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Intakes</Text>

          {mockIntakeJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => {
                const jobRoute = `/dispatch-assignment?data=${encodeURIComponent(JSON.stringify(job))}`;
                router.push(jobRoute as any);
              }}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobTypeBadge}>
                  <Text style={styles.jobTypeText}>
                    {job.jobType.toUpperCase()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: getUrgencyColor(job.urgency) },
                  ]}
                >
                  <Text style={styles.urgencyText}>
                    {job.urgency === 3
                      ? "URGENT"
                      : job.urgency === 2
                      ? "NORMAL"
                      : "LOW"}
                  </Text>
                </View>
              </View>

              <Text style={styles.customerName}>{job.customerName}</Text>
              <Text style={styles.address}>{job.address}</Text>

              <View style={styles.jobFooter}>
                <View style={styles.statusRow}>
                  {getStatusIcon(job.status)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(job.status) },
                    ]}
                  >
                    {job.status.toUpperCase()}
                  </Text>
                </View>
                {job.assignedCrew && (
                  <Text style={styles.crewText}>{job.assignedCrew}</Text>
                )}
                <Text style={styles.timeText}>
                  {new Date(job.createdDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.newIntakeButton}
          onPress={() => router.push("/customer-intake")}
        >
          <Text style={styles.newIntakeText}>+ New Service Request</Text>
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
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#333",
    marginBottom: 12,
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  jobTypeBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  jobTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600" as const,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  crewText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500" as const,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  newIntakeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    marginTop: 8,
  },
  newIntakeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600" as const,
  },
});
