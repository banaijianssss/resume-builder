<template>
  <template v-for="(sec, idx) in sections" :key="sec.id || idx">
    <template v-if="sec.title?.trim() || sec.content?.trim()">
      <div v-if="variant === 'classic'" class="custom-block">
        <h2 v-if="sec.title?.trim()" class="section-title">{{ sec.title }}</h2>
        <p class="pre-wrap section-content">{{ sec.content }}</p>
      </div>
      <div v-else-if="variant === 'modern'" class="custom-block">
        <h3 class="modern-title">{{ sec.title || '其他' }}</h3>
        <p class="pre-wrap modern-content">{{ sec.content }}</p>
      </div>
      <div v-else-if="variant === 'creative'" class="creative-section custom-block">
        <h3>{{ sec.title || 'OTHER' }} <span>其他</span></h3>
        <p class="pre-wrap creative-exp-desc">{{ sec.content }}</p>
      </div>
      <div v-else-if="variant === 'sidebar'" class="sb-section custom-block">
        <div class="sb-stitle">{{ sec.title || '其他' }}</div>
        <p class="pre-wrap sb-edesc">{{ sec.content }}</p>
      </div>
      <div v-else-if="variant === 'timeline'" class="tl-item custom-block">
        <div class="tl-dot accent"></div>
        <div class="tl-tag">{{ sec.title || '其他' }}</div>
        <div class="tl-card"><p class="pre-wrap">{{ sec.content }}</p></div>
      </div>
    </template>
  </template>
</template>

<script setup>
defineProps({
  sections: { type: Array, default: () => [] },
  variant: { type: String, default: 'classic' }
})
</script>

<style scoped>
.custom-block + .custom-block {
  margin-top: 8px;
}
</style>
