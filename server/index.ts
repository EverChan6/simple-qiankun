import fs from 'fs'
import path from 'path'

const PORT = Number(process.env.PORT || 3000)
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data')
const DATA_FILE = path.join(DATA_DIR, 'messages.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8')

function loadAll() {
  try {
    const txt = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(txt || '{}')
  } catch (e) {
    return {}
  }
}

function saveAll(obj: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8')
}

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

async function handleChat(body: any) {
  const apiKey = process.env.VITE_OPENAI_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server missing OPENAI_API_KEY' }), { status: 500 })
  }
  const { sessionId: maybeId, message, input } = body || {}
  const userMessage = input ?? message
  const sessionId = maybeId || uuid()

  const all = loadAll()
  if (!all[sessionId]) {
    all[sessionId] = [{ role: 'system', content: '你是一个有帮助的 AI 助手。请用简体中文回答。' }]
  }

  if (userMessage && userMessage.trim()) {
    all[sessionId].push({ role: 'user', content: userMessage })
  }

  // Streaming path: proxy OpenAI stream to client while accumulating assistant text
  try {
    const resp = await fetch(`${process.env.VITE_OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.VITE_OPENAI_MODEL,
        messages: all[sessionId],
        // max_tokens: 65536,
        stream: true,
      }),
    })

    if (!resp.ok || !resp.body) {
      const text = await resp.text()
      return new Response(JSON.stringify({ error: text }), { status: resp.status })
    }

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let assistantAccum = ''
    let buffer = ''

    const streamToClient = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            if (value) {
              const chunk = decoder.decode(value)
              // forward raw chunk to client
              controller.enqueue(new TextEncoder().encode(chunk))

              // accumulate and parse complete `data: ...\n\n` SSE messages
              buffer += chunk
              let match
              const regex = /data:\s*(.*?)\r?\n\r?\n/gs
              while ((match = regex.exec(buffer)) !== null) {
                const payload = match[1]
                if (!payload) continue
                if (payload === '[DONE]') continue
                try {
                  const parsed = JSON.parse(payload)
                  const delta = parsed?.choices?.[0]?.delta?.content
                  if (delta) assistantAccum += delta
                } catch (e) {
                  // ignore parse errors for partial/non-json lines
                }
              }

              // keep only the tail part after last double newline (possible partial)
              const lastSep = buffer.lastIndexOf('\n\n')
              if (lastSep >= 0) {
                buffer = buffer.slice(lastSep + 2)
              } else if (buffer.length > 1_000_000) {
                // prevent unbounded buffer growth
                buffer = buffer.slice(-1000)
              }
            }
          }
        } catch (e) {
          controller.error(e)
        } finally {
          // persist assistant message after stream ends
          if (assistantAccum) {
            all[sessionId].push({ role: 'assistant', content: assistantAccum })
            saveAll(all)
          }
          controller.close()
        }
      },
    })

    return new Response(streamToClient, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 })
  }

  // If not stream, return an error — server only supports streaming mode
  return new Response(JSON.stringify({ error: 'Server only supports stream=true' }), {
    status: 400,
  })
}

async function handleHistory(sessionId: string | undefined) {
  const all = loadAll()
  if (!sessionId)
    return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } })
  return new Response(JSON.stringify({ sessionId, messages: all[sessionId] || [] }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

console.log(`Starting AI proxy server on http://localhost:${PORT}`)

Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url)
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    if (url.pathname === '/api/chat' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const res = await handleChat(body)
      res.headers.set('Access-Control-Allow-Origin', '*')
      return res
    }

    if (url.pathname === '/api/history' && req.method === 'GET') {
      const sessionId = url.searchParams.get('sessionId') || undefined
      const res = await handleHistory(sessionId)
      res.headers.set('Access-Control-Allow-Origin', '*')
      return res
    }

    return new Response('Not Found', { status: 404 })
  },
})
