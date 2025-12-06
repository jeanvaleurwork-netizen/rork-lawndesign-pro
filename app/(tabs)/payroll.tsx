import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DollarSign,
  Clock,
  Calendar,
  Download,
  Plus,
  Check,
  AlertCircle,
  ChevronRight,
  X,
  Users,
  Calculator,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { PayrollPeriod, PayrollStatus } from "@/types";

export default function PayrollScreen() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showTimeCardModal, setShowTimeCardModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "Worker",
    hourlyRate: "",
    paymentMethod: "direct-deposit" as "direct-deposit" | "check",
  });
  const [newTimeCard, setNewTimeCard] = useState({
    employeeId: "",
    regularHours: "",
    overtimeHours: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const payrollPeriods: PayrollPeriod[] = useMemo(() => {
    const periods: PayrollPeriod[] = [
      {
        id: "1",
        startDate: "2025-11-18",
        endDate: "2025-12-01",
        status: "paid",
        totalHours: 320,
        totalRegularHours: 320,
        totalOvertimeHours: 0,
        totalAmount: 9600,
        processedDate: "2025-12-02",
        paidDate: "2025-12-03",
        employeePayrolls: [
          {
            id: "1",
            periodId: "1",
            employeeId: "1",
            employeeName: "Mike Johnson",
            role: "Crew Lead",
            regularHours: 80,
            overtimeHours: 0,
            totalHours: 80,
            hourlyRate: 35,
            regularPay: 2800,
            overtimePay: 0,
            grossPay: 2800,
            netPay: 2352,
            timeCards: ["tc1", "tc2"],
            status: "paid",
            paymentMethod: "direct-deposit",
            paidDate: "2025-12-03",
          },
          {
            id: "2",
            periodId: "1",
            employeeId: "2",
            employeeName: "David Martinez",
            role: "Worker",
            regularHours: 80,
            overtimeHours: 0,
            totalHours: 80,
            hourlyRate: 28,
            regularPay: 2240,
            overtimePay: 0,
            grossPay: 2240,
            netPay: 1881.6,
            timeCards: ["tc3", "tc4"],
            status: "paid",
            paymentMethod: "direct-deposit",
            paidDate: "2025-12-03",
          },
          {
            id: "3",
            periodId: "1",
            employeeId: "3",
            employeeName: "Carlos Rodriguez",
            role: "Worker",
            regularHours: 80,
            overtimeHours: 0,
            totalHours: 80,
            hourlyRate: 28,
            regularPay: 2240,
            overtimePay: 0,
            grossPay: 2240,
            netPay: 1881.6,
            timeCards: ["tc5", "tc6"],
            status: "paid",
            paymentMethod: "check",
            checkNumber: "1247",
            paidDate: "2025-12-03",
          },
          {
            id: "4",
            periodId: "1",
            employeeId: "4",
            employeeName: "James Wilson",
            role: "Helper",
            regularHours: 80,
            overtimeHours: 0,
            totalHours: 80,
            hourlyRate: 22,
            regularPay: 1760,
            overtimePay: 0,
            grossPay: 1760,
            netPay: 1478.4,
            timeCards: ["tc7", "tc8"],
            status: "paid",
            paymentMethod: "direct-deposit",
            paidDate: "2025-12-03",
          },
        ],
      },
      {
        id: "2",
        startDate: "2025-12-02",
        endDate: "2025-12-15",
        status: "processing",
        totalHours: 336,
        totalRegularHours: 326,
        totalOvertimeHours: 10,
        totalAmount: 10330,
        processedDate: "2025-12-16",
        employeePayrolls: [
          {
            id: "5",
            periodId: "2",
            employeeId: "1",
            employeeName: "Mike Johnson",
            role: "Crew Lead",
            regularHours: 84,
            overtimeHours: 4,
            totalHours: 88,
            hourlyRate: 35,
            regularPay: 2940,
            overtimePay: 210,
            grossPay: 3150,
            netPay: 2646,
            timeCards: ["tc9", "tc10"],
            status: "approved",
            paymentMethod: "direct-deposit",
          },
          {
            id: "6",
            periodId: "2",
            employeeId: "2",
            employeeName: "David Martinez",
            role: "Worker",
            regularHours: 82,
            overtimeHours: 2,
            totalHours: 84,
            hourlyRate: 28,
            regularPay: 2296,
            overtimePay: 84,
            grossPay: 2380,
            netPay: 1999.2,
            timeCards: ["tc11", "tc12"],
            status: "approved",
            paymentMethod: "direct-deposit",
          },
          {
            id: "7",
            periodId: "2",
            employeeId: "3",
            employeeName: "Carlos Rodriguez",
            role: "Worker",
            regularHours: 80,
            overtimeHours: 0,
            totalHours: 80,
            hourlyRate: 28,
            regularPay: 2240,
            overtimePay: 0,
            grossPay: 2240,
            netPay: 1881.6,
            timeCards: ["tc13", "tc14"],
            status: "approved",
            paymentMethod: "check",
          },
          {
            id: "8",
            periodId: "2",
            employeeId: "4",
            employeeName: "James Wilson",
            role: "Helper",
            regularHours: 80,
            overtimeHours: 4,
            totalHours: 84,
            hourlyRate: 22,
            regularPay: 1760,
            overtimePay: 132,
            grossPay: 1892,
            netPay: 1589.28,
            timeCards: ["tc15", "tc16"],
            status: "approved",
            paymentMethod: "direct-deposit",
          },
        ],
      },
      {
        id: "3",
        startDate: "2025-12-16",
        endDate: "2025-12-29",
        status: "draft",
        totalHours: 248,
        totalRegularHours: 248,
        totalOvertimeHours: 0,
        totalAmount: 7480,
        employeePayrolls: [
          {
            id: "9",
            periodId: "3",
            employeeId: "1",
            employeeName: "Mike Johnson",
            role: "Crew Lead",
            regularHours: 62,
            overtimeHours: 0,
            totalHours: 62,
            hourlyRate: 35,
            regularPay: 2170,
            overtimePay: 0,
            grossPay: 2170,
            netPay: 1822.8,
            timeCards: ["tc17"],
            status: "pending",
            paymentMethod: "direct-deposit",
          },
          {
            id: "10",
            periodId: "3",
            employeeId: "2",
            employeeName: "David Martinez",
            role: "Worker",
            regularHours: 62,
            overtimeHours: 0,
            totalHours: 62,
            hourlyRate: 28,
            regularPay: 1736,
            overtimePay: 0,
            grossPay: 1736,
            netPay: 1458.24,
            timeCards: ["tc18"],
            status: "pending",
            paymentMethod: "direct-deposit",
          },
          {
            id: "11",
            periodId: "3",
            employeeId: "3",
            employeeName: "Carlos Rodriguez",
            role: "Worker",
            regularHours: 62,
            overtimeHours: 0,
            totalHours: 62,
            hourlyRate: 28,
            regularPay: 1736,
            overtimePay: 0,
            grossPay: 1736,
            netPay: 1458.24,
            timeCards: ["tc19"],
            status: "pending",
            paymentMethod: "check",
          },
          {
            id: "12",
            periodId: "3",
            employeeId: "4",
            employeeName: "James Wilson",
            role: "Helper",
            regularHours: 62,
            overtimeHours: 0,
            totalHours: 62,
            hourlyRate: 22,
            regularPay: 1364,
            overtimePay: 0,
            grossPay: 1364,
            netPay: 1145.76,
            timeCards: ["tc20"],
            status: "pending",
            paymentMethod: "direct-deposit",
          },
        ],
      },
    ];
    return periods;
  }, []);

  const filteredPeriods = useMemo(() => {
    let filtered = payrollPeriods;

    if (selectedFilter !== "all") {
      filtered = filtered.filter((p) => p.status === selectedFilter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((period) =>
        period.employeePayrolls.some((emp) =>
          emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return filtered;
  }, [payrollPeriods, selectedFilter, searchQuery]);

  const stats = useMemo(() => {
    const lastPeriod = payrollPeriods.find((p) => p.status === "paid");
    const currentPeriod = payrollPeriods.find((p) => p.status === "draft");
    
    return {
      totalThisMonth: currentPeriod?.totalAmount || 0,
      lastPayroll: lastPeriod?.totalAmount || 0,
      totalEmployees: currentPeriod?.employeePayrolls.length || 0,
      totalHours: currentPeriod?.totalHours || 0,
    };
  }, [payrollPeriods]);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.restrictedContainer}>
          <AlertCircle color={Colors.light.error} size={48} />
          <Text style={styles.restrictedTitle}>Access Restricted</Text>
          <Text style={styles.restrictedText}>
            Only admins can access payroll data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleProcessPayroll = (periodId: string) => {
    Alert.alert(
      "Process Payroll",
      "Are you sure you want to process this payroll period?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Process",
          onPress: () => {
            console.log("[Payroll] Processing period:", periodId);
            Alert.alert("Success", "Payroll period processed successfully");
          },
        },
      ]
    );
  };

  const getStatusColor = (status: PayrollStatus) => {
    switch (status) {
      case "paid":
        return Colors.light.success;
      case "processing":
        return Colors.light.warning;
      case "completed":
        return Colors.light.info;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusIcon = (status: PayrollStatus) => {
    switch (status) {
      case "paid":
        return <Check color={Colors.light.success} size={16} />;
      case "processing":
        return <Clock color={Colors.light.warning} size={16} />;
      default:
        return <Calendar color={Colors.light.textSecondary} size={16} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Payroll</Text>
            <Text style={styles.headerSubtitle}>Manage employee pay & time</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowTimeCardModal(true)}
            >
              <Clock color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddEmployeeModal(true)}
            >
              <Plus color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <DollarSign color={Colors.light.primary} size={20} />
            <Text style={styles.statValue}>${stats.totalThisMonth.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Current Period</Text>
          </View>

          <View style={styles.statCard}>
            <Check color={Colors.light.success} size={20} />
            <Text style={styles.statValue}>${stats.lastPayroll.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Last Payroll</Text>
          </View>

          <View style={styles.statCard}>
            <Clock color={Colors.light.info} size={20} />
            <Text style={styles.statValue}>{stats.totalHours}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar color={Colors.light.accent} size={20} />
            <Text style={styles.statValue}>{stats.totalEmployees}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          {["all", "draft", "processing", "paid"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pay Periods</Text>
            <TouchableOpacity>
              <Download color={Colors.light.primary} size={20} />
            </TouchableOpacity>
          </View>

          {filteredPeriods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={styles.periodCard}
              activeOpacity={0.7}
            >
              <View style={styles.periodHeader}>
                <View style={styles.periodInfo}>
                  <Text style={styles.periodDate}>
                    {new Date(period.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })} - {new Date(period.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(period.status) + "20" },
                    ]}
                  >
                    {getStatusIcon(period.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(period.status) },
                      ]}
                    >
                      {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <ChevronRight color={Colors.light.textSecondary} size={20} />
              </View>

              <View style={styles.periodStats}>
                <View style={styles.periodStat}>
                  <Text style={styles.periodStatLabel}>Total Amount</Text>
                  <Text style={styles.periodStatValue}>
                    ${period.totalAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.periodStat}>
                  <Text style={styles.periodStatLabel}>Hours</Text>
                  <Text style={styles.periodStatValue}>{period.totalHours}</Text>
                </View>
                <View style={styles.periodStat}>
                  <Text style={styles.periodStatLabel}>Employees</Text>
                  <Text style={styles.periodStatValue}>
                    {period.employeePayrolls.length}
                  </Text>
                </View>
              </View>

              <View style={styles.employeeList}>
                {period.employeePayrolls.slice(0, 3).map((emp) => (
                  <View key={emp.id} style={styles.employeeItem}>
                    <Text style={styles.employeeName}>{emp.employeeName}</Text>
                    <Text style={styles.employeePay}>
                      ${emp.netPay.toLocaleString()}
                    </Text>
                  </View>
                ))}
                {period.employeePayrolls.length > 3 && (
                  <Text style={styles.moreEmployees}>
                    +{period.employeePayrolls.length - 3} more
                  </Text>
                )}
              </View>

              {period.status === "draft" && (
                <TouchableOpacity
                  style={styles.processButton}
                  onPress={() => handleProcessPayroll(period.id)}
                >
                  <Text style={styles.processButtonText}>Process Payroll</Text>
                </TouchableOpacity>
              )}

              {period.paidDate && (
                <Text style={styles.paidDate}>
                  Paid on{" "}
                  {new Date(period.paidDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setShowTimeCardModal(true)}
            >
              <Clock size={24} color={Colors.light.primary} />
              <Text style={styles.quickActionText}>Add Time Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Calculator size={24} color={Colors.light.primary} />
              <Text style={styles.quickActionText}>Calculate Taxes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Download size={24} color={Colors.light.primary} />
              <Text style={styles.quickActionText}>Export Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setShowAddEmployeeModal(true)}
            >
              <Users size={24} color={Colors.light.primary} />
              <Text style={styles.quickActionText}>Add Employee</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAddEmployeeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddEmployeeModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Employee</Text>
            <TouchableOpacity onPress={() => setShowAddEmployeeModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Employee Name *</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.name}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, name: text })}
                placeholder="John Doe"
                placeholderTextColor={Colors.light.textSecondary}
              />

              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleButtons}>
                {["Crew Lead", "Worker", "Helper"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      newEmployee.role === role && styles.roleButtonActive,
                    ]}
                    onPress={() => setNewEmployee({ ...newEmployee, role })}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        newEmployee.role === role && styles.roleButtonTextActive,
                      ]}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Hourly Rate *</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.inputField}
                  value={newEmployee.hourlyRate}
                  onChangeText={(text) => setNewEmployee({ ...newEmployee, hourlyRate: text })}
                  placeholder="25.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <Text style={styles.label}>Payment Method *</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newEmployee.paymentMethod === "direct-deposit" && styles.roleButtonActive,
                  ]}
                  onPress={() => setNewEmployee({ ...newEmployee, paymentMethod: "direct-deposit" })}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      newEmployee.paymentMethod === "direct-deposit" && styles.roleButtonTextActive,
                    ]}
                  >
                    Direct Deposit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newEmployee.paymentMethod === "check" && styles.roleButtonActive,
                  ]}
                  onPress={() => setNewEmployee({ ...newEmployee, paymentMethod: "check" })}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      newEmployee.paymentMethod === "check" && styles.roleButtonTextActive,
                    ]}
                  >
                    Check
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddEmployeeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                if (!newEmployee.name || !newEmployee.hourlyRate) {
                  Alert.alert("Missing Information", "Please fill in all required fields");
                  return;
                }
                console.log("Adding employee:", newEmployee);
                Alert.alert("Success", "Employee added to payroll system");
                setShowAddEmployeeModal(false);
                setNewEmployee({ name: "", role: "Worker", hourlyRate: "", paymentMethod: "direct-deposit" });
              }}
            >
              <Text style={styles.submitButtonText}>Add Employee</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showTimeCardModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimeCardModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Time Card</Text>
            <TouchableOpacity onPress={() => setShowTimeCardModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Employee *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeScroll}>
                {payrollPeriods[0]?.employeePayrolls.map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.employeeChip,
                      newTimeCard.employeeId === emp.employeeId && styles.employeeChipActive,
                    ]}
                    onPress={() => setNewTimeCard({ ...newTimeCard, employeeId: emp.employeeId })}
                  >
                    <Text
                      style={[
                        styles.employeeChipText,
                        newTimeCard.employeeId === emp.employeeId && styles.employeeChipTextActive,
                      ]}
                    >
                      {emp.employeeName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Date *</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.inputField}
                  value={newTimeCard.date}
                  onChangeText={(text) => setNewTimeCard({ ...newTimeCard, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <Text style={styles.label}>Regular Hours *</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.inputField}
                  value={newTimeCard.regularHours}
                  onChangeText={(text) => setNewTimeCard({ ...newTimeCard, regularHours: text })}
                  placeholder="8.0"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <Text style={styles.label}>Overtime Hours</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.inputField}
                  value={newTimeCard.overtimeHours}
                  onChangeText={(text) => setNewTimeCard({ ...newTimeCard, overtimeHours: text })}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newTimeCard.notes}
                onChangeText={(text) => setNewTimeCard({ ...newTimeCard, notes: text })}
                placeholder="Work location, tasks completed, etc."
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTimeCardModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                if (!newTimeCard.employeeId || !newTimeCard.regularHours) {
                  Alert.alert("Missing Information", "Please select an employee and enter hours");
                  return;
                }
                console.log("Adding time card:", newTimeCard);
                Alert.alert("Success", "Time card added successfully");
                setShowTimeCardModal(false);
                setNewTimeCard({
                  employeeId: "",
                  regularHours: "",
                  overtimeHours: "",
                  date: new Date().toISOString().split("T")[0],
                  notes: "",
                });
              }}
            >
              <Text style={styles.submitButtonText}>Add Time Card</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  periodCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  periodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  periodInfo: {
    flex: 1,
  },
  periodDate: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  periodStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  periodStat: {
    alignItems: "center",
  },
  periodStatLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  periodStatValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  employeeList: {
    gap: 8,
    marginBottom: 12,
  },
  employeeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  employeeName: {
    fontSize: 14,
    color: Colors.light.text,
  },
  employeePay: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  moreEmployees: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
  },
  processButton: {
    backgroundColor: Colors.light.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  processButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  paidDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  restrictedText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
    paddingTop: 20,
  },
  formSection: {
    gap: 16,
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: -8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  roleButtons: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  employeeScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  employeeChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  employeeChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  employeeChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  employeeChipTextActive: {
    color: "#fff",
  },
});
