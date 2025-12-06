import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { Job, Client, Estimate } from "@/types";

const jobs: Job[] = [];
const clients: Client[] = [];
const estimates: Estimate[] = [];

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const getJobsRoute = publicProcedure
  .input(z.object({ businessId: z.string() }))
  .query(({ input }) => {
    console.log("[Backend] Getting jobs for business:", input.businessId);
    return jobs.filter((j) => j.businessId === input.businessId);
  });

export const createJobRoute = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
      clientId: z.string(),
      clientName: z.string(),
      propertyAddress: z.string(),
      service: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      crew: z.array(z.string()),
      notes: z.string().optional(),
      budgetedCost: z.number().optional(),
    })
  )
  .mutation(({ input }) => {
    console.log("[Backend] Creating job:", input.service);

    const job: Job = {
      id: generateId(),
      businessId: input.businessId,
      clientId: input.clientId,
      clientName: input.clientName,
      propertyAddress: input.propertyAddress,
      service: input.service,
      startTime: input.startTime,
      endTime: input.endTime,
      crew: input.crew,
      status: "scheduled",
      materialsUsed: [],
      photos: [],
      notes: input.notes,
      budgetedCost: input.budgetedCost,
      actualCost: 0,
      receipts: [],
    };

    jobs.push(job);
    console.log("[Backend] Job created successfully:", job.id);
    return job;
  });

export const updateJobRoute = publicProcedure
  .input(
    z.object({
      jobId: z.string(),
      updates: z.object({
        status: z.enum(["pending", "scheduled", "in-progress", "completed", "cancelled"]).optional(),
        crew: z.array(z.string()).optional(),
        notes: z.string().optional(),
        actualCost: z.number().optional(),
        materialsUsed: z.array(
          z.object({
            name: z.string(),
            quantity: z.number(),
            unit: z.string(),
          })
        ).optional(),
      }),
    })
  )
  .mutation(({ input }) => {
    console.log("[Backend] Updating job:", input.jobId);

    const jobIndex = jobs.findIndex((j) => j.id === input.jobId);
    if (jobIndex === -1) {
      throw new Error("Job not found");
    }

    jobs[jobIndex] = { ...jobs[jobIndex], ...input.updates };
    console.log("[Backend] Job updated successfully");
    return jobs[jobIndex];
  });

export const deleteJobRoute = publicProcedure
  .input(z.object({ jobId: z.string() }))
  .mutation(({ input }) => {
    console.log("[Backend] Deleting job:", input.jobId);

    const jobIndex = jobs.findIndex((j) => j.id === input.jobId);
    if (jobIndex === -1) {
      throw new Error("Job not found");
    }

    jobs.splice(jobIndex, 1);
    console.log("[Backend] Job deleted successfully");
    return { success: true };
  });

export const getClientsRoute = publicProcedure
  .input(z.object({ businessId: z.string() }))
  .query(({ input }) => {
    console.log("[Backend] Getting clients for business:", input.businessId);
    return clients.filter((c) => c.businessId === input.businessId);
  });

export const createClientRoute = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
      name: z.string(),
      email: z.string(),
      phone: z.string(),
      notes: z.string().optional(),
      arrivalInstructions: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    console.log("[Backend] Creating client:", input.name);

    const client: Client = {
      id: generateId(),
      businessId: input.businessId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      notes: input.notes || "",
      tags: [],
      jobsCount: 0,
      estimatesCount: 0,
      customerType: "new",
      arrivalInstructions: input.arrivalInstructions,
    };

    clients.push(client);
    console.log("[Backend] Client created successfully:", client.id);
    return client;
  });

export const updateClientRoute = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      updates: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
        arrivalInstructions: z.string().optional(),
      }),
    })
  )
  .mutation(({ input }) => {
    console.log("[Backend] Updating client:", input.clientId);

    const clientIndex = clients.findIndex((c) => c.id === input.clientId);
    if (clientIndex === -1) {
      throw new Error("Client not found");
    }

    clients[clientIndex] = { ...clients[clientIndex], ...input.updates };
    console.log("[Backend] Client updated successfully");
    return clients[clientIndex];
  });

export const deleteClientRoute = publicProcedure
  .input(z.object({ clientId: z.string() }))
  .mutation(({ input }) => {
    console.log("[Backend] Deleting client:", input.clientId);

    const clientIndex = clients.findIndex((c) => c.id === input.clientId);
    if (clientIndex === -1) {
      throw new Error("Client not found");
    }

    clients.splice(clientIndex, 1);
    console.log("[Backend] Client deleted successfully");
    return { success: true };
  });

export const getEstimatesRoute = publicProcedure
  .input(z.object({ businessId: z.string() }))
  .query(({ input }) => {
    console.log("[Backend] Getting estimates for business:", input.businessId);
    return estimates.filter((e) => e.businessId === input.businessId);
  });

export const createEstimateRoute = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
      propertyId: z.string(),
      clientName: z.string(),
      propertyAddress: z.string(),
      lineItems: z.array(
        z.object({
          name: z.string(),
          quantity: z.number(),
          unit: z.string(),
          rate: z.number(),
          amount: z.number(),
        })
      ),
      notes: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    console.log("[Backend] Creating estimate for:", input.clientName);

    const subtotal = input.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;

    const estimate: Estimate = {
      id: generateId(),
      businessId: input.businessId,
      propertyId: input.propertyId,
      clientName: input.clientName,
      propertyAddress: input.propertyAddress,
      status: "draft",
      lineItems: input.lineItems.map((item) => ({
        ...item,
        id: generateId(),
      })),
      subtotal,
      tax,
      total,
      notes: input.notes || "",
      createdDate: new Date().toISOString(),
    };

    estimates.push(estimate);
    console.log("[Backend] Estimate created successfully:", estimate.id);
    return estimate;
  });

export const updateEstimateRoute = publicProcedure
  .input(
    z.object({
      estimateId: z.string(),
      updates: z.object({
        status: z.enum(["draft", "sent", "approved", "declined"]).optional(),
        lineItems: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            quantity: z.number(),
            unit: z.string(),
            rate: z.number(),
            amount: z.number(),
          })
        ).optional(),
        notes: z.string().optional(),
      }),
    })
  )
  .mutation(({ input }) => {
    console.log("[Backend] Updating estimate:", input.estimateId);

    const estimateIndex = estimates.findIndex((e) => e.id === input.estimateId);
    if (estimateIndex === -1) {
      throw new Error("Estimate not found");
    }

    let updatedEstimate = { ...estimates[estimateIndex], ...input.updates };
    if (input.updates.lineItems) {
      const total = input.updates.lineItems.reduce((sum, item) => sum + item.amount, 0);
      updatedEstimate = { ...updatedEstimate, total };
    }

    estimates[estimateIndex] = updatedEstimate;
    console.log("[Backend] Estimate updated successfully");
    return estimates[estimateIndex];
  });
