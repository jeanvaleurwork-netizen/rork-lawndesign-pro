import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react-native";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "manager" | "crew" | "customer")[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback || <AccessDenied message="Please log in to access this feature" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || <AccessDenied message="You don't have permission to access this feature" />;
  }

  return <>{children}</>;
}

function AccessDenied({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Shield color="#EF4444" size={64} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          This feature is restricted to authorized users only. Contact your administrator for access.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxWidth: 400,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
  },
});
