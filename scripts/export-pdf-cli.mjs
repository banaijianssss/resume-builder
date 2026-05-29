/**
 * 命令行高清 PDF 导出（需先启动 dev 或 preview 服务）
 * 用法: npm run dev  另开终端: npm run export-pdf
 */
import { generateResumePdf, closePdfBrowser } from './export-pdf-core.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const ORIGIN = process.env.ORIGIN || `http://127.0.0.1:${PORT}`

const defaultState = {
  resumeData: {
    avatar: '',
    name: '简历',
    email: '',
    phone: '',
    school: '',
    major: '',
    degree: '本科',
    graduationYear: '',
    objective: '',
    internship: [],
    project: [],
    campus: [],
    skills: [],
    awards: '',
    hobbies: [],
    selfEval: ''
  },
  activeModules: ['basic', 'education', 'internship', 'project', 'skills', 'self_eval'],
  selectedTemplate: 'classic',
  moduleOrder: ['basic', 'education', 'internship', 'project', 'campus', 'skills', 'awards', 'hobbies', 'self_eval'],
  fontSize: 11
}

async function main() {
  console.log(`正在连接 ${ORIGIN} ...`)
  const pdf = await generateResumePdf({ origin: ORIGIN, state: defaultState })
  const out = path.join(__dirname, '..', 'resume-export.pdf')
  fs.writeFileSync(out, pdf)
  console.log('已保存:', out)
  await closePdfBrowser()
}

main().catch((err) => {
  console.error('导出失败:', err.message)
  console.error('请先运行 npm run dev 或 npm run preview')
  process.exit(1)
})
