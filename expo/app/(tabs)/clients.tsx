import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight, Phone, Mail, Plus, Filter, Briefcase, DollarSign, Users, Star } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useData } from "@/contexts/DataContext";

export default function ClientsScreen() {
  const router = useRouter();
  const { clients: dataClients } = useData();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "jobs" | "recent">("name");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"all" | "separated">("separated");

  let filteredClients = dataClients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
    
    return matchesSearch;
  });

  filteredClients = filteredClients.sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "jobs") {
      return b.jobsCount - a.jobsCount;
    }
    return 0;
  });

  const newClients = filteredClients.filter((c) => c.customerType === "new");
  const recurringClients = filteredClients.filter((c) => c.customerType === "recurring");

  const totalRevenue = 125000;
  const avgJobValue = totalRevenue / dataClients.reduce((sum, client) => sum + client.jobsCount, 0) || 0;
  
  const newClientsCount = dataClients.filter((c) => c.customerType === "new").length;
  const recurringClientsCount = dataClients.filter((c) => c.customerType === "recurring").length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Clients</Text>
          <Text style={styles.headerSubtitle}>{dataClients.length} total clients</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("/client-form" as any)}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.smallStatCard}>
          <Text style={styles.smallStatLabel}>Total Revenue</Text>
          <Text style={styles.smallStatValue}>${(totalRevenue / 1000).toFixed(1)}K</Text>
        </View>
        <View style={styles.smallStatCard}>
          <Text style={styles.smallStatLabel}>Avg Job Value</Text>
          <Text style={styles.smallStatValue}>${avgJobValue.toFixed(0)}</Text>
        </View>
        <View style={styles.smallStatCard}>
          <Text style={styles.smallStatLabel}>Active Jobs</Text>
          <Text style={styles.smallStatValue}>
            {dataClients.reduce((sum, client) => sum + client.jobsCount, 0)}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search color={Colors.light.muted} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.muted}
        />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Filter color={showFilters ? Colors.light.primary : Colors.light.muted} size={20} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === "name" && styles.sortButtonActive]}
              onPress={() => setSortBy("name")}
            >
              <Text style={[styles.sortButtonText, sortBy === "name" && styles.sortButtonTextActive]}>
                Name
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === "jobs" && styles.sortButtonActive]}
              onPress={() => setSortBy("jobs")}
            >
              <Text style={[styles.sortButtonText, sortBy === "jobs" && styles.sortButtonTextActive]}>
                Most Jobs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === "recent" && styles.sortButtonActive]}
              onPress={() => setSortBy("recent")}
            >
              <Text style={[styles.sortButtonText, sortBy === "recent" && styles.sortButtonTextActive]}>
                Recent
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>View:</Text>
            <TouchableOpacity
              style={[styles.sortButton, viewMode === "all" && styles.sortButtonActive]}
              onPress={() => setViewMode("all")}
            >
              <Text style={[styles.sortButtonText, viewMode === "all" && styles.sortButtonTextActive]}>
                All Together
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, viewMode === "separated" && styles.sortButtonActive]}
              onPress={() => setViewMode("separated")}
            >
              <Text style={[styles.sortButtonText, viewMode === "separated" && styles.sortButtonTextActive]}>
                Separated
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <View style={styles.clientsList}>
          <View style={styles.clientTypesHeader}>
            <View style={styles.typeHeaderCard}>
              <Users color={Colors.light.primary} size={18} />
              <View>
                <Text style={styles.typeHeaderCount}>{newClientsCount}</Text>
                <Text style={styles.typeHeaderLabel}>New Customers</Text>
              </View>
            </View>
            <View style={styles.typeHeaderCard}>
              <Star color={Colors.light.success} size={18} />
              <View>
                <Text style={styles.typeHeaderCount}>{recurringClientsCount}</Text>
                <Text style={styles.typeHeaderLabel}>Recurring</Text>
              </View>
            </View>
          </View>

          {filteredClients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No clients found</Text>
            </View>
          ) : viewMode === "separated" ? (
            <>
              {recurringClients.length > 0 && (
                <View style={styles.clientSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Star color={Colors.light.success} size={20} />
                    <Text style={styles.sectionHeaderTitle}>Recurring Customers</Text>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>{recurringClients.length}</Text>
                    </View>
                  </View>
                  {recurringClients.map((client) => (
                    <TouchableOpacity 
                      key={client.id} 
                      style={styles.clientCard}
                      onPress={() => router.push(`/client-detail?id=${client.id}` as any)}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.clientInfo}>
                          <Text style={styles.clientName}>{client.name}</Text>
                          <View style={styles.clientStatsRow}>
                            <Text style={styles.statText}>{client.jobsCount} jobs</Text>
                            <Text style={styles.separator}>•</Text>
                            <Text style={styles.statText}>{client.estimatesCount} estimates</Text>
                          </View>
                        </View>
                        <ChevronRight color={Colors.light.muted} size={20} />
                      </View>

                      <View style={styles.contactRow}>
                        <View style={styles.contactItem}>
                          <Phone color={Colors.light.muted} size={16} />
                          <Text style={styles.contactText}>{client.phone}</Text>
                        </View>
                        <View style={styles.contactItem}>
                          <Mail color={Colors.light.muted} size={16} />
                          <Text style={styles.contactText}>{client.email}</Text>
                        </View>
                      </View>

                      {client.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                          {client.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <View style={styles.cardFooter}>
                        <View style={styles.footerItem}>
                          <Briefcase color={Colors.light.primary} size={14} />
                          <Text style={styles.footerText}>{client.jobsCount} Active</Text>
                        </View>
                        <View style={styles.footerItem}>
                          <DollarSign color={Colors.light.success} size={14} />
                          <Text style={styles.footerText}>
                            ${((client.jobsCount * avgJobValue) / 1000).toFixed(1)}K Lifetime
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {newClients.length > 0 && (
                <View style={styles.clientSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Users color={Colors.light.primary} size={20} />
                    <Text style={styles.sectionHeaderTitle}>New Customers</Text>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>{newClients.length}</Text>
                    </View>
                  </View>
                  {newClients.map((client) => (
                    <TouchableOpacity 
                      key={client.id} 
                      style={styles.clientCard}
                      onPress={() => router.push(`/client-detail?id=${client.id}` as any)}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.clientInfo}>
                          <Text style={styles.clientName}>{client.name}</Text>
                          <View style={styles.clientStatsRow}>
                            <Text style={styles.statText}>{client.jobsCount} jobs</Text>
                            <Text style={styles.separator}>•</Text>
                            <Text style={styles.statText}>{client.estimatesCount} estimates</Text>
                          </View>
                        </View>
                        <ChevronRight color={Colors.light.muted} size={20} />
                      </View>

                      <View style={styles.contactRow}>
                        <View style={styles.contactItem}>
                          <Phone color={Colors.light.muted} size={16} />
                          <Text style={styles.contactText}>{client.phone}</Text>
                        </View>
                        <View style={styles.contactItem}>
                          <Mail color={Colors.light.muted} size={16} />
                          <Text style={styles.contactText}>{client.email}</Text>
                        </View>
                      </View>

                      {client.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                          {client.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <View style={styles.cardFooter}>
                        <View style={styles.footerItem}>
                          <Briefcase color={Colors.light.primary} size={14} />
                          <Text style={styles.footerText}>{client.jobsCount} Active</Text>
                        </View>
                        <View style={styles.footerItem}>
                          <DollarSign color={Colors.light.success} size={14} />
                          <Text style={styles.footerText}>
                            ${((client.jobsCount * avgJobValue) / 1000).toFixed(1)}K Lifetime
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            filteredClients.map((client) => (
              <TouchableOpacity 
                key={client.id} 
                style={styles.clientCard}
                onPress={() => router.push(`/client-detail?id=${client.id}` as any)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <View style={styles.clientNameRow}>
                      <Text style={styles.clientName}>{client.name}</Text>
                      <View
                        style={[
                          styles.customerTypeBadge,
                          client.customerType === "recurring" && styles.customerTypeBadgeRecurring,
                        ]}
                      >
                        <Text
                          style={[
                            styles.customerTypeBadgeText,
                            client.customerType === "recurring" &&
                              styles.customerTypeBadgeTextRecurring,
                          ]}
                        >
                          {client.customerType === "new" ? "New" : "Recurring"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.clientStatsRow}>
                      <Text style={styles.statText}>{client.jobsCount} jobs</Text>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.statText}>{client.estimatesCount} estimates</Text>
                    </View>
                  </View>
                  <ChevronRight color={Colors.light.muted} size={20} />
                </View>

                <View style={styles.contactRow}>
                  <View style={styles.contactItem}>
                    <Phone color={Colors.light.muted} size={16} />
                    <Text style={styles.contactText}>{client.phone}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Mail color={Colors.light.muted} size={16} />
                    <Text style={styles.contactText}>{client.email}</Text>
                  </View>
                </View>

                {client.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {client.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Briefcase color={Colors.light.primary} size={14} />
                    <Text style={styles.footerText}>{client.jobsCount} Active</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <DollarSign color={Colors.light.success} size={14} />
                    <Text style={styles.footerText}>
                      ${((client.jobsCount * avgJobValue) / 1000).toFixed(1)}K Lifetime
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  headerSubtitle: {
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
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  smallStatLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    marginBottom: 4,
    fontWeight: "500" as const,
  },
  smallStatValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  clientsList: {
    paddingHorizontal: 20,
  },
  clientCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  clientStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  separator: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  contactRow: {
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "500" as const,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginRight: 4,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sortButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  sortButtonTextActive: {
    color: "#FFF",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.muted,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
  },
  clientTypesHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  typeHeaderCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  typeHeaderCount: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  typeHeaderLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    fontWeight: "500" as const,
  },
  clientNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  customerTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  customerTypeBadgeRecurring: {
    backgroundColor: Colors.light.success,
  },
  customerTypeBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  customerTypeBadgeTextRecurring: {
    color: "#FFF",
  },
  clientSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.border,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
