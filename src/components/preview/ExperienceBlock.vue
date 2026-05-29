<template>
  <!-- classic -->
  <template v-if="variant === 'classic'">
    <div v-for="(item, index) in items" :key="index" class="exp-item">
      <div class="exp-header">
        <strong>{{ item[primaryKey] }}</strong>
        <span class="period">{{ item.period }}</span>
      </div>
      <div class="exp-role">{{ item.role }}</div>
      <div class="exp-desc">{{ item.description }}</div>
    </div>
  </template>

  <!-- modern -->
  <template v-else-if="variant === 'modern'">
    <div v-for="(item, index) in items" :key="index" class="modern-exp">
      <div class="exp-top">
        <strong>{{ item[primaryKey] }}</strong>
        <span class="period">{{ item.period }}</span>
      </div>
      <div class="exp-role">{{ item.role }}</div>
      <div class="exp-desc">{{ item.description }}</div>
    </div>
  </template>

  <!-- creative -->
  <template v-else-if="variant === 'creative'">
    <div v-for="(item, index) in items" :key="index" class="creative-exp">
      <strong>{{ item[primaryKey] }}</strong> — {{ item.role }}
      <span class="period">{{ item.period }}</span>
      <div class="creative-exp-desc">{{ item.description }}</div>
    </div>
  </template>

  <!-- sidebar -->
  <template v-else-if="variant === 'sidebar'">
    <div v-for="(item, index) in items" :key="index" class="sb-exp">
      <div class="sb-ehead">
        <strong>{{ item[primaryKey] }}</strong>
        <span class="period">{{ item.period }}</span>
      </div>
      <div class="sb-erole">{{ item.role }}</div>
      <div class="sb-edesc">{{ item.description }}</div>
    </div>
  </template>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  primaryKey: { type: String, required: true },
  variant: { type: String, required: true }
})
</script>
