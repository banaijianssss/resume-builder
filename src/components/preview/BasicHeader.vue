<template>
  <div :class="['basic-header-bar', `basic-header--${template}`]">
    <div class="basic-header-info">
      <h1 :class="nameClass">{{ data.name || '姓名' }}</h1>

      <div v-if="template === 'classic'" class="contact-info">
        <span v-if="data.email">{{ data.email }}</span>
        <span v-if="data.email && data.phone" class="separator">|</span>
        <span v-if="data.phone">{{ data.phone }}</span>
      </div>
      <template v-else>
        <div v-if="data.email" class="basic-contact-line">{{ data.email }}</div>
        <div v-if="data.phone" class="basic-contact-line">{{ data.phone }}</div>
      </template>

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
</script>
