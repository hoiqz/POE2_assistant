import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function chatWithClaude(
  buildData: any,
  messages: Message[]
): Promise<string> {
  const systemPrompt = `You are a helpful Path of Exile 2 build advisor. You help players improve their character builds through thoughtful conversation.

Current Build:
- Class: ${buildData.class || 'Unknown'}
- Main Skill: ${buildData.mainSkill?.gem?.name || buildData.main_skill || 'Unknown'}
- Level: ${buildData.level || 'Unknown'}
- Ascendancy: ${buildData.ascendancyName || 'Not specified'}

Full Build Data:
${JSON.stringify(buildData, null, 2)}

Your role is to:
1. Analyze the build and identify potential improvements
2. Suggest optimizations based on skill synergies and passive tree placement
3. Discuss trade-offs between different approaches
4. Answer questions about build mechanics and decisions
5. Be conversational, encouraging, and constructive

Keep responses concise but informative. Use your knowledge of Path of Exile 2 mechanics to provide specific, actionable advice.`

  const response = await client.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  return textContent.text
}
