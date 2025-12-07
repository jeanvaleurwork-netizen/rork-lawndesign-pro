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
  FileText,
  AlertCircle,
  DollarSign,
  Calendar,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import Colors from "@/constants/colors";

interface TodayOverviewCard {
  title: string;
  value: number;
  icon: typeof Calendar;
  color: string;
}

interface ContractPending {
  id: string;
  clientName: string;
  projectName: string;
  totalAmount: number;
  status: "SENT" | "VIEWED";
  sentAt: string;
  lastViewedAt?: string;
}

interface AlertItem {
  id: string;
  projectName: string;
  type: "HIGH_RISK" | "DELAY" | "LOW_MARGIN";
  reason: string;
  action: string;
}

const mockOverview: TodayOverviewCard[] = [
  { title: "Jobs Scheduled Today", value: 8, icon: Calendar, color: Colors.light.primary },
  { title: "Payments Due Today", value: 3, icon: DollarSign, color: Colors.light.success },
  { title: "New Leads Today", value: 12, icon: TrendingUp, color: "#F59E0B" },
  { title: "Contracts Awaiting Signature", value: 4, icon: FileText, color: Colors.light.error },
];

const mockPendingContracts: ContractPending[] = [
  {
    id: "C-001",
    clientName: "Johnson Residence",
    projectName: "Roof Replacement",
    totalAmount: 18500,
    status: "VIEWED",
    sentAt: "2025-12-02",
    lastViewedAt: "2025-12-05",
  },
  {
    id: "C-002",
    clientName: "Smith Property",
    projectName: "Kitchen Remodel",
    totalAmount: 32000,
    status: "SENT",
    sentAt: "2025-12-04",
  },
];

const mockAlerts: AlertItem[] = [
  {
    id: "1",
    projectName: "Oak Street Development",
    type: "HIGH_RISK",
    reason: "Forecast shows 15 day delay + 25% cost overrun",
    action: "Review change orders and adjust timeline",
  },
  {
    id: "2",
    projectName: "Downtown Plaza",
    type: "LOW_MARGIN",
    reason: "Profit margin at 8% (below 10% threshold)",
    action: "Review actual costs and adjust future pricing",
  },
];

export default function AdminConsoleHomeScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>("overview");

  const getStatusColor = (status: string) => {
    return status === "VIEWED" ? Colors.light.success : Colors.light.primary;
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "HIGH_RISK":
        return Colors.light.error;
      case "DELAY":
        return "#F59E0B";
      case "LOW_MARGIN":
        return "#8B5CF6";
      default:
        return Colors.light.muted;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Mission Control",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Filter color={Colors.light.text} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Search color={Colors.light.text} size={20} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.overviewGrid}>
            {mockOverview.map((item, index) => {
              const Icon = item.icon;
              return (
                <View key={index} style={styles.overviewCard}>
                  <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
                    <Icon color={item.color} size={20} />
                  </View>
                  <Text style={styles.overviewValue}>{item.value}</Text>
                  <Text style={styles.overviewTitle}>{item.title}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contracts & Signatures</Text>
            <TouchableOpacity onPress={() => router.push("/contracts" as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {mockPendingContracts.map((contract) => (
            <View key={contract.id} style={styles.contractCard}>
              <View style={styles.contractInfo}>
                <View style={styles.contractHeader}>
                  <Text style={styles.contractId}>{contract.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(contract.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
                      {contract.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.contractProject}>{contract.projectName}</Text>
                <Text style={styles.contractClient}>{contract.clientName}</Text>
                <View style={styles.contractMeta}>
                  <Text style={styles.contractMetaText}>
                    Sent: {new Date(contract.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </Text>
                  {contract.lastViewedAt && (
                    <Text style={styles.contractMetaText}>
                      Last viewed: {new Date(contract.lastViewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.contractActions}>
                <Text style={styles.contractAmount}>${contract.totalAmount.toLocaleString()}</Text>
                <TouchableOpacity style={styles.resendButton}>
                  <Text style={styles.resendButtonText}>Resend</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Risk & Alerts</Text>
            <TouchableOpacity onPress={() => router.push("/owner-dashboard" as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {mockAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <AlertCircle color={getAlertColor(alert.type)} size={20} />
                <Text style={[styles.alertType, { color: getAlertColor(alert.type) }]}>
                  {alert.type.replace("_", " ")}
                </Text>
              </View>
              <Text style={styles.alertProject}>{alert.projectName}</Text>
              <Text style={styles.alertReason}>{alert.reason}</Text>
              <View style={styles.alertAction}>
                <Text style={styles.alertActionLabel}>Recommended Action:</Text>
                <Text style={styles.alertActionText}>{alert.action}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Money Snapshot</Text>
          <View style={styles.moneyGrid}>
            <View style={styles.moneyCard}>
              <Text style={styles.moneyLabel}>Invoices Due This Week</Text>
              <Text style={styles.moneyValue}>$48,200</Text>
              <View style={styles.moneyTrend}>
                <TrendingUp color={Colors.light.success} size={16} />
                <Text style={styles.moneyTrendText}>+12% vs last week</Text>
              </View>
            </View>

            <View style={styles.moneyCard}>
              <Text style={styles.moneyLabel}>Forecasted Collections (30d)</Text>
              <Text style={styles.moneyValue}>$125,000</Text>
              <View style={styles.moneyTrend}>
                <TrendingDown color={Colors.light.error} size={16} />
                <Text style={styles.moneyTrendText}>-3% vs forecast</Text>
              </View>
            </View>

            <View style={styles.moneyCard}>
              <Text style={styles.moneyLabel}>Total Overdue Payments</Text>
              <Text style={[styles.moneyValue, { color: Colors.light.error }]}>$12,400</Text>
              <Text style={styles.moneySubtext}>3 invoices overdue</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/contract-editor" as any)}
          >
            <FileText color="#FFF" size={20} />
            <Text style={styles.quickActionText}>New Contract</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: Colors.light.success }]}
            onPress={() => router.push("/owner-dashboard" as any)}
          >
            <TrendingUp color="#FFF" size={20} />
            <Text style={styles.quickActionText}>View Forecasts</Text>
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
  headerRight: {
    flexDirection: "row",
    gap: 12,
    marginRight: 16,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  overviewCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  overviewTitle: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  contractCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  contractInfo: {
    flex: 1,
  },
  contractHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  contractId: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  contractProject: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  contractClient: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  contractMeta: {
    flexDirection: "row",
    gap: 12,
  },
  contractMetaText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  contractActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  contractAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  resendButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resendButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  alertCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  alertType: {
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "uppercase",
  },
  alertProject: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  alertReason: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 12,
  },
  alertAction: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
  },
  alertActionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  alertActionText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  moneyGrid: {
    marginTop: 12,
    gap: 12,
  },
  moneyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  moneyLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  moneyValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  moneyTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moneyTrendText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  moneySubtext: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
