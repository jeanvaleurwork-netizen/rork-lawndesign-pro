import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
} from "react-native";
import { router, Stack } from "expo-router";
import { Briefcase, MapPin, Clock, CheckCircle, ChevronRight, Search, AlertCircle } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Job } from "@/types";

export default function CrewJobsScreen() {
  const { session } = useAuth();
  const { jobs, refreshData } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "scheduled" | "in-progress" | "completed">("all");
  const [refreshing, setRefreshing] = useState(false);

  const crewName = session?.user.name || "";
  
  const myJobs = jobs.filter((job) => job.crew.includes(crewName));

  const filteredJobs = myJobs.filter((job) => {
    const matchesSearch = 
      job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || job.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const scheduledCount = myJobs.filter((j) => j.status === "scheduled").length;
  const inProgressCount = myJobs.filter((j) => j.status === "in-progress").length;
  const completedCount = myJobs.filter((j) => j.status === "completed").length;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "scheduled":
        return Colors.light.primary;
      case "in-progress":
        return Colors.light.warning;
      case "completed":
        return Colors.light.success;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "scheduled":
        return <Clock color={Colors.light.primary} size={16} />;
      case "in-progress":
        return <AlertCircle color={Colors.light.warning} size={16} />;
      case "completed":
        return <CheckCircle color={Colors.light.success} size={16} />;
      default:
        return <Briefcase color={Colors.light.muted} size={16} />;
    }
  };

  const getStatusLabel = (status: Job["status"]) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <Text style={styles.subtitle}>Assigned to you</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={Colors.light.muted} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor={Colors.light.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === "all" && styles.filterChipActive]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text style={[styles.filterText, selectedFilter === "all" && styles.filterTextActive]}>
            All ({myJobs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === "scheduled" && styles.filterChipActive]}
          onPress={() => setSelectedFilter("scheduled")}
        >
          <Text style={[styles.filterText, selectedFilter === "scheduled" && styles.filterTextActive]}>
            Scheduled ({scheduledCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === "in-progress" && styles.filterChipActive]}
          onPress={() => setSelectedFilter("in-progress")}
        >
          <Text style={[styles.filterText, selectedFilter === "in-progress" && styles.filterTextActive]}>
            In Progress ({inProgressCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === "completed" && styles.filterChipActive]}
          onPress={() => setSelectedFilter("completed")}
        >
          <Text style={[styles.filterText, selectedFilter === "completed" && styles.filterTextActive]}>
            Completed ({completedCount})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      >
        {filteredJobs.length === 0 && (
          <View style={styles.emptyState}>
            <Briefcase color={Colors.light.muted} size={64} strokeWidth={1} />
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "Try adjusting your search" : "You have no assigned jobs"}
            </Text>
          </View>
        )}

        {filteredJobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            onPress={() => router.push("/job-detail")}
          >
            <View style={styles.jobHeader}>
              <View style={styles.jobStatusContainer}>
                {getStatusIcon(job.status)}
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(job.status) }]} />
              </View>
              <ChevronRight color={Colors.light.muted} size={20} />
            </View>

            <Text style={styles.jobClient}>{job.clientName}</Text>
            <Text style={styles.jobService}>{job.service}</Text>

            <View style={styles.jobLocation}>
              <MapPin color={Colors.light.muted} size={16} />
              <Text style={styles.jobAddress}>{job.propertyAddress}</Text>
            </View>

            <View style={styles.jobFooter}>
              <View style={styles.jobTime}>
                <Clock color={Colors.light.muted} size={16} />
                <Text style={styles.jobTimeText}>
                  {new Date(job.startTime).toLocaleDateString()} at{" "}
                  {new Date(job.startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(job.status)}15` }]}>
                <Text style={[styles.statusBadgeText, { color: getStatusColor(job.status) }]}>
                  {getStatusLabel(job.status)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  filterTextActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  jobStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  jobClient: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  jobService: {
    fontSize: 16,
    color: Colors.light.muted,
    marginBottom: 12,
  },
  jobLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  jobAddress: {
    fontSize: 14,
    color: Colors.light.muted,
    flex: 1,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  jobTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  jobTimeText: {
    fontSize: 13,
    color: Colors.light.muted,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
  },
  bottomPadding: {
    height: 40,
  },
});
