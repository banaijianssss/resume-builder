<template>
  <div class="cover-letter-editor">
    <el-form label-position="top" size="default">
      <el-form-item label="目标公司">
        <el-input v-model="model.company" placeholder="如：字节跳动" />
      </el-form-item>
      <el-form-item label="应聘岗位">
        <el-input v-model="model.position" placeholder="如：前端开发工程师" />
      </el-form-item>
      <el-form-item label="收件人（可选）">
        <el-input v-model="model.recipient" placeholder="HR 或部门负责人" />
      </el-form-item>
      <el-form-item label="日期">
        <el-input v-model="model.date" type="date" />
      </el-form-item>
      <el-form-item label="称呼">
        <el-input v-model="model.greeting" />
      </el-form-item>
      <el-form-item label="正文">
        <el-input v-model="model.body" type="textarea" :rows="10" placeholder="说明求职动机、匹配能力与价值..." />
      </el-form-item>
      <el-form-item label="结尾">
        <el-input v-model="model.closing" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="署名">
        <el-input v-model="model.signature" :placeholder="resumeName || '你的姓名'" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  resumeName: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
</script>

<style scoped>
.cover-letter-editor {
  padding: 4px 0;
}
</style>