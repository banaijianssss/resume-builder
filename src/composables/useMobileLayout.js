import { ref, onMounted, onUnmounted } from 'vue'

const MQ = '(max-width: 1024px)'

export function useMobileLayout() {
  const isMobile = ref(false)
  const mobileTab = ref('edit')

  let mq = null

  function sync(e) {
    isMobile.value = e.matches
    if (!e.matches) mobileTab.value = 'edit'
  }

  onMounted(() => {
    mq = window.matchMedia(MQ)
    isMobile.value = mq.matches
    mq.addEventListener('change', sync)
  })

  onUnmounted(() => {
    mq?.removeEventListener('change', sync)
  })

  return { isMobile, mobileTab }
}
