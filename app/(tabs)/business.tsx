import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import {
  FileText,
  BarChart3,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  FileSignature,
  Calculator,
  Briefcase,
  PieChart,
  Settings,
  Users,
  Layers,
  Activity,
  Zap,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function BusinessScreen() {
  const { isCrew } = useAuth();
  const { jobs, estimates } = useData();

  if (isCrew) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Shield color={Colors.light.muted} size={64} />
          <Text style={styles.restrictedTitle}>Admin Access Only</Text>
          <Text style={styles.restrictedText}>
            This section is only available to administrators.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeProjects = jobs.filter((j) => j.status !== "completed").length;
  const totalContractValue = estimates
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.total, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Business Intelligence</Text>
            <Text style={styles.subtitle}>Smart Contractor Management</Text>
          </View>
        </View>

        <View style={styles.topKPIs}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: "#EBF5FF" }]}>
              <Briefcase color={Colors.light.primary} size={20} />
            </View>
            <Text style={styles.kpiValue}>{activeProjects}</Text>
            <Text style={styles.kpiLabel}>Active Projects</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: "#D1FAE5" }]}>
              <DollarSign color={Colors.light.success} size={20} />
            </View>
            <Text style={styles.kpiValue}>
              ${(totalContractValue / 1000).toFixed(0)}k
            </Text>
            <Text style={styles.kpiLabel}>Contract Value</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Command Center</Text>
          <Text style={styles.sectionSubtitle}>
            Mission control for your business
          </Text>

          <TouchableOpacity
            style={styles.primaryCard}
            onPress={() => router.push("/owner-dashboard" as any)}
          >
            <View style={styles.primaryCardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: "#EBF5FF" }]}>
                <Activity color={Colors.light.primary} size={28} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.primaryCardTitle}>Owner Dashboard</Text>
                <Text style={styles.primaryCardDescription}>
                  Complete business overview, forecasting, and insights
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryCard}
            onPress={() => router.push("/admin-console-home" as any)}
          >
            <View style={styles.primaryCardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: "#FEF3C7" }]}>
                <Zap color={Colors.light.warning} size={28} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.primaryCardTitle}>Admin Console</Text>
                <Text style={styles.primaryCardDescription}>
                  Today&apos;s overview, contracts, risk alerts, money snapshot
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contracts & Agreements</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/contracts" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#EBF5FF" }]}
              >
                <FileText color={Colors.light.primary} size={24} />
              </View>
              <Text style={styles.featureTitle}>Contract Management</Text>
              <Text style={styles.featureDescription}>
                Create, manage, and track contracts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/contract-editor" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#F3E8FF" }]}
              >
                <FileSignature color="#9333EA" size={24} />
              </View>
              <Text style={styles.featureTitle}>Contract Editor</Text>
              <Text style={styles.featureDescription}>
                Smart templates & autofill
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/customer-portal" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#D1FAE5" }]}
              >
                <Users color={Colors.light.success} size={24} />
              </View>
              <Text style={styles.featureTitle}>Customer Portal</Text>
              <Text style={styles.featureDescription}>
                Client signatures & approvals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/customer-dropbox" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#FEE2E2" }]}
              >
                <Layers color="#EF4444" size={24} />
              </View>
              <Text style={styles.featureTitle}>Job Dropbox</Text>
              <Text style={styles.featureDescription}>
                Secure document sharing
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Intelligence</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/pagos-ai-dashboard" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#F3E8FF" }]}
              >
                <DollarSign color="#9333EA" size={24} />
              </View>
              <Text style={styles.featureTitle}>Pagos AI</Text>
              <Text style={styles.featureDescription}>
                Smart payment tracking
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/analytics" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#EBF5FF" }]}
              >
                <BarChart3 color={Colors.light.primary} size={24} />
              </View>
              <Text style={styles.featureTitle}>Analytics</Text>
              <Text style={styles.featureDescription}>
                Performance reports & trends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/(tabs)/invoices" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <FileText color={Colors.light.warning} size={24} />
              </View>
              <Text style={styles.featureTitle}>Invoices</Text>
              <Text style={styles.featureDescription}>
                Create & manage invoices
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/(tabs)/receipts" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#DBEAFE" }]}
              >
                <CheckCircle color="#3B82F6" size={24} />
              </View>
              <Text style={styles.featureTitle}>Receipt Scanner</Text>
              <Text style={styles.featureDescription}>
                AI-powered receipt tracking
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Management</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/change-orders" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#FEE2E2" }]}
              >
                <FileText color="#EF4444" size={24} />
              </View>
              <Text style={styles.featureTitle}>Change Orders</Text>
              <Text style={styles.featureDescription}>
                Track project modifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/warranties" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#D1FAE5" }]}
              >
                <Shield color={Colors.light.success} size={24} />
              </View>
              <Text style={styles.featureTitle}>Warranties</Text>
              <Text style={styles.featureDescription}>
                Smart warranty management
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/material-approvals" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <CheckCircle color={Colors.light.warning} size={24} />
              </View>
              <Text style={styles.featureTitle}>Material Approvals</Text>
              <Text style={styles.featureDescription}>
                Client material confirmations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/pre-arrival-checklist" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#EBF5FF" }]}
              >
                <CheckCircle color={Colors.light.primary} size={24} />
              </View>
              <Text style={styles.featureTitle}>Pre-Arrival Checklist</Text>
              <Text style={styles.featureDescription}>
                Prepare clients for work
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Automation</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/ai-dispatch" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#F3E8FF" }]}
              >
                <Zap color="#9333EA" size={24} />
              </View>
              <Text style={styles.featureTitle}>AI Dispatch</Text>
              <Text style={styles.featureDescription}>
                Smart crew assignment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/ai-estimate-generator" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#DBEAFE" }]}
              >
                <Calculator color="#3B82F6" size={24} />
              </View>
              <Text style={styles.featureTitle}>AI Estimate Generator</Text>
              <Text style={styles.featureDescription}>
                Auto-generate estimates
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/ai-cost-analyzer" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#D1FAE5" }]}
              >
                <PieChart color={Colors.light.success} size={24} />
              </View>
              <Text style={styles.featureTitle}>AI Cost Analyzer</Text>
              <Text style={styles.featureDescription}>
                Profit & cost breakdown
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/customer-intake" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Users color={Colors.light.warning} size={24} />
              </View>
              <Text style={styles.featureTitle}>AI Customer Intake</Text>
              <Text style={styles.featureDescription}>
                Automated lead capture
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk & Forecasting</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/weather-delays" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#DBEAFE" }]}
              >
                <AlertTriangle color="#3B82F6" size={24} />
              </View>
              <Text style={styles.featureTitle}>Weather Delays</Text>
              <Text style={styles.featureDescription}>
                Track weather impacts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/permits" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#FEE2E2" }]}
              >
                <FileText color="#EF4444" size={24} />
              </View>
              <Text style={styles.featureTitle}>Permits</Text>
              <Text style={styles.featureDescription}>
                Permit tracking & alerts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/safety-incidents" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Shield color={Colors.light.warning} size={24} />
              </View>
              <Text style={styles.featureTitle}>Safety Incidents</Text>
              <Text style={styles.featureDescription}>
                Track safety & compliance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/punch-list" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#D1FAE5" }]}
              >
                <CheckCircle color={Colors.light.success} size={24} />
              </View>
              <Text style={styles.featureTitle}>Punch List</Text>
              <Text style={styles.featureDescription}>
                Final completion tracking
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operations</Text>
          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/material-orders" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#DBEAFE" }]}
              >
                <Layers color="#3B82F6" size={24} />
              </View>
              <Text style={styles.featureTitle}>Material Orders</Text>
              <Text style={styles.featureDescription}>
                Order tracking & pricing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/subcontractors" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#F3E8FF" }]}
              >
                <Users color="#9333EA" size={24} />
              </View>
              <Text style={styles.featureTitle}>Subcontractors</Text>
              <Text style={styles.featureDescription}>
                Manage subcontractor network
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/equipment-maintenance" as any)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Settings color={Colors.light.warning} size={24} />
              </View>
              <Text style={styles.featureTitle}>Equipment</Text>
              <Text style={styles.featureDescription}>
                Maintenance tracking
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/time-cards")}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: "#EBF5FF" }]}
              >
                <Clock color={Colors.light.primary} size={24} />
              </View>
              <Text style={styles.featureTitle}>Time Cards</Text>
              <Text style={styles.featureDescription}>
                Labor time tracking
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
    paddingTop: 12,
    paddingBottom: 24,
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
  topKPIs: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 16,
  },
  primaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  primaryCardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  primaryCardDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: "48%",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.light.muted,
    lineHeight: 16,
  },
  restrictedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 24,
  },
});
