import { useState, useEffect, useCallback, useRef } from 'react'
import { Flight, FlightArc, FlightSource, Airport } from '../types/flight'
import { fetchFlightFeed } from '../api/flightApi'
import {
  getRefreshCooldownRemainingSeconds,
  recordRefreshInCookie,
} from '../utils/cookies'

interface UseFlightFeedOptions {
  region: 'north_america' | 'global'
  forceMock?: boolean
  selectedFlightId?: string
  selectedAirport?: Airport | null
  pollIntervalMs?: number
}

export function useFlightFeed({
  region,
  forceMock = false,
  selectedFlightId,
  selectedAirport,
  pollIntervalMs = 60000,
}: UseFlightFeedOptions) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [arcs, setArcs] = useState<FlightArc[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [isMockMode, setIsMockMode] = useState<boolean>(forceMock)
  const [activeSource, setActiveSource] = useState<FlightSource>('fr24')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedFlightIdRef = useRef(selectedFlightId)
  useEffect(() => {
    selectedFlightIdRef.current = selectedFlightId
  }, [selectedFlightId])

  const selectedAirportRef = useRef(selectedAirport)
  useEffect(() => {
    selectedAirportRef.current = selectedAirport
  }, [selectedAirport])

  const lastFetchedRef = useRef<number>(0)
  const lastManualRefreshRef = useRef<number>(0)

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      const remainingCooldown = getRefreshCooldownRemainingSeconds()
      if (remainingCooldown > 0) {
        return // Enforce cross-tab cookie cooldown on manual programmatic calls
      }
      recordRefreshInCookie()
      lastManualRefreshRef.current = Date.now()
      setIsRefreshing(true)
    }

    try {
      const response = await fetchFlightFeed(
        region,
        forceMock,
        selectedFlightIdRef.current,
        selectedAirportRef.current
      )

      lastFetchedRef.current = Date.now()
      setFlights(response.flights)
      setArcs(response.arcs)
      setLastUpdated(new Date(response.timestamp))
      setIsMockMode(response.isMock)
      setActiveSource(response.source)
      setErrorMessage(response.error || null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown fetch error'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [region, forceMock])

  useEffect(() => {
    if (selectedAirport) {
      loadData(false)
    }
  }, [selectedAirport, loadData])

  useEffect(() => {
    // Initial fetch on mount
    loadData(false)

    let timer: ReturnType<typeof setInterval> | null = null

    const startPolling = () => {
      if (timer) clearInterval(timer)
      timer = setInterval(() => {
        // Skip polling if tab is minimized or in the background
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
          return
        }
        loadData(false)
      }, pollIntervalMs)
    }

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return

      if (document.visibilityState === 'visible') {
        // Tab became active again. If data is stale (> 30s), refresh immediately
        const elapsed = Date.now() - lastFetchedRef.current
        if (elapsed > 30000) {
          loadData(false)
        }
        startPolling()
      } else {
        // Tab hidden/minimized: suspend interval timer to prevent burning API calls
        if (timer) {
          clearInterval(timer)
          timer = null
        }
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (timer) clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadData, pollIntervalMs])

  return {
    flights,
    arcs,
    isLoading,
    isRefreshing,
    isMockMode,
    activeSource,
    lastUpdated,
    errorMessage,
    refresh: () => loadData(true),
  }
}
