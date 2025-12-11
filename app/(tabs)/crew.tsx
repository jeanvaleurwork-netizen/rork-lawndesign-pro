import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Alert,
  TextInput,
} from "react-native";
import { Stack, router } from "expo-router";
import { 
  Users, 
  MapPin, 
  ChevronRight, 
  Plus, 
  Clock,
  Star,
  Award,
  TrendingUp,
  Phone,
  Mail,
  CheckCircle,
  X,
  Wrench,
  Briefcase,
  User,
  Edit3,
  Filter,
  DollarSign,
  Calendar as CalendarIcon,
  ClipboardList,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";

const { width } = Dimensions.get("window");

interface CrewMember {
  id: string;
  name: string;
  title: string;
  role: "lead" | "worker" | "specialist";
  availability: "available" | "busy" | "off";
  phone?: string;
  email?: string;
  skills: string[];
  certifications: string[];
  performanceRating: number;
  jobsCompleted: number;
  avgRating: number;
  joinedDate: string;
  hourlyRate: number;
  hoursThisWeek: number;
}

interface Crew {
  id: string;
  name: string;
  members: CrewMember[];
  jobsToday: number;
  currentJob?: string;
  jobsCompletedThisWeek: number;
  totalJobsCompleted: number;
  avgCompletionTime: number;
  customerRating: number;
}

export default function CrewScreen() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"crews" | "individuals">("crews");
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showTimeTrackingModal, setShowTimeTrackingModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [assignmentType, setAssignmentType] = useState<"job" | "schedule">("job");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [showEditCrewModal, setShowEditCrewModal] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [customMemberName, setCustomMemberName] = useState("");

  const [crews, setCrews] = useState<Crew[]>([
    {
      id: "1",
      name: "Crew A",
      jobsToday: 3,
      currentJob: "Smith Residence - Lawn Installation",
      jobsCompletedThisWeek: 12,
      totalJobsCompleted: 245,
      avgCompletionTime: 4.2,
      customerRating: 4.8,
      members: [
        { 
          id: "1", 
          name: "Mike Johnson", 
          title: "Landscaping Foreman", 
          role: "lead", 
          availability: "busy",
          phone: "(512) 555-0123",
          email: "mike.j@contractoros.com",
          skills: ["Lawn Installation", "Equipment Operation", "Team Management"],
          certifications: ["Pesticide License", "First Aid"],
          performanceRating: 4.9,
          jobsCompleted: 156,
          avgRating: 4.8,
          joinedDate: "2022-03-15",
          hourlyRate: 35,
          hoursThisWeek: 42,
        },
        { 
          id: "2", 
          name: "John Davis", 
          title: "Installation Technician", 
          role: "worker", 
          availability: "busy",
          phone: "(512) 555-0124",
          email: "john.d@contractoros.com",
          skills: ["Sod Installation", "Grading", "Irrigation"],
          certifications: ["Irrigation Certification"],
          performanceRating: 4.6,
          jobsCompleted: 98,
          avgRating: 4.5,
          joinedDate: "2023-01-10",
          hourlyRate: 28,
          hoursThisWeek: 40,
        },
        { 
          id: "3", 
          name: "Tom Wilson", 
          title: "Groundskeeper", 
          role: "worker", 
          availability: "busy",
          phone: "(512) 555-0125",
          email: "tom.w@contractoros.com",
          skills: ["Lawn Maintenance", "Edging", "Trimming"],
          certifications: [],
          performanceRating: 4.4,
          jobsCompleted: 87,
          avgRating: 4.3,
          joinedDate: "2023-06-20",
          hourlyRate: 25,
          hoursThisWeek: 38,
        },
      ],
    },
    {
      id: "2",
      name: "Crew B",
      jobsToday: 2,
      currentJob: "Johnson Backyard - Garden Installation",
      jobsCompletedThisWeek: 8,
      totalJobsCompleted: 189,
      avgCompletionTime: 5.1,
      customerRating: 4.9,
      members: [
        { 
          id: "4", 
          name: "Sarah Martinez", 
          title: "Senior Landscaper", 
          role: "lead", 
          availability: "busy",
          phone: "(512) 555-0126",
          email: "sarah.m@contractoros.com",
          skills: ["Garden Design", "Planting", "Hardscape"],
          certifications: ["Landscape Designer", "Horticulture Degree"],
          performanceRating: 5.0,
          jobsCompleted: 134,
          avgRating: 4.9,
          joinedDate: "2021-09-01",
          hourlyRate: 38,
          hoursThisWeek: 44,
        },
        { 
          id: "5", 
          name: "Carlos Rodriguez", 
          title: "Garden Specialist", 
          role: "specialist", 
          availability: "busy",
          phone: "(512) 555-0127",
          email: "carlos.r@contractoros.com",
          skills: ["Plant Selection", "Irrigation Design", "Tree Care"],
          certifications: ["Arborist Certification"],
          performanceRating: 4.7,
          jobsCompleted: 112,
          avgRating: 4.7,
          joinedDate: "2022-05-12",
          hourlyRate: 32,
          hoursThisWeek: 41,
        },
      ],
    },
    {
      id: "3",
      name: "Crew C",
      jobsToday: 0,
      jobsCompletedThisWeek: 5,
      totalJobsCompleted: 156,
      avgCompletionTime: 3.8,
      customerRating: 4.6,
      members: [
        { 
          id: "6", 
          name: "David Lee", 
          title: "Crew Supervisor", 
          role: "lead", 
          availability: "available",
          phone: "(512) 555-0128",
          email: "david.l@contractoros.com",
          skills: ["Project Management", "Quality Control", "Safety"],
          certifications: ["OSHA 30", "Project Management"],
          performanceRating: 4.8,
          jobsCompleted: 201,
          avgRating: 4.7,
          joinedDate: "2020-11-03",
          hourlyRate: 36,
          hoursThisWeek: 40,
        },
        { 
          id: "7", 
          name: "James Brown", 
          title: "Maintenance Worker", 
          role: "worker", 
          availability: "available",
          phone: "(512) 555-0129",
          email: "james.b@contractoros.com",
          skills: ["Mowing", "Trimming", "Blowing"],
          certifications: [],
          performanceRating: 4.3,
          jobsCompleted: 145,
          avgRating: 4.2,
          joinedDate: "2023-02-14",
          hourlyRate: 24,
          hoursThisWeek: 40,
        },
        { 
          id: "8", 
          name: "Robert Taylor", 
          title: "Irrigation Specialist", 
          role: "specialist", 
          availability: "available",
          phone: "(512) 555-0130",
          email: "robert.t@contractoros.com",
          skills: ["Irrigation Repair", "System Design", "Smart Controllers"],
          certifications: ["Irrigation Association Certified"],
          performanceRating: 4.7,
          jobsCompleted: 89,
          avgRating: 4.6,
          joinedDate: "2023-03-20",
          hourlyRate: 30,
          hoursThisWeek: 36,
        },
      ],
    },
  ]);

  const allMembers = useMemo(() => {
    return crews.flatMap(crew => crew.members);
  }, [crews]);

  const getAvailabilityColor = (availability: CrewMember["availability"]) => {
    switch (availability) {
      case "available":
        return Colors.light.success;
      case "busy":
        return Colors.light.warning;
      case "off":
        return Colors.light.muted;
      default:
        return Colors.light.muted;
    }
  };

  const getAvailabilityBg = (availability: CrewMember["availability"]) => {
    switch (availability) {
      case "available":
        return "#D1FAE5";
      case "busy":
        return "#FEF3C7";
      case "off":
        return "#F3F4F6";
      default:
        return "#F3F4F6";
    }
  };

  const getRoleColor = (role: CrewMember["role"]) => {
    switch (role) {
      case "lead":
        return Colors.light.primary;
      case "specialist":
        return "#8B5CF6";
      case "worker":
        return "#10B981";
      default:
        return Colors.light.muted;
    }
  };

  const totalJobs = crews.reduce((sum, crew) => sum + crew.jobsToday, 0);
  const totalMembers = allMembers.length;
  const avgRating = allMembers.reduce((sum, m) => sum + m.avgRating, 0) / totalMembers;
  const totalHours = allMembers.reduce((sum, m) => sum + m.hoursThisWeek, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t("tabs.crew")}</Text>
              <Text style={styles.subtitle}>Manage crews and track performance</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Plus color="#FFF" size={18} />
            </TouchableOpacity>
          </View>



          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalJobs}</Text>
                <Text style={styles.statLabel}>Jobs Today</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalMembers}</Text>
                <Text style={styles.statLabel}>Team Members</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.ratingRow}>
                  <Star size={18} color="#FFF" fill="#FFF" />
                  <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>
            <View style={styles.hoursRow}>
              <Clock size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.hoursText}>{totalHours} hours logged this week</Text>
            </View>
          </LinearGradient>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setShowScheduleModal(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
                <CalendarIcon size={22} color={Colors.light.primary} />
              </View>
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setShowPayrollModal(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#FEE2E2" }]}>
                <DollarSign size={22} color="#EF4444" />
              </View>
              <Text style={styles.quickActionText}>Payroll</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setShowTimeTrackingModal(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#E0E7FF" }]}>
                <ClipboardList size={22} color="#6366F1" />
              </View>
              <Text style={styles.quickActionText}>Time Tracking</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push("/crew-management")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#DCFCE7" }]}>
                <Award size={22} color="#22C55E" />
              </View>
              <Text style={styles.quickActionText}>Training</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === "crews" && styles.toggleButtonActive]}
              onPress={() => setViewMode("crews")}
            >
              <Users size={18} color={viewMode === "crews" ? "#FFF" : Colors.light.muted} />
              <Text style={[styles.toggleText, viewMode === "crews" && styles.toggleTextActive]}>
                Crews
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === "individuals" && styles.toggleButtonActive]}
              onPress={() => setViewMode("individuals")}
            >
              <User size={18} color={viewMode === "individuals" ? "#FFF" : Colors.light.muted} />
              <Text style={[styles.toggleText, viewMode === "individuals" && styles.toggleTextActive]}>
                Individuals
              </Text>
            </TouchableOpacity>
          </View>

          {viewMode === "crews" ? (
            <View style={styles.section}>
              {crews.map((crew) => (
                <View key={crew.id} style={styles.crewCard}>
                  <View style={styles.crewHeader}>
                    <View style={styles.crewHeaderLeft}>
                      <View style={styles.crewIconContainer}>
                        <Users color={Colors.light.primary} size={24} />
                      </View>
                      <View style={styles.crewInfo}>
                        <Text style={styles.crewName}>{crew.name}</Text>
                        <Text style={styles.crewMembers}>{crew.members.length} members</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.editCrewButton}
                      onPress={() => {
                        setEditingCrew(crew);
                        setShowEditCrewModal(true);
                      }}
                    >
                      <Edit3 size={18} color={Colors.light.primary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.crewPerformance}>
                    <View style={styles.performanceItem}>
                      <View style={styles.performanceIconBg}>
                        <Star size={16} color={Colors.light.warning} fill={Colors.light.warning} />
                      </View>
                      <View>
                        <Text style={styles.performanceValue}>{crew.customerRating.toFixed(1)}</Text>
                        <Text style={styles.performanceLabel}>Rating</Text>
                      </View>
                    </View>
                    <View style={styles.performanceItem}>
                      <View style={styles.performanceIconBg}>
                        <CheckCircle size={16} color={Colors.light.success} />
                      </View>
                      <View>
                        <Text style={styles.performanceValue}>{crew.jobsCompletedThisWeek}</Text>
                        <Text style={styles.performanceLabel}>This Week</Text>
                      </View>
                    </View>
                    <View style={styles.performanceItem}>
                      <View style={styles.performanceIconBg}>
                        <Clock size={16} color={Colors.light.primary} />
                      </View>
                      <View>
                        <Text style={styles.performanceValue}>{crew.avgCompletionTime.toFixed(1)}h</Text>
                        <Text style={styles.performanceLabel}>Avg Time</Text>
                      </View>
                    </View>
                  </View>

                  {crew.currentJob && (
                    <View style={styles.currentJobCard}>
                      <View style={styles.currentJobHeader}>
                        <MapPin color={Colors.light.warning} size={16} />
                        <Text style={styles.currentJobLabel}>Current Job</Text>
                      </View>
                      <Text style={styles.currentJobText}>{crew.currentJob}</Text>
                    </View>
                  )}

                  <View style={styles.membersSection}>
                    <Text style={styles.membersTitle}>Team Members</Text>
                    {crew.members.map((member) => (
                      <TouchableOpacity 
                        key={member.id} 
                        style={styles.memberRow}
                        onPress={() => {
                          setSelectedMember(member);
                          setShowMemberModal(true);
                        }}
                      >
                        <View style={styles.memberInfo}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) }]}>
                              <Text style={styles.roleText}>
                                {member.role === "lead" ? "Lead" : member.role === "specialist" ? "Specialist" : "Worker"}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.memberTitle}>{member.title}</Text>
                          <View style={styles.memberStats}>
                            <Star size={12} color={Colors.light.warning} fill={Colors.light.warning} />
                            <Text style={styles.memberRating}>{member.avgRating.toFixed(1)}</Text>
                            <Text style={styles.memberJobs}>• {member.jobsCompleted} jobs</Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.availabilityBadge,
                            { backgroundColor: getAvailabilityBg(member.availability) },
                          ]}
                        >
                          <View
                            style={[
                              styles.availabilityDot,
                              { backgroundColor: getAvailabilityColor(member.availability) },
                            ]}
                          />
                          <Text
                            style={[
                              styles.availabilityText,
                              { color: getAvailabilityColor(member.availability) },
                            ]}
                          >
                            {member.availability === "available"
                              ? "Available"
                              : member.availability === "busy"
                                ? "On Job"
                                : "Off"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={styles.assignButton}
                    onPress={() => {
                      setSelectedCrew(crew);
                      setAssignmentType("job");
                      setShowAssignModal(true);
                    }}
                  >
                    <Briefcase size={18} color="#FFF" />
                    <Text style={styles.assignButtonText}>Assign Jobs</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Team Members ({allMembers.length})</Text>
                <TouchableOpacity style={styles.filterButton}>
                  <Filter size={18} color={Colors.light.muted} />
                </TouchableOpacity>
              </View>

              {allMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.individualCard}
                  onPress={() => {
                    setSelectedMember(member);
                    setShowMemberModal(true);
                  }}
                >
                  <View style={styles.individualHeader}>
                    <View style={styles.individualLeft}>
                      <View style={[styles.individualAvatar, { backgroundColor: getRoleColor(member.role) + "20" }]}>
                        <User size={24} color={getRoleColor(member.role)} />
                      </View>
                      <View style={styles.individualInfo}>
                        <Text style={styles.individualName}>{member.name}</Text>
                        <Text style={styles.individualTitle}>{member.title}</Text>
                        <View style={styles.individualStats}>
                          <Star size={12} color={Colors.light.warning} fill={Colors.light.warning} />
                          <Text style={styles.individualRating}>{member.avgRating.toFixed(1)}</Text>
                          <Text style={styles.individualJobs}>• {member.jobsCompleted} jobs</Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.availabilityBadge,
                        { backgroundColor: getAvailabilityBg(member.availability) },
                      ]}
                    >
                      <View
                        style={[
                          styles.availabilityDot,
                          { backgroundColor: getAvailabilityColor(member.availability) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.availabilityText,
                          { color: getAvailabilityColor(member.availability) },
                        ]}
                      >
                        {member.availability === "available"
                          ? "Available"
                          : member.availability === "busy"
                            ? "On Job"
                            : "Off"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.individualMetrics}>
                    <View style={styles.metricItem}>
                      <Clock size={14} color={Colors.light.muted} />
                      <Text style={styles.metricText}>{member.hoursThisWeek}h this week</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Award size={14} color={Colors.light.muted} />
                      <Text style={styles.metricText}>{member.certifications.length} certs</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <Modal
        visible={showMemberModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMemberModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Team Member Details</Text>
            <TouchableOpacity onPress={() => setShowMemberModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {selectedMember && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.memberDetailHeader}>
                <View style={[styles.memberDetailAvatar, { backgroundColor: getRoleColor(selectedMember.role) + "20" }]}>
                  <User size={48} color={getRoleColor(selectedMember.role)} />
                </View>
                <Text style={styles.memberDetailName}>{selectedMember.name}</Text>
                <Text style={styles.memberDetailTitle}>{selectedMember.title}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(selectedMember.role), marginTop: 8 }]}>
                  <Text style={styles.roleText}>
                    {selectedMember.role === "lead" ? "Lead" : selectedMember.role === "specialist" ? "Specialist" : "Worker"}
                  </Text>
                </View>
              </View>

              <View style={styles.contactSection}>
                <TouchableOpacity style={styles.contactButton}>
                  <Phone size={20} color={Colors.light.primary} />
                  <Text style={styles.contactText}>{selectedMember.phone || "No phone"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Mail size={20} color={Colors.light.primary} />
                  <Text style={styles.contactText}>{selectedMember.email || "No email"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.performanceSection}>
                <Text style={styles.detailSectionTitle}>Performance</Text>
                <View style={styles.performanceGrid}>
                  <View style={styles.performanceCard}>
                    <Star size={24} color={Colors.light.warning} fill={Colors.light.warning} />
                    <Text style={styles.performanceCardValue}>{selectedMember.avgRating.toFixed(1)}</Text>
                    <Text style={styles.performanceCardLabel}>Avg Rating</Text>
                  </View>
                  <View style={styles.performanceCard}>
                    <CheckCircle size={24} color={Colors.light.success} />
                    <Text style={styles.performanceCardValue}>{selectedMember.jobsCompleted}</Text>
                    <Text style={styles.performanceCardLabel}>Jobs Completed</Text>
                  </View>
                  <View style={styles.performanceCard}>
                    <Clock size={24} color={Colors.light.primary} />
                    <Text style={styles.performanceCardValue}>{selectedMember.hoursThisWeek}h</Text>
                    <Text style={styles.performanceCardLabel}>This Week</Text>
                  </View>
                  <View style={styles.performanceCard}>
                    <TrendingUp size={24} color="#8B5CF6" />
                    <Text style={styles.performanceCardValue}>${selectedMember.hourlyRate}/h</Text>
                    <Text style={styles.performanceCardLabel}>Hourly Rate</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Skills</Text>
                <View style={styles.tagsContainer}>
                  {selectedMember.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Wrench size={14} color={Colors.light.primary} />
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Certifications</Text>
                {selectedMember.certifications.length > 0 ? (
                  <View style={styles.tagsContainer}>
                    {selectedMember.certifications.map((cert, index) => (
                      <View key={index} style={styles.certTag}>
                        <Award size={14} color="#10B981" />
                        <Text style={styles.certText}>{cert}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No certifications</Text>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Employment Info</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Joined Date</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedMember.joinedDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Availability</Text>
                  <View
                    style={[
                      styles.availabilityBadge,
                      { backgroundColor: getAvailabilityBg(selectedMember.availability) },
                    ]}
                  >
                    <View
                      style={[
                        styles.availabilityDot,
                        { backgroundColor: getAvailabilityColor(selectedMember.availability) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.availabilityText,
                        { color: getAvailabilityColor(selectedMember.availability) },
                      ]}
                    >
                      {selectedMember.availability === "available"
                        ? "Available"
                        : selectedMember.availability === "busy"
                          ? "On Job"
                          : "Off"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    setEditingMember(selectedMember);
                    setShowMemberModal(false);
                    setTimeout(() => setShowEditModal(true), 300);
                  }}
                >
                  <Edit3 size={18} color={Colors.light.primary} />
                  <Text style={styles.editButtonText}>Edit Details</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.assignJobButton}
                  onPress={() => {
                    setShowMemberModal(false);
                    setTimeout(() => {
                      setAssignmentType("job");
                      setShowAssignModal(true);
                    }, 300);
                  }}
                >
                  <Briefcase size={18} color="#FFF" />
                  <Text style={styles.assignJobButtonText}>Assign to Job</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showAssignModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign {assignmentType === "job" ? "Job" : "Schedule"}</Text>
            <TouchableOpacity onPress={() => setShowAssignModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedCrew && (
              <View style={styles.assignHeader}>
                <Text style={styles.assignTitle}>{selectedCrew.name}</Text>
                <Text style={styles.assignSubtitle}>{selectedCrew.members.length} members</Text>
              </View>
            )}

            {selectedMember && (
              <View style={styles.assignHeader}>
                <Text style={styles.assignTitle}>{selectedMember.name}</Text>
                <Text style={styles.assignSubtitle}>{selectedMember.title}</Text>
              </View>
            )}

            <View style={styles.assignSection}>
              <Text style={styles.assignSectionTitle}>Available Jobs</Text>
              {[
                { id: "1", client: "Smith Residence", service: "Lawn Installation", date: "Today, 9:00 AM", address: "123 Main St" },
                { id: "2", client: "Johnson Property", service: "Garden Design", date: "Tomorrow, 10:00 AM", address: "456 Oak Ave" },
                { id: "3", client: "Williams Estate", service: "Maintenance", date: "Tomorrow, 2:00 PM", address: "789 Pine Rd" },
              ].map((job) => (
                <TouchableOpacity key={job.id} style={styles.jobCard}>
                  <View style={styles.jobCardLeft}>
                    <View style={styles.jobIconContainer}>
                      <Briefcase size={20} color={Colors.light.primary} />
                    </View>
                    <View style={styles.jobCardInfo}>
                      <Text style={styles.jobCardClient}>{job.client}</Text>
                      <Text style={styles.jobCardService}>{job.service}</Text>
                      <View style={styles.jobCardMeta}>
                        <Clock size={12} color={Colors.light.muted} />
                        <Text style={styles.jobCardDate}>{job.date}</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={20} color={Colors.light.muted} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.assignActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  setShowAssignModal(false);
                  Alert.alert("Success", "Assignment completed successfully!");
                }}
              >
                <Text style={styles.confirmButtonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showPayrollModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPayrollModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payroll Overview</Text>
            <TouchableOpacity onPress={() => setShowPayrollModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.payrollCard}
            >
              <Text style={styles.payrollLabel}>Total Payroll This Week</Text>
              <Text style={styles.payrollAmount}>$12,450</Text>
              <Text style={styles.payrollHours}>{totalHours} hours logged</Text>
            </LinearGradient>

            <View style={styles.payrollSection}>
              <Text style={styles.payrollSectionTitle}>Team Members</Text>
              {allMembers.map((member) => (
                <View key={member.id} style={styles.payrollMemberCard}>
                  <View style={styles.payrollMemberLeft}>
                    <View style={[styles.memberAvatarSmall, { backgroundColor: getRoleColor(member.role) + "20" }]}>
                      <User size={20} color={getRoleColor(member.role)} />
                    </View>
                    <View>
                      <Text style={styles.payrollMemberName}>{member.name}</Text>
                      <Text style={styles.payrollMemberHours}>{member.hoursThisWeek}h × ${member.hourlyRate}/h</Text>
                    </View>
                  </View>
                  <Text style={styles.payrollMemberAmount}>${(member.hoursThisWeek * member.hourlyRate).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.payrollActions}>
              <TouchableOpacity style={styles.payrollButton}>
                <Text style={styles.payrollButtonText}>Export Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.payrollButton, styles.payrollButtonPrimary]}>
                <Text style={styles.payrollButtonTextPrimary}>Process Payroll</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showTimeTrackingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimeTrackingModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Time Tracking</Text>
            <TouchableOpacity onPress={() => setShowTimeTrackingModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.timeTrackingHeader}>
              <Text style={styles.timeTrackingTitle}>Current Week</Text>
              <Text style={styles.timeTrackingSubtitle}>Mon, Dec 2 - Sun, Dec 8</Text>
            </View>

            <View style={styles.timeStatsGrid}>
              <View style={styles.timeStatCard}>
                <Clock size={24} color={Colors.light.primary} />
                <Text style={styles.timeStatValue}>{totalHours}h</Text>
                <Text style={styles.timeStatLabel}>Total Hours</Text>
              </View>
              <View style={styles.timeStatCard}>
                <Users size={24} color="#10B981" />
                <Text style={styles.timeStatValue}>{totalMembers}</Text>
                <Text style={styles.timeStatLabel}>Active Members</Text>
              </View>
            </View>

            <View style={styles.timeTrackingSection}>
              <Text style={styles.timeTrackingSectionTitle}>Team Activity</Text>
              {allMembers.map((member) => (
                <View key={member.id} style={styles.timeTrackingCard}>
                  <View style={styles.timeTrackingCardHeader}>
                    <View style={styles.timeTrackingCardLeft}>
                      <View style={[styles.memberAvatarSmall, { backgroundColor: getRoleColor(member.role) + "20" }]}>
                        <User size={20} color={getRoleColor(member.role)} />
                      </View>
                      <View>
                        <Text style={styles.timeTrackingName}>{member.name}</Text>
                        <View
                          style={[
                            styles.availabilityBadge,
                            { backgroundColor: getAvailabilityBg(member.availability) },
                          ]}
                        >
                          <View
                            style={[
                              styles.availabilityDot,
                              { backgroundColor: getAvailabilityColor(member.availability) },
                            ]}
                          />
                          <Text
                            style={[
                              styles.availabilityText,
                              { color: getAvailabilityColor(member.availability) },
                            ]}
                          >
                            {member.availability === "available"
                              ? "Available"
                              : member.availability === "busy"
                                ? "On Job"
                                : "Off"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.timeTrackingHours}>{member.hoursThisWeek}h</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${(member.hoursThisWeek / 50) * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Team Member</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {editingMember && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={editingMember.name}
                  onChangeText={(text) => setEditingMember({ ...editingMember, name: text })}
                  placeholder="Enter name"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Job Title</Text>
                <TextInput
                  style={styles.editInput}
                  value={editingMember.title}
                  onChangeText={(text) => setEditingMember({ ...editingMember, title: text })}
                  placeholder="Enter job title"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Phone</Text>
                <TextInput
                  style={styles.editInput}
                  value={editingMember.phone}
                  onChangeText={(text) => setEditingMember({ ...editingMember, phone: text })}
                  placeholder="Enter phone number"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Email</Text>
                <TextInput
                  style={styles.editInput}
                  value={editingMember.email}
                  onChangeText={(text) => setEditingMember({ ...editingMember, email: text })}
                  placeholder="Enter email"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Hourly Rate ($)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editingMember.hourlyRate.toString()}
                  onChangeText={(text) => setEditingMember({ ...editingMember, hourlyRate: parseFloat(text) || 0 })}
                  placeholder="Enter hourly rate"
                  placeholderTextColor={Colors.light.muted}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Role</Text>
                <View style={styles.roleSelector}>
                  {(['lead', 'specialist', 'worker'] as const).map((roleOption) => (
                    <TouchableOpacity
                      key={roleOption}
                      style={[
                        styles.roleOption,
                        editingMember.role === roleOption && styles.roleOptionActive,
                      ]}
                      onPress={() => setEditingMember({ ...editingMember, role: roleOption })}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          editingMember.role === roleOption && styles.roleOptionTextActive,
                        ]}
                      >
                        {roleOption === 'lead' ? 'Lead' : roleOption === 'specialist' ? 'Specialist' : 'Worker'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Availability</Text>
                <View style={styles.roleSelector}>
                  {(['available', 'busy', 'off'] as const).map((availOption) => (
                    <TouchableOpacity
                      key={availOption}
                      style={[
                        styles.roleOption,
                        editingMember.availability === availOption && styles.roleOptionActive,
                      ]}
                      onPress={() => setEditingMember({ ...editingMember, availability: availOption })}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          editingMember.availability === availOption && styles.roleOptionTextActive,
                        ]}
                      >
                        {availOption === 'available' ? 'Available' : availOption === 'busy' ? 'On Job' : 'Off'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={() => {
                    const updatedCrews = crews.map(crew => ({
                      ...crew,
                      members: crew.members.map(m => 
                        m.id === editingMember.id ? editingMember : m
                      ),
                    }));
                    setCrews(updatedCrews);
                    setShowEditModal(false);
                    Alert.alert("Success", "Team member updated successfully!");
                  }}
                >
                  <Text style={styles.confirmButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crew Schedule</Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.scheduleHeader}>
              <TouchableOpacity style={styles.scheduleNavButton}>
                <Text style={styles.scheduleNavText}>← Previous</Text>
              </TouchableOpacity>
              <View style={styles.scheduleDate}>
                <Text style={styles.scheduleDateText}>This Week</Text>
                <Text style={styles.scheduleDateSubtext}>Dec 2 - Dec 8</Text>
              </View>
              <TouchableOpacity style={styles.scheduleNavButton}>
                <Text style={styles.scheduleNavText}>Next →</Text>
              </TouchableOpacity>
            </View>

            {crews.map((crew) => (
              <View key={crew.id} style={styles.scheduleCrewCard}>
                <View style={styles.scheduleCrewHeader}>
                  <View style={styles.scheduleCrewLeft}>
                    <Users size={20} color={Colors.light.primary} />
                    <Text style={styles.scheduleCrewName}>{crew.name}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.addScheduleButton}
                    onPress={() => {
                      setSelectedCrew(crew);
                      setAssignmentType("schedule");
                      setShowScheduleModal(false);
                      setTimeout(() => setShowAssignModal(true), 300);
                    }}
                  >
                    <Plus size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.scheduleJobs}>
                  {crew.jobsToday > 0 ? (
                    Array.from({ length: crew.jobsToday }).map((_, index) => (
                      <View key={index} style={styles.scheduleJobCard}>
                        <View style={styles.scheduleJobTime}>
                          <Clock size={14} color={Colors.light.primary} />
                          <Text style={styles.scheduleJobTimeText}>{9 + index * 2}:00 AM</Text>
                        </View>
                        <View style={styles.scheduleJobInfo}>
                          <Text style={styles.scheduleJobTitle}>
                            {crew.currentJob || `Job ${index + 1}`}
                          </Text>
                          <View style={styles.scheduleJobMeta}>
                            <MapPin size={12} color={Colors.light.muted} />
                            <Text style={styles.scheduleJobAddress}>Property Address</Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noScheduleText}>No jobs scheduled</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEditCrewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditCrewModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Crew</Text>
            <TouchableOpacity onPress={() => setShowEditCrewModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {editingCrew && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Crew Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={editingCrew.name}
                  onChangeText={(text) => setEditingCrew({ ...editingCrew, name: text })}
                  placeholder="Enter crew name"
                  placeholderTextColor={Colors.light.muted}
                />
              </View>

              <View style={styles.editSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.editLabel}>Team Members ({editingCrew.members.length})</Text>
                  <TouchableOpacity
                    style={styles.addMemberButton}
                    onPress={() => {
                      setShowAddMemberModal(true);
                    }}
                  >
                    <Plus size={16} color={Colors.light.primary} />
                    <Text style={styles.addMemberButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {editingCrew.members.map((member, index) => (
                  <View key={member.id} style={styles.editMemberRow}>
                    <View style={styles.editMemberLeft}>
                      <View style={[styles.memberAvatarSmall, { backgroundColor: getRoleColor(member.role) + "20" }]}>
                        <User size={20} color={getRoleColor(member.role)} />
                      </View>
                      <View style={styles.editMemberInfo}>
                        <Text style={styles.editMemberName}>{member.name}</Text>
                        <Text style={styles.editMemberTitle}>{member.title}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeMemberButton}
                      onPress={() => {
                        const updatedMembers = editingCrew.members.filter((_, i) => i !== index);
                        setEditingCrew({ ...editingCrew, members: updatedMembers });
                      }}
                    >
                      <X size={18} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                {editingCrew.members.length === 0 && (
                  <Text style={styles.emptyText}>No members in this crew</Text>
                )}
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowEditCrewModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={() => {
                    const updatedCrews = crews.map(c => 
                      c.id === editingCrew.id ? editingCrew : c
                    );
                    setCrews(updatedCrews);
                    setShowEditCrewModal(false);
                    Alert.alert("Success", "Crew updated successfully!");
                  }}
                >
                  <Text style={styles.confirmButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showAddMemberModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddMemberModal(false);
          setMemberSearchQuery("");
          setCustomMemberName("");
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Member to Crew</Text>
            <TouchableOpacity onPress={() => {
              setShowAddMemberModal(false);
              setMemberSearchQuery("");
              setCustomMemberName("");
            }}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.searchSection}>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={memberSearchQuery}
                  onChangeText={setMemberSearchQuery}
                  placeholder="Search members..."
                  placeholderTextColor={Colors.light.muted}
                />
              </View>
            </View>

            <View style={styles.customNameSection}>
              <Text style={styles.customNameLabel}>Or add a custom name</Text>
              <TextInput
                style={styles.customNameInput}
                value={customMemberName}
                onChangeText={setCustomMemberName}
                placeholder="Type any name..."
                placeholderTextColor={Colors.light.muted}
              />
              {customMemberName.trim() !== "" && (
                <TouchableOpacity
                  style={styles.addCustomButton}
                  onPress={() => {
                    if (editingCrew && customMemberName.trim()) {
                      const newMember: CrewMember = {
                        id: `custom_${Date.now()}`,
                        name: customMemberName.trim(),
                        title: "Crew Member",
                        role: "worker",
                        availability: "available",
                        skills: [],
                        certifications: [],
                        performanceRating: 0,
                        jobsCompleted: 0,
                        avgRating: 0,
                        joinedDate: new Date().toISOString(),
                        hourlyRate: 0,
                        hoursThisWeek: 0,
                      };
                      setEditingCrew({
                        ...editingCrew,
                        members: [...editingCrew.members, newMember],
                      });
                      setCustomMemberName("");
                      setShowAddMemberModal(false);
                      Alert.alert("Success", `${newMember.name} has been added to the crew!`);
                    }
                  }}
                >
                  <Plus size={18} color="#FFF" />
                  <Text style={styles.addCustomButtonText}>Add &quot;{customMemberName.trim()}&quot;</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Available Members</Text>
              <View style={styles.dividerLine} />
            </View>

            {(() => {
              const availableMembers = allMembers
                .filter(member => !editingCrew?.members.find(m => m.id === member.id))
                .filter(member => 
                  memberSearchQuery === "" || 
                  member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                  member.title.toLowerCase().includes(memberSearchQuery.toLowerCase())
                );
              
              return availableMembers.length > 0 ? (
                availableMembers.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.addMemberCard}
                    onPress={() => {
                      if (editingCrew) {
                        setEditingCrew({
                          ...editingCrew,
                          members: [...editingCrew.members, member],
                        });
                        setShowAddMemberModal(false);
                        setMemberSearchQuery("");
                        setCustomMemberName("");
                        Alert.alert("Success", `${member.name} has been added to the crew!`);
                      }
                    }}
                  >
                    <View style={[styles.memberAvatarSmall, { backgroundColor: getRoleColor(member.role) + "20" }]}>
                      <User size={20} color={getRoleColor(member.role)} />
                    </View>
                    <View style={styles.addMemberCardInfo}>
                      <Text style={styles.addMemberCardName}>{member.name}</Text>
                      <Text style={styles.addMemberCardTitle}>{member.title}</Text>
                      <View style={styles.memberStats}>
                        <Star size={12} color={Colors.light.warning} fill={Colors.light.warning} />
                        <Text style={styles.memberRating}>{member.avgRating.toFixed(1)}</Text>
                        <Text style={styles.memberJobs}>• {member.jobsCompleted} jobs</Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={Colors.light.muted} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  {memberSearchQuery !== "" ? (
                    <Text style={styles.emptyText}>No members match your search</Text>
                  ) : (
                    <Text style={styles.emptyText}>All members are already in this crew</Text>
                  )}
                </View>
              );
            })()}
            
            <View style={{ height: 40 }} />
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  hoursText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
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
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  toggleTextActive: {
    color: "#FFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  crewCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  crewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  crewHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  crewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  crewMembers: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  crewPerformance: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  performanceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  performanceIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  performanceLabel: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  currentJobCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  currentJobHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  currentJobLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.warning,
  },
  currentJobText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  membersSection: {
    marginBottom: 16,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  memberTitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  memberStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memberRating: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  memberJobs: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  assignButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF5FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  routeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  routeDescription: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  individualCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  individualHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  individualLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  individualAvatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  individualInfo: {
    flex: 1,
  },
  individualName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  individualTitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 6,
  },
  individualStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  individualRating: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  individualJobs: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  individualMetrics: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  memberDetailHeader: {
    alignItems: "center",
    paddingVertical: 24,
  },
  memberDetailAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  memberDetailName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  memberDetailTitle: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  contactSection: {
    gap: 12,
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  contactText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  performanceSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  performanceCardValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
    marginBottom: 4,
  },
  performanceCardLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
  },
  detailSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  skillText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  certTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  certText: {
    fontSize: 13,
    color: "#065F46",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 40,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  assignJobButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
  },
  assignJobButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  assignHeader: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  assignTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  assignSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  assignSection: {
    marginBottom: 24,
  },
  assignSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  jobCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  jobCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  jobIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  jobCardInfo: {
    flex: 1,
  },
  jobCardClient: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  jobCardService: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  jobCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobCardDate: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  assignActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  payrollCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  payrollLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  payrollAmount: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#FFF",
    marginBottom: 4,
  },
  payrollHours: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  payrollSection: {
    marginBottom: 24,
  },
  payrollSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  payrollMemberCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  payrollMemberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memberAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  payrollMemberName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  payrollMemberHours: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  payrollMemberAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  payrollActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  payrollButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  payrollButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  payrollButtonPrimary: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  payrollButtonTextPrimary: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  timeTrackingHeader: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeTrackingTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  timeTrackingSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  timeStatsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  timeStatCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeStatValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
    marginBottom: 4,
  },
  timeStatLabel: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  timeTrackingSection: {
    marginBottom: 24,
  },
  timeTrackingSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  timeTrackingCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeTrackingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeTrackingCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeTrackingName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  timeTrackingHours: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scheduleNavButton: {
    padding: 12,
  },
  scheduleNavText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  scheduleDate: {
    alignItems: "center",
  },
  scheduleDateText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  scheduleDateSubtext: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  scheduleCrewCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  scheduleCrewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  scheduleCrewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scheduleCrewName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  addScheduleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleJobs: {
    gap: 12,
  },
  scheduleJobCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  scheduleJobTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 80,
  },
  scheduleJobTimeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  scheduleJobInfo: {
    flex: 1,
  },
  scheduleJobTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  scheduleJobMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scheduleJobAddress: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  noScheduleText: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
    paddingVertical: 12,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  roleOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  roleOptionTextActive: {
    color: "#FFF",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  editCrewButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  addMemberButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  editMemberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  editMemberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  editMemberInfo: {
    flex: 1,
  },
  editMemberName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  editMemberTitle: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  removeMemberButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  addMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addMemberCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addMemberCardName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  addMemberCardTitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  searchSection: {
    marginBottom: 20,
    marginTop: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    color: Colors.light.text,
  },
  customNameSection: {
    marginBottom: 24,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  customNameLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  customNameInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addCustomButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  emptyStateContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
});
