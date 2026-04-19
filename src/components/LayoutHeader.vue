<script setup lang="ts">
</script>

<template>
  <nav class="navbar">
      <div class="logo">EverChan</div>
      <div class="nav-links">
        <a href="#skills">技能</a>
        <a href="#projects">项目</a>
      </div>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">你好，我是 EverChan</h1>
        <p class="hero-subtitle">前端开发工程师 · AI 技术探索者</p>
        <p class="hero-description">
          专注于构建高性能、可扩展的前端应用，热衷于 AI 技术
        </p>
      </div>
      <div class="hero-image">
        <div class="avatar-container">
          <div class="avatar-ring"></div>
          <div class="avatar">👨‍💻</div>
        </div>
      </div>
    </section>

</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 5%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-links a:hover {
  opacity: 0.8;
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rem 5% 4rem;
  gap: 4rem;
}

.hero-content {
  flex: 1;
  color: white;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.8;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-container {
  position: relative;
  width: 300px;
  height: 300px;
}

.avatar-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
  backdrop-filter: blur(10px);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}
</style>
