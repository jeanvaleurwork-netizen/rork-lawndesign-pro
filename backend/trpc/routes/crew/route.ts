import { z } from "zod";
import { publicProcedure } from "../../create-context";

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

const crewMembers: CrewMember[] = [];

export const getCrewListRoute = publicProcedure
  .input(
    z
      .object({
        companyId: z.string().optional(),
      })
      .optional()
  )
  .query(({ input }) => {
    console.log("[Crew] Getting crew list for:", input?.companyId || "all");
    
    if (input?.companyId) {
      return crewMembers.filter((m) => m.companyId === input.companyId);
    }
    
    return crewMembers;
  });

export const getCrewByIdRoute = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(({ input }) => {
    console.log("[Crew] Getting crew member:", input.id);
    const member = crewMembers.find((m) => m.id === input.id);
    
    if (!member) {
      throw new Error("Crew member not found");
    }
    
    return member;
  });

export const createCrewRoute = publicProcedure
  .input(
    z.object({
      companyId: z.string().default("default"),
      name: z.string(),
      title: z.string(),
      role: z.enum(["lead", "worker", "specialist"]).default("worker"),
      availability: z.enum(["available", "busy", "off"]).default("available"),
      phone: z.string().optional(),
      email: z.string().optional(),
      skills: z.array(z.string()).default([]),
      certifications: z.array(z.string()).default([]),
      performanceRating: z.number().default(0),
      jobsCompleted: z.number().default(0),
      avgRating: z.number().default(0),
      hourlyRate: z.number().default(0),
      hoursThisWeek: z.number().default(0),
    })
  )
  .mutation(({ input }) => {
    console.log("[Crew] Creating crew member:", input.name);
    
    const newMember: CrewMember = {
      id: `crew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId: input.companyId,
      name: input.name,
      title: input.title,
      role: input.role,
      availability: input.availability,
      phone: input.phone,
      email: input.email,
      skills: input.skills,
      certifications: input.certifications,
      performanceRating: input.performanceRating,
      jobsCompleted: input.jobsCompleted,
      avgRating: input.avgRating,
      joinedDate: new Date().toISOString(),
      hourlyRate: input.hourlyRate,
      hoursThisWeek: input.hoursThisWeek,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    crewMembers.push(newMember);
    console.log("[Crew] Created crew member:", newMember.id);
    return newMember;
  });

export const updateCrewRoute = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      title: z.string().optional(),
      role: z.enum(["lead", "worker", "specialist"]).optional(),
      availability: z.enum(["available", "busy", "off"]).optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      skills: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional(),
      performanceRating: z.number().optional(),
      jobsCompleted: z.number().optional(),
      avgRating: z.number().optional(),
      hourlyRate: z.number().optional(),
      hoursThisWeek: z.number().optional(),
    })
  )
  .mutation(({ input }) => {
    console.log("[Crew] Updating crew member:", input.id);
    const index = crewMembers.findIndex((m) => m.id === input.id);
    
    if (index === -1) {
      throw new Error("Crew member not found");
    }
    
    const { id, ...updateData } = input;
    crewMembers[index] = {
      ...crewMembers[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    console.log("[Crew] Updated crew member:", crewMembers[index].id);
    return crewMembers[index];
  });

export const deleteCrewRoute = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(({ input }) => {
    console.log("[Crew] Deleting crew member:", input.id);
    const index = crewMembers.findIndex((m) => m.id === input.id);
    
    if (index === -1) {
      throw new Error("Crew member not found");
    }
    
    crewMembers.splice(index, 1);
    console.log("[Crew] Deleted crew member:", input.id);
    
    return { success: true, id: input.id };
  });
