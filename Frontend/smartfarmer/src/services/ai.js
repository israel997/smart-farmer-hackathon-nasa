// AI Service: multi-provider dynamic registry
// Usage: import { chatSend, listProviders, listModels, setRuntimeConfig, getRuntimeConfig } from '@/services/ai';
// chatSend(messages) -> {role:'assistant', content}
// Supports providers: mock, groq, openai (extensible)
// Environment keys (optional):
//  VITE_GROQ_API_KEY, VITE_OPENAI_API_KEY
// Runtime selection persisted via localStorage (sf_ai_runtime_v1)

const RUNTIME_STORAGE = 'sf_ai_runtime_v1';

const PROVIDERS = {
  mock: {
    label: 'Simulation',
    available: () => true,
    defaultModel: 'mock-sim',
    models: ['mock-sim'],
    call: mockCall
  },
  groq: {
    label: 'Groq',
    available: () => !!import.meta.env.VITE_GROQ_API_KEY,
    defaultModel: 'llama-3.1-8b-instant',
    models: ['llama-3.1-8b-instant','llama-3.1-70b-versatile','mixtral-8x7b-32768'],
    call: callGroq
  },
  openai: {
    label: 'OpenAI',
    available: () => !!import.meta.env.VITE_OPENAI_API_KEY,
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini','gpt-4o','gpt-4o-mini-translate'],
    call: callOpenAI
  }
};

function loadRuntime(){
  try { const raw = localStorage.getItem(RUNTIME_STORAGE); if(raw) return JSON.parse(raw); } catch(e){}
  // default fallback provider priority: groq > openai > mock
  const provider = PROVIDERS.groq.available() ? 'groq' : (PROVIDERS.openai.available() ? 'openai' : 'mock');
  return { provider, model: PROVIDERS[provider].defaultModel, temperature: 0.7 };
}
function saveRuntime(cfg){ localStorage.setItem(RUNTIME_STORAGE, JSON.stringify(cfg)); }

let runtime = loadRuntime();

export function getRuntimeConfig(){ return { ...runtime }; }
export function setRuntimeConfig(partial){
  runtime = { ...runtime, ...partial };
  // Adjust model if not in list
  const prov = PROVIDERS[runtime.provider] ? runtime.provider : 'mock';
  if(!PROVIDERS[prov].models.includes(runtime.model)) runtime.model = PROVIDERS[prov].defaultModel;
  saveRuntime(runtime);
}
export function listProviders(){
  return Object.entries(PROVIDERS).filter(([k,v])=>v.available()).map(([k,v])=>({ key:k, label:v.label }));
}
export function listModels(providerKey){
  const p = PROVIDERS[providerKey]; if(!p) return [];
  return p.models.map(m=>({ key:m, label:m }));
}

// Public chat call
export async function chatSend(messages, options={}){
  const { provider, model, temperature } = { ...runtime, ...options };
  const prov = PROVIDERS[provider];
  if(!prov || !prov.available()) return await mockReply(messages, '[Provider indisponible – simulation]');
  try {
    return await prov.call(messages, { model, temperature });
  } catch (e){
    console.warn('[AI fallback]', e);
    return await mockReply(messages, '[Erreur provider – simulation]');
  }
}

// --- Provider specific implementations ---
async function callOpenAI(messages, { model, temperature }) {
  const key = import.meta.env.VITE_OPENAI_API_KEY; if(!key) throw new Error('Missing OpenAI key');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${key}` },
    body: JSON.stringify({ model, temperature, messages: mapMessages(messages) })
  });
  if(!res.ok) throw new Error('OpenAI API error');
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim() || '[Réponse vide]';
  return { role:'assistant', content };
}
async function callGroq(messages, { model, temperature }) {
  const key = import.meta.env.VITE_GROQ_API_KEY; if(!key) throw new Error('Missing Groq key');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${key}` },
    body: JSON.stringify({ model, temperature, messages: mapMessages(messages) })
  });
  if(!res.ok) throw new Error('Groq API error');
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim() || '[Réponse vide]';
  return { role:'assistant', content };
}
function mockCall(messages, { model }){ return mockReply(messages); }

function mapMessages(msgs){ return msgs.map(m=>({ role:m.role, content:m.content })); }

function mockReply(messages, prefix){
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const base = lastUser?.content || '...';
  const tips = [
    'Pense à surveiller la tendance sur 7 jours.',
    'Une pluie > 10 mm peut retarder l\'irrigation.',
    'Combine données locales et prévisions pour optimiser.',
    'Les sols sablonneux drainent plus vite: ajuster l\'apport en eau.'
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return new Promise(resolve => {
    setTimeout(()=> resolve({ role:'assistant', content:`${prefix?prefix+' ':''}Simulation IA: « ${base.slice(0,80)} » — ${tip}` }), 350 + Math.random()*450);
  });
}

// Streaming simulation identical
export function streamMockResponse(text, cb){
  const words = text.split(/\s+/); let i=0; return new Promise(r=>{ const it=setInterval(()=>{ cb(words.slice(0,i+1).join(' ')); i++; if(i>=words.length){clearInterval(it); r();}},70);});
}
