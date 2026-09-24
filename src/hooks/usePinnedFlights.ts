import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'flighttracker_pinned_ids'

export function usePinnedFlights() {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedIds))
    } catch (err) {
      console.error('Failed to save pinned flights to localStorage', err)
    }
  }, [pinnedIds])

  const togglePin = useCallback((flightId: string) => {
    setPinnedIds(prev => {
      if (prev.includes(flightId)) {
        return prev.filter(id => id !== flightId)
      } else {
        return [...prev, flightId]
      }
    })
  }, [])

  const isPinned = useCallback((flightId: string) => {
    return pinnedIds.includes(flightId)
  }, [pinnedIds])

  return {
    pinnedIds,
    togglePin,
    isPinned,
  }
}
