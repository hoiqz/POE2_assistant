import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'qiangze'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'poe2_companion'}`

export const pool = new Pool({
  connectionString: connectionString,
  // Connection timeout - helpful for diagnosing slow/unresponsive databases
  connectionTimeoutMillis: 5000,
  // Idle timeout
  idleTimeoutMillis: 30000,
})

// Log which connection string we're using (first 100 chars for safety)
if (process.env.DATABASE_URL) {
  console.log('[DB] Using DATABASE_URL from environment')
} else {
  console.log('[DB] Using individual DB_* environment variables (localhost fallback)')
}
