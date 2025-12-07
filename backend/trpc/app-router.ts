import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import {
  getJobsRoute,
  createJobRoute,
  updateJobRoute,
  deleteJobRoute,
  getClientsRoute,
  createClientRoute,
  updateClientRoute,
  deleteClientRoute,
  getEstimatesRoute,
  createEstimateRoute,
  updateEstimateRoute,
  getCustomerJobsRoute,
  getCustomerEstimatesRoute,
  approveEstimateRoute,
  uploadCustomerDocumentRoute,
} from "./routes/data/route";
import {
  createAdminRoute,
  activateSubscriptionRoute,
  crewLoginRoute,
  crewSignupWithCodeRoute,
  generateInviteCodeRoute,
  validateInviteCodeRoute,
  crewSignupWithInviteRoute,
  getInviteCodesRoute,
  getOrganizationCrewRoute,
  customerLoginRoute,
  createCustomerRoute,
} from "./routes/auth/route";
import {
  analyzeJobCostRoute,
  generateEstimateRoute,
  generateContractRoute,
  analyzePhotoIssuesRoute,
  generateInspectionNotesRoute,
  optimizeScheduleRoute,
  assistMeasurementRoute,
  designBackyardRoute,
} from "./routes/gemini/route";
import {
  aiOfficeManagerRoute,
  aiImageAnalysisRoute,
  aiJobCostingRoute,
  aiGenerateContractRoute,
  aiChecklistSuggestionsRoute,
} from "./routes/ai-router/route";
import {
  analyzePaymentPatternsRoute,
  predictPaymentsRoute,
  optimizeCashFlowRoute,
  analyzeClientPaymentBehaviorRoute,
} from "./routes/pagos-ai/route";
import {
  processIntakeMessageProcedure,
  summarizeIntakeProcedure,
  findBestCrewProcedure,
  createPhoneIntakeProcedure,
  getAllPhoneIntakesProcedure,
  updatePhoneIntakeStatusProcedure,
} from "./routes/ai-intake/route";
import {
  scanReceiptProcedure,
  calculateTaxProcedure,
} from "./routes/receipt-ai/route";
import { contractsRouter } from "./routes/contracts/route";
import { smartContractsRouter } from "./routes/smart-contracts/route";

console.log("[AppRouter] Initializing tRPC router");
console.log("[AppRouter] Auth routes:", {
  createAdmin: typeof createAdminRoute,
  activateSubscription: typeof activateSubscriptionRoute,
  crewLogin: typeof crewLoginRoute,
  crewSignupWithCode: typeof crewSignupWithCodeRoute,
});

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    createAdmin: createAdminRoute,
    activateSubscription: activateSubscriptionRoute,
    crewLogin: crewLoginRoute,
    crewSignupWithCode: crewSignupWithCodeRoute,
    generateInviteCode: generateInviteCodeRoute,
    validateInviteCode: validateInviteCodeRoute,
    crewSignupWithInvite: crewSignupWithInviteRoute,
    getInviteCodes: getInviteCodesRoute,
    getOrganizationCrew: getOrganizationCrewRoute,
    customerLogin: customerLoginRoute,
    createCustomer: createCustomerRoute,
  }),
  gemini: createTRPCRouter({
    analyzeJobCost: analyzeJobCostRoute,
    generateEstimate: generateEstimateRoute,
    generateContract: generateContractRoute,
    analyzePhotoIssues: analyzePhotoIssuesRoute,
    generateInspectionNotes: generateInspectionNotesRoute,
    optimizeSchedule: optimizeScheduleRoute,
    assistMeasurement: assistMeasurementRoute,
    designBackyard: designBackyardRoute,
  }),
  ai: createTRPCRouter({
    officeManager: aiOfficeManagerRoute,
    imageAnalysis: aiImageAnalysisRoute,
    jobCosting: aiJobCostingRoute,
    generateContract: aiGenerateContractRoute,
    checklistSuggestions: aiChecklistSuggestionsRoute,
  }),
  data: createTRPCRouter({
    getJobs: getJobsRoute,
    createJob: createJobRoute,
    updateJob: updateJobRoute,
    deleteJob: deleteJobRoute,
    getClients: getClientsRoute,
    createClient: createClientRoute,
    updateClient: updateClientRoute,
    deleteClient: deleteClientRoute,
    getEstimates: getEstimatesRoute,
    createEstimate: createEstimateRoute,
    updateEstimate: updateEstimateRoute,
    getCustomerJobs: getCustomerJobsRoute,
    getCustomerEstimates: getCustomerEstimatesRoute,
    approveEstimate: approveEstimateRoute,
    uploadCustomerDocument: uploadCustomerDocumentRoute,
  }),
  pagosAI: createTRPCRouter({
    analyzePaymentPatterns: analyzePaymentPatternsRoute,
    predictPayments: predictPaymentsRoute,
    optimizeCashFlow: optimizeCashFlowRoute,
    analyzeClientBehavior: analyzeClientPaymentBehaviorRoute,
  }),
  aiIntake: createTRPCRouter({
    processMessage: processIntakeMessageProcedure,
    summarize: summarizeIntakeProcedure,
    findBestCrew: findBestCrewProcedure,
    createPhoneIntake: createPhoneIntakeProcedure,
    getAllPhoneIntakes: getAllPhoneIntakesProcedure,
    updatePhoneIntakeStatus: updatePhoneIntakeStatusProcedure,
  }),
  receiptAI: createTRPCRouter({
    scanReceipt: scanReceiptProcedure,
    calculateTax: calculateTaxProcedure,
  }),
  contracts: contractsRouter,
  smartContracts: smartContractsRouter,
});

console.log("[AppRouter] Router created successfully");
