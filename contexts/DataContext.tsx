import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Job, Estimate, Client } from "@/types";
import { mockJobs } from "@/mocks/jobs";
import { mockEstimates } from "@/mocks/estimates";
import { mockClients } from "@/mocks/clients";

const STORAGE_KEYS = {
  JOBS: "@contractoros_jobs",
  ESTIMATES: "@contractoros_estimates",
  CLIENTS: "@contractoros_clients",
};

export const [DataProvider, useData] = createContextHook(() => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [jobsData, estimatesData, clientsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.JOBS),
        AsyncStorage.getItem(STORAGE_KEYS.ESTIMATES),
        AsyncStorage.getItem(STORAGE_KEYS.CLIENTS),
      ]);

      if (jobsData) {
        setJobs(JSON.parse(jobsData));
      } else {
        setJobs(mockJobs);
        await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(mockJobs));
      }

      if (estimatesData) {
        setEstimates(JSON.parse(estimatesData));
      } else {
        setEstimates(mockEstimates);
        await AsyncStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(mockEstimates));
      }

      if (clientsData) {
        setClients(JSON.parse(clientsData));
      } else {
        setClients(mockClients);
        await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(mockClients));
      }

      const syncTimeData = await AsyncStorage.getItem("@contractoros_last_sync");
      if (syncTimeData) {
        setLastSync(new Date(syncTimeData));
      }
    } catch (error) {
      console.error("[Data] Failed to load data:", error);
      setJobs(mockJobs);
      setEstimates(mockEstimates);
      setClients(mockClients);
    } finally {
      setIsLoading(false);
    }
  };

  const syncData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs)),
        AsyncStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(estimates)),
        AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients)),
      ]);
      
      const now = new Date();
      await AsyncStorage.setItem("@contractoros_last_sync", now.toISOString());
      setLastSync(now);
      
      console.log("[Data] Sync completed successfully");
    } catch (error) {
      console.error("[Data] Sync failed:", error);
      throw error;
    }
  };

  const addJob = async (job: Job) => {
    const updatedJobs = [...jobs, job];
    setJobs(updatedJobs);
    await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updatedJobs));
  };

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    const updatedJobs = jobs.map((job) =>
      job.id === jobId ? { ...job, ...updates } : job
    );
    setJobs(updatedJobs);
    await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updatedJobs));
  };

  const deleteJob = async (jobId: string) => {
    const updatedJobs = jobs.filter((job) => job.id !== jobId);
    setJobs(updatedJobs);
    await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updatedJobs));
  };

  const addEstimate = async (estimate: Estimate) => {
    const updatedEstimates = [...estimates, estimate];
    setEstimates(updatedEstimates);
    await AsyncStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(updatedEstimates));
  };

  const updateEstimate = async (estimateId: string, updates: Partial<Estimate>) => {
    const updatedEstimates = estimates.map((estimate) =>
      estimate.id === estimateId ? { ...estimate, ...updates } : estimate
    );
    setEstimates(updatedEstimates);
    await AsyncStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(updatedEstimates));
  };

  const deleteEstimate = async (estimateId: string) => {
    const updatedEstimates = estimates.filter((estimate) => estimate.id !== estimateId);
    setEstimates(updatedEstimates);
    await AsyncStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(updatedEstimates));
  };

  const addClient = async (client: Client) => {
    const updatedClients = [...clients, client];
    setClients(updatedClients);
    await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updatedClients));
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    const updatedClients = clients.map((client) =>
      client.id === clientId ? { ...client, ...updates } : client
    );
    setClients(updatedClients);
    await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updatedClients));
  };

  const deleteClient = async (clientId: string) => {
    const updatedClients = clients.filter((client) => client.id !== clientId);
    setClients(updatedClients);
    await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updatedClients));
  };

  const refreshData = async () => {
    await loadAllData();
  };

  return {
    jobs,
    estimates,
    clients,
    isLoading,
    lastSync,
    addJob,
    updateJob,
    deleteJob,
    addEstimate,
    updateEstimate,
    deleteEstimate,
    addClient,
    updateClient,
    deleteClient,
    syncData,
    refreshData,
  };
});
