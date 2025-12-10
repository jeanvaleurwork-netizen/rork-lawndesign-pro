import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, createTRPCRouter } from "../../create-context";
import type { 
  CommercialProperty, 
  EquipmentAsset, 
  MaintenanceContract,
  AssetMaintenanceRecord,
  MaintenanceFrequency 
} from "@/types";
import { generateId } from "@/utils/id-generator";

const propertyStore = new Map<string, CommercialProperty>();
const assetStore = new Map<string, EquipmentAsset>();
const contractStore = new Map<string, MaintenanceContract>();

const maintenanceFrequencySchema = z.enum(["monthly", "quarterly", "semi-annual", "annual", "custom"]);

export const commercialRouter = createTRPCRouter({
  createProperty: publicProcedure
    .input(z.object({
      clientId: z.string(),
      name: z.string(),
      address: z.string(),
      propertyType: z.enum(["commercial", "warehouse", "retail", "office", "industrial", "multi-unit", "mixed-use"]),
      squareFootage: z.number().optional(),
      floors: z.number().optional(),
      notes: z.string().optional(),
      photos: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input }) => {
      const property: CommercialProperty = {
        id: generateId(),
        clientId: input.clientId,
        name: input.name,
        address: input.address,
        propertyType: input.propertyType,
        squareFootage: input.squareFootage,
        floors: input.floors,
        notes: input.notes,
        photos: input.photos,
        createdDate: new Date().toISOString(),
      };

      propertyStore.set(property.id, property);
      console.log(`[Commercial] Created property: ${property.id}`);

      return property;
    }),

  updateProperty: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      address: z.string().optional(),
      propertyType: z.enum(["commercial", "warehouse", "retail", "office", "industrial", "multi-unit", "mixed-use"]).optional(),
      squareFootage: z.number().optional(),
      floors: z.number().optional(),
      notes: z.string().optional(),
      photos: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const existing = propertyStore.get(input.id);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      const updated: CommercialProperty = {
        ...existing,
        ...input,
      };

      propertyStore.set(updated.id, updated);
      console.log(`[Commercial] Updated property: ${updated.id}`);

      return updated;
    }),

  deleteProperty: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const deleted = propertyStore.delete(input.id);
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      const assetsToDelete = Array.from(assetStore.values()).filter(
        (asset) => asset.propertyId === input.id
      );
      assetsToDelete.forEach((asset) => assetStore.delete(asset.id));

      const contractsToDelete = Array.from(contractStore.values()).filter(
        (contract) => contract.propertyId === input.id
      );
      contractsToDelete.forEach((contract) => contractStore.delete(contract.id));

      console.log(`[Commercial] Deleted property: ${input.id}`);
      return { success: true };
    }),

  listPropertiesForClient: publicProcedure
    .input(z.object({
      clientId: z.string(),
    }))
    .query(async ({ input }) => {
      const properties = Array.from(propertyStore.values()).filter(
        (property) => property.clientId === input.clientId
      );
      console.log(`[Commercial] Listed ${properties.length} properties for client: ${input.clientId}`);
      return properties;
    }),

  getProperty: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const property = propertyStore.get(input.id);
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      return property;
    }),

  createAsset: publicProcedure
    .input(z.object({
      propertyId: z.string(),
      name: z.string(),
      assetType: z.enum(["hvac", "electrical", "plumbing", "structural", "other"]),
      location: z.string(),
      modelNumber: z.string().optional(),
      serialNumber: z.string().optional(),
      installDate: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      notes: z.string().optional(),
      photos: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input }) => {
      const qrCodeValue = `ASSET-${generateId()}`;
      
      const asset: EquipmentAsset = {
        id: generateId(),
        propertyId: input.propertyId,
        name: input.name,
        assetType: input.assetType,
        location: input.location,
        modelNumber: input.modelNumber,
        serialNumber: input.serialNumber,
        installDate: input.installDate,
        warrantyExpiry: input.warrantyExpiry,
        qrCodeValue,
        notes: input.notes,
        photos: input.photos,
        maintenanceHistory: [],
        createdDate: new Date().toISOString(),
      };

      assetStore.set(asset.id, asset);
      console.log(`[Commercial] Created asset: ${asset.id} with QR: ${qrCodeValue}`);

      return asset;
    }),

  updateAsset: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      assetType: z.enum(["hvac", "electrical", "plumbing", "structural", "other"]).optional(),
      location: z.string().optional(),
      modelNumber: z.string().optional(),
      serialNumber: z.string().optional(),
      installDate: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      notes: z.string().optional(),
      photos: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const existing = assetStore.get(input.id);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      const updated: EquipmentAsset = {
        ...existing,
        ...input,
      };

      assetStore.set(updated.id, updated);
      console.log(`[Commercial] Updated asset: ${updated.id}`);

      return updated;
    }),

  deleteAsset: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const deleted = assetStore.delete(input.id);
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }
      console.log(`[Commercial] Deleted asset: ${input.id}`);
      return { success: true };
    }),

  listAssetsForProperty: publicProcedure
    .input(z.object({
      propertyId: z.string(),
    }))
    .query(async ({ input }) => {
      const assets = Array.from(assetStore.values()).filter(
        (asset) => asset.propertyId === input.propertyId
      );
      console.log(`[Commercial] Listed ${assets.length} assets for property: ${input.propertyId}`);
      return assets;
    }),

  getAsset: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const asset = assetStore.get(input.id);
      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }
      return asset;
    }),

  lookupAssetByQR: publicProcedure
    .input(z.object({
      qrCodeValue: z.string(),
    }))
    .query(async ({ input }) => {
      const asset = Array.from(assetStore.values()).find(
        (asset) => asset.qrCodeValue === input.qrCodeValue
      );
      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found for QR code",
        });
      }
      console.log(`[Commercial] QR lookup successful: ${asset.id}`);
      return asset;
    }),

  addMaintenanceRecord: publicProcedure
    .input(z.object({
      assetId: z.string(),
      date: z.string(),
      description: z.string(),
      performedBy: z.string(),
      cost: z.number().optional(),
      photos: z.array(z.string()).default([]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const asset = assetStore.get(input.assetId);
      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      const record: AssetMaintenanceRecord = {
        id: generateId(),
        date: input.date,
        description: input.description,
        performedBy: input.performedBy,
        cost: input.cost,
        photos: input.photos,
        notes: input.notes,
      };

      asset.maintenanceHistory.push(record);
      assetStore.set(asset.id, asset);
      console.log(`[Commercial] Added maintenance record to asset: ${asset.id}`);

      return asset;
    }),

  createContract: publicProcedure
    .input(z.object({
      propertyId: z.string(),
      contractName: z.string(),
      description: z.string(),
      frequency: maintenanceFrequencySchema,
      startDate: z.string(),
      endDate: z.string().optional(),
      nextVisitDate: z.string(),
      contractValue: z.number().optional(),
      autoSchedule: z.boolean().default(true),
      assignedCrew: z.array(z.string()).optional(),
      serviceChecklist: z.array(z.string()).default([]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const contract: MaintenanceContract = {
        id: generateId(),
        propertyId: input.propertyId,
        contractName: input.contractName,
        description: input.description,
        frequency: input.frequency,
        startDate: input.startDate,
        endDate: input.endDate,
        nextVisitDate: input.nextVisitDate,
        contractValue: input.contractValue,
        autoSchedule: input.autoSchedule,
        assignedCrew: input.assignedCrew,
        serviceChecklist: input.serviceChecklist,
        notes: input.notes,
        status: "active",
        createdDate: new Date().toISOString(),
      };

      contractStore.set(contract.id, contract);
      console.log(`[Commercial] Created maintenance contract: ${contract.id}`);

      return contract;
    }),

  updateContract: publicProcedure
    .input(z.object({
      id: z.string(),
      contractName: z.string().optional(),
      description: z.string().optional(),
      frequency: maintenanceFrequencySchema.optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      nextVisitDate: z.string().optional(),
      contractValue: z.number().optional(),
      autoSchedule: z.boolean().optional(),
      assignedCrew: z.array(z.string()).optional(),
      serviceChecklist: z.array(z.string()).optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "paused", "cancelled", "completed"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const existing = contractStore.get(input.id);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      const updated: MaintenanceContract = {
        ...existing,
        ...input,
      };

      contractStore.set(updated.id, updated);
      console.log(`[Commercial] Updated maintenance contract: ${updated.id}`);

      return updated;
    }),

  deleteContract: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const deleted = contractStore.delete(input.id);
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }
      console.log(`[Commercial] Deleted maintenance contract: ${input.id}`);
      return { success: true };
    }),

  listContractsForProperty: publicProcedure
    .input(z.object({
      propertyId: z.string(),
    }))
    .query(async ({ input }) => {
      const contracts = Array.from(contractStore.values()).filter(
        (contract) => contract.propertyId === input.propertyId
      );
      console.log(`[Commercial] Listed ${contracts.length} contracts for property: ${input.propertyId}`);
      return contracts;
    }),

  getContract: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const contract = contractStore.get(input.id);
      if (!contract) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }
      return contract;
    }),

  generateRecurringJob: publicProcedure
    .input(z.object({
      contractId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const contract = contractStore.get(input.contractId);
      if (!contract) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      if (contract.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contract is not active",
        });
      }

      const property = propertyStore.get(contract.propertyId);
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found for contract",
        });
      }

      const nextDate = new Date(contract.nextVisitDate);
      const frequencyMap: Record<MaintenanceFrequency, number> = {
        monthly: 30,
        quarterly: 90,
        "semi-annual": 180,
        annual: 365,
        custom: 30,
      };

      nextDate.setDate(nextDate.getDate() + frequencyMap[contract.frequency]);
      contract.nextVisitDate = nextDate.toISOString();
      contractStore.set(contract.id, contract);

      console.log(`[Commercial] Generated recurring job for contract: ${contract.id}`);
      console.log(`[Commercial] Next visit date: ${contract.nextVisitDate}`);

      return {
        contractId: contract.id,
        propertyName: property.name,
        propertyAddress: property.address,
        clientId: property.clientId,
        service: contract.contractName,
        checklist: contract.serviceChecklist,
        nextVisitDate: contract.nextVisitDate,
        assignedCrew: contract.assignedCrew,
        notes: contract.notes,
      };
    }),

  listAllProperties: publicProcedure.query(async () => {
    return Array.from(propertyStore.values());
  }),

  listAllAssets: publicProcedure.query(async () => {
    return Array.from(assetStore.values());
  }),

  listAllContracts: publicProcedure.query(async () => {
    return Array.from(contractStore.values());
  }),
});
