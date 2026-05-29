<template>
  <div class="template-selector">
    <div
      v-for="template in templates"
      :key="template.id"
      :class="['template-item', { active: selected === template.id }]"
      @click="$emit('select', template.id)"
    >
      <div class="template-preview" :class="`preview-${template.id}`">
        <div class="mini-paper">
          <div class="mini-header"></div>
          <div class="mini-line w-60"></div>
          <div class="mini-line w-40"></div>
          <div class="mini-line w-80"></div>
          <div class="mini-line w-50"></div>
        </div>
      </div>
      <div class="template-info">
        <span class="template-name">{{ template.name }}</span>
        <span class="template-desc">{{ template.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  templates: { type: Array, required: true },
  selected: { type: String, required: true }
})
defineEmits(['select'])
</script>

<style scoped>
.template-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.template-item {
  cursor: pointer;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  padding: 10px;
  transition: all 0.25s;
  display: flex;
  gap: 10px;
}

.template-item:hover { border-color: #667eea; }
.template-item.active { border-color: #667eea; background: #f0f2ff; }

.template-preview {
  width: 90px;
  height: 64px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.mini-paper {
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mini-header {
  height: 6px;
  border-radius: 2px;
  margin-bottom: 2px;
}

.mini-line {
  height: 3px;
  border-radius: 1px;
  background: #d0d0d0;
}
.mini-line.w-80 { width: 80%; }
.mini-line.w-60 { width: 60%; }
.mini-line.w-50 { width: 50%; }
.mini-line.w-40 { width: 40%; }

/* 经典商务 */
.preview-classic { background: #fff; }
.preview-classic .mini-header { background: #667eea; width: 100%; }

/* 现代简约 */
.preview-modern { background: #fafbfc; }
.preview-modern .mini-header { background: linear-gradient(135deg, #667eea, #764ba2); width: 100%; }

/* 创意风格 */
.preview-creative { background: #1a1a2e; }
.preview-creative .mini-header { background: linear-gradient(90deg, #667eea, #764ba2, #f093fb); width: 100%; }
.preview-creative .mini-line { background: #444; }

/* 侧栏布局 */
.preview-sidebar { background: #fff; display: flex; gap: 3px; padding: 2px; }
.preview-sidebar .mini-paper { flex-direction: row; gap: 3px; width: 100%; }
.preview-sidebar::before {
  content: '';
  width: 25%;
  background: #2c3e50;
  border-radius: 2px 0 0 2px;
}

/* 时间轴风格 */
.preview-timeline { background: #fff; position: relative; }
.preview-timeline .mini-paper { padding-left: 8px; position: relative; }
.preview-timeline .mini-paper::before {
  content: '';
  position: absolute;
  left: 3px; top: 0; bottom: 0;
  width: 1px;
  background: #667eea;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
}

.template-name {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.template-desc {
  font-size: 10px;
  color: #999;
  line-height: 1.3;
}
</style>
