const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');

const ACTIVE_INVOICE_STATUSES = ['pending', 'approved', 'paid'];

function toNumber(value) {
  return Number(value || 0);
}

function round(value, decimals = 2) {
  return Number(Number(value || 0).toFixed(decimals));
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1, 1);

  return date.toLocaleString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

function amountToCr(value) {
  return round(toNumber(value) / 10000000, 2);
}

function getLastSixMonthsKeys() {
  const now = new Date();
  const keys = [];

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return keys;
}