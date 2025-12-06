import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  CheckCircle,
  Circle,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  ChevronRight,
  Calendar,
  TrendingUp,
  ArrowLeft,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface Task {
  id: string;
  jobId: string;
  clientName: string;
  address: string;
  crew: string;
  time: string;
  duration: number;
  status: "pending" | "in-progress" | "completed" | "delayed";
  progress: number;
  tasks: string[];
  completedTasks: number;
}

export default function DailyScheduleScreen() {
  const [selectedDate] = useState<Date>(new Date());
  const [schedule] = useState<Task[]>([
    {
      id: "1",
      jobId: "JOB-00145",
      clientName: "Smith Residence",
      address: "142 Oak Street, Austin, TX",
      crew: "Crew A",
      time: "08:00 AM",
      duration: 360,
      status: "completed",
      progress: 100,
      tasks: [
        "Prepare site",
        "Level ground",
        "Install edging",
        "Lay sod",
        "Apply fertilizer",
        "Water and compact",
        "Final inspection",
      ],
      completedTasks: 7,
    },
    {
      id: "2",
      jobId: "JOB-00146",
      clientName: "Johnson Backyard",
      address: "456 Pine Road, Austin, TX",
      crew: "Crew B",
      time: "09:00 AM",
      duration: 240,
      status: "in-progress",
      progress: 60,
      tasks: [
        "Site preparation",
        "Plant installation",
        "Mulch application",
        "Irrigation setup",
        "Final walkthrough",
      ],
      completedTasks: 3,
    },
    {
      id: "3",
      jobId: "JOB-00147",
      clientName: "Chen Property",
      address: "987 Cedar Court, Austin, TX",
      crew: "Crew A",
      time: "02:00 PM",
      duration: 120,
      status: "pending",
      progress: 0,
      tasks: [
        "Lawn maintenance",
        "Edge trimming",
        "Fertilizer application",
        "Equipment cleanup",
      ],
      completedTasks: 0,
    },
    {
      id: "4",
      jobId: "JOB-00148",
      clientName: "Taylor Residence",
      address: "234 Willow Way, Austin, TX",
      crew: "Crew B",
      time: "01:00 PM",
      duration: 180,
      status: "delayed",
      progress: 25,
      tasks: [
        "Tree removal",
        "Stump grinding",
        "Debris cleanup",
        "Site restoration",
        "Final inspection",
      ],
      completedTasks: 1,
    },
    {
      id: "5",
      jobId: "JOB-00149",
      clientName: "Lopez Estate",
      address: "555 Garden Drive, Austin, TX",
      crew: "Crew C",
      time: "07:00 AM",
      duration: 660,
      status: "in-progress",
      progress: 45,
      tasks: [
        "Site survey",
        "Excavation",
        "Install irrigation",
        "Plant trees",
        "Install shrubs",
        "Mulch beds",
        "Seed lawn areas",
        "Final grading",
        "Cleanup",
        "Walkthrough",
      ],
      completedTasks: 5,
    },
  ]);

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return Colors.light.success;
      case "in-progress":
        return Colors.light.warning;
      case "delayed":
        return Colors.light.error;
      case "pending":
        return Colors.light.muted;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusBg = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "#D1FAE5";
      case "in-progress":
        return "#FEF3C7";
      case "delayed":
        return "#FEE2E2";
      case "pending":
        return "#F3F4F6";
      default:
        return "#F3F4F6";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle color={Colors.light.success} size={20} />;
      case "in-progress":
        return <Clock color={Colors.light.warning} size={20} />;
      case "delayed":
        return <AlertCircle color={Colors.light.error} size={20} />;
      case "pending":
        return <Circle color={Colors.light.muted} size={20} />;
      default:
        return <Circle color={Colors.light.muted} size={20} />;
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "delayed":
        return "Delayed";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const totalJobs = schedule.length;
  const completedJobs = schedule.filter((job) => job.status === "completed").length;
  const inProgressJobs = schedule.filter((job) => job.status === "in-progress").length;
  const delayedJobs = schedule.filter((job) => job.status === "delayed").length;
  const averageProgress =
    schedule.reduce((sum, job) => sum + job.progress, 0) / totalJobs;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Daily Schedule",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                console.log("Back button pressed");
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)");
                }
              }}
              style={{ marginLeft: 16, paddingVertical: 8 }}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.7}
            >
              <ArrowLeft color={Colors.light.text} size={26} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.dateHeader}>
            <View>
              <Text style={styles.dateLabel}>Today&apos;s Schedule</Text>
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>{Math.round(averageProgress)}%</Text>
              <Text style={styles.progressCircleLabel}>Complete</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#EBF5FF" }]}
              >
                <Calendar color={Colors.light.primary} size={20} />
              </View>
              <Text style={styles.statValue}>{totalJobs}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}
              >
                <CheckCircle color={Colors.light.success} size={20} />
              </View>
              <Text style={styles.statValue}>{completedJobs}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}
              >
                <Clock color={Colors.light.warning} size={20} />
              </View>
              <Text style={styles.statValue}>{inProgressJobs}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#FEE2E2" }]}
              >
                <AlertCircle color={Colors.light.error} size={20} />
              </View>
              <Text style={styles.statValue}>{delayedJobs}</Text>
              <Text style={styles.statLabel}>Delayed</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Schedule Overview</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <TrendingUp color={Colors.light.primary} size={16} />
                <Text style={styles.viewAllText}>Analytics</Text>
              </TouchableOpacity>
            </View>

            {schedule
              .sort((a, b) => {
                const timeA = a.time.split(":")[0];
                const timeB = b.time.split(":")[0];
                return parseInt(timeA) - parseInt(timeB);
              })
              .map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() =>
                    router.push({
                      pathname: "/job-detail",
                      params: { jobId: task.jobId },
                    })
                  }
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskHeaderLeft}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusBg(task.status) },
                        ]}
                      >
                        {getStatusIcon(task.status)}
                      </View>
                      <View style={styles.taskTitleContainer}>
                        <Text style={styles.taskJobId}>{task.jobId}</Text>
                        <Text style={styles.taskClientName}>{task.clientName}</Text>
                      </View>
                    </View>
                    <ChevronRight color={Colors.light.muted} size={20} />
                  </View>

                  <View style={styles.taskInfo}>
                    <View style={styles.taskInfoRow}>
                      <Clock color={Colors.light.muted} size={16} />
                      <Text style={styles.taskInfoText}>
                        {task.time} ({task.duration} mins)
                      </Text>
                    </View>
                    <View style={styles.taskInfoRow}>
                      <MapPin color={Colors.light.muted} size={16} />
                      <Text style={styles.taskInfoText}>{task.address}</Text>
                    </View>
                    <View style={styles.taskInfoRow}>
                      <Users color={Colors.light.muted} size={16} />
                      <Text style={styles.taskInfoText}>{task.crew}</Text>
                    </View>
                  </View>

                  <View style={styles.taskProgress}>
                    <View style={styles.taskProgressHeader}>
                      <Text style={styles.taskProgressText}>
                        {task.completedTasks} / {task.tasks.length} tasks completed
                      </Text>
                      <View
                        style={[
                          styles.taskStatusPill,
                          { backgroundColor: getStatusBg(task.status) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.taskStatusText,
                            { color: getStatusColor(task.status) },
                          ]}
                        >
                          {getStatusText(task.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${task.progress}%`,
                            backgroundColor: getStatusColor(task.status),
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleText: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  progressCircleLabel: {
    fontSize: 11,
    color: "#FFF",
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  taskCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskJobId: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginBottom: 2,
  },
  taskClientName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  taskInfo: {
    gap: 8,
    marginBottom: 12,
  },
  taskInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskInfoText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  taskProgress: {
    marginTop: 4,
  },
  taskProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskProgressText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  taskStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
