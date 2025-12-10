import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../../create-context";
import { generateId } from "@/utils/id-generator";
import { TradeType, RiskLevel, PaymentStatus } from "@/types";
import { getRiskClauses, getTradeSpecificClauses } from "@/constants/contract-templates";

interface PaymentMilestone {
  label: string;
  duePercent: number;
  dueAmount: number;
}

function generateSmartPaymentSchedule(totalAmount: number): PaymentMilestone[] {
  if (totalAmount <= 2000) {
    return [
      { label: "Deposit", duePercent: 50, dueAmount: totalAmount * 0.5 },
      { label: "Final Payment", duePercent: 50, dueAmount: totalAmount * 0.5 },
    ];
  } else if (totalAmount <= 10000) {
    return [
      { label: "Deposit", duePercent: 33, dueAmount: totalAmount * 0.33 },
      { label: "Progress Payment", duePercent: 33, dueAmount: totalAmount * 0.33 },
      { label: "Final Payment", duePercent: 34, dueAmount: totalAmount * 0.34 },
    ];
  } else if (totalAmount <= 50000) {
    return [
      { label: "Deposit", duePercent: 30, dueAmount: totalAmount * 0.3 },
      { label: "Progress Payment 1", duePercent: 30, dueAmount: totalAmount * 0.3 },
      { label: "Progress Payment 2", duePercent: 30, dueAmount: totalAmount * 0.3 },
      { label: "Final Payment", duePercent: 10, dueAmount: totalAmount * 0.1 },
    ];
  } else {
    return [
      { label: "Deposit", duePercent: 20, dueAmount: totalAmount * 0.2 },
      { label: "Progress Payment 1", duePercent: 20, dueAmount: totalAmount * 0.2 },
      { label: "Progress Payment 2", duePercent: 20, dueAmount: totalAmount * 0.2 },
      { label: "Progress Payment 3", duePercent: 20, dueAmount: totalAmount * 0.2 },
      { label: "Final Payment", duePercent: 20, dueAmount: totalAmount * 0.2 },
    ];
  }
}

function calculateRiskLevel(totalAmount: number, delayDays: number, overrunPercent: number): RiskLevel {
  if (totalAmount < 5000 && delayDays <= 0 && overrunPercent <= 5) {
    return "SMALL";
  } else if (totalAmount >= 5000 && totalAmount < 30000 && delayDays <= 7) {
    return "MEDIUM";
  } else if (totalAmount >= 30000 || delayDays > 7 || overrunPercent > 10) {
    return "LARGE";
  } else if (delayDays > 14 || overrunPercent > 20) {
    return "HIGH_RISK";
  }
  return "MEDIUM";
}

function getSmartWarrantyYears(tradeType?: TradeType): number {
  if (!tradeType) return 1;
  
  const warrantyMap: Record<TradeType, number> = {
    roofing: 10,
    siding: 5,
    painting: 2,
    hvac: 3,
    plumbing: 3,
    electrical: 3,
    landscaping: 2,
    tree_service: 1,
    pool_service: 2,
    pressure_washing: 0,
    renovation: 5,
    general_contractor: 5,
    concrete: 3,
    framing: 5,
    flooring: 2,
    drywall: 2,
    masonry: 5,
    carpentry: 3,
    garage_door: 3,
  };
  
  return warrantyMap[tradeType] || 1;
}

function generateProjectDurationText(durationDays: number): string {
  if (durationDays <= 7) {
    return `Estimated project duration: ${durationDays} business days`;
  } else if (durationDays <= 14) {
    return `Estimated project duration: ${durationDays} business days (approximately 2-3 weeks)`;
  } else if (durationDays <= 30) {
    return `Estimated project duration: ${durationDays} business days (approximately 1 month)`;
  } else {
    const weeks = Math.round(durationDays / 7);
    return `Estimated project duration: ${durationDays} business days (approximately ${weeks} weeks)`;
  }
}

function generatePriceProtectionClause(totalAmount: number): string {
  if (totalAmount > 10000) {
    return `<p><strong>Price Protection Clause:</strong> Material prices are subject to adjustment if material costs increase by more than 10% between contract signing and material procurement. Client will be notified in writing of any price adjustments before materials are ordered.</p>`;
  }
  return "";
}

function generateMaterialSubstitutionClause(): string {
  return `<p><strong>Material Substitution Policy:</strong> Materials may be substituted with equivalent or better alternatives if the specified brand/model is unavailable. Contractor will notify Client of any substitutions prior to installation. Substitutions will maintain or exceed the quality and specifications of originally specified materials.</p>`;
}

export const smartContractsRouter = createTRPCRouter({
  generateSmartPaymentSchedule: publicProcedure
    .input(z.object({
      totalAmount: z.number(),
    }))
    .query(async ({ input }) => {
      const schedule = generateSmartPaymentSchedule(input.totalAmount);
      console.log("[SmartContracts] Generated payment schedule for:", input.totalAmount);
      return { schedule };
    }),

  generateProjectForecast: publicProcedure
    .input(z.object({
      projectId: z.string(),
      totalAmount: z.number(),
      estimatedDurationDays: z.number(),
      changeOrdersTotal: z.number().optional(),
      changeOrdersCount: z.number().optional(),
      timelineImpactDays: z.number().optional(),
      tradeType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const forecastId = generateId("forecast");
      
      const changeOrderImpact = input.changeOrdersTotal || 0;
      const timelineDelay = input.timelineImpactDays || 0;
      
      const forecastCostOverrunPercent = (changeOrderImpact / input.totalAmount) * 100;
      const forecastDelayDays = timelineDelay;
      
      const originalEndDate = new Date();
      originalEndDate.setDate(originalEndDate.getDate() + input.estimatedDurationDays);
      
      const forecastEndDate = new Date(originalEndDate);
      forecastEndDate.setDate(forecastEndDate.getDate() + forecastDelayDays);
      
      const riskLevel = calculateRiskLevel(input.totalAmount, forecastDelayDays, forecastCostOverrunPercent);
      
      let forecastNotes = "";
      if (riskLevel === "HIGH_RISK") {
        forecastNotes = "High risk of delays and cost overruns. Review change orders and timeline immediately.";
      } else if (riskLevel === "LARGE") {
        forecastNotes = "Project showing signs of potential delays or budget concerns. Monitor closely.";
      } else if (riskLevel === "MEDIUM") {
        forecastNotes = "Project progressing normally with minor adjustments.";
      } else {
        forecastNotes = "Project on track for on-time, on-budget completion.";
      }
      
      const confidenceScore = forecastDelayDays === 0 && forecastCostOverrunPercent === 0 ? 0.95 : 0.75;
      
      const forecast = {
        id: forecastId,
        projectId: input.projectId,
        generatedAt: new Date().toISOString(),
        forecastEndDate: forecastEndDate.toISOString(),
        forecastDelayDays,
        forecastCostOverrunPercent: Number(forecastCostOverrunPercent.toFixed(2)),
        forecastNotes,
        confidenceScore,
        riskLevel,
      };
      
      console.log("[SmartContracts] Generated forecast:", forecastId);
      return forecast;
    }),

  generateContractWithSmartFeatures: publicProcedure
    .input(z.object({
      companyId: z.string(),
      clientId: z.string(),
      projectId: z.string().optional(),
      type: z.enum(["MSA", "PROJECT_CONTRACT", "WORK_ORDER"]),
      projectName: z.string(),
      totalAmount: z.number(),
      scopeOfWork: z.string(),
      startDate: z.string(),
      estimatedDurationDays: z.number(),
      tradeType: z.string().optional(),
      companyName: z.string().optional(),
      companyPhone: z.string().optional(),
      companyEmail: z.string().optional(),
      companyLicense: z.string().optional(),
      clientName: z.string().optional(),
      clientAddress: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const contractId = generateId("contract");
      const publicSigningToken = generateId("token");
      
      const paymentSchedule = generateSmartPaymentSchedule(input.totalAmount);
      const warrantyYears = getSmartWarrantyYears(input.tradeType as TradeType);
      const projectDurationText = generateProjectDurationText(input.estimatedDurationDays);
      const riskClauses = getRiskClauses(input.totalAmount);
      const tradeSpecificClauses = input.tradeType ? getTradeSpecificClauses(input.tradeType as TradeType) : "";
      const priceProtectionClause = generatePriceProtectionClause(input.totalAmount);
      const materialSubstitutionClause = generateMaterialSubstitutionClause();
      
      const endDate = new Date(input.startDate);
      endDate.setDate(endDate.getDate() + input.estimatedDurationDays);
      
      const paymentScheduleHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Payment</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Percent</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${paymentSchedule.map((payment) => `
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${payment.label}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">${payment.duePercent}%</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: 600;">$${payment.dueAmount.toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      
      const bodyHtml = `
        <h2>PROJECT CONTRACT — ${input.projectName}</h2>
        
        <p>This Project Contract ("Agreement") is made between:</p>
        
        <h3>CONTRACTOR:</h3>
        <p>
        ${input.companyName || "Company Name"}<br/>
        Phone: ${input.companyPhone || "(555) 123-4567"}<br/>
        Email: ${input.companyEmail || "info@company.com"}<br/>
        License #: ${input.companyLicense || "LIC-12345"}
        </p>
        
        <h3>CLIENT:</h3>
        <p>
        ${input.clientName || "Client Name"}<br/>
        Property Address: ${input.clientAddress || "Property Address"}
        </p>
        
        <h3>PROJECT SUMMARY:</h3>
        <p>The Contractor agrees to furnish labor, materials, equipment, and supervision necessary to complete the work described herein.</p>
        
        <h3>SCOPE OF WORK:</h3>
        <p>${input.scopeOfWork}</p>
        
        <hr/>
        
        <h3>CONTRACT AMOUNT:</h3>
        <p><strong>TOTAL PROJECT COST: $${input.totalAmount.toLocaleString()}</strong></p>
        
        <hr/>
        
        <h3>SMART PAYMENT SCHEDULE (AI-Optimized for Project Size):</h3>
        ${paymentScheduleHtml}
        <p>Payments are due before commencement of the next phase.</p>
        <p>Late payments may suspend work until resolved.</p>
        
        <hr/>
        
        <h3>PROJECT TIMELINE:</h3>
        <p>
        <strong>Start Date:</strong> ${new Date(input.startDate).toLocaleDateString()}<br/>
        <strong>Estimated Completion:</strong> ${endDate.toLocaleDateString()}<br/>
        <strong>Duration:</strong> ${projectDurationText}
        </p>
        <p>Completion dates may vary due to weather, inspections, material delays, or unforeseen conditions.</p>
        
        <hr/>
        
        <h3>CHANGE ORDER POLICY:</h3>
        <p>Any work beyond stated scope must be documented in a written Change Order that may adjust:</p>
        <ul>
          <li>Price</li>
          <li>Timeline</li>
          <li>Materials</li>
          <li>Labor required</li>
        </ul>
        <p>Verbal changes are not accepted.</p>
        
        <hr/>
        
        <h3>MATERIALS & EQUIPMENT:</h3>
        <p>All materials furnished by Contractor shall be:</p>
        <ul>
          <li>Industry standard quality</li>
          <li>Installed in accordance with manufacturer guidelines</li>
        </ul>
        <p>Client understands that exact colors/finishes may vary due to manufacturing tolerances.</p>
        
        ${priceProtectionClause}
        ${materialSubstitutionClause}
        
        <hr/>
        
        <h3>TRADE-SPECIFIC TERMS:</h3>
        ${tradeSpecificClauses}
        
        <hr/>
        
        <h3>HIDDEN CONDITIONS:</h3>
        <p>Contractor is not responsible for:</p>
        <ul>
          <li>Mold, rot, termites</li>
          <li>Electrical/plumbing conditions not visible</li>
          <li>Improper previous installations</li>
          <li>Structural defects</li>
          <li>Underground obstructions</li>
        </ul>
        <p>Discovery of such requires a Change Order.</p>
        
        <hr/>
        
        <h3>CONTRACTOR WARRANTY:</h3>
        <p>Workmanship warranty valid for ${warrantyYears} years after completion.</p>
        <p>Warranty excludes:</p>
        <ul>
          <li>Natural wear and tear</li>
          <li>Damage by client or third parties</li>
          <li>Extreme weather conditions</li>
          <li>Manufacturer material defects (covered separately)</li>
        </ul>
        
        <hr/>
        
        <h3>RISK & PROJECT SIZE TERMS:</h3>
        ${riskClauses}
        
        <hr/>
        
        <h3>DISPUTE RESOLUTION:</h3>
        <p>Disputes will be resolved by:</p>
        <ol>
          <li>Informal discussion</li>
          <li>Mediation</li>
          <li>Binding arbitration (no courtroom litigation)</li>
        </ol>
        
        <hr/>
        
        <h3>SIGNATURES</h3>
        <p>
        Contractor: _______________________   Date: ___________<br/><br/>
        Client: ___________________________   Date: ___________
        </p>
      `;
      
      const contract = {
        id: contractId,
        companyId: input.companyId,
        clientId: input.clientId,
        projectId: input.projectId,
        type: input.type,
        title: `Project Contract - ${input.projectName}`,
        bodyHtml,
        status: "DRAFT" as const,
        totalAmount: input.totalAmount,
        startDateEstimated: input.startDate,
        endDateEstimated: endDate.toISOString(),
        publicSigningToken,
        signedAt: null,
        createdByUserId: "current-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        smartFeatures: {
          paymentSchedule,
          warrantyYears,
          projectDurationText,
          riskLevel: calculateRiskLevel(input.totalAmount, 0, 0),
        },
      };
      
      console.log("[SmartContracts] Generated smart contract:", contractId);
      return contract;
    }),
});
