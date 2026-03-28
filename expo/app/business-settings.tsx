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
import { Stack } from "expo-router";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Palette,
  ChevronRight,
  Globe,
  Check,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupportedLanguages } from "@/locales";
import { useTrade } from "@/contexts/TradeContext";
import { useRouter } from "expo-router";

export default function BusinessSettingsScreen() {
  const router = useRouter();
  const { t, currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const { tradeType, getTradeDisplayName } = useTrade();
  const [businessName, setBusinessName] = useState<string>("GreenPro Landscaping");
  const [email, setEmail] = useState<string>("contact@greenpro.com");
  const [phone, setPhone] = useState<string>("(512) 555-0199");
  const [address, setAddress] = useState<string>("123 Business Blvd, Austin, TX 78701");
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("settings.title"),
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.businessInfo")}</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Building2 color={Colors.light.muted} size={18} />
                <Text style={styles.labelText}>{t("settings.businessName")}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Your business name"
                placeholderTextColor={Colors.light.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Mail color={Colors.light.muted} size={18} />
                <Text style={styles.labelText}>{t("settings.email")}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="business@example.com"
                placeholderTextColor={Colors.light.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Phone color={Colors.light.muted} size={18} />
                <Text style={styles.labelText}>{t("settings.phone")}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor={Colors.light.muted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MapPin color={Colors.light.muted} size={18} />
                <Text style={styles.labelText}>{t("settings.address")}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Business address"
                placeholderTextColor={Colors.light.muted}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.teamPermissions")}</Text>

            <TouchableOpacity style={styles.settingCard}>
              <View style={styles.settingIcon}>
                <User color={Colors.light.primary} size={20} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>{t("settings.teamMembers")}</Text>
                <Text style={styles.settingDescription}>{t("settings.manageStaff")}</Text>
              </View>
              <ChevronRight color={Colors.light.muted} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.paymentBilling")}</Text>

            <TouchableOpacity style={styles.settingCard}>
              <View style={styles.settingIcon}>
                <CreditCard color={Colors.light.success} size={20} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>{t("settings.paymentSetup")}</Text>
                <Text style={styles.settingDescription}>{t("settings.paymentDesc")}</Text>
              </View>
              <ChevronRight color={Colors.light.muted} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.businessInfo")}</Text>

            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => router.push("/trade-selection")}
            >
              <View style={styles.settingIcon}>
                <Building2 color={Colors.light.accent} size={20} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Trade Type</Text>
                <Text style={styles.settingDescription}>
                  {getTradeDisplayName(tradeType)}
                </Text>
              </View>
              <ChevronRight color={Colors.light.muted} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.appSettings")}</Text>

            <TouchableOpacity style={styles.settingCard}>
              <View style={styles.settingIcon}>
                <Bell color={Colors.light.warning} size={20} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>{t("settings.notifications")}</Text>
                <Text style={styles.settingDescription}>{t("settings.notificationsDesc")}</Text>
              </View>
              <ChevronRight color={Colors.light.muted} size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingCard}>
              <View style={styles.settingIcon}>
                <Palette color={Colors.light.accent} size={20} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>{t("settings.branding")}</Text>
                <Text style={styles.settingDescription}>{t("settings.brandingDesc")}</Text>
              </View>
              <ChevronRight color={Colors.light.muted} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.settingIcon}>
                <Globe color={Colors.light.primary} size={20} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>{t("settings.language")}</Text>
                <Text style={styles.settingDescription}>{t(`languages.${currentLanguage}`)}</Text>
              </View>
              <ChevronRight color={Colors.light.muted} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.subscription")}</Text>

            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <Text style={styles.subscriptionPlan}>{t("settings.proPlan")}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>{t("settings.active")}</Text>
                </View>
              </View>
              <Text style={styles.subscriptionPrice}>{t("settings.price")}</Text>
              <Text style={styles.subscriptionDescription}>
                {t("settings.planDesc")}
              </Text>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>{t("settings.upgrade")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{t("settings.saveChanges")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings.language")}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList}>
              {supportedLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageItem,
                    currentLanguage === lang && styles.languageItemActive,
                  ]}
                  onPress={() => {
                    changeLanguage(lang as SupportedLanguages);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={styles.languageName}>{t(`languages.${lang}`)}</Text>
                  {currentLanguage === lang && (
                    <Check color={Colors.light.primary} size={20} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  subscriptionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subscriptionPlan: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  activeBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.success,
  },
  subscriptionPrice: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: Colors.light.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  modalClose: {
    fontSize: 28,
    color: Colors.light.muted,
    fontWeight: "300" as const,
  },
  languageList: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageItemActive: {
    backgroundColor: Colors.light.background,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  languageName: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
});
