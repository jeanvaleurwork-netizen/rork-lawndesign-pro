import { Estimate } from "@/types";

export interface PDFEstimateOptions {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  logoUrl?: string;
  validUntil?: string;
}

export function generateEstimatePDF(
  estimate: Estimate,
  options: PDFEstimateOptions
): string {
  const {
    companyName,
    companyPhone,
    companyEmail,
    companyAddress,
    validUntil,
  } = options;

  const createdDate = new Date(estimate.createdDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const expiryDate = validUntil ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estimate ${estimate.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a202c;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
    }
    .company-info {
      flex: 1;
    }
    .company-name {
      font-size: 28px;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 8px;
    }
    .company-details {
      font-size: 14px;
      color: #4a5568;
      line-height: 1.8;
    }
    .estimate-title {
      text-align: right;
      flex: 1;
    }
    .estimate-label {
      font-size: 36px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 8px;
    }
    .estimate-id {
      font-size: 14px;
      color: #718096;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      gap: 40px;
    }
    .info-block {
      flex: 1;
    }
    .info-heading {
      font-size: 12px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .info-content {
      font-size: 14px;
      color: #1a202c;
      line-height: 1.8;
    }
    .project-summary {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 32px;
      border-left: 4px solid #3b82f6;
    }
    .project-summary-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 12px;
    }
    .project-summary-text {
      font-size: 14px;
      color: #4a5568;
      line-height: 1.8;
    }
    .line-items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    .line-items-table thead {
      background: #edf2f7;
    }
    .line-items-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #2d3748;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .line-items-table td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #1a202c;
    }
    .line-items-table tbody tr:hover {
      background: #f7fafc;
    }
    .text-right {
      text-align: right;
    }
    .cost-summary {
      max-width: 400px;
      margin-left: auto;
      margin-bottom: 40px;
    }
    .cost-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      font-size: 15px;
      border-bottom: 1px solid #e2e8f0;
    }
    .cost-label {
      color: #4a5568;
    }
    .cost-value {
      font-weight: 600;
      color: #1a202c;
    }
    .cost-total {
      background: #edf2f7;
      padding: 16px 20px;
      border-radius: 8px;
      margin-top: 8px;
    }
    .cost-total .cost-label {
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
    }
    .cost-total .cost-value {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
    }
    .notes-section {
      background: #fffbeb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 40px;
      border-left: 4px solid #f59e0b;
    }
    .notes-title {
      font-size: 14px;
      font-weight: 600;
      color: #78350f;
      margin-bottom: 12px;
    }
    .notes-content {
      font-size: 14px;
      color: #92400e;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .acceptance-section {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 2px solid #e2e8f0;
    }
    .acceptance-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 24px;
    }
    .signature-fields {
      display: flex;
      gap: 40px;
      margin-top: 24px;
    }
    .signature-field {
      flex: 1;
    }
    .signature-line {
      border-bottom: 2px solid #1a202c;
      margin-bottom: 8px;
      height: 50px;
    }
    .signature-label {
      font-size: 12px;
      color: #718096;
    }
    .footer {
      margin-top: 60px;
      text-align: center;
      font-size: 12px;
      color: #a0aec0;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">${companyName}</div>
      <div class="company-details">
        ${companyPhone}<br>
        ${companyEmail}<br>
        ${companyAddress}
      </div>
    </div>
    <div class="estimate-title">
      <div class="estimate-label">ESTIMATE</div>
      <div class="estimate-id">#${estimate.id}</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-block">
      <div class="info-heading">Client</div>
      <div class="info-content">
        <strong>${estimate.clientName}</strong><br>
        ${estimate.propertyAddress}
      </div>
    </div>
    <div class="info-block">
      <div class="info-heading">Estimate Details</div>
      <div class="info-content">
        <strong>Date:</strong> ${createdDate}<br>
        <strong>Valid Until:</strong> ${expiryDate}
      </div>
    </div>
  </div>

  ${estimate.notes ? `
  <div class="project-summary">
    <div class="project-summary-title">Project Summary</div>
    <div class="project-summary-text">${estimate.notes}</div>
  </div>
  ` : ''}

  <table class="line-items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${estimate.lineItems.map(item => `
        <tr>
          <td>${item.name}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${item.unit}</td>
          <td class="text-right">$${item.rate.toFixed(2)}</td>
          <td class="text-right">$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="cost-summary">
    <div class="cost-row">
      <span class="cost-label">Subtotal</span>
      <span class="cost-value">$${estimate.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="cost-row">
      <span class="cost-label">Tax (8.25%)</span>
      <span class="cost-value">$${estimate.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="cost-total">
      <div class="cost-row" style="border-bottom: none;">
        <span class="cost-label">Total</span>
        <span class="cost-value">$${estimate.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  </div>

  <div class="acceptance-section">
    <div class="acceptance-title">Acceptance & Signature</div>
    <p style="font-size: 14px; color: #4a5568; margin-bottom: 32px;">
      I authorize the work specified in this estimate. I understand that this is an estimate of costs 
      and the final invoice may vary based on actual materials used and labor required.
    </p>
    <div class="signature-fields">
      <div class="signature-field">
        <div class="signature-line"></div>
        <div class="signature-label">Client Signature</div>
      </div>
      <div class="signature-field">
        <div class="signature-line"></div>
        <div class="signature-label">Date</div>
      </div>
    </div>
    <div class="signature-fields" style="margin-top: 32px;">
      <div class="signature-field">
        <div class="signature-line"></div>
        <div class="signature-label">Printed Name</div>
      </div>
    </div>
  </div>

  <div class="footer">
    Thank you for your business! | ${companyName} | ${companyPhone}
  </div>
</body>
</html>
`;

  return htmlContent;
}

export async function downloadEstimatePDF(
  estimate: Estimate,
  options: PDFEstimateOptions
): Promise<void> {
  const htmlContent = generateEstimatePDF(estimate, options);
  
  console.log("[PDF] Generated estimate PDF for:", estimate.id);
  console.log("[PDF] HTML length:", htmlContent.length);
  
  if (typeof window !== "undefined" && window.open) {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }
}
