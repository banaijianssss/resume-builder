<template>
  <template v-if="items.length">
    <div
      v-for="(edu, idx) in items"
      :key="idx"
      :class="itemClass"
    >
      <p v-if="variant === 'classic'">
        <strong>{{ edu.school || '学校' }}</strong>
        <template v-if="edu.major"> | {{ edu.major }}</template>
        <template v-if="edu.degree"> | {{ edu.degree }}</template>
        <span v-if="edu.graduationYear"> | {{ edu.graduationYear }}年毕业</span>
      </p>
      <p v-else-if="variant === 'modern'">
        <strong>{{ edu.school || '学校' }}</strong>
        <template v-if="edu.major"> — {{ edu.major }}</template>
        <template v-if="edu.degree"> · {{ edu.degree }}</template>
        <span v-if="edu.graduationYear"> · {{ edu.graduationYear }}</span>
      </p>
      <p v-else-if="variant === 'creative'">
        <strong>{{ edu.school || '学校' }}</strong>
        <template v-if="edu.major"> — {{ edu.major }}</template>
        <template v-if="edu.degree"> · {{ edu.degree }}</template>
        <span v-if="edu.graduationYear"> · {{ edu.graduationYear }}</span>
      </p>
      <template v-else-if="variant === 'sidebar'">
        <strong>{{ edu.school || '学校' }}</strong><br>
        {{ edu.major }}<template v-if="edu.degree"> · {{ edu.degree }}</template>
        <span v-if="edu.graduationYear"> · {{ edu.graduationYear }}</span>
      </template>
      <template v-else-if="variant === 'timeline'">
        <strong>{{ edu.school || '学校' }}</strong>
        <template v-if="edu.major"> — {{ edu.major }}</template>
        <template v-if="edu.degree"> · {{ edu.degree }}</template>
        <span v-if="edu.graduationYear"> · {{ edu.graduationYear }}</span>
      </template>
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  variant: { type: String, default: 'classic' }
})

const itemClass = computed(() => {
  if (props.variant === 'sidebar') return 'sb-edu-item'
  if (props.variant === 'creative') return 'creative-edu-item'
  return 'edu-item'
})
</script>

<style scoped>
.edu-item + .edu-item,
.creative-edu-item + .creative-edu-item,
.sb-edu-item + .sb-edu-item {
  margin-top: 6px;
}
</style>
