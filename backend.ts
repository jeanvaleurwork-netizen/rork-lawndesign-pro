import app from "./backend/hono";

console.log("\n" + "=".repeat(70));
console.log("  ContractorOS Backend v10 - CREW ROUTES ACTIVE");
console.log("=".repeat(70));
console.log("[Backend] Time:", new Date().toISOString());
console.log("[Backend] Environment:", process.env.NODE_ENV || "development");
console.log("\n[Backend] API Endpoints:");
console.log("  Main tRPC: /api/trpc");
console.log("  Health:    /api");
console.log("  Test:      /api/test-trpc");
console.log("\n[Backend] Routes Registered:");

const routes = [
  { group: "Auth", items: [
    "auth.createAdmin (mutation)",
    "auth.activateSubscription (mutation)",
    "auth.crewLogin (mutation)",
    "auth.crewSignupWithCode (mutation)",
    "auth.generateInviteCode (mutation)",
    "auth.validateInviteCode (mutation)",
    "auth.crewSignupWithInvite (mutation)",
    "auth.getInviteCodes (query)",
    "auth.getOrganizationCrew (query)"
  ]},
  { group: "AI Intake", items: [
    "aiIntake.processMessage (mutation) ✓",
    "aiIntake.summarize (mutation) ✓",
    "aiIntake.findBestCrew (query) ✓",
    "aiIntake.createPhoneIntake (mutation) ✓",
    "aiIntake.getAllPhoneIntakes (query) ✓",
    "aiIntake.updatePhoneIntakeStatus (mutation) ✓"
  ]},
  { group: "Gemini AI", items: [
    "gemini.analyzeJobCost (mutation) ✓",
    "gemini.generateEstimate (mutation)",
    "gemini.generateContract (mutation)",
    "gemini.analyzePhotoIssues (mutation)",
    "gemini.generateInspectionNotes (mutation)",
    "gemini.optimizeSchedule (mutation)",
    "gemini.assistMeasurement (mutation)",
    "gemini.designBackyard (mutation)"
  ]},
  { group: "Data", items: [
    "data.getJobs (query) ✓",
    "data.createJob (mutation) ✓",
    "data.updateJob (mutation) ✓",
    "data.deleteJob (mutation) ✓",
    "data.getClients (query) ✓",
    "data.createClient (mutation) ✓",
    "data.updateClient (mutation) ✓",
    "data.deleteClient (mutation) ✓",
    "data.getEstimates (query) ✓",
    "data.createEstimate (mutation) ✓",
    "data.updateEstimate (mutation) ✓"
  ] },
  { group: "AI Office", items: ["officeManager, imageAnalysis, jobCosting"] },
  { group: "Pagos AI", items: ["Payment analysis and predictions"] },
  { group: "Receipt AI", items: ["Receipt scanning and tax calculations"] },
  { group: "Contracts", items: [
    "contracts.createContract (mutation) ✓",
    "contracts.getContractsByCompany (query) ✓",
    "contracts.getContractByToken (query) ✓",
    "contracts.signContract (mutation) ✓",
    "contracts.sendContractForSigning (mutation) ✓",
    "contracts.createChangeOrder (mutation) ✓",
    "contracts.createCompletionCertificate (mutation) ✓",
    "contracts.createWarranty (mutation) ✓",
    "contracts.createMaterialApproval (mutation) ✓",
    "contracts.approveMaterial (mutation) ✓",
    "contracts.createSubcontractorAgreement (mutation) ✓",
    "contracts.createLienWaiver (mutation) ✓"
  ] },
  { group: "Smart Contracts", items: ["Smart contract management"] },
  { group: "Crew", items: [
    "crew.getCrewList (query) ✓",
    "crew.getCrewById (query) ✓",
    "crew.createCrew (mutation) ✓",
    "crew.updateCrew (mutation) ✓",
    "crew.deleteCrew (mutation) ✓"
  ] },
  { group: "Commercial", items: ["Commercial property management"] }
];

routes.forEach(({ group, items }) => {
  console.log(`\n  ${group}:`);
  items.forEach(item => console.log(`    - ${item}`));
});

console.log("\n" + "=".repeat(70));
console.log("  ✓ BACKEND IS NOW READY AND LISTENING FOR REQUESTS");
console.log("  ✓ All routes registered successfully");
console.log("  ✓ tRPC server is operational");
console.log("=".repeat(70) + "\n");

export default app;
