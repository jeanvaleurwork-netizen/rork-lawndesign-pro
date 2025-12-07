import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import {
  FileText,
  Camera,
  MessageCircle,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Home,
  User,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface CustomerJob {
  id: string;
  title: string;
  status: "scheduled" | "in-progress" | "completed";
  scheduledDate: string;
  progress: number;
  photos: string[];
  address: string;
}

interface CustomerContract {
  id: string;
  title: string;
  status: "pending" | "signed" | "active";
  amount: number;
  signedDate?: string;
}

interface CustomerEstimate {
  id: string;
  title: string;
  status: "pending" | "approved" | "declined";
  amount: number;
  createdDate: string;
}

interface CustomerInvoice {
  id: string;
  jobTitle: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
}

const mockJobs: CustomerJob[] = [
  {
    id: "J-001",
    title: "Front Yard Landscaping",
    status: "in-progress",
    scheduledDate: "2025-12-10",
    progress: 65,
    photos: ["https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400"],
    address: "123 Main St",
  },
];

const mockContracts: CustomerContract[] = [
  {
    id: "C-001",
    title: "Master Service Agreement",
    status: "signed",
    amount: 5500,
    signedDate: "2025-11-20",
  },
];

const mockEstimates: CustomerEstimate[] = [
  {
    id: "E-001",
    title: "Backyard Patio Installation",
    status: "pending",
    amount: 8500,
    createdDate: "2025-12-05",
  },
];

const mockInvoices: CustomerInvoice[] = [
  {
    id: "INV-001",
    jobTitle: "Front Yard Landscaping",
    amount: 2750,
    dueDate: "2025-12-20",
    status: "pending",
  },
];

export default function CustomerPortalScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"jobs" | "contracts" | "estimates" | "invoices">("jobs");

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getJobStatusColor = (status: CustomerJob["status"]) => {
    switch (status) {
      case "scheduled":
        return Colors.light.primary;
      case "in-progress":
        return "#F59E0B";
      case "completed":
        return Colors.light.success;
      default:
        return Colors.light.muted;
    }
  };

  const getJobStatusIcon = (status: CustomerJob["status"]) => {
    switch (status) {
      case "scheduled":
        return Clock;
      case "in-progress":
        return AlertCircle;
      case "completed":
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getInvoiceStatusColor = (status: CustomerInvoice["status"]) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "paid":
        return Colors.light.success;
      case "overdue":
        return Colors.light.error;
      default:
        return Colors.light.muted;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "My Portal",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.customerName}>John Smith</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <User color={Colors.light.primary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Home color={Colors.light.primary} size={20} />
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <FileText color="#F59E0B" size={20} />
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign color={Colors.light.success} size={20} />
          <Text style={styles.statValue}>$2.7K</Text>
          <Text style={styles.statLabel}>Due</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "jobs" && styles.activeTab]}
          onPress={() => setActiveTab("jobs")}
        >
          <Text style={[styles.tabText, activeTab === "jobs" && styles.activeTabText]}>
            Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "contracts" && styles.activeTab]}
          onPress={() => setActiveTab("contracts")}
        >
          <Text style={[styles.tabText, activeTab === "contracts" && styles.activeTabText]}>
            Contracts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "estimates" && styles.activeTab]}
          onPress={() => setActiveTab("estimates")}
        >
          <Text style={[styles.tabText, activeTab === "estimates" && styles.activeTabText]}>
            Estimates
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "invoices" && styles.activeTab]}
          onPress={() => setActiveTab("invoices")}
        >
          <Text style={[styles.tabText, activeTab === "invoices" && styles.activeTabText]}>
            Invoices
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "jobs" && (
          <View style={styles.contentContainer}>
            {mockJobs.map((job) => {
              const StatusIcon = getJobStatusIcon(job.status);
              return (
                <TouchableOpacity key={job.id} style={styles.jobCard}>
                  {job.photos[0] && (
                    <Image source={{ uri: job.photos[0] }} style={styles.jobImage} />
                  )}
                  <View style={styles.jobContent}>
                    <View style={styles.jobHeader}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getJobStatusColor(job.status)}15` },
                        ]}
                      >
                        <StatusIcon
                          color={getJobStatusColor(job.status)}
                          size={14}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getJobStatusColor(job.status) },
                          ]}
                        >
                          {job.status.replace("-", " ")}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.jobAddress}>{job.address}</Text>
                    <Text style={styles.jobDate}>
                      Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}
                    </Text>
                    
                    {job.status === "in-progress" && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${job.progress}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>{job.progress}%</Text>
                      </View>
                    )}

                    <View style={styles.jobActions}>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Camera color={Colors.light.primary} size={18} />
                        <Text style={styles.actionBtnText}>View Photos</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn}>
                        <MessageCircle color={Colors.light.primary} size={18} />
                        <Text style={styles.actionBtnText}>Message</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeTab === "contracts" && (
          <View style={styles.contentContainer}>
            {mockContracts.map((contract) => (
              <TouchableOpacity key={contract.id} style={styles.listCard}>
                <View style={styles.listCardLeft}>
                  <FileText color={Colors.light.primary} size={24} />
                  <View style={styles.listCardInfo}>
                    <Text style={styles.listCardTitle}>{contract.title}</Text>
                    <Text style={styles.listCardSubtitle}>
                      ${contract.amount.toLocaleString()}
                    </Text>
                    {contract.signedDate && (
                      <Text style={styles.listCardDate}>
                        Signed: {new Date(contract.signedDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
                <ChevronRight color={Colors.light.muted} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === "estimates" && (
          <View style={styles.contentContainer}>
            {mockEstimates.map((estimate) => (
              <TouchableOpacity key={estimate.id} style={styles.listCard}>
                <View style={styles.listCardLeft}>
                  <FileText color="#F59E0B" size={24} />
                  <View style={styles.listCardInfo}>
                    <Text style={styles.listCardTitle}>{estimate.title}</Text>
                    <Text style={styles.listCardSubtitle}>
                      ${estimate.amount.toLocaleString()}
                    </Text>
                    <Text style={styles.listCardDate}>
                      {new Date(estimate.createdDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.estimateActions}>
                  {estimate.status === "pending" && (
                    <>
                      <TouchableOpacity style={styles.approveBtn}>
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.declineBtn}>
                        <Text style={styles.declineBtnText}>Decline</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === "invoices" && (
          <View style={styles.contentContainer}>
            {mockInvoices.map((invoice) => (
              <TouchableOpacity key={invoice.id} style={styles.listCard}>
                <View style={styles.listCardLeft}>
                  <DollarSign
                    color={getInvoiceStatusColor(invoice.status)}
                    size={24}
                  />
                  <View style={styles.listCardInfo}>
                    <Text style={styles.listCardTitle}>{invoice.jobTitle}</Text>
                    <Text style={styles.listCardSubtitle}>
                      ${invoice.amount.toLocaleString()}
                    </Text>
                    <Text style={styles.listCardDate}>
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                {invoice.status === "pending" && (
                  <TouchableOpacity style={styles.payBtn}>
                    <Text style={styles.payBtnText}>Pay Now</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  activeTabText: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  jobImage: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.light.background,
  },
  jobContent: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  jobAddress: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  jobDate: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  jobActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  listCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  listCardInfo: {
    flex: 1,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  listCardSubtitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  listCardDate: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  estimateActions: {
    flexDirection: "column",
    gap: 8,
  },
  approveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.success,
    borderRadius: 8,
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  declineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  payBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  payBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
