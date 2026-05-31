const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const vetRoutes = require('./routes/vet.routes');
const petRoutes = require('./routes/pet.routes');
const healthRecordRoutes = require('./routes/healthRecord.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const reminderRoutes = require('./routes/reminder.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require('./routes/product.routes');
const articleRoutes = require('./routes/article.routes');
const forumPostRoutes = require('./routes/forumPost.routes');
const vetDashboardRoutes = require('./routes/vetDashboard.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vets', vetRoutes);
app.use('/api/pets', petRoutes);
app.use('/api', healthRecordRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', reminderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/forum', forumPostRoutes);
app.use('/api/vet', vetDashboardRoutes);
app.use('/api/admin', adminRoutes);

app.all('*', (req, res) => {
  res.status(404).json({ status: 'fail', message: 'Route not found.' });
});

app.use(errorHandler);

module.exports = app;