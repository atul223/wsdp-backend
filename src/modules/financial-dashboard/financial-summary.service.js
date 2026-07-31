const prisma = require('../../config/db');

function decimalToNumber(value) {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function round(value, decimals = 2) {
  const n = Number(value || 0);
  return Number(n.toFixed(decimals));
}

async function getProjectFinancialSummary(projectId) {
  const budgets = await prisma.budget.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    include: {
      invoices: true,
    },
  });

  const ipcs = await prisma.ipc.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [
      { ipcDate: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const bankGuarantees = await prisma.bankGuarantee.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [
      { validUntil: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const amendments = await prisma.amendment.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [
      { amendmentDate: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const totalBudget = budgets.reduce((sum, budget) => {
    return sum + decimalToNumber(budget.allocatedAmount);
  }, 0);

  const allInvoices = budgets.flatMap((budget) => budget.invoices || []);

  const approvedOrPaidInvoices = allInvoices.filter((invoice) => {
    return ['approved', 'paid'].includes(invoice.status);
  });

  const cumulativeExpenditure = approvedOrPaidInvoices.reduce((sum, invoice) => {
    return sum + decimalToNumber(invoice.amount);
  }, 0);

  const financialProgressPct = totalBudget
    ? round((cumulativeExpenditure / totalBudget) * 100, 1)
    : 0;

  const remainingBudgetPct = totalBudget
    ? round(100 - financialProgressPct, 1)
    : 0;

  const latestIpc = ipcs.length ? ipcs[ipcs.length - 1] : null;

  return {
    financial_progress_pct: financialProgressPct,
    physical_progress_pct: 61.4,
    remaining_budget_pct: remainingBudgetPct,
    cumulative_expenditure: cumulativeExpenditure,
    total_budget: totalBudget,
    latest_ipc_no: latestIpc ? latestIpc.ipc : null,
    latest_ipc_status: latestIpc ? latestIpc.status : null,

    reference_cards: {
      total_contract_m_aoa: 3625.58,
      advance_payment_20_m_aoa: 725.12,
      contract_balance_m_aoa: 2974.59,
      daab_prov_sum_50_m_aoa: 1.94,
    },

    cash_flow: [
      { month: 'Feb', planned_cr: 14.2, actual_cr: 12.6 },
      { month: 'Mar', planned_cr: 15.8, actual_cr: 14.1 },
      { month: 'Apr', planned_cr: 16.5, actual_cr: 15.0 },
      { month: 'May', planned_cr: 17.9, actual_cr: 16.2 },
      { month: 'Jun', planned_cr: 18.4, actual_cr: 17.5 },
      { month: 'Jul', planned_cr: 19.0, actual_cr: 18.1 },
    ],

    financial_vs_physical: [
      { month: 'Feb', physical_pct: 35, financial_pct: 30 },
      { month: 'Mar', physical_pct: 40, financial_pct: 35 },
      { month: 'Apr', physical_pct: 45, financial_pct: 41 },
      { month: 'May', physical_pct: 51, financial_pct: 46 },
      { month: 'Jun', physical_pct: 57, financial_pct: 50 },
      { month: 'Jul', physical_pct: 61.4, financial_pct: 54.2 },
    ],

    ipc_tracker: ipcs.map((ipc) => ({
      id: ipc.id,
      ipc: ipc.ipc,
      period: ipc.period,
      aoa_amount: ipc.aoaAmount,
      usd_amount: ipc.usdAmount,
      percentage: ipc.percentage,
      ace_status: ipc.aceStatus,
      client_status: ipc.clientStatus,
      ipc_date: ipc.ipcDate,
      status: ipc.status,
    })),

    bank_guarantees: bankGuarantees.map((guarantee) => ({
      id: guarantee.id,
      guarantee: guarantee.guarantee,
      bank: guarantee.bank,
      usd_amount: guarantee.usdAmount,
      valid_until: guarantee.validUntil,
      status: guarantee.status,
    })),

    amendments: amendments.map((amendment) => ({
      id: amendment.id,
      amendment: amendment.amendment,
      amendment_date: amendment.amendmentDate,
      subject: amendment.subject,
      scope: amendment.scope,
      status: amendment.status,
    })),
  };
}

module.exports = {
  getProjectFinancialSummary,
};