import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Stack } from "expo-router";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react-native";

import Colors from "@/constants/colors";

interface Notification {
  id: string;
  type: "job" | "payment" | "message" | "reminder" | "alert";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "payment",
    title: "Payment Received",
    message: "Smith Residence paid invoice INV-00121 - $4,536.00",
    timestamp: "2025-11-29T14:30:00",
    read: false,
  },
  {
    id: "2",
    type: "job",
    title: "Job Completed",
    message: "Crew A completed Johnson Backyard project",
    timestamp: "2025-11-29T12:15:00",
    read: false,
  },
  {
    id: "3",
    type: "reminder",
    title: "Follow-up Reminder",
    message: "Time to follow up with Jennifer Wilson about quote",
    timestamp: "2025-11-29T10:00:00",
    read: false,
  },
  {
    id: "4",
    type: "message",
    title: "New Message",
    message: "Maria Rodriguez sent you a message about tree removal",
    timestamp: "2025-11-29T09:30:00",
    read: true,
  },
  {
    id: "5",
    type: "alert",
    title: "Overdue Invoice",
    message: "Invoice INV-00123 for Lee Patio Project is 9 days overdue",
    timestamp: "2025-11-28T16:00:00",
    read: true,
  },
  {
    id: "6",
    type: "job",
    title: "Job Scheduled",
    message: "New job scheduled for tomorrow: Martinez Property at 9:00 AM",
    timestamp: "2025-11-28T14:20:00",
    read: true,
  },
  {
    id: "7",
    type: "payment",
    title: "Payment Reminder Sent",
    message: "Automated reminder sent to Johnson Backyard for pending payment",
    timestamp: "2025-11-28T10:00:00",
    read: true,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "payment":
        return <DollarSign color={Colors.light.success} size={20} />;
      case "job":
        return <CheckCircle color={Colors.light.primary} size={20} />;
      case "message":
        return <MessageSquare color={Colors.light.accent} size={20} />;
      case "reminder":
        return <Clock color={Colors.light.warning} size={20} />;
      case "alert":
        return <AlertCircle color={Colors.light.error} size={20} />;
      default:
        return <Bell color={Colors.light.muted} size={20} />;
    }
  };

  const getNotificationBg = (type: Notification["type"]) => {
    switch (type) {
      case "payment":
        return "#D1FAE5";
      case "job":
        return "#EBF5FF";
      case "message":
        return "#FEF3C7";
      case "reminder":
        return "#FEF3C7";
      case "alert":
        return "#FEE2E2";
      default:
        return "#F3F4F6";
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
              onPress={() => setFilter("all")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "all" && styles.filterButtonTextActive,
                ]}
              >
                All ({notifications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "unread" && styles.filterButtonActive]}
              onPress={() => setFilter("unread")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "unread" && styles.filterButtonTextActive,
                ]}
              >
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <CheckCircle color={Colors.light.primary} size={18} />
              <Text style={styles.markAllButtonText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollView}>
          {filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.notificationCardUnread,
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationBg(notification.type) },
                ]}
              >
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{formatTime(notification.timestamp)}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {filteredNotifications.length === 0 && (
            <View style={styles.emptyState}>
              <Bell color={Colors.light.muted} size={48} />
              <Text style={styles.emptyStateText}>No notifications</Text>
              <Text style={styles.emptyStateSubtext}>
                {filter === "unread" 
                  ? "You're all caught up!" 
                  : "You'll see notifications here"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 12,
  },
  filterButtons: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterButtonTextActive: {
    color: "#FFF",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
  },
  markAllButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.primary,
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  notificationCardUnread: {
    backgroundColor: "#F8FAFC",
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: Colors.light.muted,
    textAlign: "center",
  },
});
