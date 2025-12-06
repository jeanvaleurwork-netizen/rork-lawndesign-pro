export interface LawnDesign {
  id: string;
  title: string;
  imageUrl: string;
  squareFootage: number;
  description: string;
  items: DesignItem[];
  completionDate: string;
  location: string;
  beforeImageUrl?: string;
}

export interface DesignItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: "plant" | "material" | "labor" | "equipment";
}

export interface Schedule {
  id: string;
  clientName: string;
  address: string;
  date: string;
  time: string;
  duration: number;
  service: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes?: string;
}

export interface LawnAnalysis {
  squareFootage: number;
  estimatedCost: {
    min: number;
    max: number;
  };
  recommendations: string[];
  imageUrl: string;
  timestamp: string;
}

export interface HomeownerNote {
  id: string;
  instruction: string;
  category: "parking" | "pets" | "access" | "timing" | "property" | "general";
  priority: "low" | "medium" | "high";
}

export interface ClientDocument {
  id: string;
  name: string;
  type: "contract" | "insurance" | "photo" | "blueprint" | "receipt" | "warranty" | "other";
  url: string;
  uploadedDate: string;
  size?: number;
  notes?: string;
}

export interface ClientProperty {
  id: string;
  clientId: string;
  address: string;
  propertyType: "residential" | "commercial" | "warehouse" | "retail" | "farm" | "other";
  squareFootage?: number;
  lotSize?: number;
  roofArea?: number;
  notes?: string;
  photos: string[];
  isPrimary: boolean;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  invoiceId?: string;
  amount: number;
  date: string;
  method: "cash" | "check" | "credit_card" | "bank_transfer" | "other";
  status: "completed" | "pending" | "failed";
  notes?: string;
}

export interface InteractionLog {
  id: string;
  clientId: string;
  type: "call" | "email" | "text" | "meeting" | "note";
  subject: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface ClientReliabilityScore {
  score: number;
  paysOnTime: boolean;
  goodCommunication: boolean;
  referralsMade: number;
  lastUpdated: string;
}

export interface Client {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  tags: string[];
  jobsCount: number;
  estimatesCount: number;
  homeownerNotes?: HomeownerNote[];
  arrivalInstructions?: string;
  customerType: "new" | "recurring";
  properties?: ClientProperty[];
  documents?: ClientDocument[];
  paymentRecords?: PaymentRecord[];
  interactionLogs?: InteractionLog[];
  reliabilityScore?: ClientReliabilityScore;
  lifetimeValue?: number;
  outstandingBalance?: number;
  lastServiceDate?: string;
  nextScheduledService?: string;
  budget?: number;
  budgetNotes?: string;
}

export interface Property {
  id: string;
  clientId: string;
  address: string;
  lat: number;
  lng: number;
  lawnSqft: number;
  roofSqft: number;
  hardscapeSqft: number;
  images: string[];
}

export type EstimateStatus = "draft" | "sent" | "approved" | "declined";

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  category?: "labor" | "materials" | "equipment" | "transportation" | "fees" | "other";
  internalNotes?: string;
}

export interface CostBreakdown {
  labor: number;
  materials: number;
  transportation: number;
  equipment: number;
  dumpFees: number;
  permitFees: number;
  other: number;
}

export interface EstimateVersion {
  id: string;
  versionNumber: number;
  lineItems: LineItem[];
  total: number;
  notes: string;
  savedDate: string;
  savedBy: string;
}

export interface EstimatePhoto {
  id: string;
  url: string;
  caption?: string;
  type: "before" | "after" | "reference" | "measurement";
  uploadedDate: string;
}

export interface EstimateAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
}

export interface Estimate {
  id: string;
  businessId: string;
  propertyId: string;
  clientId?: string;
  clientName: string;
  propertyAddress: string;
  status: EstimateStatus;
  lineItems: LineItem[];
  total: number;
  subtotal: number;
  tax: number;
  notes: string;
  createdDate: string;
  pdfUrl?: string;
  costBreakdown?: CostBreakdown;
  actualCost?: number;
  profitMargin?: number;
  profitAmount?: number;
  photos?: EstimatePhoto[];
  versions?: EstimateVersion[];
  currentVersion?: number;
  addOns?: EstimateAddOn[];
  templateId?: string;
}

export type JobStatus = "pending" | "scheduled" | "in-progress" | "completed" | "cancelled";

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  category?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  title: string;
  role: "lead" | "worker" | "specialist";
  availability: "available" | "busy" | "off";
}

export interface Receipt {
  id: string;
  jobId: string;
  imageUrl: string;
  amount: number;
  category: "materials" | "fuel" | "rental" | "subcontractor" | "other";
  vendor: string;
  date: string;
  description: string;
  notes?: string;
}

export interface JobTool {
  id: string;
  name: string;
  quantity: number;
  assignedTo?: string;
  condition: "good" | "fair" | "needs-repair";
  notes?: string;
}

export interface Job {
  id: string;
  estimateId?: string;
  businessId: string;
  clientId: string;
  clientName: string;
  propertyAddress: string;
  crew: string[];
  startTime: string;
  endTime: string;
  status: JobStatus;
  materialsUsed: { name: string; quantity: number; unit: string }[];
  photos: string[];
  service: string;
  notes?: string;
  checklist?: ChecklistItem[];
  receipts?: Receipt[];
  budgetedCost?: number;
  actualCost?: number;
  houseProtectionChecklist?: ChecklistItem[];
  tools?: JobTool[];
  costingNotes?: string;
}

export interface Invoice {
  id: string;
  jobId: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: "sent" | "paid" | "overdue";
  dueDate: string;
  createdDate: string;
  invoicePdf?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  status: "success" | "failed" | "pending";
  paidDate: string;
}

export interface DesignTemplate {
  id: string;
  style: string;
  sizeCategory: "small" | "medium" | "large" | "estate";
  layout: Record<string, any>;
  materials: string[];
  previewImage: string;
  priceRangeMin: number;
  priceRangeMax: number;
  subtitle: string;
}

export interface EstimateTemplate {
  id: string;
  name: string;
  tradeType: TradeType;
  description: string;
  defaultLineItems: Omit<LineItem, "id" | "amount">[];
  defaultNotes: string;
  createdBy: string;
  createdDate: string;
  lastUsed?: string;
  usageCount: number;
}

export interface RealProject {
  id: string;
  businessId: string;
  beforePhotos: string[];
  afterPhotos: string[];
  squareFootage: number;
  materials: string[];
  features: string[];
  cost: number;
  style: string;
  location: string;
}

export interface RoofMeasurement {
  totalRoofArea: number;
  pitch: string;
  slopes: number;
  ridgeLength: number;
  hipsLength: number;
  valleysLength: number;
  eavesLength: number;
  rakeLength: number;
  facets: {
    id: string;
    area: number;
    pitch: string;
    aspectDirection: string;
  }[];
  chimneys: number;
  skylights: number;
  vents: number;
}

export interface WallMeasurement {
  totalWallArea: number;
  stories: number;
  windows: number;
  doors: number;
  exteriorWalls: {
    side: string;
    area: number;
    height: number;
    length: number;
  }[];
}

export interface PropertyReport {
  id: string;
  propertyAddress: string;
  reportType: "roofing" | "siding" | "painting" | "general";
  measurements: {
    roof?: RoofMeasurement;
    walls?: WallMeasurement;
    lot?: {
      totalArea: number;
      buildingFootprint: number;
      lawnArea: number;
      hardscapeArea: number;
    };
  };
  images: {
    aerial: string[];
    ground: string[];
    annotated: string[];
  };
  generatedDate: string;
  reportPdfUrl?: string;
}

export type DamageType = "hail" | "wind" | "impact" | "wear" | "leak" | "structural";
export type DamageSeverity = "minor" | "moderate" | "severe" | "critical";

export interface DamageDetection {
  id: string;
  type: DamageType;
  severity: DamageSeverity;
  location: string;
  description: string;
  estimatedCost: {
    min: number;
    max: number;
  };
  coordinates?: {
    x: number;
    y: number;
  };
  imageUrl: string;
  annotatedImageUrl?: string;
}

export interface InsuranceClaimReport {
  id: string;
  propertyAddress: string;
  claimNumber?: string;
  inspectionDate: string;
  damageDetections: DamageDetection[];
  totalEstimatedCost: {
    min: number;
    max: number;
  };
  images: string[];
  annotatedImages: string[];
  report: string;
  recommendations: string[];
  reportPdfUrl?: string;
}

export interface Contract {
  id: string;
  clientId: string;
  jobId?: string;
  estimateId?: string;
  clientName: string;
  contractType: "service" | "project" | "maintenance" | "custom";
  scopeOfWork: string;
  terms: string[];
  exclusions: string[];
  warranties: string[];
  disclaimers: string[];
  totalAmount: number;
  paymentSchedule: PaymentScheduleItem[];
  startDate: string;
  completionDate?: string;
  signedDate?: string;
  clientSignature?: string;
  contractorSignature?: string;
  status: "draft" | "sent" | "signed" | "active" | "completed" | "cancelled";
  pdfUrl?: string;
}

export interface PaymentScheduleItem {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
}

export interface LiDARScan {
  id: string;
  propertyId?: string;
  clientName?: string;
  propertyAddress: string;
  scanDate: string;
  roomScans: RoomScan[];
  totalArea: number;
  scanQuality: "low" | "medium" | "high";
}

export interface RoomScan {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  area: number;
  volume: number;
  walls: WallMeasurement3D[];
  pointCloudData?: string;
}

export interface WallMeasurement3D {
  id: string;
  length: number;
  height: number;
  area: number;
  hasWindows: boolean;
  hasDoors: boolean;
}

export interface ExternalReport {
  id: string;
  provider: "eagleview" | "hover" | "other";
  propertyAddress: string;
  reportType: "roof" | "siding" | "exterior" | "full";
  measurements: any;
  images: string[];
  annotatedImages: string[];
  reportDate: string;
  reportUrl?: string;
  rawData?: any;
}

export type UserRole = "admin" | "crew" | "manager" | "customer";

export type TradeType = 
  | "landscaping"
  | "roofing"
  | "siding"
  | "painting"
  | "hvac"
  | "plumbing"
  | "electrical"
  | "tree_service"
  | "pool_service"
  | "pressure_washing"
  | "renovation"
  | "general_contractor";

export interface Organization {
  id: string;
  name?: string;
  businessName?: string;
  ownerId: string;
  plan: "none" | "none_yet" | "active" | "monthly" | "yearly";
  crewCode?: string;
  subscriptionStatus?: "active" | "inactive" | "cancelled";
  createdAt?: string;
  tradeType?: TradeType;
  tradeSpecialties?: string[];
  companyPhone?: string;
  companyEmail?: string;
  logoUrl?: string;
  address?: string;
  serviceArea?: string;
  laborRate?: number;
  materialMarkup?: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  role: UserRole;
  businessName?: string;
  organizationId?: string;
  companyId?: string;
  createdAt?: string;
  passwordHash?: string;
  jobTitle?: string;
}

export interface AuthSession {
  user: User;
  organization: Organization;
  token?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  companyId: string;
  phoneNumber: string;
  crewName?: string;
  jobTitle?: string;
  role: "crew" | "manager";
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
}

export type WeatherCondition = "sunny" | "rainy" | "stormy" | "snow" | "windy" | "extreme-heat" | "extreme-cold";

export interface WeatherDelay {
  id: string;
  jobId: string;
  date: string;
  condition: WeatherCondition;
  description: string;
  hoursLost: number;
  costImpact: number;
  photos?: string[];
  clientNotified: boolean;
  rescheduleDate?: string;
}

export interface ChangeOrder {
  id: string;
  jobId: string;
  estimateId?: string;
  clientId: string;
  clientName: string;
  orderNumber: number;
  description: string;
  reason: string;
  lineItems: LineItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: "draft" | "pending" | "approved" | "declined";
  createdDate: string;
  approvedDate?: string;
  clientSignature?: string;
  notes?: string;
}

export type EquipmentStatus = "available" | "in-use" | "maintenance" | "broken" | "retired";

export interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNumber?: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: EquipmentStatus;
  assignedTo?: string;
  location?: string;
  hoursUsed?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceHistory: MaintenanceRecord[];
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: "routine" | "repair" | "inspection";
  description: string;
  cost: number;
  performedBy: string;
  nextServiceDue?: string;
  partsReplaced?: string[];
}

export interface Subcontractor {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  trade: string;
  licenseNumber?: string;
  insuranceExpiry?: string;
  rating: number;
  jobsCompleted: number;
  totalPaid: number;
  notes?: string;
  w9OnFile: boolean;
  coiOnFile: boolean;
}

export interface SubcontractorJob {
  id: string;
  jobId: string;
  subcontractorId: string;
  subcontractorName: string;
  description: string;
  agreedAmount: number;
  actualAmount?: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  startDate: string;
  completionDate?: string;
  invoiceReceived: boolean;
  paid: boolean;
  paidDate?: string;
  notes?: string;
}

export type PermitStatus = "not-required" | "applying" | "pending" | "approved" | "denied" | "expired";

export interface Permit {
  id: string;
  jobId: string;
  propertyAddress: string;
  permitType: string;
  permitNumber?: string;
  status: PermitStatus;
  applicationDate?: string;
  approvalDate?: string;
  expiryDate?: string;
  cost: number;
  issuingAuthority: string;
  inspections: Inspection[];
  documents?: string[];
  notes?: string;
}

export interface Inspection {
  id: string;
  permitId: string;
  type: string;
  scheduledDate?: string;
  completedDate?: string;
  status: "scheduled" | "passed" | "failed" | "pending";
  inspector?: string;
  notes?: string;
  corrections?: string[];
}

export interface TimeCard {
  id: string;
  employeeId: string;
  employeeName: string;
  jobId?: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  totalHours: number;
  hourlyRate: number;
  regularHours: number;
  overtimeHours: number;
  totalPay: number;
  status: "draft" | "submitted" | "approved" | "paid";
  notes?: string;
  gpsLocation?: { lat: number; lng: number };
}

export interface Warranty {
  id: string;
  jobId: string;
  clientId: string;
  clientName: string;
  propertyAddress: string;
  workDescription: string;
  warrantyType: "labor" | "materials" | "both";
  startDate: string;
  expiryDate: string;
  terms: string[];
  exclusions: string[];
  status: "active" | "expired" | "claimed" | "void";
  claims: WarrantyClaim[];
  documents?: string[];
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  claimDate: string;
  description: string;
  status: "submitted" | "approved" | "denied" | "completed";
  resolutionDate?: string;
  resolutionNotes?: string;
  cost: number;
  photos?: string[];
}

export type IncidentSeverity = "minor" | "moderate" | "serious" | "critical";

export interface SafetyIncident {
  id: string;
  jobId?: string;
  date: string;
  time: string;
  location: string;
  severity: IncidentSeverity;
  type: string;
  description: string;
  injuredPerson?: string;
  witnessNames?: string[];
  medicalAttention: boolean;
  hospitalName?: string;
  oshaReportable: boolean;
  oshaReportNumber?: string;
  rootCause?: string;
  correctiveActions: string[];
  photos?: string[];
  reportedBy: string;
  reportedDate: string;
  status: "reported" | "investigating" | "resolved" | "closed";
}

export interface MaterialOrder {
  id: string;
  jobId?: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  items: MaterialOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: "draft" | "ordered" | "partial" | "delivered" | "cancelled";
  trackingNumber?: string;
  receivedBy?: string;
  notes?: string;
}

export interface MaterialOrderItem {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  received?: number;
}

export interface PunchListItem {
  id: string;
  jobId: string;
  description: string;
  location: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  status: "open" | "in-progress" | "completed" | "deferred";
  createdDate: string;
  dueDate?: string;
  completedDate?: string;
  photos?: string[];
  notes?: string;
  clientReported: boolean;
}

export type PayrollStatus = "draft" | "processing" | "completed" | "paid";

export interface PayrollPeriod {
  id: string;
  startDate: string;
  endDate: string;
  status: PayrollStatus;
  totalHours: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalAmount: number;
  processedDate?: string;
  paidDate?: string;
  employeePayrolls: EmployeePayroll[];
  notes?: string;
}

export interface EmployeePayroll {
  id: string;
  periodId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay: number;
  bonus?: number;
  deductions?: number;
  grossPay: number;
  netPay: number;
  timeCards: string[];
  status: "pending" | "approved" | "paid";
  paymentMethod?: "check" | "direct-deposit" | "cash";
  checkNumber?: string;
  paidDate?: string;
  notes?: string;
}

export interface PayrollSettings {
  id: string;
  organizationId: string;
  payPeriodType: "weekly" | "biweekly" | "semimonthly" | "monthly";
  overtimeThreshold: number;
  overtimeMultiplier: number;
  defaultPaymentMethod: "check" | "direct-deposit" | "cash";
  autoCalculate: boolean;
  taxSettings?: {
    federalTaxRate: number;
    stateTaxRate: number;
    socialSecurityRate: number;
    medicareRate: number;
  };
}

export interface PayrollReport {
  id: string;
  periodId: string;
  generatedDate: string;
  totalEmployees: number;
  totalHours: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  reportPdfUrl?: string;
}

export type JobType = 
  | "roofing"
  | "landscaping"
  | "plumbing"
  | "electrical"
  | "hvac"
  | "general_repair"
  | "tree_service"
  | "painting"
  | "renovation";

export type UrgencyLevel = 1 | 2 | 3;

export interface AIIntakeQuestion {
  id: string;
  question: string;
  field: string;
  required: boolean;
  type: "text" | "number" | "photo" | "location" | "date" | "choice";
  choices?: string[];
}

export interface AIJobIntake {
  id: string;
  jobType: JobType;
  customerName: string;
  phone: string;
  address: string;
  description: string;
  urgency: UrgencyLevel;
  photos: string[];
  specialRisks: string[];
  checklist: string[];
  notesForAdmin: string;
  preferredInspectionTime?: string;
  answers: Record<string, any>;
  status: "collecting" | "completed" | "assigned" | "dispatched";
  createdDate: string;
  completedDate?: string;
}

export interface CrewProfile {
  id: string;
  name: string;
  trade: JobType;
  trades: JobType[];
  currentLoad: number;
  maxJobsPerDay: number;
  baseLocation: {
    lat: number;
    lng: number;
  };
  serviceRadiusMiles: number;
  availability: {
    today: boolean;
    tomorrow: boolean;
    thisWeek: boolean;
  };
  tools: string[];
  rating: number;
  completedJobs: number;
}

export interface DispatchMatch {
  jobId: string;
  assignedCrew: {
    crewId: string;
    crewName: string;
    crewPhone?: string;
    reasonAssigned: string;
  };
  dispatchFlag: "urgent" | "regular";
  notesForCrew: string;
  estimatedArrivalWindow: string;
  customerNotification: string;
  score: number;
}

export interface CrewNotification {
  id: string;
  crewId: string;
  jobId: string;
  type: "new_job" | "job_update" | "schedule_change" | "message";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
}

export interface InvoiceDraft {
  id: string;
  jobId?: string;
  clientId: string;
  clientName: string;
  lineItems: LineItem[];
  subtotal: number;
  tax?: number;
  total: number;
  notes?: string;
  dueDate?: string;
  createdDate: string;
  lastModified: string;
  status: "draft";
}

export interface JobBudget {
  id: string;
  jobId: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  receipts: string[];
  categories: BudgetCategory[];
  lastUpdated: string;
  percentComplete: number;
  overBudget: boolean;
  warningThreshold: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  items: string[];
}

export interface PhoneIntakeContact {
  full_name: string;
  phone: string;
  email: string;
  preferred_contact: string;
}

export interface PhoneIntakeProperty {
  property_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  access_notes: string;
}

export interface PhoneIntakeLandscaping {
  service_type: string;
  area_size_sqft: string;
  current_condition: string;
  desired_style: string;
  recurring_or_one_time: string;
  budget_range: string;
  timeline: string;
}

export interface PhoneIntakeRoofing {
  service_type: string;
  roof_type: string;
  stories: string;
  age_of_roof_years: string;
  issue_reason: string;
  leak_or_damage_location: string;
  insurance_claim: string;
  recent_storm: string;
  budget_range: string;
  timeline: string;
}

export interface PhoneIntakeAppointment {
  is_scheduled: boolean;
  date: string;
  time_window: string;
  visit_type: string;
}

export interface PhoneIntakeCallMetadata {
  call_id: string;
  call_start: string;
  call_end: string;
}

export interface TradeSpecificFields {
  service_type?: string;
  area_size_sqft?: string;
  current_condition?: string;
  desired_style?: string;
  recurring_or_one_time?: string;
  budget_range?: string;
  timeline?: string;
  roof_type?: string;
  stories?: string;
  age_of_roof_years?: string;
  issue_reason?: string;
  leak_or_damage_location?: string;
  insurance_claim?: string;
  recent_storm?: string;
  system_type?: string;
  age_of_system?: string;
  last_maintenance?: string;
  pipe_material?: string;
  water_active?: string;
  scope_of_work?: string;
  room_count?: string;
  square_footage?: string;
  material_preference?: string;
  urgency_reason?: string;
  additional_details?: Record<string, string>;
}

export interface PhoneIntakeLead {
  id: string;
  trade_type: TradeType;
  lead_status: "new" | "contacted" | "qualified" | "scheduled" | "converted" | "lost";
  contact: PhoneIntakeContact;
  property: PhoneIntakeProperty;
  job_summary: string;
  trade_specific_fields?: TradeSpecificFields;
  photos_requested: boolean;
  appointment?: PhoneIntakeAppointment;
  notes_for_admin: string;
  call_metadata?: PhoneIntakeCallMetadata;
  created_date: string;
  assigned_to?: string;
  converted_to_job?: boolean;
  converted_to_estimate?: boolean;
}
