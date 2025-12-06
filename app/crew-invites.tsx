import React, { useState } from "react";
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
  ActivityIndicator,
  Share,
} from "react-native";
import { Stack } from "expo-router";
import { 
  UserPlus, 
  Copy, 
  Send, 
  CheckCircle, 
  X,
  Clock,
  Users,
} from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";

export default function CrewInvitesScreen() {
  const { user, session } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    crewName: "",
    phoneNumber: "",
    role: "crew" as "crew" | "manager",
  });

  const generateInviteMutation = trpc.auth.generateInviteCode.useMutation();
  const inviteCodesQuery = trpc.auth.getInviteCodes.useQuery(
    { userId: user?.id || "" },
    { enabled: !!user?.id && user.role === "admin" }
  );

  const handleGenerateInvite = async () => {
    if (!formData.crewName || !formData.phoneNumber) {
      Alert.alert("Missing Information", "Please enter crew name and phone number");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      const result = await generateInviteMutation.mutateAsync({
        userId: user.id,
        crewName: formData.crewName,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
      });

      Alert.alert(
        "Invite Code Generated!",
        `Invite code: ${result.code}\n\nSend this code to ${formData.crewName} to join your team.`,
        [
          {
            text: "Copy Code",
            onPress: () => {
              // In real app, use Clipboard API
              console.log("Copy:", result.code);
            },
          },
          {
            text: "Share",
            onPress: () => handleShareCode(result.code, formData.crewName),
          },
          { text: "Done" },
        ]
      );

      setShowCreateModal(false);
      setFormData({
        crewName: "",
        phoneNumber: "",
        role: "crew",
      });
      
      await inviteCodesQuery.refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate invite code");
    }
  };

  const handleShareCode = async (code: string, crewName: string) => {
    const message = `Hi ${crewName}! You've been invited to join ${session?.organization.businessName || "our team"} on ContractorOS.\n\nYour invite code is: ${code}\n\nDownload the app and use this code to sign up!`;
    
    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const inviteCodes = inviteCodesQuery.data || [];
  const activeInvites = inviteCodes.filter((ic) => !ic.used);
  const usedInvites = inviteCodes.filter((ic) => ic.used);

  if (user?.role !== "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Crew Invites",
            headerStyle: { backgroundColor: Colors.light.card },
            headerTintColor: Colors.light.text,
          }}
        />
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedText}>Only admins can manage crew invites</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Crew Invites",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Invite Crew Members</Text>
              <Text style={styles.subtitle}>Generate invite codes for your team</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: "#EBF5FF" }]}>
                <Users color={Colors.light.primary} size={20} />
              </View>
              <Text style={styles.statValue}>{activeInvites.length}</Text>
              <Text style={styles.statLabel}>Active Invites</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}>
                <CheckCircle color={Colors.light.success} size={20} />
              </View>
              <Text style={styles.statValue}>{usedInvites.length}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <UserPlus color="#FFF" size={20} />
            <Text style={styles.createButtonText}>Generate New Invite</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Invites ({activeInvites.length})</Text>
            {inviteCodesQuery.isLoading ? (
              <ActivityIndicator color={Colors.light.primary} size="large" />
            ) : activeInvites.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No active invites</Text>
                <Text style={styles.emptySubtext}>
                  Generate invite codes to add crew members
                </Text>
              </View>
            ) : (
              activeInvites.map((invite) => (
                <View key={invite.code} style={styles.inviteCard}>
                  <View style={styles.inviteHeader}>
                    <View>
                      <Text style={styles.inviteName}>{invite.crewName}</Text>
                      <Text style={styles.invitePhone}>{invite.phoneNumber}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: Colors.light.primary }]}>
                      <Text style={styles.roleText}>
                        {invite.role === "manager" ? "Manager" : "Crew"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.codeContainer}>
                    <View style={styles.codeBox}>
                      <Text style={styles.codeLabel}>Invite Code</Text>
                      <Text style={styles.code}>{invite.code}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => {
                        console.log("Copy:", invite.code);
                        Alert.alert("Copied!", "Invite code copied to clipboard");
                      }}
                    >
                      <Copy color={Colors.light.primary} size={18} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inviteFooter}>
                    <View style={styles.inviteTime}>
                      <Clock size={14} color={Colors.light.muted} />
                      <Text style={styles.inviteTimeText}>
                        Created {new Date(invite.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() => handleShareCode(invite.code, invite.crewName || "")}
                    >
                      <Send size={16} color={Colors.light.primary} />
                      <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {usedInvites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Used Invites ({usedInvites.length})</Text>
              {usedInvites.map((invite) => (
                <View key={invite.code} style={[styles.inviteCard, styles.usedInviteCard]}>
                  <View style={styles.inviteHeader}>
                    <View>
                      <Text style={styles.inviteName}>{invite.crewName}</Text>
                      <Text style={styles.invitePhone}>{invite.phoneNumber}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: "#D1FAE5" }]}>
                      <CheckCircle size={14} color={Colors.light.success} />
                      <Text style={[styles.statusText, { color: Colors.light.success }]}>
                        Joined
                      </Text>
                    </View>
                  </View>

                  <View style={styles.usedInfo}>
                    <Text style={styles.usedText}>
                      Joined on {invite.usedAt ? new Date(invite.usedAt).toLocaleDateString() : "N/A"}
                    </Text>
                  </View>
                </View>
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
            <Text style={styles.modalTitle}>Generate Invite Code</Text>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                setFormData({
                  crewName: "",
                  phoneNumber: "",
                  role: "crew",
                });
              }}
            >
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Crew Member Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.crewName}
                onChangeText={(text) => setFormData({ ...formData, crewName: text })}
                placeholder="John Smith"
                placeholderTextColor={Colors.light.muted}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                placeholder="(555) 123-4567"
                placeholderTextColor={Colors.light.muted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Role *</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "crew" && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "crew" })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === "crew" && styles.roleOptionTextSelected,
                    ]}
                  >
                    Crew Member
                  </Text>
                  <Text style={styles.roleDescription}>
                    View assigned jobs, upload photos, clock in/out
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "manager" && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "manager" })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === "manager" && styles.roleOptionTextSelected,
                    ]}
                  >
                    Manager
                  </Text>
                  <Text style={styles.roleDescription}>
                    Create jobs, send estimates, review checklists
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.generateButton,
                (!formData.crewName || !formData.phoneNumber || generateInviteMutation.isPending) &&
                  styles.generateButtonDisabled,
              ]}
              onPress={handleGenerateInvite}
              disabled={
                !formData.crewName ||
                !formData.phoneNumber ||
                generateInviteMutation.isPending
              }
            >
              {generateInviteMutation.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <UserPlus size={18} color="#FFF" />
                  <Text style={styles.generateButtonText}>Generate Invite Code</Text>
                </>
              )}
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
  statsCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    textAlign: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
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
  inviteCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  usedInviteCard: {
    opacity: 0.7,
  },
  inviteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  inviteName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  invitePhone: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  codeBox: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  codeLabel: {
    fontSize: 11,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  code: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    letterSpacing: 2,
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inviteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inviteTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inviteTimeText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  usedInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  usedText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
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
    paddingTop: 24,
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
  roleSelector: {
    gap: 12,
  },
  roleOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  roleOptionSelected: {
    backgroundColor: Colors.light.primary + "10",
    borderColor: Colors.light.primary,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  roleOptionTextSelected: {
    color: Colors.light.primary,
  },
  roleDescription: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  restrictedText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: "center",
  },
});
