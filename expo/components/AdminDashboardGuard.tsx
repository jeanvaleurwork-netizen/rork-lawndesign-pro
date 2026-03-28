import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Building } from "lucide-react-native";

export default function AdminDashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, isAdmin } = useAuth();

  if (!session || !isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Building color="#FF6B6B" size={64} />
          </View>
          <Text style={styles.title}>Admin Access Only</Text>
          <Text style={styles.message}>
            This section is restricted to business owners and administrators only.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/welcome")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}

export function DashboardHeader() {
  const { session, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/welcome");
  };

  if (!session) return null;

  return (
    <View style={styles.dashboardHeader}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <User color="#FFFFFF" size={20} />
        </View>
        <View>
          <Text style={styles.userName}>{session.user.name}</Text>
          <Text style={styles.userOrg}>{session.organization.businessName}</Text>
          <Text style={styles.userRole}>
            {session.user.role === "admin" ? "Administrator" : "Crew Member"}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
        <LogOut color="#FF6B6B" size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#0066FF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  dashboardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  userOrg: {
    fontSize: 13,
    color: "#666666",
  },
  userRole: {
    fontSize: 12,
    color: "#0066FF",
    fontWeight: "600" as const,
  },
  logoutButton: {
    padding: 8,
  },
});
