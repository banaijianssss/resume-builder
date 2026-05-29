<template>
  <div class="resume-editor">
    <el-form label-position="top" size="default">

      <!-- 动态渲染所有已开启的模块 -->
      <template v-for="mod in visibleModules" :key="mod.id">

        <!-- 普通字段模块 -->
        <div v-if="mod.groups && !mod.isArray" class="field-group">
          <h4>{{ mod.icon }} {{ mod.label }}</h4>
          <el-form-item
            v-for="field in mod.groups"
            :key="field.key"
            :label="field.label"
          >
            <el-input
              v-if="field.type === 'text'"
              v-model="modelValue[field.key]"
              :placeholder="field.placeholder"
            />
            <div v-else-if="field.type === 'avatar'" class="avatar-upload">
              <div class="avatar-preview" v-if="modelValue[field.key]">
                <img :src="modelValue[field.key]" alt="头像">
                <el-button size="small" type="danger" circle @click="clearAvatar">✕</el-button>
              </div>
              <el-button v-else size="small" @click="triggerAvatar">📷 上传照片</el-button>
              <input type="file" accept="image/*" style="display:none"
                :ref="el => avatarInput = el"
                @change="handleAvatar">
            </div>
            <el-select
              v-else-if="field.type === 'select'"
              v-model="modelValue[field.key]"
              style="width: 100%"
            >
              <el-option
                v-for="opt in field.options"
                :key="opt"
                :label="opt"
                :value="opt"
              />
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

        <!-- 数组型模块（实习/项目/校园经历） -->
        <div v-else-if="mod.isArray" class="field-group">
          <div class="group-header">
            <h4>{{ mod.icon }} {{ mod.label }}</h4>
            <el-button size="small" type="primary" @click="addArrayItem(mod.id, mod.fields)">
              + 添加
            </el-button>
          </div>
          <div
            v-for="(item, index) in modelValue[mod.id]"
            :key="index"
            class="array-item"
          >
            <el-divider v-if="index > 0" />
            <div class="item-header">
              <span>{{ mod.label }} {{ index + 1 }}</span>
              <el-button size="small" type="danger" @click="removeArrayItem(mod.id, index)">
                删除
              </el-button>
            </div>
            <el-form-item
              v-for="field in mod.fields"
              :key="field.key"
              :label="field.label"
            >
              <el-input
                v-if="field.type === 'text'"
                v-model="item[field.key]"
                :placeholder="field.placeholder"
              />
              <el-input
                v-else-if="field.type === 'textarea'"
                type="textarea"
                v-model="item[field.key]"
                :rows="2"
                :placeholder="field.placeholder"
              />
            </el-form-item>
          </div>
          <div v-if="modelValue[mod.id]?.length === 0" class="empty-hint">
            暂无内容，点击"+ 添加"开始添加
          </div>
        </div>

        <!-- 标签数组型模块（技能/兴趣爱好） -->
        <div v-else-if="mod.isTagArray" class="field-group">
          <h4>{{ mod.icon }} {{ mod.label }}</h4>
          <div class="tag-list">
            <el-tag
              v-for="(item, index) in modelValue[mod.id]"
              :key="index"
              closable
              @close="removeTagItem(mod.id, index)"
              class="tag-item"
            >
              {{ item }}
            </el-tag>
          </div>
          <el-input
            v-model="newTagMap[mod.id]"
            :placeholder="'输入' + (mod.fieldLabel || '内容') + '后按回车添加'"
            @keyup.enter="addTagItem(mod.id, $event)"
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

const props = defineProps({
  availableModules: { type: Array, required: true },
  activeModules: { type: Array, required: true },
  moduleOrder: { type: Array, default: () => [] },
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

// 头像上传
const avatarInput = ref(null)
function triggerAvatar() { avatarInput.value?.click() }
async function handleAvatar(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  try {
    const dataUrl = await compressImageFile(file)
    emit('update:modelValue', { ...props.modelValue, avatar: dataUrl })
    ElMessage.success('照片已上传')
  } catch (err) {
    ElMessage.error(err.message || '照片上传失败')
  }
}

function clearAvatar() {
  emit('update:modelValue', { ...props.modelValue, avatar: '' })
}

// 按 moduleOrder 排序显示，未被排序收录的模块按原顺序排在后面
const visibleModules = computed(() => {
  const order = props.moduleOrder.length ? props.moduleOrder : props.availableModules.map(m => m.id)
  const byOrder = []
  const rest = []
  for (const m of props.availableModules) {
    if (props.activeModules.includes(m.id)) {
      const idx = order.indexOf(m.id)
      if (idx >= 0) {
        byOrder[idx] = m
      } else {
        rest.push(m)
      }
    }
  }
  return byOrder.filter(Boolean).concat(rest)
})

const newTagMap = reactive({})

function addArrayItem(moduleId, fields) {
  const empty = {}
  fields.forEach(f => { empty[f.key] = '' })
  props.modelValue[moduleId].push(empty)
}

function removeArrayItem(moduleId, index) {
  props.modelValue[moduleId].splice(index, 1)
}

function addTagInput(moduleId) {
  const val = newTagMap[moduleId]
  if (val && val.trim()) {
    props.modelValue[moduleId].push(val.trim())
    newTagMap[moduleId] = ''
  }
}

function addTagItem(moduleId, event) {
  addTagInput(moduleId)
}

function removeTagItem(moduleId, index) {
  props.modelValue[moduleId].splice(index, 1)
}
</script>

<style scoped>
.resume-editor {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 10px;
}

.field-group {
  margin-bottom: 24px;
}

.field-group h4 {
  font-size: 14px;
  color: #667eea;
  margin-bottom: 12px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-header h4 {
  margin-bottom: 0;
}

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
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  font-size: 13px;
}

.empty-hint {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.avatar-upload { margin-top: 4px; }
.avatar-preview {
  display: inline-flex; align-items: center; gap: 8px;
}
.avatar-preview img {
  width: 64px; height: 64px; object-fit: cover;
  border-radius: 8px; border: 2px solid #e8e8e8;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
