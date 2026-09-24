import React, { useState, useMemo, useCallback } from 'react'
import { Flight, FlightFilters } from './types/flight'
import { useFlightFeed } from './hooks/useFlightFeed'
import { usePinnedFlights } from './hooks/usePinnedFlights'
import { filterFlights } from './services/filterService'
import { Header } from './components/header/Header'
import { FilterBar } from './components/header/FilterBar'
import { FlightMap } from './components/map/FlightMap'
import { FlightDetailDrawer } from './components/sidebar/FlightDetailDrawer'
import { PinnedFlightsDrawer } from './components/sidebar/PinnedFlightsDrawer'
import { MapControls } from './components/map/MapControls'

export const App: React.FC = () => {
  // 1. Filter State
  const [filters, setFilters] = useState<FlightFilters>({
    region: 'north_america',
    searchQuery: '',
    airlineIcao: '',
    originAirport: '',
    destAirport: '',
    hideOnGround: false,
  })

  // 2. Map Camera ViewState
  const [viewState, setViewState] = useState({
    longitude: -98.5,
    latitude: 39.8,
    zoom: 4.2,
    pitch: 35,
    bearing: 0,
  })

  // 3. UI Drawer & Selection States
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false)
  const [forceMockMode, setForceMockMode] = useState(false)

  // 4. Live Data Feed Hook (updates every 60s or manual refresh)
  const {
    flights,
    arcs,
    isLoading,
    isRefreshing,
    isMockMode,
    lastUpdated,
    refresh,
  } = useFlightFeed({
    region: filters.region,
    forceMock: forceMockMode,
    selectedFlightId: selectedFlightId || undefined,
    pollIntervalMs: 60000,
  })

  // 5. Pinned Flights Storage Hook
  const { pinnedIds, togglePin, isPinned } = usePinnedFlights()

  // 6. Filter active flights
  const filteredFlights = useMemo(() => {
    return filterFlights(flights, filters)
  }, [flights, filters])

  // Filter arcs to match filtered flights
  const activeFlightIdSet = useMemo(() => {
    return new Set(filteredFlights.map(f => f.id))
  }, [filteredFlights])

  const filteredArcs = useMemo(() => {
    return arcs.filter(a => activeFlightIdSet.has(a.flightId))
  }, [arcs, activeFlightIdSet])

  // Find currently selected flight object
  const selectedFlight = useMemo(() => {
    if (!selectedFlightId) return null
    return flights.find(f => f.id === selectedFlightId) || null
  }, [flights, selectedFlightId])

  // Resolve pinned flights objects
  const pinnedFlights = useMemo(() => {
    const idSet = new Set(pinnedIds)
    return flights.filter(f => idSet.has(f.id))
  }, [flights, pinnedIds])

  // Camera Actions
  const handleFlyTo = useCallback((lat: number, lon: number, zoom = 7.5) => {
    setViewState(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      zoom,
      pitch: 45,
    }))
  }, [])

  const handleSelectFlight = useCallback((flight: Flight) => {
    setSelectedFlightId(flight.id)
    handleFlyTo(flight.latitude, flight.longitude, Math.max(viewState.zoom, 6))
  }, [handleFlyTo, viewState.zoom])

  const handleTogglePitch = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      pitch: prev.pitch > 0 ? 0 : 45,
    }))
  }, [])

  const handleResetBearing = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      bearing: 0,
    }))
  }, [])

  const handleZoom = useCallback((delta: number) => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(12, Math.max(2, prev.zoom + delta)),
    }))
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 1. Header Toolbar */}
      <Header
        filters={filters}
        onFiltersChange={setFilters}
        flightCount={flights.length}
        arcCount={filteredArcs.length}
        pinnedCount={pinnedIds.length}
        onTogglePinnedDrawer={() => setIsPinnedDrawerOpen(prev => !prev)}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isMockMode={isMockMode}
        onToggleMockMode={() => setForceMockMode(prev => !prev)}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      {/* 2. Secondary Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={flights.length}
        filteredCount={filteredFlights.length}
      />

      {/* 3. Main Deck.gl + MapLibre Map */}
      <FlightMap
        flights={filteredFlights}
        arcs={filteredArcs}
        selectedFlightId={selectedFlightId || undefined}
        pinnedFlightIds={pinnedIds}
        onSelectFlight={handleSelectFlight}
        viewState={viewState}
        onViewStateChange={setViewState}
      />

      {/* 4. Map Camera & Hub Controls */}
      <MapControls
        pitch={viewState.pitch}
        onTogglePitch={handleTogglePitch}
        onResetBearing={handleResetBearing}
        onZoom={handleZoom}
        onFlyTo={handleFlyTo}
      />

      {/* 5. Selected Flight Detail Inspector Drawer */}
      <FlightDetailDrawer
        flight={selectedFlight}
        onClose={() => setSelectedFlightId(null)}
        isPinned={selectedFlight ? isPinned(selectedFlight.id) : false}
        onTogglePin={togglePin}
        onFocusCamera={(lat, lon) => handleFlyTo(lat, lon, 7)}
      />

      {/* 6. Pinned / Watched Flights Drawer */}
      <PinnedFlightsDrawer
        isOpen={isPinnedDrawerOpen}
        onClose={() => setIsPinnedDrawerOpen(false)}
        pinnedFlights={pinnedFlights}
        onSelectFlight={handleSelectFlight}
        onUnpin={togglePin}
      />
    </div>
  )
}

export default App
