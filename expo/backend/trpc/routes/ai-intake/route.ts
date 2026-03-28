import { z } from "zod";
import { publicProcedure } from "../../create-context";
import type { PhoneIntakeLead } from "@/types";

const INTAKE_SYSTEM_PROMPT = `You are ContractorOS AI, a job intake assistant for homeowners.
Your job is to ask smart questions, collect all details, and produce a structured summary for the Admin.

Steps:
1) Identify job type (Landscaping, Roofing, Siding, Painting, HVAC, Plumbing, Electrical, Tree Service, Pool Service, Pressure Washing, Renovation, General Contractor)
2) Ask the correct questions for that trade
3) If customer doesn't know a detail, ask a simpler clarifying question
4) Collect photos if available
5) Determine urgency (1-3)
6) Create a professional summary for Admin
7) Create a materials/crew checklist

CRITICAL RULES:
- Never assume details
- Always clarify
- Ask only 1 question at a time
- Adapt questions based on job type
- Never guess measurements, location, electrical/plumbing safety
- Never push customer for price
- Always confirm summary before submission
- Always classify job type`;

const TRADE_QUESTIONS: Record<string, string[]> = {
  landscaping: [
    "What type of work is needed? (Cleanup, trimming, removal, design)",
    "Size of yard (small/medium/large)?",
    "Any utilities underground?",
    "Do you want debris removed?",
    "Current condition of the area?",
  ],
  roofing: [
    "Where is the leak or damage located?",
    "When did it start?",
    "Is water coming inside the home?",
    "Do you see missing shingles?",
    "How old is the roof roughly?",
    "Is this for insurance?",
  ],
  siding: [
    "What type of siding do you have?",
    "What's the issue with the siding?",
    "How many sides of the house?",
    "Any water damage inside?",
    "When did you notice this?",
  ],
  painting: [
    "Interior or exterior painting?",
    "How many rooms?",
    "What condition are the walls?",
    "Any prep work needed?",
    "Color preferences decided?",
  ],
  hvac: [
    "AC, furnace or both?",
    "Is it blowing any air?",
    "Hot or cold?",
    "When did it start?",
    "Last maintenance date?",
  ],
  plumbing: [
    "Is water actively leaking?",
    "Where is the leak?",
    "Did you turn off the water?",
    "Do you see water damage?",
    "What room is affected?",
  ],
  electrical: [
    "Which rooms are affected?",
    "Any sparks or burning smell?",
    "Is power completely off?",
    "Are breakers tripping?",
    "When did this start?",
  ],
  tree_service: [
    "Tree removal or trimming?",
    "How many trees?",
    "Tree height estimate?",
    "Any danger to property?",
    "Emergency or can wait?",
  ],
  pool_service: [
    "Maintenance or repair?",
    "Pool size?",
    "When was last service?",
    "Water cloudy or clear?",
    "Equipment issues?",
  ],
  pressure_washing: [
    "What needs cleaning?",
    "House, driveway, or deck?",
    "How large is the area?",
    "When was it last cleaned?",
    "Any staining or mold?",
  ],
  renovation: [
    "What room or area?",
    "Full remodel or partial?",
    "What's the scope?",
    "Have a budget range?",
    "Timeline expectations?",
  ],
  general_contractor: [
    "What type of project?",
    "New construction or remodel?",
    "Do you have plans?",
    "Timeline for start?",
    "Permits needed?",
  ],
};

const TRADE_CHECKLISTS: Record<string, string[]> = {
  landscaping: ["pruning saw", "bags", "chainsaw", "rake", "trimmer", "edger", "blower"],
  roofing: ["ladder", "shingles", "flashing", "sealant", "safety harness", "nail gun"],
  siding: ["siding brake", "circular saw", "j-channel", "nails", "scaffolding"],
  painting: ["paint sprayer", "brushes", "rollers", "tarps", "tape", "ladder"],
  hvac: ["gauges", "refrigerant", "filter", "pump", "multimeter", "vacuum pump"],
  plumbing: ["wrench set", "PVC", "leak detector", "towels", "pipe tape", "drain snake"],
  electrical: ["tester", "gloves", "breakers", "wire stripper", "multimeter"],
  tree_service: ["chainsaw", "wood chipper", "ropes", "safety gear", "bucket truck"],
  pool_service: ["test kit", "chemicals", "vacuum", "skimmer", "brush"],
  pressure_washing: ["pressure washer", "surface cleaner", "hoses", "cleaning solution"],
  renovation: ["table saw", "drill", "drywall tools", "tile saw", "scaffolding"],
  general_contractor: ["full equipment set", "project plans", "permits", "safety gear"],
};

const processIntakeInputSchema = z.object({
  intakeId: z.string(),
  message: z.string(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  currentData: z.object({
    jobType: z.string().optional(),
    customerName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
    urgency: z.number().optional(),
    photos: z.array(z.string()).optional(),
    answers: z.record(z.string(), z.any()).optional(),
  }),
});

export const processIntakeMessageProcedure = publicProcedure
  .input(processIntakeInputSchema)
  .mutation(async ({ input }) => {
    const { message, currentData } = input;

    console.log("[AI Intake] Processing message:", message);

    try {
      const aiResponse = {
        message: "",
        extractedData: {},
        nextAction: "continue" as "continue" | "complete",
        confidence: 70,
      };

      const lowerMessage = message.toLowerCase();

      if (!currentData.jobType) {
        if (
          lowerMessage.includes("roof") ||
          lowerMessage.includes("leak") ||
          lowerMessage.includes("shingle")
        ) {
          aiResponse.extractedData = { ...currentData, jobType: "roofing" };
          aiResponse.message =
            "I understand you need roofing help. Let me ask a few questions to help you better. Where is the leak or damage located?";
        } else if (
          lowerMessage.includes("lawn") ||
          lowerMessage.includes("tree") ||
          lowerMessage.includes("landscape")
        ) {
          aiResponse.extractedData = {
            ...currentData,
            jobType: "landscaping",
          };
          aiResponse.message =
            "Got it! I can help with your landscaping needs. What type of work is needed - cleanup, trimming, removal, or design?";
        } else if (
          lowerMessage.includes("plumb") ||
          lowerMessage.includes("pipe") ||
          lowerMessage.includes("water")
        ) {
          aiResponse.extractedData = { ...currentData, jobType: "plumbing" };
          aiResponse.message =
            "I'll help with your plumbing issue. Is water actively leaking right now?";
        } else if (
          lowerMessage.includes("electric") ||
          lowerMessage.includes("power") ||
          lowerMessage.includes("outlet")
        ) {
          aiResponse.extractedData = { ...currentData, jobType: "electrical" };
          aiResponse.message =
            "I can help with electrical issues. Which rooms are affected?";
        } else if (
          lowerMessage.includes("hvac") ||
          lowerMessage.includes("ac") ||
          lowerMessage.includes("heat") ||
          lowerMessage.includes("furnace")
        ) {
          aiResponse.extractedData = { ...currentData, jobType: "hvac" };
          aiResponse.message =
            "I'll help with your HVAC system. Is this about AC, furnace, or both?";
        } else {
          aiResponse.message =
            "I'm here to help! What type of service do you need? (Roofing, Landscaping, Plumbing, Electrical, HVAC, or General Repair)";
        }
      } else {
        const phoneRegex = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/;
        const phoneMatch = message.match(phoneRegex);
        if (phoneMatch && !currentData.phone) {
          aiResponse.extractedData = {
            ...currentData,
            phone: phoneMatch[0],
          };
          aiResponse.message =
            "Perfect! And what's the best address for this service?";
        } else if (!currentData.address && lowerMessage.includes("street")) {
          aiResponse.extractedData = { ...currentData, address: message };
          aiResponse.message =
            "Great! Can you describe the issue you're experiencing?";
        } else if (!currentData.description) {
          aiResponse.extractedData = { ...currentData, description: message };
          aiResponse.message =
            "Thank you. On a scale of 1-3, how urgent is this? (1=flexible, 2=this week, 3=ASAP)";
        } else if (!currentData.urgency) {
          const urgency = parseInt(message);
          if (urgency >= 1 && urgency <= 3) {
            aiResponse.extractedData = { ...currentData, urgency };
            aiResponse.message =
              "Got it! And finally, what's the best name to use for this service request?";
            aiResponse.nextAction = "complete";
          } else {
            aiResponse.message =
              "Please enter 1, 2, or 3 for urgency level.";
          }
        } else if (!currentData.customerName) {
          aiResponse.extractedData = {
            ...currentData,
            customerName: message,
          };
          aiResponse.message =
            "Perfect! Let me summarize everything and create your service request.";
          aiResponse.nextAction = "complete";
        } else {
          aiResponse.message =
            "Thank you! I have all the information needed. Creating your service request now.";
          aiResponse.nextAction = "complete";
        }
      }

      return aiResponse;
    } catch (error) {
      console.error("[AI Intake] Error processing message:", error);
      throw new Error("Failed to process intake message");
    }
  });

const summarizeInputSchema = z.object({
  intakeId: z.string(),
  collectedData: z.object({
    jobType: z.string(),
    customerName: z.string(),
    phone: z.string(),
    address: z.string(),
    description: z.string(),
    urgency: z.number(),
    photos: z.array(z.string()),
    answers: z.record(z.string(), z.any()),
  }),
});

export const summarizeIntakeProcedure = publicProcedure
  .input(summarizeInputSchema)
  .mutation(async ({ input }) => {
    const { collectedData } = input;

    console.log("[AI Intake] Summarizing intake:", collectedData);

    const jobType = collectedData.jobType as keyof typeof TRADE_CHECKLISTS;
    const checklist = TRADE_CHECKLISTS[jobType] || [];

    const summary = {
      jobType: collectedData.jobType,
      customerDetails: {
        name: collectedData.customerName,
        phone: collectedData.phone,
        address: collectedData.address,
      },
      issueDescription: collectedData.description,
      urgencyLevel: collectedData.urgency,
      photos: collectedData.photos || [],
      crewChecklist: checklist,
      notesForAdmin: `${
        collectedData.urgency === 3 ? "URGENT: " : ""
      }${collectedData.description}`,
      estimatedArrivalWindow:
        collectedData.urgency === 3
          ? "2-4 hours"
          : collectedData.urgency === 2
          ? "Same day or next day"
          : "Within 3 days",
    };

    return summary;
  });

const findBestCrewInputSchema = z.object({
  jobType: z.string(),
  address: z.string(),
  urgency: z.number(),
  checklist: z.array(z.string()),
});

export const findBestCrewProcedure = publicProcedure
  .input(findBestCrewInputSchema)
  .query(async ({ input }) => {
    console.log("[AI Dispatch] Finding best crew for:", input);

    const mockCrews = [
      {
        id: "crew-1",
        name: "Alpha Team",
        trade: input.jobType,
        trades: [input.jobType],
        currentLoad: 2,
        maxJobsPerDay: 5,
        baseLocation: { lat: 40.68, lng: -73.95 },
        serviceRadiusMiles: 20,
        availability: { today: true, tomorrow: true, thisWeek: true },
        tools: input.checklist,
        rating: 4.8,
        completedJobs: 150,
      },
      {
        id: "crew-2",
        name: "Beta Team",
        trade: input.jobType,
        trades: [input.jobType],
        currentLoad: 4,
        maxJobsPerDay: 5,
        baseLocation: { lat: 40.75, lng: -73.98 },
        serviceRadiusMiles: 15,
        availability: { today: false, tomorrow: true, thisWeek: true },
        tools: input.checklist,
        rating: 4.5,
        completedJobs: 95,
      },
    ];

    const scoredCrews = mockCrews.map((crew) => {
      let score = 0;

      if (crew.currentLoad < crew.maxJobsPerDay) {
        score += 40;
      }

      score += 30;

      if (crew.currentLoad < crew.maxJobsPerDay * 0.6) {
        score += 20;
      }

      const toolsMatch =
        input.checklist.filter((tool: string) => crew.tools.includes(tool)).length /
        input.checklist.length;
      score += toolsMatch * 10;

      return {
        ...crew,
        score,
      };
    });

    scoredCrews.sort((a, b) => b.score - a.score);

    const bestCrew = scoredCrews[0];

    if (!bestCrew) {
      return null;
    }

    return {
      jobId: `job-${Date.now()}`,
      assignedCrew: {
        crewId: bestCrew.id,
        crewName: bestCrew.name,
        crewPhone: "555-0100",
        reasonAssigned: `Best match based on availability (${bestCrew.currentLoad}/${bestCrew.maxJobsPerDay} jobs), proximity, and ${bestCrew.rating} star rating.`,
      },
      dispatchFlag: input.urgency === 3 ? ("urgent" as const) : ("regular" as const),
      notesForCrew: `${input.jobType.toUpperCase()} job at ${input.address}. Urgency level: ${input.urgency}. Required tools: ${input.checklist.join(", ")}`,
      estimatedArrivalWindow:
        input.urgency === 3
          ? "2-4 hours"
          : input.urgency === 2
          ? "Same day or next day"
          : "Within 3 days",
      customerNotification:
        "Your service request has been scheduled. A technician will contact you shortly.",
      score: bestCrew.score,
    };
  });

const phoneIntakeSchema = z.object({
  trade_type: z.enum([
    "landscaping",
    "roofing",
    "siding",
    "painting",
    "hvac",
    "plumbing",
    "electrical",
    "tree_service",
    "pool_service",
    "pressure_washing",
    "renovation",
    "general_contractor",
  ]),
  lead_status: z.enum(["new", "contacted", "qualified", "scheduled", "converted", "lost"]).optional().default("new"),
  contact: z.object({
    full_name: z.string(),
    phone: z.string(),
    email: z.string().optional().default(""),
    preferred_contact: z.string().optional().default("phone"),
  }),
  property: z.object({
    property_type: z.string().optional().default(""),
    address: z.string(),
    city: z.string().optional().default(""),
    state: z.string().optional().default(""),
    zip: z.string().optional().default(""),
    access_notes: z.string().optional().default(""),
  }),
  job_summary: z.string(),
  trade_specific_fields: z.object({
    service_type: z.string().optional(),
    area_size_sqft: z.string().optional(),
    current_condition: z.string().optional(),
    desired_style: z.string().optional(),
    recurring_or_one_time: z.string().optional(),
    budget_range: z.string().optional(),
    timeline: z.string().optional(),
    roof_type: z.string().optional(),
    stories: z.string().optional(),
    age_of_roof_years: z.string().optional(),
    issue_reason: z.string().optional(),
    leak_or_damage_location: z.string().optional(),
    insurance_claim: z.string().optional(),
    recent_storm: z.string().optional(),
    system_type: z.string().optional(),
    age_of_system: z.string().optional(),
    last_maintenance: z.string().optional(),
    pipe_material: z.string().optional(),
    water_active: z.string().optional(),
    scope_of_work: z.string().optional(),
    room_count: z.string().optional(),
    square_footage: z.string().optional(),
    material_preference: z.string().optional(),
    urgency_reason: z.string().optional(),
    additional_details: z.record(z.string(), z.string()).optional(),
  }).optional(),
  photos_requested: z.boolean().optional().default(false),
  appointment: z.object({
    is_scheduled: z.boolean(),
    date: z.string().optional().default(""),
    time_window: z.string().optional().default(""),
    visit_type: z.string().optional().default(""),
  }).optional(),
  notes_for_admin: z.string().optional().default(""),
  call_metadata: z.object({
    call_id: z.string().optional().default(""),
    call_start: z.string().optional().default(""),
    call_end: z.string().optional().default(""),
  }).optional(),
});

export const createPhoneIntakeProcedure = publicProcedure
  .input(phoneIntakeSchema)
  .mutation(async ({ input }) => {
    console.log("[Phone Intake] Creating phone intake lead:", input);

    const lead: PhoneIntakeLead = {
      id: `phone-intake-${Date.now()}`,
      trade_type: input.trade_type,
      lead_status: input.lead_status || "new",
      contact: input.contact,
      property: input.property,
      job_summary: input.job_summary,
      trade_specific_fields: input.trade_specific_fields,
      photos_requested: input.photos_requested || false,
      appointment: input.appointment,
      notes_for_admin: input.notes_for_admin || "",
      call_metadata: input.call_metadata,
      created_date: new Date().toISOString(),
    };

    return {
      success: true,
      lead,
      message: "Phone intake lead created successfully",
    };
  });

export const getAllPhoneIntakesProcedure = publicProcedure
  .query(async () => {
    console.log("[Phone Intake] Fetching all phone intake leads");

    const mockLeads: PhoneIntakeLead[] = [
      {
        id: "phone-intake-1",
        trade_type: "landscaping",
        lead_status: "new",
        contact: {
          full_name: "Michael Rodriguez",
          phone: "(555) 123-4567",
          email: "michael.r@email.com",
          preferred_contact: "phone",
        },
        property: {
          property_type: "residential",
          address: "234 Oak Street",
          city: "Austin",
          state: "TX",
          zip: "78701",
          access_notes: "Gate code is 1234",
        },
        job_summary: "Complete backyard landscaping - remove old grass, install new sod, add irrigation system",
        trade_specific_fields: {
          service_type: "full_landscaping",
          area_size_sqft: "2500",
          current_condition: "overgrown_lawn",
          desired_style: "modern_minimal",
          recurring_or_one_time: "one_time",
          budget_range: "$8000-$12000",
          timeline: "within_2_weeks",
        },
        photos_requested: true,
        appointment: {
          is_scheduled: false,
          date: "",
          time_window: "",
          visit_type: "site_visit",
        },
        notes_for_admin: "Customer wants premium sod. Mentioned neighbor had work done recently.",
        created_date: new Date().toISOString(),
      },
      {
        id: "phone-intake-2",
        trade_type: "roofing",
        lead_status: "new",
        contact: {
          full_name: "Sarah Chen",
          phone: "(555) 987-6543",
          email: "sarah.chen@email.com",
          preferred_contact: "text",
        },
        property: {
          property_type: "residential",
          address: "567 Maple Avenue",
          city: "Denver",
          state: "CO",
          zip: "80202",
          access_notes: "",
        },
        job_summary: "Roof leak in master bedroom, appears to be from recent hail storm, insurance claim pending",
        trade_specific_fields: {
          service_type: "repair",
          roof_type: "asphalt_shingles",
          stories: "2",
          age_of_roof_years: "8",
          issue_reason: "hail_damage",
          leak_or_damage_location: "master_bedroom_ceiling",
          insurance_claim: "yes",
          recent_storm: "yes_last_week",
          budget_range: "insurance_covered",
          timeline: "urgent_asap",
        },
        photos_requested: true,
        appointment: {
          is_scheduled: true,
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          time_window: "9am-12pm",
          visit_type: "inspection",
        },
        notes_for_admin: "URGENT - Active leak. Customer needs inspection ASAP for insurance claim. Water damage visible on ceiling.",
        created_date: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    return mockLeads;
  });

const updateLeadStatusSchema = z.object({
  leadId: z.string(),
  status: z.enum(["new", "contacted", "qualified", "scheduled", "converted", "lost"]),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePhoneIntakeStatusProcedure = publicProcedure
  .input(updateLeadStatusSchema)
  .mutation(async ({ input }) => {
    console.log("[Phone Intake] Updating lead status:", input);

    return {
      success: true,
      message: "Lead status updated successfully",
    };
  });
