const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { port, frontendOrigin } = require('./config/env');
const { sequelize } = require('./models');
const routes = require('./routes');
const erros = require('./middlewares/erros');
const openapi = require('../openapi.json');

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: frontendOrigin }));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use(routes);
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.', codigo: 'ROTA_NAO_ENCONTRADA' }));
app.use(erros);

sequelize.authenticate().then(() => {
  app.listen(port, () => console.log(`API em http://localhost:${port} | Swagger em /api-docs`));
}).catch(async () => {
  console.error('Não foi possível conectar ao PostgreSQL. Confira a configuração e execute npm run setup.');
  await sequelize.close();
  process.exitCode = 1;
});
