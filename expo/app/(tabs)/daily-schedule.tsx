import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
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
  Calendar as CalendarIcon,
  TrendingUp,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react-native";
import { Calendar } from "react-native-calendars";

import Colors from "@/constants/colors";
import { useData } from "@/contexts/DataContext";

export default function DailyScheduleScreen() {
  const { jobs } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    clientName: "",
    address: "",
    crew: "",
    time: "",
    duration: "120",
    tasks: "",
  });

  const schedule = useMemo(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    
    return jobs
      .filter((job) => {
        if (!job.startTime) return false;
        const jobDate = new Date(job.startTime).toISOString().split('T')[0];
        return jobDate === dateString;
      })
      .map((job) => {
        const startTime = new Date(job.startTime);
        const endTime = job.endTime ? new Date(job.endTime) : null;
        const duration = endTime
          ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
          : 120;
        
        const hours = startTime.getHours();
        const minutes = startTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const time = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        
        return {
          id: job.id,
          clientName: job.clientName,
          address: job.propertyAddress,
          crew: Array.isArray(job.crew) ? job.crew.join(', ') : job.crew || 'Unassigned',
          time,
          duration,
          status: job.status as "pending" | "in-progress" | "completed" | "scheduled",
          progress: job.status === 'completed' ? 100 : job.status === 'in-progress' ? 50 : 0,
        };
      });
  }, [jobs, selectedDate]);



  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return Colors.light.success;
      case "in-progress":
        return Colors.light.warning;
      case "delayed":
        return Colors.light.error;
      case "pending":
      case "scheduled":
        return Colors.light.muted;
      default:
        return Colors.light.muted;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed":
        return "#D1FAE5";
      case "in-progress":
        return "#FEF3C7";
      case "delayed":
        return "#FEE2E2";
      case "pending":
      case "scheduled":
        return "#F3F4F6";
      default:
        return "#F3F4F6";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle color={Colors.light.success} size={20} />;
      case "in-progress":
        return <Clock color={Colors.light.warning} size={20} />;
      case "delayed":
        return <AlertCircle color={Colors.light.error} size={20} />;
      case "pending":
      case "scheduled":
        return <Circle color={Colors.light.muted} size={20} />;
      default:
        return <Circle color={Colors.light.muted} size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "delayed":
        return "Delayed";
      case "pending":
        return "Pending";
      case "scheduled":
        return "Scheduled";
      default:
        return "Unknown";
    }
  };

  const totalJobs = schedule.length;
  const completedJobs = schedule.filter((job) => job.status === "completed").length;
  const inProgressJobs = schedule.filter((job) => job.status === "in-progress").length;
  const delayedJobs = 0;
  const averageProgress =
    totalJobs > 0 ? schedule.reduce((sum, job) => sum + job.progress, 0) / totalJobs : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Daily Schedule",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 0, paddingHorizontal: 16, paddingVertical: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.dateHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Schedule</Text>
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>{Math.round(averageProgress)}%</Text>
                <Text style={styles.progressCircleLabel}>Complete</Text>
              </View>
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={() => setShowAddEventModal(true)}
              >
                <Plus color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate.toISOString().split("T")[0]}
              onDayPress={(day) => {
                setSelectedDate(new Date(day.timestamp));
              }}
              markedDates={{
                [selectedDate.toISOString().split("T")[0]]: {
                  selected: true,
                  selectedColor: Colors.light.primary,
                },
              }}
              theme={{
                todayTextColor: Colors.light.primary,
                selectedDayBackgroundColor: Colors.light.primary,
                selectedDayTextColor: "#ffffff",
                arrowColor: Colors.light.primary,
                monthTextColor: Colors.light.text,
                textDayFontWeight: "500",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "500",
              }}
            />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#EBF5FF" }]}
              >
                <CalendarIcon color={Colors.light.primary} size={20} />
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
                      params: { jobId: task.id },
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
                        <Text style={styles.taskJobId}>JOB-{task.id.padStart(5, '0')}</Text>
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
                        Duration: {task.duration} minutes
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

            {schedule.length === 0 && (
              <View style={styles.emptyState}>
                <CalendarIcon color={Colors.light.muted} size={48} />
                <Text style={styles.emptyStateText}>No jobs scheduled for this day</Text>
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => setShowAddEventModal(true)}
                >
                  <Text style={styles.addFirstButtonText}>Add First Job</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAddEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddEventModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Schedule</Text>
            <TouchableOpacity onPress={() => setShowAddEventModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Client Name *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.clientName}
                onChangeText={(text) => setNewEvent({ ...newEvent, clientName: text })}
                placeholder="Enter client name"
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Property Address *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.address}
                onChangeText={(text) => setNewEvent({ ...newEvent, address: text })}
                placeholder="Enter property address"
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Assigned Crew *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.crew}
                onChangeText={(text) => setNewEvent({ ...newEvent, crew: text })}
                placeholder="Crew A, Crew B, etc."
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Start Time *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.time}
                onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
                placeholder="08:00 AM"
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Duration (minutes) *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.duration}
                onChangeText={(text) => setNewEvent({ ...newEvent, duration: text })}
                placeholder="120"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Tasks (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEvent.tasks}
                onChangeText={(text) => setNewEvent({ ...newEvent, tasks: text })}
                placeholder="Site prep, Install materials, Cleanup"
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddEventModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                if (!newEvent.clientName || !newEvent.address || !newEvent.crew || !newEvent.time) {
                  Alert.alert("Missing Information", "Please fill in all required fields");
                  return;
                }
                console.log("Adding event:", newEvent);
                Alert.alert("Success", "Job added to schedule");
                setShowAddEventModal(false);
                setNewEvent({
                  clientName: "",
                  address: "",
                  crew: "",
                  time: "",
                  duration: "120",
                  tasks: "",
                });
              }}
            >
              <Text style={styles.submitButtonText}>Add to Schedule</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  calendarContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addEventButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.muted,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  addFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  addFirstButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formSection: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: -8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
