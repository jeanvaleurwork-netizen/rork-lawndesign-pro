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
  Linking,
  Modal,
} from "react-native";
import { Stack, router } from "expo-router";
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
  Upload,
  Bell,
  Calendar,
  TrendingUp,
  FileCheck,
  Phone,
  MapPin,
  X,
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
  nextMilestone?: string;
  crewName?: string;
  estimatedCompletion?: string;
}

interface CustomerContract {
  id: string;
  title: string;
  status: "pending" | "signed" | "active";
  amount: number;
  signedDate?: string;
  warrantyYears?: number;
  expiresAt?: string;
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
  paidAmount?: number;
}

interface PaymentMilestone {
  id: string;
  label: string;
  dueAmount: number;
  duePercent: number;
  status: "pending" | "paid" | "overdue";
  paidAt?: string;
}

interface ProjectDetails {
  id: string;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  estimatedEndDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMilestones: PaymentMilestone[];
  nextPaymentDue?: PaymentMilestone;
  photos: string[];
  documents: { id: string; name: string; url: string; uploadedAt: string }[];
  updates: { id: string; message: string; timestamp: string; type: string }[];
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
    nextMilestone: "Install irrigation system",
    crewName: "Green Team A",
    estimatedCompletion: "2025-12-20",
  },
];

const mockProjectDetails: ProjectDetails = {
  id: "J-001",
  name: "Front Yard Landscaping",
  status: "in-progress",
  progress: 65,
  startDate: "2025-12-01",
  estimatedEndDate: "2025-12-20",
  totalAmount: 5500,
  paidAmount: 1833,
  remainingAmount: 3667,
  paymentMilestones: [
    { id: "PM-1", label: "Deposit", dueAmount: 1833, duePercent: 33, status: "paid", paidAt: "2025-11-25" },
    { id: "PM-2", label: "Progress Payment", dueAmount: 1833, duePercent: 33, status: "pending" },
    { id: "PM-3", label: "Final Payment", dueAmount: 1834, duePercent: 34, status: "pending" },
  ],
  nextPaymentDue: { id: "PM-2", label: "Progress Payment", dueAmount: 1833, duePercent: 33, status: "pending" },
  photos: [
    "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400",
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400",
  ],
  documents: [
    { id: "DOC-1", name: "Project Contract.pdf", url: "/", uploadedAt: "2025-11-20" },
    { id: "DOC-2", name: "Material Selections.pdf", url: "/", uploadedAt: "2025-12-01" },
  ],
  updates: [
    { id: "U-1", message: "Irrigation lines installed. Starting landscape bed prep tomorrow.", timestamp: "2025-12-08", type: "progress" },
    { id: "U-2", message: "Materials delivered on site.", timestamp: "2025-12-05", type: "materials" },
    { id: "U-3", message: "Site preparation completed.", timestamp: "2025-12-01", type: "milestone" },
  ],
};

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
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);

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

  const getJobStatusLabel = (status: CustomerJob["status"]) => {
    switch (status) {
      case "scheduled":
        return "Awaiting Scheduling";
      case "in-progress":
        return "Work Underway";
      case "completed":
        return "Finalized";
      default:
        return status;
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

  const handleViewProjectDetails = (jobId: string) => {
    setSelectedProject(mockProjectDetails);
    setShowProjectModal(true);
  };

  const handleCallContractor = () => {
    Linking.openURL('tel:+15551234567');
  };

  const handleEmailContractor = () => {
    Linking.openURL('mailto:info@contractor.com');
  };

  const handlePayNow = (invoiceId: string) => {
    console.log('Opening payment for invoice:', invoiceId);
  };

  const handleUploadDocuments = () => {
    router.push('/customer-dropbox');
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
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.customerName}>John Smith</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color={Colors.light.text} size={22} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarContainer}>
            <User color={Colors.light.primary} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.primaryCTA}>
        <View style={styles.ctaContent}>
          <View style={styles.ctaTextSection}>
            <Text style={styles.ctaTitle}>What Should I Do Right Now?</Text>
            <Text style={styles.ctaSubtitle}>View latest progress photos from your crew</Text>
          </View>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => handleViewProjectDetails('J-001')}
          >
            <Text style={styles.ctaButtonText}>View Progress</Text>
            <ChevronRight color="#FFF" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.billingHighlight}>
        <View style={styles.billingHeader}>
          <View style={styles.billingIcon}>
            <DollarSign color={Colors.light.primary} size={24} />
          </View>
          <View style={styles.billingInfo}>
            <Text style={styles.billingLabel}>Balance Due</Text>
            <Text style={styles.billingAmount}>$2,700</Text>
            <Text style={styles.billingNext}>Next Milestone: Final Touch-Ups • Expected: Jan 5, 2026</Text>
          </View>
        </View>
        <View style={styles.billingActions}>
          <TouchableOpacity style={styles.billingActionBtn} onPress={() => handlePayNow('INV-001')}>
            <Text style={styles.billingActionBtnText}>Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.billingActionBtnOutline}>
            <Text style={styles.billingActionBtnOutlineText}>View Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${Colors.light.primary}15` }]}>
            <Home color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <FileText color="#F59E0B" size={20} />
          </View>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${Colors.light.success}15` }]}>
            <DollarSign color={Colors.light.success} size={20} />
          </View>
          <Text style={styles.statValue}>$2.7K</Text>
          <Text style={styles.statLabel}>Due Soon</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
            <TrendingUp color="#6366F1" size={20} />
          </View>
          <Text style={styles.statValue}>65%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

      <View style={styles.communicationSection}>
        <Text style={styles.sectionTitle}>Need to Reach Us?</Text>
        <Text style={styles.sectionSubtitle}>We&apos;re here to help. Reach out anytime.</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleCallContractor}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.light.primary}15` }]}>
              <Phone color={Colors.light.primary} size={22} />
            </View>
            <Text style={styles.quickActionText}>Call Crew</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleEmailContractor}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E0E7FF' }]}>
              <MessageCircle color="#6366F1" size={22} />
            </View>
            <Text style={styles.quickActionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleUploadDocuments}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Upload color="#F59E0B" size={22} />
            </View>
            <Text style={styles.quickActionText}>Upload Docs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.light.success}15` }]}>
              <Calendar color={Colors.light.success} size={22} />
            </View>
            <Text style={styles.quickActionText}>Reschedule</Text>
          </TouchableOpacity>
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
                <TouchableOpacity 
                  key={job.id} 
                  style={styles.jobCard}
                  onPress={() => handleViewProjectDetails(job.id)}
                >
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
                          {getJobStatusLabel(job.status)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.jobInfoRow}>
                      <MapPin color={Colors.light.muted} size={14} />
                      <Text style={styles.jobAddress}>{job.address}</Text>
                    </View>
                    
                    {job.crewName && (
                      <View style={styles.jobInfoRow}>
                        <User color={Colors.light.muted} size={14} />
                        <Text style={styles.jobMeta}>{job.crewName}</Text>
                      </View>
                    )}
                    
                    {job.estimatedCompletion && (
                      <View style={styles.jobInfoRow}>
                        <Calendar color={Colors.light.muted} size={14} />
                        <Text style={styles.jobMeta}>
                          Est. Completion: {new Date(job.estimatedCompletion).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    
                    {job.status === "in-progress" && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Your Project is Coming to Life</Text>
                          <Text style={styles.progressPercent}>{job.progress}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${job.progress}%` },
                            ]}
                          />
                        </View>
                        {job.nextMilestone && (
                          <View style={styles.nextMilestoneCard}>
                            <View style={styles.nextMilestoneIcon}>
                              <Clock color={Colors.light.primary} size={16} />
                            </View>
                            <View style={styles.nextMilestoneText}>
                              <Text style={styles.nextMilestoneLabel}>Next Step</Text>
                              <Text style={styles.nextMilestone}>{job.nextMilestone}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    )}

                    <View style={styles.jobActions}>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Camera color={Colors.light.primary} size={18} />
                        <Text style={styles.actionBtnText}>Photos</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn}>
                        <MessageCircle color={Colors.light.primary} size={18} />
                        <Text style={styles.actionBtnText}>Message</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn}>
                        <FileCheck color={Colors.light.primary} size={18} />
                        <Text style={styles.actionBtnText}>Details</Text>
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
                  <TouchableOpacity 
                    style={styles.payBtn}
                    onPress={() => handlePayNow(invoice.id)}
                  >
                    <Text style={styles.payBtnText}>Pay Now</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showProjectModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProjectModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Project Details</Text>
            <TouchableOpacity onPress={() => setShowProjectModal(false)}>
              <X color={Colors.light.text} size={24} />
            </TouchableOpacity>
          </View>
          
          {selectedProject && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.projectOverview}>
                <Text style={styles.projectName}>{selectedProject.name}</Text>
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Overall Progress</Text>
                    <Text style={styles.progressPercentLarge}>{selectedProject.progress}%</Text>
                  </View>
                  <View style={styles.progressBarLarge}>
                    <View style={[styles.progressFill, { width: `${selectedProject.progress}%` }]} />
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Payment Schedule</Text>
                {selectedProject.paymentMilestones.map((milestone) => (
                  <View key={milestone.id} style={styles.milestoneCard}>
                    <View style={styles.milestoneLeft}>
                      <View style={[
                        styles.milestoneIcon,
                        { backgroundColor: milestone.status === 'paid' ? `${Colors.light.success}15` : '#F3F4F6' }
                      ]}>
                        {milestone.status === 'paid' ? (
                          <CheckCircle color={Colors.light.success} size={20} />
                        ) : (
                          <Clock color={Colors.light.muted} size={20} />
                        )}
                      </View>
                      <View>
                        <Text style={styles.milestoneLabel}>{milestone.label}</Text>
                        <Text style={styles.milestoneAmount}>${milestone.dueAmount.toLocaleString()}</Text>
                        {milestone.paidAt && (
                          <Text style={styles.milestonePaidDate}>
                            Paid: {new Date(milestone.paidAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text style={[
                      styles.milestoneStatus,
                      { color: milestone.status === 'paid' ? Colors.light.success : '#F59E0B' }
                    ]}>
                      {milestone.status}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Project Updates</Text>
                {selectedProject.updates.map((update) => (
                  <View key={update.id} style={styles.updateCard}>
                    <View style={styles.updateDot} />
                    <View style={styles.updateContent}>
                      <Text style={styles.updateMessage}>{update.message}</Text>
                      <Text style={styles.updateTimestamp}>
                        {new Date(update.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Project Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {selectedProject.photos.map((photo, idx) => (
                    <Image key={idx} source={{ uri: photo }} style={styles.projectPhoto} />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Documents</Text>
                {selectedProject.documents.map((doc) => (
                  <TouchableOpacity key={doc.id} style={styles.docCard}>
                    <FileText color={Colors.light.primary} size={24} />
                    <View style={styles.docInfo}>
                      <Text style={styles.docName}>{doc.name}</Text>
                      <Text style={styles.docDate}>
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <ChevronRight color={Colors.light.muted} size={20} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
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
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    position: "relative" as const,
  },
  notificationBadge: {
    position: "absolute" as const,
    top: -4,
    right: -4,
    backgroundColor: Colors.light.error,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  welcomeText: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 2,
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
    marginTop: 20,
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    textAlign: "center" as const,
    fontWeight: "600" as const,
  },
  primaryCTA: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 20,
  },
  ctaContent: {
    gap: 16,
  },
  ctaTextSection: {
    gap: 6,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  ctaSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  billingHighlight: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  billingHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  billingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  billingInfo: {
    flex: 1,
  },
  billingLabel: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  billingAmount: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  billingNext: {
    fontSize: 13,
    color: Colors.light.muted,
    lineHeight: 18,
  },
  billingActions: {
    flexDirection: "row",
    gap: 12,
  },
  billingActionBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    alignItems: "center",
  },
  billingActionBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  billingActionBtnOutline: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  billingActionBtnOutlineText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  communicationSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 12,
    lineHeight: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
  jobInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  jobAddress: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  jobMeta: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  progressSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  nextMilestoneCard: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    backgroundColor: `${Colors.light.primary}08`,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  nextMilestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  nextMilestoneText: {
    flex: 1,
  },
  nextMilestoneLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    textTransform: "uppercase" as const,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  nextMilestone: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
    lineHeight: 20,
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
  },
  projectOverview: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  projectName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  progressPercentLarge: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  progressBarLarge: {
    height: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 6,
    overflow: "hidden",
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  milestoneCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  milestoneLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  milestoneAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  milestonePaidDate: {
    fontSize: 12,
    color: Colors.light.muted,
    marginTop: 2,
  },
  milestoneStatus: {
    fontSize: 13,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  updateCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  updateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
  },
  updateContent: {
    flex: 1,
  },
  updateMessage: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  updateTimestamp: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  photoScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  projectPhoto: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: Colors.light.background,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  docDate: {
    fontSize: 13,
    color: Colors.light.muted,
  },
});
