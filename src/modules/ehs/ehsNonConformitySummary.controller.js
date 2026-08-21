const service = require('./ehsNonConformitySummary.service');
const { createSummaryItemController } = require('./ehsSummaryItem.controllerFactory');

module.exports = createSummaryItemController(service, 'Non-conformity summary item');
