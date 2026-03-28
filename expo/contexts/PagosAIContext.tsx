import createContextHook from "@nkzw/create-context-hook";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Invoice } from "@/types";

interface PaymentInsight {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  type: "positive" | "negative" | "neutral";
}

interface PaymentRecommendation {
  title: string;
  action: string;
  expectedImpact: string;
  priority: "high" | "medium" | "low";
}

interface RiskFactor {
  factor: string;
  severity: "high" | "medium" | "low";
  mitigation: string;
}

interface PaymentTrends {
  paymentSpeed: "improving" | "stable" | "declining";
  overdueRate: "increasing" | "stable" | "decreasing";
  cashFlowHealth: "excellent" | "good" | "fair" | "poor";
}

interface PaymentAnalysis {
  insights: PaymentInsight[];
  recommendations: PaymentRecommendation[];
  cashFlowScore: number;
  collectionEfficiency: number;
  riskFactors: RiskFactor[];
  trends: PaymentTrends;
  rawStats: {
    totalInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
    pendingInvoices: number;
    totalPaid: number;
    totalOverdue: number;
    totalPending: number;
  };
  avgDaysFromDue: number;
}

interface PaymentPrediction {
  invoiceId: string;
  clientName: string;
  amount: number;
  predictedPaymentDate: string;
  confidence: number;
  likelihood: "high" | "medium" | "low";
  riskLevel: "low" | "medium" | "high";
  recommendedAction: string;
}

interface CashFlowOptimization {
  strategy: string;
  description: string;
  potentialSavings: number;
  difficulty: "easy" | "medium" | "hard";
  timeframe: "immediate" | "short-term" | "long-term";
}

interface UrgentAction {
  action: string;
  reason: string;
  priority: "critical" | "high" | "medium";
}

interface CashFlowAnalysis {
  healthScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  daysOfCashOnHand: number;
  optimizations: CashFlowOptimization[];
  urgentActions: UrgentAction[];
  forecastNext30Days: {
    expectedInflow: number;
    expectedOutflow: number;
    projectedEndBalance: number;
    confidence: number;
  };
}

interface ClientPaymentAnalysis {
  clientScore: number;
  riskLevel: "low" | "medium" | "high";
  paymentProfile: "excellent" | "good" | "average" | "poor" | "problematic";
  insights: { finding: string; significance: "high" | "medium" | "low" }[];
  recommendations: { action: string; benefit: string }[];
  predictedBehavior: {
    nextPaymentLikelihood: number;
    recommendedTerms: string;
    collectionStrategy: string;
  };
  statistics: {
    totalInvoices: number;
    paidInvoices: number;
    totalPaid: number;
    avgAmount: number;
    avgDaysFromDue: number;
    reliabilityScore: number;
    onTimePayments: number;
    latePayments: number;
  };
}

export type { PaymentAnalysis, PaymentPrediction, CashFlowAnalysis, ClientPaymentAnalysis };

export const [PagosAIProvider, usePagosAI] = createContextHook(() => {
  const [lastAnalysis, setLastAnalysis] = useState<PaymentAnalysis | null>(null);
  const [lastPredictions, setLastPredictions] = useState<PaymentPrediction[]>([]);
  const [lastCashFlowAnalysis, setLastCashFlowAnalysis] = useState<CashFlowAnalysis | null>(null);

  const analyzePaymentPatternsMutation = trpc.pagosAI.analyzePaymentPatterns.useMutation({
    onSuccess: (data) => {
      console.log("[Pagos AI] Payment patterns analyzed", data);
      setLastAnalysis(data as PaymentAnalysis);
    },
    onError: (error) => {
      console.error("[Pagos AI] Failed to analyze payment patterns:", error);
    }
  });

  const predictPaymentsMutation = trpc.pagosAI.predictPayments.useMutation({
    onSuccess: (data) => {
      console.log("[Pagos AI] Payments predicted", data);
      setLastPredictions(data.predictions as PaymentPrediction[]);
    },
    onError: (error) => {
      console.error("[Pagos AI] Failed to predict payments:", error);
    }
  });

  const optimizeCashFlowMutation = trpc.pagosAI.optimizeCashFlow.useMutation({
    onSuccess: (data) => {
      console.log("[Pagos AI] Cash flow optimized", data);
      setLastCashFlowAnalysis(data as CashFlowAnalysis);
    },
    onError: (error) => {
      console.error("[Pagos AI] Failed to optimize cash flow:", error);
    }
  });

  const analyzeClientBehaviorMutation = trpc.pagosAI.analyzeClientBehavior.useMutation({
    onError: (error) => {
      console.error("[Pagos AI] Failed to analyze client behavior:", error);
    }
  });

  const analyzePayments = async (invoices: Invoice[]) => {
    console.log("[Pagos AI] Starting payment pattern analysis");
    
    const mappedInvoices = invoices.map(inv => ({
      id: inv.id,
      clientId: inv.clientId,
      clientName: inv.clientName,
      amount: inv.amount,
      status: inv.status,
      createdDate: inv.createdDate,
      dueDate: inv.dueDate,
      paidDate: inv.status === "paid" ? inv.createdDate : undefined,
    }));

    return analyzePaymentPatternsMutation.mutateAsync({
      invoices: mappedInvoices,
    });
  };

  const predictPayments = async (invoices: Invoice[]) => {
    console.log("[Pagos AI] Predicting payment dates");
    
    const mappedInvoices = invoices.map(inv => ({
      id: inv.id,
      clientId: inv.clientId,
      clientName: inv.clientName,
      amount: inv.amount,
      status: inv.status,
      createdDate: inv.createdDate,
      dueDate: inv.dueDate,
    }));

    return predictPaymentsMutation.mutateAsync({
      invoices: mappedInvoices,
    });
  };

  const optimizeCashFlow = async (params: {
    currentBalance: number;
    monthlyExpenses: number;
    pendingInvoices: { amount: number; dueDate: string }[];
    upcomingExpenses: { description: string; amount: number; dueDate: string }[];
    payrollDue?: number;
  }) => {
    console.log("[Pagos AI] Optimizing cash flow");
    return optimizeCashFlowMutation.mutateAsync(params);
  };

  const analyzeClientBehavior = async (params: {
    clientId: string;
    clientName: string;
    invoices: Invoice[];
  }) => {
    console.log("[Pagos AI] Analyzing client payment behavior");
    
    const mappedInvoices = params.invoices.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      status: inv.status,
      createdDate: inv.createdDate,
      dueDate: inv.dueDate,
      paidDate: inv.status === "paid" ? inv.createdDate : undefined,
    }));

    return analyzeClientBehaviorMutation.mutateAsync({
      clientId: params.clientId,
      clientName: params.clientName,
      invoices: mappedInvoices,
    });
  };

  return {
    analyzePayments,
    predictPayments,
    optimizeCashFlow,
    analyzeClientBehavior,
    
    lastAnalysis,
    lastPredictions,
    lastCashFlowAnalysis,
    
    isAnalyzingPayments: analyzePaymentPatternsMutation.isPending,
    isPredictingPayments: predictPaymentsMutation.isPending,
    isOptimizingCashFlow: optimizeCashFlowMutation.isPending,
    isAnalyzingClient: analyzeClientBehaviorMutation.isPending,
    
    analysisError: analyzePaymentPatternsMutation.error,
    predictionError: predictPaymentsMutation.error,
    cashFlowError: optimizeCashFlowMutation.error,
    clientAnalysisError: analyzeClientBehaviorMutation.error,
  };
});
