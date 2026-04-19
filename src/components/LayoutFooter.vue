<template>
  <footer class="footer">
    <div class="container">
      <p>&copy; 2026 EverChan. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue'

</script>
<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.footer {
  background: rgba(0, 0, 0, 0.2);
  padding: 2rem 5%;
  text-align: center;
}

.footer p {
  color: white;
  opacity: 0.8;
}
</style>