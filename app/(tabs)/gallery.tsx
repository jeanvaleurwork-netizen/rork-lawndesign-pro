import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Modal,
} from "react-native";
import { Plus, MapPin, Calendar, ArrowRight, X, Eye, Ruler, Sparkles } from "lucide-react-native";

import Colors from "@/constants/colors";
import { mockDesigns } from "@/mocks/designs";
import { mockTemplates } from "@/mocks/templates";

const { width } = Dimensions.get("window");
const imageWidth = (width - 52) / 2;

export default function GalleryScreen() {
  const [selectedDesign, setSelectedDesign] = useState<typeof mockDesigns[0] | null>(null);
  const [selectedTab, setSelectedTab] = useState<"completed" | "templates" | "yours">("completed");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Project Gallery</Text>
          <Text style={styles.subtitle}>Portfolio & design inspiration</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Sparkles color={Colors.light.primary} size={18} />
            </View>
            <Text style={styles.statValue}>{mockDesigns.length}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}>
              <Ruler color={Colors.light.success} size={18} />
            </View>
            <Text style={styles.statValue}>
              {Math.round(mockDesigns.reduce((sum, d) => sum + d.squareFootage, 0) / 1000)}K
            </Text>
            <Text style={styles.statLabel}>Sq Ft Done</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
              <Eye color={Colors.light.warning} size={18} />
            </View>
            <Text style={styles.statValue}>{mockTemplates.length}</Text>
            <Text style={styles.statLabel}>Templates</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "completed" && styles.tabActive]}
            onPress={() => setSelectedTab("completed")}
          >
            <Text style={[styles.tabText, selectedTab === "completed" && styles.tabTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "templates" && styles.tabActive]}
            onPress={() => setSelectedTab("templates")}
          >
            <Text style={[styles.tabText, selectedTab === "templates" && styles.tabTextActive]}>
              Templates
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "yours" && styles.tabActive]}
            onPress={() => setSelectedTab("yours")}
          >
            <Text style={[styles.tabText, selectedTab === "yours" && styles.tabTextActive]}>
              Your Designs
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === "templates" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Design Templates</Text>
            <Text style={styles.sectionSubtitle}>
              Perfect templates for your property size
            </Text>

            {mockTemplates.map((template) => (
            <TouchableOpacity key={template.id} style={styles.templateCard}>
              <Image
                source={{ uri: template.previewImage }}
                style={styles.templateImage}
                resizeMode="cover"
              />
              <View style={styles.templateInfo}>
                <Text style={styles.templateTitle}>{template.style}</Text>
                <Text style={styles.templateSubtitle}>{template.subtitle}</Text>
                <View style={styles.priceRange}>
                  <Text style={styles.priceText}>
                    ${template.priceRangeMin.toLocaleString()} - $
                    {template.priceRangeMax.toLocaleString()}
                  </Text>
                </View>
              </View>
              <ArrowRight color={Colors.light.muted} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedTab === "completed" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Projects</Text>
            <Text style={styles.sectionSubtitle}>
              Browse completed projects for inspiration
            </Text>

            <View style={styles.grid}>
              {mockDesigns.map((design) => (
                <TouchableOpacity 
                  key={design.id} 
                  style={styles.gridItem}
                  onPress={() => setSelectedDesign(design)}
                >
                <Image
                  source={{ uri: design.imageUrl }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridTitle} numberOfLines={2}>
                    {design.title}
                  </Text>
                  <View style={styles.gridFooter}>
                    <MapPin color="#FFF" size={12} />
                    <Text style={styles.gridLocation}>{design.location}</Text>
                  </View>
                  <View style={styles.gridFooter}>
                    <Text style={styles.gridSize}>{design.squareFootage} sq ft</Text>
                  </View>
                </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedTab === "yours" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Designs</Text>
            <Text style={styles.sectionSubtitle}>Saved and in-progress projects</Text>

            <TouchableOpacity style={styles.userDesignCard}>
            <Image
              source={{ uri: mockDesigns[0].imageUrl }}
              style={styles.userDesignImage}
              resizeMode="cover"
            />
            <View style={styles.userDesignInfo}>
              <Text style={styles.userDesignTitle}>Smith Backyard</Text>
              <Text style={styles.userDesignSubtitle}>Created Jan 24 — Medium Yard</Text>
              <View style={styles.designStats}>
                <Calendar color={Colors.light.muted} size={14} />
                <Text style={styles.designStatsText}>2,500 sq ft</Text>
              </View>
            </View>
            <ArrowRight color={Colors.light.muted} size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.userDesignCard}>
            <Image
              source={{ uri: mockDesigns[1].imageUrl }}
              style={styles.userDesignImage}
              resizeMode="cover"
            />
            <View style={styles.userDesignInfo}>
              <Text style={styles.userDesignTitle}>Johnson Property</Text>
              <Text style={styles.userDesignSubtitle}>Created Feb 10 — Large Estate</Text>
              <View style={styles.designStats}>
                <Calendar color={Colors.light.muted} size={14} />
                <Text style={styles.designStatsText}>4,200 sq ft</Text>
              </View>
            </View>
              <ArrowRight color={Colors.light.muted} size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.newDesignButton}>
              <Plus color={Colors.light.primary} size={24} />
              <Text style={styles.newDesignText}>Start New Design</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={selectedDesign !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDesign(null)}
      >
        {selectedDesign && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Project Details</Text>
              <TouchableOpacity onPress={() => setSelectedDesign(null)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Image
                source={{ uri: selectedDesign.imageUrl }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              {selectedDesign.beforeImageUrl && (
                <View style={styles.beforeAfterContainer}>
                  <Text style={styles.beforeAfterLabel}>Before</Text>
                  <Image
                    source={{ uri: selectedDesign.beforeImageUrl }}
                    style={styles.beforeAfterImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              <View style={styles.modalContent}>
                <Text style={styles.modalProjectTitle}>{selectedDesign.title}</Text>
                <Text style={styles.modalDescription}>{selectedDesign.description}</Text>

                <View style={styles.modalInfoRow}>
                  <View style={styles.modalInfoItem}>
                    <MapPin color={Colors.light.muted} size={16} />
                    <Text style={styles.modalInfoText}>{selectedDesign.location}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ruler color={Colors.light.muted} size={16} />
                    <Text style={styles.modalInfoText}>
                      {selectedDesign.squareFootage.toLocaleString()} sq ft
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Calendar color={Colors.light.muted} size={16} />
                    <Text style={styles.modalInfoText}>
                      {new Date(selectedDesign.completionDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.itemsTitle}>Project Details</Text>
                {selectedDesign.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemDot} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );

  function getCategoryColor(category: string) {
    switch (category) {
      case "plant":
        return "#D1FAE5";
      case "material":
        return "#FEF3C7";
      case "labor":
        return "#EBF5FF";
      case "equipment":
        return "#E0E7FF";
      default:
        return Colors.light.border;
    }
  }
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
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  templateCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: "row",
    overflow: "hidden",
  },
  templateImage: {
    width: 100,
    height: 100,
  },
  templateInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  templateSubtitle: {
    fontSize: 12,
    color: Colors.light.muted,
    marginBottom: 8,
  },
  priceRange: {
    flexDirection: "row",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    gap: 12,
  },
  gridItem: {
    width: imageWidth,
    height: imageWidth * 1.2,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
    marginBottom: 4,
  },
  gridFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  gridLocation: {
    fontSize: 11,
    color: "#FFF",
    opacity: 0.9,
  },
  gridSize: {
    fontSize: 11,
    color: "#FFF",
    opacity: 0.9,
  },
  userDesignCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  userDesignImage: {
    width: 80,
    height: 80,
  },
  userDesignInfo: {
    flex: 1,
    padding: 12,
  },
  userDesignTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  userDesignSubtitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 6,
  },
  designStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  designStatsText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EBF5FF",
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
    textAlign: "center",
    fontWeight: "500" as const,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.muted,
  },
  tabTextActive: {
    color: "#FFF",
  },
  newDesignButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    gap: 8,
  },
  newDesignText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 300,
  },
  beforeAfterContainer: {
    padding: 20,
  },
  beforeAfterLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  beforeAfterImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  modalContent: {
    padding: 20,
  },
  modalProjectTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.light.muted,
    lineHeight: 24,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  modalInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalInfoText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 20,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textTransform: "capitalize" as const,
  },
});
