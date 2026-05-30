<template>
  <div class="resume-preview">
    <div class="preview-container" ref="previewContainer">
      <div class="paper-stage">
        <div
          class="resume-paper"
          :class="`template-${template}`"
          :style="paperStyle"
          ref="paperRef"
        >
          <div
            v-if="showPageBreaks"
            v-for="(bp, i) in pageBreaks"
            :key="'pb' + i"
            class="page-break"
            :style="{ top: bp + 'px' }"
          >
            <span class="pb-label">— 第 {{ i + 2 }} 页 —</span>
          </div>

          <ResumeTemplate
            :template-id="template"
            :data="data"
            :active-modules="activeModules"
            :module-order="moduleOrder"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { buildResumeText, downloadTextFile } from '../utils/resumeToText.js'
import { calculateSmartPageBreaks } from './preview/pageBreaks.js'
import ResumeTemplate from './preview/ResumeTemplate.vue'
import { PAPER_PADDING_MM, PHOTO_SIZE_MM } from './preview/previewConstants.js'
import './preview/preview-themes.css'

const emit = defineEmits(['ready'])

const props = defineProps({
  template: { type: String, default: 'classic' },
  data: { type: Object, required: true },
  activeModules: { type: Array, default: () => [] },
  moduleOrder: { type: Array, default: () => [] },
  fontSize: { type: Number, default: 11 },
  layout: {
    type: Object,
    default: () => ({ lineHeight: 1.55, themeColor: '#667eea', paperPaddingMm: PAPER_PADDING_MM })
  }
})

const paperStyle = computed(() => {
  const pad = props.layout?.paperPaddingMm ?? PAPER_PADDING_MM
  return {
    '--resume-font-size': props.fontSize + 'px',
    '--paper-padding': `${pad}mm`,
    '--photo-size': `${PHOTO_SIZE_MM}mm`,
    '--resume-line-height': String(props.layout?.lineHeight ?? 1.55),
    '--theme-color': props.layout?.themeColor ?? '#667eea'
  }
})

const paperRef = ref(null)
const previewContainer = ref(null)
const pageBreaks = ref([])
const showPageBreaks = ref(true)

const pdfExportAvailable = ref(false)

function refreshPageBreaks() {
  nextTick(() => {
    pageBreaks.value = calculateSmartPageBreaks(paperRef.value)
  })
}

let resizeObserver = null

onMounted(async () => {
  if (import.meta.env.DEV) {
    try {
      const res = await fetch('/api/export-pdf', { method: 'HEAD' })
      pdfExportAvailable.value = res.ok
    } catch {
      pdfExportAvailable.value = false
    }
  }
  emit('ready', { hdPdf: pdfExportAvailable.value })
  refreshPageBreaks()
  if (typeof ResizeObserver !== 'undefined' && paperRef.value) {
    resizeObserver = new ResizeObserver(refreshPageBreaks)
    resizeObserver.observe(paperRef.value)
    if (previewContainer.value) resizeObserver.observe(previewContainer.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(
  [
    () => props.data,
    () => props.activeModules,
    () => props.moduleOrder,
    () => props.fontSize,
    () => props.template
  ],
  refreshPageBreaks,
  { deep: true }
)

async function exportPDF() {
  const el = paperRef.value
  if (!el) return

  showPageBreaks.value = false
  await nextTick()

  const opt = {
    margin: [PAPER_PADDING_MM, PAPER_PADDING_MM, PAPER_PADDING_MM, PAPER_PADDING_MM],
    filename: `${props.data.name || '简历'}_简历.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: ['.resume-section']
    }
  }

  try {
    const { default: html2pdf } = await import('html2pdf.js')
    await html2pdf().set(opt).from(el).save()
    ElMessage.success('PDF 导出成功（已尽量避免模块跨页裁切）')
  } catch (e) {
    ElMessage.error('导出失败：' + e.message)
  } finally {
    showPageBreaks.value = true
    refreshPageBreaks()
  }
}

function getPlainText() {
  return buildResumeText(props.data, props.activeModules, props.moduleOrder)
}

function exportTXT() {
  const filename = `${props.data.name?.trim() || '简历'}_简历.txt`
  downloadTextFile(getPlainText(), filename)
  ElMessage.success('TXT 导出成功')
}

async function copyPlainText() {
  try {
    await navigator.clipboard.writeText(getPlainText())
    ElMessage.success('已复制纯文本到剪贴板')
  } catch {
    ElMessage.error('复制失败，请检查浏览器权限')
  }
}

function buildExportState() {
  return {
    resumeData: props.data,
    activeModules: props.activeModules,
    selectedTemplate: props.template,
    moduleOrder: props.moduleOrder,
    fontSize: props.fontSize,
    layout: props.layout
  }
}

async function exportPDFHD() {
  if (!pdfExportAvailable.value) {
    ElMessage.warning('高清 PDF 需在开发模式下使用（npm run dev），或改用打印 / 快速 PDF')
    return
  }

  showPageBreaks.value = false
  await nextTick()

  try {
    const res = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildExportState())
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || '导出失败')
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.data.name?.trim() || '简历'}_简历_高清.pdf`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('高清 PDF 导出成功（Puppeteer 矢量渲染）')
  } catch (e) {
    ElMessage.error('高清导出失败：' + e.message)
  } finally {
    showPageBreaks.value = true
    refreshPageBreaks()
  }
}

defineExpose({
  exportPDF,
  exportPDFHD,
  exportTXT,
  copyPlainText,
  getPlainText,
  pdfExportAvailable
})
</script>

<style scoped>
.resume-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.preview-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f0f2f5;
}

.paper-stage {
  width: 100%;
  max-width: 210mm;
  flex-shrink: 0;
}

.resume-paper {
  width: 100%;
  max-width: 210mm;
  background: white;
  padding: var(--paper-padding, 8mm);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: var(--resume-font-size, 11px);
  color: #333;
  line-height: var(--resume-line-height, 1.55);
  box-sizing: border-box;
  position: relative;
  overflow: visible;
  flex-shrink: 0;
}

.page-break {
  position: absolute;
  left: var(--paper-padding, 8mm);
  right: var(--paper-padding, 8mm);
  height: 0;
  border-top: 1px dashed #d0d5dd;
  pointer-events: none;
  z-index: 10;
}

.pb-label {
  position: absolute;
  right: 0;
  top: -10px;
  background: #f0f2f5;
  padding: 2px 8px;
  font-size: 10px;
  color: #999;
  border-radius: 4px;
  white-space: nowrap;
}

@media print {
  .resume-paper .resume-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .page-break {
    display: none !important;
  }
}
</style>
