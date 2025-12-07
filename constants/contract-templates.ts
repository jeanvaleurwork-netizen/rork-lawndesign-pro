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

export const TIME_MATERIALS_TEMPLATE = `
<h2>TIME & MATERIALS CONTRACT — {{project_name}}</h2>

<p>This Time & Materials Agreement ("Agreement") is made between:</p>

<h3>CONTRACTOR:</h3>
<p>
{{company_name}}<br/>
Phone: {{company_phone}}<br/>
License #: {{company_license}}
</p>

<h3>CLIENT:</h3>
<p>
{{client_name}}<br/>
Property: {{client_property_address}}
</p>

<h3>SCOPE:</h3>
<p>{{scope_of_work}}</p>

<h3>RATES:</h3>
<ul>
<li>Labor: \${{labor_rate}}/hour</li>
<li>Materials: Cost + {{material_markup}}% markup</li>
<li>Equipment: Actual cost</li>
</ul>

<h3>PAYMENT:</h3>
<p>Invoices submitted weekly/monthly. Payment due within {{payment_terms}} days.</p>

<h3>ESTIMATED BUDGET:</h3>
<p>Not to exceed: \${{contract_total_amount}} without written approval</p>

<h3>SIGNATURES:</h3>
<p>
Contractor: ____________ Date: _____<br/>
Client: ________________ Date: _____
</p>
`;

export const FIXED_PRICE_TEMPLATE = `
<h2>FIXED PRICE CONTRACT — {{project_name}}</h2>

<h3>CONTRACTOR:</h3>
<p>{{company_name}}<br/>License: {{company_license}}</p>

<h3>CLIENT:</h3>
<p>{{client_name}}<br/>{{client_property_address}}</p>

<h3>WORK TO BE PERFORMED:</h3>
<p>{{scope_of_work}}</p>

<h3>TOTAL FIXED PRICE:</h3>
<p><strong>\${{contract_total_amount}}</strong></p>
<p>This price includes ALL labor, materials, equipment, permits, and fees.</p>
<p>No additional charges unless covered by approved Change Order.</p>

<h3>PAYMENT SCHEDULE:</h3>
<div>{{payment_schedule_table}}</div>

<h3>TIMELINE:</h3>
<p>Start: {{project_start_date}}<br/>Completion: {{project_end_date}}</p>

<h3>WARRANTY:</h3>
<p>{{warranty_years}} year workmanship warranty</p>

<h3>SIGNATURES:</h3>
<p>
Contractor: ____________ Date: _____<br/>
Client: ________________ Date: _____
</p>
`;

export const COST_PLUS_TEMPLATE = `
<h2>COST PLUS CONTRACT — {{project_name}}</h2>

<h3>PARTIES:</h3>
<p><strong>Contractor:</strong> {{company_name}}<br/>
<strong>Client:</strong> {{client_name}}</p>

<h3>PROJECT:</h3>
<p>{{scope_of_work}}</p>

<h3>PRICING STRUCTURE:</h3>
<p>Actual costs for labor, materials, and equipment PLUS {{contractor_fee_percent}}% contractor fee.</p>

<h3>COST TRACKING:</h3>
<ul>
<li>All receipts and invoices provided weekly</li>
<li>Transparent cost reporting</li>
<li>Open book accounting</li>
</ul>

<h3>ESTIMATED TOTAL:</h3>
<p>\${{contract_total_amount}} (estimate only, final based on actual costs)</p>

<h3>PAYMENT:</h3>
<p>Invoiced weekly based on costs incurred plus fee.</p>

<h3>SIGNATURES:</h3>
<p>
Contractor: ____________ Date: _____<br/>
Client: ________________ Date: _____
</p>
`;

export const LUMP_SUM_TEMPLATE = `
<h2>LUMP SUM CONTRACT — {{project_name}}</h2>

<h3>AGREEMENT DATE:</h3>
<p>{{current_date}}</p>

<h3>PARTIES:</h3>
<p><strong>Contractor:</strong> {{company_name}}<br/>
<strong>Owner:</strong> {{client_name}}<br/>
<strong>Project Address:</strong> {{client_property_address}}</p>

<h3>WORK DESCRIPTION:</h3>
<p>{{scope_of_work}}</p>

<h3>LUMP SUM PRICE:</h3>
<p><strong>\${{contract_total_amount}}</strong></p>
<p>Contractor agrees to complete ALL work for this single fixed sum.</p>

<h3>INCLUSIONS:</h3>
<ul>
<li>All labor and supervision</li>
<li>All materials and equipment</li>
<li>All permits and fees</li>
<li>Cleanup and disposal</li>
</ul>

<h3>PAYMENT TERMS:</h3>
<div>{{payment_schedule_table}}</div>

<h3>SUBSTANTIAL COMPLETION:</h3>
<p>{{project_end_date}}</p>

<h3>SIGNATURES:</h3>
<p>
Contractor: ____________ Date: _____<br/>
Owner: _________________ Date: _____
</p>
`;

export const UNIT_PRICE_TEMPLATE = `
<h2>UNIT PRICE CONTRACT — {{project_name}}</h2>

<h3>CONTRACTOR:</h3>
<p>{{company_name}}<br/>License: {{company_license}}</p>

<h3>CLIENT:</h3>
<p>{{client_name}}<br/>{{client_property_address}}</p>

<h3>UNIT PRICES:</h3>
<table>
<tr><th>Item</th><th>Unit</th><th>Price/Unit</th></tr>
{{unit_price_table}}
</table>

<h3>ESTIMATED QUANTITIES:</h3>
<p>Actual quantities will be measured upon completion.</p>
<p>Final price = Actual quantities × Unit prices</p>

<h3>ESTIMATED TOTAL:</h3>
<p>\${{contract_total_amount}} (based on estimated quantities)</p>

<h3>PAYMENT:</h3>
<p>Monthly invoicing based on work completed and measured.</p>

<h3>SIGNATURES:</h3>
<p>
Contractor: ____________ Date: _____<br/>
Client: ________________ Date: _____
</p>
`;

export const SERVICE_AGREEMENT_TEMPLATE = `
<h2>SERVICE AGREEMENT</h2>

<h3>SERVICE PROVIDER:</h3>
<p>{{company_name}}<br/>
Phone: {{company_phone}}<br/>
Email: {{company_email}}</p>

<h3>CLIENT:</h3>
<p>{{client_name}}<br/>
{{client_property_address}}<br/>
Phone: {{client_phone}}</p>

<h3>SERVICES PROVIDED:</h3>
<p>{{scope_of_work}}</p>

<h3>SERVICE FREQUENCY:</h3>
<p>{{service_frequency}}</p>

<h3>TERM:</h3>
<p>Start: {{project_start_date}}<br/>
End: {{project_end_date}}<br/>
Auto-renewal: {{auto_renewal}}</p>

<h3>PRICING:</h3>
<p><strong>\${{monthly_rate}}/month</strong></p>
<p>Payment due: {{payment_due_date}} of each month</p>

<h3>CANCELLATION:</h3>
<p>Either party may cancel with {{cancellation_notice}} days written notice.</p>

<h3>SIGNATURES:</h3>
<p>
Service Provider: ____________ Date: _____<br/>
Client: _____________________ Date: _____
</p>
`;

export const MAINTENANCE_AGREEMENT_TEMPLATE = `
<h2>MAINTENANCE AGREEMENT</h2>

<h3>SERVICE PROVIDER:</h3>
<p>{{company_name}}<br/>{{company_phone}}</p>

<h3>PROPERTY OWNER:</h3>
<p>{{client_name}}<br/>{{client_property_address}}</p>

<h3>MAINTENANCE SERVICES:</h3>
<p>{{scope_of_work}}</p>

<h3>SCHEDULE:</h3>
<ul>
<li>Regular maintenance visits: {{maintenance_frequency}}</li>
<li>Emergency service included: {{emergency_included}}</li>
<li>Response time: {{response_time}}</li>
</ul>

<h3>COVERAGE:</h3>
<ul>
<li>Routine inspections</li>
<li>Preventive maintenance</li>
<li>Minor repairs (up to \${{minor_repair_limit}})</li>
<li>Priority scheduling</li>
</ul>

<h3>ANNUAL FEE:</h3>
<p><strong>\${{contract_total_amount}}</strong></p>
<p>Payment: {{payment_schedule}}</p>

<h3>TERM:</h3>
<p>{{term_length}} with automatic renewal</p>

<h3>SIGNATURES:</h3>
<p>
Service Provider: ____________ Date: _____<br/>
Property Owner: _____________ Date: _____
</p>
`;

export const DESIGN_BUILD_TEMPLATE = `
<h2>DESIGN-BUILD CONTRACT — {{project_name}}</h2>

<h3>DESIGN-BUILD CONTRACTOR:</h3>
<p>{{company_name}}<br/>
License: {{company_license}}</p>

<h3>OWNER:</h3>
<p>{{client_name}}<br/>{{client_property_address}}</p>

<h3>PROJECT DESCRIPTION:</h3>
<p>Contractor provides BOTH design and construction services for:</p>
<p>{{scope_of_work}}</p>

<h3>PHASES:</h3>
<h4>Phase 1: Design Development</h4>
<p>Preliminary designs, drawings, specifications<br/>
Fee: \${{design_fee}}</p>

<h4>Phase 2: Construction</h4>
<p>Build per approved design<br/>
Fee: \${{construction_amount}}</p>

<h3>TOTAL CONTRACT PRICE:</h3>
<p><strong>\${{contract_total_amount}}</strong></p>

<h3>OWNER APPROVALS:</h3>
<p>Owner must approve design before construction begins.</p>
<p>Design changes during construction may result in additional fees.</p>

<h3>TIMELINE:</h3>
<p>Design: {{design_duration}}<br/>
Construction: {{construction_duration}}<br/>
Total: {{project_duration_text}}</p>

<h3>SIGNATURES:</h3>
<p>
Design-Build Contractor: ____________ Date: _____<br/>
Owner: ______________________________ Date: _____
</p>
`;

export const SUPPLY_AGREEMENT_TEMPLATE = `
<h2>MATERIALS SUPPLY AGREEMENT</h2>

<h3>SUPPLIER:</h3>
<p>{{company_name}}<br/>{{company_phone}}</p>

<h3>PURCHASER:</h3>
<p>{{client_name}}<br/>{{client_property_address}}</p>

<h3>MATERIALS TO BE SUPPLIED:</h3>
<p>{{scope_of_work}}</p>

<h3>PRICING:</h3>
<p><strong>Total: \${{contract_total_amount}}</strong></p>
<p>{{payment_terms}}</p>

<h3>DELIVERY:</h3>
<p>Delivery to: {{delivery_address}}<br/>
Delivery date: {{delivery_date}}<br/>
Delivery fee: {{delivery_fee}}</p>

<h3>INSPECTION & ACCEPTANCE:</h3>
<p>Purchaser has {{inspection_days}} days to inspect materials and report defects.</p>

<h3>WARRANTY:</h3>
<p>Materials warranted per manufacturer specifications.</p>

<h3>SIGNATURES:</h3>
<p>
Supplier: ______________ Date: _____<br/>
Purchaser: _____________ Date: _____
</p>
`;

export const EQUIPMENT_RENTAL_TEMPLATE = `
<h2>EQUIPMENT RENTAL AGREEMENT</h2>

<h3>RENTAL COMPANY:</h3>
<p>{{company_name}}<br/>{{company_phone}}</p>

<h3>RENTER:</h3>
<p>{{client_name}}<br/>{{client_property_address}}</p>

<h3>EQUIPMENT:</h3>
<p>{{equipment_description}}</p>
<p>Serial/Model: {{equipment_serial}}</p>

<h3>RENTAL PERIOD:</h3>
<p>Pickup: {{rental_start_date}}<br/>
Return: {{rental_end_date}}<br/>
Duration: {{rental_duration}}</p>

<h3>RENTAL RATE:</h3>
<p>\${{daily_rate}}/day or \${{weekly_rate}}/week<br/>
<strong>Total: \${{contract_total_amount}}</strong></p>

<h3>DEPOSIT:</h3>
<p>Security deposit: \${{security_deposit}}<br/>
Refundable upon return in good condition</p>

<h3>RENTER RESPONSIBILITIES:</h3>
<ul>
<li>Operate equipment safely and properly</li>
<li>Maintain insurance coverage</li>
<li>Return equipment clean and in same condition</li>
<li>Responsible for damage or loss</li>
</ul>

<h3>LATE FEES:</h3>
<p>\${{late_fee_rate}}/day for late returns</p>

<h3>SIGNATURES:</h3>
<p>
Rental Company: ____________ Date: _____<br/>
Renter: ___________________ Date: _____
</p>
`;

export const NDA_TEMPLATE = `
<h2>NON-DISCLOSURE AGREEMENT (NDA)</h2>

<h3>EFFECTIVE DATE:</h3>
<p>{{current_date}}</p>

<h3>PARTIES:</h3>
<p><strong>Disclosing Party:</strong> {{company_name}}<br/>
<strong>Receiving Party:</strong> {{client_name}}</p>

<h3>PURPOSE:</h3>
<p>{{nda_purpose}}</p>

<h3>CONFIDENTIAL INFORMATION:</h3>
<p>Includes but not limited to:</p>
<ul>
<li>Business plans and strategies</li>
<li>Pricing and cost information</li>
<li>Customer lists</li>
<li>Proprietary designs and methods</li>
<li>Trade secrets</li>
</ul>

<h3>OBLIGATIONS:</h3>
<p>Receiving Party agrees to:</p>
<ul>
<li>Keep confidential information strictly confidential</li>
<li>Not disclose to third parties</li>
<li>Use only for agreed purpose</li>
<li>Return or destroy information upon request</li>
</ul>

<h3>TERM:</h3>
<p>This agreement remains in effect for {{nda_term_years}} years from the effective date.</p>

<h3>EXCLUSIONS:</h3>
<p>Information that is:</p>
<ul>
<li>Publicly available</li>
<li>Already known to Receiving Party</li>
<li>Independently developed</li>
<li>Legally obtained from third party</li>
</ul>

<h3>SIGNATURES:</h3>
<p>
Disclosing Party: ____________ Date: _____<br/>
Receiving Party: _____________ Date: _____
</p>
`;

export const PROPOSAL_TEMPLATE = `
<h2>PROJECT PROPOSAL — {{project_name}}</h2>

<h3>PREPARED FOR:</h3>
<p>{{client_name}}<br/>
{{client_property_address}}<br/>
Date: {{current_date}}</p>

<h3>PREPARED BY:</h3>
<p>{{company_name}}<br/>
{{company_phone}}<br/>
{{company_email}}<br/>
License: {{company_license}}</p>

<h3>PROJECT OVERVIEW:</h3>
<p>{{scope_of_work}}</p>

<h3>SCOPE OF WORK:</h3>
<p>{{detailed_scope}}</p>

<h3>APPROACH & METHODOLOGY:</h3>
<p>{{methodology}}</p>

<h3>TIMELINE:</h3>
<p>Start: {{project_start_date}}<br/>
Duration: {{project_duration_text}}<br/>
Completion: {{project_end_date}}</p>

<h3>INVESTMENT:</h3>
<p><strong>Total Project Cost: \${{contract_total_amount}}</strong></p>
<div>{{payment_schedule_table}}</div>

<h3>WHY CHOOSE US:</h3>
<ul>
<li>{{years_experience}} years experience</li>
<li>Licensed and insured</li>
<li>{{warranty_years}}-year warranty</li>
<li>Professional crew</li>
</ul>

<h3>PROPOSAL VALIDITY:</h3>
<p>This proposal is valid for {{proposal_validity_days}} days from date above.</p>

<h3>ACCEPTANCE:</h3>
<p>Client Signature: ___________________ Date: _____</p>
<p>By signing, client accepts this proposal and authorizes work to begin.</p>
`;

export const LETTER_OF_INTENT_TEMPLATE = `
<h2>LETTER OF INTENT</h2>

<p>Date: {{current_date}}</p>

<p>To: {{client_name}}<br/>
{{client_property_address}}</p>

<p>From: {{company_name}}<br/>
{{company_address}}</p>

<p>Re: <strong>{{project_name}}</strong></p>

<p>Dear {{client_name}},</p>

<p>This Letter of Intent ("LOI") confirms our mutual interest in proceeding with the above-referenced project.</p>

<h3>PROJECT:</h3>
<p>{{scope_of_work}}</p>

<h3>PROPOSED TERMS:</h3>
<ul>
<li><strong>Estimated Cost:</strong> \${{contract_total_amount}}</li>
<li><strong>Estimated Timeline:</strong> {{project_duration_text}}</li>
<li><strong>Start Date:</strong> {{project_start_date}}</li>
</ul>

<h3>NEXT STEPS:</h3>
<ol>
<li>Finalize detailed scope of work</li>
<li>Complete site surveys/inspections</li>
<li>Prepare formal contract</li>
<li>Obtain necessary permits</li>
</ol>

<h3>NON-BINDING:</h3>
<p>This LOI expresses intent only and is non-binding. A formal contract will follow containing complete terms and conditions.</p>

<h3>EXCLUSIVITY PERIOD:</h3>
<p>The parties agree to negotiate exclusively for {{exclusivity_days}} days from this date.</p>

<h3>DEPOSIT:</h3>
<p>Upon execution of this LOI, Client will provide a good faith deposit of \${{deposit_amount}}, refundable if formal contract is not executed.</p>

<p>If these terms are acceptable, please sign below.</p>

<p>Sincerely,<br/>
{{company_name}}</p>

<h3>ACCEPTANCE:</h3>
<p>
{{company_name}}: ____________ Date: _____<br/>
{{client_name}}: _____________ Date: _____
</p>
`;

export function getContractTemplate(type: ContractType): string {
  switch (type) {
    case 'MSA':
      return MSA_TEMPLATE;
    case 'PROJECT_CONTRACT':
      return PROJECT_CONTRACT_TEMPLATE;
    case 'WORK_ORDER':
      return WORK_ORDER_TEMPLATE;
    case 'TIME_MATERIALS':
      return TIME_MATERIALS_TEMPLATE;
    case 'FIXED_PRICE':
      return FIXED_PRICE_TEMPLATE;
    case 'COST_PLUS':
      return COST_PLUS_TEMPLATE;
    case 'LUMP_SUM':
      return LUMP_SUM_TEMPLATE;
    case 'UNIT_PRICE':
      return UNIT_PRICE_TEMPLATE;
    case 'SERVICE_AGREEMENT':
      return SERVICE_AGREEMENT_TEMPLATE;
    case 'MAINTENANCE_AGREEMENT':
      return MAINTENANCE_AGREEMENT_TEMPLATE;
    case 'DESIGN_BUILD':
      return DESIGN_BUILD_TEMPLATE;
    case 'SUPPLY_AGREEMENT':
      return SUPPLY_AGREEMENT_TEMPLATE;
    case 'EQUIPMENT_RENTAL':
      return EQUIPMENT_RENTAL_TEMPLATE;
    case 'NDA':
      return NDA_TEMPLATE;
    case 'PROPOSAL':
      return PROPOSAL_TEMPLATE;
    case 'LETTER_OF_INTENT':
      return LETTER_OF_INTENT_TEMPLATE;
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
