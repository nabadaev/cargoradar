import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface NewsAnalysis {
  summary: string
  impact: string
  severity: number
  keywords: string[]
}

export async function analyzeNewsItem(rawContent: string, zoneName: string): Promise<NewsAnalysis> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a freight intelligence analyst. Analyze this news item for ocean freight professionals.

News: ${rawContent}
Zone: ${zoneName}

Respond in JSON only:
{
  "summary": "2-3 sentence plain English summary",
  "impact": "What this means for shippers and forwarders on this lane",
  "severity": 1-10 integer,
  "keywords": ["tag1", "tag2"]
}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text) as NewsAnalysis
}
