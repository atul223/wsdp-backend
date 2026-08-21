const service = require('./ehsIncidentSummary.service');
const { createSummaryItemController } = require('./ehsSummaryItem.controllerFactory');

module.exports = createSummaryItemController(service, 'Incident summary item');
