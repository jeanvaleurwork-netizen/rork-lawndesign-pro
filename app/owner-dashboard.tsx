import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
} from "lucide-react-native";
import Colors from "@/constants/colors";

interface KPICard {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: typeof TrendingUp;
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

const mockKPIs: KPICard[] = [
  { title: "Active Projects", value: "24", trend: "+3 this week", trendUp: true, icon: Activity },
  { title: "Total Contract Value", value: "$486K", trend: "+12% vs last month", trendUp: true, icon: DollarSign },
  { title: "Forecasted Revenue (30d)", value: "$125K", trend: "On track", trendUp: true, icon: TrendingUp },
  { title: "Avg Project Margin", value: "32%", trend: "+2% improvement", trendUp: true, icon: TrendingUp },
  { title: "Avg Forecast Delay", value: "2.3 days", trend: "-1.2 days vs last period", trendUp: false, icon: Clock },
];

const mockRiskProjects: RiskProject[] = [
  {
    id: "1",
    name: "Oak Street Roof Replacement",
    client: "Johnson Residence",
    tradeType: "roofing",
    forecastDelayDays: 14,
    forecastCostOverrunPercent: 22,
    riskLevel: "HIGH_RISK",
  },
  {
    id: "2",
    name: "Downtown Commercial Landscaping",
    client: "ABC Corp",
    tradeType: "landscaping",
    forecastDelayDays: 8,
    forecastCostOverrunPercent: 12,
    riskLevel: "LARGE",
  },
];

const mockUpcomingPayments: UpcomingPayment[] = [
  {
    id: "1",
    projectName: "Elm St Kitchen Remodel",
    clientName: "Smith Family",
    amount: 8500,
    dueDate: "2025-12-10",
    status: "PENDING",
  },
  {
    id: "2",
    projectName: "Pine Ave Driveway",
    clientName: "Davis Property",
    amount: 4200,
    dueDate: "2025-12-05",
    status: "OVERDUE",
  },
];

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

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

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Overview</Text>
          <Text style={styles.subtitle}>Real-time business intelligence</Text>
        </View>

        <View style={styles.kpiGrid}>
          {mockKPIs.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <View key={index} style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                  <Icon color={Colors.light.primary} size={24} />
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

          {mockRiskProjects.map((project) => (
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
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Payments</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {mockUpcomingPayments.map((payment) => (
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
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/admin-console-home" as any)}
          >
            <Text style={styles.actionCardTitle}>Open Mission Control</Text>
            <Text style={styles.actionCardSubtitle}>
              View contracts, alerts, and complete business overview
            </Text>
            <ChevronRight color={Colors.light.primary} size={24} />
          </TouchableOpacity>
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
    marginBottom: 12,
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
    flex: 1,
  },
});
