import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
} from "lucide-react-native";

const GOALS = [
  {
    id: "profit",
    title: "Maximize Profit",
    description: "Track job costs and improve margins",
    icon: DollarSign,
    color: "#10B981",
  },
  {
    id: "scale",
    title: "Scale My Team",
    description: "Manage multiple crews efficiently",
    icon: Users,
    color: "#0066FF",
  },
  {
    id: "grow",
    title: "Grow Revenue",
    description: "Get more jobs and close faster",
    icon: TrendingUp,
    color: "#8B5CF6",
  },
  {
    id: "organize",
    title: "Get Organized",
    description: "Never miss a job or payment",
    icon: Calendar,
    color: "#F59E0B",
  },
];

export default function AdminGoalSelectionScreen() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      return;
    }
    router.push("/(tabs)" as any);
  };

  return (
    <LinearGradient colors={["#0066FF", "#004BB5"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>What are your</Text>
            <Text style={styles.title}>main goals?</Text>
            <Text style={styles.subtitle}>
              Select all that apply to customize your experience
            </Text>
          </View>

          <View style={styles.goalsContainer}>
            {GOALS.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);
              const Icon = goal.icon;

              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalCard, isSelected && styles.selectedCard]}
                  onPress={() => toggleGoal(goal.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.goalContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: `${goal.color}15` },
                      ]}
                    >
                      <Icon color={goal.color} size={28} strokeWidth={2} />
                    </View>
                    <View style={styles.goalText}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalDescription}>
                        {goal.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <CheckCircle color="#0066FF" size={24} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedGoals.length === 0 && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 12,
    lineHeight: 22,
  },
  goalsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#0066FF",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  goalContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0066FF",
  },
});
