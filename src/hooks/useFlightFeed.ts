import { useState, useEffect, useCallback, useRef } from 'react'
import { Flight, FlightArc } from '../types/flight'
import { fetchFlightFeed } from '../api/flightApi'

interface UseFlightFeedOptions {
  region: 'north_america' | 'global'
  forceMock?: boolean
  selectedFlightId?: string
  pollIntervalMs?: number // e.g. 60000 (1 min) or 300000 (5 mins)
}

export function useFlightFeed({
  region,
  forceMock = false,
  selectedFlightId,
  pollIntervalMs = 60000,
}: UseFlightFeedOptions) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [arcs, setArcs] = useState<FlightArc[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [isMockMode, setIsMockMode] = useState<boolean>(forceMock)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedFlightIdRef = useRef(selectedFlightId)
  selectedFlightIdRef.current = selectedFlightId

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true)
    }

    try {
      const response = await fetchFlightFeed(
        region,
        forceMock,
        selectedFlightIdRef.current
      )

      setFlights(response.flights)
      setArcs(response.arcs)
      setLastUpdated(new Date(response.timestamp))
      setIsMockMode(response.isMock)
      setErrorMessage(response.error || null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown fetch error'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [region, forceMock])

  // Initial fetch and polling cycle
  useEffect(() => {
    loadData(false)

    const timer = setInterval(() => {
      loadData(false)
    }, pollIntervalMs)

    return () => clearInterval(timer)
  }, [loadData, pollIntervalMs])

  return {
    flights,
    arcs,
    isLoading,
    isRefreshing,
    isMockMode,
    lastUpdated,
    errorMessage,
    refresh: () => loadData(true),
  }
}
