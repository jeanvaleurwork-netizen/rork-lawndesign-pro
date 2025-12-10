import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Job, Estimate, Client, Contract, CommercialProperty, EquipmentAsset, MaintenanceContract } from "@/types";
import { mockJobs } from "@/mocks/jobs";
import { mockEstimates } from "@/mocks/estimates";
import { mockClients } from "@/mocks/clients";

const STORAGE_KEYS = {
  JOBS: "@contractoros_jobs",
  ESTIMATES: "@contractoros_estimates",
  CLIENTS: "@contractoros_clients",
  CONTRACTS: "@contractoros_contracts",
  COMMERCIAL_PROPERTIES: "@contractoros_commercial_properties",
  EQUIPMENT_ASSETS: "@contractoros_equipment_assets",
  MAINTENANCE_CONTRACTS: "@contractoros_maintenance_contracts",
};

export const [DataProvider, useData] = createContextHook(() => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [commercialProperties, setCommercialProperties] = useState<CommercialProperty[]>([]);
  const [equipmentAssets, setEquipmentAssets] = useState<EquipmentAsset[]>([]);
  const [maintenanceContracts, setMaintenanceContracts] = useState<MaintenanceContract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [
        jobsData,
        estimatesData,
        clientsData,
        contractsData,
        commercialPropertiesData,
        equipmentAssetsData,
        maintenanceContractsData,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.JOBS),
        AsyncStorage.getItem(STORAGE_KEYS.ESTIMATES),
        AsyncStorage.getItem(STORAGE_KEYS.CLIENTS),
        AsyncStorage.getItem(STORAGE_KEYS.CONTRACTS),
        AsyncStorage.getItem(STORAGE_KEYS.COMMERCIAL_PROPERTIES),
        AsyncStorage.getItem(STORAGE_KEYS.EQUIPMENT_ASSETS),
        AsyncStorage.getItem(STORAGE_KEYS.MAINTENANCE_CONTRACTS),
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

      if (contractsData) {
        setContracts(JSON.parse(contractsData));
      } else {
        setContracts([]);
      }

      if (commercialPropertiesData) {
        setCommercialProperties(JSON.parse(commercialPropertiesData));
      } else {
        setCommercialProperties([]);
      }

      if (equipmentAssetsData) {
        setEquipmentAssets(JSON.parse(equipmentAssetsData));
      } else {
        setEquipmentAssets([]);
      }

      if (maintenanceContractsData) {
        setMaintenanceContracts(JSON.parse(maintenanceContractsData));
      } else {
        setMaintenanceContracts([]);
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
      setContracts([]);
      setCommercialProperties([]);
      setEquipmentAssets([]);
      setMaintenanceContracts([]);
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
        AsyncStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts)),
        AsyncStorage.setItem(STORAGE_KEYS.COMMERCIAL_PROPERTIES, JSON.stringify(commercialProperties)),
        AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT_ASSETS, JSON.stringify(equipmentAssets)),
        AsyncStorage.setItem(STORAGE_KEYS.MAINTENANCE_CONTRACTS, JSON.stringify(maintenanceContracts)),
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

  const addContract = async (contract: Contract) => {
    const updatedContracts = [...contracts, contract];
    setContracts(updatedContracts);
    await AsyncStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updatedContracts));
  };

  const updateContract = async (contractId: string, updates: Partial<Contract>) => {
    const updatedContracts = contracts.map((contract) =>
      contract.id === contractId ? { ...contract, ...updates } : contract
    );
    setContracts(updatedContracts);
    await AsyncStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updatedContracts));
  };

  const deleteContract = async (contractId: string) => {
    const updatedContracts = contracts.filter((contract) => contract.id !== contractId);
    setContracts(updatedContracts);
    await AsyncStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updatedContracts));
  };

  const refreshData = async () => {
    await loadAllData();
  };

  const addCommercialProperty = async (property: CommercialProperty) => {
    const updated = [...commercialProperties, property];
    setCommercialProperties(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.COMMERCIAL_PROPERTIES, JSON.stringify(updated));
  };

  const updateCommercialProperty = async (propertyId: string, updates: Partial<CommercialProperty>) => {
    const updated = commercialProperties.map((p) =>
      p.id === propertyId ? { ...p, ...updates } : p
    );
    setCommercialProperties(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.COMMERCIAL_PROPERTIES, JSON.stringify(updated));
  };

  const deleteCommercialProperty = async (propertyId: string) => {
    const updated = commercialProperties.filter((p) => p.id !== propertyId);
    setCommercialProperties(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.COMMERCIAL_PROPERTIES, JSON.stringify(updated));
    
    const updatedAssets = equipmentAssets.filter((a) => a.propertyId !== propertyId);
    setEquipmentAssets(updatedAssets);
    await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT_ASSETS, JSON.stringify(updatedAssets));
    
    const updatedContracts = maintenanceContracts.filter((c) => c.propertyId !== propertyId);
    setMaintenanceContracts(updatedContracts);
    await AsyncStorage.setItem(STORAGE_KEYS.MAINTENANCE_CONTRACTS, JSON.stringify(updatedContracts));
  };

  const addEquipmentAsset = async (asset: EquipmentAsset) => {
    const updated = [...equipmentAssets, asset];
    setEquipmentAssets(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT_ASSETS, JSON.stringify(updated));
  };

  const updateEquipmentAsset = async (assetId: string, updates: Partial<EquipmentAsset>) => {
    const updated = equipmentAssets.map((a) =>
      a.id === assetId ? { ...a, ...updates } : a
    );
    setEquipmentAssets(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT_ASSETS, JSON.stringify(updated));
  };

  const deleteEquipmentAsset = async (assetId: string) => {
    const updated = equipmentAssets.filter((a) => a.id !== assetId);
    setEquipmentAssets(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT_ASSETS, JSON.stringify(updated));
  };

  const addMaintenanceContract = async (contract: MaintenanceContract) => {
    const updated = [...maintenanceContracts, contract];
    setMaintenanceContracts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.MAINTENANCE_CONTRACTS, JSON.stringify(updated));
  };

  const updateMaintenanceContract = async (contractId: string, updates: Partial<MaintenanceContract>) => {
    const updated = maintenanceContracts.map((c) =>
      c.id === contractId ? { ...c, ...updates } : c
    );
    setMaintenanceContracts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.MAINTENANCE_CONTRACTS, JSON.stringify(updated));
  };

  const deleteMaintenanceContract = async (contractId: string) => {
    const updated = maintenanceContracts.filter((c) => c.id !== contractId);
    setMaintenanceContracts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.MAINTENANCE_CONTRACTS, JSON.stringify(updated));
  };

  return {
    jobs,
    estimates,
    clients,
    contracts,
    commercialProperties,
    equipmentAssets,
    maintenanceContracts,
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
    addContract,
    updateContract,
    deleteContract,
    addCommercialProperty,
    updateCommercialProperty,
    deleteCommercialProperty,
    addEquipmentAsset,
    updateEquipmentAsset,
    deleteEquipmentAsset,
    addMaintenanceContract,
    updateMaintenanceContract,
    deleteMaintenanceContract,
    syncData,
    refreshData,
  };
});
