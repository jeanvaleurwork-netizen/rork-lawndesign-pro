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

<p>This Project Contract ("Agreement") is entered into as of {{current_date}} ("Effective Date") by and between:</p>

<h3>CONTRACTOR:</h3>
<p>
{{company_name}}<br/>
Phone: {{company_phone}}<br/>
Email: {{company_email}}<br/>
License #: {{company_license}}<br/>
Address: {{company_address}}
</p>

<h3>CLIENT:</h3>
<p>
{{client_name}}<br/>
Email: {{client_email}}<br/>
Phone: {{client_phone}}<br/>
Property Address: {{client_property_address}}
</p>

<h3>PROJECT LOCATION:</h3>
<p>{{project_address}}</p>

<h3>RECITALS:</h3>
<p>WHEREAS, Contractor is engaged in the business of providing construction, renovation, and related services; and</p>
<p>WHEREAS, Client desires to engage Contractor to perform certain work at the Property as described herein; and</p>
<p>WHEREAS, Contractor agrees to perform such work in accordance with the terms and conditions set forth in this Agreement.</p>
<p>NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:</p>

<hr/>

<h3>ARTICLE 1: PROJECT SUMMARY</h3>
<p>The Contractor agrees to furnish all labor, materials, equipment, tools, transportation, supervision, and all other items necessary to complete the work described herein in a good and workmanlike manner in accordance with industry standards and applicable building codes, laws, and regulations.</p>

<h3>ARTICLE 2: SCOPE OF WORK</h3>
<p>{{scope_of_work}}</p>

<p>The Scope of Work includes all labor, materials, equipment, permits, fees, and incidentals necessary for the proper execution and completion of the Work, whether or not specifically mentioned in this Agreement, provided that such items are reasonably inferable as being necessary to produce the intended result.</p>

<hr/>

<h3>ARTICLE 3: CONTRACT AMOUNT</h3>
<p><strong>TOTAL PROJECT COST: \${{contract_total_amount}}</strong> ("Contract Price")</p>

<p>The Contract Price is the total compensation to be paid by Client to Contractor for complete performance of the Work in accordance with the Contract Documents. The Contract Price covers all labor, materials, equipment, overhead, profit, and all other costs associated with completion of the Work.</p>

<hr/>

<h3>ARTICLE 4: PAYMENT SCHEDULE</h3>
<div>{{payment_schedule_table}}</div>

<p><strong>Payment Terms:</strong></p>
<ul>
<li>Payments are due within seven (7) days of invoice date</li>
<li>Each payment is due before commencement of the next phase of work</li>
<li>Contractor reserves the right to suspend work if payment is not received within the specified timeframe</li>
<li>Late payments shall accrue interest at the rate of one and one-half percent (1.5%) per month or the maximum rate permitted by law, whichever is less</li>
<li>Client shall pay all costs of collection, including reasonable attorney fees, in the event of default</li>
</ul>

<hr/>

<h3>ARTICLE 5: PROJECT TIMELINE</h3>
<p>
<strong>Start Date:</strong> {{project_start_date}}<br/>
<strong>Estimated Completion Date:</strong> {{project_end_date}}<br/>
<strong>Estimated Duration:</strong> {{project_duration_text}}
</p>

<p><strong>Time of Performance:</strong> Time is not of the essence in this Agreement. The estimated completion date is based on current conditions and is subject to adjustment for the following reasons without penalty or liability to Contractor:</p>
<ul>
<li>Weather conditions that prevent work from being performed safely or in accordance with industry standards</li>
<li>Delays in obtaining required permits or inspections</li>
<li>Delays in delivery of materials or equipment beyond Contractor's reasonable control</li>
<li>Discovery of unforeseen conditions requiring additional work</li>
<li>Change orders requested by Client</li>
<li>Acts of God, fire, flood, labor disputes, epidemics, or other causes beyond Contractor's control</li>
<li>Failure by Client to make timely payments</li>
<li>Delays caused by other contractors, suppliers, or third parties</li>
</ul>

<hr/>

<h3>ARTICLE 6: CHANGE ORDER POLICY</h3>
<p>No changes to the Scope of Work shall be made except by written Change Order signed by both parties. Any work performed beyond the stated Scope of Work without a signed Change Order shall be at Contractor's discretion and may result in additional charges.</p>

<p>A Change Order may adjust:</p>
<ul>
<li>Contract Price (increase or decrease)</li>
<li>Project timeline and completion date</li>
<li>Materials to be used</li>
<li>Labor requirements</li>
<li>Any other terms affected by the change</li>
</ul>

<p>Verbal changes, agreements, or modifications are not accepted and shall not be binding on either party. Client understands that requesting changes to the Work may result in delays to the completion date and additional costs.</p>

<hr/>

<h3>ARTICLE 7: MATERIALS & EQUIPMENT</h3>
<p>Unless otherwise specified, all materials and equipment furnished by Contractor shall be:</p>
<ul>
<li>New and of industry-standard quality appropriate for the intended use</li>
<li>Installed in strict accordance with manufacturer specifications and recommendations</li>
<li>Suitable for the purposes intended</li>
<li>In compliance with applicable building codes and regulations</li>
</ul>

<p>Client acknowledges and understands that:</p>
<ul>
<li>Exact colors, textures, and finishes may vary from samples due to manufacturing variances, lot differences, lighting conditions, and natural variations in materials</li>
<li>Natural materials such as wood, stone, and tile will have variations in color, grain, and texture</li>
<li>Materials may not exactly match existing materials due to age, weathering, and manufacturing changes</li>
<li>Contractor is not responsible for discontinued materials or color/style variations</li>
</ul>

<p><strong>Material Substitution:</strong> If specified materials become unavailable, Contractor may substitute materials of equal or better quality and price. Contractor will notify Client of any material substitutions prior to installation. If substituted materials cost more, Client will be notified and a Change Order may be required.</p>

<p><strong>Material Selection and Approval:</strong> Client shall make timely selections of materials, colors, and finishes as required for the orderly progress of the Work. Failure to make timely selections may result in delays to the project timeline without penalty to Contractor.</p>

<hr/>

<h3>ARTICLE 8: TRADE-SPECIFIC TERMS</h3>
<div>{{trade_specific_clauses}}</div>

<hr/>

<h3>ARTICLE 9: HIDDEN CONDITIONS & UNFORESEEN CIRCUMSTANCES</h3>
<p>This Agreement is based on conditions visible and known at the time of contract execution. Contractor is not responsible for and this Agreement does not include repair or remediation of:</p>
<ul>
<li>Mold, mildew, rot, decay, or fungus</li>
<li>Termite, insect, or pest damage or infestation</li>
<li>Electrical, plumbing, HVAC, or mechanical conditions not visible or accessible</li>
<li>Improper or substandard previous installations by others</li>
<li>Structural defects, settling, or foundation issues</li>
<li>Underground obstructions, utilities, tanks, or debris</li>
<li>Hazardous materials including but not limited to asbestos, lead paint, radon</li>
<li>Water damage, leaks, or moisture issues</li>
<li>Code violations existing prior to this project</li>
</ul>

<p>Discovery of any such conditions shall entitle Contractor to additional compensation and time extension as documented in a Change Order. If hazardous materials are discovered, work in the affected area shall cease immediately, and Client shall engage appropriate licensed specialists to address such conditions at Client's expense.</p>

<hr/>

<h3>ARTICLE 10: SITE ACCESS, SAFETY & CLIENT RESPONSIBILITIES</h3>
<p>Client agrees to:</p>
<ul>
<li>Provide full, free, and safe access to all work areas during normal business hours and as required for efficient prosecution of the Work</li>
<li>Remove or protect personal property, furniture, valuables, and fragile items from work areas prior to commencement of work</li>
<li>Remove or secure pets from the property during work hours for the safety of workers and animals</li>
<li>Identify and remove any hazards in work areas</li>
<li>Allow use of electricity, water, and bathroom facilities as reasonably required</li>
<li>Provide secure space for storage of tools, equipment, and materials as needed</li>
<li>Maintain clear access for delivery of materials and equipment</li>
<li>Notify Contractor immediately of any safety concerns</li>
</ul>

<p>Contractor shall:</p>
<ul>
<li>Maintain a safe workplace in compliance with OSHA and applicable safety regulations</li>
<li>Use appropriate safety equipment and protective measures</li>
<li>Keep work areas reasonably clean and organized</li>
<li>Remove debris and construction waste regularly</li>
<li>Restore work areas to clean condition upon completion</li>
</ul>

<hr/>

<h3>ARTICLE 11: INSURANCE & LIABILITY</h3>
<p>Contractor maintains general liability insurance and workers' compensation insurance as required by law. Certificates of insurance shall be provided upon request.</p>

<p>Contractor shall not be liable for:</p>
<ul>
<li>Pre-existing damage, defects, or conditions</li>
<li>Hidden structural, mechanical, electrical, or plumbing issues</li>
<li>Damage resulting from Acts of God including but not limited to weather events, earthquakes, floods, fires, lightning</li>
<li>Damage caused by other contractors, subcontractors, suppliers, or third parties</li>
<li>Damage to underground utilities not properly marked by utility companies or Client</li>
<li>Normal wear and tear after project completion</li>
<li>Consequential or indirect damages</li>
<li>Client's failure to maintain completed work</li>
</ul>

<p><strong>Indemnification:</strong> Each party agrees to indemnify, defend, and hold harmless the other party from and against any claims, damages, losses, and expenses, including reasonable attorney fees, arising from their own negligent acts or omissions.</p>

<hr/>

<h3>ARTICLE 12: WARRANTY</h3>
<p>Contractor warrants that all work performed shall be completed in a workmanlike manner in accordance with industry standards. This workmanship warranty shall remain in effect for {{warranty_years}} year(s) from the date of substantial completion.</p>

<p><strong>Warranty Coverage:</strong> The workmanship warranty covers defects in labor and installation performed by Contractor. Contractor will repair or correct defects in workmanship at no additional cost to Client if reported within the warranty period.</p>

<p><strong>Warranty Exclusions:</strong> This warranty specifically excludes:</p>
<ul>
<li>Normal wear and tear, fading, or deterioration</li>
<li>Damage caused by Client, third parties, or subsequent alterations</li>
<li>Damage from accidents, misuse, abuse, or neglect</li>
<li>Failure to perform recommended maintenance</li>
<li>Damage from extreme weather conditions or Acts of God</li>
<li>Natural characteristics of materials including wood grain, stone veining, color variations</li>
<li>Material defects (covered separately by manufacturer warranties)</li>
<li>Settling, movement, or structural issues not caused by Contractor's work</li>
<li>Consequential or indirect damages</li>
</ul>

<p><strong>Manufacturer Warranties:</strong> Materials and equipment may be covered by separate manufacturer warranties. Contractor will provide available warranty information and assist with warranty claims but shall not be responsible for manufacturer defects or warranty performance.</p>

<p><strong>Warranty Claims:</strong> Client must notify Contractor in writing of any warranty claim within seven (7) days of discovery. Contractor shall have reasonable opportunity to inspect and repair. This warranty is void if repairs are attempted by others without Contractor's prior written consent.</p>

<p><strong>DISCLAIMER:</strong> THE WARRANTY SET FORTH ABOVE IS EXCLUSIVE AND IN LIEU OF ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. CONTRACTOR'S MAXIMUM LIABILITY UNDER THIS WARRANTY SHALL NOT EXCEED THE CONTRACT PRICE.</p>

<hr/>

<h3>ARTICLE 13: RISK & PROJECT SIZE TERMS</h3>
<div>{{risk_clauses}}</div>

<hr/>

<h3>ARTICLE 14: PERMITS & INSPECTIONS</h3>
<p>Unless otherwise agreed in writing:</p>
<ul>
<li>Contractor will obtain all required building permits for the Work</li>
<li>Client shall pay all permit fees, inspection fees, and related governmental charges</li>
<li>Contractor will schedule required inspections</li>
<li>Client acknowledges that inspections may cause delays to the completion date</li>
<li>If work fails inspection due to code violations, Contractor will correct deficiencies at no additional cost</li>
<li>If work fails inspection due to design issues, client-requested modifications, or circumstances beyond Contractor's control, correction costs may be additional</li>
</ul>

<hr/>

<h3>ARTICLE 15: DISPUTE RESOLUTION</h3>
<p>The parties agree to resolve any disputes arising from this Agreement through the following process:</p>
<ol>
<li><strong>Informal Discussion:</strong> The parties shall first attempt to resolve any dispute through good-faith informal discussion and negotiation</li>
<li><strong>Mediation:</strong> If informal discussion fails to resolve the dispute within thirty (30) days, the parties agree to participate in mediation with a mutually agreed-upon mediator. The costs of mediation shall be shared equally</li>
<li><strong>Binding Arbitration:</strong> If mediation fails to resolve the dispute, the parties agree to binding arbitration conducted in accordance with the rules of the American Arbitration Association. The arbitrator's decision shall be final and binding. Judgment on the arbitration award may be entered in any court having jurisdiction</li>
</ol>

<p>The parties expressly waive the right to pursue litigation in court except for the limited purpose of enforcing the arbitration award. Each party shall bear its own costs and attorney fees unless the arbitrator determines otherwise.</p>

<hr/>

<h3>ARTICLE 16: TERMINATION</h3>
<p><strong>Termination by Client:</strong> Client may terminate this Agreement at any time upon seven (7) days written notice to Contractor. Upon termination by Client:</p>
<ul>
<li>Client shall pay for all work completed to the date of termination</li>
<li>Client shall pay for all materials ordered or purchased for the project</li>
<li>Client shall reimburse Contractor for reasonable costs incurred in preparing to commence or in performing the Work</li>
<li>Client shall pay liquidated demobilization costs equal to ten percent (10%) of the unpaid Contract Price</li>
</ul>

<p><strong>Termination by Contractor:</strong> Contractor may terminate this Agreement upon seven (7) days written notice to Client if:</p>
<ul>
<li>Client fails to make payment when due and such failure continues for seven (7) days after written notice</li>
<li>Work is stopped by court order or governmental authority</li>
<li>Client materially breaches this Agreement</li>
</ul>

<p>Upon termination, Contractor shall be entitled to payment for all work completed and costs incurred, including reasonable demobilization costs.</p>

<hr/>

<h3>ARTICLE 17: GENERAL PROVISIONS</h3>

<p><strong>Entire Agreement:</strong> This Agreement, including all referenced documents, specifications, and Change Orders, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements, whether oral or written. No verbal statements, promises, or representations shall modify or supersede this written Agreement.</p>

<p><strong>Modifications:</strong> This Agreement may be modified only by written Change Order or amendment signed by both parties.</p>

<p><strong>Assignment:</strong> Neither party may assign this Agreement without the prior written consent of the other party.</p>

<p><strong>Governing Law:</strong> This Agreement shall be governed by and construed in accordance with the laws of the state in which the Project is located, without regard to conflict of law principles.</p>

<p><strong>Severability:</strong> If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>

<p><strong>Waiver:</strong> The failure of either party to enforce any provision of this Agreement shall not constitute a waiver of that provision or the right to enforce it in the future.</p>

<p><strong>Attorney Fees:</strong> In the event of any legal action to enforce this Agreement, the prevailing party shall be entitled to recover reasonable attorney fees and costs.</p>

<p><strong>Notice:</strong> All notices required under this Agreement shall be in writing and delivered by hand, overnight courier, or certified mail to the addresses set forth above.</p>

<p><strong>Authority:</strong> Each party represents and warrants that it has full authority to enter into this Agreement and that the person signing on behalf of such party has been duly authorized to execute this Agreement.</p>

<p><strong>Photography and Marketing:</strong> Contractor may photograph the completed work for portfolio, marketing, and promotional purposes unless Client objects in writing.</p>

<hr/>

<h3>ARTICLE 18: ACKNOWLEDGMENTS</h3>
<p>By signing this Agreement, Client acknowledges that:</p>
<ul>
<li>Client has read and understands all terms and conditions of this Agreement</li>
<li>Client has had the opportunity to ask questions and seek legal counsel</li>
<li>Client agrees to all terms, conditions, and provisions set forth herein</li>
<li>Client understands that estimates and completion dates are approximate and subject to adjustment</li>
<li>Client will provide timely access, cooperation, and approvals as required</li>
<li>Client will make timely payments in accordance with the payment schedule</li>
</ul>

<hr/>

<h3>SIGNATURES</h3>
<p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.</p>

<p><strong>CONTRACTOR:</strong></p>
<p>
{{company_name}}<br/>
Signature: _______________________<br/>
Printed Name: _____________________<br/>
Title: ____________________________<br/>
Date: ____________________________
</p>
<br/>

<p><strong>CLIENT:</strong></p>
<p>
{{client_name}}<br/>
Signature: _______________________<br/>
Printed Name: _____________________<br/>
Date: ____________________________
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
