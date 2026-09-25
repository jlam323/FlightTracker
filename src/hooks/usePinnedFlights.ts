import { useState, useEffect, useCallback, useMemo } from 'react'
import { Flight } from '../types/flight'

const STORAGE_KEY_IDS = 'flighttracker_pinned_ids'
const STORAGE_KEY_FLIGHTS = 'flighttracker_pinned_flights'

export function usePinnedFlights(liveFlights: Flight[] = []) {
  // Pinned flight IDs preserving order
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_IDS)
      if (!saved) return []
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : []
    } catch {
      return []
    }
  })

  // Map of flightId -> last known Flight object
  const [lastKnownFlights, setLastKnownFlights] = useState<Record<string, Flight>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FLIGHTS)
      if (!saved) return {}
      const parsed = JSON.parse(saved) as Record<string, Flight>
      const result: Record<string, Flight> = {}
      for (const [id, f] of Object.entries(parsed)) {
        if (f && typeof f === 'object') {
          result[id] = {
            ...f,
            estimatedArrivalTime: f.estimatedArrivalTime ? new Date(f.estimatedArrivalTime) : undefined,
            isLive: false,
            lastKnown: true,
          }
        }
      }
      return result
    } catch {
      return {}
    }
  })

  // Persist pinned IDs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(pinnedIds))
    } catch (err) {
      console.error('Failed to save pinned flight IDs to localStorage', err)
    }
  }, [pinnedIds])

  // Persist last known flight objects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FLIGHTS, JSON.stringify(lastKnownFlights))
    } catch (err) {
      console.error('Failed to save pinned flight objects to localStorage', err)
    }
  }, [lastKnownFlights])

  // Synchronize live flights into lastKnownFlights whenever live telemetry updates
  useEffect(() => {
    if (!liveFlights || liveFlights.length === 0 || pinnedIds.length === 0) return

    queueMicrotask(() => {
      setLastKnownFlights(prev => {
        let changed = false
        const next = { ...prev }

        for (const flight of liveFlights) {
          if (pinnedIds.includes(flight.id)) {
            const existing = prev[flight.id]
            if (
              !existing ||
              existing.lastContact !== flight.lastContact ||
              existing.latitude !== flight.latitude ||
              existing.longitude !== flight.longitude ||
              existing.altitude !== flight.altitude ||
              existing.heading !== flight.heading ||
              existing.speed !== flight.speed ||
              existing.verticalSpeed !== flight.verticalSpeed
            ) {
              next[flight.id] = {
                ...flight,
                isLive: true,
                lastKnown: false,
              }
              changed = true
            }
          }
        }

        return changed ? next : prev
      })
    })
  }, [liveFlights, pinnedIds])

  // Toggle pin on a flight (stores current flight data or looks up in liveFlights)
  const togglePin = useCallback((flightId: string, flight?: Flight) => {
    setPinnedIds(prev => {
      const isAlreadyPinned = prev.includes(flightId)
      if (isAlreadyPinned) {
        // Unpin: remove from lastKnownFlights map as well
        setLastKnownFlights(flightsPrev => {
          if (!flightsPrev[flightId]) return flightsPrev
          const next = { ...flightsPrev }
          delete next[flightId]
          return next
        })
        return prev.filter(id => id !== flightId)
      } else {
        // Pin: cache current or live flight object
        const flightToStore = flight || liveFlights.find(f => f.id === flightId)
        if (flightToStore) {
          setLastKnownFlights(flightsPrev => ({
            ...flightsPrev,
            [flightId]: {
              ...flightToStore,
              isLive: true,
              lastKnown: false,
            },
          }))
        }
        return [...prev, flightId]
      }
    })
  }, [liveFlights])

  // Explicit unpin function
  const unpinFlight = useCallback((flightId: string) => {
    setPinnedIds(prev => prev.filter(id => id !== flightId))
    setLastKnownFlights(prev => {
      if (!prev[flightId]) return prev
      const next = { ...prev }
      delete next[flightId]
      return next
    })
  }, [])

  // Explicit clear all function
  const clearAllPinned = useCallback(() => {
    setPinnedIds([])
    setLastKnownFlights({})
  }, [])

  const isPinned = useCallback((flightId: string) => {
    return pinnedIds.includes(flightId)
  }, [pinnedIds])

  // Compute pinned flights list (preserving pinned order, merging live data or last known data)
  const pinnedFlights = useMemo(() => {
    const liveMap = new Map<string, Flight>()
    if (liveFlights) {
      for (const f of liveFlights) {
        liveMap.set(f.id, f)
      }
    }

    const result: Flight[] = []
    for (const id of pinnedIds) {
      const live = liveMap.get(id)
      if (live) {
        result.push({
          ...live,
          isLive: true,
          lastKnown: false,
        })
      } else if (lastKnownFlights[id]) {
        result.push({
          ...lastKnownFlights[id],
          isLive: false,
          lastKnown: true,
        })
      } else {
        // Fallback for pinned IDs without stored metadata
        result.push({
          id,
          flightNumber: id,
          callsign: id,
          latitude: 0,
          longitude: 0,
          altitude: 0,
          heading: 0,
          speed: 0,
          verticalSpeed: 0,
          onGround: true,
          lastContact: 0,
          isLive: false,
          lastKnown: true,
        })
      }
    }
    return result
  }, [pinnedIds, liveFlights, lastKnownFlights])

  return {
    pinnedIds,
    pinnedFlights,
    lastKnownFlights,
    togglePin,
    unpinFlight,
    clearAllPinned,
    isPinned,
  }
}
