import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Alert } from "react-native";

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

export const [CrewProvider, useCrew] = createContextHook(() => {
  const [localCrew, setLocalCrew] = useState<CrewMember[]>([]);

  const {
    data: crewData,
    isLoading,
    isError,
    refetch,
  } = trpc.crew.getCrewList.useQuery(undefined);

  useEffect(() => {
    if (crewData) {
      console.log("[CrewContext] Loaded crew members:", crewData.length);
      setLocalCrew(crewData);
    }
  }, [crewData]);

  useEffect(() => {
    if (isError) {
      console.error("[CrewContext] Failed to load crew");
    }
  }, [isError]);

  const utils = trpc.useUtils();

  const createMutation = trpc.crew.createCrew.useMutation({
    onSuccess: (newMember) => {
      console.log("[CrewContext] Created crew member:", newMember.id);
      utils.crew.getCrewList.invalidate();
      setLocalCrew((prev) => [...prev, newMember]);
    },
    onError: (error) => {
      console.error("[CrewContext] Failed to create crew member:", error);
      Alert.alert("Error", "Failed to create crew member. Please try again.");
    },
  });

  const updateMutation = trpc.crew.updateCrew.useMutation({
    onSuccess: (updatedMember) => {
      console.log("[CrewContext] Updated crew member:", updatedMember.id);
      utils.crew.getCrewList.invalidate();
      setLocalCrew((prev) =>
        prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
      );
    },
    onError: (error) => {
      console.error("[CrewContext] Failed to update crew member:", error);
      Alert.alert("Error", "Failed to update crew member. Please try again.");
    },
  });

  const deleteMutation = trpc.crew.deleteCrew.useMutation({
    onSuccess: (result) => {
      console.log("[CrewContext] Deleted crew member:", result.id);
      utils.crew.getCrewList.invalidate();
      setLocalCrew((prev) => prev.filter((m) => m.id !== result.id));
    },
    onError: (error) => {
      console.error("[CrewContext] Failed to delete crew member:", error);
      Alert.alert("Error", "Failed to delete crew member. Please try again.");
    },
  });

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
      return createMutation.mutateAsync({
        companyId: "default",
        name: data.name,
        title: data.title,
        role: data.role,
        phone: data.phone,
        email: data.email,
        skills: data.skills || [],
        certifications: data.certifications || [],
        hourlyRate: data.hourlyRate || 0,
      });
    },
    [createMutation]
  );

  const updateCrewMember = useCallback(
    async (id: string, updates: Partial<CrewMember>) => {
      return updateMutation.mutateAsync({ id, ...updates });
    },
    [updateMutation]
  );

  const deleteCrewMember = useCallback(
    async (id: string) => {
      return deleteMutation.mutateAsync({ id });
    },
    [deleteMutation]
  );

  const crew = crewData || localCrew;

  return {
    crew,
    isLoading,
    isError,
    createCrewMember,
    updateCrewMember,
    deleteCrewMember,
    refetch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
});
