import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export type Role = 'user' | 'assistant' | 'system'

export type Message = {
  id: string
  role: Role
  content: string
  createdAt: number
}

export type Session = {
  id: string
  name?: string
  messages: Message[]
}

function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useChatStore = defineStore('chat', () => {
  const sessions = reactive<Record<string, Session>>({})
  const currentSessionId = ref<string | null>(localStorage.getItem('ai_session_id'))
  const loading = ref(false)
  const streaming = ref(false)

  function getCurrentSession(): Session | null {
    if (!currentSessionId.value) return null
    return sessions[currentSessionId.value] ?? null
  }

  async function loadHistory(sessionId: string) {
    loading.value = true
    try {
      const res = await fetch(`/api/history?sessionId=${encodeURIComponent(sessionId)}`)
      if (!res.ok) throw new Error('Failed to load history')
      const data = await res.json()
      sessions[sessionId] = {
        id: sessionId,
        name: `Session ${sessionId.slice(-6)}`,
        messages: (data.messages || []).map((m: any) => ({
          id: uid('m_'),
          role: m.role,
          content: m.content,
          createdAt: Date.now(),
        })),
      }
      currentSessionId.value = sessionId
      localStorage.setItem('ai_session_id', sessionId)
    } finally {
      loading.value = false
    }
  }

  function createSession(name?: string) {
    const id = uid('s_')
    sessions[id] = { id, name: name ?? `New Session`, messages: [] }
    currentSessionId.value = id
    localStorage.setItem('ai_session_id', id)
    return id
  }

  function selectSession(id: string) {
    if (!sessions[id]) sessions[id] = { id, name: `Session ${id.slice(-6)}`, messages: [] }
    currentSessionId.value = id
    localStorage.setItem('ai_session_id', id)
  }

  function appendMessage(sessionId: string, message: Message) {
    if (!sessions[sessionId]) sessions[sessionId] = { id: sessionId, messages: [] }
    // ensure message has id and createdAt
    const msg = {
      id: message.id ?? uid('m_'),
      role: message.role,
      content: message.content,
      createdAt: message.createdAt ?? Date.now(),
    }
    sessions[sessionId].messages.push(msg)
  }

  async function sendMessage(content: string) {
    const sid = currentSessionId.value ?? createSession()
    const userMsg: Message = { id: uid('m_'), role: 'user', content, createdAt: Date.now() }
    appendMessage(sid!, userMsg)
    loading.value = true
    streaming.value = true
    const assistantMsg: Message = {
      id: uid('m_'),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    }
    appendMessage(sid!, assistantMsg)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, input: content }),
      })

      if (res.ok && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let accumulatedContent = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          if (!value) continue
          buffer += decoder.decode(value, { stream: true })

          // parse SSE `data: ...\n\n` blocks
          let match
          const regex = /data:\s*(.*?)\r?\n\r?\n/gs
          while ((match = regex.exec(buffer)) !== null) {
            const payload = match[1]
            if (!payload) continue
            if (payload === '[DONE]') {
              // finished
              buffer = ''
              break
            }
            try {
              const parsed: any = JSON.parse(payload)
              const choice = parsed?.choices?.[0] || {}
              const deltaObj = choice.delta || {}

              // 只处理明确的content字段
              if (typeof deltaObj.content === 'string') {
                accumulatedContent += deltaObj.content
                // 立即更新消息内容，触发响应式更新
                const sess = sessions[sid!]
                if (sess) {
                  const msgs = sess.messages
                  const idx = msgs.findIndex((m) => m.id === assistantMsg.id)
                  if (idx >= 0) {
                    // 直接赋值触发Vue响应式更新
                    msgs[idx].content = accumulatedContent
                  }
                }
              }
            } catch (e) {
              // ignore JSON parse errors for partial data
            }
          }

          // 保持可能的尾部部分
          const lastSep = buffer.lastIndexOf('\n\n')
          if (lastSep >= 0) buffer = buffer.slice(lastSep + 2)
          // 防止缓冲区无限增长
          if (buffer.length > 1_000_000) buffer = buffer.slice(-1000)
        }
      } else {
        // 处理非200响应
        const errorText = await res.text()
        console.error('API error:', res.status, errorText)
        const sess = sessions[sid!]
        if (sess) {
          const msgs = sess.messages
          const idx = msgs.findIndex((m) => m.id === assistantMsg.id)
          if (idx >= 0) {
            msgs[idx].content = `错误: ${res.status} - ${errorText}`
          }
        }
      }
    } catch (e) {
      console.error('Stream error:', e)
      const sess = sessions[sid!]
      if (sess) {
        const msgs = sess.messages
        const idx = msgs.findIndex((m) => m.id === assistantMsg.id)
        if (idx >= 0) {
          msgs[idx].content = `连接错误: ${e instanceof Error ? e.message : String(e)}`
        }
      }
    } finally {
      loading.value = false
      streaming.value = false
    }
  }

  return {
    sessions,
    currentSessionId,
    loading,
    streaming,
    getCurrentSession,
    loadHistory,
    createSession,
    selectSession,
    appendMessage,
    sendMessage,
  }
})
