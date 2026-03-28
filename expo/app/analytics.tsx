import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Stack } from "expo-router";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Clock,
  Target,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react-native";

import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

interface MetricData {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: any;
  color: string;
  bgColor: string;
}

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  const metrics: MetricData[] = [
    {
      label: "Total Revenue",
      value: "$127,850",
      change: 12.5,
      trend: "up",
      icon: DollarSign,
      color: Colors.light.success,
      bgColor: "#D1FAE5",
    },
    {
      label: "Active Jobs",
      value: "23",
      change: 8.3,
      trend: "up",
      icon: Briefcase,
      color: Colors.light.primary,
      bgColor: "#EBF5FF",
    },
    {
      label: "New Clients",
      value: "18",
      change: -4.2,
      trend: "down",
      icon: Users,
      color: Colors.light.accent,
      bgColor: "#FEF3C7",
    },
    {
      label: "Avg Job Value",
      value: "$4,286",
      change: 15.8,
      trend: "up",
      icon: Target,
      color: Colors.light.secondary,
      bgColor: "#E0E7FF",
    },
  ];

  const revenueByService = [
    { service: "Lawn Installation", amount: 45200, percentage: 35 },
    { service: "Landscaping Design", amount: 32500, percentage: 25 },
    { service: "Maintenance", amount: 25600, percentage: 20 },
    { service: "Hardscaping", amount: 16300, percentage: 13 },
    { service: "Other Services", amount: 8250, percentage: 7 },
  ];

  const monthlyData = [
    { month: "Jun", revenue: 89500, jobs: 18 },
    { month: "Jul", revenue: 102300, jobs: 22 },
    { month: "Aug", revenue: 115700, jobs: 25 },
    { month: "Sep", revenue: 98200, jobs: 21 },
    { month: "Oct", revenue: 125400, jobs: 27 },
    { month: "Nov", revenue: 127850, jobs: 23 },
  ];

  const topPerformers = [
    { name: "Mike Johnson", jobs: 45, revenue: 198500, rating: 4.9 },
    { name: "Sarah Martinez", jobs: 38, revenue: 167200, rating: 4.8 },
    { name: "David Lee", jobs: 35, revenue: 152800, rating: 4.7 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Business Analytics",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Performance Dashboard</Text>
              <Text style={styles.subtitle}>Track your business growth</Text>
            </View>
          </View>

          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === "week" && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod("week")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === "week" && styles.periodButtonTextActive,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === "month" && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod("month")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === "month" && styles.periodButtonTextActive,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === "year" && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod("year")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === "year" && styles.periodButtonTextActive,
                ]}
              >
                Year
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <View key={index} style={styles.metricCard}>
                  <View style={[styles.metricIcon, { backgroundColor: metric.bgColor }]}>
                    <Icon color={metric.color} size={20} />
                  </View>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <View style={styles.metricChange}>
                    {metric.trend === "up" ? (
                      <ArrowUpRight color={Colors.light.success} size={14} />
                    ) : (
                      <ArrowDownRight color={Colors.light.error} size={14} />
                    )}
                    <Text
                      style={[
                        styles.metricChangeText,
                        {
                          color:
                            metric.trend === "up" ? Colors.light.success : Colors.light.error,
                        },
                      ]}
                    >
                      {Math.abs(metric.change)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue by Service</Text>
            {revenueByService.map((item, index) => (
              <View key={index} style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{item.service}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: Colors.light.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.serviceStats}>
                  <Text style={styles.serviceAmount}>
                    ${item.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.servicePercentage}>{item.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Trend</Text>
            <View style={styles.chartCard}>
              <View style={styles.chartBars}>
                {monthlyData.map((data, index) => {
                  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));
                  const height = (data.revenue / maxRevenue) * 120;
                  return (
                    <View key={index} style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height,
                            backgroundColor:
                              index === monthlyData.length - 1
                                ? Colors.light.primary
                                : Colors.light.border,
                          },
                        ]}
                      />
                      <Text style={styles.chartLabel}>{data.month}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.light.primary }]} />
                  <Text style={styles.legendText}>Current Month</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            {topPerformers.map((performer, index) => (
              <View key={index} style={styles.performerCard}>
                <View style={styles.performerRank}>
                  <Award
                    color={index === 0 ? "#F59E0B" : index === 1 ? "#9CA3AF" : "#D97706"}
                    size={20}
                  />
                </View>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{performer.name}</Text>
                  <View style={styles.performerStats}>
                    <View style={styles.performerStat}>
                      <Briefcase color={Colors.light.muted} size={14} />
                      <Text style={styles.performerStatText}>{performer.jobs} jobs</Text>
                    </View>
                    <View style={styles.performerStat}>
                      <DollarSign color={Colors.light.muted} size={14} />
                      <Text style={styles.performerStatText}>
                        ${(performer.revenue / 1000).toFixed(0)}k
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.performerRating}>
                  <Text style={styles.ratingText}>⭐ {performer.rating}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp color={Colors.light.success} size={24} />
              <Text style={styles.insightTitle}>Business Insights</Text>
            </View>
            <View style={styles.insightList}>
              <View style={styles.insightItem}>
                <Text style={styles.insightBullet}>•</Text>
                <Text style={styles.insightText}>
                  Revenue increased 12.5% compared to last month
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightBullet}>•</Text>
                <Text style={styles.insightText}>
                  Lawn Installation is your most profitable service
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightBullet}>•</Text>
                <Text style={styles.insightText}>
                  Average job value up 15.8% - focus on premium services
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightBullet}>•</Text>
                <Text style={styles.insightText}>
                  November on track to be your best month this year
                </Text>
              </View>
            </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.muted,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  periodButtonTextActive: {
    color: "#FFF",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricChangeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  serviceStats: {
    alignItems: "flex-end",
  },
  serviceAmount: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  servicePercentage: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  chartCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    marginBottom: 16,
  },
  chartBarContainer: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 32,
    borderRadius: 6,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  performerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  performerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  performerStats: {
    flexDirection: "row",
    gap: 16,
  },
  performerStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  performerStatText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  performerRating: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  insightCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  insightList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: "row",
    gap: 12,
  },
  insightBullet: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "700" as const,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
});
