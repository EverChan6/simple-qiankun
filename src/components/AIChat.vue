<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch, shallowRef } from 'vue'
import { useChatStore } from '@/stores/chat'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const store = useChatStore()
const open = ref(false)
const input = ref('')
const md = new MarkdownIt({ html: false, linkify: true, typographer: true })
const bodyRef = ref<HTMLElement | null>(null)
const streamingMessageId = ref<string | null>(null)
const showHistory = ref(false)
let updateTimer: number | null = null
let lastUpdateTime = 0

function toggle() {
  open.value = !open.value
  if (open.value) scrollToBottom()
}

function createSession() {
  const currentSession = store.getCurrentSession()
  // 如果当前会话存在且没有消息，则直接使用当前会话
  if (currentSession && currentSession.messages.length === 0) {
    // 当前会话为空，不需要创建新会话
    return
  }
  // 当前会话有内容，创建新会话
  store.createSession()
  nextTick(() => scrollToBottom())
}

function selectSession(id: string) {
  store.selectSession(id)
  // load history from server if not present
  const s = store.sessions[id]
  if (!s || !s.messages || s.messages.length === 0) {
    store.loadHistory(id)
  }
  // 关闭历史侧边栏
  showHistory.value = false
  // 滚动到底部
  nextTick(() => scrollToBottom())
}

async function send() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  await store.sendMessage(text)
}

const visibleMessages = computed(() => {
  const cur = store.getCurrentSession()
  if (!cur) return [] as any[]
  return cur.messages.filter((m: any) => m.role !== 'system')
})

const sessionList = computed(() => {
  return Object.values(store.sessions).sort((a, b) => {
    const lastMsgA = a.messages[a.messages.length - 1]?.createdAt || 0
    const lastMsgB = b.messages[b.messages.length - 1]?.createdAt || 0
    return lastMsgA - lastMsgB
  })
})

const isStreaming = (msg: any) => {
  return store.streaming && msg.id === streamingMessageId.value
}

function renderMarkdown(src: string) {
  if (!src) return ''
  const html = md.render(src || '')
  return DOMPurify.sanitize(html)
}

function scrollToBottom() {
  nextTick(() => {
    try {
      const el = bodyRef.value
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    } catch (e) {
      // ignore
    }
  })
}

// auto-scroll when messages change (throttled)
watch(
  () => visibleMessages.value.map((m: any) => m.content).join('\n'),
  () => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateTime
    
    if (timeSinceLastUpdate > 100) {
      lastUpdateTime = now
      requestAnimationFrame(() => {
        setTimeout(scrollToBottom, 16)
      })
    } else {
      if (updateTimer) {
        clearTimeout(updateTimer)
      }
      updateTimer = window.setTimeout(() => {
        lastUpdateTime = Date.now()
        scrollToBottom()
      }, 100 - timeSinceLastUpdate)
    }
  }
)

watch(
  () => store.streaming,
  (isStreaming) => {
    if (isStreaming) {
      const cur = store.getCurrentSession()
      if (cur && cur.messages.length > 0) {
        const lastMsg = cur.messages[cur.messages.length - 1]
        if (lastMsg.role === 'assistant') {
          streamingMessageId.value = lastMsg.id
        }
      }
    } else {
      streamingMessageId.value = null
    }
  }
)

onMounted(() => {
  if (store.currentSessionId) store.loadHistory(String(store.currentSessionId))
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
      <!-- 历史侧边栏 -->
      <div class="ai-history-sidebar" :class="{ 'show': showHistory }">
        <div class="history-header">
          <button class="toggle-btn" @click="showHistory = false" aria-label="收起历史侧边栏">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
        </div>
        <div class="history-list">
          <div
            v-for="session in sessionList"
            :key="session.id"
            :class="['history-item', { 'active': session.id === store.currentSessionId }]"
            @click="selectSession(session.id)"
          >
            <div class="session-name">{{ session.name || `Session ${session.id.slice(-6)}` }}</div>
            <div class="session-preview">
              {{ session.messages[session.messages.length - 1]?.content?.slice(0, 30) || '新会话' }}...
            </div>
          </div>
        </div>
      </div>

      <div class="ai-content" :class="{ 'with-history': showHistory }">
        <div class="ai-header">
          <span>跟我对话吧～</span>
          <div style="display: flex; align-items: center;">
            <button class="close" @click="showHistory = !showHistory" aria-label="历史会话">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="close" @click="createSession">+</button>
            <button class="close" @click="toggle">×</button>
          </div>
        </div>

        <div class="ai-body" ref="bodyRef">
          <div v-for="(m, idx) in visibleMessages" :key="m.id || idx" :class="['msg', m.role]">
            <div class="content">
              <div v-html="renderMarkdown(m.content)" :class="{ 'streaming': isStreaming(m) }"></div>
              <span v-if="isStreaming(m)" class="cursor">|</span>
            </div>
          </div>
        </div>

        <div class="ai-footer">
          <input v-model="input" @keyup.enter="send" placeholder="请输入消息，回车发送" />
          <button class="send-btn" @click="send" :disabled="store.loading" aria-label="发送消息">
            <svg v-if="!store.loading" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  overflow: hidden;
  z-index: 10000;
}

.ai-history-sidebar {
  width: 0;
  background: #f8f9fa;
  transition: width 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.ai-history-sidebar.show {
  width: 80px;
  border-right: 1px solid #e9ecef;
}

.history-header {
  padding: 12px 16px;
  background: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dee2e6;
}

.history-header .toggle-btn {
  background: transparent;
  border: 0;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.history-header .toggle-btn:hover {
  background-color: #dee2e6;
}

.history-list {
  height: calc(100% - 49px);
  overflow-y: auto;
}

.history-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: #e9ecef;
}

.history-item.active {
  background-color: #007bff;
  color: white;
}

.session-name {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
}

.session-preview {
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.ai-content.with-history {
  width: calc(360px - 280px);
}
.ai-header{
  padding: 12px 16px;
  background: linear-gradient(90deg,#667eea,#764ba2);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.ai-header .close{
  background:transparent;
  border:0;
  color:#fff;
  font-size:18px;
  cursor:pointer;
  margin-left:8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
.ai-body{padding:12px;overflow:auto;flex:1;background:#f7f8fb; min-height: 360px;}
.msg{margin-bottom:8px;display:flex}
.msg.system{display:none}
.msg.user{justify-content:flex-end}
.msg.assistant{justify-content:flex-start}
.msg .content{max-width:85%;display:inline-block;padding:8px;border-radius:8px;position:relative}
.msg.user .content{background:#d1e7ff;color:#0b2b47}
.msg.assistant .content{background:#fff;border:1px solid #e6eef8;color:#0b2b47}
.msg.assistant .content.streaming{animation:content-pulse 1s ease-in-out infinite alternate}

/* 修复li标签marker超出容器的问题 */
.msg .content :deep(ul),
.msg .content :deep(ol) {
  margin: 0;
  padding-left: 1.5em;
  overflow: hidden;
}

.msg .content :deep(li) {
  margin: 0.25em 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.msg .content :deep(ul li) {
  list-style-type: disc;
}

.msg .content :deep(ol li) {
  list-style-type: decimal;
}

/* 确保列表标记在容器内 */
.msg .content :deep(ul),
.msg .content :deep(ol) {
  list-style-position: inside;
}

/* 为长内容添加滚动支持 */
.msg .content :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
@keyframes content-pulse{from{opacity:0.95}to{opacity:1}}
.cursor{display:inline-block;width:2px;height:1.2em;border-radius:1px;margin-left:2px;animation:blink 1.2s step-end infinite;vertical-align:text-bottom;}
@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
.ai-footer{display:flex;padding:8px;border-top:1px solid #eee;align-items:center}
.ai-footer input{flex:1;padding:10px 12px;border-radius:14px;border:1px solid #ddd;margin-right:8px}
.send-btn{width:40px;height:40px;border-radius:50%;border:0;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer}
.send-btn:disabled{opacity:0.6;cursor:not-allowed}
.spinner{animation:spin 1.5s linear infinite}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
</style>