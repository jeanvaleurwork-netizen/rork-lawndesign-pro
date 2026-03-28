import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Stack } from "expo-router";
import {
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  estimatedValue: number;
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  priority: "high" | "medium" | "low";
  lastContact: string;
  nextFollowUp: string;
  source: string;
  notes: string;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Jennifer Wilson",
    phone: "+1 (512) 555-0198",
    email: "j.wilson@email.com",
    service: "Full Backyard Renovation",
    estimatedValue: 18500,
    status: "quoted",
    priority: "high",
    lastContact: "2025-11-28",
    nextFollowUp: "2025-11-30",
    source: "Website",
    notes: "Looking for complete backyard transformation with pool deck",
  },
  {
    id: "2",
    name: "Robert Chen",
    phone: "+1 (512) 555-0176",
    email: "r.chen@email.com",
    service: "Lawn Installation",
    estimatedValue: 4200,
    status: "contacted",
    priority: "medium",
    lastContact: "2025-11-27",
    nextFollowUp: "2025-11-29",
    source: "Referral",
    notes: "Wants natural grass, prefers Bermuda",
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    phone: "+1 (512) 555-0189",
    email: "maria.r@email.com",
    service: "Tree Removal & Stump Grinding",
    estimatedValue: 2800,
    status: "new",
    priority: "high",
    lastContact: "2025-11-29",
    nextFollowUp: "2025-11-29",
    source: "Google Ads",
    notes: "3 large oak trees need removal ASAP",
  },
  {
    id: "4",
    name: "David Thompson",
    phone: "+1 (512) 555-0143",
    email: "d.thompson@email.com",
    service: "Landscape Maintenance",
    estimatedValue: 450,
    status: "contacted",
    priority: "low",
    lastContact: "2025-11-26",
    nextFollowUp: "2025-12-01",
    source: "Facebook",
    notes: "Monthly maintenance contract",
  },
];

export default function LeadsFollowUpScreen() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedFilter, setSelectedFilter] = useState<"all" | Lead["status"]>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = selectedFilter === "all" || lead.status === selectedFilter;
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: Lead["status"]) => {
    const colorMap = {
      new: Colors.light.primary,
      contacted: Colors.light.warning,
      quoted: Colors.light.accent,
      won: Colors.light.success,
      lost: Colors.light.error,
    };
    return colorMap[status];
  };

  const getStatusBg = (status: Lead["status"]) => {
    const bgMap = {
      new: "#EBF5FF",
      contacted: "#FEF3C7",
      quoted: "#FEF3C7",
      won: "#D1FAE5",
      lost: "#FEE2E2",
    };
    return bgMap[status];
  };

  const getPriorityColor = (priority: Lead["priority"]) => {
    const colorMap = {
      high: Colors.light.error,
      medium: Colors.light.warning,
      low: Colors.light.muted,
    };
    return colorMap[priority];
  };

  const totalValue = leads
    .filter((l) => l.status !== "lost")
    .reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const wonValue = leads
    .filter((l) => l.status === "won")
    .reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const conversionRate = ((wonValue / totalValue) * 100 || 0).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Leads & Follow-up",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <DollarSign color={Colors.light.success} size={18} />
              <Text style={styles.statValue}>${(totalValue / 1000).toFixed(0)}k</Text>
              <Text style={styles.statLabel}>Pipeline Value</Text>
            </View>

            <View style={styles.statCard}>
              <UserPlus color={Colors.light.primary} size={18} />
              <Text style={styles.statValue}>{leads.length}</Text>
              <Text style={styles.statLabel}>Active Leads</Text>
            </View>

            <View style={styles.statCard}>
              <TrendingUp color={Colors.light.accent} size={18} />
              <Text style={styles.statValue}>{conversionRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <MessageSquare color={Colors.light.muted} size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search leads..."
                placeholderTextColor={Colors.light.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === "all" && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter("all")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === "all" && styles.filterButtonTextActive,
                  ]}
                >
                  All ({leads.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === "new" && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter("new")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === "new" && styles.filterButtonTextActive,
                  ]}
                >
                  New ({leads.filter((l) => l.status === "new").length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === "contacted" && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter("contacted")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === "contacted" && styles.filterButtonTextActive,
                  ]}
                >
                  Contacted ({leads.filter((l) => l.status === "contacted").length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === "quoted" && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter("quoted")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === "quoted" && styles.filterButtonTextActive,
                  ]}
                >
                  Quoted ({leads.filter((l) => l.status === "quoted").length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === "won" && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter("won")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === "won" && styles.filterButtonTextActive,
                  ]}
                >
                  Won ({leads.filter((l) => l.status === "won").length})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.leadsSection}>
            {filteredLeads.map((lead) => (
              <TouchableOpacity key={lead.id} style={styles.leadCard}>
                <View style={styles.leadHeader}>
                  <View style={styles.leadHeaderLeft}>
                    <Text style={styles.leadName}>{lead.name}</Text>
                    <View
                      style={[styles.priorityDot, { backgroundColor: getPriorityColor(lead.priority) }]}
                    />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBg(lead.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(lead.status) }]}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.service}>{lead.service}</Text>

                <View style={styles.valueRow}>
                  <DollarSign color={Colors.light.success} size={16} />
                  <Text style={styles.valueText}>
                    ${lead.estimatedValue.toLocaleString()} potential value
                  </Text>
                </View>

                <View style={styles.contactRow}>
                  <View style={styles.contactItem}>
                    <Phone color={Colors.light.muted} size={14} />
                    <Text style={styles.contactText}>{lead.phone}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Mail color={Colors.light.muted} size={14} />
                    <Text style={styles.contactText}>{lead.email}</Text>
                  </View>
                </View>

                <View style={styles.timelineRow}>
                  <View style={styles.timelineItem}>
                    <Clock color={Colors.light.muted} size={14} />
                    <Text style={styles.timelineText}>
                      Last: {new Date(lead.lastContact).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                  <View style={styles.timelineItem}>
                    <Calendar color={Colors.light.primary} size={14} />
                    <Text style={[styles.timelineText, { color: Colors.light.primary }]}>
                      Next: {new Date(lead.nextFollowUp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                </View>

                <View style={styles.sourceRow}>
                  <View style={styles.sourceBadge}>
                    <Star color={Colors.light.accent} size={12} />
                    <Text style={styles.sourceText}>{lead.source}</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.callButton}>
                    <Phone color={Colors.light.primary} size={16} />
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.emailButton}>
                    <Mail color={Colors.light.text} size={16} />
                    <Text style={styles.emailButtonText}>Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quoteButton}>
                    <DollarSign color="#FFF" size={16} />
                    <Text style={styles.quoteButtonText}>Quote</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addLeadButton}>
            <UserPlus color="#FFF" size={20} />
            <Text style={styles.addLeadButtonText}>Add New Lead</Text>
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
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    textAlign: "center",
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  filterButtonTextActive: {
    color: "#FFF",
  },
  leadsSection: {
    marginBottom: 20,
  },
  leadCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leadHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  service: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.success,
  },
  contactRow: {
    gap: 8,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timelineText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  sourceRow: {
    marginBottom: 12,
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    gap: 4,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBF5FF",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  emailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  emailButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  quoteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.success,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  quoteButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  addLeadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addLeadButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
