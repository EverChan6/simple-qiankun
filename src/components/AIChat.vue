<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

// TODO: 完善AI助手的功能 
// 1. 会话历史列表
// 2. 新增会话
// 3. 流式输出
// 4. 返回富文本处理（比如加粗、代码块等）
// 5. 打开对话框自动滚动到最新消息

// TODO：
// 1. 目前api key等是写在.env文件里，并且gitignore了，那上线时如何获取
// 2. 如何部署后端

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

const open = ref(false)
const loading = ref(false)
const input = ref('')
const messages = reactive<Msg[]>([
  { role: 'system', content: '你是一个有帮助的 AI 助手。请用简体中文回答。' }
])
const sessionId = ref<string | null>(null)
const visibleMessages = computed(() => messages.filter(m => m.role !== 'system'))

function toggle() {
  open.value = !open.value
}

async function send() {
  const text = input.value.trim()
  if (!text) return
  messages.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId.value, message: text })
    })

    if (!resp.ok) {
      const txt = await resp.text()
      messages.push({ role: 'assistant', content: `调用后端AI代理失败：${resp.status} ${txt}` })
      loading.value = false
      return
    }

    const data = await resp.json()
    if (data.sessionId) {
      sessionId.value = data.sessionId
      try { localStorage.setItem('ai_session_id', sessionId.value) } catch {}
    }
    const reply = data.assistant || 'AI 未返回结果。'
    messages.push({ role: 'assistant', content: reply })
  } catch (e: any) {
    messages.push({ role: 'assistant', content: '请求出错：' + (e?.message || String(e)) })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const sid = localStorage.getItem('ai_session_id')
    if (sid) {
      sessionId.value = sid
      const resp = await fetch(`/api/history?sessionId=${encodeURIComponent(sid)}`)
      if (resp.ok) {
        const data = await resp.json()
        if (Array.isArray(data.messages)) {
          // replace messages with server history while keeping initial system prompt
          messages.splice(0, messages.length, ...(data.messages.length ? data.messages : messages))
        }
      }
    }
  } catch (e) {
    // ignore
  }
})
</script>

<template>
  <div>
    <div class="ai-floating" @click="toggle" v-if="!open" aria-label="打开 AI 对话">
      <svg class="ai-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <div class="ai-panel" v-if="open">
      <div class="ai-header">
        <span>跟我对话吧～</span>
        <button class="close" @click="toggle">×</button>
      </div>

      <div class="ai-body">
        <div v-for="(m, idx) in visibleMessages" :key="idx" :class="['msg', m.role]">
          <div class="content">{{ m.content }}</div>
        </div>
      </div>

      <div class="ai-footer">
        <input v-model="input" @keyup.enter="send" placeholder="请输入消息，回车发送" />
        <button class="send-btn" @click="send" :disabled="loading" aria-label="发送消息">
          <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else class="spinner" width="18" height="18" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="31.4 31.4"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-floating {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg,#667eea,#764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,0.2);
  z-index: 9999;
}
.ai-icon{font-weight:700}

.ai-panel{
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 360px;
  max-height: 60vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10000;
}
.ai-header{
  padding: 12px 16px;
  background: linear-gradient(90deg,#667eea,#764ba2);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.ai-header .close{background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer}
.ai-body{padding:12px;overflow:auto;flex:1;background:#f7f8fb}
.msg{margin-bottom:8px;display:flex}
.msg.system{display:none}
.msg.user{justify-content:flex-end}
.msg.assistant{justify-content:flex-start}
.msg .content{max-width:85%;display:inline-block;padding:8px;border-radius:8px}
.msg.user .content{background:#d1e7ff;color:#0b2b47}
.msg.assistant .content{background:#fff;border:1px solid #e6eef8;color:#0b2b47}
.ai-footer{display:flex;padding:8px;border-top:1px solid #eee;align-items:center}
.ai-footer input{flex:1;padding:10px 12px;border-radius:14px;border:1px solid #ddd;margin-right:8px}
.send-btn{width:40px;height:40px;border-radius:50%;border:0;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer}
.send-btn:disabled{opacity:0.6;cursor:not-allowed}
.spinner{animation:spin 1s linear infinite}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
</style>
