import { ContractType, TradeType } from '@/types';

export const MSA_TEMPLATE = `
<h2>MASTER SERVICE AGREEMENT (MSA)</h2>

<p>This Master Service Agreement ("Agreement") is made between:</p>

<h3>Contractor:</h3>
<p>
{{company_name}}<br/>
Phone: {{company_phone}}<br/>
Email: {{company_email}}<br/>
License #: {{company_license}}
</p>

<h3>Client:</h3>
<p>
{{client_name}}<br/>
Property: {{client_property_address}}
</p>

<p><strong>Effective Date:</strong> {{current_date}}</p>

<h3>1. PURPOSE</h3>
<p>This Agreement establishes the general terms under which {{company_name}} will provide construction, repair, or related services for {{client_name}}.</p>

<h3>2. SCOPE OF WORK</h3>
<p>Specific services will be listed in separate Work Orders or Project Contracts referencing this Agreement.</p>

<h3>3. TERM</h3>
<p>This Agreement will apply to all current and future work between {{company_name}} and {{client_name}}.</p>

<h3>4. PAYMENT TERMS</h3>
<p>Payments must be made as outlined per each Work Order or Project Contract.</p>

<h3>5. CHANGE ORDERS</h3>
<p>Any additions must be documented in writing and signed by both parties.</p>

<h3>6. LIABILITY & INSURANCE</h3>
<p>{{company_name}} maintains liability insurance for work performed.</p>

<h3>7. DISPUTE RESOLUTION</h3>
<p>Disputes will be resolved through mediation and binding arbitration.</p>

<h3>8. SIGNATURES</h3>
<p>
Contractor: __________________ Date: ________<br/>
Client: ______________________ Date: ________
</p>
`;

export const PROJECT_CONTRACT_TEMPLATE = `
<h2>PROJECT CONTRACT — {{project_name}}</h2>

<p>This Project Contract ("Agreement") is made between:</p>

<h3>CONTRACTOR:</h3>
<p>
{{company_name}}<br/>
Phone: {{company_phone}}<br/>
Email: {{company_email}}<br/>
License #: {{company_license}}
</p>

<h3>CLIENT:</h3>
<p>
{{client_name}}<br/>
Property Address: {{client_property_address}}
</p>

<h3>PROJECT LOCATION:</h3>
<p>{{project_address}}</p>

<h3>PROJECT SUMMARY:</h3>
<p>The Contractor agrees to furnish labor, materials, equipment, and supervision necessary to complete the work described herein.</p>

<h3>SCOPE OF WORK:</h3>
<p>{{scope_of_work}}</p>

<hr/>

<h3>CONTRACT AMOUNT:</h3>
<p><strong>TOTAL PROJECT COST: \${{contract_total_amount}}</strong></p>

<hr/>

<h3>SMART PAYMENT SCHEDULE:</h3>
<div>{{payment_schedule_table}}</div>
<p>Payments are due before commencement of the next phase.</p>
<p>Late payments may suspend work until resolved.</p>

<hr/>

<h3>PROJECT TIMELINE:</h3>
<p>
<strong>Start Date:</strong> {{project_start_date}}<br/>
<strong>Estimated Completion:</strong> {{project_end_date}}<br/>
<strong>Estimated Duration:</strong> {{project_duration_text}}
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

<hr/>

<h3>TRADE-SPECIFIC TERMS:</h3>
<div>{{trade_specific_clauses}}</div>

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

<h3>SAFETY & ACCESS:</h3>
<p>Client agrees to:</p>
<ul>
<li>Provide reasonable access to work areas</li>
<li>Remove pets, valuables, and hazards</li>
<li>Allow use of electricity and water as required</li>
</ul>

<hr/>

<h3>INSURANCE & LIABILITY:</h3>
<p>Contractor maintains liability insurance.</p>
<p>Contractor not liable for:</p>
<ul>
<li>Pre-existing damage</li>
<li>Hidden structural issues</li>
<li>Acts of God (weather/flood/fire/etc.)</li>
<li>Damage caused by other contractors</li>
</ul>

<hr/>

<h3>CONTRACTOR WARRANTY:</h3>
<p>Workmanship warranty valid for {{warranty_years}} years after completion.</p>
<p>Warranty excludes:</p>
<ul>
<li>Natural wear and tear</li>
<li>Damage by client or third parties</li>
<li>Extreme weather conditions</li>
<li>Manufacturer material defects (covered separately)</li>
</ul>

<hr/>

<h3>RISK & PROJECT SIZE TERMS:</h3>
<div>{{risk_clauses}}</div>

<hr/>

<h3>PERMITS & INSPECTIONS:</h3>
<p>Unless otherwise stated in writing:</p>
<ul>
<li>Contractor obtains required permits</li>
<li>Client pays permit fees</li>
<li>Inspections may delay completion date</li>
</ul>

<hr/>

<h3>DISPUTE RESOLUTION:</h3>
<p>Disputes will be resolved by:</p>
<ol>
<li>Informal discussion</li>
<li>Mediation</li>
<li>Binding arbitration (no courtroom litigation)</li>
</ol>

<hr/>

<h3>TERMINATION:</h3>
<p>Either party may terminate with:</p>
<ul>
<li>Written notice</li>
<li>Payment for completed work to date</li>
<li>Payment for ordered materials</li>
</ul>

<hr/>

<h3>ENTIRE AGREEMENT:</h3>
<p>This document and approved Change Orders represent the full agreement.</p>
<p>No verbal statements override this contract.</p>

<hr/>

<h3>SIGNATURES</h3>
<p>
Contractor: _______________________   Date: ___________<br/><br/>
Client: ___________________________   Date: ___________
</p>
`;

export const WORK_ORDER_TEMPLATE = `
<h2>WORK ORDER — Job #{{work_order_number}}</h2>

<h3>Contractor:</h3>
<p>
{{company_name}}<br/>
Phone: {{company_phone}}
</p>

<h3>Client:</h3>
<p>
{{client_name}}<br/>
Property: {{client_property_address}}
</p>

<h3>Work Description:</h3>
<p>{{work_description}}</p>

<h3>Pricing:</h3>
<p><strong>\${{work_order_total_amount}}</strong></p>

<h3>Payment Terms:</h3>
<p>Due at completion unless stated otherwise.</p>

<h3>Warranty:</h3>
<p>Workmanship warranty applies for {{warranty_days}} days.</p>

<h3>Signatures:</h3>
<p>
Client Signature: __________________ Date: ______<br/>
Contractor Signature: _____________ Date: ______
</p>
`;

export const CHANGE_ORDER_TEMPLATE = `
<h2>CHANGE ORDER — Project: {{project_name}}</h2>

<p><strong>Original Contract Total:</strong> \${{contract_total_amount}}</p>

<h3>Change Description:</h3>
<p>{{change_order_description}}</p>

<h3>Cost Breakdown:</h3>
<p>
Additional Labor: \${{labor_amount}}<br/>
Additional Materials: \${{material_amount}}<br/>
<strong>TOTAL CHANGE ORDER AMOUNT: \${{change_order_total}}</strong>
</p>

<h3>Revised Contract Total:</h3>
<p><strong>\${{revised_contract_amount}}</strong></p>

<h3>Revised Completion Date:</h3>
<p>{{revised_end_date}}</p>

<h3>SIGNATURES:</h3>
<p>
Contractor: __________ Date: ________<br/>
Client:     __________ Date: ________
</p>
`;

export const COMPLETION_CERTIFICATE_TEMPLATE = `
<h2>COMPLETION CERTIFICATE — Project: {{project_name}}</h2>

<p>This certifies that work has been completed at:</p>

<p><strong>{{client_property_address}}</strong></p>

<h3>Final Completion Date:</h3>
<p>{{completion_date}}</p>

<h3>Outstanding Balance Due:</h3>
<p><strong>\${{final_balance_due}}</strong></p>

<h3>Client Acknowledges:</h3>
<ul>
<li>☑ Work completed satisfactorily</li>
<li>☑ Warranty terms provided</li>
</ul>

<h3>SIGNATURES:</h3>
<p>
CLIENT SIGNATURE: _____________ Date: _____<br/>
CONTRACTOR SIGNATURE: _________ Date: _____
</p>
`;

export const WARRANTY_CERTIFICATE_TEMPLATE = `
<h2>WARRANTY CERTIFICATE — Project: {{project_name}}</h2>

<h3>Contractor:</h3>
<p>{{company_name}}</p>

<h3>Client:</h3>
<p>
{{client_name}}<br/>
Property: {{client_property_address}}
</p>

<h3>Workmanship Warranty Length:</h3>
<p><strong>{{warranty_years}} Years</strong></p>

<h3>Effective:</h3>
<p>{{completion_date}} to {{warranty_end_date}}</p>

<h3>Warranty Excludes:</h3>
<ul>
<li>Acts of God, misuse, other contractors, wear & tear.</li>
</ul>

<h3>SIGNATURES:</h3>
<p>
CLIENT SIGNATURE: _____________ Date: _____<br/>
CONTRACTOR SIGNATURE: _________ Date: _____
</p>
`;

export const MATERIAL_APPROVAL_TEMPLATE = `
<h2>MATERIAL APPROVAL — Project: {{project_name}}</h2>

<p><strong>Client:</strong> {{client_name}}<br/>
<strong>Contractor:</strong> {{company_name}}</p>

<h3>Material:</h3>
<p>{{material_item}}</p>

<p>
<strong>Brand:</strong> {{material_brand}}<br/>
<strong>Color/Finish:</strong> {{material_color_finish}}<br/>
<strong>Model #:</strong> {{material_model_number}}<br/>
<strong>Quantity:</strong> {{material_quantity}}
</p>

<h3>Client Approves:</h3>
<p>☑ Yes<br/>
☐ No</p>

<p>Signature: __________________ Date: _________</p>
`;

export const SUBCONTRACTOR_AGREEMENT_TEMPLATE = `
<h2>SUBCONTRACTOR AGREEMENT — {{project_name}}</h2>

<h3>Subcontractor:</h3>
<p>
{{subcontractor_name}}<br/>
Phone: {{subcontractor_phone}}
</p>

<h3>Work Scope:</h3>
<p>{{subcontractor_scope}}</p>

<h3>Rate:</h3>
<p><strong>\${{subcontractor_rate}}</strong> ({{subcontractor_rate_type}})</p>

<h3>Billing Schedule:</h3>
<p>{{billing_schedule}}</p>

<h3>Subcontractor provides:</h3>
<ul>
<li>Insurance</li>
<li>Tools</li>
<li>Licensed workers (if required)</li>
</ul>

<h3>SIGNATURES:</h3>
<p>
Subcontractor: __________ Date:_______<br/>
Contractor:    __________ Date:_______
</p>
`;

export const LIEN_WAIVER_CONDITIONAL_TEMPLATE = `
<h2>LIEN WAIVER (Conditional) — Project: {{project_name}}</h2>

<p>Upon receipt of payment: <strong>\${{payment_amount}}</strong></p>
<p>Contractor waives lien rights up to <strong>{{payment_through_date}}</strong></p>

<p>Contractor Signature: _________ Date: _______</p>
`;

export const LIEN_WAIVER_UNCONDITIONAL_TEMPLATE = `
<h2>LIEN WAIVER (Unconditional) — Project: {{project_name}}</h2>

<p>Payment Confirmed: <strong>\${{payment_amount}}</strong></p>
<p>Contractor permanently waives lien rights up to <strong>{{payment_through_date}}</strong></p>

<p>Contractor Signature: _________ Date: _______</p>
`;

export function getContractTemplate(type: ContractType): string {
  switch (type) {
    case 'MSA':
      return MSA_TEMPLATE;
    case 'PROJECT_CONTRACT':
      return PROJECT_CONTRACT_TEMPLATE;
    case 'WORK_ORDER':
      return WORK_ORDER_TEMPLATE;
    default:
      return '';
  }
}

export function getTradeSpecificClauses(tradeType?: TradeType): string {
  if (!tradeType) return '<p>No trade-specific terms.</p>';

  switch (tradeType) {
    case 'roofing':
      return `
        <h4>Roofing-Specific Terms:</h4>
        <ul>
          <li>All work complies with local building codes and manufacturer specifications</li>
          <li>Shingle warranty provided by manufacturer (if applicable)</li>
          <li>Weather-related delays may extend timeline</li>
          <li>Contractor not responsible for hidden roof deck damage until discovered</li>
          <li>Dumpster and debris removal included unless stated otherwise</li>
        </ul>
      `;
    case 'landscaping':
      return `
        <h4>Landscaping-Specific Terms:</h4>
        <ul>
          <li>Plant survival warranty: 30 days from installation</li>
          <li>Client responsible for watering and maintenance after installation</li>
          <li>Underground utility locations must be marked before work begins</li>
          <li>Soil conditions may require additional amendments</li>
          <li>Weather delays common during rainy seasons</li>
        </ul>
      `;
    case 'hvac':
      return `
        <h4>HVAC-Specific Terms:</h4>
        <ul>
          <li>Equipment warranty per manufacturer specifications</li>
          <li>Annual maintenance recommended for warranty validity</li>
          <li>Permits obtained per local code requirements</li>
          <li>System testing and commissioning included</li>
          <li>Existing ductwork condition may require additional work</li>
        </ul>
      `;
    case 'plumbing':
      return `
        <h4>Plumbing-Specific Terms:</h4>
        <ul>
          <li>All work performed to code</li>
          <li>Water shut-off required during installation</li>
          <li>Hidden pipe damage may require additional repairs</li>
          <li>Fixtures warranty per manufacturer</li>
          <li>Inspection required upon completion</li>
        </ul>
      `;
    case 'electrical':
      return `
        <h4>Electrical-Specific Terms:</h4>
        <ul>
          <li>All work performed to NEC standards</li>
          <li>Permits and inspections required</li>
          <li>Power outage required during installation</li>
          <li>Panel upgrades may be necessary for code compliance</li>
          <li>Warranty on labor and materials as specified</li>
        </ul>
      `;
    case 'painting':
      return `
        <h4>Painting-Specific Terms:</h4>
        <ul>
          <li>Surface preparation included in scope</li>
          <li>Paint warranty per manufacturer specifications</li>
          <li>Weather-dependent for exterior work</li>
          <li>Color selection final once work begins</li>
          <li>Touch-ups included within 30 days</li>
        </ul>
      `;
    case 'general_contractor':
      return `
        <h4>General Contracting Terms:</h4>
        <ul>
          <li>Contractor manages all subcontractors and trades</li>
          <li>Permits and inspections coordinated by contractor</li>
          <li>Change orders may be required for unforeseen conditions</li>
          <li>Client approvals required at major milestones</li>
          <li>Final walkthrough before completion certificate issued</li>
        </ul>
      `;
    default:
      return '<p>Standard trade terms apply.</p>';
  }
}

export function getRiskClauses(projectAmount: number): string {
  if (projectAmount < 5000) {
    return `
      <p><strong>Small Project Terms:</strong></p>
      <ul>
        <li>Payment due upon completion</li>
        <li>Minor warranty provided</li>
        <li>Verbal change orders acceptable with written confirmation within 24 hours</li>
      </ul>
    `;
  } else if (projectAmount < 25000) {
    return `
      <p><strong>Medium Project Terms:</strong></p>
      <ul>
        <li>Deposit required to begin work</li>
        <li>Progress payments at specified milestones</li>
        <li>All change orders must be in writing and signed</li>
        <li>Extended warranty available</li>
      </ul>
    `;
  } else {
    return `
      <p><strong>Large Project Terms:</strong></p>
      <ul>
        <li>Formal payment schedule with deposits</li>
        <li>Performance bond may be required</li>
        <li>Change orders require written approval with 3-day review period</li>
        <li>Comprehensive warranty included</li>
        <li>Weekly progress meetings recommended</li>
        <li>Final payment due upon signed completion certificate</li>
      </ul>
    `;
  }
}
