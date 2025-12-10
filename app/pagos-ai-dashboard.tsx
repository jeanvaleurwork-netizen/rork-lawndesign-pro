import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Target,
  Activity,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePagosAI } from "@/contexts/PagosAIContext";
import { mockInvoices } from "@/mocks/invoices";

export default function PagosAIDashboard() {
  const router = useRouter();
  const {
    analyzePayments,
    predictPayments,
    optimizeCashFlow,
    lastAnalysis,
    lastPredictions,
    lastCashFlowAnalysis,
    isAnalyzingPayments,
    isPredictingPayments,
    isOptimizingCashFlow,
  } = usePagosAI();

  const [activeTab, setActiveTab] = useState<"insights" | "predictions" | "cashflow">("insights");

  const performAnalysis = useCallback(async () => {
    try {
      console.log("[Pagos AI Dashboard] Starting comprehensive analysis");
      
      await Promise.all([
        analyzePayments(mockInvoices),
        predictPayments(mockInvoices),
        optimizeCashFlow({
          currentBalance: 45000,
          monthlyExpenses: 25000,
          pendingInvoices: mockInvoices
            .filter(inv => inv.status === "sent")
            .map(inv => ({ amount: inv.amount, dueDate: inv.dueDate })),
          upcomingExpenses: [
            { description: "Payroll", amount: 12000, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
            { description: "Materials", amount: 8000, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
          ],
          payrollDue: 12000,
        }),
      ]);

      console.log("[Pagos AI Dashboard] Analysis complete");
    } catch (error) {
      console.error("[Pagos AI Dashboard] Analysis failed:", error);
      Alert.alert("Error", "Failed to analyze payments. Please try again.");
    }
  }, [analyzePayments, predictPayments, optimizeCashFlow]);

  useEffect(() => {
    if (!lastAnalysis && !isLoading) {
      performAnalysis();
    }
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return Colors.light.success;
    if (score >= 60) return Colors.light.info;
    if (score >= 40) return Colors.light.warning;
    return Colors.light.error;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return Colors.light.success;
      case "medium":
        return Colors.light.warning;
      case "high":
      case "critical":
        return Colors.light.error;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
      case "decreasing":
      case "excellent":
      case "good":
        return <TrendingUp color={Colors.light.success} size={16} />;
      case "declining":
      case "increasing":
      case "poor":
        return <TrendingDown color={Colors.light.error} size={16} />;
      default:
        return <Activity color={Colors.light.info} size={16} />;
    }
  };

  const isLoading = isAnalyzingPayments || isPredictingPayments || isOptimizingCashFlow;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={Colors.light.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Sparkles color={Colors.light.primary} size={24} />
          <Text style={styles.headerTitle}>Pagos AI</Text>
        </View>
        <TouchableOpacity onPress={performAnalysis} style={styles.refreshButton} disabled={isLoading}>
          <RefreshCw color={Colors.light.primary} size={20} />
        </TouchableOpacity>
      </View>

      {isLoading && !lastAnalysis ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Analyzing payment data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "insights" && styles.tabActive]}
              onPress={() => setActiveTab("insights")}
            >
              <Target color={activeTab === "insights" ? "#fff" : Colors.light.text} size={18} />
              <Text style={[styles.tabText, activeTab === "insights" && styles.tabTextActive]}>
                Insights
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "predictions" && styles.tabActive]}
              onPress={() => setActiveTab("predictions")}
            >
              <Clock color={activeTab === "predictions" ? "#fff" : Colors.light.text} size={18} />
              <Text style={[styles.tabText, activeTab === "predictions" && styles.tabTextActive]}>
                Predictions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "cashflow" && styles.tabActive]}
              onPress={() => setActiveTab("cashflow")}
            >
              <DollarSign color={activeTab === "cashflow" ? "#fff" : Colors.light.text} size={18} />
              <Text style={[styles.tabText, activeTab === "cashflow" && styles.tabTextActive]}>
                Cash Flow
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "insights" && lastAnalysis && (
            <View>
              <View style={styles.scoresContainer}>
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreLabel}>Cash Flow Score</Text>
                  <Text style={[styles.scoreValue, { color: getHealthColor(lastAnalysis.cashFlowScore) }]}>
                    {lastAnalysis.cashFlowScore}
                  </Text>
                  <Text style={styles.scoreSubtext}>out of 100</Text>
                </View>
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreLabel}>Collection Efficiency</Text>
                  <Text style={[styles.scoreValue, { color: getHealthColor(lastAnalysis.collectionEfficiency) }]}>
                    {lastAnalysis.collectionEfficiency}%
                  </Text>
                  <Text style={styles.scoreSubtext}>efficiency rate</Text>
                </View>
              </View>

              <View style={styles.trendsContainer}>
                <Text style={styles.sectionTitle}>Payment Trends</Text>
                <View style={styles.trendCard}>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Payment Speed</Text>
                    <View style={styles.trendValue}>
                      {getTrendIcon(lastAnalysis.trends.paymentSpeed)}
                      <Text style={styles.trendText}>
                        {lastAnalysis.trends.paymentSpeed}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Overdue Rate</Text>
                    <View style={styles.trendValue}>
                      {getTrendIcon(lastAnalysis.trends.overdueRate)}
                      <Text style={styles.trendText}>
                        {lastAnalysis.trends.overdueRate}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Cash Flow Health</Text>
                    <View style={styles.trendValue}>
                      {getTrendIcon(lastAnalysis.trends.cashFlowHealth)}
                      <Text style={styles.trendText}>
                        {lastAnalysis.trends.cashFlowHealth}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Insights</Text>
                {lastAnalysis.insights.map((insight, index) => (
                  <View key={index} style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <View style={[
                        styles.impactBadge,
                        { backgroundColor: insight.impact === "high" ? Colors.light.error + "20" : insight.impact === "medium" ? Colors.light.warning + "20" : Colors.light.success + "20" }
                      ]}>
                        <Text style={[
                          styles.impactText,
                          { color: insight.impact === "high" ? Colors.light.error : insight.impact === "medium" ? Colors.light.warning : Colors.light.success }
                        ]}>
                          {insight.impact}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                  </View>
                ))}
              </View>

              {lastAnalysis.recommendations.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                  {lastAnalysis.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationCard}>
                      <View style={styles.recommendationHeader}>
                        <CheckCircle color={Colors.light.primary} size={20} />
                        <Text style={styles.recommendationTitle}>{rec.title}</Text>
                      </View>
                      <Text style={styles.recommendationAction}>{rec.action}</Text>
                      <Text style={styles.recommendationImpact}>Impact: {rec.expectedImpact}</Text>
                    </View>
                  ))}
                </View>
              )}

              {lastAnalysis.riskFactors.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Risk Factors</Text>
                  {lastAnalysis.riskFactors.map((risk, index) => (
                    <View key={index} style={styles.riskCard}>
                      <View style={styles.riskHeader}>
                        <AlertTriangle color={getRiskColor(risk.severity)} size={20} />
                        <Text style={styles.riskFactor}>{risk.factor}</Text>
                      </View>
                      <Text style={styles.riskMitigation}>{risk.mitigation}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === "predictions" && (
            <View>
              {lastPredictions.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Predictions</Text>
                  {lastPredictions.map((pred, index) => (
                    <View key={index} style={styles.predictionCard}>
                      <View style={styles.predictionHeader}>
                        <Text style={styles.predictionClient}>{pred.clientName}</Text>
                        <View style={[
                          styles.likelihoodBadge,
                          { backgroundColor: pred.likelihood === "high" ? Colors.light.success + "20" : pred.likelihood === "medium" ? Colors.light.warning + "20" : Colors.light.error + "20" }
                        ]}>
                          <Text style={[
                            styles.likelihoodText,
                            { color: pred.likelihood === "high" ? Colors.light.success : pred.likelihood === "medium" ? Colors.light.warning : Colors.light.error }
                          ]}>
                            {pred.likelihood}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.predictionAmount}>
                        ${pred.amount.toLocaleString()}
                      </Text>
                      <Text style={styles.predictionDate}>
                        Expected: {new Date(pred.predictedPaymentDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                      <Text style={styles.predictionConfidence}>
                        Confidence: {pred.confidence}%
                      </Text>
                      {pred.recommendedAction && (
                        <Text style={styles.predictionAction}>
                          💡 {pred.recommendedAction}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Clock color={Colors.light.textSecondary} size={48} />
                  <Text style={styles.emptyStateText}>No predictions available</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Predictions will appear once analysis is complete
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "cashflow" && lastCashFlowAnalysis && (
            <View>
              <View style={styles.cashFlowHeader}>
                <View style={styles.cashFlowScoreCard}>
                  <Text style={styles.cashFlowScoreLabel}>Health Score</Text>
                  <Text style={[
                    styles.cashFlowScoreValue,
                    { color: getHealthColor(lastCashFlowAnalysis.healthScore) }
                  ]}>
                    {lastCashFlowAnalysis.healthScore}
                  </Text>
                  <Text style={[
                    styles.cashFlowRiskLevel,
                    { color: getRiskColor(lastCashFlowAnalysis.riskLevel) }
                  ]}>
                    {lastCashFlowAnalysis.riskLevel}{" "}risk
                  </Text>
                </View>
                <View style={styles.cashFlowScoreCard}>
                  <Text style={styles.cashFlowScoreLabel}>Days of Cash</Text>
                  <Text style={[
                    styles.cashFlowScoreValue,
                    { color: lastCashFlowAnalysis.daysOfCashOnHand > 30 ? Colors.light.success : Colors.light.warning }
                  ]}>
                    {lastCashFlowAnalysis.daysOfCashOnHand}
                  </Text>
                  <Text style={styles.cashFlowScoreSubtext}>days on hand</Text>
                </View>
              </View>

              {lastCashFlowAnalysis.urgentActions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚠️ Urgent Actions</Text>
                  {lastCashFlowAnalysis.urgentActions.map((action, index) => (
                    <View key={index} style={styles.urgentActionCard}>
                      <Text style={styles.urgentActionText}>{action.action}</Text>
                      <Text style={styles.urgentActionReason}>{action.reason}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>30-Day Forecast</Text>
                <View style={styles.forecastCard}>
                  <View style={styles.forecastRow}>
                    <Text style={styles.forecastLabel}>Expected Inflow</Text>
                    <Text style={[styles.forecastValue, { color: Colors.light.success }]}>
                      +${lastCashFlowAnalysis.forecastNext30Days.expectedInflow.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.forecastRow}>
                    <Text style={styles.forecastLabel}>Expected Outflow</Text>
                    <Text style={[styles.forecastValue, { color: Colors.light.error }]}>
                      -${lastCashFlowAnalysis.forecastNext30Days.expectedOutflow.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.forecastRow, styles.forecastTotal]}>
                    <Text style={styles.forecastLabelBold}>Projected Balance</Text>
                    <Text style={[
                      styles.forecastValueBold,
                      { color: lastCashFlowAnalysis.forecastNext30Days.projectedEndBalance > 0 ? Colors.light.success : Colors.light.error }
                    ]}>
                      ${lastCashFlowAnalysis.forecastNext30Days.projectedEndBalance.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.forecastConfidence}>
                    Confidence: {lastCashFlowAnalysis.forecastNext30Days.confidence}%
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Optimization Strategies</Text>
                {lastCashFlowAnalysis.optimizations.map((opt, index) => (
                  <View key={index} style={styles.optimizationCard}>
                    <Text style={styles.optimizationStrategy}>{opt.strategy}</Text>
                    <Text style={styles.optimizationDescription}>{opt.description}</Text>
                    <View style={styles.optimizationFooter}>
                      <Text style={styles.optimizationSavings}>
                        💰 ${opt.potentialSavings.toLocaleString()} potential savings
                      </Text>
                      <View style={styles.optimizationMeta}>
                        <Text style={styles.optimizationMetaText}>{opt.difficulty}</Text>
                        <Text style={styles.optimizationMetaText}>•</Text>
                        <Text style={styles.optimizationMetaText}>{opt.timeframe}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  tabTextActive: {
    color: "#fff",
  },
  scoresContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  trendsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  trendCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendLabel: {
    fontSize: 14,
    color: Colors.light.text,
  },
  trendValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trendText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textTransform: "capitalize",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  insightTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginRight: 8,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase",
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  recommendationAction: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  recommendationImpact: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  riskCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  riskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  riskFactor: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  riskMitigation: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  predictionCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  predictionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  predictionClient: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  likelihoodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likelihoodText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  predictionAmount: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  predictionDate: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  predictionConfidence: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  predictionAction: {
    fontSize: 13,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  cashFlowHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  cashFlowScoreCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  cashFlowScoreLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  cashFlowScoreValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  cashFlowRiskLevel: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase",
  },
  cashFlowScoreSubtext: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  urgentActionCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
  },
  urgentActionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  urgentActionReason: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  forecastCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  forecastTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: 8,
    paddingTop: 12,
  },
  forecastLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  forecastValue: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  forecastLabelBold: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  forecastValueBold: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  forecastConfidence: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  optimizationCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  optimizationStrategy: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  optimizationDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  optimizationFooter: {
    gap: 8,
  },
  optimizationSavings: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.success,
  },
  optimizationMeta: {
    flexDirection: "row",
    gap: 8,
  },
  optimizationMetaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
