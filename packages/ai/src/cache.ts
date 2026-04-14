import { db } from '@micro/storage'

const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function getCached(
  prompt: string,
  systemPrompt: string | undefined,
  model: string,
): Promise<string | null> {
  const hash = await sha256(`${prompt}|${systemPrompt ?? ''}|${model}`)
  const entry = await db.ai_cache.where('hash').equals(hash).first()

  if (!entry) return null

  // Evict stale entries
  if (Date.now() - entry.createdAt > TTL_MS) {
    await db.ai_cache.delete(entry.id!)
    return null
  }

  return entry.result
}

export async function setCached(
  prompt: string,
  systemPrompt: string | undefined,
  model: string,
  result: string,
): Promise<void> {
  const hash = await sha256(`${prompt}|${systemPrompt ?? ''}|${model}`)

  // Upsert: delete existing then insert fresh
  await db.ai_cache.where('hash').equals(hash).delete()
  await db.ai_cache.add({
    hash,
    prompt,
    systemPrompt,
    model,
    result,
    createdAt: Date.now(),
  })
}
