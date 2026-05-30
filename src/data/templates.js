// 模板配置
export const templates = [
  {
    id: 'classic',
    name: '经典商务',
    description: '传统简洁，适合大多数岗位'
  },
  {
    id: 'modern',
    name: '现代简约',
    description: '设计感强，适合互联网行业'
  },
  {
    id: 'creative',
    name: '创意风格',
    description: '突出个性，适合创意类岗位'
  },
  {
    id: 'sidebar',
    name: '侧栏布局',
    description: '左侧信息栏，内容清晰'
  },
  {
    id: 'timeline',
    name: '时间轴风格',
    description: '时间线展示经历，一目了然'
  }
]

// 所有可用模块定义（用户可开关）
export const availableModules = [
  {
    id: 'basic',
    label: '基本信息',
    icon: '📌',
    default: true,
    required: true,
    groups: [
      { key: 'avatar', label: '头像', type: 'avatar', placeholder: '上传照片' },
      { key: 'name', label: '姓名', type: 'text', placeholder: '请输入姓名' },
      { key: 'email', label: '邮箱', type: 'text', placeholder: '请输入邮箱' },
      { key: 'phone', label: '电话', type: 'text', placeholder: '请输入电话' },
      { key: 'objective', label: '求职意向', type: 'text', placeholder: '请输入求职意向' },
      { key: 'github', label: 'GitHub', type: 'text', placeholder: '如：github.com/username' },
      { key: 'portfolio', label: '作品集/主页', type: 'text', placeholder: '个人网站或作品集链接' },
      { key: 'linkedin', label: 'LinkedIn', type: 'text', placeholder: '选填' }
    ]
  },
  {
    id: 'education',
    label: '教育背景',
    icon: '🎓',
    default: true,
    required: false,
    isArray: true,
    fields: [
      { key: 'school', label: '学校', type: 'text', placeholder: '请输入学校名称' },
      { key: 'major', label: '专业', type: 'text', placeholder: '请输入专业' },
      { key: 'degree', label: '学历', type: 'select', options: ['本科', '硕士', '博士', '大专'] },
      { key: 'graduationYear', label: '毕业年份', type: 'text', placeholder: '如：2026' }
    ]
  },
  {
    id: 'internship',
    label: '实习经历',
    icon: '💼',
    default: true,
    required: false,
    isArray: true,
    fields: [
      { key: 'company', label: '公司名称', type: 'text' },
      { key: 'role', label: '岗位', type: 'text' },
      { key: 'period', label: '时间', type: 'text', placeholder: '如：2024.07 - 2024.08' },
      { key: 'description', label: '工作描述', type: 'textarea' }
    ]
  },
  {
    id: 'project',
    label: '项目经历',
    icon: '🚀',
    default: true,
    required: false,
    isArray: true,
    fields: [
      { key: 'name', label: '项目名称', type: 'text' },
      { key: 'role', label: '担任角色', type: 'text' },
      { key: 'period', label: '时间', type: 'text', placeholder: '如：2025.03 - 2025.06' },
      { key: 'description', label: '项目描述', type: 'textarea' }
    ]
  },
  {
    id: 'campus',
    label: '校园经历',
    icon: '🏫',
    default: true,
    required: false,
    isArray: true,
    fields: [
      { key: 'organization', label: '组织名称', type: 'text' },
      { key: 'role', label: '担任职务', type: 'text' },
      { key: 'period', label: '时间', type: 'text', placeholder: '如：2023.09 - 至今' },
      { key: 'description', label: '工作内容', type: 'textarea' }
    ]
  },
  {
    id: 'skills',
    label: '技能特长',
    icon: '🛠️',
    default: true,
    required: false,
    isTagArray: true,
    fieldLabel: '技能'
  },
  {
    id: 'awards',
    label: '荣誉奖项',
    icon: '🏆',
    default: true,
    required: false,
    groups: [
      { key: 'awards', label: '奖项信息', type: 'textarea', placeholder: '请输入获得的奖项' }
    ]
  },
  {
    id: 'hobbies',
    label: '兴趣爱好',
    icon: '🎯',
    default: false,
    required: false,
    isTagArray: true,
    fieldLabel: '爱好'
  },
  {
    id: 'self_eval',
    label: '自我评价',
    icon: '💪',
    default: true,
    required: false,
    groups: [
      { key: 'selfEval', label: '评价内容', type: 'textarea', placeholder: '请描述自己的优势与特点' }
    ]
  },
  {
    id: 'custom',
    label: '自定义模块',
    icon: '📎',
    default: false,
    required: false,
    isCustomSections: true
  }
]

// 获取默认启用的模块ID列表
export function getDefaultActiveModules() {
  return availableModules.filter(m => m.default).map(m => m.id)
}
