/* Analytics Utility - Handles event tracking for user actions */

type EventProperties = Record<string, string | number | boolean | undefined>

export const trackEvent = (eventName: string, properties?: EventProperties) => {
  // Log to console in development environment
  if (import.meta.env.DEV) {
    console.groupCollapsed(`[Analytics] ${eventName}`)
    console.log(properties)
    console.groupEnd()
  }

  // Placeholder for real analytics integration (e.g., Google Analytics, Segment, Mixpanel)
  // Example:
  // if (window.analytics) {
  //   window.analytics.track(eventName, properties)
  // }
}
