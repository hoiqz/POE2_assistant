import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import buildsRouter from './routes/builds.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/builds', buildsRouter)

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
