const dotenv = require('dotenv');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startCronJobs } = require('./src/utils/cronJobs');

dotenv.config();

const PORT = process.env.PORT || 5050;

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    startCronJobs();
    console.log(`PetSneha backend running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});