# Phone Intake AI System - ContractorOS

## Overview

The Phone Intake AI System is a professional lead management tool designed for contractors to efficiently capture and process customer inquiries received via phone. This system follows the specifications you provided and creates structured, actionable leads from customer conversations.

## Features

✅ **Structured Lead Capture** - Captures complete customer information in a standardized JSON format  
✅ **Trade Detection** - Automatically identifies whether the lead is for landscaping, roofing, or other trades  
✅ **Professional Dashboard** - Beautiful admin interface to view and manage all phone intake leads  
✅ **Lead Status Tracking** - Track leads through stages: New → Contacted → Scheduled → Converted  
✅ **Search & Filter** - Search by name, phone, address; filter by status  
✅ **Conversion Actions** - Convert leads to estimates or jobs with one tap  
✅ **Detailed Lead View** - See all collected information in an organized modal  
✅ **Mobile Optimized** - Clean, professional mobile-native design

## System Architecture

### Frontend
- **Phone Intake Dashboard** (`app/phone-intake-dashboard.tsx`)  
  - Displays all phone intake leads
  - Provides search, filter, and status management
  - Shows detailed lead information in modal
  - Allows conversion to estimates or jobs

### Backend API
- **Phone Intake Routes** (`backend/trpc/routes/ai-intake/route.ts`)
  - `createPhoneIntake` - Create new phone intake lead
  - `getAllPhoneIntakes` - Fetch all leads
  - `updatePhoneIntakeStatus` - Update lead status

### Data Types
- **PhoneIntakeLead** (`types/index.ts`)  
  Complete TypeScript interfaces matching the JSON schema

## JSON Schema

The system uses the exact JSON format specified in your requirements:

```json
{
  "trade_type": "landscaping" | "roofing" | "other",
  "lead_status": "new",
  "contact": {
    "full_name": "",
    "phone": "",
    "email": "",
    "preferred_contact": ""
  },
  "property": {
    "property_type": "",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "access_notes": ""
  },
  "job_summary": "",
  "landscaping": {
    "service_type": "",
    "area_size_sqft": "",
    "current_condition": "",
    "desired_style": "",
    "recurring_or_one_time": "",
    "budget_range": "",
    "timeline": ""
  },
  "roofing": {
    "service_type": "",
    "roof_type": "",
    "stories": "",
    "age_of_roof_years": "",
    "issue_reason": "",
    "leak_or_damage_location": "",
    "insurance_claim": "",
    "recent_storm": "",
    "budget_range": "",
    "timeline": ""
  },
  "photos_requested": false,
  "appointment": {
    "is_scheduled": false,
    "date": "",
    "time_window": "",
    "visit_type": ""
  },
  "notes_for_admin": "",
  "call_metadata": {
    "call_id": "",
    "call_start": "",
    "call_end": ""
  }
}
```

## How to Use

### 1. Creating a Phone Intake Lead

When your AI phone system collects customer information, create a lead:

```typescript
import { trpc } from '@/lib/trpc';

const createLeadMutation = trpc.aiIntake.createPhoneIntake.useMutation({
  onSuccess: (data) => {
    console.log('Lead created:', data.lead);
  }
});

// Create the lead
createLeadMutation.mutate({
  trade_type: "landscaping",
  contact: {
    full_name: "John Smith",
    phone: "(555) 123-4567",
    email: "john@email.com",
    preferred_contact: "phone"
  },
  property: {
    address: "123 Main St",
    city: "Austin",
    state: "TX",
    zip: "78701",
    property_type: "residential",
    access_notes: "Gate code is 1234"
  },
  job_summary: "Customer wants complete backyard landscaping",
  landscaping: {
    service_type: "full_landscaping",
    area_size_sqft: "2500",
    budget_range: "$8000-$12000",
    timeline: "within_2_weeks"
  },
  photos_requested: true,
  notes_for_admin: "Customer mentioned neighbor's recent work"
});
```

### 2. Viewing Leads in Dashboard

Navigate to the Phone Intake Dashboard:

```typescript
router.push('/phone-intake-dashboard');
```

The dashboard displays:
- **Stats Cards** - Total leads, new leads, scheduled, converted
- **Search Bar** - Search by name, phone, or address
- **Status Filters** - Filter by lead status
- **Lead Cards** - All leads with key information
- **Detail Modal** - Tap any lead to see full details

### 3. Managing Leads

From the detail modal, admins can:
- **Update Status** - Mark as contacted, scheduled, qualified, or converted
- **Convert to Estimate** - Creates a new estimate from lead data
- **Convert to Job** - Creates a new scheduled job
- **View All Details** - See complete customer and property information

### 4. Lead Status Flow

```
New → Contacted → Qualified → Scheduled → Converted
                                      ↓
                                   Lost
```

- **New** - Just received from phone intake
- **Contacted** - Admin has reached out to customer
- **Qualified** - Lead is qualified and viable
- **Scheduled** - Appointment or site visit scheduled
- **Converted** - Turned into estimate or job
- **Lost** - Lead didn't convert

## Integration with Your Phone System

To integrate with an external phone AI system:

### Option 1: Direct API Call

Your phone system can POST directly to the tRPC endpoint:

```bash
curl -X POST https://your-app.com/trpc/aiIntake.createPhoneIntake \
  -H "Content-Type: application/json" \
  -d '{
    "trade_type": "roofing",
    "contact": {
      "full_name": "Sarah Chen",
      "phone": "(555) 987-6543"
    },
    "property": {
      "address": "567 Maple Ave"
    },
    "job_summary": "Roof leak after hail storm",
    "roofing": {
      "service_type": "repair",
      "insurance_claim": "yes"
    }
  }'
```

### Option 2: Webhook Receiver

Create a webhook endpoint that receives calls from your phone AI and transforms them into the required format before creating leads.

### Option 3: Manual Entry

For now, you can manually test by calling the mutation from the app:

```typescript
// Test creating a lead
const testLead = {
  trade_type: "landscaping" as const,
  contact: {
    full_name: "Test Customer",
    phone: "(555) 000-0000",
    email: "test@example.com",
    preferred_contact: "phone"
  },
  property: {
    address: "123 Test St",
    city: "Test City",
    state: "TX",
    zip: "12345",
    property_type: "residential",
    access_notes: ""
  },
  job_summary: "Test job summary",
  photos_requested: false,
  notes_for_admin: "This is a test lead"
};
```

## Sample Data

The system includes mock data for testing:

1. **Landscaping Lead** - Complete backyard landscaping with budget range
2. **Roofing Lead** - Urgent roof leak from hail storm with insurance claim

Access the dashboard to see these examples.

## Customization

### Adding New Trades

To support additional trades beyond landscaping and roofing:

1. Update `trade_type` enum in `types/index.ts`:
```typescript
trade_type: "landscaping" | "roofing" | "plumbing" | "electrical" | ...
```

2. Add trade-specific data interfaces (like `PhoneIntakeLandscaping`)

3. Update the backend schema in `backend/trpc/routes/ai-intake/route.ts`

### Custom Fields

Add custom fields to capture additional information specific to your business:

1. Extend the interfaces in `types/index.ts`
2. Update the Zod schema in the backend
3. Display the fields in the dashboard modal

## Next Steps

### Recommended Enhancements

1. **Automatic Text/Email Confirmation** - Send confirmation to customer after lead is created
2. **AI Follow-up System** - Auto-follow-up via SMS next day if lead status is still "new"
3. **Photo Upload Link** - Generate and send link for customers to upload photos
4. **Cost Estimator** - Use AI to provide preliminary cost estimate from historical data
5. **Lead Scoring** - Automatically score leads based on urgency, budget, location
6. **CRM Integration** - Sync with external CRM systems
7. **Voice Recording** - Store and link call recordings to leads
8. **Transcription** - Auto-transcribe calls and extract structured data using AI

### Connecting to Real Phone AI

When you're ready to connect a real phone AI system (like Vapi, Bland AI, etc.):

1. Set up webhook endpoint in your app
2. Configure your phone AI to send structured JSON to the webhook
3. Map the phone AI output format to the `PhoneIntakeLead` schema
4. Create leads automatically from phone conversations

## Support

For questions or issues with the phone intake system, refer to:
- Type definitions: `types/index.ts`
- Backend routes: `backend/trpc/routes/ai-intake/route.ts`
- Dashboard UI: `app/phone-intake-dashboard.tsx`

## System Prompt for Phone AI

You provided a system prompt in your message. Here's how to use it:

**For AI phone systems** (like Vapi, Bland AI, etc.), configure the AI agent with:

- **Role**: Professional intake agent for contractors
- **Goal**: Collect structured information from callers
- **Trade Detection**: Identify landscaping vs roofing automatically
- **Output Format**: JSON matching the schema above
- **Behavior**: Friendly, concise, professional; ask only useful questions

The AI should ask for:
- Name, phone, address
- Job type and details
- Budget and timing
- Photos or site visit preference

Then output the clean JSON for your app to process.

---

**Status**: ✅ Fully Implemented and Ready to Use

Access the dashboard at: `/phone-intake-dashboard`
