/**
 * Utility functions for reading and writing browser cookies.
 */

export function getCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null
    const nameEQ = `${encodeURIComponent(name)}=`
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length))
      }
    }
    return null
  } catch (err) {
    console.warn('Error reading cookie:', err)
    return null
  }
}

export function setCookie(name: string, value: string, days = 365): void {
  try {
    if (typeof document === 'undefined') return
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `; expires=${date.toUTCString()}`
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`
  } catch (err) {
    console.warn('Error setting cookie:', err)
  }
}

export function deleteCookie(name: string): void {
  try {
    if (typeof document === 'undefined') return
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
  } catch (err) {
    console.warn('Error deleting cookie:', err)
  }
}

export const LAST_REFRESH_COOKIE = 'flight_tracker_last_manual_refresh'
export const REFRESH_COOLDOWN_MS = 10000

/**
 * Returns remaining seconds of refresh cooldown across any browser tabs for this domain.
 * Returns 0 if cooldown has expired or no recent refresh occurred.
 */
export function getRefreshCooldownRemainingSeconds(cooldownMs = REFRESH_COOLDOWN_MS): number {
  try {
    const cookieVal = getCookie(LAST_REFRESH_COOKIE)
    if (!cookieVal) return 0
    const lastTime = parseInt(cookieVal, 10)
    if (isNaN(lastTime)) return 0
    const elapsed = Date.now() - lastTime
    if (elapsed < cooldownMs) {
      return Math.ceil((cooldownMs - elapsed) / 1000)
    }
    return 0
  } catch {
    return 0
  }
}

/**
 * Records a refresh event in browser cookies, shared across all open tabs.
 */
export function recordRefreshInCookie(): void {
  // Persist for 1 day (cooldown window is 10s, cookie expires cleanly)
  setCookie(LAST_REFRESH_COOKIE, String(Date.now()), 1)
}
