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
  Sun,
  Wind,
  Droplets,
  Star,
  Share2,
  ThumbsUp,
  Activity,
  Download,
  Eye,
  Shield,
  Info,
  Award,
  ClipboardCheck,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: "parking" | "pets" | "access" | "preparation" | "safety";
  required: boolean;
  completed: boolean;
  completedAt?: string;
}

interface CustomerJob {
  id: string;
  title: string;
  status: "scheduled" | "in-progress" | "completed";
  scheduledDate: string;
  scheduledTime?: string;
  progress: number;
  photos: string[];
  address: string;
  nextMilestone?: string;
  crewName?: string;
  estimatedCompletion?: string;
  preArrivalChecklist?: ChecklistItem[];
  checklistCompletedAt?: string;
}

interface CustomerContract {
  id: string;
  contractNumber: string;
  clientName: string;
  title: string;
  type: "project_contract" | "master_service" | "work_order" | "change_order" | "completion";
  status: "pending" | "signed" | "active" | "expired";
  amount: number;
  signedDate?: string;
  sentDate?: string;
  warrantyYears?: number;
  expiresAt?: string;
  scopeOfWork?: string;
  paymentSchedule?: { label: string; amount: number; status: string }[];
  projectName?: string;
  projectAddress?: string;
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
    scheduledTime: "9:00 AM",
    progress: 65,
    photos: ["https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400"],
    address: "123 Main St",
    nextMilestone: "Install irrigation system",
    crewName: "Green Team A",
    estimatedCompletion: "2025-12-20",
    preArrivalChecklist: [],
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
    contractNumber: "C-001",
    clientName: "John Smith",
    title: "Project Contract",
    type: "project_contract",
    status: "signed",
    amount: 5500,
    signedDate: "2025-11-30",
    sentDate: "2025-11-28",
    warrantyYears: 2,
    scopeOfWork: "Complete front yard landscaping including irrigation installation, sod, decorative rock, and perennial plantings.",
    projectName: "Front Yard Landscaping",
    projectAddress: "123 Main St",
    paymentSchedule: [
      { label: "Deposit", amount: 1833, status: "paid" },
      { label: "Progress Payment", amount: 1833, status: "pending" },
      { label: "Final Payment", amount: 1834, status: "pending" },
    ],
  },
  {
    id: "C-002",
    contractNumber: "C-002",
    clientName: "John Smith",
    title: "Master Service Agreement",
    type: "master_service",
    status: "signed",
    amount: 0,
    signedDate: "2025-11-15",
    sentDate: "2025-11-10",
    scopeOfWork: "General terms and conditions for all landscaping services provided by LawnDesign Pro.",
  },
  {
    id: "C-003",
    contractNumber: "C-003",
    clientName: "John Smith",
    title: "Backyard Patio Proposal",
    type: "project_contract",
    status: "pending",
    amount: 8500,
    sentDate: "2025-12-05",
    scopeOfWork: "Design and installation of 400 sq ft paver patio with retaining wall and outdoor lighting.",
    projectName: "Backyard Patio Installation",
    projectAddress: "123 Main St",
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
  const [selectedContract, setSelectedContract] = useState<CustomerContract | null>(null);
  const [showContractModal, setShowContractModal] = useState<boolean>(false);
  const [beforeAfterSlider] = useState<number>(50);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

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

  const handleViewContract = (contract: CustomerContract) => {
    setSelectedContract(contract);
    setShowContractModal(true);
  };

  const handleDownloadContract = (contractId: string) => {
    console.log('Downloading contract:', contractId);
  };

  const handleSignContract = (contractId: string) => {
    console.log('Opening signature screen for contract:', contractId);
  };

  const getContractTypeLabel = (type: CustomerContract["type"]) => {
    switch (type) {
      case "project_contract":
        return "Project Contract";
      case "master_service":
        return "Master Service";
      case "work_order":
        return "Work Order";
      case "change_order":
        return "Change Order";
      case "completion":
        return "Completion Certificate";
      default:
        return type;
    }
  };

  const getContractStatusColor = (status: CustomerContract["status"]) => {
    switch (status) {
      case "signed":
        return Colors.light.success;
      case "active":
        return Colors.light.primary;
      case "pending":
        return "#F59E0B";
      case "expired":
        return Colors.light.muted;
      default:
        return Colors.light.muted;
    }
  };

  const getContractStatusLabel = (status: CustomerContract["status"]) => {
    switch (status) {
      case "signed":
        return "Signed";
      case "active":
        return "Active";
      case "pending":
        return "Awaiting Signature";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const getContractTypeIcon = (type: CustomerContract["type"]) => {
    switch (type) {
      case "project_contract":
        return FileCheck;
      case "master_service":
        return Shield;
      case "work_order":
        return ClipboardCheck;
      case "change_order":
        return AlertCircle;
      case "completion":
        return Award;
      default:
        return FileText;
    }
  };

  const getContractTypeColor = (type: CustomerContract["type"]) => {
    switch (type) {
      case "project_contract":
        return Colors.light.primary;
      case "master_service":
        return "#8B5CF6";
      case "work_order":
        return "#F59E0B";
      case "change_order":
        return "#EF4444";
      case "completion":
        return Colors.light.success;
      default:
        return Colors.light.muted;
    }
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
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowNotifications(!showNotifications)}
          >
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

      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {showNotifications && (
        <View style={styles.notificationsDropdown}>
          <View style={styles.notificationItem}>
            <View style={[styles.notificationIcon, { backgroundColor: `${Colors.light.success}15` }]}>
              <CheckCircle color={Colors.light.success} size={20} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Milestone Complete</Text>
              <Text style={styles.notificationDesc}>Irrigation system installed successfully</Text>
              <Text style={styles.notificationTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.notificationItem}>
            <View style={[styles.notificationIcon, { backgroundColor: `${Colors.light.primary}15` }]}>
              <Camera color={Colors.light.primary} size={20} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>New Photos Available</Text>
              <Text style={styles.notificationDesc}>3 progress photos were uploaded</Text>
              <Text style={styles.notificationTime}>5 hours ago</Text>
            </View>
          </View>
        </View>
      )}

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

      <View style={styles.weatherWidget}>
        <View style={styles.weatherHeader}>
          <View style={styles.weatherLeft}>
            <Sun color={"#F59E0B"} size={32} />
            <View>
              <Text style={styles.weatherTemp}>72°F</Text>
              <Text style={styles.weatherCondition}>Sunny</Text>
            </View>
          </View>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherDetailItem}>
              <Wind color={Colors.light.muted} size={16} />
              <Text style={styles.weatherDetailText}>8 mph</Text>
            </View>
            <View style={styles.weatherDetailItem}>
              <Droplets color={Colors.light.muted} size={16} />
              <Text style={styles.weatherDetailText}>45%</Text>
            </View>
          </View>
        </View>
        <View style={styles.weatherAlert}>
          <CheckCircle color={Colors.light.success} size={16} />
          <Text style={styles.weatherAlertText}>Perfect conditions for landscaping work today</Text>
        </View>
      </View>

      <View style={styles.liveUpdatesSection}>
        <View style={styles.liveUpdatesHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>Live Updates</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.updatesScroll}
        >
          <View style={styles.updateCard}>
            <View style={styles.updateCardHeader}>
              <View style={[styles.updateIcon, { backgroundColor: `${Colors.light.success}15` }]}>
                <Activity color={Colors.light.success} size={20} />
              </View>
              <Text style={styles.updateTime}>12 min ago</Text>
            </View>
            <Text style={styles.updateTitle}>Crew Arrived</Text>
            <Text style={styles.updateDescription}>Green Team A checked in at your property</Text>
          </View>
          <View style={styles.updateCard}>
            <View style={styles.updateCardHeader}>
              <View style={[styles.updateIcon, { backgroundColor: `${Colors.light.primary}15` }]}>
                <Camera color={Colors.light.primary} size={20} />
              </View>
              <Text style={styles.updateTime}>1 hour ago</Text>
            </View>
            <Text style={styles.updateTitle}>New Photos</Text>
            <Text style={styles.updateDescription}>3 progress photos uploaded</Text>
          </View>
          <View style={styles.updateCard}>
            <View style={styles.updateCardHeader}>
              <View style={[styles.updateIcon, { backgroundColor: '#FEF3C7' }]}>
                <CheckCircle color="#F59E0B" size={20} />
              </View>
              <Text style={styles.updateTime}>3 hours ago</Text>
            </View>
            <Text style={styles.updateTitle}>Milestone Complete</Text>
            <Text style={styles.updateDescription}>Irrigation system installed</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.projectSnapshotCard}>
        <View style={styles.snapshotHeader}>
          <View>
            <Text style={styles.snapshotTitle}>Your Active Project</Text>
            <Text style={styles.snapshotSubtitle}>Front Yard Landscaping</Text>
          </View>
          <TouchableOpacity 
            style={styles.snapshotViewBtn}
            onPress={() => handleViewProjectDetails('J-001')}
          >
            <Text style={styles.snapshotViewBtnText}>View Details</Text>
            <ChevronRight color={Colors.light.primary} size={16} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.snapshotProgress}>
          <View style={styles.snapshotProgressInfo}>
            <Text style={styles.snapshotProgressLabel}>Overall Progress</Text>
            <Text style={styles.snapshotProgressPercent}>65%</Text>
          </View>
          <View style={styles.snapshotProgressBar}>
            <View style={[styles.snapshotProgressFill, { width: '65%' }]} />
          </View>
            <Text style={styles.snapshotProgressDesc}>On track for completion by Dec 20</Text>
        </View>

        <View style={styles.snapshotStats}>
          <View style={styles.snapshotStat}>
            <Calendar color={Colors.light.muted} size={18} />
            <View>
              <Text style={styles.snapshotStatLabel}>Days Remaining</Text>
              <Text style={styles.snapshotStatValue}>13 days</Text>
            </View>
          </View>
          <View style={styles.snapshotStatDivider} />
          <View style={styles.snapshotStat}>
            <User color={Colors.light.muted} size={18} />
            <View>
              <Text style={styles.snapshotStatLabel}>Crew</Text>
              <Text style={styles.snapshotStatValue}>Green Team A</Text>
            </View>
          </View>
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
        <View style={styles.communicationButtons}>
          <TouchableOpacity 
            style={styles.communicationPrimaryBtn}
            onPress={handleCallContractor}
          >
            <Phone color="#FFF" size={20} />
            <Text style={styles.communicationPrimaryBtnText}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.communicationSecondaryBtn}
            onPress={handleEmailContractor}
          >
            <MessageCircle color={Colors.light.primary} size={20} />
            <Text style={styles.communicationSecondaryBtnText}>Message</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickActionsGrid}>
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
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push({
              pathname: '/pre-arrival-checklist',
              params: { 
                jobId: 'J-001',
                scheduledDate: '2025-12-10',
                scheduledTime: '9:00 AM',
              },
            })}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E0E7FF' }]}>
              <ClipboardCheck color="#6366F1" size={22} />
            </View>
            <Text style={styles.quickActionText}>Checklist</Text>
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
        {activeTab === "jobs" && (
          <View style={styles.contentContainer}>
            <View style={styles.referralCard}>
              <View style={styles.referralContent}>
                <View style={styles.referralLeft}>
                  <View style={styles.referralIcon}>
                    <Star color="#F59E0B" size={24} />
                  </View>
                  <View>
                    <Text style={styles.referralTitle}>Love your results?</Text>
                    <Text style={styles.referralSubtitle}>Get $100 off your next project</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.referralButton}>
                  <Share2 color="#FFF" size={18} />
                  <Text style={styles.referralButtonText}>Refer</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.preArrivalChecklistCard}
              onPress={() => router.push({
                pathname: '/pre-arrival-checklist',
                params: { 
                  jobId: 'J-001',
                  scheduledDate: '2025-12-10',
                  scheduledTime: '9:00 AM',
                },
              })}
            >
              <View style={styles.checklistCardHeader}>
                <View style={styles.checklistIconBadge}>
                  <ClipboardCheck color={Colors.light.primary} size={24} />
                </View>
                <View style={styles.checklistCardHeaderText}>
                  <Text style={styles.checklistCardTitle}>Pre-Arrival Checklist</Text>
                  <Text style={styles.checklistCardSubtitle}>Help us prepare for your project</Text>
                </View>
              </View>
              <View style={styles.checklistProgress}>
                <View style={styles.checklistProgressBar}>
                  <View style={[styles.checklistProgressFill, { width: '0%' }]} />
                </View>
                <Text style={styles.checklistProgressText}>0 of 8 items completed</Text>
              </View>
              <View style={styles.checklistCTA}>
                <Text style={styles.checklistCTAText}>Complete Now</Text>
                <ChevronRight color={Colors.light.primary} size={20} />
              </View>
            </TouchableOpacity>

            <View style={styles.crewTrackingCard}>
              <View style={styles.crewTrackingHeader}>
                <Text style={styles.crewTrackingTitle}>Crew En Route</Text>
                <View style={styles.etaBadge}>
                  <Clock color={Colors.light.primary} size={14} />
                  <Text style={styles.etaText}>ETA: 15 min</Text>
                </View>
              </View>
              <View style={styles.crewMemberInfo}>
                <View style={styles.crewAvatar}>
                  <User color={Colors.light.primary} size={24} />
                </View>
                <View style={styles.crewDetails}>
                  <Text style={styles.crewName}>Mike Johnson</Text>
                  <Text style={styles.crewRole}>Crew Leader - Green Team A</Text>
                  <View style={styles.crewRating}>
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} color="#F59E0B" fill="#F59E0B" size={14} />
                    ))}
                    <Text style={styles.crewRatingText}>(4.9)</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.crewCallButton}>
                  <Phone color={Colors.light.primary} size={20} />
                </TouchableOpacity>
              </View>
              <View style={styles.progressTracker}>
                <View style={styles.progressDot} />
                <View style={styles.progressLine} />
                <View style={[styles.progressDot, { backgroundColor: Colors.light.border }]} />
                <Text style={styles.progressTrackerText}>Arriving at 123 Main St</Text>
              </View>
            </View>
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
            <View style={styles.contractsHeader}>
              <View>
                <Text style={styles.contractsHeaderTitle}>Your Contracts</Text>
                <Text style={styles.contractsHeaderSubtitle}>
                  {mockContracts.length} total contract{mockContracts.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {mockContracts.map((contract) => {
              const TypeIcon = getContractTypeIcon(contract.type);
              const typeColor = getContractTypeColor(contract.type);
              return (
              <TouchableOpacity 
                key={contract.id} 
                style={styles.contractCard}
                onPress={() => handleViewContract(contract)}
              >
                <View style={styles.contractCardHeader}>
                  <View style={styles.contractCardHeaderLeft}>
                    <View style={[
                      styles.contractTypeIcon,
                      { backgroundColor: `${typeColor}15` }
                    ]}>
                      <TypeIcon color={typeColor} size={24} />
                    </View>
                    <View style={styles.contractHeaderInfo}>
                      <Text style={styles.contractNumber}>{contract.contractNumber}</Text>
                      <Text style={styles.contractClientName}>{contract.clientName}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.contractStatusBadge,
                    { backgroundColor: `${getContractStatusColor(contract.status)}15` }
                  ]}>
                    <Text style={[
                      styles.contractStatusText,
                      { color: getContractStatusColor(contract.status) }
                    ]}>
                      {getContractStatusLabel(contract.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.contractTypeBadgeLarge}>
                  <View style={[
                    styles.contractTypeIndicator,
                    { backgroundColor: typeColor }
                  ]} />
                  <Text style={[
                    styles.contractTypeText,
                    { color: typeColor }
                  ]}>
                    {getContractTypeLabel(contract.type)}
                  </Text>
                </View>

                <View style={styles.contractCardBody}>
                  <View style={styles.contractInfoSection}>
                    
                    {contract.projectName && (
                      <View style={styles.contractInfoRow}>
                        <Home color={Colors.light.muted} size={16} />
                        <Text style={styles.contractInfoLabel}>Project:</Text>
                        <Text style={styles.contractInfoValue}>{contract.projectName}</Text>
                      </View>
                    )}
                    
                    {contract.amount > 0 && (
                      <View style={styles.contractInfoRow}>
                        <DollarSign color={Colors.light.muted} size={16} />
                        <Text style={styles.contractInfoLabel}>Total Amount:</Text>
                        <Text style={[styles.contractInfoValue, styles.contractAmount]}>
                          ${contract.amount.toLocaleString()}
                        </Text>
                      </View>
                    )}
                    
                    {contract.signedDate ? (
                      <View style={styles.contractInfoRow}>
                        <CheckCircle color={Colors.light.success} size={16} />
                        <Text style={styles.contractInfoLabel}>Signed:</Text>
                        <Text style={styles.contractInfoValue}>
                          {new Date(contract.signedDate).toLocaleDateString()}
                        </Text>
                      </View>
                    ) : contract.sentDate && (
                      <View style={styles.contractInfoRow}>
                        <Clock color={"#F59E0B"} size={16} />
                        <Text style={styles.contractInfoLabel}>Sent:</Text>
                        <Text style={styles.contractInfoValue}>
                          {new Date(contract.sentDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    {contract.warrantyYears && contract.warrantyYears > 0 && (
                      <View style={styles.contractInfoRow}>
                        <Shield color={Colors.light.primary} size={16} />
                        <Text style={styles.contractInfoLabel}>Warranty:</Text>
                        <Text style={styles.contractInfoValue}>
                          {contract.warrantyYears} year{contract.warrantyYears !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>

                  {contract.scopeOfWork && (
                    <View style={styles.scopeSection}>
                      <Text style={styles.scopeLabel}>Scope of Work</Text>
                      <Text style={styles.scopeText} numberOfLines={2}>
                        {contract.scopeOfWork}
                      </Text>
                    </View>
                  )}

                  {contract.paymentSchedule && contract.paymentSchedule.length > 0 && (
                    <View style={styles.paymentSchedulePreview}>
                      <Text style={styles.paymentScheduleLabel}>Payment Schedule</Text>
                      <View style={styles.paymentMilestones}>
                        {contract.paymentSchedule.map((payment, idx) => (
                          <View key={idx} style={styles.paymentMilestoneItem}>
                            <View style={[
                              styles.paymentMilestoneDot,
                              { backgroundColor: payment.status === 'paid' ? Colors.light.success : Colors.light.border }
                            ]} />
                            <Text style={styles.paymentMilestoneText}>
                              {payment.label}: ${payment.amount.toLocaleString()}
                            </Text>
                            <Text style={[
                              styles.paymentMilestoneStatus,
                              { color: payment.status === 'paid' ? Colors.light.success : Colors.light.muted }
                            ]}>
                              {payment.status}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.contractCardActions}>
                  <TouchableOpacity 
                    style={styles.contractActionBtn}
                    onPress={() => handleViewContract(contract)}
                  >
                    <Eye color={Colors.light.primary} size={18} />
                    <Text style={styles.contractActionBtnText}>View</Text>
                  </TouchableOpacity>
                  
                  {contract.status === 'signed' && (
                    <TouchableOpacity 
                      style={styles.contractActionBtn}
                      onPress={() => handleDownloadContract(contract.id)}
                    >
                      <Download color={Colors.light.primary} size={18} />
                      <Text style={styles.contractActionBtnText}>Download</Text>
                    </TouchableOpacity>
                  )}
                  
                  {contract.status === 'pending' && (
                    <TouchableOpacity 
                      style={[styles.contractActionBtn, styles.contractActionBtnPrimary]}
                      onPress={() => handleSignContract(contract.id)}
                    >
                      <FileCheck color="#FFF" size={18} />
                      <Text style={[styles.contractActionBtnText, { color: '#FFF' }]}>Sign Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
            })}
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
                    <TouchableOpacity key={idx} style={styles.photoCard}>
                      <Image source={{ uri: photo }} style={styles.projectPhoto} />
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoLabel}>{idx === 0 ? 'Before' : 'After'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Compare Progress</Text>
                <View style={styles.beforeAfterContainer}>
                  <View style={styles.imageSliderContainer}>
                    <Image 
                      source={{ uri: selectedProject.photos[0] }} 
                      style={styles.beforeAfterImage}
                    />
                    <View style={[styles.afterImageContainer, { width: `${beforeAfterSlider}%` }]}>
                      <Image 
                        source={{ uri: selectedProject.photos[1] || selectedProject.photos[0] }} 
                        style={styles.beforeAfterImage}
                      />
                    </View>
                    <View style={[styles.sliderHandle, { left: `${beforeAfterSlider}%` }]}>
                      <View style={styles.sliderLine} />
                    </View>
                  </View>
                  <View style={styles.beforeAfterLabels}>
                    <Text style={styles.beforeAfterLabel}>Before</Text>
                    <Text style={styles.beforeAfterLabel}>After</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.reviewPromptCard}>
                  <View style={styles.reviewPromptHeader}>
                    <ThumbsUp color={Colors.light.success} size={28} />
                    <View style={styles.reviewPromptText}>
                      <Text style={styles.reviewPromptTitle}>How are we doing?</Text>
                      <Text style={styles.reviewPromptSubtitle}>Your feedback helps us improve</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.reviewButton}>
                    <Text style={styles.reviewButtonText}>Leave a Review</Text>
                  </TouchableOpacity>
                </View>
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

      <Modal
        visible={showContractModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowContractModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contract Details</Text>
            <TouchableOpacity onPress={() => setShowContractModal(false)}>
              <X color={Colors.light.text} size={24} />
            </TouchableOpacity>
          </View>
          
          {selectedContract && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.contractDetailHeader}>
                <View style={styles.contractDetailHeaderRow}>
                  <View>
                    <Text style={styles.contractDetailNumber}>{selectedContract.contractNumber}</Text>
                    <Text style={styles.contractDetailTitle}>{selectedContract.title}</Text>
                  </View>
                  <View style={[
                    styles.contractStatusBadgeLarge,
                    { backgroundColor: `${getContractStatusColor(selectedContract.status)}15` }
                  ]}>
                    <CheckCircle color={getContractStatusColor(selectedContract.status)} size={18} />
                    <Text style={[
                      styles.contractStatusTextLarge,
                      { color: getContractStatusColor(selectedContract.status) }
                    ]}>
                      {getContractStatusLabel(selectedContract.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Contract Information</Text>
                <View style={styles.contractDetailInfo}>
                  <View style={styles.contractDetailRow}>
                    <Text style={styles.contractDetailLabel}>Client Name</Text>
                    <Text style={styles.contractDetailValue}>{selectedContract.clientName}</Text>
                  </View>
                  <View style={styles.contractDetailRow}>
                    <Text style={styles.contractDetailLabel}>Contract Type</Text>
                    <Text style={styles.contractDetailValue}>{getContractTypeLabel(selectedContract.type)}</Text>
                  </View>
                  {selectedContract.projectName && (
                    <View style={styles.contractDetailRow}>
                      <Text style={styles.contractDetailLabel}>Project Name</Text>
                      <Text style={styles.contractDetailValue}>{selectedContract.projectName}</Text>
                    </View>
                  )}
                  {selectedContract.projectAddress && (
                    <View style={styles.contractDetailRow}>
                      <Text style={styles.contractDetailLabel}>Project Location</Text>
                      <Text style={styles.contractDetailValue}>{selectedContract.projectAddress}</Text>
                    </View>
                  )}
                  {selectedContract.amount > 0 && (
                    <View style={styles.contractDetailRow}>
                      <Text style={styles.contractDetailLabel}>Total Amount</Text>
                      <Text style={[styles.contractDetailValue, styles.contractDetailAmount]}>
                        ${selectedContract.amount.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {selectedContract.signedDate && (
                    <View style={styles.contractDetailRow}>
                      <Text style={styles.contractDetailLabel}>Date Signed</Text>
                      <Text style={styles.contractDetailValue}>
                        {new Date(selectedContract.signedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                  )}
                  {selectedContract.warrantyYears && selectedContract.warrantyYears > 0 && (
                    <View style={styles.contractDetailRow}>
                      <Text style={styles.contractDetailLabel}>Warranty Period</Text>
                      <Text style={styles.contractDetailValue}>
                        {selectedContract.warrantyYears} year{selectedContract.warrantyYears !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {selectedContract.scopeOfWork && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Scope of Work</Text>
                  <View style={styles.scopeDetailCard}>
                    <Text style={styles.scopeDetailText}>{selectedContract.scopeOfWork}</Text>
                  </View>
                </View>
              )}

              {selectedContract.paymentSchedule && selectedContract.paymentSchedule.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Payment Schedule</Text>
                  {selectedContract.paymentSchedule.map((payment, idx) => (
                    <View key={idx} style={styles.paymentScheduleCard}>
                      <View style={styles.paymentScheduleLeft}>
                        <View style={[
                          styles.paymentScheduleIcon,
                          { backgroundColor: payment.status === 'paid' ? `${Colors.light.success}15` : '#F3F4F6' }
                        ]}>
                          {payment.status === 'paid' ? (
                            <CheckCircle color={Colors.light.success} size={20} />
                          ) : (
                            <Clock color={Colors.light.muted} size={20} />
                          )}
                        </View>
                        <View>
                          <Text style={styles.paymentScheduleName}>{payment.label}</Text>
                          <Text style={styles.paymentScheduleAmount}>${payment.amount.toLocaleString()}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.paymentScheduleStatusBadge,
                        { backgroundColor: payment.status === 'paid' ? `${Colors.light.success}15` : '#FEF3C7' }
                      ]}>
                        <Text style={[
                          styles.paymentScheduleStatusText,
                          { color: payment.status === 'paid' ? Colors.light.success : '#F59E0B' }
                        ]}>
                          {payment.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {selectedContract.status === 'signed' && (
                <View style={styles.modalSection}>
                  <View style={styles.signatureCard}>
                    <View style={styles.signatureHeader}>
                      <Award color={Colors.light.success} size={28} />
                      <View style={styles.signatureHeaderText}>
                        <Text style={styles.signatureTitle}>Digitally Signed & Secured</Text>
                        <Text style={styles.signatureDescription}>
                          This contract was electronically signed on{' '}
                          {selectedContract.signedDate && new Date(selectedContract.signedDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.signatureFooter}>
                      <Info color={Colors.light.muted} size={16} />
                      <Text style={styles.signatureFooterText}>
                        E-signatures are legally binding and equivalent to handwritten signatures
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Actions</Text>
                <View style={styles.contractActionsGrid}>
                  <TouchableOpacity 
                    style={styles.contractActionCard}
                    onPress={() => handleDownloadContract(selectedContract.id)}
                  >
                    <View style={styles.contractActionCardIcon}>
                      <Download color={Colors.light.primary} size={24} />
                    </View>
                    <Text style={styles.contractActionCardText}>Download PDF</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.contractActionCard}
                    onPress={handleEmailContractor}
                  >
                    <View style={styles.contractActionCardIcon}>
                      <MessageCircle color={Colors.light.primary} size={24} />
                    </View>
                    <Text style={styles.contractActionCardText}>Contact Us</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.contractActionCard}>
                    <View style={styles.contractActionCardIcon}>
                      <Share2 color={Colors.light.primary} size={24} />
                    </View>
                    <Text style={styles.contractActionCardText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedContract.status === 'pending' && (
                <View style={styles.modalSection}>
                  <TouchableOpacity 
                    style={styles.signNowButton}
                    onPress={() => handleSignContract(selectedContract.id)}
                  >
                    <FileCheck color="#FFF" size={24} />
                    <Text style={styles.signNowButtonText}>Sign Contract Now</Text>
                  </TouchableOpacity>
                  <Text style={styles.signNowHelpText}>
                    By signing, you agree to all terms and conditions outlined in this contract
                  </Text>
                </View>
              )}
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
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 20,
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
    marginTop: 0,
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
  weatherWidget: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  weatherCondition: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  weatherDetails: {
    flexDirection: "row",
    gap: 16,
  },
  weatherDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weatherDetailText: {
    fontSize: 13,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  weatherAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${Colors.light.success}08`,
    padding: 10,
    borderRadius: 8,
  },
  weatherAlertText: {
    fontSize: 13,
    color: Colors.light.success,
    fontWeight: "600" as const,
    flex: 1,
  },
  liveUpdatesSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  liveUpdatesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.error,
  },
  liveIndicatorText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  updatesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  updateCard: {
    width: 200,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  updateCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  updateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  updateTime: {
    fontSize: 12,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  updateDescription: {
    fontSize: 13,
    color: Colors.light.muted,
    lineHeight: 18,
  },
  referralCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  referralContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  referralLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  referralIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#92400E",
    marginBottom: 2,
  },
  referralSubtitle: {
    fontSize: 13,
    color: "#B45309",
  },
  referralButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  referralButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  crewTrackingCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  crewTrackingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  crewTrackingTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  crewMemberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  crewAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  crewDetails: {
    flex: 1,
  },
  crewName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  crewRole: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  crewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  crewRatingText: {
    fontSize: 13,
    color: Colors.light.muted,
    marginLeft: 6,
    fontWeight: "600" as const,
  },
  crewCallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTracker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.light.border,
  },
  progressTrackerText: {
    fontSize: 13,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  beforeAfterContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.light.background,
  },
  imageSliderContainer: {
    position: "relative" as const,
    height: 300,
  },
  beforeAfterImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover" as const,
  },
  afterImageContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    height: "100%",
    overflow: "hidden",
  },
  sliderHandle: {
    position: "absolute" as const,
    top: 0,
    height: "100%",
    width: 4,
    backgroundColor: "#FFF",
    marginLeft: -2,
  },
  sliderLine: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  beforeAfterLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.light.card,
  },
  beforeAfterLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  photoCard: {
    position: "relative" as const,
  },
  photoOverlay: {
    position: "absolute" as const,
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  reviewPromptCard: {
    backgroundColor: `${Colors.light.success}08`,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: `${Colors.light.success}30`,
  },
  reviewPromptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  reviewPromptText: {
    flex: 1,
  },
  reviewPromptTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  reviewPromptSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  reviewButton: {
    backgroundColor: Colors.light.success,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  contractsHeader: {
    marginBottom: 20,
  },
  contractsHeaderTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  contractsHeaderSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  contractCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  contractCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  contractCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  contractTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  contractHeaderInfo: {
    flex: 1,
  },
  contractNumber: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  contractClientName: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  contractStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  contractStatusText: {
    fontSize: 11,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  contractTypeBadgeLarge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
  contractTypeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  contractTypeText: {
    fontSize: 16,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  contractCardBody: {
    padding: 16,
  },
  contractInfoSection: {
    gap: 10,
  },
  contractInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contractInfoLabel: {
    fontSize: 14,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  contractInfoValue: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  contractAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  scopeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  scopeLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  scopeText: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  paymentSchedulePreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  paymentScheduleLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  paymentMilestones: {
    gap: 8,
  },
  paymentMilestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentMilestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentMilestoneText: {
    fontSize: 13,
    color: Colors.light.text,
    flex: 1,
    fontWeight: "600" as const,
  },
  paymentMilestoneStatus: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  contractCardActions: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  contractActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  contractActionBtnPrimary: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  contractActionBtnText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  warrantyCard: {
    flexDirection: "row",
    backgroundColor: `${Colors.light.success}08`,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: `${Colors.light.success}30`,
    marginTop: 8,
  },
  warrantyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.light.success}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  warrantyInfo: {
    flex: 1,
  },
  warrantyTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  warrantyDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  contractDetailHeader: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  contractDetailHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  contractDetailNumber: {
    fontSize: 14,
    color: Colors.light.muted,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  contractDetailTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  contractStatusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  contractStatusTextLarge: {
    fontSize: 14,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  contractDetailInfo: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  contractDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contractDetailLabel: {
    fontSize: 14,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  contractDetailValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
    textAlign: "right" as const,
    flex: 1,
  },
  contractDetailAmount: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  scopeDetailCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
  },
  scopeDetailText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
  },
  paymentScheduleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentScheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  paymentScheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentScheduleName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentScheduleAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  paymentScheduleStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentScheduleStatusText: {
    fontSize: 13,
    fontWeight: "700" as const,
    textTransform: "capitalize" as const,
  },
  signatureCard: {
    backgroundColor: `${Colors.light.success}08`,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${Colors.light.success}30`,
  },
  signatureHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.light.success}20`,
  },
  signatureHeaderText: {
    flex: 1,
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  signatureDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  signatureFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  signatureFooterText: {
    fontSize: 13,
    color: Colors.light.muted,
    flex: 1,
    lineHeight: 18,
  },
  contractActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  contractActionCard: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  contractActionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  contractActionCardText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center" as const,
  },
  signNowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  signNowButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  signNowHelpText: {
    fontSize: 13,
    color: Colors.light.muted,
    textAlign: "center" as const,
    lineHeight: 18,
  },
  notificationsDropdown: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  notificationItem: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  notificationDesc: {
    fontSize: 13,
    color: Colors.light.muted,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  projectSnapshotCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  snapshotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  snapshotTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.muted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  snapshotSubtitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  snapshotViewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
  },
  snapshotViewBtnText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  snapshotProgress: {
    marginBottom: 16,
  },
  snapshotProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  snapshotProgressLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  snapshotProgressPercent: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.light.success,
  },
  snapshotProgressBar: {
    height: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  snapshotProgressFill: {
    height: "100%",
    backgroundColor: Colors.light.success,
    borderRadius: 5,
  },
  snapshotProgressDesc: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  snapshotStats: {
    flexDirection: "row",
    gap: 16,
  },
  snapshotStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  snapshotStatDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
  },
  snapshotStatLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 2,
  },
  snapshotStatValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  communicationButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  communicationPrimaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
  },
  communicationPrimaryBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  communicationSecondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  communicationSecondaryBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  preArrivalChecklistCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  checklistCardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 16,
    gap: 12,
  },
  checklistIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  checklistCardHeaderText: {
    flex: 1,
  },
  checklistCardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  checklistCardSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  checklistProgress: {
    marginBottom: 16,
  },
  checklistProgressBar: {
    height: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 4,
    overflow: "hidden" as const,
    marginBottom: 8,
  },
  checklistProgressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  checklistProgressText: {
    fontSize: 13,
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  checklistCTA: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: `${Colors.light.primary}08`,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  checklistCTAText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
});
