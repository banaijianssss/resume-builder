<template>
  <div class="tracker-panel">
    <div class="tracker-head">
      <h3>投递追踪</h3>
      <el-button size="small" type="primary" @click="openCreate">+ 新增投递</el-button>
    </div>

    <div class="tracker-stats">
      <span v-for="s in statusOptions" :key="s.id" class="stat-chip">
        {{ s.label }} {{ counts[s.id] || 0 }}
      </span>
    </div>

    <div v-if="!items.length" class="tracker-empty">还没有投递记录，点击右上角新增。</div>

    <div v-for="item in items" :key="item.id" class="tracker-item">
      <div class="tracker-item-head">
        <strong>{{ item.company || '未命名公司' }}</strong>
        <span>{{ item.role }}</span>
      </div>
      <div class="tracker-item-meta">
        <el-select
          :model-value="item.status"
          size="small"
          style="width: 120px"
          @change="(v) => updateStatus(item.id, v)"
        >
          <el-option v-for="s in statusOptions" :key="s.id" :label="s.label" :value="s.id" />
        </el-select>
        <span class="date">{{ item.appliedAt }}</span>
        <el-button size="small" text type="danger" @click="remove(item.id)">删除</el-button>
      </div>
      <p v-if="item.notes" class="notes">{{ item.notes }}</p>
    </div>

    <el-dialog v-model="showDialog" title="新增投递" width="520px">
      <el-form label-position="top">
        <el-form-item label="公司">
          <el-input v-model="draft.company" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-input v-model="draft.role" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="draft.status" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s.id" :label="s.label" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="投递日期">
          <el-input v-model="draft.appliedAt" type="date" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="draft.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCreate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  APPLICATION_STATUSES,
  addApplication,
  countByStatus,
  loadApplications,
  removeApplication,
  saveApplications,
  updateApplication
} from '../utils/applicationTracker.js'

const props = defineProps({
  defaultJdText: { type: String, default: '' }
})

const items = ref([])
const showDialog = ref(false)
const draft = ref({
  company: '',
  role: '',
  status: 'applied',
  appliedAt: new Date().toISOString().slice(0, 10),
  notes: ''
})

const statusOptions = APPLICATION_STATUSES
const counts = computed(() => countByStatus(items.value))

function refresh() {
  items.value = loadApplications()
}

function openCreate() {
  draft.value = {
    company: '',
    role: '',
    status: 'applied',
    appliedAt: new Date().toISOString().slice(0, 10),
    notes: props.defaultJdText ? `JD 已关联` : ''
  }
  showDialog.value = true
}

function saveCreate() {
  items.value = addApplication({
    ...draft.value,
    jdText: props.defaultJdText
  })
  showDialog.value = false
}

function updateStatus(id, status) {
  items.value = updateApplication(id, { status })
}

function remove(id) {
  items.value = removeApplication(id)
}

onMounted(refresh)
</script>

<style scoped>
.tracker-panel { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--el-border-color-light); }
.tracker-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tracker-stats { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.stat-chip { font-size: 12px; background: #f1f5f9; padding: 2px 8px; border-radius: 999px; }
.tracker-empty { font-size: 13px; color: #64748b; }
.tracker-item { border: 1px solid var(--el-border-color-light); border-radius: 8px; padding: 10px; margin-bottom: 8px; }
.tracker-item-head { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; }
.tracker-item-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.date { font-size: 12px; color: #64748b; }
.notes { margin: 6px 0 0; font-size: 12px; color: #475569; }
</style>