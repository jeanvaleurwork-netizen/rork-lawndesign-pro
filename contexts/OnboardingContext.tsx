import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_STORAGE_KEY = "@contractoros_onboarding";

export interface OnboardingData {
  trades: string[];
  role: "admin" | "crew" | null;
  companyName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  crewMembers: {
    name: string;
    phone: string;
    email: string;
  }[];
  jobTrackingFeatures: string[];
  hasCompletedOnboarding: boolean;
}

const defaultOnboardingData: OnboardingData = {
  trades: [],
  role: null,
  companyName: "",
  businessPhone: "",
  businessEmail: "",
  businessAddress: "",
  crewMembers: [],
  jobTrackingFeatures: [],
  hasCompletedOnboarding: false,
};

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored) as OnboardingData;
        setData(parsedData);
        console.log("[Onboarding] Data loaded");
      }
    } catch (error) {
      console.error("[Onboarding] Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboardingData = async (newData: Partial<OnboardingData>) => {
    try {
      const updatedData = { ...data, ...newData };
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
      setData(updatedData);
      console.log("[Onboarding] Data saved");
    } catch (error) {
      console.error("[Onboarding] Failed to save data:", error);
      throw error;
    }
  };

  const clearOnboardingData = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      setData(defaultOnboardingData);
      console.log("[Onboarding] Data cleared");
    } catch (error) {
      console.error("[Onboarding] Failed to clear data:", error);
    }
  };

  const updateTrades = async (trades: string[]) => {
    await saveOnboardingData({ trades });
  };

  const updateRole = async (role: "admin" | "crew") => {
    await saveOnboardingData({ role });
  };

  const updateCompanyInfo = async (info: {
    companyName: string;
    businessPhone: string;
    businessEmail: string;
    businessAddress: string;
  }) => {
    await saveOnboardingData(info);
  };

  const updateCrewMembers = async (crewMembers: OnboardingData["crewMembers"]) => {
    await saveOnboardingData({ crewMembers });
  };

  const updateJobTrackingFeatures = async (features: string[]) => {
    await saveOnboardingData({ jobTrackingFeatures: features });
  };

  const completeOnboarding = async () => {
    await saveOnboardingData({ hasCompletedOnboarding: true });
  };

  return {
    data,
    isLoading,
    updateTrades,
    updateRole,
    updateCompanyInfo,
    updateCrewMembers,
    updateJobTrackingFeatures,
    completeOnboarding,
    clearOnboardingData,
  };
});
