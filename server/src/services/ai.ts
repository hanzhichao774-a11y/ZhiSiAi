import OpenAI from 'openai'
import fs from 'fs'

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'demo-key',
  baseURL: process.env.AI_BASE_URL || 'https://api.minimax.chat/v1',
})

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
  try {
    const response = await client.chat.completions.create({
      model: process.env.AI_VISION_MODEL || 'MiniMax-Text-01',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userMessage },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })
    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Vision API call failed:', error)
    throw new Error('图像分析服务暂时不可用')
  }
}

export function imageToBase64(filePath: string): string {
  return fs.readFileSync(filePath, { encoding: 'base64' })
}
