import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TradeType } from "@/types";
import { useAuth } from "./AuthContext";

const TRADE_STORAGE_KEY = "@contractoros_trade_settings";

export interface TradeConfig {
  tradeType: TradeType;
  specialties: string[];
  customServices: string[];
}

export const [TradeProvider, useTrade] = createContextHook(() => {
  const { organization } = useAuth();
  const [tradeConfig, setTradeConfig] = useState<TradeConfig>({
    tradeType: "general_contractor",
    specialties: [],
    customServices: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (organization?.id) {
      loadTradeConfig();
    }
  }, [organization?.id]);

  const loadTradeConfig = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(
        `${TRADE_STORAGE_KEY}_${organization?.id}`
      );
      
      if (stored) {
        const parsed = JSON.parse(stored) as TradeConfig;
        setTradeConfig(parsed);
        console.log("[Trade] Config loaded:", parsed.tradeType);
      } else if (organization?.tradeType) {
        const config: TradeConfig = {
          tradeType: organization.tradeType,
          specialties: organization.tradeSpecialties || [],
          customServices: [],
        };
        setTradeConfig(config);
        await AsyncStorage.setItem(
          `${TRADE_STORAGE_KEY}_${organization?.id}`,
          JSON.stringify(config)
        );
      }
    } catch (error) {
      console.error("[Trade] Failed to load config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTradeConfig = async (updates: Partial<TradeConfig>) => {
    try {
      const updated = { ...tradeConfig, ...updates };
      setTradeConfig(updated);
      await AsyncStorage.setItem(
        `${TRADE_STORAGE_KEY}_${organization?.id}`,
        JSON.stringify(updated)
      );
      console.log("[Trade] Config updated:", updated.tradeType);
    } catch (error) {
      console.error("[Trade] Failed to update config:", error);
      throw error;
    }
  };

  const setTradeType = async (tradeType: TradeType) => {
    await updateTradeConfig({ tradeType });
  };

  const addSpecialty = async (specialty: string) => {
    const specialties = [...tradeConfig.specialties, specialty];
    await updateTradeConfig({ specialties });
  };

  const removeSpecialty = async (specialty: string) => {
    const specialties = tradeConfig.specialties.filter((s) => s !== specialty);
    await updateTradeConfig({ specialties });
  };

  const getTradeDisplayName = (trade: TradeType): string => {
    const names: Record<TradeType, string> = {
      landscaping: "Landscaping",
      roofing: "Roofing",
      siding: "Siding",
      painting: "Painting",
      hvac: "HVAC",
      plumbing: "Plumbing",
      electrical: "Electrical",
      tree_service: "Tree Service",
      pool_service: "Pool Service",
      pressure_washing: "Pressure Washing",
      renovation: "Renovation",
      general_contractor: "General Contractor",
    };
    return names[trade] || trade;
  };

  return {
    tradeConfig,
    tradeType: tradeConfig.tradeType,
    specialties: tradeConfig.specialties,
    isLoading,
    setTradeType,
    updateTradeConfig,
    addSpecialty,
    removeSpecialty,
    getTradeDisplayName,
  };
});
