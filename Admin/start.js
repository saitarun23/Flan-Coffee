const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/logger');

const PORT = config.port;
app.listen(PORT, () => {
  logger.info('Server listening on http://localhost:%d', PORT);
});
