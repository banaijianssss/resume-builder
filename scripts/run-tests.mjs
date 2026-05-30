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

console.log(`\n测试结果: ${passed} 通过, ${failed} 失败`)
if (failed > 0) process.exit(1)
console.log('全部通过')
