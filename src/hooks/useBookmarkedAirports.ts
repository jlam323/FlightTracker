import { useState, useCallback, useMemo } from 'react'
import { Airport } from '../types/flight'
import { getAirport } from '../data/airports'
import { getCookie, setCookie } from '../utils/cookies'

const COOKIE_KEY = 'flighttracker_bookmarked_airports'

export function useBookmarkedAirports() {
  const [bookmarkedIatas, setBookmarkedIatas] = useState<string[]>(() => {
    const raw = getCookie(COOKIE_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map(item => item.trim().toUpperCase())
      }
    } catch (err) {
      console.warn('Failed to parse bookmarked airports from cookie', err)
    }
    return []
  })

  // Optional cache for dynamically created airports not in static dictionary
  const [customAirportsMap, setCustomAirportsMap] = useState<Record<string, Airport>>({})

  const bookmarkedAirports = useMemo(() => {
    const result: Airport[] = []
    for (const code of bookmarkedIatas) {
      const found = getAirport(code) || customAirportsMap[code]
      if (found) {
        result.push(found)
      } else {
        // Fallback for codes without coordinates
        result.push({
          iata: code,
          icao: code,
          name: code,
          city: '',
          country: '',
          latitude: 0,
          longitude: 0,
        })
      }
    }
    return result
  }, [bookmarkedIatas, customAirportsMap])

  const isBookmarked = useCallback(
    (code?: string | null) => {
      if (!code) return false
      return bookmarkedIatas.includes(code.toUpperCase().trim())
    },
    [bookmarkedIatas]
  )

  const toggleBookmark = useCallback((airportOrCode: Airport | string) => {
    const code = (typeof airportOrCode === 'string' ? airportOrCode : airportOrCode.iata)
      .toUpperCase()
      .trim()
    if (!code) return

    if (typeof airportOrCode !== 'string') {
      setCustomAirportsMap(prev => ({ ...prev, [code]: airportOrCode }))
    }

    setBookmarkedIatas(prev => {
      const isAlready = prev.includes(code)
      const next = isAlready ? prev.filter(c => c !== code) : [...prev, code]
      setCookie(COOKIE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeBookmark = useCallback((code: string) => {
    const upper = code.toUpperCase().trim()
    setBookmarkedIatas(prev => {
      if (!prev.includes(upper)) return prev
      const next = prev.filter(c => c !== upper)
      setCookie(COOKIE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return {
    bookmarkedIatas,
    bookmarkedAirports,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
  }
}
