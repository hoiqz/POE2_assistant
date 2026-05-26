import { Pool } from 'pg'

export const pool = new Pool({
  user: 'qiangze',
  host: 'localhost',
  port: 5432,
  database: 'poe2_companion'
})
