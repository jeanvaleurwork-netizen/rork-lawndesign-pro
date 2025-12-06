import React, { useRef, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Plus, MapPin, Clock, CheckCircle, AlertCircle, DollarSign, TrendingUp, BarChart3, Ruler, Satellite, Layers, Users, Sparkles, Crown, FileText, Receipt, MessageSquare, Bot, Edit2, X, Target } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { DashboardHeader } from "@/components/AdminDashboardGuard";
import { AnimatedButton } from "@/components/AnimatedButton";
import { ProgressBar } from "@/components/ProgressBar";

export default function HomeScreen() {
  const { session, isAdmin, isCrew } = useAuth();
  const { jobs, estimates, refreshData } = useData();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(50000);
  const [quarterlyGoal, setQuarterlyGoal] = useState(150000);
  const [editMonthly, setEditMonthly] = useState("");
  const [editQuarterly, setEditQuarterly] = useState("");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const crewName = session?.user.name || "";
  const myJobs = isCrew ? jobs.filter((job) => job.crew.includes(crewName)) : jobs;

  const todayJobs = myJobs.filter(
    (job) => job.status === "scheduled" || job.status === "in-progress"
  );
  const completedToday = myJobs.filter((job) => job.status === "completed").length;
  const pendingEstimates = estimates.filter((e) => e.status === "sent").length;
  const pendingInvoicesAmount = 15420;
  
  const monthlyRevenue = estimates
    .filter((e) => e.status === "approved")
    .reduce((sum, est) => sum + est.total, 0);
  const pendingRevenue = estimates
    .filter((e) => e.status === "sent")
    .reduce((sum, est) => sum + est.total, 0);
  
  const totalRevenue = monthlyRevenue + pendingRevenue;

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const stored = await AsyncStorage.getItem("@contractoros_goals");
      if (stored) {
        const goals = JSON.parse(stored);
        setMonthlyGoal(goals.monthly || 50000);
        setQuarterlyGoal(goals.quarterly || 150000);
      }
    } catch (error) {
      console.error("[Goals] Failed to load goals:", error);
    }
  };

  const saveGoals = async () => {
    const monthly = parseFloat(editMonthly);
    const quarterly = parseFloat(editQuarterly);

    if (isNaN(monthly) || monthly <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid monthly goal amount");
      return;
    }

    if (isNaN(quarterly) || quarterly <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid quarterly goal amount");
      return;
    }

    try {
      const goals = { monthly, quarterly };
      await AsyncStorage.setItem("@contractoros_goals", JSON.stringify(goals));
      setMonthlyGoal(monthly);
      setQuarterlyGoal(quarterly);
      setShowGoalModal(false);
      Alert.alert("Success", "Revenue goals updated successfully");
    } catch (error) {
      console.error("[Goals] Failed to save goals:", error);
      Alert.alert("Error", "Failed to save goals. Please try again.");
    }
  };

  const openGoalModal = () => {
    setEditMonthly(monthlyGoal.toString());
    setEditQuarterly(quarterlyGoal.toString());
    setShowGoalModal(true);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader />
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
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>{isCrew ? "My Dashboard" : "ContractorOS AI"}</Text>
              <Text style={styles.subtitle}>Welcome back, {session?.user.name || "User"}!</Text>
            </View>
            <AnimatedButton 
              style={styles.notificationBadge}
              onPress={() => router.push("/notifications")}
            >
              <AlertCircle color={Colors.light.primary} size={24} />
              <View style={styles.notificationDot} />
            </AnimatedButton>
          </View>
        </Animated.View>

        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View style={styles.revenueIconContainer}>
              <DollarSign color="#FFF" size={20} />
            </View>
            <View style={styles.revenueTextContainer}>
              <Text style={styles.revenueLabel}>Monthly Revenue</Text>
              <Text style={styles.revenueValue}>
                ${monthlyRevenue.toLocaleString()}
              </Text>
              <View style={styles.trendContainer}>
                <TrendingUp color={Colors.light.success} size={14} />
                <Text style={styles.trendText}>+12% vs last month</Text>
              </View>
            </View>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueRow}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueItemLabel}>Pending</Text>
              <Text style={styles.revenueItemValue}>
                ${pendingRevenue.toLocaleString()}
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueItemLabel}>Collected</Text>
              <Text style={styles.revenueItemValue}>
                ${(monthlyRevenue - pendingRevenue).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconContainer, { backgroundColor: "#EBF5FF" }]}>
              <Clock color={Colors.light.primary} size={20} />
            </View>
            <Text style={styles.kpiValue}>{todayJobs.length}</Text>
            <Text style={styles.kpiLabel}>Today&apos;s Jobs</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconContainer, { backgroundColor: "#FEF3C7" }]}>
              <FileText color={Colors.light.warning} size={20} />
            </View>
            <Text style={styles.kpiValue}>{pendingEstimates}</Text>
            <Text style={styles.kpiLabel}>Pending Estimates</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconContainer, { backgroundColor: "#FEE2E2" }]}>
              <Receipt color={"#EF4444"} size={20} />
            </View>
            <Text style={styles.kpiValue}>${(pendingInvoicesAmount / 1000).toFixed(1)}k</Text>
            <Text style={styles.kpiLabel}>Pending Invoices</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconContainer, { backgroundColor: "#D1FAE5" }]}>
              <CheckCircle color={Colors.light.success} size={20} />
            </View>
            <Text style={styles.kpiValue}>${(monthlyRevenue / 1000).toFixed(1)}k</Text>
            <Text style={styles.kpiLabel}>Received Payments</Text>
          </View>
        </View>

        {session?.user.role === "admin" && (
          <TouchableOpacity
            style={styles.adminDashboardButton}
            onPress={() => router.push("/admin-dashboard")}
          >
            <View style={styles.adminDashboardContent}>
              <Crown color="#92400E" size={28} />
              <View style={styles.adminDashboardText}>
                <Text style={styles.adminDashboardTitle}>Admin Control Center</Text>
                <Text style={styles.adminDashboardSubtitle}>
                  Manage team, approve estimates, view financials
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <AnimatedButton 
              style={styles.actionButton}
              onPress={() => router.push("/estimate-detail")}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.light.cyan }]}>
                <Plus color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>New Estimate</Text>
            </AnimatedButton>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/aerial-viewer")}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.light.purple }]}>
                <Satellite color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Aerial Viewer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/measurement-hub" as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.light.secondary }]}>
                <Layers color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Measurement Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/backyard-measure")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#10B981" }]}>
                <Ruler color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Backyard Measure</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/customer-intake")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#10B981" }]}>
                <Bot color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>AI Intake</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/ai-intake-dashboard")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#3B82F6" }]}>
                <MessageSquare color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>AI Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/crew-invites" as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#F59E0B" }]}>
                <Plus color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Invite Crew</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/ai-cost-analyzer")}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.light.purple }]}>
                <Sparkles color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>AI Cost</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/trade-tools")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#EF4444" }]}>
                <Plus color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Trade Tools</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/business-settings")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#06B6D4" }]}>
                <Plus color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/pagos-ai-dashboard")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#8B5CF6" }]}>
                <DollarSign color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Pagos AI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/(tabs)/receipts")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#EC4899" }]}>
                <Receipt color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Receipts</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/analytics")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#10B981" }]}>
                <BarChart3 color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/ai-office")}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.light.purple }]}>
                <Plus color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>AI Office</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/(tabs)/crew")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#F59E0B" }]}>
                <Users color="#FFF" size={24} />
              </View>
              <Text style={styles.actionLabel}>Crew</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue Goals</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.editGoalButton}
                onPress={openGoalModal}
              >
                <Edit2 color={Colors.light.primary} size={20} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.goalsCard}>
            <ProgressBar
              label="Monthly Revenue Goal"
              value={monthlyRevenue}
              maxValue={monthlyGoal}
              color={Colors.light.primary}
            />
            <ProgressBar
              label="Quarterly Revenue Goal"
              value={totalRevenue}
              maxValue={quarterlyGoal}
              color={Colors.light.success}
            />
            <View style={styles.goalsSummary}>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Monthly Progress</Text>
                <Text style={styles.goalValue}>
                  {Math.round((monthlyRevenue / monthlyGoal) * 100)}%
                </Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>To Goal</Text>
                <Text style={styles.goalValue}>
                  ${(monthlyGoal - monthlyRevenue).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Jobs</Text>
          {todayJobs.map((job) => (
            <TouchableOpacity 
              key={job.id} 
              style={styles.jobCard}
              onPress={() => router.push(`/job-detail?jobId=${job.id}` as any)}
            >
              <View style={styles.jobHeader}>
                <Text style={styles.jobTime}>
                  {new Date(job.startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    job.status === "in-progress"
                      ? styles.statusInProgress
                      : styles.statusScheduled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      job.status === "in-progress"
                        ? styles.statusTextInProgress
                        : styles.statusTextScheduled,
                    ]}
                  >
                    {job.status === "in-progress" ? "In Progress" : "Scheduled"}
                  </Text>
                </View>
              </View>
              <Text style={styles.jobClient}>{job.clientName}</Text>
              <Text style={styles.jobService}>{job.service}</Text>
              <View style={styles.jobLocation}>
                <MapPin color={Colors.light.muted} size={16} />
                <Text style={styles.jobAddress}>{job.propertyAddress}</Text>
              </View>
              <View style={styles.jobCrew}>
                <Text style={styles.crewLabel}>Crew:</Text>
                <Text style={styles.crewMembers}>{job.crew.join(", ")}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Target color={Colors.light.primary} size={24} />
                <Text style={styles.modalTitle}>Edit Revenue Goals</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGoalModal(false)}
                style={styles.modalCloseButton}
              >
                <X color={Colors.light.muted} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monthly Revenue Goal</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={editMonthly}
                    onChangeText={setEditMonthly}
                    keyboardType="numeric"
                    placeholder="50000"
                    placeholderTextColor={Colors.light.muted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quarterly Revenue Goal</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={editQuarterly}
                    onChangeText={setEditQuarterly}
                    keyboardType="numeric"
                    placeholder="150000"
                    placeholderTextColor={Colors.light.muted}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowGoalModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={saveGoals}
                >
                  <Text style={styles.modalSaveText}>Save Goals</Text>
                </TouchableOpacity>
              </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  notificationBadge: {
    position: "relative",
    padding: 8,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.error,
  },
  revenueCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  revenueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  revenueTextContainer: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 6,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    color: Colors.light.success,
    fontWeight: "600" as const,
  },
  revenueDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 16,
  },
  revenueRow: {
    flexDirection: "row",
    gap: 20,
  },
  revenueItem: {
    flex: 1,
  },
  revenueItemLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  revenueItemValue: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  kpiContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  kpiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    textAlign: "center",
    fontWeight: "500" as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  editGoalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  actionGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: Colors.light.text,
    textAlign: "center",
  },
  jobCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  jobTime: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusScheduled: {
    backgroundColor: Colors.light.cardLight,
  },
  statusInProgress: {
    backgroundColor: Colors.light.cardLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusTextScheduled: {
    color: Colors.light.primary,
  },
  statusTextInProgress: {
    color: Colors.light.warning,
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
  crewLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  crewMembers: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  goalsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  goalsSummary: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  goalItem: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  goalLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  adminDashboardButton: {
    backgroundColor: "#FEF3C7",
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FDE68A",
    shadowColor: "#92400E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  adminDashboardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  adminDashboardText: {
    flex: 1,
  },
  adminDashboardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
    marginBottom: 4,
  },
  adminDashboardSubtitle: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    paddingVertical: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
