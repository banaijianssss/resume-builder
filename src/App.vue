<template>
  <div class="app-container">
    <header class="app-header">
      <h1>📝 简历编辑器</h1>
      <p class="subtitle">选择模板 → 调整模块顺序 → 编辑内容 → 导出简历</p>
    </header>

    <nav v-if="isMobile" class="mobile-tabs" role="tablist" aria-label="工作区切换">
      <button
        type="button"
        role="tab"
        :aria-selected="mobileTab === 'template'"
        :class="['mobile-tab', { active: mobileTab === 'template' }]"
        @click="mobileTab = 'template'"
      >模板</button>
      <button
        type="button"
        role="tab"
        :aria-selected="mobileTab === 'edit'"
        :class="['mobile-tab', { active: mobileTab === 'edit' }]"
        @click="mobileTab = 'edit'"
      >编辑</button>
      <button
        type="button"
        role="tab"
        :aria-selected="mobileTab === 'preview'"
        :class="['mobile-tab', { active: mobileTab === 'preview' }]"
        @click="mobileTab = 'preview'"
      >预览</button>
    </nav>

    <main class="app-main" :class="{ 'is-mobile': isMobile }">
      <!-- 左侧：模板选择 + 模块排序 -->
      <aside
        v-show="!isMobile || mobileTab === 'template'"
        class="template-panel"
      >
        <h3>选择模板</h3>
        <TemplateSelector
          :templates="templates"
          :selected="selectedTemplate"
          @select="selectTemplate"
        />

        <!-- 模块拖拽排序 -->
        <div class="module-manager">
          <h3>模块排序</h3>
          <p class="module-hint">勾选开启，拖拽调整顺序</p>
          <draggable
            v-model="orderedModuleList"
            item-key="id"
            handle=".drag-handle"
            :animation="200"
            ghost-class="dragging"
            class="module-list"
          >
            <template #item="{ element: mod, index }">
              <div :class="['module-item', { disabled: mod.required }]">
                <span class="drag-handle">⠿</span>
                <el-checkbox
                  v-model="activeModules"
                  :label="mod.id"
                  :disabled="mod.required"
                  size="small"
                >
                  {{ mod.icon }} {{ mod.label }}
                </el-checkbox>
                <div class="reorder-buttons">
                  <button class="reorder-btn" :disabled="index === 0" @click="moveModule(index, -1)" title="上移">▲</button>
                  <button class="reorder-btn" :disabled="index === orderedModuleList.length - 1" @click="moveModule(index, 1)" title="下移">▼</button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- JSON 导入/导出 -->
        <div class="io-actions">
          <el-button size="small" @click="exportJSON">📥 导出数据</el-button>
          <el-button size="small" @click="triggerImport">📤 导入数据</el-button>
          <el-button size="small" type="danger" plain @click="clearData">🗑 清空</el-button>
          <input type="file" ref="fileInput" accept=".json" style="display:none" @change="importJSON">
        </div>
      </aside>

      <!-- 中间：编辑表单 -->
      <section
        v-show="!isMobile || mobileTab === 'edit'"
        class="editor-panel"
      >
        <h3>编辑简历内容</h3>
        <ResumeEditor
          :availableModules="availableModules"
          :activeModules="activeModules"
          :moduleOrder="moduleOrder"
          v-model="resumeData"
        />
      </section>

      <!-- 右侧：实时预览 + 导出 -->
      <section
        v-show="!isMobile || mobileTab === 'preview'"
        class="preview-panel"
      >
        <h3>实时预览</h3>
        <div class="preview-body">
          <ResumePreview
            :template="selectedTemplate"
            :data="resumeData"
            :activeModules="activeModules"
            :moduleOrder="moduleOrder"
            :fontSize="fontSize"
            ref="previewRef"
            @ready="onPreviewReady"
          />
        </div>
        <div class="font-size-control">
          <span class="fs-label">字号</span>
          <input type="range" min="8" max="20" step="0.5" v-model.number="fontSize" class="fs-slider">
          <span class="fs-value">{{ fontSize }}px</span>
        </div>
        <div class="export-actions">
          <el-button type="primary" @click="exportPDF" size="large">📄 快速 PDF</el-button>
          <el-button
            v-if="hdPdfAvailable"
            type="success"
            @click="exportPDFHD"
            size="large"
            title="开发模式下使用 Puppeteer 矢量导出，效果更佳"
          >✨ 高清 PDF</el-button>
          <el-button @click="exportTXT" size="large">📃 导出 TXT</el-button>
          <el-button @click="printResume" size="large">🖨 打印</el-button>
        </div>
        <p class="export-tip">推荐：使用「打印」→ 另存为 PDF，排版最接近预览效果</p>
      </section>
    </main>

    <footer class="app-footer">
      <span>免费使用 · 数据仅存于本机浏览器</span>
      <a href="/privacy.html" target="_blank" rel="noopener">隐私政策</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import TemplateSelector from './components/TemplateSelector.vue'
import ResumeEditor from './components/ResumeEditor.vue'
import ResumePreview from './components/ResumePreview.vue'
import { templates, availableModules, getDefaultActiveModules } from './data/templates.js'
import { useMobileLayout } from './composables/useMobileLayout.js'
import { debounce } from './utils/debounce.js'
import {
  STORAGE_KEY,
  getEmptyResumeData,
  loadState,
  buildPersistedState,
  validateImportState,
  normalizeLoadedState
} from './utils/storage.js'

const { isMobile, mobileTab } = useMobileLayout()

// ===== 数据持久化 =====
function saveStateNow() {
  const state = buildPersistedState({
    resumeData: resumeData.value,
    activeModules: activeModules.value,
    selectedTemplate: selectedTemplate.value,
    moduleOrder: moduleOrder.value,
    fontSize: fontSize.value
  })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    ElMessage.warning('本地存储空间不足，请导出 JSON 备份后删除照片或清空数据')
  }
}

const saveState = debounce(saveStateNow, 400)

function flushSave() {
  saveStateNow()
}

// ===== 初始化状态 =====
const saved = loadState()

const selectedTemplate = ref(saved?.selectedTemplate || 'classic')
const activeModules = ref(saved?.activeModules || getDefaultActiveModules())
const moduleOrder = ref(saved?.moduleOrder || availableModules.map(m => m.id))
const fontSize = ref(saved?.fontSize !== undefined ? saved?.fontSize : 11)

const resumeData = ref(saved?.resumeData || getEmptyResumeData())

// ===== 自动保存（防抖） =====
watch([resumeData, activeModules, selectedTemplate, moduleOrder, fontSize], saveState, { deep: true })

onMounted(() => {
  window.addEventListener('beforeunload', flushSave)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', flushSave)
  flushSave()
})

// ===== 模块排序 =====
const orderedModuleList = computed({
  get: () =>
    moduleOrder.value.map((id) => availableModules.find((m) => m.id === id)).filter(Boolean),
  set: (list) => {
    moduleOrder.value = list.map((m) => m.id)
  }
})

function moveModule(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= moduleOrder.value.length) return
  const arr = [...moduleOrder.value]
  ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
  moduleOrder.value = arr
}

// ===== 模板切换 =====
function selectTemplate(id) { selectedTemplate.value = id }

// ===== JSON 导入导出 =====
function exportJSON() {
  flushSave()
  const state = buildPersistedState({
    resumeData: resumeData.value,
    activeModules: activeModules.value,
    selectedTemplate: selectedTemplate.value,
    moduleOrder: moduleOrder.value,
    fontSize: fontSize.value
  })
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'resume-data.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('数据已导出')
}

const fileInput = ref(null)
function triggerImport() { fileInput.value?.click() }

function importJSON(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const state = JSON.parse(ev.target.result)
      if (!validateImportState(state)) {
        ElMessage.error('JSON 格式不正确，缺少 resumeData 或字段类型错误')
        return
      }
      const normalized = normalizeLoadedState(state)
      resumeData.value = normalized.resumeData
      if (normalized.activeModules) activeModules.value = normalized.activeModules
      if (normalized.selectedTemplate) selectedTemplate.value = normalized.selectedTemplate
      if (normalized.moduleOrder) moduleOrder.value = normalized.moduleOrder
      if (normalized.fontSize !== null) fontSize.value = normalized.fontSize
      flushSave()
      ElMessage.success('数据已导入')
    } catch {
      ElMessage.error('无效的 JSON 文件')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

// ===== PDF/TXT 导出 =====
const previewRef = ref(null)
const hdPdfAvailable = ref(false)

function onPreviewReady({ hdPdf }) {
  hdPdfAvailable.value = !!hdPdf
}

async function exportPDF() {
  if (previewRef.value) await previewRef.value.exportPDF()
}

async function exportPDFHD() {
  if (previewRef.value) await previewRef.value.exportPDFHD()
}
async function exportTXT() {
  if (previewRef.value) previewRef.value.exportTXT()
}

function printResume() {
  window.print()
}

async function clearData() {
  try {
    await ElMessageBox.confirm(
      '将清空所有简历内容并恢复默认模块设置，此操作不可撤销。',
      '清空简历',
      { confirmButtonText: '清空', cancelButtonText: '取消', type: 'warning' }
    )
    resumeData.value = getEmptyResumeData()
    activeModules.value = getDefaultActiveModules()
    moduleOrder.value = availableModules.map((m) => m.id)
    selectedTemplate.value = 'classic'
    fontSize.value = 11
    localStorage.removeItem(STORAGE_KEY)
    ElMessage.success('已清空')
  } catch {
    /* 用户取消 */
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f0f2f5;
}

.app-container {
  min-height: 100vh;
  display: flex; flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; padding: 20px 40px; text-align: center; flex-shrink: 0;
}
.app-header h1 { font-size: 24px; margin-bottom: 4px; }
.app-header .subtitle { font-size: 13px; opacity: 0.85; }

.app-main {
  display: grid;
  grid-template-columns: 260px 1fr 1fr;
  gap: 16px; padding: 16px 24px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.template-panel, .editor-panel, .preview-panel {
  background: #fff; border-radius: 12px; padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: flex; flex-direction: column;
  max-height: calc(100vh - 120px);
  min-height: 0;
}
.template-panel { overflow-y: auto; }
.editor-panel, .preview-panel { overflow: hidden; }

.preview-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

h3 {
  font-size: 15px; margin-bottom: 12px; color: #333;
  border-bottom: 2px solid #667eea; padding-bottom: 8px; flex-shrink: 0;
}

/* 模块排序 */
.module-manager { margin-top: 16px; }
.module-hint { font-size: 11px; color: #999; margin-bottom: 8px; }
.module-list { display: flex; flex-direction: column; gap: 2px; }
.module-item {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 6px; border-radius: 6px; transition: background 0.2s;
  cursor: grab;
}
.module-item:hover { background: #f5f7fa; }
.module-item.disabled { opacity: 0.6; cursor: default; }
.module-item.dragging { opacity: 0.4; background: #e8ebff; }

.drag-handle { color: #ccc; font-size: 14px; cursor: grab; flex-shrink: 0; user-select: none; }
.reorder-buttons { display: flex; gap: 2px; margin-left: auto; flex-shrink: 0; }
.reorder-btn {
  width: 22px; height: 22px; border: 1px solid #ddd; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 10px; color: #666;
  display: flex; align-items: center; justify-content: center;
}
.reorder-btn:hover:not(:disabled) { background: #667eea; color: #fff; border-color: #667eea; }
.reorder-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* JSON 导入导出 */
.io-actions { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 6px; }
.io-actions .el-button { flex: 1 1 calc(50% - 3px); font-size: 12px; min-width: 0; }
.io-actions .el-button:last-child { flex-basis: 100%; }

/* 导出 */
.export-actions {
  margin-top: 12px; display: flex; gap: 8px; align-items: center; justify-content: center; flex-shrink: 0; flex-wrap: wrap;
}
.export-actions .el-button { flex: 1; }

.font-size-control {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: #666; padding: 2px 0;
  justify-content: center;
}
.fs-label { color: #999; }
.fs-slider {
  width: 120px; height: 4px; accent-color: #667eea; cursor: pointer;
}
.fs-value {
  min-width: 28px; color: #667eea; font-weight: 600;
}

.mobile-tabs {
  display: none;
  margin: 0 16px;
  padding: 4px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  gap: 4px;
}
.mobile-tab {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 8px;
  font-size: 14px;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}
.mobile-tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: 600;
}

/* ===== 移动端响应式 ===== */
@media (max-width: 1024px) {
  .mobile-tabs {
    display: flex;
    flex-shrink: 0;
  }

  .app-main {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px 16px;
  }
  .app-main.is-mobile .template-panel,
  .app-main.is-mobile .editor-panel,
  .app-main.is-mobile .preview-panel {
    max-height: min(70vh, calc(100vh - 220px));
  }
  .template-panel, .editor-panel, .preview-panel { max-height: none; }

  .app-header { padding: 14px 20px; }
  .app-header h1 { font-size: 20px; }
}

/* ===== 打印：仅输出简历预览 ===== */
@media print {
  body { background: #fff; }
  .app-header,
  .mobile-tabs,
  .template-panel,
  .editor-panel,
  .preview-panel > h3,
  .font-size-control,
  .export-actions,
  .export-tip { display: none !important; }
  .app-main {
    display: block;
    padding: 0;
    gap: 0;
  }
  .preview-panel {
    max-height: none;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
  .preview-container {
    overflow: visible;
    padding: 0;
    background: #fff;
  }
  .resume-paper {
    box-shadow: none;
    max-width: none;
    width: 100%;
  }
  .page-break { display: none !important; }
  .app-footer { display: none !important; }
}

.export-tip {
  margin-top: 8px;
  font-size: 11px;
  color: #999;
  text-align: center;
  line-height: 1.4;
}

.app-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 20px;
  font-size: 12px;
  color: #888;
  background: #fff;
  border-top: 1px solid #e8e8e8;
}
.app-footer a {
  color: #667eea;
  text-decoration: none;
}
.app-footer a:hover { text-decoration: underline; }
</style>
