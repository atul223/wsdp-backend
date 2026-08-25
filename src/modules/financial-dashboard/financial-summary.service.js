const prisma = require('../../config/db');
const cardService = require('./financial-summary-card.service');

function decimalToNumber(value) {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function round(value, decimals = 2) {
  const n = Number(value || 0);
  return Number(n.toFixed(decimals));
}

/**
 * getProjectFinancialSummary
 *
 * FIXED in this revision (see inline comments marked "FIX:"):
 *  1. reference_cards previously only returned a mistyped
 *     prov_sum_50_m_aoa/usd key and never returned total_contract,
 *     advance_payment_20, or contract_balance at all — so the frontend
 *     silently fell back to hardcoded constants for 3 of the 4 reference
 *     cards, and quietly used the wrong key for the 4th. All 4 (8 values)
 *     are now returned with the CORRECT key names the frontend expects.
 *  2. cumulative_expenditure and ipc_status/ipc_status_note are now
 *     returned at the top level so the frontend can stop hardcoding them
 *     (previously renderSummary() ignored the backend entirely for these
 *     two cards).
 *  3. Every one of the 8 summary cards can now be manually overridden via
 *     the new FinancialSummaryCard table (full CRUD, see
 *     financial-summary-card.routes.js) — if no override exists yet, the
 *     same defaults you've always seen are used, so nothing regresses.
 *  4. financial_progress_pct still computes from Budget/Invoice data by
 *     default (so it stays "live" once you start using Budgets), but can
 *     now be manually overridden if your Budget data isn't populated yet
 *     (this is why it was showing 0.00% before).
 */
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

  const cumulativeExpenditureComputed = approvedOrPaidInvoices.reduce((sum, invoice) => {
    return sum + decimalToNumber(invoice.amount);
  }, 0);

  const financialProgressPctComputed = totalBudget
    ? round((cumulativeExpenditureComputed / totalBudget) * 100, 1)
    : 0;

  const remainingBudgetPct = totalBudget
    ? round(100 - financialProgressPctComputed, 1)
    : 0;

  const latestIpc = ipcs.length ? ipcs[ipcs.length - 1] : null;

  // FIX: merge manual overrides for all 8 summary/reference cards.
  const cards = await cardService.getMergedCardsMap(projectId);

  // FIX: financial_progress_pct uses the manual override if one has been
  // set (useful until Budget/Invoice data is fully populated); otherwise
  // falls back to the live computed value from Budget/Invoice records.
  const financialProgressPct = cards.financial_progress_pct.value_primary !== null
    ? Number(cards.financial_progress_pct.value_primary)
    : financialProgressPctComputed;

  const physicalProgressPct = cards.physical_progress_pct.value_primary !== null
    ? Number(cards.physical_progress_pct.value_primary)
    : 19.36;

  return {
    financial_progress_pct: financialProgressPct,
    physical_progress_pct: physicalProgressPct,
    remaining_budget_pct: remainingBudgetPct,

    // FIX: cumulative_expenditure now exposed at top level (was previously
    // hardcoded on the frontend, ignoring this value entirely).
    cumulative_expenditure_m_aoa: cards.cumulative_expenditure.value_primary,
    cumulative_expenditure_m_usd: cards.cumulative_expenditure.value_secondary,
    cumulative_expenditure_note: cards.cumulative_expenditure.note_text,

    total_budget: totalBudget,
    latest_ipc_no: latestIpc ? latestIpc.ipc : null,
    latest_ipc_status: latestIpc ? latestIpc.status : null,

    // FIX: ipc_status now exposed at top level (was previously hardcoded
    // on the frontend, ignoring this value entirely).
    ipc_status_value: cards.ipc_status.value_text,
    ipc_status_subtext: cards.ipc_status.sub_text,
    ipc_status_note: cards.ipc_status.note_text,

    // FIX: reference_cards now returns ALL 4 cards (8 values) with the
    // CORRECT key names the frontend expects (prov_sum_15_*, not
    // prov_sum_50_*), sourced from the override table with safe defaults.
    reference_cards: {
      total_contract_m_aoa: cards.total_contract.value_primary,
      total_contract_m_usd: cards.total_contract.value_secondary,
      advance_payment_20_m_aoa: cards.advance_payment_20.value_primary,
      advance_payment_20_m_usd: cards.advance_payment_20.value_secondary,
      contract_balance_m_aoa: cards.contract_balance.value_primary,
      contract_balance_m_usd: cards.contract_balance.value_secondary,
      prov_sum_15_m_aoa: cards.prov_sum_15.value_primary,
      prov_sum_15_m_usd: cards.prov_sum_15.value_secondary,
    },

    // Raw per-card override metadata, so the frontend can show an
    // "edited" indicator and know whether Reset-to-default is meaningful.
    summary_cards: cards,

    cash_flow: [
      {
        month: 'Jul-25',
        planned_aoa: 190564875,
        actual_aoa: 0,
        planned_usd: 294326.87,
        actual_usd: 0,
      },
      {
        month: 'Aug-25',
        planned_aoa: 520207699,
        actual_aoa: 0,
        planned_usd: 803459.21,
        actual_usd: 0,
      },
      {
        month: 'Sep-25',
        planned_aoa: 634474730,
        actual_aoa: 0,
        planned_usd: 979944.29,
        actual_usd: 0,
      },
      {
        month: 'Oct-25',
        planned_aoa: 996854897,
        actual_aoa: 0,
        planned_usd: 1539639.36,
        actual_usd: 0,
      },
      {
        month: 'Nov-25',
        planned_aoa: 1303737674,
        actual_aoa: 0,
        planned_usd: 2013618.87,
        actual_usd: 0,
      },
      {
        month: 'Dec-25',
        planned_aoa: 1471077741,
        actual_aoa: 0,
        planned_usd: 2272075.09,
        actual_usd: 0,
      },
      {
        month: 'Jan-26',
        planned_aoa: 1735527031,
        actual_aoa: 0,
        planned_usd: 2680516.22,
        actual_usd: 0,
      },
      {
        month: 'Feb-26',
        planned_aoa: 1989719500,
        actual_aoa: 404659374.56,
        planned_usd: 3073115.71,
        actual_usd: 624995.17,
      },
      {
        month: 'Mar-26',
        planned_aoa: 2172459717,
        actual_aoa: 0,
        planned_usd: 3355357.42,
        actual_usd: 0,
      },
      {
        month: 'Apr-26',
        planned_aoa: 2386592468,
        actual_aoa: 246340149.83,
        planned_usd: 3686084.81,
        actual_usd: 380471.61,
      },
      {
        month: 'May-26',
        planned_aoa: 2603568555,
        actual_aoa: 0,
        planned_usd: 4021203.71,
        actual_usd: 0,
      },
      {
        month: 'Jun-26',
        planned_aoa: 2840961686,
        actual_aoa: 0,
        planned_usd: 4387856.68,
        actual_usd: 0,
      },
      {
        month: 'Jul-26',
        planned_aoa: 3009788627,
        actual_aoa: 0,
        planned_usd: 4648609.38,
        actual_usd: 0,
      },
      {
        month: 'Aug-26',
        planned_aoa: 3145635027,
        actual_aoa: 0,
        planned_usd: 4858423.73,
        actual_usd: 0,
      },
      {
        month: 'Sep-26',
        planned_aoa: 3310810621,
        actual_aoa: 0,
        planned_usd: 5113536.93,
        actual_usd: 0,
      },
      {
        month: 'Oct-26',
        planned_aoa: 3589866845,
        actual_aoa: 0,
        planned_usd: 5544538.42,
        actual_usd: 0,
      },
      {
        month: 'Nov-26',
        planned_aoa: 3845037672,
        actual_aoa: 0,
        planned_usd: 5938648.99,
        actual_usd: 0,
      },
      {
        month: 'Dec-26',
        planned_aoa: 3884384440,
        actual_aoa: 0,
        planned_usd: null,
        actual_usd: null,
      },
      {
        month: 'Jan-27',
        planned_aoa: 3913725148,
        actual_aoa: 0,
        planned_usd: null,
        actual_usd: null,
      },
    ],

    financial_vs_physical: [
      { month: 'Jul-25', planned_physical: 1.47, planned_financial: 4.87, actual_physical: 0, actual_financial: null },
      { month: 'Aug-25', planned_physical: 3.30, planned_financial: 13.29, actual_physical: 0, actual_financial: null },
      { month: 'Sep-25', planned_physical: 5.06, planned_financial: 16.21, actual_physical: 0, actual_financial: null },
      { month: 'Oct-25', planned_physical: 6.70, planned_financial: 25.47, actual_physical: 0, actual_financial: null },
      { month: 'Nov-25', planned_physical: 11.52, planned_financial: 33.31, actual_physical: 0, actual_financial: null },
      { month: 'Dec-25', planned_physical: 20.19, planned_financial: 37.59, actual_physical: 0, actual_financial: null },
      { month: 'Jan-26', planned_physical: 27.88, planned_financial: 44.34, actual_physical: 1.61, actual_financial: null },
      { month: 'Feb-26', planned_physical: 37.20, planned_financial: 50.84, actual_physical: 4.74, actual_financial: 11.16, remarks: 'IPC-01' },
      { month: 'Mar-26', planned_physical: 47.73, planned_financial: 55.51, actual_physical: 7.76, actual_financial: null },
      { month: 'Apr-26', planned_physical: 57.12, planned_financial: 60.98, actual_physical: 13.34, actual_financial: 6.79, remarks: 'IPC-02' },
      { month: 'May-26', planned_physical: 67.77, planned_financial: 66.52, actual_physical: 17.00, actual_financial: null },
      { month: 'Jun-26', planned_physical: 74.84, planned_financial: 72.59, actual_physical: 18.84, actual_financial: null },
      { month: 'Jul-26', planned_physical: 79.98, planned_financial: 76.90, actual_physical: 19.36, actual_financial: null },
      { month: 'Aug-26', planned_physical: 85.12, planned_financial: 80.37, actual_physical: null, actual_financial: null },
      { month: 'Sep-26', planned_physical: 91.51, planned_financial: 84.59, actual_physical: null, actual_financial: null },
      { month: 'Oct-26', planned_physical: 99.49, planned_financial: 91.73, actual_physical: null, actual_financial: null },
      { month: 'Nov-26', planned_physical: 100.00, planned_financial: 98.24, actual_physical: null, actual_financial: null },
      { month: 'Dec-26', planned_physical: 100.00, planned_financial: 99.25, actual_physical: null, actual_financial: null },
      { month: 'Jan-27', planned_physical: 100.00, planned_financial: 100.00, actual_physical: null, actual_financial: null },
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
