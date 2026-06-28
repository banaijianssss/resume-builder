/**
 * 轻量功能回归测试（Node 环境）
 */
import {
  getEmptyResumeData,
  migrateResumeData,
  validateImportState,
  importToAppState,
  normalizeAppState,
  buildPersistedAppState,
  STORAGE_VERSION
} from '../src/utils/storage.js'
import { getResumeChecklist, validateField } from '../src/utils/resumeValidation.js'
import { matchSkillsToJd } from '../src/utils/keywordMatch.js'
import { buildResumeText } from '../src/utils/resumeToText.js'
import { getResumeHealth } from '../src/utils/resumeScore.js'
import {
  addApplication,
  countByStatus,
  saveApplications,
  APPLICATION_STATUSES
} from '../src/utils/applicationTracker.js'
import { sampleResumeState } from '../src/data/sampleResume.js'

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) {
    passed++
  } else {
    failed++
    console.error('FAIL:', msg)
  }
}

// 1. 旧版教育字段迁移
const legacy = migrateResumeData({
  school: '测试大学',
  major: '计算机',
  degree: '本科',
  graduationYear: '2026'
})
assert(legacy.education?.length === 1, 'education migration count')
assert(legacy.education[0].school === '测试大学', 'education migration school')
assert(legacy.school === undefined, 'legacy school removed')

// 2. 导入校验
assert(validateImportState({ resumeData: { name: 'a' } }), 'valid import')
assert(!validateImportState({ foo: 1 }), 'invalid import')
assert(validateImportState({ profiles: { x: {} }, activeProfileId: 'x' }), 'valid profiles import')

// 3. v1 → v2 状态迁移
const v1 = normalizeAppState({
  version: 1,
  resumeData: { name: '张三', education: [{ school: 'A大学', major: 'x', degree: '本科', graduationYear: '' }] },
  activeModules: ['basic'],
  selectedTemplate: 'classic',
  moduleOrder: ['basic'],
  fontSize: 11
})
assert(v1?.profiles?.default, 'v1 to profiles.default')
assert(v1.activeProfileId === 'default', 'activeProfileId default')

// 4. 导出检查
const check = getResumeChecklist(getEmptyResumeData(), ['basic', 'education'])
assert(check.issues.some((i) => i.includes('姓名')), 'checklist missing name')
assert(validateField('email', 'bad@') !== '', 'invalid email')

// 5. JD 匹配
const jd = matchSkillsToJd('需要 Vue.js 和 JavaScript 开发', ['Vue.js', 'Python', 'JavaScript'])
assert(jd.matched.length === 2, 'jd matched count')
assert(jd.missing.includes('Python'), 'jd missing skill')

// 6. 纯文本导出含自定义模块
const text = buildResumeText(
  {
    ...getEmptyResumeData(),
    name: '李四',
    email: 'a@b.com',
    customSections: [{ id: '1', title: '证书', content: 'CET-6' }]
  },
  ['basic', 'custom'],
  ['basic', 'custom']
)
assert(text.includes('李四'), 'text has name')
assert(text.includes('证书'), 'text has custom section')

// 7. 持久化结构
const persisted = buildPersistedAppState({
  activeProfileId: 'default',
  profiles: { default: { id: 'default', name: '默认', resumeData: getEmptyResumeData() } }
})
assert(persisted.version === STORAGE_VERSION, 'storage version')

// 8. 简历健康分
const emptyHealth = getResumeHealth({
  data: getEmptyResumeData(),
  activeModules: ['basic', 'education', 'skills'],
  moduleOrder: ['basic', 'education', 'skills']
})
assert(emptyHealth.score < 50, 'empty resume low health score')
assert(emptyHealth.quickWins.length > 0, 'empty resume quick wins')

const sampleHealth = getResumeHealth({
  data: sampleResumeState.resumeData,
  activeModules: sampleResumeState.activeModules,
  moduleOrder: sampleResumeState.moduleOrder,
  jdText: 'Vue.js JavaScript HTML/CSS Git Node.js 前端开发'
})
assert(sampleHealth.score >= 75, 'sample resume strong health score')
assert(sampleHealth.checks.length === 6, 'health check count')
assert(sampleHealth.checks.some((c) => c.id === 'skills' && c.points >= 10), 'skill health score')

// 9. 投递追踪
const trackerStore = {}
globalThis.localStorage = {
  getItem: (k) => trackerStore[k] ?? null,
  setItem: (k, v) => { trackerStore[k] = v }
}
const apps = saveApplications([])
assert(apps.length === 0, 'tracker init empty')
const added = addApplication({ company: '测试公司', role: '前端', status: 'applied' })
assert(added.length === 1, 'tracker add one')
assert(countByStatus(added).applied === 1, 'tracker status count')
assert(APPLICATION_STATUSES.length === 5, 'tracker status options')

console.log(`\n测试结果: ${passed} 通过, ${failed} 失败`)
if (failed > 0) process.exit(1)
console.log('全部通过')
