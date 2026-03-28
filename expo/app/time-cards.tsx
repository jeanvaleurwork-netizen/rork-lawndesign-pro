import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router, Stack } from "expo-router";
import { ChevronLeft, Clock, DollarSign, Users, Calendar } from "lucide-react-native";
import Colors from "@/constants/colors";
import { TimeCard } from "@/types";

export default function TimeCardsScreen() {
  const [timeCards] = useState<TimeCard[]>([
    {
      id: "1",
      employeeId: "e1",
      employeeName: "John Smith",
      jobId: "2",
      date: "2025-11-29",
      clockIn: "07:00",
      clockOut: "16:30",
      breakMinutes: 30,
      totalHours: 9,
      hourlyRate: 35,
      regularHours: 8,
      overtimeHours: 1,
      totalPay: 332.50,
      status: "approved",
    },
    {
      id: "2",
      employeeId: "e2",
      employeeName: "Sarah Chen",
      jobId: "5",
      date: "2025-11-29",
      clockIn: "08:00",
      clockOut: "17:00",
      breakMinutes: 30,
      totalHours: 8.5,
      hourlyRate: 40,
      regularHours: 8,
      overtimeHours: 0.5,
      totalPay: 350,
      status: "submitted",
    },
  ]);

  const totalHours = timeCards.reduce((sum, tc) => sum + tc.totalHours, 0);
  const totalPay = timeCards.reduce((sum, tc) => sum + tc.totalPay, 0);
  const pendingApproval = timeCards.filter(tc => tc.status === "submitted").length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Time Cards & Payroll",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <Clock color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>{totalHours}h</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <DollarSign color={Colors.light.success} size={20} />
          </View>
          <Text style={styles.statValue}>${(totalPay / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Total Pay</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.warning + "20" }]}>
            <Users color={Colors.light.warning} size={20} />
          </View>
          <Text style={styles.statValue}>{pendingApproval}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Time Cards</Text>

          {timeCards.map((tc) => (
            <View key={tc.id} style={styles.timeCard}>
              <View style={styles.tcHeader}>
                <View>
                  <Text style={styles.employeeName}>{tc.employeeName}</Text>
                  <Text style={styles.tcDate}>{new Date(tc.date).toLocaleDateString()}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: tc.status === "approved" ? Colors.light.success + "20" : Colors.light.warning + "20" }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: tc.status === "approved" ? Colors.light.success : Colors.light.warning }
                  ]}>
                    {tc.status}
                  </Text>
                </View>
              </View>

              <View style={styles.timeDetails}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Clock In:</Text>
                  <Text style={styles.timeValue}>{tc.clockIn}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Clock Out:</Text>
                  <Text style={styles.timeValue}>{tc.clockOut}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Total Hours:</Text>
                  <Text style={styles.timeValue}>{tc.totalHours}h</Text>
                </View>
              </View>

              <View style={styles.paySection}>
                <View style={styles.payRow}>
                  <Text style={styles.payLabel}>Regular ({tc.regularHours}h × ${tc.hourlyRate}):</Text>
                  <Text style={styles.payValue}>${(tc.regularHours * tc.hourlyRate).toFixed(2)}</Text>
                </View>
                {tc.overtimeHours > 0 && (
                  <View style={styles.payRow}>
                    <Text style={styles.payLabel}>Overtime ({tc.overtimeHours}h × ${tc.hourlyRate * 1.5}):</Text>
                    <Text style={styles.payValue}>${(tc.overtimeHours * tc.hourlyRate * 1.5).toFixed(2)}</Text>
                  </View>
                )}
                <View style={[styles.payRow, styles.totalPay]}>
                  <Text style={styles.totalPayLabel}>Total Pay:</Text>
                  <Text style={styles.totalPayValue}>${tc.totalPay.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
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
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  timeCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tcHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  tcDate: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  timeDetails: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeLabel: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  paySection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 6,
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payLabel: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  payValue: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  totalPay: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  totalPayLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  totalPayValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
});
