import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CrewMember {
  id: string;
  companyId: string;
  name: string;
  title: string;
  role: "lead" | "worker" | "specialist";
  availability: "available" | "busy" | "off";
  phone?: string;
  email?: string;
  skills: string[];
  certifications: string[];
  performanceRating: number;
  jobsCompleted: number;
  avgRating: number;
  joinedDate: string;
  hourlyRate: number;
  hoursThisWeek: number;
  createdAt: string;
  updatedAt: string;
}

const CREW_STORAGE_KEY = "@crew_members_v1";

export const [CrewProvider, useCrew] = createContextHook(() => {
  console.log("[CrewContext] Initializing crew context with local storage");
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCrew();
  }, []);

  const loadCrew = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(CREW_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("[CrewContext] Loaded crew from storage:", parsed.length, "members");
        setCrew(parsed);
      } else {
        console.log("[CrewContext] No stored crew found, starting fresh");
      }
    } catch (error) {
      console.error("[CrewContext] Error loading crew:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCrew = async (updatedCrew: CrewMember[]) => {
    try {
      await AsyncStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(updatedCrew));
      console.log("[CrewContext] Saved crew to storage:", updatedCrew.length, "members");
    } catch (error) {
      console.error("[CrewContext] Error saving crew:", error);
    }
  };

  const createCrewMember = useCallback(
    async (data: {
      name: string;
      title: string;
      role: CrewMember["role"];
      phone?: string;
      email?: string;
      skills?: string[];
      certifications?: string[];
      hourlyRate?: number;
    }) => {
      try {
        setIsCreating(true);
        const now = new Date().toISOString();
        const newMember: CrewMember = {
          id: `crew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          companyId: "default",
          name: data.name,
          title: data.title,
          role: data.role,
          availability: "available",
          phone: data.phone,
          email: data.email,
          skills: data.skills || [],
          certifications: data.certifications || [],
          performanceRating: 0,
          jobsCompleted: 0,
          avgRating: 0,
          joinedDate: now,
          hourlyRate: data.hourlyRate || 0,
          hoursThisWeek: 0,
          createdAt: now,
          updatedAt: now,
        };
        
        const updatedCrew = [...crew, newMember];
        setCrew(updatedCrew);
        await saveCrew(updatedCrew);
        console.log("[CrewContext] Created crew member:", newMember.id);
        return newMember;
      } catch (error) {
        console.error("[CrewContext] Error creating crew member:", error);
        Alert.alert("Error", "Failed to create crew member. Please try again.");
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [crew]
  );

  const updateCrewMember = useCallback(
    async (id: string, updates: Partial<CrewMember>) => {
      try {
        setIsUpdating(true);
        const updatedCrew = crew.map((m) =>
          m.id === id
            ? { ...m, ...updates, updatedAt: new Date().toISOString() }
            : m
        );
        setCrew(updatedCrew);
        await saveCrew(updatedCrew);
        console.log("[CrewContext] Updated crew member:", id);
        return updatedCrew.find((m) => m.id === id)!;
      } catch (error) {
        console.error("[CrewContext] Error updating crew member:", error);
        Alert.alert("Error", "Failed to update crew member. Please try again.");
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [crew]
  );

  const deleteCrewMember = useCallback(
    async (id: string) => {
      try {
        setIsDeleting(true);
        const updatedCrew = crew.filter((m) => m.id !== id);
        setCrew(updatedCrew);
        await saveCrew(updatedCrew);
        console.log("[CrewContext] Deleted crew member:", id);
      } catch (error) {
        console.error("[CrewContext] Error deleting crew member:", error);
        Alert.alert("Error", "Failed to delete crew member. Please try again.");
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [crew]
  );

  return {
    crew,
    isLoading,
    isError: false,
    createCrewMember,
    updateCrewMember,
    deleteCrewMember,
    refetch: loadCrew,
    isCreating,
    isUpdating,
    isDeleting,
  };
});
