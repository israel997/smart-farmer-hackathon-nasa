<script setup>
import HelloWorld from './components/HelloWorld.vue'
import Chatbox from './components/chatbox.vue'
</script>

<template>
  <div class="layout">
    <header class="top">
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
      <h1 class="title">SmartFarmer Demo</h1>
    </header>
    <main class="content">
      <section class="left">
        <HelloWorld msg="Vite + Vue" />
      </section>
      <section class="right">
        <Chatbox />
      </section>
    </main>
  </div>
</template>

<style scoped>
.layout { display: flex; flex-direction: column; gap: 1rem; }
.top { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
.title { font-size:1.25rem; margin-left:auto; }
.content { display:grid; gap:1.5rem; grid-template-columns: 1fr 420px; align-items:start; }
.right { display:flex; justify-content:center; }
.logo { height: 4em; padding: .5em; will-change: filter; transition: filter 300ms; }
.logo:hover { filter: drop-shadow(0 0 2em #646cffaa); }
.logo.vue:hover { filter: drop-shadow(0 0 2em #42b883aa); }
@media (max-width: 960px){
  .content { grid-template-columns: 1fr; }
  .right { order:-1; }
}
</style>
