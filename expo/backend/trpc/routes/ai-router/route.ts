import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { UserRole } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyB1tnfZQI1GCjoaaL6rkvo66_f01dyGBvo";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AIModel = "gemini" | "openai" | "claude";
type TaskType = 
  | "image_analysis"
  | "backyard_design"
  | "job_costing"
  | "pricing_suggestion"
  | "contract_generation"
  | "customer_message"
  | "crew_instructions"
  | "generic_chat"
  | "estimate_generation"
  | "photo_damage_detection"
  | "measurement_assistant"
  | "scheduling_optimization"
  | "checklist_suggestions";

const TASK_MODEL_MAP: Record<TaskType, AIModel> = {
  image_analysis: "gemini",
  backyard_design: "gemini",
  photo_damage_detection: "gemini",
  measurement_assistant: "gemini",
  job_costing: "claude",
  pricing_suggestion: "claude",
  scheduling_optimization: "claude",
  checklist_suggestions: "claude",
  contract_generation: "openai",
  customer_message: "openai",
  estimate_generation: "openai",
  crew_instructions: "claude",
  generic_chat: "claude",
};

const ADMIN_SYSTEM_PROMPT = `You are ContractorOS AI Office Manager assisting an admin of a contracting company.
- You can see job costs, margins, pricing, full client history, and internal notes.
- Always think like an operations manager trying to improve profit, efficiency, and clarity.
- When you give numbers, be explicit and itemized.
- Never reveal internal margins to customers; assume the person you're talking to is internal staff.
- Be professional, concise, and action-oriented.`;

const CREW_SYSTEM_PROMPT = `You are ContractorOS AI Crew Assistant. You are helping a crew member in the field.
- Only talk about tasks, safety, tools, and step-by-step instructions.
- Do NOT mention pricing, cost, or profit margin.
- Keep responses short, clear, and practical.
- If the user asks about pricing or money, tell them to contact their admin.
- Focus on helping them complete their work efficiently and safely.`;

async function callGemini(prompt: string, systemPrompt?: string, model: string = "gemini-1.5-flash"): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  console.log("[AI Router] Calling Gemini:", model);

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: fullPrompt
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
    console.error("[AI Router] Gemini error:", error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  console.log("[AI Router] Gemini response received");
  return text;
}

async function callGeminiVision(prompt: string, imageBase64: string, systemPrompt?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  console.log("[AI Router] Calling Gemini Vision");

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: fullPrompt },
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
    console.error("[AI Router] Gemini Vision error:", error);
    throw new Error(`Gemini Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  console.log("[AI Router] Gemini Vision response received");
  return text;
}

async function callOpenAI(prompt: string, systemPrompt?: string, model: string = "gpt-4o-mini"): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.log("[AI Router] OpenAI key not configured, using Gemini fallback");
    return callGemini(prompt, systemPrompt);
  }

  console.log("[AI Router] Calling OpenAI:", model);

  const messages: any[] = [];
  
  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt
    });
  }

  messages.push({
    role: "user",
    content: prompt
  });

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[AI Router] OpenAI error:", error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  
  console.log("[AI Router] OpenAI response received");
  return text;
}

async function callClaude(prompt: string, systemPrompt?: string, model: string = "claude-3-5-sonnet-20241022"): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    console.log("[AI Router] Claude key not configured, using Gemini fallback");
    return callGemini(prompt, systemPrompt);
  }

  console.log("[AI Router] Calling Claude:", model);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt || "You are a helpful AI assistant for contractors.",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[AI Router] Claude error:", error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  
  console.log("[AI Router] Claude response received");
  return text;
}

async function routeAITask(
  taskType: TaskType,
  prompt: string,
  role: UserRole,
  imageBase64?: string
): Promise<{ text: string; modelUsed: AIModel }> {
  const model = TASK_MODEL_MAP[taskType] || "claude";
  const systemPrompt = role === "admin" ? ADMIN_SYSTEM_PROMPT : CREW_SYSTEM_PROMPT;

  let text: string;

  try {
    switch (model) {
      case "gemini":
        if (imageBase64) {
          text = await callGeminiVision(prompt, imageBase64, systemPrompt);
        } else {
          text = await callGemini(prompt, systemPrompt);
        }
        break;
      case "openai":
        text = await callOpenAI(prompt, systemPrompt);
        break;
      case "claude":
      default:
        text = await callClaude(prompt, systemPrompt);
        break;
    }

    return { text, modelUsed: model };
  } catch (error) {
    console.error(`[AI Router] Error with ${model}:`, error);
    console.log(`[AI Router] Attempting Gemini fallback`);
    
    try {
      text = await callGemini(prompt, systemPrompt);
      return { text, modelUsed: "gemini" };
    } catch (fallbackError) {
      console.error(`[AI Router] Fallback also failed:`, fallbackError);
      throw new Error(`AI service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const aiOfficeManagerRoute = publicProcedure
  .input(z.object({
    message: z.string(),
    taskType: z.enum([
      "generic_chat",
      "job_costing",
      "estimate_generation",
      "contract_generation",
      "customer_message",
      "crew_instructions",
      "scheduling_optimization",
    ]).optional(),
    role: z.enum(["admin", "crew"]).default("admin"),
    context: z.any().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[AI Office Manager] Processing request:", input.taskType || "generic_chat");

    const taskType = input.taskType || "generic_chat";
    
    const result = await routeAITask(
      taskType,
      input.message,
      input.role,
    );

    return {
      message: result.text,
      modelUsed: result.modelUsed,
      taskType,
    };
  });

export const aiImageAnalysisRoute = publicProcedure
  .input(z.object({
    imageBase64: z.string(),
    prompt: z.string(),
    taskType: z.enum(["image_analysis", "photo_damage_detection", "measurement_assistant"]).default("image_analysis"),
    role: z.enum(["admin", "crew"]).default("admin"),
  }))
  .mutation(async ({ input }) => {
    console.log("[AI Image Analysis] Analyzing image with Gemini");

    const result = await routeAITask(
      input.taskType,
      input.prompt,
      input.role,
      input.imageBase64
    );

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          ...JSON.parse(jsonMatch[0]),
          modelUsed: result.modelUsed,
        };
      }
    } catch {
      console.log("[AI Image Analysis] Could not parse JSON");
    }

    return {
      analysis: result.text,
      modelUsed: result.modelUsed,
    };
  });

export const aiJobCostingRoute = publicProcedure
  .input(z.object({
    jobId: z.string().optional(),
    notes: z.string(),
    materials: z.array(z.object({
      name: z.string(),
      quantity: z.number(),
      cost: z.number(),
    })).optional(),
    laborHours: z.number().optional(),
    receipts: z.array(z.object({
      vendor: z.string(),
      amount: z.number(),
      category: z.string(),
    })).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[AI Job Costing] Analyzing job costs with Claude");

    let prompt = `Analyze the following job costs and provide a detailed breakdown:\n\n`;
    prompt += `Notes: ${input.notes}\n\n`;

    if (input.materials?.length) {
      prompt += `Materials Used:\n`;
      input.materials.forEach(m => {
        prompt += `- ${m.name}: ${m.quantity} units @ $${m.cost} = $${m.quantity * m.cost}\n`;
      });
      prompt += `\n`;
    }

    if (input.laborHours) {
      prompt += `Labor Hours: ${input.laborHours}\n\n`;
    }

    if (input.receipts?.length) {
      prompt += `Receipts:\n`;
      input.receipts.forEach(r => {
        prompt += `- ${r.vendor} (${r.category}): $${r.amount}\n`;
      });
      prompt += `\n`;
    }

    prompt += `Please provide:\n`;
    prompt += `1. Total materials cost\n`;
    prompt += `2. Total labor cost (estimate if not provided)\n`;
    prompt += `3. Total job cost\n`;
    prompt += `4. Recommended pricing (with healthy margin)\n`;
    prompt += `5. Profit margin percentage\n`;
    prompt += `6. Cost optimization suggestions\n\n`;
    prompt += `Format as JSON with fields: materialsCost, laborCost, totalCost, recommendedPrice, marginPercent, suggestions (array)`;

    const result = await routeAITask(
      "job_costing",
      prompt,
      "admin"
    );

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          ...JSON.parse(jsonMatch[0]),
          modelUsed: result.modelUsed,
        };
      }
    } catch {
      console.log("[AI Job Costing] Could not parse JSON");
    }

    return {
      analysis: result.text,
      modelUsed: result.modelUsed,
    };
  });

export const aiGenerateContractRoute = publicProcedure
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
    console.log("[AI Contract Generation] Generating contract with OpenAI for:", input.clientName);

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
2. Detailed scope of work
3. Contract price and payment schedule
4. Project timeline and schedule
5. Change orders process
6. Warranties and guarantees
7. Insurance and liability
8. Termination clause
9. Dispute resolution
10. Signature blocks

Make it professional, contractor-friendly while fair to client, and ready to print/sign.`;

    const result = await routeAITask(
      "contract_generation",
      prompt,
      "admin"
    );

    return {
      contract: result.text,
      modelUsed: result.modelUsed,
    };
  });

export const aiChecklistSuggestionsRoute = publicProcedure
  .input(z.object({
    jobType: z.string(),
    jobDescription: z.string().optional(),
    existingTasks: z.array(z.string()).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[AI Checklist] Generating task suggestions with Claude");

    let prompt = `Generate a comprehensive checklist for a ${input.jobType} job.\n\n`;
    
    if (input.jobDescription) {
      prompt += `Job Description: ${input.jobDescription}\n\n`;
    }

    if (input.existingTasks?.length) {
      prompt += `Existing tasks (don't duplicate these):\n`;
      input.existingTasks.forEach(task => {
        prompt += `- ${task}\n`;
      });
      prompt += `\n`;
    }

    prompt += `Generate 8-12 specific, actionable tasks organized by phase:\n`;
    prompt += `- Preparation (3-4 tasks)\n`;
    prompt += `- Execution (4-6 tasks)\n`;
    prompt += `- Completion (2-3 tasks)\n\n`;
    prompt += `For each task, include:\n`;
    prompt += `1. Clear task description\n`;
    prompt += `2. Category (preparation/execution/completion)\n`;
    prompt += `3. Priority (high/medium/low)\n\n`;
    prompt += `Format as JSON array: [{ task: string, category: string, priority: string }]`;

    const result = await routeAITask(
      "checklist_suggestions",
      prompt,
      "admin"
    );

    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return {
          suggestions: JSON.parse(jsonMatch[0]),
          modelUsed: result.modelUsed,
        };
      }
    } catch {
      console.log("[AI Checklist] Could not parse JSON");
    }

    return {
      analysis: result.text,
      modelUsed: result.modelUsed,
    };
  });
