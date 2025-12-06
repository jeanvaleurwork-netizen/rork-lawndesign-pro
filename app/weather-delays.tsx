import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from "react-native";
import { router, Stack } from "expo-router";
import { ChevronLeft, Plus, CloudRain, CloudSnow, Wind, Sun, CloudLightning, Thermometer, AlertTriangle, Calendar, DollarSign, Clock } from "lucide-react-native";
import Colors from "@/constants/colors";
import { WeatherDelay, WeatherCondition } from "@/types";

const weatherIcons: Record<WeatherCondition, any> = {
  sunny: Sun,
  rainy: CloudRain,
  stormy: CloudLightning,
  snow: CloudSnow,
  windy: Wind,
  "extreme-heat": Thermometer,
  "extreme-cold": Thermometer,
};

const weatherColors: Record<WeatherCondition, string> = {
  sunny: "#F59E0B",
  rainy: "#3B82F6",
  stormy: "#8B5CF6",
  snow: "#60A5FA",
  windy: "#10B981",
  "extreme-heat": "#EF4444",
  "extreme-cold": "#06B6D4",
};

export default function WeatherDelaysScreen() {
  const [delays, setDelays] = useState<WeatherDelay[]>([
    {
      id: "1",
      jobId: "2",
      date: "2025-11-27",
      condition: "rainy",
      description: "Heavy rain prevented outdoor work",
      hoursLost: 6,
      costImpact: 1200,
      clientNotified: true,
      rescheduleDate: "2025-11-28",
    },
    {
      id: "2",
      jobId: "5",
      date: "2025-11-25",
      condition: "extreme-heat",
      description: "Heat advisory - unsafe working conditions",
      hoursLost: 4,
      costImpact: 800,
      clientNotified: true,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<WeatherCondition>("rainy");

  const totalHoursLost = delays.reduce((sum, d) => sum + d.hoursLost, 0);
  const totalCostImpact = delays.reduce((sum, d) => sum + d.costImpact, 0);
  const activeDelays = delays.filter((d) => !d.rescheduleDate).length;

  const conditions: WeatherCondition[] = ["rainy", "stormy", "snow", "windy", "extreme-heat", "extreme-cold"];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Weather Delays",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <AlertTriangle color={Colors.light.warning} size={20} />
          </View>
          <Text style={styles.statValue}>{activeDelays}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Clock color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>{totalHoursLost}h</Text>
          <Text style={styles.statLabel}>Hours Lost</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <DollarSign color={Colors.light.error} size={20} />
          </View>
          <Text style={styles.statValue}>${(totalCostImpact / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Cost Impact</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delays This Month</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {delays.map((delay) => {
            const WeatherIcon = weatherIcons[delay.condition];
            return (
              <View key={delay.id} style={styles.delayCard}>
                <View style={styles.delayHeader}>
                  <View style={[styles.weatherIconContainer, { backgroundColor: weatherColors[delay.condition] + "20" }]}>
                    <WeatherIcon color={weatherColors[delay.condition]} size={24} />
                  </View>
                  <View style={styles.delayHeaderText}>
                    <Text style={styles.delayTitle}>{delay.condition.replace("-", " ").toUpperCase()}</Text>
                    <Text style={styles.delayDate}>{new Date(delay.date).toLocaleDateString()}</Text>
                  </View>
                  {!delay.rescheduleDate && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.delayDescription}>{delay.description}</Text>

                <View style={styles.delayStats}>
                  <View style={styles.delayStat}>
                    <Clock color={Colors.light.muted} size={16} />
                    <Text style={styles.delayStatText}>{delay.hoursLost} hours lost</Text>
                  </View>
                  <View style={styles.delayStat}>
                    <DollarSign color={Colors.light.muted} size={16} />
                    <Text style={styles.delayStatText}>${delay.costImpact.toLocaleString()}</Text>
                  </View>
                </View>

                {delay.rescheduleDate && (
                  <View style={styles.rescheduleInfo}>
                    <Calendar color={Colors.light.success} size={16} />
                    <Text style={styles.rescheduleText}>
                      Rescheduled: {new Date(delay.rescheduleDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <View style={styles.notificationStatus}>
                  {delay.clientNotified ? (
                    <Text style={styles.notifiedText}>✓ Client Notified</Text>
                  ) : (
                    <Text style={styles.notNotifiedText}>✗ Client Not Notified</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Weather Delay</Text>

            <Text style={styles.label}>Weather Condition</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conditionsScroll}>
              {conditions.map((condition) => {
                const ConditionIcon = weatherIcons[condition];
                const isSelected = selectedCondition === condition;
                return (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.conditionOption,
                      isSelected && { backgroundColor: weatherColors[condition] + "20", borderColor: weatherColors[condition] },
                    ]}
                    onPress={() => setSelectedCondition(condition)}
                  >
                    <ConditionIcon color={weatherColors[condition]} size={24} />
                    <Text style={[styles.conditionText, isSelected && { color: weatherColors[condition] }]}>
                      {condition.replace("-", " ")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={3} placeholder="Describe the weather conditions..." />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Hours Lost</Text>
                <TextInput style={styles.input} placeholder="0" keyboardType="numeric" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Cost Impact</Text>
                <TextInput style={styles.input} placeholder="$0" keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => setShowModal(false)}>
                <Text style={styles.saveButtonText}>Save Delay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: Colors.light.background,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  delayCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  delayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  weatherIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  delayHeaderText: {
    flex: 1,
  },
  delayTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  delayDate: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  activeBadge: {
    backgroundColor: Colors.light.warning + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.warning,
  },
  delayDescription: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  delayStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  delayStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  delayStatText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  rescheduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginBottom: 8,
  },
  rescheduleText: {
    fontSize: 13,
    color: Colors.light.success,
    fontWeight: "500" as const,
  },
  notificationStatus: {
    marginTop: 8,
  },
  notifiedText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: "500" as const,
  },
  notNotifiedText: {
    fontSize: 12,
    color: Colors.light.error,
    fontWeight: "500" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  conditionsScroll: {
    marginBottom: 20,
  },
  conditionOption: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: 12,
    minWidth: 90,
  },
  conditionText: {
    fontSize: 11,
    color: Colors.light.text,
    marginTop: 6,
    textTransform: "capitalize",
    textAlign: "center",
  },
  textArea: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  inputHalf: {
    flex: 1,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
