import OpenAI from 'openai'
import fs from 'fs'

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'demo-key',
  baseURL: process.env.AI_BASE_URL || 'https://api.minimax.chat/v1',
})

export function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

export function extractJSON(text: string): string {
  const cleaned = stripThinkTags(text)
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) return match[1].trim()
  const braceMatch = cleaned.match(/(\{[\s\S]*\})/)
  if (braceMatch) return braceMatch[1].trim()
  return cleaned
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'MiniMax-Text-01',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    })
    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('AI API call failed:', error)
    throw new Error('AI 服务暂时不可用')
  }
}

export async function visionAnalysis(
  systemPrompt: string,
  imageBase64: string,
  userMessage: string
): Promise<string> {
  const apiHost = process.env.AI_BASE_URL?.replace(/\/v1\/?$/, '') || 'https://api.minimaxi.com'
  const prompt = `${systemPrompt}\n\n${userMessage}`

  const resp = await fetch(`${apiHost}/v1/coding_plan/vlm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      image_url: `data:image/jpeg;base64,${imageBase64}`,
    }),
  })

  const data = await resp.json() as any
  if (data.base_resp?.status_code !== 0) {
    const msg = data.base_resp?.status_msg || 'VLM API error'
    console.error('VLM API error:', msg)
    throw new Error(msg)
  }

  return data.content || ''
}

export function imageToBase64(filePath: string): string {
  return fs.readFileSync(filePath, { encoding: 'base64' })
}
