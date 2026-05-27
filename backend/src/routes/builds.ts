import express from 'express'
import { pool } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { chatWithClaude } from '../services/claude.js'

const router = express.Router()

interface ParsedBuild {
  class: string
  ascendancy?: string
  mainSkill?: string
  level?: number
}

function parsePoB(data: any): ParsedBuild {
  return {
    class: data.classId || data.class || 'Unknown',
    ascendancy: data.ascendancyName || data.ascendancy,
    mainSkill: data.mainSkill?.gem?.name || (typeof data.mainSkill === 'string' ? data.mainSkill : undefined),
    level: data.level,
  }
}

function decodeBuildCode(code: string): any {
  try {
    // PoE build codes are typically base64-encoded
    const decoded = Buffer.from(code.trim(), 'base64').toString('utf-8')

    // Try to parse as JSON first
    try {
      return JSON.parse(decoded)
    } catch {
      // If not JSON, return as parsed build object with extracted data
      // Extract common patterns from the decoded string
      const classMatch = decoded.match(/class[":']?\s*[=:]\s*['""]?([^'"\n,}]+)/i)
      const skillMatch = decoded.match(/skill[":']?\s*[=:]\s*['""]?([^'"\n,}]+)/i)
      const ascendancyMatch = decoded.match(/ascendancy[":']?\s*[=:]\s*['""]?([^'"\n,}]+)/i)

      return {
        class: classMatch ? classMatch[1]!.trim() : 'Unknown',
        mainSkill: skillMatch ? skillMatch[1]!.trim() : undefined,
        ascendancy: ascendancyMatch ? ascendancyMatch[1]!.trim() : undefined,
        rawCode: decoded,
      }
    }
  } catch (error) {
    throw new Error('Invalid build code format')
  }
}

router.post('/import', authenticate, async (req, res) => {
  try {
    const { name, pobUrl, pobJson } = req.body
    const userId = (req as any).userId

    let buildData = pobJson
    if (pobUrl && !pobJson) {
      return res.status(400).json({ error: 'JSON data required' })
    }

    const parsed = parsePoB(buildData)

    const result = await pool.query(
      'INSERT INTO builds (user_id, name, class, main_skill, build_data) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name || 'Imported Build', parsed.class, parsed.mainSkill, buildData]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Import error:', error)
    res.status(400).json({ error: 'Import failed' })
  }
})

router.post('/import-code', authenticate, async (req, res) => {
  try {
    const { name, buildCode } = req.body
    const userId = (req as any).userId

    if (!buildCode?.trim()) {
      return res.status(400).json({ error: 'Build code required' })
    }

    // Decode the build code
    const decodedBuild = decodeBuildCode(buildCode)
    const parsed = parsePoB(decodedBuild)

    // Store the decoded build data as JSON
    const buildData = {
      class: parsed.class || 'Unknown',
      ascendancy: parsed.ascendancy,
      mainSkill: parsed.mainSkill,
      rawCode: decodedBuild.rawCode || buildCode,
      importedFrom: 'buildCode',
    }

    const result = await pool.query(
      'INSERT INTO builds (user_id, name, class, main_skill, build_data) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name || 'Imported Build', parsed.class || 'Unknown', parsed.mainSkill || null, JSON.stringify(buildData)]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Build code import error:', error)
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to import build code' })
  }
})

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId

    const result = await pool.query(
      'SELECT id, name, class, main_skill, level, created_at FROM builds WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Fetch error:', error)
    res.status(400).json({ error: 'Failed to fetch builds' })
  }
})

router.delete('/:buildId', authenticate, async (req, res) => {
  try {
    const { buildId } = req.params
    const userId = (req as any).userId

    const result = await pool.query(
      'DELETE FROM builds WHERE id = $1 AND user_id = $2 RETURNING id',
      [buildId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Build not found' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(400).json({ error: 'Failed to delete build' })
  }
})

router.post('/:buildId/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body
    const { buildId } = req.params
    const userId = (req as any).userId

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' })
    }

    // Verify build ownership
    const buildResult = await pool.query(
      'SELECT * FROM builds WHERE id = $1 AND user_id = $2',
      [buildId, userId]
    )

    if (buildResult.rows.length === 0) {
      return res.status(404).json({ error: 'Build not found' })
    }

    const build = buildResult.rows[0]

    // Get existing conversation
    const convResult = await pool.query(
      'SELECT messages FROM conversations WHERE build_id = $1',
      [buildId]
    )

    const existingMessages = convResult.rows[0]?.messages || []
    const allMessages = [
      ...existingMessages,
      { role: 'user', content: message },
    ]

    // Get Claude response
    const aiResponse = await chatWithClaude(build.build_data, allMessages)

    // Save updated conversation
    const updatedMessages = [...allMessages, { role: 'assistant', content: aiResponse }]

    if (convResult.rows.length > 0) {
      await pool.query(
        'UPDATE conversations SET messages = $1 WHERE build_id = $2',
        [JSON.stringify(updatedMessages), buildId]
      )
    } else {
      await pool.query(
        'INSERT INTO conversations (build_id, messages) VALUES ($1, $2)',
        [buildId, JSON.stringify(updatedMessages)]
      )
    }

    res.json({ message: aiResponse })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(400).json({ error: 'Chat failed' })
  }
})

router.post('/:buildId/variants', authenticate, async (req, res) => {
  try {
    const { variant_name, changes_summary } = req.body
    const { buildId } = req.params
    const userId = (req as any).userId

    // Verify build ownership
    const buildResult = await pool.query(
      'SELECT id FROM builds WHERE id = $1 AND user_id = $2',
      [buildId, userId]
    )

    if (buildResult.rows.length === 0) {
      return res.status(404).json({ error: 'Build not found' })
    }

    const result = await pool.query(
      'INSERT INTO build_variants (build_id, variant_name, changes_summary) VALUES ($1, $2, $3) RETURNING *',
      [buildId, variant_name, changes_summary]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Variant save error:', error)
    res.status(400).json({ error: 'Failed to save variant' })
  }
})

router.get('/:buildId/variants', authenticate, async (req, res) => {
  try {
    const { buildId } = req.params
    const userId = (req as any).userId

    // Verify build ownership
    const buildResult = await pool.query(
      'SELECT id FROM builds WHERE id = $1 AND user_id = $2',
      [buildId, userId]
    )

    if (buildResult.rows.length === 0) {
      return res.status(404).json({ error: 'Build not found' })
    }

    const result = await pool.query(
      'SELECT * FROM build_variants WHERE build_id = $1 ORDER BY created_at DESC',
      [buildId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Fetch variants error:', error)
    res.status(400).json({ error: 'Failed to fetch variants' })
  }
})

router.get('/:buildId/chat/export', authenticate, async (req, res) => {
  try {
    const { buildId } = req.params
    const userId = (req as any).userId

    // Verify build ownership
    const buildResult = await pool.query(
      'SELECT id, name FROM builds WHERE id = $1 AND user_id = $2',
      [buildId, userId]
    )

    if (buildResult.rows.length === 0) {
      return res.status(404).json({ error: 'Build not found' })
    }

    const build = buildResult.rows[0]

    // Get conversation
    const convResult = await pool.query(
      'SELECT messages FROM conversations WHERE build_id = $1',
      [buildId]
    )

    if (!convResult.rows.length) {
      return res.status(404).json({ error: 'No conversation found' })
    }

    const messages = convResult.rows[0].messages || []
    let text = `# Build Conversation Export\n\n**Build**: ${build.name}\n**Exported**: ${new Date().toISOString()}\n\n---\n\n`

    messages.forEach((msg: any) => {
      const role = msg.role === 'user' ? 'You' : 'AI Advisor'
      text += `## ${role}\n${msg.content}\n\n`
    })

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="conversation.md"')
    res.send(text)
  } catch (error) {
    console.error('Export error:', error)
    res.status(400).json({ error: 'Export failed' })
  }
})

export default router
