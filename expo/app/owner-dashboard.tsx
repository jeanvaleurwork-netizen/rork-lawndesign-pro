import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar,
  Activity,
  ChevronRight,
  Clock,
  Briefcase,
  X,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

interface KPICard {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: typeof TrendingUp;
  change?: number;
}

interface RiskProject {
  id: string;
  name: string;
  client: string;
  tradeType: string;
  forecastDelayDays: number;
  forecastCostOverrunPercent: number;
  riskLevel: "HIGH_RISK" | "LARGE" | "MEDIUM";
}

interface UpcomingPayment {
  id: string;
  projectName: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "OVERDUE";
}

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const { jobs, estimates, refreshData } = useData();

  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateRange, setDateRange] = useState<string>("30d");

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const analytics = useMemo(() => {
    const activeJobs = jobs.filter(j => j.status === "in-progress" || j.status === "scheduled");
    const completedJobs = jobs.filter(j => j.status === "completed");
    
    const totalContractValue = estimates
      .filter(e => e.status === "approved")
      .reduce((sum, e) => sum + e.total, 0);

    const pendingValue = estimates
      .filter(e => e.status === "sent")
      .reduce((sum, e) => sum + e.total, 0);

    const monthlyRevenue = estimates
      .filter((e) => {
        const date = new Date(e.createdDate);
        const now = new Date();
        return e.status === "approved" && 
               date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.total, 0);

    const avgMargin = estimates
      .filter(e => e.status === "approved" && e.profitMargin)
      .reduce((sum, e) => sum + (e.profitMargin || 0), 0) / 
      (estimates.filter(e => e.status === "approved" && e.profitMargin).length || 1);

    const avgDelay = jobs
      .filter(j => j.status === "completed")
      .length > 0 ? 2.3 : 0;

    const riskProjects = jobs
      .filter(j => (j.actualCost || 0) > (j.budgetedCost || 0) * 1.1)
      .map(j => {
        const estimate = estimates.find(e => e.id === j.estimateId);
        return {
          id: j.id,
          name: j.service,
          client: j.clientName,
          tradeType: "general",
          forecastDelayDays: Math.floor(Math.random() * 15) + 1,
          forecastCostOverrunPercent: Math.floor(
            ((j.actualCost || 0) / (j.budgetedCost || 1) - 1) * 100
          ),
          riskLevel: (j.actualCost || 0) > (j.budgetedCost || 1) * 1.2 
            ? "HIGH_RISK" as const
            : "LARGE" as const,
        };
      })
      .slice(0, 5);

    const upcomingPayments = estimates
      .filter(e => e.status === "approved")
      .slice(0, 5)
      .map((e, idx) => ({
        id: e.id,
        projectName: `Project for ${e.clientName}`,
        clientName: e.clientName,
        amount: e.total * 0.5,
        dueDate: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: idx === 0 ? "OVERDUE" as const : "PENDING" as const,
      }));

    return {
      activeJobs: activeJobs.length,
      totalContractValue,
      monthlyRevenue,
      avgMargin,
      avgDelay,
      riskProjects,
      upcomingPayments,
      pendingValue,
      completedJobs: completedJobs.length,
    };
  }, [jobs, estimates]);

  const kpis: KPICard[] = useMemo(() => [
    { 
      title: "Active Projects", 
      value: analytics.activeJobs.toString(), 
      trend: "+3 this week", 
      trendUp: true, 
      icon: Activity,
      change: 12.5,
    },
    { 
      title: "Total Contract Value", 
      value: `${(analytics.totalContractValue / 1000).toFixed(0)}K`, 
      trend: "+12% vs last month", 
      trendUp: true, 
      icon: DollarSign,
      change: 12,
    },
    { 
      title: "Monthly Revenue", 
      value: `${(analytics.monthlyRevenue / 1000).toFixed(0)}K`, 
      trend: "On track", 
      trendUp: true, 
      icon: TrendingUp,
      change: 8.3,
    },
    { 
      title: "Avg Project Margin", 
      value: `${analytics.avgMargin.toFixed(1)}%`, 
      trend: "+2% improvement", 
      trendUp: true, 
      icon: TrendingUp,
      change: 2,
    },
    { 
      title: "Avg Forecast Delay", 
      value: `${analytics.avgDelay.toFixed(1)} days`, 
      trend: "-1.2 days vs last period", 
      trendUp: false, 
      icon: Clock,
      change: -1.2,
    },
  ], [analytics]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH_RISK":
        return Colors.light.error;
      case "LARGE":
        return "#F59E0B";
      case "MEDIUM":
        return "#10B981";
      default:
        return Colors.light.muted;
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "HIGH_RISK":
        return "#FEE2E2";
      case "LARGE":
        return "#FEF3C7";
      case "MEDIUM":
        return "#D1FAE5";
      default:
        return Colors.light.background;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Owner Dashboard",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />

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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Performance Overview</Text>
            <Text style={styles.subtitle}>Real-time business intelligence</Text>
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Calendar color={Colors.light.primary} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <Briefcase color={Colors.light.primary} size={20} />
            <Text style={styles.quickStatValue}>{analytics.activeJobs}</Text>
            <Text style={styles.quickStatLabel}>Active</Text>
          </View>
          <View style={styles.quickStatCard}>
            <FileText color={Colors.light.warning} size={20} />
            <Text style={styles.quickStatValue}>{analytics.completedJobs}</Text>
            <Text style={styles.quickStatLabel}>Completed</Text>
          </View>
          <View style={styles.quickStatCard}>
            <DollarSign color={Colors.light.success} size={20} />
            <Text style={styles.quickStatValue}>${(analytics.pendingValue / 1000).toFixed(0)}K</Text>
            <Text style={styles.quickStatLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const ChangeIcon = kpi.trendUp ? ArrowUpRight : ArrowDownRight;
            return (
              <View key={index} style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                  <View style={[styles.kpiIconContainer, { backgroundColor: Colors.light.primary + "20" }]}>
                    <Icon color={Colors.light.primary} size={20} />
                  </View>
                  {kpi.change && (
                    <View style={[styles.changeIndicator, { backgroundColor: kpi.trendUp ? "#D1FAE5" : "#FEE2E2" }]}>
                      <ChangeIcon 
                        color={kpi.trendUp ? Colors.light.success : Colors.light.error} 
                        size={12} 
                      />
                      <Text style={[styles.changeText, { color: kpi.trendUp ? Colors.light.success : Colors.light.error }]}>
                        {Math.abs(kpi.change)}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.kpiTitle}>{kpi.title}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <Text style={[styles.kpiTrend, { color: kpi.trendUp ? Colors.light.success : Colors.light.muted }]}>
                  {kpi.trend}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects at Risk</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {analytics.riskProjects.length > 0 ? analytics.riskProjects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.riskCard}
              onPress={() => router.push("/project-forecast-panel" as any)}
            >
              <View style={styles.riskCardHeader}>
                <View style={[styles.riskBadge, { backgroundColor: getRiskBg(project.riskLevel) }]}>
                  <AlertTriangle color={getRiskColor(project.riskLevel)} size={16} />
                  <Text style={[styles.riskBadgeText, { color: getRiskColor(project.riskLevel) }]}>
                    {project.riskLevel.replace("_", " ")}
                  </Text>
                </View>
                <ChevronRight color={Colors.light.muted} size={20} />
              </View>

              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.clientName}>{project.client}</Text>

              <View style={styles.riskMetrics}>
                <View style={styles.riskMetric}>
                  <Text style={styles.riskMetricLabel}>Forecast Delay:</Text>
                  <Text style={styles.riskMetricValue}>+{project.forecastDelayDays} days</Text>
                </View>
                <View style={styles.riskMetric}>
                  <Text style={styles.riskMetricLabel}>Cost Overrun:</Text>
                  <Text style={styles.riskMetricValue}>+{project.forecastCostOverrunPercent}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No projects at risk</Text>
              <Text style={styles.emptyStateSubtext}>All projects are on track!</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Payments</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {analytics.upcomingPayments.length > 0 ? analytics.upcomingPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentProjectName}>{payment.projectName}</Text>
                <Text style={styles.paymentClientName}>{payment.clientName}</Text>
                <View style={styles.paymentRow}>
                  <Calendar color={Colors.light.muted} size={14} />
                  <Text style={styles.paymentDate}>
                    Due: {new Date(payment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </Text>
                  {payment.status === "OVERDUE" && (
                    <View style={styles.overdueBadge}>
                      <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.paymentAmount}>${payment.amount.toLocaleString()}</Text>
            </View>
          )) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming payments</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/admin-console-home" as any)}
          >
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Open Mission Control</Text>
              <Text style={styles.actionCardSubtitle}>
                View contracts, alerts, and complete business overview
              </Text>
            </View>
            <ChevronRight color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Date Range</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              {["7d", "30d", "90d", "1y"].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.rangeButton,
                    dateRange === range && styles.rangeButtonActive,
                  ]}
                  onPress={() => {
                    setDateRange(range);
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.rangeButtonText,
                      dateRange === range && styles.rangeButtonTextActive,
                    ]}
                  >
                    {range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : range === "90d" ? "Last 90 Days" : "Last Year"}
                  </Text>
                </TouchableOpacity>
              ))}
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  kpiGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  kpiCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  kpiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  kpiTitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  kpiTrend: {
    fontSize: 12,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  riskCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  riskCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 12,
  },
  riskMetrics: {
    flexDirection: "row",
    gap: 16,
  },
  riskMetric: {
    flex: 1,
  },
  riskMetricLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 2,
  },
  riskMetricValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.error,
  },
  paymentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentProjectName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  paymentClientName: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentDate: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  overdueBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.light.error,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  actionCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  actionCardContent: {
    flex: 1,
    marginRight: 12,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: "#FFF",
    opacity: 0.9,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginVertical: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: Colors.light.muted,
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalContent: {
    padding: 20,
    gap: 12,
  },
  rangeButton: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  rangeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  rangeButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  rangeButtonTextActive: {
    color: "#FFF",
  },
});
