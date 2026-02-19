const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    testId: { type: String, required: true },
    testName: { type: String, required: true },
    labId: { type: String, required: true },
    labName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: false }, // Use mobile as primary identifier now
      mobile: { type: String, required: true },
      age: { type: String, required: true },
      city: { type: String, required: true },
      lastUsedEmail: { type: String, default: undefined }, // Store last used email separately for reference
    },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    items: {
      type: [orderItemSchema],
      validate: [(val) => val.length > 0, 'Order items cannot be empty'],
    },
    totals: {
      original: { type: Number, default: 0 },
      final: { type: Number, default: 0 },
      planCoverage: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['Received', 'Pending', 'Completed'],
      default: 'Received',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);


