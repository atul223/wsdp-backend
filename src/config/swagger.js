const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

/**
 * Loads every *.openapi.yaml file in src/docs and merges their `paths`
 * and `components.schemas` into one combined spec, so each module can
 * own its own YAML file (construction-progress.openapi.yaml today;
 * financial.openapi.yaml, ehs.openapi.yaml, etc. as those modules land)
 * without fighting over a single giant document.
 */
function loadCombinedSpec() {
  const docsDir = path.join(__dirname, '../docs');
  const files = fs.existsSync(docsDir)
    ? fs.readdirSync(docsDir).filter((f) => f.endsWith('.openapi.yaml'))
    : [];

  const combined = {
    openapi: '3.0.3',
    info: {
      title: 'Water Supply Construction Monitoring Dashboard API',
      version: '1.0.0',
      description: 'Combined API documentation across all implemented modules.',
    },
    servers: [{ url: '/api/v1' }],
    paths: {},
    components: { schemas: {}, responses: {}, securitySchemes: {} },
  };

  for (const file of files) {
    const doc = YAML.parse(fs.readFileSync(path.join(docsDir, file), 'utf8'));
    Object.assign(combined.paths, doc.paths || {});
    if (doc.components) {
      Object.assign(combined.components.schemas, doc.components.schemas || {});
      Object.assign(combined.components.responses, doc.components.responses || {});
      Object.assign(combined.components.securitySchemes, doc.components.securitySchemes || {});
    }
  }

  return combined;
}

function mountSwagger(app) {
  const spec = loadCombinedSpec();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = { mountSwagger, loadCombinedSpec };
