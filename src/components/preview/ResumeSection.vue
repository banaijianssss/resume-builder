<template>
  <!-- ===== 经典模板 ===== -->
  <template v-if="template === 'classic'">
    <div v-if="moduleId === 'basic'" class="classic-header resume-section" data-resume-section>
      <BasicHeader template="classic" :data="data" />
    </div>

    <div v-else-if="moduleId === 'education'" :class="sectionClasses('education', 'classic-section')" data-resume-section>
      <h2 class="section-title">{{ labels.education }}</h2>
      <div class="section-content">
        <EducationBlock :items="data.education" variant="classic" />
      </div>
    </div>

    <div v-else-if="isExperience" class="classic-section resume-section" data-resume-section>
      <h2 class="section-title">{{ sectionLabel }}</h2>
      <div class="section-content">
        <ExperienceBlock :items="experienceItems" :primary-key="experiencePrimaryKey" variant="classic" />
      </div>
    </div>

    <div v-else-if="moduleId === 'skills'" class="classic-section resume-section" data-resume-section>
      <h2 class="section-title">技能</h2>
      <div class="section-content">
        <div class="skills-wrap">
          <span v-for="(skill, idx) in data.skills" :key="idx" class="skill-item">{{ skill }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="moduleId === 'awards'" class="classic-section resume-section" data-resume-section>
      <h2 class="section-title">{{ labels.awards }}</h2>
      <div class="section-content">
        <p v-for="(award, idx) in awardLines" :key="idx">• {{ award }}</p>
      </div>
    </div>

    <div v-else-if="moduleId === 'self_eval'" class="classic-section resume-section" data-resume-section>
      <h2 class="section-title">{{ labels.self_eval }}</h2>
      <div class="section-content">
        <p class="pre-wrap">{{ data.selfEval }}</p>
      </div>
    </div>

    <div v-else-if="moduleId === 'hobbies'" class="classic-section resume-section" data-resume-section>
      <h2 class="section-title">{{ labels.hobbies }}</h2>
      <div class="section-content">
        <div class="skills-wrap">
          <span v-for="(h, idx) in data.hobbies" :key="idx" class="skill-item">{{ h }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="moduleId === 'custom'" :class="sectionClasses('custom', 'classic-section')" data-resume-section>
      <CustomSectionsBlock :sections="data.customSections" variant="classic" />
    </div>
  </template>

  <!-- ===== 现代模板 ===== -->
  <template v-else-if="template === 'modern'">
    <div v-if="moduleId === 'basic'" class="modern-header resume-section" data-resume-section>
      <BasicHeader template="modern" :data="data" />
    </div>

    <div v-else-if="moduleId === 'education'" :class="sectionClasses('education', 'modern-section')" data-resume-section>
      <h3 class="modern-title">{{ modernTitle }}</h3>
      <div class="modern-content">
        <EducationBlock :items="data.education" variant="modern" />
      </div>
    </div>

    <div v-else-if="isExperience" class="modern-section resume-section" data-resume-section>
      <h3 class="modern-title">{{ modernTitle }}</h3>
      <div class="modern-content">
        <ExperienceBlock :items="experienceItems" :primary-key="experiencePrimaryKey" variant="modern" />
      </div>
    </div>

    <div v-else-if="moduleId === 'skills'" class="modern-section resume-section" data-resume-section>
      <h3 class="modern-title">{{ modernTitle }}</h3>
      <div class="skills-grid">
        <span v-for="(s, i) in data.skills" :key="i">{{ s }}</span>
      </div>
    </div>

    <div v-else-if="moduleId === 'awards'" class="modern-section resume-section" data-resume-section>
      <h3 class="modern-title">{{ modernTitle }}</h3>
      <div class="modern-content">
        <p v-for="(a, i) in awardLines" :key="i" class="award-line">• {{ a }}</p>
      </div>
    </div>

    <div v-else-if="moduleId === 'self_eval'" class="modern-section resume-section" data-resume-section>
      <h3 class="modern-title">{{ modernTitle }}</h3>
      <div class="modern-content"><p class="pre-wrap">{{ data.selfEval }}</p></div>
    </div>

    <div v-else-if="moduleId === 'hobbies'" class="modern-section resume-section" data-resume-section>
      <h3 class="modern-title">{{ modernTitle }}</h3>
      <div class="skills-grid">
        <span v-for="(h, i) in data.hobbies" :key="i">{{ h }}</span>
      </div>
    </div>

    <div v-else-if="moduleId === 'custom'" :class="sectionClasses('custom', 'modern-section')" data-resume-section>
      <CustomSectionsBlock :sections="data.customSections" variant="modern" />
    </div>
  </template>

  <!-- ===== 创意模板 ===== -->
  <template v-else-if="template === 'creative'">
    <div v-if="moduleId === 'basic'" class="resume-section creative-basic" data-resume-section>
      <BasicHeader template="creative" :data="data" />
    </div>

    <div v-else-if="moduleId === 'education'" :class="sectionClasses('education', 'creative-section')" data-resume-section>
      <h3>{{ creativeTitle.en }} <span>{{ creativeTitle.zh }}</span></h3>
      <EducationBlock :items="data.education" variant="creative" />
    </div>

    <div v-else-if="isExperience" class="creative-section resume-section" data-resume-section>
      <h3>{{ creativeTitle.en }} <span>{{ creativeTitle.zh }}</span></h3>
      <ExperienceBlock :items="experienceItems" :primary-key="experiencePrimaryKey" variant="creative" />
    </div>

    <div v-else-if="moduleId === 'skills'" class="creative-section resume-section" data-resume-section>
      <h3>{{ creativeTitle.en }} <span>{{ creativeTitle.zh }}</span></h3>
      <div class="creative-skills">
        <span v-for="(s, i) in data.skills" :key="i">{{ s }}</span>
      </div>
    </div>

    <div v-else-if="moduleId === 'awards'" class="creative-section resume-section" data-resume-section>
      <h3>{{ creativeTitle.en }} <span>{{ creativeTitle.zh }}</span></h3>
      <p v-for="(a, i) in awardLines" :key="i" class="award-line">✦ {{ a }}</p>
    </div>

    <div v-else-if="moduleId === 'self_eval'" class="creative-section resume-section" data-resume-section>
      <h3>{{ creativeTitle.en }} <span>{{ creativeTitle.zh }}</span></h3>
      <p class="pre-wrap">{{ data.selfEval }}</p>
    </div>

    <div v-else-if="moduleId === 'hobbies'" class="creative-section resume-section" data-resume-section>
      <h3>{{ creativeTitle.en }} <span>{{ creativeTitle.zh }}</span></h3>
      <div class="creative-skills">
        <span v-for="(h, i) in data.hobbies" :key="i">{{ h }}</span>
      </div>
    </div>

    <div v-else-if="moduleId === 'custom'" :class="sectionClasses('custom', 'creative-section')" data-resume-section>
      <CustomSectionsBlock :sections="data.customSections" variant="creative" />
    </div>
  </template>

  <!-- ===== 侧栏模板 ===== -->
  <template v-else-if="template === 'sidebar'">
    <template v-if="placement === 'left'">
      <div v-if="moduleId === 'skills'" class="resume-section" data-resume-section>
        <div class="sb-label">技能</div>
        <div><span class="sb-tag" v-for="(s, i) in data.skills" :key="i">{{ s }}</span></div>
      </div>
      <div v-else-if="moduleId === 'hobbies'" class="resume-section" data-resume-section>
        <div class="sb-label">兴趣</div>
        <div><span class="sb-tag" v-for="(h, i) in data.hobbies" :key="i">{{ h }}</span></div>
      </div>
    </template>

    <template v-else>
      <div v-if="moduleId === 'education'" :class="sectionClasses('education', 'sb-section')" data-resume-section>
        <div class="sb-stitle">{{ sectionLabel }}</div>
        <EducationBlock :items="data.education" variant="sidebar" />
      </div>
      <div v-else-if="isExperience" class="sb-section resume-section" data-resume-section>
        <div class="sb-stitle">{{ sectionLabel }}</div>
        <ExperienceBlock
          :items="experienceItems"
          :primary-key="experiencePrimaryKey"
          variant="sidebar"
        />
      </div>
      <div v-else-if="moduleId === 'awards'" class="sb-section resume-section" data-resume-section>
        <div class="sb-stitle">{{ sectionLabel }}</div>
        <p v-for="(a, i) in awardLines" :key="i" class="award-line">• {{ a }}</p>
      </div>
      <div v-else-if="moduleId === 'self_eval'" class="sb-section resume-section" data-resume-section>
        <div class="sb-stitle">{{ sectionLabel }}</div>
        <p class="pre-wrap">{{ data.selfEval }}</p>
      </div>
      <div v-else-if="moduleId === 'custom'" :class="sectionClasses('custom', 'sb-section')" data-resume-section>
        <CustomSectionsBlock :sections="data.customSections" variant="sidebar" />
      </div>
    </template>
  </template>

  <!-- ===== 时间轴模板 ===== -->
  <template v-else-if="template === 'timeline'">
    <div v-if="placement === 'header' && moduleId === 'basic'" class="tl-header resume-section" data-resume-section>
      <BasicHeader template="timeline" :data="data" />
    </div>

    <template v-else-if="placement === 'body'">
      <div v-if="moduleId === 'education'" :class="sectionClasses('education', 'tl-item')" data-resume-section>
        <div class="tl-dot accent"></div>
        <div class="tl-tag">{{ sectionLabel }}</div>
        <div class="tl-card">
          <EducationBlock :items="data.education" variant="timeline" />
        </div>
      </div>

      <template v-else-if="isExperience">
        <div
          v-for="(item, idx) in experienceItems"
          :key="`${moduleId}-${idx}`"
          class="tl-item resume-section"
          data-resume-section
        >
          <div class="tl-dot accent"></div>
          <div class="tl-tag">{{ timelineTag }} · {{ item.period }}</div>
          <div class="tl-card">
            <strong>{{ item[experiencePrimaryKey] }}</strong> — {{ item.role }}
            <div class="tl-desc">{{ item.description }}</div>
          </div>
        </div>
      </template>

      <div v-else-if="moduleId === 'awards'" class="tl-item resume-section" data-resume-section>
        <div class="tl-dot accent"></div>
        <div class="tl-tag">{{ sectionLabel }}</div>
        <div class="tl-card">
          <p v-for="(a, i) in awardLines" :key="i" class="award-line">✦ {{ a }}</p>
        </div>
      </div>

      <div v-else-if="moduleId === 'skills'" class="tl-item resume-section" data-resume-section>
        <div class="tl-dot accent"></div>
        <div class="tl-tag">{{ sectionLabel }}</div>
        <div class="tl-card">
          <div class="tl-skills">
            <span class="tl-skill" v-for="(s, i) in data.skills" :key="i">{{ s }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="moduleId === 'self_eval'" class="tl-item resume-section" data-resume-section>
        <div class="tl-dot accent"></div>
        <div class="tl-tag">{{ sectionLabel }}</div>
        <div class="tl-card"><p class="pre-wrap">{{ data.selfEval }}</p></div>
      </div>

      <div v-else-if="moduleId === 'hobbies'" class="tl-item resume-section" data-resume-section>
        <div class="tl-dot accent"></div>
        <div class="tl-tag">{{ sectionLabel }}</div>
        <div class="tl-card">
          <div class="tl-skills">
            <span class="tl-skill" v-for="(h, i) in data.hobbies" :key="i">{{ h }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="moduleId === 'custom'" :class="sectionClasses('custom', 'tl-item')" data-resume-section>
        <CustomSectionsBlock :sections="data.customSections" variant="timeline" />
      </div>
    </template>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import BasicHeader from './BasicHeader.vue'
import EducationBlock from './EducationBlock.vue'
import CustomSectionsBlock from './CustomSectionsBlock.vue'
import ExperienceBlock from './ExperienceBlock.vue'
import {
  MODULE_LABELS,
  EXPERIENCE_MODULES,
  MODERN_SECTION_TITLES,
  CREATIVE_SECTION_TITLES,
  parseAwards
} from './previewConfig.js'

const props = defineProps({
  moduleId: { type: String, required: true },
  template: { type: String, required: true },
  data: { type: Object, required: true },
  /** sidebar: left | main；timeline: header | body */
  placement: { type: String, default: 'main' }
})

const labels = MODULE_LABELS

const isExperience = computed(() => !!EXPERIENCE_MODULES[props.moduleId])

const experienceMeta = computed(() => EXPERIENCE_MODULES[props.moduleId] || null)

const experienceItems = computed(() => {
  if (!experienceMeta.value) return []
  return props.data[experienceMeta.value.listKey] || []
})

const experiencePrimaryKey = computed(() => experienceMeta.value?.primaryKey || 'company')

const sectionLabel = computed(() => MODULE_LABELS[props.moduleId] || '')

const modernTitle = computed(() => MODERN_SECTION_TITLES[props.moduleId] || MODULE_LABELS[props.moduleId])

const creativeTitle = computed(
  () => CREATIVE_SECTION_TITLES[props.moduleId] || { en: '', zh: MODULE_LABELS[props.moduleId] }
)

const awardLines = computed(() => parseAwards(props.data.awards))

const timelineTag = computed(() => experienceMeta.value?.timelineTag || '')

function sectionClasses(moduleId, extra = '') {
  const list = ['resume-section']
  if (extra) list.push(extra)
  if ((props.data.pageBreakBefore || []).includes(moduleId)) {
    list.push('force-page-break-before')
  }
  return list
}
</script>
