<template>
  <section id="skills" class="section section-alt">
    <div class="container">
      <h2 class="section-title">专业技能</h2>
      <div class="skills-grid">
        <div v-for="skill in skills" :key="skill.name" class="skill-card">
          <div class="skill-icon">{{ skill.icon }}</div>
          <div class="skill-name">{{ skill.name }}</div>
          <div class="skill-bar">
            <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
          </div>
          <div class="skill-level">{{ skill.level }}%</div>
        </div>
      </div>
    </div>
  </section>

  <section id="projects" class="section">
    <div class="container">
      <h2 class="section-title">项目作品</h2>
      <div class="projects-grid">
        <div v-for="(project, index) in subapp" :key="index" class="project-card">
          <div class="project-header">
            <h3 class="project-title">{{ project.name }}</h3>
            <div class="project-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
          <p class="project-description">{{ project.description }}</p>
          <div @click="handleClick(project)" class="project-link">查看详情 →</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSubappStore } from '@/stores/subapp'

const store = useSubappStore()
const { subapp } = storeToRefs(store)
const route = useRoute()
const router = useRouter()

const activeProject = computed(() => {
  const path = route.path
  return subapp.value.find(app => path.startsWith(app.activeRule)) || null
})

const skills = ref([
  { name: 'Vue.js', level: 90, icon: '🟢' },
  { name: 'React', level: 85, icon: '⚛️' },
  { name: 'TypeScript', level: 88, icon: '📘' },
  { name: 'Micro-Frontend', level: 80, icon: '🔗' },
  { name: 'Node.js', level: 75, icon: '🟢' },
  { name: 'AI/ML', level: 70, icon: '🤖' }
])

const handleClick = (project: any) => {
  router.push(project.activeRule)
}
</script>

<style scoped>
.section {
  padding: 6rem 5%;
}

.section-alt {
  background: rgba(255, 255, 255, 0.05);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: white;
  opacity: 0.8;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.skill-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s;
}

.skill-card:hover {
  transform: translateY(-5px);
}

.skill-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.skill-name {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.skill-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

.skill-level {
  color: white;
  text-align: right;
  font-size: 0.9rem;
  opacity: 0.8;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.project-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-title {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(79, 172, 254, 0.3);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.project-description {
  color: white;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.project-link {
  color: #4facfe;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.3s;
}

.project-link:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding-top: 6rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .avatar-container {
    width: 200px;
    height: 200px;
  }

  .nav-links {
    display: none;
  }
}
</style>