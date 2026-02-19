const Order = require('../models/orderModel');
const {
  ensureQuotaOrThrow,
  recordSuccessfulSend,
  sendSms,
} = require('../services/messageService');
const {
  reserveChughtaiCoupon,
  markCouponAsSent,
  releaseCoupon,
  CHUGHTAI_LAB_ID,
} = require('../services/couponService');

const REQUIRED_CUSTOMER_FIELDS = ['name', 'mobile', 'age', 'city'];
const ALLOWED_STATUSES = ['Received', 'Pending', 'Completed'];

const buildConfirmationMessage = ({ order, couponNumber }) => {
  const labNames = [...new Set(order.items.map((item) => item.labName))];
  const labName = labNames.length === 1 ? labNames[0] : labNames.join(', ');

  let message = `${labName} | ZUNF Medicare: Your tests are booked.`;

  if (couponNumber) {
    message += ` Use Coupon: ${couponNumber}.`;
  }

  message += ` For help: 03090622004. Thank you for trusting ZUNF Medicare!`;

  return message;
};

const sendOrderConfirmation = async (order) => {
  const mobile = String(order.customer.mobile).trim();
  const hasChughtaiTests = order.items.some((item) => item.labId === CHUGHTAI_LAB_ID);
  let reservedCoupon = null;

  try {
    let couponNumber;

    if (hasChughtaiTests) {
      reservedCoupon = await reserveChughtaiCoupon({
        orderId: order._id,
        recipientMobile: mobile,
      });

      couponNumber = reservedCoupon?.couponNumber;
    }

    const textmessage = buildConfirmationMessage({ order, couponNumber });

    await sendSms({
      receivernum: mobile,
      sendernum: 'ZUNF',
      textmessage,
    });

    // Only record quota for Chughtai orders
    await recordSuccessfulSend(mobile, hasChughtaiTests);

    if (reservedCoupon) {
      await markCouponAsSent(reservedCoupon._id);
    }
  } catch (error) {
    if (reservedCoupon) {
      await releaseCoupon(reservedCoupon._id);
    }
    console.error('Failed to send confirmation SMS:', error);
  }
};

exports.createOrder = async (req, res) => {
  console.log("🚀 [BACKEND] ===== ORDER REQUEST RECEIVED =====");
  console.log("🚀 [BACKEND] Request method:", req.method);
  console.log("🚀 [BACKEND] Request URL:", req.url);
  console.log("🚀 [BACKEND] Request body:", JSON.stringify(req.body, null, 2));
  console.log("🚀 [BACKEND] Request headers:", JSON.stringify(req.headers, null, 2));

  try {
    const { customer, preferredDate, preferredTime, items, totals } = req.body;
    console.log("🚀 [BACKEND] Extracted data - Customer:", customer?.name, customer?.email);
    console.log("🚀 [BACKEND] Extracted data - Items count:", items?.length);

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Customer info and at least one item are required' });
    }

    const missingCustomerField = REQUIRED_CUSTOMER_FIELDS.find(
      (field) => !customer[field] || !String(customer[field]).trim()
    );

    if (missingCustomerField) {
      return res.status(400).json({ message: `Missing customer field: ${missingCustomerField}` });
    }

    // Date and time are optional - use defaults if not provided
    const finalPreferredDate = preferredDate || new Date().toISOString().split('T')[0];
    const finalPreferredTime = preferredTime || '09:00';

    // Check if order contains Chughtai tests - only enforce quota for Chughtai orders
    const hasChughtaiTests = items.some((item) => item.labId === CHUGHTAI_LAB_ID);
    await ensureQuotaOrThrow(String(customer.mobile).trim(), hasChughtaiTests);

    const orderItems = items.map((item) => ({
      testId: item.testId,
      testName: item.testName,
      labId: item.labId,
      labName: item.labName,
      quantity: item.quantity || 1,
      price: item.price || 0,
      discountedPrice: item.discountedPrice || 0,
      pinned: !!item.pinned,
    }));

    const orderTotals = {
      original: totals?.original ?? orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      final: totals?.final ?? orderItems.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0),
      planCoverage: totals?.planCoverage ?? 0,
    };

    console.log('🛒 [ORDER] Creating new order...');
    console.log('🛒 [ORDER] Customer:', customer.name, customer.email);
    console.log('🛒 [ORDER] Items count:', items.length);

    const order = await Order.create({
      customer,
      preferredDate: finalPreferredDate,
      preferredTime: finalPreferredTime,
      items: orderItems,
      totals: orderTotals,
      status: 'Pending', // Initial status set to Pending as requested
    });

    // Verify order was saved to database
    const savedOrder = await Order.findById(order._id);
    if (!savedOrder) {
      throw new Error('Order was not saved to database');
    }

    console.log('✅ [ORDER] Order created and saved successfully!');
    console.log('✅ [ORDER] Order ID:', order._id);
    console.log('✅ [ORDER] Order created at:', order.createdAt);
    console.log('✅ [ORDER] Order status:', order.status);
    console.log('✅ [ORDER] Customer mobile saved as:', order.customer.mobile);
    console.log('✅ [ORDER] Customer email:', order.customer.email);
    console.log('✅ [ORDER] Total items:', order.items.length);
    console.log('✅ [ORDER] Total amount:', order.totals.final);

    // Send SMS confirmation (existing functionality)
    sendOrderConfirmation(order).catch((error) => {
      console.error('❌ [ORDER] Confirmation SMS scheduling error:', error);
    });

    // TODO: Email functionality - Implement email service when needed
    // sendOrderConfirmationEmail(order)
    // sendOrderNotificationEmail(order)

    console.log('✅ [ORDER] Order processing completed');
    return res.status(201).json(order);
  } catch (error) {
    if (error.code === 'SMS_QUOTA_EXCEEDED') {
      return res.status(error.statusCode || 429).json({ message: error.message });
    }

    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { mobile } = req.query;
    let query = {};

    // If mobile is provided, filter by customer mobile OR email (handles mobile-as-email legacy cases)
    if (mobile) {
      const trimmedQuery = String(mobile).trim();
      // Handle potential mangling where +92 was prepended to emails
      const mangledQuery = (trimmedQuery.includes('@') && !trimmedQuery.startsWith('+'))
        ? `+92${trimmedQuery}`
        : trimmedQuery;

      query = {
        $or: [
          { 'customer.mobile': trimmedQuery },
          { 'customer.email': trimmedQuery },
          { 'customer.mobile': mangledQuery }
        ]
      };
      console.log('📋 [ORDERS] Fetching orders for:', trimmedQuery, mangledQuery !== trimmedQuery ? `(also checking ${mangledQuery})` : '');
    } else {
      console.log('📋 [ORDERS] Fetching all orders (no filter)');
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    console.log(`📋 [ORDERS] Found ${orders.length} order(s) for query: "${mobile}"`);
    if (orders.length > 0) {
      console.log('📋 [ORDERS] Match found for mobile/email');
    } else {
      console.log('📋 [ORDERS] No orders found matching query:', JSON.stringify(query));
    }

    return res.json({ orders });
  } catch (error) {
    console.error('❌ [ORDERS] Error fetching orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Failed to update order status' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ message: 'Failed to delete order' });
  }
};


