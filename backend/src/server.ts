import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import buildsRouter from './routes/builds.js'
import { pool } from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

console.log('Database URL configured:', process.env.DATABASE_URL ? 'Yes (from env)' : 'No (using default)')
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL:', process.env.DATABASE_URL.substring(0, 50) + '...')
}
console.log('DB Host:', process.env.DB_HOST || 'localhost')

pool.query('SELECT 1', (err) => {
  if (err) {
    console.error('Database connection failed!')
    console.error('Error type:', err.constructor.name)
    console.error('Error message:', err.message || '(no message)')
    console.error('Error code:', err.code || '(no code)')
    console.error('Full error:', JSON.stringify(err, null, 2))
  } else {
    console.log('Database connection successful')
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/builds', buildsRouter)

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
