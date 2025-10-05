<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { chatSend, streamMockResponse } from '../services/ai';

/* Chatbox IA SmartFarmer
   - Multi-fournisseurs (mock / groq / openai) avec sélection runtime
   - Historique + persistance localStorage
   - Thème clair/sombre + hauteur configurable
   - Suggestions rapides
   - Message système sur changement provider/modèle
*/

// Props
const props = defineProps({ height: { type: String, default: 'clamp(520px,70vh,680px)' } });

// Storage keys
const STORAGE_KEY = 'sf_chat_history_v1';
const THEME_KEY = 'sf_chat_theme_v1';

// Runtime verrouillé sur Groq
const runtime = ref({ provider: 'groq', model: 'llama-3.1-8b-instant' });

// Messages & UI state
const messages = ref([]); // {role, content, streaming?}
const userInput = ref('');
const loading = ref(false);
const error = ref(null);
const activeTab = ref('chat');
const theme = ref('light');
const containerRef = ref(null);

// Suggestions
const baseSuggestions = [
  'Résumé pluie cette semaine',
  'Conseil irrigation maïs',
  'Impact forte pluie sol argileux',
  'Optimiser arrosage après 3 jours secs'
];

// Helpdesk (démo statique)
const helpdeskArticles = [
  { title:'Importer données NASA', key:'import-nasa' },
  { title:'Seuils irrigation', key:'irrigation-thresholds' },
  { title:'Exporter CSV', key:'export-csv' }
];

// Persistence
function loadHistory(){
  try { const raw = localStorage.getItem(STORAGE_KEY); if(raw){ const parsed = JSON.parse(raw); if(Array.isArray(parsed)) messages.value = parsed.slice(-120); } } catch(e){ /* noop */ }
  const t = localStorage.getItem(THEME_KEY); if(t === 'dark' || t === 'light') theme.value = t;
}
function saveHistory(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value.slice(-120))); }
function persistTheme(){ localStorage.setItem(THEME_KEY, theme.value); }

// Theme application
function applyTheme(){
  const root = document.documentElement;
  if(theme.value === 'dark'){
    root.style.setProperty('--sf-bg', '#0f172a');
    root.style.setProperty('--sf-bg-alt', '#1e293b');
    root.style.setProperty('--sf-border', '#1e293b');
    root.style.setProperty('--sf-assistant', '#1e2533');
    root.style.setProperty('--sf-assistant-text', '#e2e8f0');
    root.style.setProperty('--sf-user', '#2563eb');
    root.style.setProperty('--sf-user-text', '#ffffff');
    root.style.setProperty('--sf-text', '#e2e8f0');
    root.style.setProperty('--sf-subtle', '#94a3b8');
    root.style.setProperty('--sf-pill-bg', '#334155');
    root.style.setProperty('--sf-pill-hover', '#475569');
    root.style.setProperty('--sf-input-bg', '#1e2533');
    root.style.setProperty('--sf-input-text', '#f1f5f9');
    root.style.setProperty('--sf-input-placeholder', '#64748b');
  } else {
    root.style.setProperty('--sf-bg', '#ffffff');
    root.style.setProperty('--sf-bg-alt', '#f8f9fb');
    root.style.setProperty('--sf-border', '#e5e7eb');
    root.style.setProperty('--sf-assistant', '#f1f5f9');
    root.style.setProperty('--sf-assistant-text', '#1e293b');
    root.style.setProperty('--sf-user', '#2563eb');
    root.style.setProperty('--sf-user-text', '#ffffff');
    root.style.setProperty('--sf-text', '#1e293b');
    root.style.setProperty('--sf-subtle', '#64748b');
    root.style.setProperty('--sf-pill-bg', '#ffffff');
    root.style.setProperty('--sf-pill-hover', '#1f2937');
    root.style.setProperty('--sf-input-bg', '#ffffff');
    root.style.setProperty('--sf-input-text', '#1e293b');
    root.style.setProperty('--sf-input-placeholder', '#94a3b8');
  }
}

function toggleTheme(){ theme.value = theme.value === 'light' ? 'dark' : 'light'; persistTheme(); applyTheme(); }

// Sending logic
const canSend = computed(() => userInput.value.trim().length > 0 && !loading.value && activeTab.value === 'chat');
async function handleSend(){ if(!canSend.value) return; const prompt = userInput.value.trim(); userInput.value=''; error.value=null; messages.value.push({ role:'user', content:prompt }); await nextTick(scrollToBottom); await generateReply(); }
async function generateReply(){
  loading.value = true;
  const history = messages.value.filter(m => m.role !== 'system');
  const placeholder = { role:'assistant', content:'', streaming:true };
  messages.value.push(placeholder); await nextTick(scrollToBottom);
  try {
    const reply = await chatSend(history, { provider: runtime.value.provider, model: runtime.value.model });
    await streamMockResponse(reply.content, partial => { placeholder.content = partial; scrollToBottom(); });
    placeholder.streaming = false; saveHistory();
  } catch(e){ console.error(e); placeholder.content='[Erreur génération réponse]'; error.value = e.message || 'Erreur inconnue'; }
  finally { loading.value = false; await nextTick(scrollToBottom); }
}

function useSuggestion(s){ userInput.value = s; nextTick(()=>handleSend()); }
function clearChat(){ if(loading.value) return; messages.value=[{ role:'system', content:'Historique réinitialisé. Repose ta question.' }]; saveHistory(); }
function scrollToBottom(){ const el = containerRef.value; if(!el) return; el.scrollTop = el.scrollHeight; }

// Badges
const providerBadge = computed(() => ({ label: `Groq • ${runtime.value.model}` , color: '#10b981' }));

// Lifecycle
onMounted(() => {
  loadHistory();
  if(messages.value.length === 0){
    messages.value.push({ role:'system', content: 'Salut 👋 Je suis l\'assistant SmartFarmer. Choisis une suggestion ou pose ta question.' });
  }
  applyTheme();
  // runtime déjà fixé Groq
});
</script>

<template>
  <div class="sf-chat redesigned" :data-theme="theme" :style="{height: props.height, overflow:'hidden'}">
    <div class="sf-header">
      <div class="left-cluster">
        <div class="sf-tabs">
          <button :class="['sf-tab', activeTab==='chat' && 'active']" @click="activeTab='chat'">Chat</button>
          <button :class="['sf-tab', activeTab==='helpdesk' && 'active']" @click="activeTab='helpdesk'">Helpdesk</button>
        </div>
  <!-- Sélecteurs retirés: interface verrouillée sur Groq -->
      </div>
      <div class="sf-brand">
        <div class="avatars">
          <span class="avatar a1" />
          <span class="avatar a2" />
          <span class="avatar a3" />
        </div>
        <div class="meta">
          <div class="title">Assistant SmartFarmer</div>
          <div class="subtitle"><span class="status-dot" :style="{background: providerBadge.color}"></span>{{ providerBadge.label }}</div>
        </div>
      </div>
      <div class="actions">
        <button
          class="theme-btn"
          :class="theme"
          @click="toggleTheme"
          :title="theme==='light' ? 'Passer en mode sombre' : 'Passer en mode clair'"
          :aria-label="theme==='light' ? 'Activer le mode sombre' : 'Activer le mode clair'"
        >
          <!-- Icônes SVG pour cohérence visuelle -->
          <svg v-if="theme==='light'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
        <button class="reset-btn" @click="clearChat" title="Réinitialiser">↺</button>
      </div>
    </div>

    <div v-show="activeTab==='chat'" ref="containerRef" class="sf-body">
      <template v-for="(m,i) in messages" :key="i">
        <div :class="['row', m.role]">
          <div class="bubble" :data-role="m.role">
            <span v-if="m.role==='assistant' && m.streaming" class="streaming">{{ m.content }}▌</span>
            <span v-else>{{ m.content }}</span>
            <div v-if="i===0 && baseSuggestions.length" class="suggestions">
              <button v-for="s in baseSuggestions" :key="s" @click="useSuggestion(s)">{{ s }}</button>
            </div>
          </div>
        </div>
      </template>
      <div v-if="loading" class="info">Génération…</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <div v-show="activeTab==='helpdesk'" class="sf-helpdesk">
      <h4>Centre d'aide</h4>
      <ul class="articles"><li v-for="a in helpdeskArticles" :key="a.key">📘 {{ a.title }}</li></ul>
      <p class="hint">(Démo statique)</p>
    </div>

    <form v-if="activeTab==='chat'" @submit.prevent="handleSend" class="composer">
      <textarea v-model="userInput" rows="1" @keydown.enter.exact.prevent="handleSend" placeholder="Écris ta question..." />
      <button :disabled="!canSend" class="send">➤</button>
    </form>
    <div v-else class="composer-disabled">Basculer sur l'onglet Chat pour envoyer un message.</div>
  </div>
</template>

<style scoped>
.sf-chat.redesigned { --border:var(--sf-border,#e5e7eb); --bg:var(--sf-bg,#ffffff); --bg-alt:var(--sf-bg-alt,#f8f9fb); --assistant:var(--sf-assistant,#f1f5f9); --user:var(--sf-user,#2563eb); --user-text:var(--sf-user-text,#fff); --text:var(--sf-text,#1e293b); --subtle:var(--sf-subtle,#64748b); --pill-bg:var(--sf-pill-bg,#ffffff); --pill-hover:var(--sf-pill-hover,#1f2937); color:var(--text); background:var(--bg); display:flex; flex-direction:column; }
.sf-header { display:grid; grid-template-columns: 1fr auto auto; gap:.75rem; align-items:center; padding:.6rem .9rem; border-bottom:1px solid var(--border); background:linear-gradient(135deg,var(--bg),var(--bg-alt)); }
.left-cluster { display:flex; gap:.75rem; align-items:center; }
.sf-tabs { display:flex; gap:.4rem; }
.sf-tab { border:none; background:var(--bg-alt); padding:.45rem .9rem; border-radius:999px; font-size:12px; cursor:pointer; color:#374151; font-weight:500; line-height:1; transition:.18s; }
.sf-tab.active { background:#1f2937; color:#fff; }
.sf-tab:not(.active):hover { background:#e2e8f0; }
.sf-brand { display:flex; align-items:center; gap:.65rem; }
.avatars { display:flex; }
.avatar { width:28px; height:28px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 0 1px #d1d5db; background-size:cover; background-position:center; margin-left:-6px; }
.avatar:first-child { margin-left:0; }
.a1 { background:linear-gradient(135deg,#6366f1,#8b5cf6); }
.a2 { background:linear-gradient(135deg,#10b981,#34d399); }
.a3 { background:linear-gradient(135deg,#f59e0b,#fbbf24); }
.meta { display:flex; flex-direction:column; line-height:1.1; }
.meta .title { font-weight:600; font-size:13px; color:#111827; }
.meta .subtitle { font-size:11px; color:#6b7280; display:flex; align-items:center; gap:4px; }
.status-dot { width:8px; height:8px; border-radius:50%; }
.actions { display:flex; gap:.4rem; }
.theme-btn, .reset-btn { border:none; background:var(--bg-alt); width:38px; height:38px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; color:#334155; transition:.25s; position:relative; }
.theme-btn .icon { width:20px; height:20px; }
.theme-btn:hover, .reset-btn:hover { filter:brightness(.92); }
.theme-btn.light { background:#1f2937; color:#fbbf24; box-shadow:0 0 0 2px #1f2937, 0 0 0 4px #fbbf2433; }
.theme-btn.dark { background:#fbbf24; color:#1f2937; box-shadow:0 0 0 2px #fbbf24, 0 0 0 4px #1f293722; }
.theme-btn:focus-visible { outline:2px solid #2563eb; outline-offset:2px; }
.reset-btn { background:var(--bg-alt); }

.sf-body { flex:1 1 auto; overflow-y:auto; padding:1rem .9rem 1.1rem; display:flex; flex-direction:column; gap:.9rem; scroll-behavior:smooth; }
.row { display:flex; }
.row.user { justify-content:flex-end; }
.row.system { justify-content:center; }
.bubble { max-width:78%; border-radius:18px; padding:.75rem .95rem; position:relative; background:var(--assistant); color:var(--sf-assistant-text,var(--text)); line-height:1.35; white-space:pre-wrap; word-break:break-word; }
.row.user .bubble { background:var(--user); color:var(--user-text); box-shadow:0 2px 6px -1px rgba(37,99,235,.35); }
.row.system .bubble { background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; }
.bubble[data-role='assistant']::after, .row.user .bubble::after { content:''; position:absolute; bottom:-4px; width:14px; height:14px; background:inherit; transform:rotate(45deg); }
.bubble[data-role='assistant']::after { left:18px; }
.row.user .bubble::after { right:18px; }
.streaming { opacity:.8; }
.info { font-size:11px; color:#64748b; }
.error { font-size:12px; color:#dc2626; }
.suggestions { margin-top:.65rem; display:flex; flex-wrap:wrap; gap:.45rem; }
.suggestions button { background:var(--pill-bg); border:1px solid var(--border); padding:.35rem .7rem; border-radius:999px; font-size:11px; cursor:pointer; color:#334155; line-height:1; transition:.18s; }
.suggestions button:hover { background:var(--pill-hover); color:#fff; border-color:var(--pill-hover); }
.sf-helpdesk { padding:1rem .9rem 1.1rem; display:flex; flex-direction:column; gap:.75rem; }
.sf-helpdesk h4 { font-size:13px; margin:0; font-weight:600; }
.articles { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.45rem; }
.articles li { font-size:13px; background:#f8fafc; padding:.55rem .7rem; border:1px solid #e2e8f0; border-radius:12px; }
.hint { font-size:11px; color:#64748b; margin:0; }
.composer { border-top:1px solid var(--border); padding:.55rem .6rem; display:flex; gap:.6rem; background:var(--bg-alt); }
.composer textarea { flex:1; resize:none; border:none; background:var(--sf-input-bg,var(--bg)); color:var(--sf-input-text,var(--text)); caret-color:var(--sf-input-text,var(--text)); padding:.65rem .75rem; border-radius:14px; font:inherit; line-height:1.3; box-shadow:0 1px 3px rgba(0,0,0,.06); outline:none; }
.composer textarea:focus { box-shadow:0 0 0 2px #2563eb40; }
.composer textarea::placeholder { color:var(--sf-input-placeholder,var(--subtle)); }
.send { background:#2563eb; border:none; color:#fff; width:46px; height:46px; border-radius:15px; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px -2px rgba(37,99,235,.4); transition:.2s; }
.send:disabled { opacity:.4; cursor:not-allowed; box-shadow:none; }
.send:not(:disabled):hover { background:#1d4ed8; }
.composer-disabled { text-align:center; font-size:12px; padding:.75rem; color:#64748b; border-top:1px solid var(--border); }
.sf-body::-webkit-scrollbar { width:8px; }
.sf-body::-webkit-scrollbar-track { background:transparent; }
.sf-body::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
.sf-body::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
@media (max-width:520px){ .sf-chat.redesigned { height:100dvh !important; border-radius:0; } .sf-header { border-radius:0; grid-template-columns: 1fr; row-gap:.75rem; } }

/* Dark mode overrides scoped to composant */
.sf-chat.redesigned[data-theme='dark'] { --sf-border:#1e293b; --sf-bg:#0f172a; --sf-bg-alt:#1e293b; --sf-assistant:#1e2533; --sf-assistant-text:#e2e8f0; --sf-user:#2563eb; --sf-user-text:#ffffff; --sf-text:#e2e8f0; --sf-subtle:#94a3b8; --sf-pill-bg:#334155; --sf-pill-hover:#475569; }
.sf-chat.redesigned[data-theme='dark'] .sf-header { background:linear-gradient(135deg,#1e293b,#0f172a); }
.sf-chat.redesigned[data-theme='dark'] .composer { background:var(--sf-bg-alt); }
.sf-chat.redesigned[data-theme='dark'] .mini-select { background:#1e2533; border-color:#334155; color:#e2e8f0; }
.sf-chat.redesigned[data-theme='dark'] .mini-select:focus { outline:2px solid #2563eb77; }
.sf-chat.redesigned[data-theme='dark'] .suggestions button { background:#1e2533; border-color:#334155; color:#cbd5e1; }
.sf-chat.redesigned[data-theme='dark'] .suggestions button:hover { background:#475569; border-color:#475569; color:#fff; }
.sf-chat.redesigned[data-theme='dark'] .theme-btn, .sf-chat.redesigned[data-theme='dark'] .reset-btn { background:#1e2533; color:#e2e8f0; }
.sf-chat.redesigned[data-theme='dark'] .theme-btn:hover, .sf-chat.redesigned[data-theme='dark'] .reset-btn:hover { filter:brightness(1.15); }
</style>