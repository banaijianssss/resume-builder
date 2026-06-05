function getTracker() {
  if (typeof window === 'undefined') return null
  if (typeof window.gtag === 'function') {
    return (event, payload) => window.gtag('event', event, payload)
  }
  if (typeof window.umami?.track === 'function') {
    return (event, payload) => window.umami.track(event, payload)
  }
  return null
}

export function trackEvent(eventName, payload = {}) {
  const tracker = getTracker()
  if (!tracker) return
  tracker(eventName, payload)
}
