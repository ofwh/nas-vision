import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { twoFactor, username } from 'better-auth/plugins';
import { db } from './db';
import * as schema from './db/schema/better-auth';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  disabledPaths: ['/two-factor/generate-backup-codes', '/two-factor/verify-backup-code'],
  // nextCookies must stay last in the array
  plugins: [username(), twoFactor({ issuer: 'NAS Vision', backupCodeOptions: { amount: 0 } }), nextCookies()],
});
