<template>
  <div class="resume-editor">
    <el-form label-position="top" size="default">

      <template v-for="mod in visibleModules" :key="mod.id">

        <!-- 普通字段模块 -->
        <div v-if="mod.groups && !mod.isArray && !mod.isCustomSections" class="field-group">
          <div class="group-header">
            <h4>{{ mod.icon }} {{ mod.label }}</h4>
            <el-checkbox
              v-if="mod.id !== 'basic'"
              :model-value="isPageBreakBefore(mod.id)"
              @change="(v) => setPageBreakBefore(mod.id, v)"
              size="small"
            >打印前分页</el-checkbox>
          </div>
          <el-form-item
            v-for="field in mod.groups"
            :key="field.key"
            :label="field.label"
            :error="fieldErrors[field.key]"
          >
            <el-input
              v-if="field.type === 'text'"
              v-model="modelValue[field.key]"
              :placeholder="field.placeholder"
              @blur="validateFieldKey(field.key)"
            />
            <div v-else-if="field.type === 'avatar'" class="avatar-upload">
              <div class="avatar-preview" v-if="modelValue[field.key]">
                <img :src="modelValue[field.key]" alt="头像">
                <el-button size="small" type="danger" circle @click="clearAvatar">✕</el-button>
              </div>
              <el-button v-else size="small" @click="triggerAvatar">📷 上传照片</el-button>
              <p class="field-tip">建议小于 500KB，过大将影响保存速度</p>
              <input type="file" accept="image/*" style="display:none"
                :ref="el => avatarInput = el"
                @change="handleAvatar">
            </div>
            <el-select
              v-else-if="field.type === 'select'"
              v-model="modelValue[field.key]"
              style="width: 100%"
            >
              <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-input
              v-else-if="field.type === 'textarea'"
              type="textarea"
              v-model="modelValue[field.key]"
              :rows="3"
              :placeholder="field.placeholder"
            />
          </el-form-item>
        </div>

        <!-- 数组型模块 -->
        <div v-else-if="mod.isArray" class="field-group">
          <div class="group-header">
            <h4>{{ mod.icon }} {{ mod.label }}</h4>
            <div class="group-actions">
              <el-checkbox
                :model-value="isPageBreakBefore(mod.id)"
                @change="(v) => setPageBreakBefore(mod.id, v)"
                size="small"
              >打印前分页</el-checkbox>
              <el-button size="small" type="primary" @click="addArrayItem(mod.id, mod.fields)">+ 添加</el-button>
            </div>
          </div>
          <div v-for="(item, index) in modelValue[mod.id]" :key="index" class="array-item">
            <el-divider v-if="index > 0" />
            <div class="item-header">
              <span>{{ mod.label }} {{ index + 1 }}</span>
              <div class="item-btns">
                <el-button size="small" :disabled="index === 0" @click="moveArrayItem(mod.id, index, -1)">↑</el-button>
                <el-button size="small" :disabled="index === modelValue[mod.id].length - 1" @click="moveArrayItem(mod.id, index, 1)">↓</el-button>
                <el-button size="small" @click="duplicateArrayItem(mod.id, index)">复制</el-button>
                <el-button size="small" type="danger" @click="removeArrayItem(mod.id, index)">删除</el-button>
              </div>
            </div>
            <el-form-item v-for="field in mod.fields" :key="field.key" :label="field.label">
              <el-input
                v-if="field.type === 'text'"
                v-model="item[field.key]"
                :placeholder="field.placeholder"
              />
              <el-select
                v-else-if="field.type === 'select'"
                v-model="item[field.key]"
                style="width: 100%"
              >
                <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
              </el-select>
              <el-input
                v-else-if="field.type === 'textarea'"
                type="textarea"
                v-model="item[field.key]"
                :rows="2"
                :placeholder="field.placeholder"
              />
            </el-form-item>
          </div>
          <div v-if="!modelValue[mod.id]?.length" class="empty-hint">暂无内容，点击「+ 添加」</div>
        </div>

        <!-- 自定义模块 -->
        <div v-else-if="mod.isCustomSections" class="field-group">
          <div class="group-header">
            <h4>{{ mod.icon }} {{ mod.label }}</h4>
            <div class="group-actions">
              <el-checkbox
                :model-value="isPageBreakBefore('custom')"
                @change="(v) => setPageBreakBefore('custom', v)"
                size="small"
              >打印前分页</el-checkbox>
              <el-button size="small" type="primary" @click="addCustomSection">+ 添加</el-button>
            </div>
          </div>
          <div v-for="(sec, index) in modelValue.customSections" :key="sec.id" class="array-item">
            <div class="item-header">
              <span>模块 {{ index + 1 }}</span>
              <el-button size="small" type="danger" @click="removeCustomSection(index)">删除</el-button>
            </div>
            <el-form-item label="标题">
              <el-input v-model="sec.title" placeholder="如：证书、语言" />
            </el-form-item>
            <el-form-item label="内容">
              <el-input v-model="sec.content" type="textarea" :rows="3" />
            </el-form-item>
          </div>
          <div v-if="!modelValue.customSections?.length" class="empty-hint">可添加证书、语言等自定义板块</div>
        </div>

        <!-- 标签数组 -->
        <div v-else-if="mod.isTagArray" class="field-group">
          <div class="group-header">
            <h4>{{ mod.icon }} {{ mod.label }}</h4>
            <el-checkbox
              :model-value="isPageBreakBefore(mod.id)"
              @change="(v) => setPageBreakBefore(mod.id, v)"
              size="small"
            >打印前分页</el-checkbox>
          </div>
          <div class="tag-list">
            <el-tag
              v-for="(item, index) in modelValue[mod.id]"
              :key="index"
              closable
              :class="{ 'skill-hit': highlightedSkills.has(item) }"
              @close="removeTagItem(mod.id, index)"
            >{{ item }}</el-tag>
          </div>
          <el-input
            v-model="newTagMap[mod.id]"
            :placeholder="'输入' + (mod.fieldLabel || '内容') + '后回车添加'"
            @keyup.enter="addTagInput(mod.id)"
            style="margin-top: 10px"
          >
            <template #append>
              <el-button @click="addTagInput(mod.id)">添加</el-button>
            </template>
          </el-input>
        </div>

      </template>
    </el-form>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { compressImageFile } from '../utils/compressImage.js'
import { validateField } from '../utils/resumeValidation.js'

const props = defineProps({
  availableModules: { type: Array, required: true },
  activeModules: { type: Array, required: true },
  moduleOrder: { type: Array, default: () => [] },
  modelValue: { type: Object, required: true },
  highlightedSkills: { type: Object, default: () => new Set() }
})

const emit = defineEmits(['update:modelValue'])

const fieldErrors = reactive({})
const avatarInput = ref(null)
const newTagMap = reactive({})

const visibleModules = computed(() => {
  const order = props.moduleOrder.length ? props.moduleOrder : props.availableModules.map((m) => m.id)
  const byOrder = []
  const rest = []
  for (const m of props.availableModules) {
    if (props.activeModules.includes(m.id)) {
      const idx = order.indexOf(m.id)
      if (idx >= 0) byOrder[idx] = m
      else rest.push(m)
    }
  }
  return byOrder.filter(Boolean).concat(rest)
})

function patch(data) {
  emit('update:modelValue', { ...props.modelValue, ...data })
}

function validateFieldKey(key) {
  const msg = validateField(key, props.modelValue[key])
  fieldErrors[key] = msg
}

function isPageBreakBefore(modId) {
  return (props.modelValue.pageBreakBefore || []).includes(modId)
}

function setPageBreakBefore(modId, on) {
  const list = [...(props.modelValue.pageBreakBefore || [])]
  const i = list.indexOf(modId)
  if (on && i < 0) list.push(modId)
  if (!on && i >= 0) list.splice(i, 1)
  patch({ pageBreakBefore: list })
}

function triggerAvatar() {
  avatarInput.value?.click()
}

async function handleAvatar(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  try {
    const dataUrl = await compressImageFile(file)
    patch({ avatar: dataUrl })
    ElMessage.success('照片已上传')
  } catch (err) {
    ElMessage.error(err.message || '照片上传失败')
  }
}

function clearAvatar() {
  patch({ avatar: '' })
}

function addArrayItem(moduleId, fields) {
  const empty = {}
  fields.forEach((f) => {
    empty[f.key] = f.type === 'select' && f.options?.length ? f.options[0] : ''
  })
  const arr = [...(props.modelValue[moduleId] || []), empty]
  patch({ [moduleId]: arr })
}

function removeArrayItem(moduleId, index) {
  const arr = [...props.modelValue[moduleId]]
  arr.splice(index, 1)
  patch({ [moduleId]: arr })
}

function moveArrayItem(moduleId, index, dir) {
  const arr = [...props.modelValue[moduleId]]
  const j = index + dir
  if (j < 0 || j >= arr.length) return
  ;[arr[index], arr[j]] = [arr[j], arr[index]]
  patch({ [moduleId]: arr })
}

function duplicateArrayItem(moduleId, index) {
  const arr = [...props.modelValue[moduleId]]
  arr.splice(index + 1, 0, { ...arr[index] })
  patch({ [moduleId]: arr })
}

function addCustomSection() {
  const list = [...(props.modelValue.customSections || [])]
  list.push({ id: `custom-${Date.now()}`, title: '', content: '' })
  patch({ customSections: list })
}

function removeCustomSection(index) {
  const list = [...props.modelValue.customSections]
  list.splice(index, 1)
  patch({ customSections: list })
}

function addTagInput(moduleId) {
  const val = newTagMap[moduleId]
  if (val?.trim()) {
    const arr = [...(props.modelValue[moduleId] || []), val.trim()]
    patch({ [moduleId]: arr })
    newTagMap[moduleId] = ''
  }
}

function removeTagItem(moduleId, index) {
  const arr = [...props.modelValue[moduleId]]
  arr.splice(index, 1)
  patch({ [moduleId]: arr })
}
</script>

<style scoped>
.resume-editor {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 10px;
}
.field-group { margin-bottom: 24px; }
.field-group h4 { font-size: 14px; color: #667eea; margin-bottom: 0; }
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.group-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.array-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #666;
  font-size: 13px;
  flex-wrap: wrap;
  gap: 6px;
}
.item-btns { display: flex; gap: 4px; flex-wrap: wrap; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-hit { outline: 2px solid #67c23a; }
.field-tip { font-size: 11px; color: #999; margin-top: 4px; }
.empty-hint {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}
.avatar-preview { display: inline-flex; align-items: center; gap: 8px; }
.avatar-preview img {
  width: 64px; height: 64px; object-fit: cover;
  border-radius: 8px; border: 2px solid #e8e8e8;
}
:deep(.el-form-item__label) { font-weight: 500; }
</style>
