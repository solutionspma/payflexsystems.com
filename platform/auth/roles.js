// PayFlex Systems - Role Definitions (FINAL)
// No modifications without platform admin approval

export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",  // God Mode
  OPERATOR: "operator",               // You as user
  CLIENT_OWNER: "client_owner",       // Client company owner
  CLIENT_STAFF: "client_staff",       // Client staff member
  READ_ONLY: "read_only"              // View-only access
};

export const PERMISSIONS = {
  // Platform Admin (God Mode) - Full control
  [ROLES.PLATFORM_ADMIN]: [
    "admin:*",
    "client:suspend",
    "client:terminate",
    "program:override",
    "risk:override",
    "kyb:approve",
    "revenue:view",
    "audit:view",
    "automation:pause"
  ],

  // Operator - Standard user access
  [ROLES.OPERATOR]: [
    "client:view",
    "client:create",
    "program:view",
    "revenue:view"
  ],

  // Client Owner - Their program only
  [ROLES.CLIENT_OWNER]: [
    "program:view_own",
    "orders:create",
    "orders:view_own",
    "reports:view_own",
    "staff:manage"
  ],

  // Client Staff - Limited view
  [ROLES.CLIENT_STAFF]: [
    "program:view_own",
    "orders:view_own",
    "reports:view_own"
  ],

  // Read Only - View only
  [ROLES.READ_ONLY]: [
    "program:view_own",
    "reports:view_own"
  ]
};

export function hasPermission(user, permission) {
  const userPermissions = PERMISSIONS[user.role] || [];
  
  // Check for wildcard admin permissions
  if (userPermissions.includes("admin:*")) return true;
  
  // Check specific permission
  return userPermissions.includes(permission);
}

export function requireRole(user, requiredRole) {
  if (user.role !== requiredRole) {
    throw new Error(`Unauthorized. Required role: ${requiredRole}`);
  }
}

export function requireGodMode(user) {
  if (user.role !== ROLES.PLATFORM_ADMIN) {
    throw new Error("God Mode only. This action requires platform admin privileges.");
  }
}
