<template>
  <div :class="['basic-header-bar', `basic-header--${template}`]">
    <div class="basic-header-info">
      <h1 :class="nameClass">{{ data.name || '姓名' }}</h1>

      <div v-if="template === 'classic'" class="contact-info">
        <span v-for="(line, i) in contactLines" :key="'c' + i">
          <span v-if="i > 0" class="separator">|</span>{{ line }}
        </span>
      </div>
      <template v-else>
        <div v-for="(line, i) in contactLines" :key="'c' + i" class="basic-contact-line">{{ line }}</div>
      </template>

      <div v-if="linkLines.length" :class="linkClass">
        <span v-for="(link, i) in linkLines" :key="'l' + i">
          <span v-if="i > 0 && template === 'classic'" class="separator">|</span>
          {{ link }}
        </span>
      </div>

      <p v-if="data.objective" :class="objectiveClass">{{ data.objective }}</p>
    </div>
    <div v-if="data.avatar" class="basic-header-photo">
      <img :src="data.avatar" class="basic-header-photo-img" alt="照片">
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  template: { type: String, required: true },
  data: { type: Object, required: true }
})

const contactLines = computed(() =>
  [props.data.email, props.data.phone].filter((x) => x?.trim())
)

const linkLines = computed(() =>
  [
    props.data.github?.trim() ? `GitHub: ${props.data.github.trim()}` : '',
    props.data.portfolio?.trim() ? `主页: ${props.data.portfolio.trim()}` : '',
    props.data.linkedin?.trim() ? `LinkedIn: ${props.data.linkedin.trim()}` : ''
  ].filter(Boolean)
)

const nameClass = computed(() => {
  if (props.template === 'creative') return 'creative-name'
  if (props.template === 'timeline') return 'tl-name'
  return 'name'
})

const objectiveClass = computed(() => {
  if (props.template === 'creative') return 'creative-obj'
  if (props.template === 'timeline') return 'tl-obj'
  if (props.template === 'classic') return 'objective'
  return 'objective'
})

const linkClass = computed(() => {
  if (props.template === 'classic') return 'contact-info links-line'
  return 'basic-contact-line links-line'
})
</script>

<style scoped>
.links-line {
  opacity: 0.92;
  font-size: 0.95em;
}
</style>
