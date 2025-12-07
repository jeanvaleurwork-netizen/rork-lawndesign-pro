import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { 
  CheckSquare, 
  Square, 
  Car, 
  Dog, 
  Key, 
  Clock, 
  MapPin,
  AlertCircle,
  CheckCircle,
  Home,
  Shield,
  Package,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: "parking" | "pets" | "access" | "preparation" | "safety";
  required: boolean;
  completed: boolean;
}

export default function PreArrivalChecklistScreen() {
  const { jobId, scheduledDate, scheduledTime } = useLocalSearchParams();
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "1",
      title: "Move Vehicles",
      description: "Please move all vehicles from the driveway and work area",
      icon: Car,
      category: "parking",
      required: true,
      completed: false,
    },
    {
      id: "2",
      title: "Secure Pets",
      description: "Please secure all pets indoors or in a safe location away from the work area",
      icon: Dog,
      category: "pets",
      required: true,
      completed: false,
    },
    {
      id: "3",
      title: "Unlock Gates/Doors",
      description: "Ensure all gates and necessary doors are unlocked for crew access",
      icon: Key,
      category: "access",
      required: true,
      completed: false,
    },
    {
      id: "4",
      title: "Clear Work Area",
      description: "Remove any outdoor furniture, decorations, or items from the work zone",
      icon: Package,
      category: "preparation",
      required: true,
      completed: false,
    },
    {
      id: "5",
      title: "Provide Parking Space",
      description: "Ensure there's parking available for crew vehicles and equipment trailer",
      icon: MapPin,
      category: "parking",
      required: true,
      completed: false,
    },
    {
      id: "6",
      title: "Power Access",
      description: "Outdoor electrical outlet should be accessible for crew equipment",
      icon: Shield,
      category: "preparation",
      required: false,
      completed: false,
    },
    {
      id: "7",
      title: "Water Access",
      description: "Outside water spigot should be accessible if needed",
      icon: Home,
      category: "preparation",
      required: false,
      completed: false,
    },
    {
      id: "8",
      title: "Remove Valuables",
      description: "Remove or secure any valuable items near the work area",
      icon: Shield,
      category: "safety",
      required: true,
      completed: false,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const uploadDocumentMutation = trpc.data.uploadCustomerDocument.useMutation();

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const allRequiredCompleted = items.filter(i => i.required).every(i => i.completed);
  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  const submitChecklist = async () => {
    if (!allRequiredCompleted) {
      Alert.alert(
        "Required Items",
        "Please complete all required checklist items before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    setSubmitting(true);
    try {
      await uploadDocumentMutation.mutateAsync({
        jobId: jobId as string,
        clientId: "current-client",
        documentUrl: "checklist://" + JSON.stringify(items),
        documentType: "checklist",
        description: "Pre-arrival checklist completed",
      });

      Alert.alert(
        "Thank You!",
        "Your pre-arrival checklist has been submitted. Our crew will arrive as scheduled.",
        [
          { 
            text: "OK", 
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit checklist. Please try again.");
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "parking": return "#3b82f6";
      case "pets": return "#f59e0b";
      case "access": return "#10b981";
      case "preparation": return "#8b5cf6";
      case "safety": return "#ef4444";
      default: return Colors.light.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Pre-Arrival Checklist",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
        }} 
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Clock size={48} color={Colors.light.primary} />
          <Text style={styles.title}>Crew Arriving Soon!</Text>
          <Text style={styles.subtitle}>
            Scheduled: {scheduledDate as string} at {scheduledTime as string}
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Checklist Progress</Text>
            <Text style={styles.progressCount}>{completedCount}/{items.length}</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          {!allRequiredCompleted && (
            <View style={styles.warningBanner}>
              <AlertCircle size={20} color="#f59e0b" />
              <Text style={styles.warningText}>
                Please complete all required items before crew arrival
              </Text>
            </View>
          )}
          {allRequiredCompleted && (
            <View style={styles.successBanner}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={styles.successText}>
                All required items completed!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.checklistSection}>
          <Text style={styles.sectionTitle}>Checklist Items</Text>
          {items.map(item => {
            const Icon = item.icon;
            const categoryColor = getCategoryColor(item.category);
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.checklistItem,
                  item.completed && styles.checklistItemCompleted,
                ]}
                onPress={() => toggleItem(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.checklistItemHeader}>
                  <View style={styles.checklistItemLeft}>
                    <View style={[styles.iconBadge, { backgroundColor: categoryColor + "20" }]}>
                      <Icon size={24} color={categoryColor} />
                    </View>
                    <View style={styles.checklistItemInfo}>
                      <View style={styles.titleRow}>
                        <Text style={[
                          styles.checklistItemTitle,
                          item.completed && styles.checklistItemTitleCompleted,
                        ]}>
                          {item.title}
                        </Text>
                        {item.required && (
                          <View style={styles.requiredBadge}>
                            <Text style={styles.requiredText}>Required</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.checklistItemDescription}>{item.description}</Text>
                    </View>
                  </View>
                  {item.completed ? (
                    <CheckSquare size={28} color={Colors.light.primary} />
                  ) : (
                    <Square size={28} color="#ccc" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why This Matters:</Text>
          <Text style={styles.infoText}>
            Completing this checklist ensures our crew can begin work immediately upon arrival, 
            maximizing efficiency and completing your project on time. It also helps keep everyone safe!
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!allRequiredCompleted || submitting) && styles.submitButtonDisabled,
          ]}
          onPress={submitChecklist}
          disabled={!allRequiredCompleted || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Checklist</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  progressSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  progressCount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    fontWeight: "500" as const,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#d1fae5",
    borderRadius: 8,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: "#065f46",
    fontWeight: "500" as const,
  },
  checklistSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  checklistItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  checklistItemCompleted: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + "10",
  },
  checklistItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  checklistItemLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistItemInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  checklistItemTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  checklistItemTitleCompleted: {
    color: Colors.light.primary,
  },
  requiredBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#991b1b",
    textTransform: "uppercase",
  },
  checklistItemDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: Colors.light.primary + "15",
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
  },
});
