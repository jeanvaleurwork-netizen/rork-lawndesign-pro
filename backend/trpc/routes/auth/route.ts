import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { AuthSession, Organization, User, InviteCode } from "@/types";

const users: User[] = [];
const organizations: Organization[] = [];
const inviteCodes: InviteCode[] = [];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateCrewCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const createAdminRoute = publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      businessName: z.string(),
      password: z.string().min(6),
    })
  )
  .mutation(({ input }): AuthSession => {
    console.log("[Backend] Creating admin account:", input.email);

    const existingUser = users.find((u) => u.email === input.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const userId = generateId();
    const orgId = generateId();
    const crewCode = generateCrewCode();

    const nameParts = input.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const organization: Organization = {
      id: orgId,
      ownerId: userId,
      businessName: input.businessName,
      plan: "none",
      crewCode,
      createdAt: new Date().toISOString(),
      subscriptionStatus: "inactive",
    };

    const user: User = {
      id: userId,
      email: input.email,
      firstName,
      lastName,
      name: input.name,
      phone: input.phone,
      role: "admin",
      organizationId: orgId,
      companyId: orgId,
      createdAt: new Date().toISOString(),
    };

    organizations.push(organization);
    users.push(user);

    console.log("[Backend] Admin created successfully:", user.email);
    console.log("[Backend] Organization created with crew code:", crewCode);

    return {
      user,
      organization,
      token: `token_${userId}`,
    };
  });

export const activateSubscriptionRoute = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      plan: z.enum(["monthly", "yearly"]),
    })
  )
  .mutation(({ input }): AuthSession => {
    console.log("[Backend] Activating subscription for user:", input.userId, input.plan);

    const user = users.find((u) => u.id === input.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const organization = organizations.find((o) => o.id === user.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    organization.plan = input.plan;
    organization.subscriptionStatus = "active";

    console.log("[Backend] Subscription activated successfully");

    return {
      user,
      organization,
      token: `token_${user.id}`,
    };
  });

export const crewLoginRoute = publicProcedure
  .input(
    z.object({
      emailOrPhone: z.string(),
      password: z.string(),
    })
  )
  .mutation(({ input }): AuthSession => {
    console.log("[Backend] Crew login attempt:", input.emailOrPhone);

    const user = users.find(
      (u) =>
        (u.email === input.emailOrPhone || u.phone === input.emailOrPhone) &&
        (u.role === "crew" || u.role === "manager")
    );

    if (!user) {
      console.log("[Backend] User not found or not crew/manager role");
      throw new Error("Invalid email/phone or password");
    }

    const organization = organizations.find((o) => o.id === user.organizationId);
    if (!organization) {
      console.log("[Backend] Organization not found for user:", user.id);
      throw new Error("Organization not found");
    }

    console.log("[Backend] Crew login successful:", user.email, "Role:", user.role);

    return {
      user,
      organization,
      token: `token_${user.id}_${Date.now()}`,
    };
  });

export const crewSignupWithCodeRoute = publicProcedure
  .input(
    z.object({
      crewCode: z.string(),
      name: z.string(),
      phone: z.string(),
      password: z.string().min(6),
    })
  )
  .mutation(({ input }): AuthSession => {
    console.log("[Backend] Crew signup with code:", input.crewCode);

    const organization = organizations.find((o) => o.crewCode === input.crewCode);
    if (!organization) {
      throw new Error("Invalid crew code");
    }

    const userId = generateId();
    const nameParts = input.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const user: User = {
      id: userId,
      email: `${input.phone}@crew.contractoros.app`,
      firstName,
      lastName,
      name: input.name,
      phone: input.phone,
      role: "crew",
      organizationId: organization.id,
      companyId: organization.id,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    console.log("[Backend] Crew member added to organization:", organization.businessName);

    return {
      user,
      organization,
      token: `token_${user.id}`,
    };
  });

export const generateInviteCodeRoute = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      crewName: z.string(),
      phoneNumber: z.string(),
      jobTitle: z.string().optional(),
      role: z.enum(["crew", "manager"]).default("crew"),
    })
  )
  .mutation(({ input }) => {
    console.log("[Backend] Generating invite code for:", input.crewName);

    const user = users.find((u) => u.id === input.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can generate invite codes");
    }

    if (!user.organizationId) {
      throw new Error("User not associated with organization");
    }

    const code = generateCrewCode();
    const inviteId = generateId();
    const inviteCode: InviteCode = {
      id: inviteId,
      code,
      companyId: user.organizationId,
      phoneNumber: input.phoneNumber,
      crewName: input.crewName,
      jobTitle: "",
      role: input.role,
      createdAt: new Date().toISOString(),
    };

    inviteCodes.push(inviteCode);

    console.log("[Backend] Invite code generated:", code);

    return {
      code,
      crewName: input.crewName,
      phoneNumber: input.phoneNumber,
      jobTitle: input.jobTitle || "",
      expiresIn: "7 days",
    };
  });

export const validateInviteCodeRoute = publicProcedure
  .input(z.object({ code: z.string() }))
  .mutation(({ input }) => {
    console.log("[Backend] Validating invite code:", input.code);

    const inviteCode = inviteCodes.find((ic) => ic.code === input.code && !ic.usedAt);
    if (!inviteCode) {
      throw new Error("Invalid or already used invite code");
    }

    const organization = organizations.find((o) => o.id === inviteCode.companyId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    console.log("[Backend] Invite code validated for company:", organization.businessName);

    return {
      valid: true,
      companyName: organization.businessName || organization.name || "Unknown Company",
      companyId: organization.id,
      role: inviteCode.role,
      crewName: inviteCode.crewName,
    };
  });

export const crewSignupWithInviteRoute = publicProcedure
  .input(
    z.object({
      inviteCode: z.string(),
      name: z.string(),
      phone: z.string(),
      password: z.string().min(6),
    })
  )
  .mutation(({ input }): AuthSession => {
    console.log("[Backend] Crew signup with invite code:", input.inviteCode);

    const inviteCode = inviteCodes.find((ic) => ic.code === input.inviteCode && !ic.usedAt);
    if (!inviteCode) {
      throw new Error("Invalid or already used invite code");
    }

    const organization = organizations.find((o) => o.id === inviteCode.companyId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    const userId = generateId();
    const nameParts = input.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const user: User = {
      id: userId,
      email: `${input.phone}@crew.contractoros.app`,
      firstName,
      lastName,
      name: input.name,
      phone: input.phone,
      role: inviteCode.role,
      organizationId: organization.id,
      companyId: organization.id,
      createdAt: new Date().toISOString(),
      jobTitle: inviteCode.jobTitle,
    };

    users.push(user);

    inviteCode.usedAt = new Date().toISOString();
    inviteCode.usedBy = userId;

    console.log("[Backend] Crew member created via invite code:", user.name);

    return {
      user,
      organization,
      token: `token_${user.id}`,
    };
  });

export const getInviteCodesRoute = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ input }) => {
    console.log("[Backend] Getting invite codes for user:", input.userId);

    const user = users.find((u) => u.id === input.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can view invite codes");
    }

    if (!user.organizationId) {
      return [];
    }

    const codes = inviteCodes.filter((ic) => ic.companyId === user.organizationId);
    
    return codes.map((ic) => ({
      id: ic.id,
      code: ic.code,
      crewName: ic.crewName,
      phoneNumber: ic.phoneNumber,
      jobTitle: ic.jobTitle,
      role: ic.role,
      createdAt: ic.createdAt,
      used: !!ic.usedAt,
      usedAt: ic.usedAt,
    }));
  });

export const getOrganizationCrewRoute = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ input }) => {
    console.log("[Backend] Getting crew for user:", input.userId);

    const user = users.find((u) => u.id === input.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can view crew members");
    }

    if (!user.organizationId) {
      return [];
    }

    const crewMembers = users.filter(
      (u) =>
        u.organizationId === user.organizationId &&
        (u.role === "crew" || u.role === "manager")
    );

    console.log(
      `[Backend] Found ${crewMembers.length} crew members for organization ${user.organizationId}`
    );

    return crewMembers.map((crew) => ({
      id: crew.id,
      name: crew.name,
      phone: crew.phone,
      email: crew.email,
      role: crew.role,
      jobTitle: crew.jobTitle,
      createdAt: crew.createdAt,
      organizationId: crew.organizationId,
    }));
  });

export const customerLoginRoute = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  )
  .mutation(({ input }): AuthSession => {
    console.log("[Backend] Customer login attempt:", input.email);

    const user = users.find((u) => u.email === input.email && u.role === "customer");
    if (!user) {
      throw new Error("Invalid credentials or user not found");
    }

    const organization = organizations.find((o) => o.id === user.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    console.log("[Backend] Customer login successful:", user.email);

    return {
      user,
      organization,
      token: `token_${user.id}`,
    };
  });

export const createCustomerRoute = publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      password: z.string().min(6),
      organizationId: z.string(),
      clientId: z.string().optional(),
    })
  )
  .mutation(({ input }): AuthSession => {
    console.log("[Backend] Creating customer account:", input.email);

    const existingUser = users.find((u) => u.email === input.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const organization = organizations.find((o) => o.id === input.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    const userId = generateId();
    const nameParts = input.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const user: User = {
      id: userId,
      email: input.email,
      firstName,
      lastName,
      name: input.name,
      phone: input.phone,
      role: "customer",
      organizationId: input.organizationId,
      companyId: input.organizationId,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    console.log("[Backend] Customer created successfully:", user.email);

    return {
      user,
      organization,
      token: `token_${userId}`,
    };
  });
