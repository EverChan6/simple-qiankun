<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')
</script>

<template>
  <header class="header">
    <div class="left">
      <img class="avatar" src="https://via.placeholder.com/40" />
      <div>
        <div class="name">EverChan</div>
        <div class="desc">Frontend Engineer · Vue · Micro-Frontend · AI</div>
      </div>
    </div>
    <div class="right">
      <input v-model="keyword" placeholder="Search project..." />
    </div>
  </header>
</template>

<style scoped></style>
