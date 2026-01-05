// PayFlex Systems - User Model (SECURE)
// Never store plain passwords

export const UserSchema = {
  id: String,                    // UUID
  email: String,                 // Unique, lowercase
  passwordHash: String,          // bcrypt hashed
  role: String,                  // From roles.js
  companyId: String,             // Nullable for platform admins
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,       // Encrypted at rest
  twoFactorVerified: Boolean,    // Session state
  createdAt: Date,
  lastLoginAt: Date,
  lastLoginIp: String,
  passwordResetToken: String,    // Nullable
  passwordResetExpires: Date,    // Nullable
  status: String                 // active | suspended | terminated
};

export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email.toLowerCase();
    this.passwordHash = data.passwordHash;
    this.role = data.role;
    this.companyId = data.companyId || null;
    this.twoFactorEnabled = data.twoFactorEnabled || false;
    this.twoFactorSecret = data.twoFactorSecret || null;
    this.twoFactorVerified = false;
    this.createdAt = data.createdAt || new Date();
    this.lastLoginAt = data.lastLoginAt || null;
    this.lastLoginIp = data.lastLoginIp || null;
    this.passwordResetToken = null;
    this.passwordResetExpires = null;
    this.status = data.status || 'active';
  }

  isActive() {
    return this.status === 'active';
  }

  isSuspended() {
    return this.status === 'suspended';
  }

  requires2FA() {
    return this.role === 'platform_admin' || this.twoFactorEnabled;
  }

  updateLastLogin(ipAddress) {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ipAddress;
  }

  toJSON() {
    // Never expose password hash or 2FA secret
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      companyId: this.companyId,
      twoFactorEnabled: this.twoFactorEnabled,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
      status: this.status
    };
  }
}
