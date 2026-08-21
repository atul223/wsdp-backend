const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const logger = require('./common/utils/logger');

const projectRoutes = require('./modules/project/project.routes');
const authRoutes = require('./modules/auth/auth.routes');

const dashboardRoutes = require('./modules/construction-progress/dashboard.routes');
const workPackageRoutes = require('./modules/construction-progress/workPackage.routes');
const progressEntryRoutes = require('./modules/construction-progress/progressEntry.routes');

const ehsIncidentRoutes = require('./modules/ehs/ehsIncident.routes');
const ehsInspectionRoutes = require('./modules/ehs/ehsInspection.routes');
const ehsComplianceRoutes = require('./modules/ehs/ehsCompliance.routes');
const ehsIncidentSummaryRoutes = require('./modules/ehs/ehsIncidentSummary.routes');
const ehsNonConformitySummaryRoutes = require('./modules/ehs/ehsNonConformitySummary.routes');
const ehsResourceConsumptionRoutes = require('./modules/ehs/ehsResourceConsumption.routes');
const ehsExportRoutes = require('./modules/ehs/ehsExport.routes');
const ehsImportRoutes = require('./modules/ehs/ehsImport.routes');

const riskRoutes = require('./modules/risk-delay/risk.routes');
const delayRoutes = require('./modules/risk-delay/delay.routes');
const ncrRoutes = require('./modules/risk-delay/ncr.routes');
const correctiveActionRoutes = require('./modules/risk-delay/correctiveAction.routes');
const riskDelaySummaryRoutes = require('./modules/risk-delay/riskDelaySummary.routes');

const resourceRoutes = require('./modules/resource-dashboard/resource.routes');
const allocationRoutes = require('./modules/resource-dashboard/allocation.routes');
const hdpePipeStockRoutes = require('./modules/resource-dashboard/hdpePipeStock.routes');
const equipmentDeploymentRoutes = require('./modules/resource-dashboard/equipmentDeployment.routes');
const workforceEmployerRoutes = require('./modules/resource-dashboard/workforceEmployer.routes');

const budgetRoutes = require('./modules/financial-dashboard/budget.routes');
const paymentTrackingRoutes = require('./modules/financial-dashboard/payment-tracking.routes');
const invoiceRoutes = require('./modules/financial-dashboard/invoice.routes');
const financialSummaryRoutes = require('./modules/financial-dashboard/financial-summary.routes');
const ipcTrackerRoutes = require('./modules/financial-dashboard/ipc-tracker.routes');
const bankGuaranteeRoutes = require('./modules/financial-dashboard/bank-guarantee.routes');
const amendmentRoutes = require('./modules/financial-dashboard/amendment.routes');

const reportRoutes = require('./modules/reports/report.routes');

const { mountSwagger } = require('./config/swagger');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());

app.use(cors({
  origin: [
    'https://wsdp-frontend.atul-00f.workers.dev'
  ],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/v1', projectRoutes);
app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/construction-progress', dashboardRoutes);
app.use('/api/v1/construction-progress', workPackageRoutes);
app.use('/api/v1/construction-progress', progressEntryRoutes);

app.use('/api/v1/ehs', ehsIncidentRoutes);
app.use('/api/v1/ehs', ehsInspectionRoutes);
app.use('/api/v1/ehs', ehsComplianceRoutes);
app.use('/api/v1/ehs', ehsIncidentSummaryRoutes);
app.use('/api/v1/ehs', ehsNonConformitySummaryRoutes);
app.use('/api/v1/ehs', ehsResourceConsumptionRoutes);
app.use('/api/v1/ehs', ehsExportRoutes);
app.use('/api/v1/ehs', ehsImportRoutes);

app.use('/api/v1', riskRoutes);
app.use('/api/v1', delayRoutes);
app.use('/api/v1', ncrRoutes);
app.use('/api/v1', correctiveActionRoutes);
app.use('/api/v1', riskDelaySummaryRoutes);

app.use('/api/v1', resourceRoutes);
app.use('/api/v1', allocationRoutes);
app.use('/api/v1', hdpePipeStockRoutes);
app.use('/api/v1', equipmentDeploymentRoutes);
app.use('/api/v1', workforceEmployerRoutes);

app.use('/api/v1', budgetRoutes);
app.use('/api/v1', paymentTrackingRoutes);
app.use('/api/v1', invoiceRoutes);
app.use('/api/v1', financialSummaryRoutes);
app.use('/api/v1', ipcTrackerRoutes);
app.use('/api/v1', bankGuaranteeRoutes);
app.use('/api/v1', amendmentRoutes);

app.use('/api/v1', reportRoutes);

mountSwagger(app);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
