<script setup lang="ts">
import orderBy from 'lodash/orderBy'

const EXAMPLE_PROMPTS = [
  {
    id    : 'ai-future',
    icon  : '⚡',
    title : 'The Future of Artificial Intelligence in Engineering',
    slides: 5,
    lang  : 'en',
    style : 'professional',
    color : { background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' },
  },
  {
    id    : 'sustainable-materials',
    icon  : '🌍',
    title : 'Sustainable Materials for Construction Projects',
    slides: 5,
    lang  : 'en',
    style : 'traditional',
    color : { background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
  },
  {
    id    : 'project-management',
    icon  : '🎯',
    title : 'Best Practices for Project Management in Engineering',
    slides: 5,
    lang  : 'en',
    style : 'default',
    color : { background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' },
  },
  {
    id    : 'robotics',
    icon  : '🤖',
    title : 'Advancements in Robotics and Automation',
    slides: 5,
    lang  : 'en',
    style : 'professional',
    color : { background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
  },
  {
    id    : 'renewable-energy',
    icon  : '🌱',
    title : 'Innovations in Renewable Energy Technology',
    slides: 5,
    lang  : 'en',
    style : 'default',
    color : { background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
  },
  {
    id    : 'cybersecurity',
    icon  : '🔒',
    title : 'Cybersecurity Challenges in Engineering Systems',
    slides: 5,
    lang  : 'en',
    style : 'professional',
    color : { background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
  },
  {
    id    : 'smart-cities',
    icon  : '🌆',
    title : 'Smart Cities: The Future of Urban Development',
    slides: 5,
    lang  : 'en',
    style : 'traditional',
    color : { background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
  },
  {
    id    : 'quantum-computing',
    icon  : '⚛️',
    title : 'Quantum Computing in Engineering Applications',
    slides: 5,
    lang  : 'en',
    style : 'professional',
    color : { background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' },
  },
  {
    id    : 'biotech',
    icon  : '🧬',
    title : 'Biotechnology Innovations in Engineering',
    slides: 5,
    lang  : 'en',
    style : 'default',
    color : { background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  },
  {
    id    : 'space-tech',
    icon  : '🚀',
    title : 'Space Technology and Engineering Challenges',
    slides: 5,
    lang  : 'en',
    style : 'traditional',
    color : { background: 'rgba(249, 115, 22, 0.1)', color: '#F97316' },
  },
  {
    id    : 'digital-twins',
    icon  : '👥',
    title : 'Digital Twins in Modern Engineering',
    slides: 5,
    lang  : 'en',
    style : 'professional',
    color : { background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' },
  },
  {
    id    : 'materials-science',
    icon  : '⚗️',
    title : 'Advanced Materials Science Breakthroughs',
    slides: 5,
    lang  : 'en',
    style : 'default',
    color : { background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308' },
  },
  {
    id    : 'iot-engineering',
    icon  : '📱',
    title : 'IoT Applications in Engineering',
    slides: 5,
    lang  : 'en',
    style : 'traditional',
    color : { background: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6' },
  },
  {
    id    : 'green-engineering',
    icon  : '♻️',
    title : 'Green Engineering Solutions',
    slides: 5,
    lang  : 'en',
    style : 'professional',
    color : { background: 'rgba(132, 204, 22, 0.1)', color: '#84CC16' },
  },
  {
    id    : 'vr-engineering',
    icon  : '🥽',
    title : 'VR and AR in Engineering Design',
    slides: 5,
    lang  : 'en',
    style : 'traditional',
    color : { background: 'rgba(217, 70, 239, 0.1)', color: '#D946EF' },
  },
  {
    id    : 'machine-learning',
    icon  : '🧠',
    title : 'Machine Learning for Engineering Optimization',
    slides: 5,
    lang  : 'en',
    style : 'default',
    color : { background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E' },
  },
]

const createStore = usePresentationCreate()

const examples = ref(EXAMPLE_PROMPTS.slice(0, 6))

const onShuffle = () => {
  examples.value = orderBy(EXAMPLE_PROMPTS, () => Math.random() - 0.5).slice(0, 6)
}

const onSetting = (e: typeof EXAMPLE_PROMPTS[number]) => {
  createStore.prompt = e.title
  createStore.numSlides = e.slides
  createStore.language = e.lang as keyof typeof createLanguageMap
  createStore.pageStyle = e.style
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex-between-center">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Try these examples
      </h3>

      <UButton
        size="sm"
        variant="outline"
        class="cursor-pointer"
        @click="onShuffle"
      >
        <UIcon name="i-lucide-shuffle" />
        {{ $t('dashboard.shuffle') }}
      </UButton>
    </div>

    <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <UButton
        v-for="e in examples"
        :key="e.id"
        variant="outline"
        class="cursor-pointer flex items-center p-4 text-left transition-all gap-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-primary hover:shadow-sm"
        @click="onSetting(e)"
      >
        <div class="rounded-lg p-2" :style="{ background: e.color.background, color: e.color.color }">
          <span class="text-lg">{{ e.icon }}</span>
        </div>
        <span class="line-clamp-2 flex-1 text-sm font-medium text-card-foreground group-hover:text-accent-foreground">
          {{ e.title }}
        </span>
      </UButton>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
