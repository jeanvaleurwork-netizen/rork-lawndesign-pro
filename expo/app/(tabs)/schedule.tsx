import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { Plus, MapPin, Clock, Users, ClipboardList, ArrowLeft, Calendar, X } from "lucide-react-native";
import { router, Stack } from "expo-router";
import * as CalendarAPI from "expo-calendar";

import Colors from "@/constants/colors";
import { mockJobs } from "@/mocks/jobs";
import { Job } from "@/types";

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    clientName: "",
    service: "",
    address: "",
    startTime: "",
    endTime: "",
    crew: "",
  });

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const jobsByDate = mockJobs.reduce(
    (acc, job) => {
      const jobDate = job.startTime.split("T")[0];
      if (!acc[jobDate]) {
        acc[jobDate] = [];
      }
      acc[jobDate].push(job);
      return acc;
    },
    {} as Record<string, Job[]>
  );

  const selectedJobs = jobsByDate[selectedDate] || [];

  const getStatusColor = (status: Job["status"]) => {
    const statusColorMapping = {
      pending: Colors.light.muted,
      scheduled: Colors.light.primary,
      "in-progress": Colors.light.warning,
      completed: Colors.light.success,
      cancelled: Colors.light.error,
    } as const;
    return statusColorMapping[status];
  };

  const totalJobsThisWeek = Object.values(jobsByDate)
    .flat()
    .filter((job) => {
      const jobDate = new Date(job.startTime);
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);
      return jobDate >= today && jobDate <= weekFromNow;
    }).length;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const addToDeviceCalendar = async (job: Job) => {
    try {
      const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Calendar permission is needed to add events");
        return;
      }

      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(
        (cal: any) => cal.allowsModifications && (Platform.OS === "ios" ? cal.source.name === "iCloud" : cal.isPrimary)
      ) || calendars.find((cal: any) => cal.allowsModifications);

      if (!defaultCalendar) {
        Alert.alert("Error", "No calendar available for modification");
        return;
      }

      await CalendarAPI.createEventAsync(defaultCalendar.id, {
        title: `${job.service} - ${job.clientName}`,
        startDate: new Date(job.startTime),
        endDate: new Date(job.endTime),
        location: job.propertyAddress,
        notes: `Crew: ${job.crew.join(", ")}`,
        alarms: [{ relativeOffset: -60 }, { relativeOffset: -15 }],
      });

      Alert.alert("Success", "Job added to your calendar!");
    } catch (error) {
      console.error("[Calendar] Error:", error);
      Alert.alert("Error", "Failed to add job to calendar");
    }
  };

  const handleAddJob = () => {
    if (!newJob.clientName || !newJob.service || !newJob.startTime) {
      Alert.alert("Missing Information", "Please fill in required fields");
      return;
    }

    console.log("[Schedule] Adding job:", newJob);
    Alert.alert("Success", "Job added to schedule");
    setShowAddJobModal(false);
    setNewJob({
      clientName: "",
      service: "",
      address: "",
      startTime: "",
      endTime: "",
      crew: "",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Schedule",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                console.log("Schedule back button pressed");
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)");
                }
              }}
              style={{ marginLeft: 0, paddingHorizontal: 16, paddingVertical: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <ArrowLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.headerSubtitle}>{totalJobsThisWeek} jobs this week</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.dailyScheduleButton}
            onPress={() => router.push("/daily-schedule")}
          >
            <ClipboardList color={Colors.light.primary} size={18} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddJobModal(true)}
          >
            <Plus color="#FFF" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        <View style={styles.dateContainer}>
          {dates.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const isSelected = dateStr === selectedDate;
            const hasJobs = jobsByDate[dateStr] && jobsByDate[dateStr].length > 0;
            const isToday = dateStr === new Date().toISOString().split("T")[0];

            return (
              <TouchableOpacity
                key={dateStr}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                  {date.getDate()}
                </Text>
                {hasJobs && <View style={styles.dot} />}
                {isToday && !isSelected && <View style={styles.todayIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
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
        <View style={styles.jobsSection}>
          <Text style={styles.sectionTitle}>
            {selectedJobs.length} {selectedJobs.length === 1 ? "Job" : "Jobs"} Scheduled
          </Text>

          {selectedJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No jobs scheduled for this day</Text>
            </View>
          ) : (
            selectedJobs.map((job) => (
              <TouchableOpacity 
                key={job.id} 
                style={styles.jobCard}
                onPress={() => router.push({
                  pathname: "/job-detail",
                  params: { jobId: job.id }
                })}
              >
                <View style={styles.jobHeader}>
                  <View style={styles.timeContainer}>
                    <Clock color={Colors.light.primary} size={18} />
                    <Text style={styles.timeText}>
                      {new Date(job.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(job.endTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(job.status) },
                    ]}
                  />
                </View>

                <Text style={styles.jobClient}>{job.clientName}</Text>
                <Text style={styles.jobService}>{job.service}</Text>

                <View style={styles.jobLocation}>
                  <MapPin color={Colors.light.muted} size={16} />
                  <Text style={styles.jobAddress}>{job.propertyAddress}</Text>
                </View>

                <View style={styles.jobCrew}>
                  <Users color={Colors.light.muted} size={16} />
                  <Text style={styles.crewText}>{job.crew.join(", ")}</Text>
                </View>

                <TouchableOpacity
                  style={styles.addToCalendarButton}
                  onPress={() => addToDeviceCalendar(job)}
                >
                  <Calendar size={16} color={Colors.light.primary} />
                  <Text style={styles.addToCalendarText}>Add to Calendar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddJobModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddJobModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Job to Schedule</Text>
            <TouchableOpacity onPress={() => setShowAddJobModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Client Name *</Text>
              <TextInput
                style={styles.input}
                value={newJob.clientName}
                onChangeText={(text) => setNewJob({ ...newJob, clientName: text })}
                placeholder="Enter client name"
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Service Type *</Text>
              <TextInput
                style={styles.input}
                value={newJob.service}
                onChangeText={(text) => setNewJob({ ...newJob, service: text })}
                placeholder="Roofing, Landscaping, etc."
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Property Address *</Text>
              <TextInput
                style={styles.input}
                value={newJob.address}
                onChangeText={(text) => setNewJob({ ...newJob, address: text })}
                placeholder="123 Main St"
                placeholderTextColor={Colors.light.muted}
              />

              <Text style={styles.label}>Start Time *</Text>
              <View style={styles.inputRow}>
                <Clock size={20} color={Colors.light.muted} />
                <TextInput
                  style={styles.inputField}
                  value={newJob.startTime}
                  onChangeText={(text) => setNewJob({ ...newJob, startTime: text })}
                  placeholder="YYYY-MM-DD HH:MM"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <Text style={styles.label}>End Time *</Text>
              <View style={styles.inputRow}>
                <Clock size={20} color={Colors.light.muted} />
                <TextInput
                  style={styles.inputField}
                  value={newJob.endTime}
                  onChangeText={(text) => setNewJob({ ...newJob, endTime: text })}
                  placeholder="YYYY-MM-DD HH:MM"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <Text style={styles.label}>Crew Members</Text>
              <TextInput
                style={styles.input}
                value={newJob.crew}
                onChangeText={(text) => setNewJob({ ...newJob, crew: text })}
                placeholder="Mike, David (comma separated)"
                placeholderTextColor={Colors.light.muted}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddJobModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddJob}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  dailyScheduleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dateScroll: {
    maxHeight: 100,
  },
  dateContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  dateCard: {
    width: 64,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateCardActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayName: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  dayNameActive: {
    color: "#FFF",
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  dayNumberActive: {
    color: "#FFF",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
    marginTop: 4,
  },
  todayIndicator: {
    position: "absolute",
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.error,
  },
  scrollView: {
    flex: 1,
  },
  jobsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
  },
  jobCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  jobClient: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  jobService: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  jobLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  jobAddress: {
    fontSize: 14,
    color: Colors.light.muted,
    flex: 1,
  },
  jobCrew: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  crewText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  addToCalendarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.light.primary}15`,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addToCalendarText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
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
    paddingBottom: 20,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
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
