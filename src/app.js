const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const env = require('./config/env');
const logger = require('./common/utils/logger');
const authRoutes = require('./modules/auth/auth.routes');
const dashboardRoutes = require('./modules/construction-progress/dashboard.routes');
const workPackageRoutes = require('./modules/construction-progress/workPackage.routes');
const progressEntryRoutes = require('./modules/construction-progress/progressEntry.routes');
const ehsIncidentRoutes = require('./modules/ehs/ehsIncident.routes');
const ehsInspectionRoutes = require('./modules/ehs/ehsInspection.routes');
const riskRoutes = require('./modules/risk-delay/risk.routes');
const delayRoutes = require('./modules/risk-delay/delay.routes');
const resourceRoutes = require('./modules/resource-dashboard/resource.routes');
const allocationRoutes = require('./modules/resource-dashboard/allocation.routes');
const budgetRoutes = require('./modules/financial-dashboard/budget.routes');
const invoiceRoutes = require('./modules/financial-dashboard/invoice.routes');
const financialSummaryRoutes = require('./modules/financial-dashboard/financial-summary.routes');
const reportRoutes = require('./modules/reports/report.routes');
const { mountSwagger } = require('./config/swagger');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/error.middleware');
const app = express();
// Security headers
app.use(helmet());
// CORS — restricted to the configured frontend origin, credentials
// enabled since the refresh token travels as an httpOnly cookie.
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
// HTTP access logging piped through Winston
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/construction-progress',dashboardRoutes);
app.use('/api/v1', workPackageRoutes);
app.use('/api/v1', progressEntryRoutes);
app.use('/api/v1', ehsIncidentRoutes);
app.use('/api/v1', ehsInspectionRoutes);
app.use('/api/v1', riskRoutes);
app.use('/api/v1', delayRoutes);
app.use('/api/v1', resourceRoutes);
app.use('/api/v1', allocationRoutes);
app.use('/api/v1', budgetRoutes);
app.use('/api/v1', invoiceRoutes);
app.use('/api/v1', financialSummaryRoutes);
app.use('/api/v1', reportRoutes);
// Interactive API docs (Swagger UI) at /api-docs, combining every
// module's *.openapi.yaml file under src/docs
mountSwagger(app);
// 404 + centralized error handling (must be registered last)
app.use(notFoundMiddleware);
app.use(errorMiddleware);
module.exports = app;