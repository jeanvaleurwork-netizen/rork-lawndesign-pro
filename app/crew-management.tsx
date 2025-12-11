import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { Stack } from "expo-router";
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
  UserPlus,
  Filter,
  Search,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { useCrew, CrewMember as CrewMemberType } from "@/contexts/CrewContext";

const { width } = Dimensions.get("window");

type CrewMember = CrewMemberType;

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

export default function CrewManagementScreen() {
  const { crew: backendCrew, isLoading: isLoadingCrew, createCrewMember, updateCrewMember, deleteCrewMember, isCreating, isUpdating, isDeleting } = useCrew();
  const [viewMode, setViewMode] = useState<"crews" | "individuals">("crews");
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    role: "worker" as CrewMember["role"],
    phone: "",
    email: "",
    hourlyRate: "",
    skills: "",
    certifications: "",
  });

  const [crews] = useState<Crew[]>([
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

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allMembers;
    const query = searchQuery.toLowerCase();
    return allMembers.filter(member => 
      member.name.toLowerCase().includes(query) ||
      member.title.toLowerCase().includes(query) ||
      member.skills.some(skill => skill.toLowerCase().includes(query))
    );
  }, [allMembers, searchQuery]);

  const filteredCrews = useMemo(() => {
    if (!searchQuery.trim()) return crews;
    const query = searchQuery.toLowerCase();
    return crews.filter(crew => 
      crew.name.toLowerCase().includes(query) ||
      crew.members.some(member => member.name.toLowerCase().includes(query))
    );
  }, [crews, searchQuery]);

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

  const handleEditMember = (member: CrewMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      role: member.role,
      phone: member.phone || "",
      email: member.email || "",
      hourlyRate: member.hourlyRate.toString(),
      skills: member.skills.join(", "),
      certifications: member.certifications.join(", "),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!formData.name || !formData.title) {
      Alert.alert("Missing Information", "Please fill in name and job title.");
      return;
    }

    Alert.alert(
      "Success",
      `${formData.name} has been updated!`,
      [
        {
          text: "OK",
          onPress: () => {
            setShowEditModal(false);
            setEditingMember(null);
            setFormData({
              name: "",
              title: "",
              role: "worker",
              phone: "",
              email: "",
              hourlyRate: "",
              skills: "",
              certifications: "",
            });
          },
        },
      ]
    );
  };

  const totalJobs = crews.reduce((sum, crew) => sum + crew.jobsToday, 0);
  const totalMembers = allMembers.length;
  const avgRating = allMembers.reduce((sum, m) => sum + m.avgRating, 0) / totalMembers;
  const totalHours = allMembers.reduce((sum, m) => sum + m.hoursThisWeek, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Crew Management",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Team Overview</Text>
              <Text style={styles.subtitle}>Manage crews and track performance</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus color="#FFF" size={18} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search color={Colors.light.muted} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crews or members..."
              placeholderTextColor={Colors.light.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X color={Colors.light.muted} size={20} />
              </TouchableOpacity>
            )}
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
              {filteredCrews.length === 0 ? (
                <View style={styles.emptyState}>
                  <Users size={48} color={Colors.light.muted} />
                  <Text style={styles.emptyStateTitle}>No crews found</Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? "Try a different search term" : "Create your first crew to get started"}
                  </Text>
                </View>
              ) : null}
              {filteredCrews.map((crew) => (
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
                    <ChevronRight color={Colors.light.muted} size={20} />
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

                  <TouchableOpacity style={styles.assignButton}>
                    <Briefcase size={18} color="#FFF" />
                    <Text style={styles.assignButtonText}>Assign Jobs</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Team Members ({filteredMembers.length})</Text>
                <TouchableOpacity style={styles.filterButton}>
                  <Filter size={18} color={Colors.light.muted} />
                </TouchableOpacity>
              </View>

              {filteredMembers.length === 0 ? (
                <View style={styles.emptyState}>
                  <User size={48} color={Colors.light.muted} />
                  <Text style={styles.emptyStateTitle}>No members found</Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? "Try a different search term" : "Add your first team member"}
                  </Text>
                </View>
              ) : null}
              {filteredMembers.map((member) => (
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
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Crew Member</Text>
            <TouchableOpacity onPress={() => {
              setShowCreateModal(false);
              setFormData({
                name: "",
                title: "",
                role: "worker",
                phone: "",
                email: "",
                hourlyRate: "",
                skills: "",
                certifications: "",
              });
            }}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="John Smith"
                placeholderTextColor={Colors.light.muted}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Landscaping Technician"
                placeholderTextColor={Colors.light.muted}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Role *</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "worker" && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "worker" })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === "worker" && styles.roleOptionTextSelected,
                    ]}
                  >
                    Worker
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "lead" && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "lead" })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === "lead" && styles.roleOptionTextSelected,
                    ]}
                  >
                    Lead
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "specialist" && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "specialist" })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === "specialist" && styles.roleOptionTextSelected,
                    ]}
                  >
                    Specialist
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(512) 555-0123"
                placeholderTextColor={Colors.light.muted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="john@contractoros.com"
                placeholderTextColor={Colors.light.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Hourly Rate ($)</Text>
              <TextInput
                style={styles.input}
                value={formData.hourlyRate}
                onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
                placeholder="25"
                placeholderTextColor={Colors.light.muted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Skills (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.skills}
                onChangeText={(text) => setFormData({ ...formData, skills: text })}
                placeholder="Lawn Maintenance, Edging, Trimming"
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Certifications (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.certifications}
                onChangeText={(text) => setFormData({ ...formData, certifications: text })}
                placeholder="Pesticide License, First Aid"
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                (!formData.name || !formData.title) && styles.createButtonDisabled,
              ]}
              onPress={() => {
                if (!formData.name || !formData.title) {
                  Alert.alert("Missing Information", "Please fill in name and job title.");
                  return;
                }
                
                Alert.alert(
                  "Success",
                  `${formData.name} has been added to your team!`,
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setShowCreateModal(false);
                        setFormData({
                          name: "",
                          title: "",
                          role: "worker",
                          phone: "",
                          email: "",
                          hourlyRate: "",
                          skills: "",
                          certifications: "",
                        });
                      },
                    },
                  ]
                );
              }}
              disabled={!formData.name || !formData.title}
            >
              <UserPlus size={18} color="#FFF" />
              <Text style={styles.createButtonText}>Add Crew Member</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
                    if (selectedMember) {
                      setShowMemberModal(false);
                      handleEditMember(selectedMember);
                    }
                  }}
                >
                  <Edit3 size={18} color={Colors.light.primary} />
                  <Text style={styles.editButtonText}>Edit Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.assignJobButton}>
                  <Briefcase size={18} color="#FFF" />
                  <Text style={styles.assignJobButtonText}>Assign to Job</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
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
            <Text style={styles.modalTitle}>Edit Crew Member</Text>
            <TouchableOpacity onPress={() => {
              setShowEditModal(false);
              setEditingMember(null);
              setFormData({
                name: "",
                title: "",
                role: "worker",
                phone: "",
                email: "",
                hourlyRate: "",
                skills: "",
                certifications: "",
              });
            }}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="John Smith"
                placeholderTextColor={Colors.light.muted}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Landscaping Technician"
                placeholderTextColor={Colors.light.muted}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Role *</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "worker" && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "worker" })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === "worker" && styles.roleOptionTextSelected,
                    ]}
                  >
                    Worker
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "lead" && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "lead" })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === "lead" && styles.roleOptionTextSelected,
                    ]}
                  >
                    Lead
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "specialist" && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "specialist" })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === "specialist" && styles.roleOptionTextSelected,
                    ]}
                  >
                    Specialist
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(512) 555-0123"
                placeholderTextColor={Colors.light.muted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="john@contractoros.com"
                placeholderTextColor={Colors.light.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Hourly Rate ($)</Text>
              <TextInput
                style={styles.input}
                value={formData.hourlyRate}
                onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
                placeholder="25"
                placeholderTextColor={Colors.light.muted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Skills (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.skills}
                onChangeText={(text) => setFormData({ ...formData, skills: text })}
                placeholder="Lawn Maintenance, Edging, Trimming"
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Certifications (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.certifications}
                onChangeText={(text) => setFormData({ ...formData, certifications: text })}
                placeholder="Pesticide License, First Aid"
                placeholderTextColor={Colors.light.muted}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                (!formData.name || !formData.title) && styles.createButtonDisabled,
              ]}
              onPress={handleSaveEdit}
              disabled={!formData.name || !formData.title}
            >
              <Edit3 size={18} color="#FFF" />
              <Text style={styles.createButtonText}>Save Changes</Text>
            </TouchableOpacity>

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
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  roleSelector: {
    flexDirection: "row",
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  roleOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  roleOptionTextSelected: {
    color: "#FFF",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
