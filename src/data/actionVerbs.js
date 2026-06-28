export const ACTION_VERBS = {
  tech: ['开发', '实现', '优化', '重构', '设计', '部署', '维护', '测试', '排查', '集成'],
  data: ['分析', '建模', '预测', '清洗', '可视化', '挖掘', '评估', '监控'],
  product: ['调研', '规划', '推动', '协调', '上线', '迭代', '验证', '落地'],
  ops: ['组织', '统筹', '执行', '跟进', '复盘', '改进', '提升', '降低'],
  general: ['负责', '参与', '主导', '协助', '完成', '达成', '提升', '降低', '推动', '建立']
}

export function suggestVerbs(text = '') {
  const lower = text.toLowerCase()
  if (/开发|代码|系统|api|前端|后端/.test(lower)) return ACTION_VERBS.tech
  if (/数据|分析|模型|算法/.test(lower)) return ACTION_VERBS.data
  if (/产品|需求|用户|运营/.test(lower)) return ACTION_VERBS.product
  if (/项目|团队|流程|管理/.test(lower)) return ACTION_VERBS.ops
  return ACTION_VERBS.general
}