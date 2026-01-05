// PayFlex Marketplace - Order Model

export const OrderSchema = {
  id: String,
  companyId: String,
  userId: String,
  items: Array,                  // Order line items
  subtotal: Number,              // In cents
  shipping: Number,              // In cents
  tax: Number,                   // In cents
  total: Number,                 // In cents
  status: String,                // 'pending' | 'printing' | 'shipped' | 'delivered' | 'cancelled'
  stripeSessionId: String,
  shippingAddress: Object,
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date,
  deliveredAt: Date
};

export class Order {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.userId = data.userId;
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.shipping = data.shipping || 0;
    this.tax = data.tax || 0;
    this.total = data.total || 0;
    this.status = data.status || 'pending';
    this.stripeSessionId = data.stripeSessionId;
    this.shippingAddress = data.shippingAddress;
    this.trackingNumber = data.trackingNumber || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deliveredAt = data.deliveredAt || null;
  }

  calculateTotal() {
    return this.subtotal + this.shipping + this.tax;
  }

  markShipped(trackingNumber) {
    this.status = 'shipped';
    this.trackingNumber = trackingNumber;
    this.updatedAt = new Date();
  }

  markDelivered() {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    this.updatedAt = new Date();

    // Trigger automation
    console.log('[ORDER] Delivered, triggering automation');
  }
}
