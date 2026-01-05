// PayFlex Systems - God Mode Seed Script
// RUN LOCALLY ONLY - NEVER DEPLOY THIS FILE

import { hashPassword } from '../platform/auth/password.js';
import { ROLES } from '../platform/auth/roles.js';
import crypto from 'crypto';

/**
 * CRITICAL: Set these in .env.local ONLY
 * Never commit credentials
 */
const GODMODE_EMAIL = process.env.GODMODE_EMAIL || 'solutions@pitchmarketing.agency';
const GODMODE_PASSWORD = process.env.GODMODE_PASSWORD;
const USER_EMAIL = process.env.USER_EMAIL || 'jason.harris@pitchmarketing.agency';
const USER_PASSWORD = process.env.USER_PASSWORD;

const users = [];

async function seedGodMode() {
  console.log('🔐 PayFlex Systems - God Mode Seed');
  console.log('-----------------------------------\n');

  if (!GODMODE_PASSWORD || !USER_PASSWORD) {
    console.error('❌ ERROR: Passwords not set in environment variables');
    console.error('Set GODMODE_PASSWORD and USER_PASSWORD in .env.local');
    process.exit(1);
  }

  // Create God Mode user
  users.push({
    id: crypto.randomUUID(),
    email: GODMODE_EMAIL,
    passwordHash: await hashPassword(GODMODE_PASSWORD),
    role: ROLES.PLATFORM_ADMIN,
    twoFactorEnabled: true, // MANDATORY for God Mode
    status: 'active',
    createdAt: new Date()
  });

  console.log(`✅ God Mode user created: ${GODMODE_EMAIL}`);

  // Create standard operator user
  users.push({
    id: crypto.randomUUID(),
    email: USER_EMAIL,
    passwordHash: await hashPassword(USER_PASSWORD),
    role: ROLES.OPERATOR,
    twoFactorEnabled: false,
    status: 'active',
    createdAt: new Date()
  });

  console.log(`✅ Operator user created: ${USER_EMAIL}`);

  // Save to database (placeholder - implement your DB logic)
  console.log('\n📝 User records ready for database insertion:');
  console.log(JSON.stringify(users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    status: u.status
  })), null, 2));

  console.log('\n⚠️  SECURITY NOTES:');
  console.log('1. Delete .env.local after running this script');
  console.log('2. Never commit this file with real credentials');
  console.log('3. God Mode REQUIRES 2FA - set up immediately');
  console.log('4. Rotate passwords after initial setup\n');

  return users;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedGodMode()
    .then(() => {
      console.log('✅ Seed complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}

export { seedGodMode };
