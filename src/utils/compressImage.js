/**
 * 压缩头像为 JPEG Base64，避免 localStorage 配额溢出
 */
export function compressImageFile(
  file,
  { maxWidth = 400, maxHeight = 400, quality = 0.82, maxBytes = 500 * 1024 } = {}
) {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('请选择图片文件'))
  }
  if (file.size > maxBytes * 4) {
    return Promise.reject(new Error('图片过大，请选择 2MB 以内的照片'))
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      const scale = Math.min(maxWidth / width, maxHeight / height, 1)
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败'))
    }

    img.src = url
  })
}
