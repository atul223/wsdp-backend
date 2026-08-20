/* eslint-disable no-unused-vars */
/**
 * payment-tracking.controller.js
 *
 * Mirrors the structure of your existing amendment/bank-guarantee
 * controllers (module-scoped, prisma-direct, soft delete via deletedAt).
 *
 * IMPORTANT: Adjust the require path below ('../../config/db') if your
 * Prisma client is exported from a different location. Per your
 * backend-architecture.md, prisma is initialized in src/config/db.js.
 */

const prisma = require('../../config/db');

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

    const items = await prisma.paymentTrackingItem.findMany({
      where: { projectId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

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
