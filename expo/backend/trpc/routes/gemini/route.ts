import { publicProcedure } from "../../create-context";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyB1tnfZQI1GCjoaaL6rkvo66_f01dyGBvo";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

async function callGemini(prompt: string, model: string = "gemini-1.5-flash"): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  console.log("[Gemini] Calling API with model:", model);

  const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Gemini] API error:", error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  console.log("[Gemini] Response received, length:", text.length);
  return text;
}

async function callGeminiVision(prompt: string, imageBase64: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  console.log("[Gemini Vision] Analyzing image");

  const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Gemini Vision] API error:", error);
    throw new Error(`Gemini Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  console.log("[Gemini Vision] Analysis complete");
  return text;
}

export const analyzeJobCostRoute = publicProcedure
  .input(z.object({
    jobType: z.string(),
    area: z.number().optional(),
    materials: z.array(z.string()).optional(),
    laborHours: z.number().optional(),
    location: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Gemini] Analyzing job cost:", input.jobType);

    const prompt = `As a professional contractor cost estimator, analyze the following job and provide a detailed cost breakdown:

Job Type: ${input.jobType}
${input.area ? `Area: ${input.area} sq ft` : ''}
${input.materials?.length ? `Materials: ${input.materials.join(', ')}` : ''}
${input.laborHours ? `Estimated Labor Hours: ${input.laborHours}` : ''}
${input.location ? `Location: ${input.location}` : ''}

Provide:
1. Detailed cost breakdown (materials, labor, equipment, permits)
2. Total estimated cost range
3. Key cost factors and considerations
4. Recommendations for cost optimization
5. Timeline estimate

Format as JSON with fields: materialsCost, laborCost, equipmentCost, permitsCost, totalMin, totalMax, factors, recommendations, timelineWeeks`;

    const result = await callGemini(prompt);
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.log("[Gemini] Could not parse JSON, returning raw text");
    }

    return { analysis: result };
  });

export const generateEstimateRoute = publicProcedure
  .input(z.object({
    clientName: z.string(),
    jobType: z.string(),
    jobDescription: z.string(),
    area: z.number().optional(),
    materials: z.array(z.string()).optional(),
    customRequirements: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Gemini] Generating estimate for:", input.clientName);

    const prompt = `Create a professional contractor estimate for:

Client: ${input.clientName}
Job Type: ${input.jobType}
Description: ${input.jobDescription}
${input.area ? `Area: ${input.area} sq ft` : ''}
${input.materials?.length ? `Materials: ${input.materials.join(', ')}` : ''}
${input.customRequirements ? `Special Requirements: ${input.customRequirements}` : ''}

Generate a complete estimate including:
1. Detailed scope of work
2. Materials list with quantities and costs
3. Labor breakdown with hours and rates
4. Equipment and tool costs
5. Permit and inspection fees
6. Contingency (10%)
7. Total cost
8. Payment terms
9. Timeline
10. Terms and conditions

Make it professional and ready to send to client.`;

    const result = await callGemini(prompt, "gemini-1.5-pro");
    return { estimate: result };
  });

export const generateContractRoute = publicProcedure
  .input(z.object({
    clientName: z.string(),
    clientAddress: z.string(),
    jobType: z.string(),
    scope: z.string(),
    totalCost: z.number(),
    startDate: z.string(),
    completionDate: z.string(),
    paymentTerms: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Gemini] Generating contract for:", input.clientName);

    const prompt = `Generate a legally sound contractor service agreement with these details:

CLIENT INFORMATION:
Name: ${input.clientName}
Address: ${input.clientAddress}

PROJECT DETAILS:
Type: ${input.jobType}
Scope: ${input.scope}
Total Cost: $${input.totalCost.toLocaleString()}
Start Date: ${input.startDate}
Completion Date: ${input.completionDate}
${input.paymentTerms ? `Payment Terms: ${input.paymentTerms}` : 'Payment Terms: 50% deposit, 25% at midpoint, 25% upon completion'}

Include standard sections:
1. Parties and project description
2. Scope of work
3. Contract price and payment schedule
4. Timeline and schedule
5. Change orders
6. Warranties
7. Insurance and liability
8. Termination clause
9. Dispute resolution
10. Signatures

Make it professional and contractor-friendly while fair to client.`;

    const result = await callGemini(prompt, "gemini-1.5-pro");
    return { contract: result };
  });

export const analyzePhotoIssuesRoute = publicProcedure
  .input(z.object({
    imageBase64: z.string(),
    context: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Gemini] Analyzing photo for issues");

    const prompt = `You are an expert contractor inspector. Analyze this construction/property photo and identify:

${input.context ? `Context: ${input.context}` : ''}

1. Any visible issues, damage, or defects
2. Safety concerns
3. Code compliance issues
4. Quality concerns
5. Recommended repairs or fixes
6. Estimated severity (minor/moderate/severe)
7. Priority level (low/medium/high/urgent)

Be specific and detailed. Format as JSON with fields: issues (array of {description, severity, priority, recommendedAction}), safetyNote, overallAssessment`;

    const result = await callGeminiVision(prompt, input.imageBase64);
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.log("[Gemini] Could not parse JSON, returning raw text");
    }

    return { analysis: result };
  });

export const generateInspectionNotesRoute = publicProcedure
  .input(z.object({
    inspectionType: z.string(),
    findings: z.string(),
    location: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Gemini] Generating inspection notes:", input.inspectionType);

    const prompt = `Generate professional inspection notes for:

Inspection Type: ${input.inspectionType}
${input.location ? `Location: ${input.location}` : ''}

Findings:
${input.findings}

Create comprehensive notes including:
1. Executive summary
2. Detailed findings
3. Photos/evidence notes
4. Recommendations
5. Next steps
6. Follow-up required

Make it professional and thorough for documentation purposes.`;

    const result = await callGemini(prompt);
    return { notes: result };
  });

export const optimizeScheduleRoute = publicProcedure
  .input(z.object({
    jobs: z.array(z.object({
      id: z.string(),
      title: z.string(),
      location: z.string(),
      duration: z.number(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      deadline: z.string().optional(),
    })),
    crews: z.array(z.object({
      id: z.string(),
      name: z.string(),
      skills: z.array(z.string()),
    })),
    constraints: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Gemini] Optimizing schedule for", input.jobs.length, "jobs");

    const prompt = `As a construction project scheduler, optimize this schedule:

JOBS:
${input.jobs.map((j, i) => `${i + 1}. ${j.title}
   Location: ${j.location}
   Duration: ${j.duration} hours
   Priority: ${j.priority}
   ${j.deadline ? `Deadline: ${j.deadline}` : ''}`).join('\n\n')}

CREWS:
${input.crews.map((c, i) => `${i + 1}. ${c.name} - Skills: ${c.skills.join(', ')}`).join('\n')}

${input.constraints ? `Constraints: ${input.constraints}` : ''}

Provide:
1. Optimized schedule (which crew, when, route)
2. Reasoning for schedule
3. Efficiency improvements
4. Risk factors
5. Contingency plans

Format as JSON with fields: schedule (array of {jobId, crewId, startTime, notes}), reasoning, efficiency, risks`;

    const result = await callGemini(prompt, "gemini-1.5-pro");
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.log("[Gemini] Could not parse JSON, returning raw text");
    }

    return { schedule: result };
  });

export const assistMeasurementRoute = publicProcedure
  .input(z.object({
    imageBase64: z.string().optional(),
    measurements: z.array(z.object({
      label: z.string(),
      value: z.number(),
      unit: z.string(),
    })).optional(),
    projectType: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Gemini] Assisting with measurements for:", input.projectType);

    if (input.imageBase64) {
      const prompt = `You are a professional contractor measurement assistant. Analyze this image for the ${input.projectType} project.

Provide:
1. Visible dimensions and measurements
2. Suggested measurement points
3. Area calculations
4. Material quantities needed
5. Important considerations

Be precise and contractor-focused.`;

      const result = await callGeminiVision(prompt, input.imageBase64);
      return { analysis: result };
    } else if (input.measurements) {
      const prompt = `As a measurement expert for ${input.projectType}, analyze these measurements:

${input.measurements.map((m, i) => `${i + 1}. ${m.label}: ${m.value} ${m.unit}`).join('\n')}

Provide:
1. Total area/volume calculations
2. Material quantities needed
3. Waste factor recommendations
4. Cost estimation factors
5. Measurement validation

Format clearly for contractor use.`;

      const result = await callGemini(prompt);
      return { analysis: result };
    }

    throw new Error("Either imageBase64 or measurements must be provided");
  });

export const designBackyardRoute = publicProcedure
  .input(z.object({
    area: z.number(),
    style: z.string().optional(),
    features: z.array(z.string()).optional(),
    budget: z.number().optional(),
    climate: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Gemini] Designing backyard:", input.area, "sq ft");

    const prompt = `As a professional landscape designer, create a backyard design plan:

Area: ${input.area} sq ft
${input.style ? `Style: ${input.style}` : ''}
${input.features?.length ? `Desired Features: ${input.features.join(', ')}` : ''}
${input.budget ? `Budget: $${input.budget.toLocaleString()}` : ''}
${input.climate ? `Climate: ${input.climate}` : ''}

Provide:
1. Overall design concept
2. Layout recommendations
3. Plant selections (appropriate for climate)
4. Hardscape elements
5. Material list
6. Cost breakdown
7. Maintenance requirements
8. Phased implementation plan

Be practical and contractor-focused.`;

    const result = await callGemini(prompt, "gemini-1.5-pro");
    return { design: result };
  });
