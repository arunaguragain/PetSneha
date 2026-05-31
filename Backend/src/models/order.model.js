const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    area: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 100 },
    total: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    deliveryAddress: deliveryAddressSchema,
    status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
    orderNumber: { type: String, unique: true },
    confirmationEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function generateOrderNumber(next) {
  if (!this.orderNumber) {
    this.orderNumber = `PSH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  next();
});

module.exports = mongoose.model('Order', orderSchema);