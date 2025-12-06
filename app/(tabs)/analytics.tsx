import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Stack } from "expo-router";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Award,
  Target,
  Percent,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyticsScreen() {
  const { estimates, clients } = useData();
  const { isAdmin } = useAuth();

  const analytics = useMemo(() => {
    const totalRevenue = estimates
      .filter((e) => e.status === "approved")
      .reduce((sum, est) => sum + est.total, 0);

    const monthlyRevenue = estimates
      .filter((e) => {
        const createdDate = new Date(e.createdDate);
        const now = new Date();
        return (
          e.status === "approved" &&
          createdDate.getMonth() === now.getMonth() &&
          createdDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, est) => sum + est.total, 0);

    const avgJobValue = totalRevenue / estimates.filter((e) => e.status === "approved").length || 0;

    const approvalRate =
      estimates.length > 0
        ? (estimates.filter((e) => e.status === "approved").length / estimates.length) * 100
        : 0;

    const pendingRevenue = estimates
      .filter((e) => e.status === "sent")
      .reduce((sum, est) => sum + est.total, 0);

    const totalProfit = estimates
      .filter((e) => e.status === "approved" && e.profitAmount)
      .reduce((sum, est) => sum + (est.profitAmount || 0), 0);

    const avgProfitMargin =
      estimates.filter((e) => e.status === "approved" && e.profitMargin).length > 0
        ? estimates
            .filter((e) => e.status === "approved" && e.profitMargin)
            .reduce((sum, est) => sum + (est.profitMargin || 0), 0) /
          estimates.filter((e) => e.status === "approved" && e.profitMargin).length
        : 0;

    const repeatCustomerRate =
      clients.length > 0
        ? (clients.filter((c) => c.customerType === "recurring").length / clients.length) * 100
        : 0;

    const newCustomersThisMonth = clients.filter((c) => c.customerType === "new").length;

    const topClients = clients
      .map((client) => ({
        ...client,
        revenue: estimates
          .filter((e) => e.clientId === client.id && e.status === "approved")
          .reduce((sum, est) => sum + est.total, 0),
      }))
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const jobTypes: Record<string, { count: number; revenue: number }> = {};
    estimates
      .filter((e) => e.status === "approved")
      .forEach((est) => {
        const jobs = est.lineItems.map((item) => item.category || "other");
        jobs.forEach((job) => {
          if (!jobTypes[job]) {
            jobTypes[job] = { count: 0, revenue: 0 };
          }
          jobTypes[job].count++;
          jobTypes[job].revenue += est.total / jobs.length;
        });
      });

    const mostProfitableJobType = Object.entries(jobTypes)
      .sort((a, b) => b[1].revenue - a[1].revenue)[0];

    return {
      totalRevenue,
      monthlyRevenue,
      avgJobValue,
      approvalRate,
      pendingRevenue,
      totalProfit,
      avgProfitMargin,
      repeatCustomerRate,
      newCustomersThisMonth,
      topClients,
      mostProfitableJobType: mostProfitableJobType
        ? { type: mostProfitableJobType[0], ...mostProfitableJobType[1] }
        : null,
    };
  }, [estimates, clients]);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedTitle}>Access Restricted</Text>
          <Text style={styles.restrictedText}>
            Only admins can access analytics
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Business Performance</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Analytics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}>
                <DollarSign color={Colors.light.success} size={24} />
              </View>
              <Text style={styles.statValue}>
                ${(analytics.totalRevenue / 1000).toFixed(1)}K
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#EBF5FF" }]}>
                <Calendar color={Colors.light.primary} size={24} />
              </View>
              <Text style={styles.statValue}>
                ${(analytics.monthlyRevenue / 1000).toFixed(1)}K
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Target color={Colors.light.warning} size={24} />
              </View>
              <Text style={styles.statValue}>
                ${analytics.avgJobValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Avg Job Value</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#E0E7FF" }]}>
                <TrendingUp color={Colors.light.info} size={24} />
              </View>
              <Text style={styles.statValue}>
                ${(analytics.pendingRevenue / 1000).toFixed(1)}K
              </Text>
              <Text style={styles.statLabel}>Pending Revenue</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimate Analytics</Text>

          <View style={styles.card}>
            <View style={styles.metricRow}>
              <View style={styles.metricIconWrapper}>
                <FileText color={Colors.light.primary} size={20} />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Approval Rate</Text>
                <Text style={styles.metricValue}>{analytics.approvalRate.toFixed(1)}%</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${analytics.approvalRate}%`,
                    backgroundColor: Colors.light.success,
                  },
                ]}
              />
            </View>
            <Text style={styles.metricSubtext}>
              {estimates.filter((e) => e.status === "approved").length} of {estimates.length}{" "}
              estimates approved
            </Text>
          </View>
        </View>

        {analytics.totalProfit > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profitability</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}>
                  <Award color={Colors.light.success} size={24} />
                </View>
                <Text style={styles.statValue}>
                  ${(analytics.totalProfit / 1000).toFixed(1)}K
                </Text>
                <Text style={styles.statLabel}>Total Profit</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
                  <Percent color={Colors.light.warning} size={24} />
                </View>
                <Text style={styles.statValue}>{analytics.avgProfitMargin.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Avg Margin</Text>
              </View>
            </View>

            {analytics.avgProfitMargin < 25 && (
              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>⚠️ Below Target Margin</Text>
                <Text style={styles.alertText}>
                  Your average profit margin is {analytics.avgProfitMargin.toFixed(1)}%. Consider
                  aiming for 30-35% for healthier profitability.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Analytics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#EBF5FF" }]}>
                <Users color={Colors.light.primary} size={24} />
              </View>
              <Text style={styles.statValue}>{clients.length}</Text>
              <Text style={styles.statLabel}>Total Clients</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <TrendingUp color={Colors.light.warning} size={24} />
              </View>
              <Text style={styles.statValue}>{analytics.newCustomersThisMonth}</Text>
              <Text style={styles.statLabel}>New This Month</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}>
                <Award color={Colors.light.success} size={24} />
              </View>
              <Text style={styles.statValue}>{analytics.repeatCustomerRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Repeat Rate</Text>
            </View>
          </View>

          {analytics.topClients.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Top 5 Customers by Revenue</Text>
              {analytics.topClients.map((client, index) => (
                <View key={client.id} style={styles.topClientRow}>
                  <View style={styles.topClientRank}>
                    <Text style={styles.topClientRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.topClientInfo}>
                    <Text style={styles.topClientName}>{client.name}</Text>
                    <Text style={styles.topClientJobs}>{client.jobsCount} jobs</Text>
                  </View>
                  <Text style={styles.topClientRevenue}>
                    ${(client.revenue / 1000).toFixed(1)}K
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {analytics.mostProfitableJobType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Type Performance</Text>

            <View style={styles.card}>
              <View style={styles.jobTypeHeader}>
                <View style={styles.jobTypeBadge}>
                  <Target color={Colors.light.primary} size={20} />
                </View>
                <View style={styles.jobTypeInfo}>
                  <Text style={styles.jobTypeTitle}>Most Profitable Service</Text>
                  <Text style={styles.jobTypeName}>
                    {analytics.mostProfitableJobType.type.charAt(0).toUpperCase() +
                      analytics.mostProfitableJobType.type.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.jobTypeStats}>
                <View style={styles.jobTypeStat}>
                  <Text style={styles.jobTypeStatLabel}>Revenue</Text>
                  <Text style={styles.jobTypeStatValue}>
                    ${(analytics.mostProfitableJobType.revenue / 1000).toFixed(1)}K
                  </Text>
                </View>
                <View style={styles.jobTypeStat}>
                  <Text style={styles.jobTypeStatLabel}>Jobs</Text>
                  <Text style={styles.jobTypeStatValue}>
                    {analytics.mostProfitableJobType.count}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
    fontWeight: "500" as const,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metricIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  metricSubtext: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  alertCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginTop: 12,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#92400E",
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  topClientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  topClientRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topClientRankText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  topClientInfo: {
    flex: 1,
  },
  topClientName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  topClientJobs: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  topClientRevenue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  jobTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  jobTypeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  jobTypeInfo: {
    flex: 1,
  },
  jobTypeTitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  jobTypeName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  jobTypeStats: {
    flexDirection: "row",
    gap: 24,
  },
  jobTypeStat: {
    flex: 1,
  },
  jobTypeStatLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  jobTypeStatValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
  },
});
