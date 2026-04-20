<script setup lang="ts">
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutMain from '@/components/LayoutMain.vue';
import LayoutFooter from '@/components/LayoutFooter.vue'
import SubappContainer from '@/components/SubappContainer.vue';
import AIChat from '@/components/AIChat.vue'

</script>

<template>
  <div class="home">
    <LayoutHeader />
    <LayoutMain />
    <SubappContainer />
    <AIChat />
    <LayoutFooter />
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>