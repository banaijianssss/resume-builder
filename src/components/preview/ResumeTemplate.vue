<template>
  <!-- 经典 / 现代 / 创意 -->
  <template v-if="layout === 'standard'">
    <div v-if="templateId === 'creative'" class="creative-accent"></div>
    <template v-for="modId in orderedModuleIds" :key="modId">
      <ResumeSection
        v-if="visible(modId)"
        :module-id="modId"
        :template="templateId"
        :data="data"
      />
    </template>
  </template>

  <!-- 侧栏 -->
  <template v-else-if="layout === 'sidebar'">
    <div v-if="visible('basic')" class="sidebar-top-header resume-section" data-resume-section>
      <BasicHeader template="sidebar" :data="data" />
    </div>
    <div class="sidebar-layout">
    <div class="sidebar-left">
      <template v-for="modId in sidebarLeftIds" :key="'l-' + modId">
        <ResumeSection
          :module-id="modId"
          template="sidebar"
          placement="left"
          :data="data"
        />
      </template>
    </div>
    <div class="sidebar-right">
      <template v-for="modId in sidebarMainIds" :key="'r-' + modId">
        <ResumeSection
          :module-id="modId"
          template="sidebar"
          placement="main"
          :data="data"
        />
      </template>
    </div>
    </div>
  </template>

  <!-- 时间轴 -->
  <template v-else-if="layout === 'timeline'">
    <ResumeSection
      v-if="visible('basic')"
      module-id="basic"
      template="timeline"
      placement="header"
      :data="data"
    />
    <div class="tl-body">
      <template v-for="modId in timelineBodyIds" :key="modId">
        <ResumeSection
          :module-id="modId"
          template="timeline"
          placement="body"
          :data="data"
        />
      </template>
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import BasicHeader from './BasicHeader.vue'
import ResumeSection from './ResumeSection.vue'
import {
  getTemplateLayout,
  getOrderedModuleIds,
  isModuleVisible,
  getSidebarLeftModuleIds,
  getSidebarMainModuleIds,
  getTimelineBodyModuleIds
} from './previewConfig.js'

const props = defineProps({
  templateId: { type: String, required: true },
  data: { type: Object, required: true },
  activeModules: { type: Array, required: true },
  moduleOrder: { type: Array, default: () => [] }
})

const layout = computed(() => getTemplateLayout(props.templateId))

const orderedModuleIds = computed(() =>
  getOrderedModuleIds(props.activeModules, props.moduleOrder)
)

const sidebarLeftIds = computed(() =>
  getSidebarLeftModuleIds(props.data, props.activeModules)
)

const sidebarMainIds = computed(() =>
  getSidebarMainModuleIds(orderedModuleIds.value, props.data, props.activeModules)
)

const timelineBodyIds = computed(() =>
  getTimelineBodyModuleIds(orderedModuleIds.value, props.data, props.activeModules)
)

function visible(modId) {
  return isModuleVisible(modId, props.data, props.activeModules)
}
</script>
