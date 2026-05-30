/** 一键加载的示例简历数据 */
export const sampleResumeState = {
  resumeData: {
    avatar: '',
    name: '张明',
    email: 'zhangming@email.com',
    phone: '13800138000',
    github: 'github.com/zhangming',
    linkedin: '',
    portfolio: 'zhangming.dev',
    objective: '前端开发工程师',
    education: [
      {
        school: '某某大学',
        major: '计算机科学与技术',
        degree: '本科',
        graduationYear: '2026'
      }
    ],
    internship: [
      {
        company: '某科技有限公司',
        role: '前端开发实习生',
        period: '2025.07 - 2025.09',
        description:
          '参与公司后台管理系统重构，使用 Vue 3 + TypeScript 完成 3 个业务模块开发；优化列表页加载性能，首屏时间降低约 30%。'
      }
    ],
    project: [
      {
        name: '在线简历编辑器',
        role: '独立开发',
        period: '2025.03 - 2025.05',
        description:
          '基于 Vue 3 与 Vite 实现模板化简历编辑、实时 A4 预览与 PDF 导出，数据本地持久化。'
      }
    ],
    campus: [],
    skills: ['Vue.js', 'JavaScript', 'HTML/CSS', 'Git', 'Node.js'],
    awards: '校级一等奖学金（2024）\n全国大学生计算机设计大赛省级二等奖',
    hobbies: ['阅读', '跑步'],
    selfEval:
      '学习能力强，注重代码质量与用户体验，有良好的团队协作与沟通能力，能快速理解业务需求并落地。',
    customSections: [
      {
        id: 'custom-1',
        title: '证书',
        content: 'CET-6 · 软考程序员'
      }
    ],
    pageBreakBefore: []
  },
  activeModules: [
    'basic',
    'education',
    'internship',
    'project',
    'skills',
    'awards',
    'self_eval',
    'custom'
  ],
  selectedTemplate: 'modern',
  moduleOrder: [
    'basic',
    'education',
    'internship',
    'project',
    'campus',
    'skills',
    'awards',
    'hobbies',
    'self_eval',
    'custom'
  ],
  fontSize: 11,
  layout: {
    lineHeight: 1.55,
    themeColor: '#667eea',
    paperPaddingMm: 8
  }
}
