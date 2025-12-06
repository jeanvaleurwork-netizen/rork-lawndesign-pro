import { publicProcedure } from "../../create-context";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyB1tnfZQI1GCjoaaL6rkvo66_f01dyGBvo";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  console.log("[Pagos AI] Calling Gemini for financial analysis");

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Pagos AI] Gemini error:", error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  console.log("[Pagos AI] Analysis complete");
  return text;
}

export const analyzePaymentPatternsRoute = publicProcedure
  .input(z.object({
    invoices: z.array(z.object({
      id: z.string(),
      clientId: z.string(),
      clientName: z.string(),
      amount: z.number(),
      status: z.enum(["sent", "paid", "overdue"]),
      createdDate: z.string(),
      dueDate: z.string(),
      paidDate: z.string().optional(),
    })),
    payments: z.array(z.object({
      invoiceId: z.string(),
      amount: z.number(),
      method: z.string(),
      paidDate: z.string(),
    })).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Pagos AI] Analyzing payment patterns for", input.invoices.length, "invoices");

    const paidInvoices = input.invoices.filter(inv => inv.status === "paid" && inv.paidDate);
    const overdueInvoices = input.invoices.filter(inv => inv.status === "overdue");
    const pendingInvoices = input.invoices.filter(inv => inv.status === "sent");

    const analysisData = {
      totalInvoices: input.invoices.length,
      paidInvoices: paidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      pendingInvoices: pendingInvoices.length,
      totalPaid: paidInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      totalOverdue: overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      totalPending: pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    };

    const paymentDays = paidInvoices.map(inv => {
      const due = new Date(inv.dueDate);
      const paid = new Date(inv.paidDate!);
      return Math.floor((paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avgDaysFromDue = paymentDays.length > 0 
      ? paymentDays.reduce((sum, days) => sum + days, 0) / paymentDays.length 
      : 0;

    const prompt = `Analyze the following payment data and provide actionable insights:

PAYMENT STATISTICS:
- Total Invoices: ${analysisData.totalInvoices}
- Paid: ${analysisData.paidInvoices} ($${analysisData.totalPaid.toLocaleString()})
- Overdue: ${analysisData.overdueInvoices} ($${analysisData.totalOverdue.toLocaleString()})
- Pending: ${analysisData.pendingInvoices} ($${analysisData.totalPending.toLocaleString()})
- Average days from due date: ${avgDaysFromDue.toFixed(1)} days

PAYMENT PATTERNS:
${paidInvoices.slice(0, 10).map(inv => 
  `- ${inv.clientName}: $${inv.amount} (Created: ${inv.createdDate}, Paid: ${inv.paidDate})`
).join('\n')}

Provide analysis as JSON with this exact structure:
{
  "insights": [
    { "title": "string", "description": "string", "impact": "high|medium|low", "type": "positive|negative|neutral" }
  ],
  "recommendations": [
    { "title": "string", "action": "string", "expectedImpact": "string", "priority": "high|medium|low" }
  ],
  "cashFlowScore": number (0-100),
  "collectionEfficiency": number (0-100),
  "riskFactors": [
    { "factor": "string", "severity": "high|medium|low", "mitigation": "string" }
  ],
  "trends": {
    "paymentSpeed": "improving|stable|declining",
    "overdueRate": "increasing|stable|decreasing",
    "cashFlowHealth": "excellent|good|fair|poor"
  }
}`;

    const systemPrompt = `You are Pagos AI, an advanced payment intelligence system for contractors. 
Analyze payment patterns, cash flow, and provide actionable financial insights. 
Be specific with numbers and realistic with recommendations.
Focus on improving cash flow, reducing overdue payments, and optimizing collection processes.
Return ONLY valid JSON.`;

    const result = await callGemini(prompt, systemPrompt);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          ...analysis,
          rawStats: analysisData,
          avgDaysFromDue: Math.round(avgDaysFromDue),
        };
      }
    } catch (error) {
      console.error("[Pagos AI] Failed to parse JSON:", error);
    }

    return {
      insights: [
        {
          title: "Payment Analysis Complete",
          description: result,
          impact: "medium" as const,
          type: "neutral" as const,
        }
      ],
      recommendations: [],
      cashFlowScore: 75,
      collectionEfficiency: 80,
      riskFactors: [],
      trends: {
        paymentSpeed: "stable" as const,
        overdueRate: "stable" as const,
        cashFlowHealth: "good" as const,
      },
      rawStats: analysisData,
      avgDaysFromDue: Math.round(avgDaysFromDue),
    };
  });

export const predictPaymentsRoute = publicProcedure
  .input(z.object({
    invoices: z.array(z.object({
      id: z.string(),
      clientId: z.string(),
      clientName: z.string(),
      amount: z.number(),
      status: z.enum(["sent", "paid", "overdue"]),
      createdDate: z.string(),
      dueDate: z.string(),
    })),
    historicalData: z.object({
      clientPaymentHistory: z.record(z.string(), z.object({
        avgDaysToPayment: z.number(),
        reliability: z.number(),
        totalPaid: z.number(),
      })),
    }).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Pagos AI] Predicting payments for", input.invoices.length, "invoices");

    const pendingInvoices = input.invoices.filter(inv => inv.status === "sent");
    
    const prompt = `As a payment prediction AI, analyze these pending invoices and predict payment likelihood:

PENDING INVOICES:
${pendingInvoices.map(inv => 
  `- ${inv.clientName}: $${inv.amount} (Due: ${inv.dueDate})`
).join('\n')}

${input.historicalData ? `
HISTORICAL CLIENT DATA:
${Object.entries(input.historicalData.clientPaymentHistory).map(([clientId, data]) => {
  const entry = data as { avgDaysToPayment: number; reliability: number; totalPaid: number };
  return `- Client: Avg ${entry.avgDaysToPayment} days, ${entry.reliability}% reliability, ${entry.totalPaid} paid`;
}).join('\n')}
` : ''}

Provide predictions as JSON:
{
  "predictions": [
    {
      "invoiceId": "string",
      "clientName": "string",
      "amount": number,
      "predictedPaymentDate": "YYYY-MM-DD",
      "confidence": number (0-100),
      "likelihood": "high|medium|low",
      "riskLevel": "low|medium|high",
      "recommendedAction": "string"
    }
  ],
  "cashFlowForecast": [
    {
      "date": "YYYY-MM-DD",
      "expectedInflow": number,
      "confidence": number
    }
  ],
  "totalExpectedRevenue": number,
  "confidenceScore": number (0-100)
}`;

    const systemPrompt = `You are Pagos AI payment predictor. Analyze invoice data and client behavior to predict payment dates.
Be realistic and conservative with predictions. Consider industry standards (contractors typically get paid 30-45 days).
Return ONLY valid JSON.`;

    const result = await callGemini(prompt, systemPrompt);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("[Pagos AI] Failed to parse JSON:", error);
    }

    const fallbackPredictions = pendingInvoices.map(inv => {
      const dueDate = new Date(inv.dueDate);
      const predictedDate = new Date(dueDate);
      predictedDate.setDate(predictedDate.getDate() + 15);

      return {
        invoiceId: inv.id,
        clientName: inv.clientName,
        amount: inv.amount,
        predictedPaymentDate: predictedDate.toISOString().split('T')[0],
        confidence: 70,
        likelihood: "medium" as const,
        riskLevel: "medium" as const,
        recommendedAction: "Send reminder 7 days before due date",
      };
    });

    return {
      predictions: fallbackPredictions,
      cashFlowForecast: [],
      totalExpectedRevenue: pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      confidenceScore: 70,
    };
  });

export const optimizeCashFlowRoute = publicProcedure
  .input(z.object({
    currentBalance: z.number(),
    monthlyExpenses: z.number(),
    pendingInvoices: z.array(z.object({
      amount: z.number(),
      dueDate: z.string(),
    })),
    upcomingExpenses: z.array(z.object({
      description: z.string(),
      amount: z.number(),
      dueDate: z.string(),
    })),
    payrollDue: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log("[Pagos AI] Optimizing cash flow");

    const totalPending = input.pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalUpcoming = input.upcomingExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const projectedBalance = input.currentBalance + totalPending - totalUpcoming - (input.payrollDue || 0);

    const prompt = `Analyze this contractor's cash flow and provide optimization strategies:

CURRENT FINANCIAL POSITION:
- Current Balance: $${input.currentBalance.toLocaleString()}
- Monthly Expenses: $${input.monthlyExpenses.toLocaleString()}
- Pending Receivables: $${totalPending.toLocaleString()} (${input.pendingInvoices.length} invoices)
- Upcoming Expenses: $${totalUpcoming.toLocaleString()}
${input.payrollDue ? `- Payroll Due: $${input.payrollDue.toLocaleString()}` : ''}
- Projected Balance: $${projectedBalance.toLocaleString()}

PENDING INVOICES:
${input.pendingInvoices.slice(0, 5).map(inv => 
  `- $${inv.amount.toLocaleString()} due ${inv.dueDate}`
).join('\n')}

UPCOMING EXPENSES:
${input.upcomingExpenses.slice(0, 5).map(exp => 
  `- ${exp.description}: $${exp.amount.toLocaleString()} due ${exp.dueDate}`
).join('\n')}

Provide cash flow optimization as JSON:
{
  "healthScore": number (0-100),
  "riskLevel": "low|medium|high|critical",
  "daysOfCashOnHand": number,
  "optimizations": [
    {
      "strategy": "string",
      "description": "string",
      "potentialSavings": number,
      "difficulty": "easy|medium|hard",
      "timeframe": "immediate|short-term|long-term"
    }
  ],
  "urgentActions": [
    {
      "action": "string",
      "reason": "string",
      "priority": "critical|high|medium"
    }
  ],
  "forecastNext30Days": {
    "expectedInflow": number,
    "expectedOutflow": number,
    "projectedEndBalance": number,
    "confidence": number
  }
}`;

    const systemPrompt = `You are Pagos AI cash flow optimizer for contractors. 
Provide practical, actionable strategies to improve cash flow and financial stability.
Focus on payment acceleration, expense optimization, and risk mitigation.
Return ONLY valid JSON.`;

    const result = await callGemini(prompt, systemPrompt);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("[Pagos AI] Failed to parse JSON:", error);
    }

    const daysOfCash = (input.currentBalance / input.monthlyExpenses) * 30;
    const healthScore = Math.min(100, Math.max(0, (daysOfCash / 60) * 100));

    return {
      healthScore: Math.round(healthScore),
      riskLevel: healthScore > 70 ? "low" : healthScore > 40 ? "medium" : "high",
      daysOfCashOnHand: Math.round(daysOfCash),
      optimizations: [
        {
          strategy: "Accelerate Invoice Collection",
          description: "Send payment reminders for invoices approaching due date",
          potentialSavings: totalPending * 0.1,
          difficulty: "easy" as const,
          timeframe: "immediate" as const,
        },
        {
          strategy: "Negotiate Payment Terms",
          description: "Request deposit payments for new projects",
          potentialSavings: input.monthlyExpenses * 0.5,
          difficulty: "medium" as const,
          timeframe: "short-term" as const,
        }
      ],
      urgentActions: healthScore < 50 ? [
        {
          action: "Follow up on overdue invoices immediately",
          reason: "Cash flow is below recommended threshold",
          priority: "high" as const,
        }
      ] : [],
      forecastNext30Days: {
        expectedInflow: totalPending,
        expectedOutflow: totalUpcoming + input.monthlyExpenses,
        projectedEndBalance: projectedBalance,
        confidence: 75,
      }
    };
  });

export const analyzeClientPaymentBehaviorRoute = publicProcedure
  .input(z.object({
    clientId: z.string(),
    clientName: z.string(),
    invoices: z.array(z.object({
      id: z.string(),
      amount: z.number(),
      status: z.enum(["sent", "paid", "overdue"]),
      createdDate: z.string(),
      dueDate: z.string(),
      paidDate: z.string().optional(),
    })),
  }))
  .mutation(async ({ input }) => {
    console.log("[Pagos AI] Analyzing client payment behavior for:", input.clientName);

    const paidInvoices = input.invoices.filter(inv => inv.status === "paid" && inv.paidDate);
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const avgAmount = paidInvoices.length > 0 ? totalPaid / paidInvoices.length : 0;

    const paymentDays = paidInvoices.map(inv => {
      const due = new Date(inv.dueDate);
      const paid = new Date(inv.paidDate!);
      return Math.floor((paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avgDaysFromDue = paymentDays.length > 0 
      ? paymentDays.reduce((sum, days) => sum + days, 0) / paymentDays.length 
      : 0;

    const onTimePayments = paymentDays.filter(days => days <= 0).length;
    const latePayments = paymentDays.filter(days => days > 0).length;
    const reliabilityScore = paidInvoices.length > 0 
      ? (onTimePayments / paidInvoices.length) * 100 
      : 0;

    const prompt = `Analyze this client's payment behavior and provide insights:

CLIENT: ${input.clientName}
TOTAL INVOICES: ${input.invoices.length}
PAID: ${paidInvoices.length} ($${totalPaid.toLocaleString()})
AVERAGE PAYMENT: $${avgAmount.toLocaleString()}
AVERAGE DAYS FROM DUE: ${avgDaysFromDue.toFixed(1)}
ON-TIME PAYMENTS: ${onTimePayments} / ${paidInvoices.length}
RELIABILITY SCORE: ${reliabilityScore.toFixed(1)}%

PAYMENT HISTORY:
${paidInvoices.slice(0, 10).map(inv => {
  const daysLate = Math.floor((new Date(inv.paidDate!).getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  return `- $${inv.amount} - ${daysLate > 0 ? daysLate + ' days late' : 'on time'}`;
}).join('\n')}

Provide analysis as JSON:
{
  "clientScore": number (0-100),
  "riskLevel": "low|medium|high",
  "paymentProfile": "excellent|good|average|poor|problematic",
  "insights": [
    { "finding": "string", "significance": "high|medium|low" }
  ],
  "recommendations": [
    { "action": "string", "benefit": "string" }
  ],
  "predictedBehavior": {
    "nextPaymentLikelihood": number (0-100),
    "recommendedTerms": "string",
    "collectionStrategy": "string"
  }
}`;

    const systemPrompt = `You are Pagos AI client behavior analyzer. 
Assess client payment reliability and provide tailored collection strategies.
Be honest about risks but constructive with recommendations.
Return ONLY valid JSON.`;

    const result = await callGemini(prompt, systemPrompt);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          ...JSON.parse(jsonMatch[0]),
          statistics: {
            totalInvoices: input.invoices.length,
            paidInvoices: paidInvoices.length,
            totalPaid,
            avgAmount: Math.round(avgAmount),
            avgDaysFromDue: Math.round(avgDaysFromDue),
            reliabilityScore: Math.round(reliabilityScore),
            onTimePayments,
            latePayments,
          }
        };
      }
    } catch (error) {
      console.error("[Pagos AI] Failed to parse JSON:", error);
    }

    return {
      clientScore: Math.round(reliabilityScore),
      riskLevel: reliabilityScore > 80 ? "low" : reliabilityScore > 50 ? "medium" : "high",
      paymentProfile: reliabilityScore > 90 ? "excellent" : reliabilityScore > 70 ? "good" : reliabilityScore > 50 ? "average" : "poor",
      insights: [
        {
          finding: `Client pays on average ${Math.abs(avgDaysFromDue).toFixed(0)} days ${avgDaysFromDue > 0 ? 'late' : 'early'}`,
          significance: "high" as const,
        }
      ],
      recommendations: [],
      predictedBehavior: {
        nextPaymentLikelihood: Math.round(reliabilityScore),
        recommendedTerms: reliabilityScore > 80 ? "Standard 30-day terms" : "Request deposit or shorter terms",
        collectionStrategy: avgDaysFromDue > 15 ? "Follow up before due date" : "Standard collection process",
      },
      statistics: {
        totalInvoices: input.invoices.length,
        paidInvoices: paidInvoices.length,
        totalPaid,
        avgAmount: Math.round(avgAmount),
        avgDaysFromDue: Math.round(avgDaysFromDue),
        reliabilityScore: Math.round(reliabilityScore),
        onTimePayments,
        latePayments,
      }
    };
  });
