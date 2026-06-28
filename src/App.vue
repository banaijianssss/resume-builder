<template>
  <div class="app-container">
    <header class="app-header">
      <h1>📝 简历编辑器</h1>
      <p class="subtitle">选择模板 → 调整模块顺序 → 编辑内容 → 导出简历</p>
      <div class="toolbar">
        <el-button size="small" :disabled="!canUndo" @click="doUndo">↶ 撤销</el-button>
        <el-button size="small" :disabled="!canRedo" @click="doRedo">↷ 重做</el-button>
        <el-button size="small" @click="loadSample">📋 示例简历</el-button>
        <el-button size="small" @click="copyShareLink">🔗 分享链接</el-button>
        <el-button size="small" @click="saveCloudSync">☁️ 云备份</el-button>
        <el-button size="small" @click="loadCloudSync">☁️ 云恢复</el-button>
        <el-button size="small" type="warning" @click="openUpgradeDialog('header_cta')">🚀 升级 Pro</el-button>
        <span class="save-status" :class="saveStatus">{{ saveStatusText }}</span>
      </div>
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
        :aria-selected="mobileTab === 'cover'"
        :class="['mobile-tab', { active: mobileTab === 'cover' }]"
        @click="mobileTab = 'cover'"
      >求职信</button>
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
        <div class="profile-bar">
          <el-select v-model="activeProfileId" size="small" style="flex:1" @change="switchProfile">
            <el-option
              v-for="p in profileList"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
          <el-button size="small" @click="addProfile">+</el-button>
          <el-button size="small" :disabled="profileList.length <= 1" @click="removeProfile">−</el-button>
        </div>
        <TemplateSelector
          :templates="templates"
          :selected="selectedTemplate"
          :locked-ids="lockedTemplateIds"
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
                  :model-value="activeModules.includes(mod.id)"
                  :disabled="mod.required"
                  size="small"
                  @change="(checked) => setModuleActive(mod.id, checked)"
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
        v-show="!isMobile || mobileTab === 'edit' || mobileTab === 'cover'"
        class="editor-panel"
      >
        <h3>{{ mobileTab === 'cover' && isMobile ? '编辑求职信' : '编辑简历内容' }}</h3>
        <div v-if="!isMobile || mobileTab === 'edit'" class="jd-panel">
          <p class="jd-label">岗位 JD 关键词匹配（可选）</p>
          <el-input
            v-model="jdText"
            type="textarea"
            :rows="2"
            placeholder="粘贴招聘描述，将高亮已匹配的技能标签"
          />
          <p v-if="jdText.trim() && resumeData.skills?.length" class="jd-result">
            已匹配 {{ jdMatch.matched.length }} 项
            <span v-if="jdMatch.missing.length">，未出现 {{ jdMatch.missing.slice(0, 5).join('、') }}{{ jdMatch.missing.length > 5 ? '…' : '' }}</span>
          </p>
        </div>
        <div v-if="!isMobile || mobileTab === 'edit'" class="health-panel">
          <div class="health-head">
            <div>
              <p class="health-kicker">简历健康分</p>
              <div class="health-score">
                <strong>{{ resumeHealth.score }}</strong>
                <span>/100 · {{ resumeHealth.grade }}</span>
              </div>
            </div>
            <el-progress
              type="circle"
              :width="64"
              :stroke-width="7"
              :percentage="resumeHealth.score"
              :status="resumeHealth.progressStatus"
            />
          </div>
          <p class="health-summary">{{ resumeHealth.summary }}</p>
          <div class="health-checks">
            <span
              v-for="check in resumeHealth.checks"
              :key="check.id"
              :class="['health-check', check.status]"
              :title="check.detail"
            >
              {{ check.label }} {{ check.points }}/{{ check.max }}
            </span>
          </div>
          <ul v-if="resumeHealth.quickWins.length" class="health-wins">
            <li v-for="win in resumeHealth.quickWins" :key="win">{{ win }}</li>
          </ul>
          <div class="ai-actions">
            <el-button
              size="small"
              :loading="aiPending"
              @click="isPro ? runGenerateSummary() : openUpgradeDialog('ai_summary')"
            >✨ AI 求职摘要</el-button>
            <el-button
              size="small"
              :loading="aiPending"
              @click="isPro ? runGenerateInterview() : openUpgradeDialog('ai_interview')"
            >🎯 AI 面试题</el-button>
          </div>
        </div>
        <ApplicationTracker
          v-if="!isMobile || mobileTab === 'edit'"
          :default-jd-text="jdText"
        />
        <div v-if="!isMobile || mobileTab === 'edit'" class="editor-pane">
          <ResumeEditor
            :availableModules="availableModules"
            :activeModules="activeModules"
            :moduleOrder="moduleOrder"
            v-model="resumeData"
            :highlighted-skills="highlightedSkillSet"
          />
        </div>
        <div v-if="!isMobile || mobileTab === 'cover'" class="editor-pane">
          <h3 class="pane-title">求职信</h3>
          <CoverLetterEditor v-model="coverLetter" :resume-name="resumeData.name" />
        </div>
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
            :layout="layout"
            ref="previewRef"
            @ready="onPreviewReady"
          />
        </div>
        <div class="layout-controls">
          <div class="layout-row">
            <span class="fs-label">字号</span>
            <input type="range" min="8" max="20" step="0.5" v-model.number="fontSize" class="fs-slider">
            <span class="fs-value">{{ fontSize }}px</span>
          </div>
          <div class="layout-row">
            <span class="fs-label">行距</span>
            <input type="range" min="1.2" max="2" step="0.05" v-model.number="layout.lineHeight" class="fs-slider">
            <span class="fs-value">{{ layout.lineHeight }}</span>
          </div>
          <div class="layout-row">
            <span class="fs-label">边距</span>
            <input type="range" min="4" max="16" step="1" v-model.number="layout.paperPaddingMm" class="fs-slider">
            <span class="fs-value">{{ layout.paperPaddingMm }}mm</span>
          </div>
          <div class="layout-row theme-row">
            <span class="fs-label">主题色</span>
            <input type="color" v-model="layout.themeColor" class="color-input">
          </div>
        </div>
        <div class="export-actions">
          <el-button type="primary" @click="exportPDF" size="large">📄 快速 PDF</el-button>
          <el-button
            :type="isPro ? 'success' : 'warning'"
            @click="isPro ? exportPDFHD() : openUpgradeDialog('hd_pdf_button')"
            size="large"
            title="开发模式下使用 Puppeteer 矢量导出，效果更佳"
          >✨ 高清 PDF{{ isPro ? '' : '（Pro）' }}</el-button>
          <el-button @click="exportTXT" size="large">📃 导出 TXT</el-button>
          <el-button
            :type="isPro ? 'success' : 'warning'"
            @click="isPro ? exportDocx() : openUpgradeDialog('docx_export')"
            size="large"
          >📝 Word{{ isPro ? '' : '（Pro）' }}</el-button>
          <el-button @click="exportCoverLetterTxt" size="large">✉️ 求职信 TXT</el-button>
          <el-button
            v-if="isPro"
            @click="exportCoverLetterDocx"
            size="large"
          >✉️ 求职信 Word</el-button>
          <el-button @click="copyText" size="large">📋 复制文本</el-button>
          <el-button @click="showAtsPreview = true" size="large">👁 ATS 预览</el-button>
          <el-button @click="openPrintPreview" size="large">🖨 打印预览</el-button>
          <el-button @click="printResume" size="large">🖨 直接打印</el-button>
        </div>
        <p class="export-tip">推荐：打印预览 → 另存为 PDF，排版最接近预览；快速 PDF 适合草稿</p>
        <div v-if="!isPro" class="pro-upsell">
          <p>免费版：最多 {{ freeProfileLimit }} 份简历档案，部分模板与高清 PDF 仅 Pro 可用。</p>
          <el-button type="warning" size="small" @click="openUpgradeDialog('sidebar_upsell')">立即升级 Pro</el-button>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <span>免费使用 · 数据仅存于本机浏览器 · 请定期「导出数据」备份</span>
      <a href="/privacy.html" target="_blank" rel="noopener">隐私政策</a>
    </footer>

    <el-dialog v-model="showInterviewDialog" title="AI 面试题预测" width="640px">
      <ol class="interview-list">
        <li v-for="(q, i) in interviewQuestions" :key="i">{{ q }}</li>
      </ol>
      <template #footer>
        <el-button type="primary" @click="showInterviewDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAtsPreview" title="ATS 纯文本预览" width="90%" top="5vh">
      <pre class="ats-pre">{{ atsPreviewText }}</pre>
      <template #footer>
        <el-button @click="copyText">复制到剪贴板</el-button>
        <el-button type="primary" @click="showAtsPreview = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPrintPreview" title="打印预览" width="95%" top="2vh" class="print-dialog">
      <div class="print-preview-wrap">
        <ResumePreview
          v-if="showPrintPreview"
          :template="selectedTemplate"
          :data="resumeData"
          :active-modules="activeModules"
          :module-order="moduleOrder"
          :font-size="fontSize"
          :layout="layout"
        />
      </div>
      <template #footer>
        <el-button type="primary" @click="printResume">打印 / 另存为 PDF</el-button>
        <el-button @click="showPrintPreview = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showUpgradeDialog" title="升级 Pro（可商用）" width="520px">
      <div class="upgrade-content">
        <p>解锁全部模板、高清 PDF 导出、多档案管理与后续增值功能，适合你上线收费运营。</p>
        <ul>
          <li>✅ 解锁 5 套模板（含创意 / 侧栏 / 时间轴）</li>
          <li>✅ 高清 PDF / Word 导出（更适合交付客户）</li>
          <li>✅ 求职信编辑、分享链接与多档案管理</li>
          <li>✅ 去除免费版使用限制</li>
        </ul>
        <p v-if="subscriptionBilling" class="billing-hint">
          当前为订阅模式：{{ subscriptionTrialDays }} 天试用后自动续费，可随时取消。
        </p>
      </div>
      <template #footer>
        <el-button @click="showUpgradeDialog = false">稍后再说</el-button>
        <el-button type="primary" @click="goCheckout">去支付升级</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import TemplateSelector from './components/TemplateSelector.vue'
import ResumeEditor from './components/ResumeEditor.vue'
import ResumePreview from './components/ResumePreview.vue'
import CoverLetterEditor from './components/CoverLetterEditor.vue'
import ApplicationTracker from './components/ApplicationTracker.vue'
import { templates, availableModules, getDefaultActiveModules } from './data/templates.js'
import { sampleResumeState } from './data/sampleResume.js'
import { useMobileLayout } from './composables/useMobileLayout.js'
import { useUndoRedo } from './composables/useUndoRedo.js'
import { debounce } from './utils/debounce.js'
import { matchSkillsToJd } from './utils/keywordMatch.js'
import { getResumeHealth } from './utils/resumeScore.js'
import {
  STORAGE_KEY,
  BACKUP_HINT_KEY,
  getEmptyResumeData,
  getDefaultLayout,
  loadAppState,
  buildPersistedAppState,
  profileToExportShape,
  validateImportState,
  importToAppState,
  migrateResumeData
} from './utils/storage.js'
import {
  getResumeChecklist,
  formatChecklistMessage
} from './utils/resumeValidation.js'
import { buildResumeText } from './utils/resumeToText.js'
import { trackEvent } from './utils/analytics.js'
import {
  proEnabled,
  freeProfileLimit,
  contactUrl,
  isTemplateLocked,
  getLockedTemplateIds,
  isSubscriptionBilling,
  subscriptionTrialDays
} from './utils/monetization.js'
import { getEmptyCoverLetter, buildCoverLetterText } from './utils/coverLetter.js'
import { buildShareUrl } from './utils/shareResume.js'
import { saveToCloud, loadFromCloud } from './utils/cloudSync.js'
import { exportResumeDocx, exportCoverLetterDocx as exportCoverLetterDocxFile } from './utils/exportDocx.js'
import { generateInterviewQuestions, generateProfessionalSummary } from './utils/aiGenerate.js'
import {
  verifyStoredProToken,
  activateProFromUrlIfNeeded,
  createCheckoutSession
} from './utils/proAccess.js'

const { isMobile, mobileTab } = useMobileLayout()

function createProfile(id, name, seed = {}) {
  return {
    id,
    name,
    resumeData: migrateResumeData(seed.resumeData || getEmptyResumeData()),
    coverLetter: { ...getEmptyCoverLetter(), ...(seed.coverLetter || {}) },
    activeModules: seed.activeModules || getDefaultActiveModules(),
    selectedTemplate: seed.selectedTemplate || 'classic',
    moduleOrder: seed.moduleOrder || availableModules.map((m) => m.id),
    fontSize: seed.fontSize ?? 11,
    layout: { ...getDefaultLayout(), ...(seed.layout || {}) }
  }
}

const loaded = loadAppState()
const profiles = ref(
  loaded?.profiles || { default: createProfile('default', '默认简历') }
)
const activeProfileId = ref(loaded?.activeProfileId || 'default')

const selectedTemplate = ref('classic')
const activeModules = ref(getDefaultActiveModules())
const moduleOrder = ref(availableModules.map((m) => m.id))
const fontSize = ref(11)
const layout = ref(getDefaultLayout())
const resumeData = ref(getEmptyResumeData())
const coverLetter = ref(getEmptyCoverLetter())
const subscriptionBilling = isSubscriptionBilling()

const saveStatus = ref('saved')
const jdText = ref('')
const showAtsPreview = ref(false)
const showPrintPreview = ref(false)
const showUpgradeDialog = ref(false)
const showInterviewDialog = ref(false)
const interviewQuestions = ref([])
const aiPending = ref(false)
const previewRef = ref(null)
const hdPdfAvailable = ref(false)
const fileInput = ref(null)
const upgradeSource = ref('unknown')
const isPro = ref(proEnabled)
const lockedTemplateIds = computed(() => getLockedTemplateIds(isPro.value))

const profileList = computed(() =>
  Object.values(profiles.value).map((p) => ({ id: p.id, name: p.name }))
)

const saveStatusText = computed(() => {
  if (saveStatus.value === 'saving') return '保存中…'
  if (saveStatus.value === 'dirty') return '未保存'
  return '已保存'
})

const jdMatch = computed(() => matchSkillsToJd(jdText.value, resumeData.value.skills || []))

const highlightedSkillSet = computed(() => new Set(jdMatch.value.matched))

const resumeHealth = computed(() =>
  getResumeHealth({
    data: resumeData.value,
    activeModules: activeModules.value,
    moduleOrder: moduleOrder.value,
    jdText: jdText.value
  })
)

const atsPreviewText = computed(() =>
  buildResumeText(resumeData.value, activeModules.value, moduleOrder.value)
)

function snapshotUi() {
  return {
    resumeData: JSON.parse(JSON.stringify(resumeData.value)),
    coverLetter: JSON.parse(JSON.stringify(coverLetter.value)),
    activeModules: [...activeModules.value],
    selectedTemplate: selectedTemplate.value,
    moduleOrder: [...moduleOrder.value],
    fontSize: fontSize.value,
    layout: { ...layout.value }
  }
}

function applySnapshot(snap) {
  resumeData.value = migrateResumeData(snap.resumeData)
  coverLetter.value = { ...getEmptyCoverLetter(), ...(snap.coverLetter || {}) }
  activeModules.value = snap.activeModules
  selectedTemplate.value = snap.selectedTemplate
  moduleOrder.value = snap.moduleOrder
  fontSize.value = snap.fontSize
  layout.value = { ...getDefaultLayout(), ...snap.layout }
}

const { canUndo, canRedo, record, undo, redo, clearHistory, pauseRecording } = useUndoRedo(
  snapshotUi,
  applySnapshot
)

function syncProfileFromUi() {
  const cur = profiles.value[activeProfileId.value]
  if (!cur) return
  profiles.value[activeProfileId.value] = {
    ...cur,
    resumeData: resumeData.value,
    coverLetter: coverLetter.value,
    activeModules: activeModules.value,
    selectedTemplate: selectedTemplate.value,
    moduleOrder: moduleOrder.value,
    fontSize: fontSize.value,
    layout: { ...layout.value }
  }
}

function applyProfileToUi(p) {
  resumeData.value = migrateResumeData(p.resumeData)
  coverLetter.value = { ...getEmptyCoverLetter(), ...(p.coverLetter || {}) }
  activeModules.value = p.activeModules || getDefaultActiveModules()
  selectedTemplate.value = p.selectedTemplate || 'classic'
  moduleOrder.value = p.moduleOrder || availableModules.map((m) => m.id)
  fontSize.value = p.fontSize ?? 11
  layout.value = { ...getDefaultLayout(), ...(p.layout || {}) }
}

function loadActiveProfile() {
  const p = profiles.value[activeProfileId.value]
  if (p) applyProfileToUi(p)
}

loadActiveProfile()

function saveStateNow() {
  syncProfileFromUi()
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        buildPersistedAppState({
          activeProfileId: activeProfileId.value,
          profiles: profiles.value
        })
      )
    )
    saveStatus.value = 'saved'
  } catch {
    saveStatus.value = 'dirty'
    ElMessage.warning('本地存储空间不足，请导出 JSON 备份后删除照片或清空数据')
  }
}

const saveState = debounce(() => {
  saveStatus.value = 'saving'
  saveStateNow()
}, 400)

function flushSave() {
  saveStateNow()
}

function markDirty() {
  if (saveStatus.value === 'saved') saveStatus.value = 'dirty'
}

const recordDebounced = debounce(record, 500)

watch(
  [resumeData, coverLetter, activeModules, selectedTemplate, moduleOrder, fontSize, layout],
  () => {
    markDirty()
    saveState()
    recordDebounced()
  },
  { deep: true }
)

onMounted(async () => {
  const activated = await activateProFromUrlIfNeeded()
  if (activated.activated) {
    isPro.value = true
    ElMessage.success('支付成功，Pro 已解锁')
  } else {
    const verified = await verifyStoredProToken()
    isPro.value = proEnabled || verified.isPro
  }
  if (isTemplateLocked(selectedTemplate.value, isPro.value)) {
    selectedTemplate.value = 'classic'
  }

  clearHistory()
  record()
  window.addEventListener('beforeunload', flushSave)
  if (!localStorage.getItem(BACKUP_HINT_KEY)) {
    localStorage.setItem(BACKUP_HINT_KEY, '1')
    ElMessage.info({
      message: '数据仅保存在本机浏览器，建议定期使用「导出数据」备份',
      duration: 5000
    })
  }
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

function setModuleActive(moduleId, checked) {
  const mod = availableModules.find((item) => item.id === moduleId)
  if (mod?.required) return
  const next = new Set(activeModules.value)
  if (checked) next.add(moduleId)
  else next.delete(moduleId)
  activeModules.value = availableModules
    .map((item) => item.id)
    .filter((id) => next.has(id))
}

// ===== 模板切换 =====
function selectTemplate(id) {
  if (isTemplateLocked(id, isPro.value)) {
    openUpgradeDialog('select_locked_template')
    return
  }
  selectedTemplate.value = id
}

// ===== JSON 导入导出 =====
function switchProfile(id) {
  flushSave()
  syncProfileFromUi()
  activeProfileId.value = id
  loadActiveProfile()
  clearHistory()
  record()
}

function addProfile() {
  if (!isPro.value && Object.keys(profiles.value).length >= freeProfileLimit) {
    ElMessage.warning(`免费版最多创建 ${freeProfileLimit} 份简历，请升级 Pro 解锁`)
    openUpgradeDialog('profile_limit')
    return
  }
  const id = `p-${Date.now()}`
  profiles.value[id] = createProfile(id, `简历 ${Object.keys(profiles.value).length + 1}`)
  activeProfileId.value = id
  loadActiveProfile()
  clearHistory()
  record()
  ElMessage.success('已新建简历')
}

async function removeProfile() {
  if (Object.keys(profiles.value).length <= 1) return
  try {
    await ElMessageBox.confirm('删除当前简历档案？', '确认', { type: 'warning' })
    const id = activeProfileId.value
    delete profiles.value[id]
    activeProfileId.value = Object.keys(profiles.value)[0]
    loadActiveProfile()
    flushSave()
    clearHistory()
    record()
    ElMessage.success('已删除')
  } catch {
    /* cancel */
  }
}

function doUndo() {
  if (undo()) ElMessage.success('已撤销')
}

function doRedo() {
  if (redo()) ElMessage.success('已重做')
}

function loadSample() {
  pauseRecording(() => {
    applySnapshot({
      resumeData: migrateResumeData(sampleResumeState.resumeData),
      activeModules: sampleResumeState.activeModules,
      selectedTemplate: sampleResumeState.selectedTemplate,
      moduleOrder: sampleResumeState.moduleOrder,
      fontSize: sampleResumeState.fontSize,
      layout: { ...getDefaultLayout(), ...sampleResumeState.layout }
    })
    if (!activeModules.value.includes('custom')) {
      activeModules.value = [...activeModules.value, 'custom']
    }
  })
  record()
  ElMessage.success('已加载示例简历')
}

async function runExportGuard(action) {
  const check = getResumeChecklist(resumeData.value, activeModules.value)
  if (check.issues.length || check.warnings.length) {
    const msg = formatChecklistMessage(check)
    try {
      await ElMessageBox.confirm(
        `${msg}\n\n是否仍要继续导出？`,
        '导出前检查',
        { confirmButtonText: '继续导出', cancelButtonText: '返回修改', type: 'warning' }
      )
    } catch {
      return
    }
  }
  await action()
}

function exportJSON() {
  flushSave()
  const state = profileToExportShape({
    resumeData: resumeData.value,
    activeModules: activeModules.value,
    selectedTemplate: selectedTemplate.value,
    moduleOrder: moduleOrder.value,
    fontSize: fontSize.value,
    layout: layout.value
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

function triggerImport() { fileInput.value?.click() }

async function importJSON(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result)
      if (!validateImportState(parsed)) {
        ElMessage.error('JSON 格式不正确，缺少 resumeData 或字段类型错误')
        return
      }
      const name = resumeData.value.name?.trim() || '当前简历'
      try {
        await ElMessageBox.confirm(
          `将用导入文件覆盖「${name}」的内容，是否继续？`,
          '导入确认',
          { type: 'warning' }
        )
      } catch {
        return
      }
      const app = importToAppState(parsed)
      const p = app.profiles[app.activeProfileId]
      pauseRecording(() => applyProfileToUi(p))
      profiles.value[activeProfileId.value] = { ...profiles.value[activeProfileId.value], ...p }
      flushSave()
      clearHistory()
      record()
      ElMessage.success('数据已导入')
    } catch {
      ElMessage.error('无效的 JSON 文件')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function onPreviewReady({ hdPdf }) {
  hdPdfAvailable.value = !!hdPdf
}

async function exportPDF() {
  trackEvent('export_pdf_click', { plan: isPro.value ? 'pro' : 'free' })
  await runExportGuard(async () => {
    if (previewRef.value) await previewRef.value.exportPDF()
  })
}

async function exportPDFHD() {
  trackEvent('export_hd_pdf_click', { plan: isPro.value ? 'pro' : 'free' })
  await runExportGuard(async () => {
    if (previewRef.value) await previewRef.value.exportPDFHD()
  })
}

async function exportTXT() {
  await runExportGuard(async () => {
    if (previewRef.value) previewRef.value.exportTXT()
  })
}

async function copyText() {
  if (previewRef.value) await previewRef.value.copyPlainText()
}

function openPrintPreview() {
  showPrintPreview.value = true
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
    pauseRecording(() => {
      resumeData.value = getEmptyResumeData()
      activeModules.value = getDefaultActiveModules()
      moduleOrder.value = availableModules.map((m) => m.id)
      selectedTemplate.value = 'classic'
      fontSize.value = 11
      layout.value = getDefaultLayout()
    })
    flushSave()
    clearHistory()
    record()
    ElMessage.success('已清空')
  } catch {
    /* 用户取消 */
  }
}

function openUpgradeDialog(source = 'unknown') {
  upgradeSource.value = source
  showUpgradeDialog.value = true
  trackEvent('upgrade_dialog_open', { source, plan: isPro.value ? 'pro' : 'free' })
}

async function saveCloudSync() {
  syncProfileFromUi()
  const payload = buildPersistedAppState({
    activeProfileId: activeProfileId.value,
    profiles: profiles.value
  })
  const syncCode = localStorage.getItem('resume-builder-sync-code') || ''
  const { ok, data } = await saveToCloud(payload, syncCode || undefined)
  if (!ok) {
    ElMessage.warning(data?.error || '云备份失败，请配置 UPSTASH_REDIS')
    return
  }
  localStorage.setItem('resume-builder-sync-code', data.syncCode)
  await navigator.clipboard.writeText(data.syncCode)
  ElMessage.success(`云备份成功，同步码已复制：${data.syncCode}`)
}

async function loadCloudSync() {
  try {
    const { value } = await ElMessageBox.prompt('请输入云同步码', '从云端恢复', {
      inputValue: localStorage.getItem('resume-builder-sync-code') || ''
    })
    const { ok, data } = await loadFromCloud(value.trim())
    if (!ok || !data.payload) {
      ElMessage.error(data?.error || '恢复失败')
      return
    }
    const imported = importToAppState(data.payload)
    if (!imported) {
      ElMessage.error('云端数据格式无效')
      return
    }
    profiles.value = imported.profiles
    activeProfileId.value = imported.activeProfileId
    loadActiveProfile()
    localStorage.setItem('resume-builder-sync-code', value.trim())
    ElMessage.success('已从云端恢复简历数据')
  } catch {
    /* cancelled */
  }
}

async function runGenerateSummary() {
  aiPending.value = true
  try {
    const text = await generateProfessionalSummary(resumeData.value)
    resumeData.value = { ...resumeData.value, objective: text }
    ElMessage.success('已生成求职摘要并填入「求职意向」')
  } catch (e) {
    ElMessage.error(e.message || '生成失败')
  } finally {
    aiPending.value = false
  }
}

async function runGenerateInterview() {
  aiPending.value = true
  try {
    interviewQuestions.value = await generateInterviewQuestions({
      resumeData: resumeData.value,
      jdText: jdText.value
    })
    showInterviewDialog.value = true
  } catch (e) {
    ElMessage.error(e.message || '生成失败')
  } finally {
    aiPending.value = false
  }
}

async function copyShareLink() {
  if (!isPro.value) {
    openUpgradeDialog('share_link')
    return
  }
  syncProfileFromUi()
  const url = await buildShareUrl(profileToExportShape(profiles.value[activeProfileId.value]))
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('分享链接已复制（只读预览）')
    trackEvent('share_link_copy', { plan: 'pro' })
  } catch {
    ElMessage.error('复制失败，请检查浏览器权限')
  }
}

async function exportDocx() {
  trackEvent('export_docx_click', { plan: isPro.value ? 'pro' : 'free' })
  await runExportGuard(async () => {
    const name = resumeData.value.name?.trim() || '简历'
    await exportResumeDocx({
      data: resumeData.value,
      activeModules: activeModules.value,
      moduleOrder: moduleOrder.value,
      filename: `${name}_简历.docx`
    })
    ElMessage.success('Word 导出成功')
  })
}

function exportCoverLetterTxt() {
  const text = buildCoverLetterText(coverLetter.value, resumeData.value.name)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${resumeData.value.name?.trim() || '求职信'}_求职信.txt`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportCoverLetterDocx() {
  const name = resumeData.value.name?.trim() || '求职信'
  await exportCoverLetterDocxFile({
    coverLetter: coverLetter.value,
    resumeName: resumeData.value.name,
    filename: `${name}_求职信.docx`
  })
  ElMessage.success('求职信 Word 导出成功')
}

async function goCheckout() {
  trackEvent('checkout_click', { source: upgradeSource.value })
  try {
    const target = await createCheckoutSession(subscriptionBilling ? 'subscription' : 'lifetime')
    window.location.href = target
    showUpgradeDialog.value = false
  } catch {
    if (contactUrl) {
      window.open(contactUrl, '_blank', 'noopener')
      ElMessage.warning('支付通道暂不可用，已为你打开人工开通入口')
      return
    }
    ElMessage.error('支付通道初始化失败，请稍后重试')
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
.toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.save-status {
  font-size: 12px;
  opacity: 0.9;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
}
.save-status.saving { opacity: 0.7; }
.save-status.dirty { background: rgba(255, 200, 100, 0.35); }
.profile-bar {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 12px;
}
.pane-title {
  font-size: 14px;
  color: #667eea;
  margin: 0 0 12px;
}
.billing-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #946200;
}
.jd-panel {
  margin-bottom: 12px;
  padding: 10px;
  background: #f8f9ff;
  border-radius: 8px;
  flex-shrink: 0;
}
.jd-label { font-size: 12px; color: #666; margin-bottom: 6px; }
.jd-result { font-size: 11px; color: #67c23a; margin-top: 6px; }
.health-panel {
  margin-bottom: 12px;
  padding: 12px;
  background: #fbfcff;
  border: 1px solid #e4e8ff;
  border-radius: 8px;
  flex-shrink: 0;
}
.health-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.health-kicker {
  font-size: 12px;
  color: #667085;
  margin-bottom: 4px;
}
.health-score {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #344054;
}
.health-score strong {
  font-size: 28px;
  line-height: 1;
  color: #4755c7;
}
.health-score span {
  font-size: 12px;
  color: #667085;
}
.health-summary {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #475467;
}
.health-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.health-check {
  border-radius: 6px;
  padding: 4px 7px;
  font-size: 11px;
  line-height: 1;
  border: 1px solid transparent;
}
.health-check.good {
  color: #2f7a3d;
  background: #edf8ef;
  border-color: #ccebd3;
}
.health-check.warn {
  color: #946200;
  background: #fff8e6;
  border-color: #f4dfaa;
}
.health-check.bad {
  color: #b42318;
  background: #fff1f0;
  border-color: #ffd0cc;
}
.health-wins {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #667085;
  font-size: 11px;
  line-height: 1.5;
}
.ai-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.interview-list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
  color: #334155;
}
.layout-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}
.layout-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.theme-row .color-input {
  width: 36px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}
.ats-pre {
  white-space: pre-wrap;
  font-family: Consolas, 'Microsoft YaHei', monospace;
  font-size: 13px;
  line-height: 1.5;
  max-height: 60vh;
  overflow: auto;
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}
.print-preview-wrap {
  max-height: 70vh;
  overflow: auto;
  background: #f0f2f5;
  padding: 12px;
}

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
.editor-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

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
.pro-upsell {
  margin-top: 10px;
  border: 1px dashed #f2c97d;
  background: #fff9ed;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: #946200;
}
.upgrade-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}
.upgrade-content ul {
  margin: 10px 0 0;
  padding-left: 20px;
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
