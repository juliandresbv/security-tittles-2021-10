const { app } = require('./app');
const dotenv = require('dotenv'); dotenv.config();

const port = process.env.PORT || 5110;

(async function run() {
  console.log(`Running ledger-distributed-api in port ${port}...`);
  await app.listen(port);
})();