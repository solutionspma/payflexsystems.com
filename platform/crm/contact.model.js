// PayFlex CRM - Contact Model

export const ContactSchema = {
  id: String,
  companyId: String,
  name: String,
  email: String,
  phone: String,
  role: String,                  // 'owner' | 'admin' | 'billing' | 'staff'
  userId: String,                // Linked user account ID (nullable)
  tags: Array,
  createdAt: Date,
  updatedAt: Date
};

export class Contact {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.email = data.email.toLowerCase();
    this.phone = data.phone || null;
    this.role = data.role || 'staff';
    this.userId = data.userId || null;
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  isOwner() {
    return this.role === 'owner';
  }
}
