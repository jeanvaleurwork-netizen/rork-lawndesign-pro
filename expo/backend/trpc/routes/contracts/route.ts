import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../../create-context";
import { generateId } from "@/utils/id-generator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  MSA_TEMPLATE, 
  PROJECT_CONTRACT_TEMPLATE, 
  WORK_ORDER_TEMPLATE,
  LIEN_WAIVER_CONDITIONAL_TEMPLATE,
  LIEN_WAIVER_UNCONDITIONAL_TEMPLATE
} from "@/constants/contract-templates";

console.log("[Contracts Route] Loading contracts router module");

const CONTRACTS_STORAGE_KEY = "@contractoros_contracts";

async function getContracts() {
  try {
    const stored = await AsyncStorage.getItem(CONTRACTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("[Contracts] Failed to get contracts:", error);
    return [];
  }
}

async function saveContracts(contracts: any[]) {
  try {
    await AsyncStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(contracts));
    console.log("[Contracts] Saved contracts:", contracts.length);
  } catch (error) {
    console.error("[Contracts] Failed to save contracts:", error);
    throw new Error("Failed to save contracts");
  }
}

function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

export const contractsRouter = createTRPCRouter({
  createContract: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        clientId: z.string(),
        projectId: z.string().optional(),
        type: z.enum([
          "MSA",
          "PROJECT_CONTRACT",
          "WORK_ORDER",
          "TIME_MATERIALS",
          "FIXED_PRICE",
          "COST_PLUS",
          "LUMP_SUM",
          "UNIT_PRICE",
          "SERVICE_AGREEMENT",
          "MAINTENANCE_AGREEMENT",
          "DESIGN_BUILD",
          "SUPPLY_AGREEMENT",
          "EQUIPMENT_RENTAL",
          "NDA",
          "PROPOSAL",
          "LETTER_OF_INTENT",
        ]),
        title: z.string(),
        totalAmount: z.number(),
        startDateEstimated: z.string().optional(),
        endDateEstimated: z.string().optional(),
        scopeOfWork: z.string().optional(),
        warrantyYears: z.number().optional(),
        paymentMilestones: z.array(z.object({
          description: z.string(),
          percent: z.number(),
          amount: z.number(),
        })).optional(),
        additionalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const contractId = generateId("contract");
      const publicSigningToken = generateId("token");

      const templateVariables: Record<string, string> = {
        company_name: "Company Name",
        company_phone: "(555) 123-4567",
        company_email: "info@company.com",
        company_license: "LIC-12345",
        client_name: "Client Name",
        client_property_address: "123 Main St",
        project_name: input.title || "Project",
        project_address: "123 Main St",
        current_date: new Date().toLocaleDateString(),
        contract_total_amount: input.totalAmount.toString(),
        project_start_date: input.startDateEstimated || "TBD",
        project_end_date: input.endDateEstimated || "TBD",
        scope_of_work: input.scopeOfWork || "To be defined",
        warranty_years: (input.warrantyYears || 1).toString(),
        project_duration_text: "TBD",
        payment_schedule_table: input.paymentMilestones?.map((m, i) => 
          `${i + 1}) ${m.description}: $${m.amount.toLocaleString()} (${m.percent}%)`
        ).join("\n") || "To be defined",
      };

      let bodyHtml = "";
      switch (input.type) {
        case "MSA":
          bodyHtml = replaceTemplateVariables(MSA_TEMPLATE, templateVariables);
          break;
        case "PROJECT_CONTRACT":
          bodyHtml = replaceTemplateVariables(PROJECT_CONTRACT_TEMPLATE, templateVariables);
          break;
        case "WORK_ORDER":
          templateVariables.work_order_number = contractId;
          templateVariables.work_description = input.scopeOfWork || "Work description";
          templateVariables.work_order_total_amount = input.totalAmount.toString();
          templateVariables.warranty_days = "30";
          bodyHtml = replaceTemplateVariables(WORK_ORDER_TEMPLATE, templateVariables);
          break;
      }

      const contract = {
        id: contractId,
        companyId: input.companyId,
        clientId: input.clientId,
        projectId: input.projectId,
        type: input.type,
        title: input.title,
        bodyHtml,
        status: "DRAFT" as const,
        totalAmount: input.totalAmount,
        startDateEstimated: input.startDateEstimated,
        endDateEstimated: input.endDateEstimated,
        publicSigningToken,
        signedAt: null,
        createdByUserId: "current-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const allContracts = await getContracts();
      allContracts.push(contract);
      await saveContracts(allContracts);

      console.log("[Contract] Created:", contractId);
      return contract;
    }),

  getAllContracts: publicProcedure
    .query(async () => {
      console.log("[Contract] Fetching all contracts");
      return await getContracts();
    }),

  getContractById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      console.log("[Contract] Fetching contract:", input.id);
      const contracts = await getContracts();
      const contract = contracts.find((c: any) => c.id === input.id);
      if (!contract) {
        throw new Error("Contract not found");
      }
      return contract;
    }),

  updateContract: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        status: z.enum(["DRAFT", "SENT", "VIEWED", "SIGNED", "DECLINED", "CANCELLED"]).optional(),
        totalAmount: z.number().optional(),
        startDateEstimated: z.string().optional(),
        endDateEstimated: z.string().optional(),
        bodyHtml: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[Contract] Updating contract:", input.id);
      const contracts = await getContracts();
      const index = contracts.findIndex((c: any) => c.id === input.id);
      
      if (index === -1) {
        throw new Error("Contract not found");
      }
      
      const { id, ...updateData } = input;
      contracts[index] = {
        ...contracts[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      await saveContracts(contracts);
      console.log("[Contract] Updated:", contracts[index].id);
      
      return contracts[index];
    }),

  deleteContract: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      console.log("[Contract] Deleting contract:", input.id);
      const contracts = await getContracts();
      const filtered = contracts.filter((c: any) => c.id !== input.id);
      
      if (filtered.length === contracts.length) {
        throw new Error("Contract not found");
      }
      
      await saveContracts(filtered);
      console.log("[Contract] Deleted:", input.id);
      
      return { success: true, id: input.id };
    }),

  getContractsByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input }) => {
      console.log("[Contract] Fetching contracts for company:", input.companyId);
      return [];
    }),

  getContractByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      console.log("[Contract] Fetching contract by token:", input.token);
      return null;
    }),

  signContract: publicProcedure
    .input(
      z.object({
        token: z.string(),
        signedByName: z.string(),
        signedByEmail: z.string(),
        signatureData: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[Contract] Signing contract:", input.token);
      return {
        success: true,
        signedAt: new Date().toISOString(),
      };
    }),

  sendContractForSigning: publicProcedure
    .input(
      z.object({
        contractId: z.string(),
        clientEmail: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[Contract] Sending contract for signing:", input.contractId);
      return {
        success: true,
        sentAt: new Date().toISOString(),
      };
    }),

  createChangeOrder: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        contractId: z.string(),
        description: z.string(),
        reason: z.enum([
          "HIDDEN_CONDITION",
          "CLIENT_REQUEST",
          "MATERIAL_CHANGE",
          "INSPECTION",
          "OTHER",
        ]),
        additionalLaborAmount: z.number(),
        additionalMaterialAmount: z.number(),
        oldEndDate: z.string().optional(),
        newEndDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const changeOrderId = generateId("change_order");
      const publicSigningToken = generateId("token");

      const totalChange = input.additionalLaborAmount + input.additionalMaterialAmount;

      const changeOrder = {
        id: changeOrderId,
        companyId: input.companyId,
        projectId: input.projectId,
        contractId: input.contractId,
        description: input.description,
        reason: input.reason,
        additionalLaborAmount: input.additionalLaborAmount,
        additionalMaterialAmount: input.additionalMaterialAmount,
        totalChangeAmount: totalChange,
        revisedContractAmount: 0,
        oldEndDate: input.oldEndDate,
        newEndDate: input.newEndDate,
        status: "DRAFT" as const,
        publicSigningToken,
        signedAt: null,
        createdAt: new Date().toISOString(),
      };

      console.log("[ChangeOrder] Created:", changeOrderId);
      return changeOrder;
    }),

  createCompletionCertificate: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        clientId: z.string(),
        contractId: z.string(),
        finalAmountDue: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const certificateId = generateId("completion_cert");
      const publicSigningToken = generateId("token");

      const certificate = {
        id: certificateId,
        companyId: input.companyId,
        projectId: input.projectId,
        clientId: input.clientId,
        contractId: input.contractId,
        completionDate: new Date().toISOString(),
        finalAmountDue: input.finalAmountDue,
        notes: input.notes,
        status: "DRAFT" as const,
        publicSigningToken,
        signedAt: null,
      };

      console.log("[CompletionCertificate] Created:", certificateId);
      return certificate;
    }),

  createWarranty: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        clientId: z.string(),
        workmanshipYears: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const warrantyId = generateId("warranty");
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + input.workmanshipYears);

      const warranty = {
        id: warrantyId,
        companyId: input.companyId,
        projectId: input.projectId,
        clientId: input.clientId,
        workmanshipYears: input.workmanshipYears,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: input.notes,
        status: "ACTIVE" as const,
      };

      console.log("[Warranty] Created:", warrantyId);
      return warranty;
    }),

  createMaterialApproval: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        clientId: z.string(),
        itemName: z.string(),
        brand: z.string().optional(),
        colorFinish: z.string().optional(),
        modelNumber: z.string().optional(),
        quantity: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const approvalId = generateId("material_approval");

      const approval = {
        id: approvalId,
        companyId: input.companyId,
        projectId: input.projectId,
        clientId: input.clientId,
        itemName: input.itemName,
        brand: input.brand,
        colorFinish: input.colorFinish,
        modelNumber: input.modelNumber,
        quantity: input.quantity,
        notes: input.notes,
        status: "PENDING" as const,
        approvedAt: null,
      };

      console.log("[MaterialApproval] Created:", approvalId);
      return approval;
    }),

  approveMaterial: publicProcedure
    .input(
      z.object({
        approvalId: z.string(),
        approved: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[MaterialApproval] Updated:", input.approvalId, input.approved);
      return {
        success: true,
        status: input.approved ? "APPROVED" : "DECLINED",
        approvedAt: input.approved ? new Date().toISOString() : null,
      };
    }),

  createSubcontractorAgreement: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        subcontractorId: z.string(),
        scopeOfWork: z.string(),
        rateType: z.enum(["PER_JOB", "HOURLY", "DAILY"]),
        rateAmount: z.number(),
        billingSchedule: z.enum(["WEEKLY", "ON_COMPLETION"]),
      })
    )
    .mutation(async ({ input }) => {
      const agreementId = generateId("subcontractor_agreement");
      const publicSigningToken = generateId("token");

      const agreement = {
        id: agreementId,
        companyId: input.companyId,
        projectId: input.projectId,
        subcontractorId: input.subcontractorId,
        scopeOfWork: input.scopeOfWork,
        rateType: input.rateType,
        rateAmount: input.rateAmount,
        billingSchedule: input.billingSchedule,
        bodyHtml: "Subcontractor agreement body",
        status: "DRAFT" as const,
        publicSigningToken,
        signedAt: null,
      };

      console.log("[SubcontractorAgreement] Created:", agreementId);
      return agreement;
    }),

  createLienWaiver: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        clientId: z.string(),
        contractId: z.string(),
        type: z.enum(["CONDITIONAL", "UNCONDITIONAL"]),
        amount: z.number(),
        effectiveThroughDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const waiverId = generateId("lien_waiver");

      const templateVars: Record<string, string> = {
        project_name: "Project",
        payment_amount: input.amount.toString(),
        payment_through_date: input.effectiveThroughDate,
      };

      const bodyHtml = input.type === "CONDITIONAL" 
        ? replaceTemplateVariables(LIEN_WAIVER_CONDITIONAL_TEMPLATE, templateVars)
        : replaceTemplateVariables(LIEN_WAIVER_UNCONDITIONAL_TEMPLATE, templateVars);

      const waiver = {
        id: waiverId,
        companyId: input.companyId,
        projectId: input.projectId,
        clientId: input.clientId,
        contractId: input.contractId,
        type: input.type,
        amount: input.amount,
        effectiveThroughDate: input.effectiveThroughDate,
        bodyHtml,
        status: "DRAFT" as const,
        signedAt: null,
      };

      console.log("[LienWaiver] Created:", waiverId);
      return waiver;
    }),
});

console.log("[Contracts Route] contractsRouter created with procedures:", Object.keys(contractsRouter._def.procedures));
