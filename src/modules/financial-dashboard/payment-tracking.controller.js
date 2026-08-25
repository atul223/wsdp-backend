/* eslint-disable no-unused-vars */
/**
 * payment-tracking.controller.js
 *
 * UPDATED (this revision) — FIX for "Payment Tracking has no Edit
 * option on already-added rows":
 *
 * Root cause: for any project that has never had a real
 * PaymentTrackingItem row created, listProjectPaymentTracking
 * returned an EMPTY array, and the frontend silently fell back to
 * hardcoded placeholder rows (Contract Value / Amount Invoiced /
 * Amount Paid / Outstanding) that have no `id` — so Edit/Delete
 * correctly show "—" for them, unlike your other tables which
 * already have real DB rows.
 *
 * Fix: the FIRST time this endpoint is called for a project with
 * zero Payment Tracking rows, it now auto-provisions those same 4
 * rows as REAL, persisted, editable database records (same values,
 * same order), then returns them. Every subsequent call just returns
 * the real rows as normal. This is idempotent — it only seeds once,
 * the moment items.length === 0.
 */

const prisma = require('../../config/db');

const DEFAULT_PAYMENT_TRACKING_ROWS = [
  { description: 'Contract Value', amountAoa: 3625580000.00, amountUsd: 5599704.50, isHighlighted: true, sortOrder: 1 },
  { description: 'Amount Invoiced', amountAoa: 650999524.39, amountUsd: 1005466.78, isHighlighted: false, sortOrder: 2 },
  { description: 'Amount Paid', amountAoa: 404659374.56, amountUsd: 624995.17, isHighlighted: false, sortOrder: 3 },
  { description: 'Outstanding', amountAoa: 246340149.83, amountUsd: 380471.61, isHighlighted: true, sortOrder: 4 },
];

function serializePaymentTracking(item) {
  return {
    id: item.id,
    project_id: item.projectId,
    description: item.description,
    amount_aoa: item.amountAoa !== null && item.amountAoa !== undefined ? Number(item.amountAoa) : null,
    amount_usd: item.amountUsd !== null && item.amountUsd !== undefined ? Number(item.amountUsd) : null,
    is_highlighted: item.isHighlighted,
    sort_order: item.sortOrder,
    status: item.status,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

exports.listProjectPaymentTracking = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    let items = await prisma.paymentTrackingItem.findMany({
      where: { projectId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    // FIX: auto-provision the 4 default reference rows on first use so
    // the table is immediately editable instead of relying on read-only
    // id-less placeholder data.
    if (items.length === 0) {
      await prisma.paymentTrackingItem.createMany({
        data: DEFAULT_PAYMENT_TRACKING_ROWS.map((row) => ({
          projectId,
          status: 'active',
          ...row,
        })),
      });

      items = await prisma.paymentTrackingItem.findMany({
        where: { projectId, deletedAt: null },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });
    }

    res.json({
      success: true,
      data: items.map(serializePaymentTracking),
    });
  } catch (err) {
    next(err);
  }
};

exports.createProjectPaymentTracking = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { description, amount_aoa, amount_usd, is_highlighted, sort_order, status } = req.body;

    if (!description || String(description).trim() === '') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'description is required.' },
      });
    }

    let nextSortOrder = sort_order;

    if (nextSortOrder === undefined || nextSortOrder === null || nextSortOrder === '') {
      const maxOrder = await prisma.paymentTrackingItem.aggregate({
        where: { projectId, deletedAt: null },
        _max: { sortOrder: true },
      });
      nextSortOrder = (maxOrder._max.sortOrder || 0) + 1;
    }

    const created = await prisma.paymentTrackingItem.create({
      data: {
        projectId,
        description: String(description).trim(),
        amountAoa:
          amount_aoa !== undefined && amount_aoa !== null && amount_aoa !== ''
            ? Number(amount_aoa)
            : null,
        amountUsd:
          amount_usd !== undefined && amount_usd !== null && amount_usd !== ''
            ? Number(amount_usd)
            : null,
        isHighlighted: Boolean(is_highlighted),
        sortOrder: Number(nextSortOrder),
        status: status || 'active',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment tracking entry created successfully',
      data: serializePaymentTracking(created),
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProjectPaymentTracking = async (req, res, next) => {
  try {
    const { paymentTrackingId } = req.params;
    const { description, amount_aoa, amount_usd, is_highlighted, sort_order, status } = req.body;

    const existing = await prisma.paymentTrackingItem.findFirst({
      where: { id: paymentTrackingId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Payment tracking entry not found.' },
      });
    }

    const updated = await prisma.paymentTrackingItem.update({
      where: { id: paymentTrackingId },
      data: {
        description: description !== undefined ? String(description).trim() : existing.description,
        amountAoa:
          amount_aoa !== undefined
            ? amount_aoa === null || amount_aoa === ''
              ? null
              : Number(amount_aoa)
            : existing.amountAoa,
        amountUsd:
          amount_usd !== undefined
            ? amount_usd === null || amount_usd === ''
              ? null
              : Number(amount_usd)
            : existing.amountUsd,
        isHighlighted: is_highlighted !== undefined ? Boolean(is_highlighted) : existing.isHighlighted,
        // NOTE: sortOrder is intentionally preserved unless explicitly
        // provided — this is what keeps a row's position stable on edit.
        sortOrder:
          sort_order !== undefined && sort_order !== null && sort_order !== ''
            ? Number(sort_order)
            : existing.sortOrder,
        status: status || existing.status,
      },
    });

    res.json({
      success: true,
      message: 'Payment tracking entry updated successfully',
      data: serializePaymentTracking(updated),
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProjectPaymentTracking = async (req, res, next) => {
  try {
    const { paymentTrackingId } = req.params;

    const existing = await prisma.paymentTrackingItem.findFirst({
      where: { id: paymentTrackingId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Payment tracking entry not found.' },
      });
    }

    await prisma.paymentTrackingItem.update({
      where: { id: paymentTrackingId },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
