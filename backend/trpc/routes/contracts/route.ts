import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import {
  getContractTemplate,
  getTradeSpecificClauses,
  getRiskClauses,
  CHANGE_ORDER_TEMPLATE,
  COMPLETION_CERTIFICATE_TEMPLATE,
  WARRANTY_CERTIFICATE_TEMPLATE,
  MATERIAL_APPROVAL_TEMPLATE,
  SUBCONTRACTOR_AGREEMENT_TEMPLATE,
  LIEN_WAIVER_CONDITIONAL_TEMPLATE,
  LIEN_WAIVER_UNCONDITIONAL_TEMPLATE,
} from '../../../../constants/contract-templates';
import type {
  Contract,
  ContractVariables,
  ContractType,
} from '@/types';

function replaceVariables(template: string, variables: ContractVariables): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  });
  return result;
}

function generatePaymentScheduleTable(payments: { description: string; amount: number; percent: number }[]): string {
  let table = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;"><tbody>';
  payments.forEach((payment, index) => {
    table += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}) ${payment.description}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${payment.amount.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${payment.percent}%</td>
      </tr>
    `;
  });
  table += '</tbody></table>';
  return table;
}

function generatePublicToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const listContractsRoute = publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'SIGNED', 'DECLINED', 'CANCELLED']).optional(),
        type: z.enum(['MSA', 'PROJECT_CONTRACT', 'WORK_ORDER']).optional(),
      })
    )
    .query(async ({ input }) => {
      console.log('[Contracts] Listing contracts for company:', input.companyId);
      
      const mockContracts: Contract[] = [
        {
          id: '1',
          companyId: input.companyId,
          clientId: 'client1',
          type: 'PROJECT_CONTRACT',
          title: 'Smith Roof Replacement',
          bodyHtml: '<p>Contract content...</p>',
          status: 'SIGNED',
          totalAmount: 15000,
          startDateEstimated: '2024-01-15',
          endDateEstimated: '2024-02-15',
          createdByUserId: 'user1',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-05T14:30:00Z',
          signedAt: '2024-01-05T14:30:00Z',
        },
      ];

      return mockContracts;
    });

export const generateContractRoute = publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        clientId: z.string(),
        projectId: z.string().optional(),
        type: z.enum(['MSA', 'PROJECT_CONTRACT', 'WORK_ORDER']),
        variables: z.object({
          company_name: z.string().optional(),
          company_phone: z.string().optional(),
          company_email: z.string().optional(),
          company_license: z.string().optional(),
          client_name: z.string().optional(),
          client_property_address: z.string().optional(),
          project_name: z.string().optional(),
          project_address: z.string().optional(),
          project_start_date: z.string().optional(),
          project_end_date: z.string().optional(),
          contract_total_amount: z.string().optional(),
          scope_of_work: z.string().optional(),
          warranty_years: z.string().optional(),
          warranty_days: z.string().optional(),
          work_order_number: z.string().optional(),
          work_description: z.string().optional(),
          work_order_total_amount: z.string().optional(),
        }),
        paymentSchedule: z
          .array(
            z.object({
              description: z.string(),
              amount: z.number(),
              percent: z.number(),
            })
          )
          .optional(),
        tradeType: z.string().optional(),
        projectAmount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('[Contracts] Generating contract:', input.type);

      const template = getContractTemplate(input.type as ContractType);
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const allVariables: ContractVariables = {
        ...input.variables,
        current_date: currentDate,
        payment_schedule_table: input.paymentSchedule
          ? generatePaymentScheduleTable(input.paymentSchedule)
          : '',
        trade_specific_clauses: input.tradeType
          ? getTradeSpecificClauses(input.tradeType as any)
          : '',
        risk_clauses: input.projectAmount ? getRiskClauses(input.projectAmount) : '',
        project_duration_text: input.variables.project_start_date && input.variables.project_end_date
          ? calculateDuration(input.variables.project_start_date, input.variables.project_end_date)
          : '',
      };

      const bodyHtml = replaceVariables(template, allVariables);

      const contract: Contract = {
        id: 'new_' + Date.now(),
        companyId: input.companyId,
        projectId: input.projectId,
        clientId: input.clientId,
        type: input.type as ContractType,
        title: input.variables.project_name || `${input.type} Contract`,
        bodyHtml,
        status: 'DRAFT',
        totalAmount: parseFloat(input.variables.contract_total_amount || input.variables.work_order_total_amount || '0'),
        startDateEstimated: input.variables.project_start_date,
        endDateEstimated: input.variables.project_end_date,
        createdByUserId: 'current_user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('[Contracts] Generated contract:', contract.id);
      return contract;
    });

export const sendContractForSigningRoute = publicProcedure
    .input(
      z.object({
        contractId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('[Contracts] Sending contract for signing:', input.contractId);

      const publicToken = generatePublicToken();

      return {
        success: true,
        publicToken,
        signingUrl: `/sign-contract/${publicToken}`,
      };
    });

export const getContractByTokenRoute = publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      console.log('[Contracts] Getting contract by token:', input.token);

      const mockContract: Contract = {
        id: '1',
        companyId: 'company1',
        clientId: 'client1',
        type: 'PROJECT_CONTRACT',
        title: 'Smith Roof Replacement',
        bodyHtml: '<h2>Project Contract</h2><p>Full contract details here...</p>',
        status: 'SENT',
        totalAmount: 15000,
        publicSigningToken: input.token,
        createdByUserId: 'user1',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-05T14:30:00Z',
      };

      return mockContract;
    });

export const signContractRoute = publicProcedure
    .input(
      z.object({
        token: z.string(),
        signedByName: z.string(),
        signedByEmail: z.string(),
        signatureType: z.enum(['typed', 'drawn', 'uploaded']),
        signatureData: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('[Contracts] Signing contract with token:', input.token);

      return {
        success: true,
        contractId: '1',
        signedAt: new Date().toISOString(),
      };
    });

export const createChangeOrderRoute = publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        contractId: z.string(),
        description: z.string(),
        reason: z.enum(['HIDDEN_CONDITION', 'CLIENT_REQUEST', 'MATERIAL_CHANGE', 'INSPECTION', 'OTHER']),
        additionalLaborAmount: z.number(),
        additionalMaterialAmount: z.number(),
        newEndDate: z.string().optional(),
        variables: z.object({
          project_name: z.string().optional(),
          contract_total_amount: z.string().optional(),
          change_order_description: z.string().optional(),
          labor_amount: z.string().optional(),
          material_amount: z.string().optional(),
          change_order_total: z.string().optional(),
          revised_contract_amount: z.string().optional(),
          revised_end_date: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      console.log('[Contracts] Creating change order for project:', input.projectId);

      const bodyHtml = replaceVariables(CHANGE_ORDER_TEMPLATE, input.variables);

      const changeOrder = {
        id: 'co_' + Date.now(),
        companyId: input.companyId,
        projectId: input.projectId,
        contractId: input.contractId,
        description: input.description,
        reason: input.reason,
        additionalLaborAmount: input.additionalLaborAmount,
        additionalMaterialAmount: input.additionalMaterialAmount,
        totalChangeAmount: input.additionalLaborAmount + input.additionalMaterialAmount,
        revisedContractAmount: parseFloat(input.variables.revised_contract_amount || '0'),
        newEndDate: input.newEndDate,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        bodyHtml,
      };

      return changeOrder;
    });

export const createCompletionCertificateRoute = publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        clientId: z.string(),
        contractId: z.string().optional(),
        completionDate: z.string(),
        finalAmountDue: z.number(),
        notes: z.string().optional(),
        variables: z.object({
          project_name: z.string().optional(),
          client_property_address: z.string().optional(),
          completion_date: z.string().optional(),
          final_balance_due: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      console.log('[Contracts] Creating completion certificate for project:', input.projectId);

      const bodyHtml = replaceVariables(COMPLETION_CERTIFICATE_TEMPLATE, input.variables);

      const certificate = {
        id: 'cert_' + Date.now(),
        companyId: input.companyId,
        projectId: input.projectId,
        clientId: input.clientId,
        contractId: input.contractId,
        completionDate: input.completionDate,
        finalAmountDue: input.finalAmountDue,
        notes: input.notes,
        status: 'DRAFT',
        bodyHtml,
        publicSigningToken: generatePublicToken(),
        createdAt: new Date().toISOString(),
      };

      return certificate;
    });

export const createWarrantyRoute = publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        projectId: z.string(),
        clientId: z.string(),
        workmanshipYears: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        notes: z.string().optional(),
        variables: z.object({
          project_name: z.string().optional(),
          company_name: z.string().optional(),
          client_name: z.string().optional(),
          client_property_address: z.string().optional(),
          warranty_years: z.string().optional(),
          completion_date: z.string().optional(),
          warranty_end_date: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      console.log('[Contracts] Creating warranty for project:', input.projectId);

      const bodyHtml = replaceVariables(WARRANTY_CERTIFICATE_TEMPLATE, input.variables);

      const warranty = {
        id: 'warranty_' + Date.now(),
        companyId: input.companyId,
        projectId: input.projectId,
        clientId: input.clientId,
        workmanshipYears: input.workmanshipYears,
        startDate: input.startDate,
        endDate: input.endDate,
        notes: input.notes,
        status: 'ACTIVE',
        bodyHtml,
        createdAt: new Date().toISOString(),
      };

      return warranty;
    });

function calculateDuration(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.round(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.round(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  } catch {
    return '';
  }
}
