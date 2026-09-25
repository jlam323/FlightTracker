import React, { useState, useMemo, useCallback } from 'react'
import { Flight, FlightFilters, Airport } from './types/flight'
import { useFlightFeed } from './hooks/useFlightFeed'
import { usePinnedFlights } from './hooks/usePinnedFlights'
import { useBookmarkedAirports } from './hooks/useBookmarkedAirports'
import { filterFlights } from './services/filterService'
import { Header } from './components/header/Header'
import { FilterBar } from './components/header/FilterBar'
import { FlightMap } from './components/map/FlightMap'
import { FlightDetailDrawer } from './components/sidebar/FlightDetailDrawer'
import { PinnedFlightsDrawer } from './components/sidebar/PinnedFlightsDrawer'
import { AirportDetailDrawer } from './components/sidebar/AirportDetailDrawer'
import { MapControls } from './components/map/MapControls'

export const App: React.FC = () => {
  // 1. Filter State
  const [filters, setFilters] = useState<FlightFilters>({
    region: 'north_america',
    searchQuery: '',
    airlineIcao: '',
    originAirport: '',
    destAirport: '',
  })

  // 2. Map Camera ViewState
  const [viewState, setViewState] = useState({
    longitude: -98.5,
    latitude: 39.8,
    zoom: 4.2,
    pitch: 0,
    bearing: 0,
  })

  // 3. UI Drawer & Selection States
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false)
  const [forceMockMode, setForceMockMode] = useState(false)
  const [showAirportCodes, setShowAirportCodes] = useState(true)

  const handleToggleAirportCodes = useCallback(() => {
    setShowAirportCodes(prev => !prev)
  }, [])

  // 4. Live Data Feed Hook (updates every 60s or manual refresh)
  const {
    flights,
    arcs,
    isLoading,
    isRefreshing,
    isMockMode,
    activeSource,
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

  // 5b. Bookmarked Airports Storage Hook (persisted in cookies)
  const { bookmarkedAirports, isBookmarked, toggleBookmark } = useBookmarkedAirports()

  // 6. Filter active flights
  const filteredFlights = useMemo(() => {
    return filterFlights(flights, filters, pinnedIds)
  }, [flights, filters, pinnedIds])

  // Filter arcs to match filtered flights
  const activeFlightIdSet = useMemo(() => {
    return new Set(filteredFlights.map(f => f.id))
  }, [filteredFlights])

  // Find currently selected flight object
  const selectedFlight = useMemo(() => {
    if (!selectedFlightId) return null
    return flights.find(f => f.id === selectedFlightId) || null
  }, [flights, selectedFlightId])

  const filteredArcs = useMemo(() => {
    const baseArcs = arcs.filter(a => activeFlightIdSet.has(a.flightId))
    if (selectedFlight && selectedFlight.onGround && selectedFlight.originAirport && selectedFlight.destAirport) {
      const hasSelectedArc = baseArcs.some(a => a.flightId === selectedFlight.id)
      if (!hasSelectedArc) {
        baseArcs.push({
          id: `arc-${selectedFlight.id}`,
          flightId: selectedFlight.id,
          flightNumber: selectedFlight.flightNumber,
          source: [selectedFlight.originAirport.longitude, selectedFlight.originAirport.latitude],
          target: [selectedFlight.destAirport.longitude, selectedFlight.destAirport.latitude],
          originIata: selectedFlight.originAirport.iata,
          destIata: selectedFlight.destAirport.iata,
          flownSource: [selectedFlight.originAirport.longitude, selectedFlight.originAirport.latitude],
          flownTarget: [selectedFlight.destAirport.longitude, selectedFlight.destAirport.latitude],
          remSource: [selectedFlight.originAirport.longitude, selectedFlight.originAirport.latitude],
          remTarget: [selectedFlight.destAirport.longitude, selectedFlight.destAirport.latitude],
          isHighlighted: true,
        })
      }
    }
    return baseArcs
  }, [arcs, activeFlightIdSet, selectedFlight])

  // Resolve pinned flights objects
  const pinnedFlights = useMemo(() => {
    const idSet = new Set(pinnedIds)
    return flights.filter(f => idSet.has(f.id))
  }, [flights, pinnedIds])

  // Check if search or route filters are actively filtering flights
  const hasActiveFilter = useMemo(() => {
    return Boolean(
      filters.searchQuery.trim() ||
      filters.airlineIcao ||
      filters.originAirport.trim() ||
      filters.destAirport.trim() ||
      filters.airportCode ||
      (filters.flightStates && filters.flightStates.length > 0)
    )
  }, [filters])


  // Camera Actions - Always maintain pure top-down perspective (pitch: 0)
  const handleFlyTo = useCallback((lat: number, lon: number, zoom = 7.5) => {
    setViewState(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      zoom,
      pitch: 0,
    }))
  }, [])

  const handleSelectFlight = useCallback((flight: Flight) => {
    setSelectedFlightId(flight.id)
    setSelectedAirport(null) // Close airport drawer when flight is inspected
    setFilters(prev => ({
      ...prev,
      airportCode: undefined,
    }))
    const airport = flight.originAirport || flight.destAirport
    const lat = flight.onGround && airport ? airport.latitude : flight.latitude
    const lon = flight.onGround && airport ? airport.longitude : flight.longitude
    handleFlyTo(lat, lon, Math.max(viewState.zoom, 7))
  }, [handleFlyTo, viewState.zoom])

  const handleSelectAirport = useCallback((airport: Airport) => {
    setSelectedAirport(airport)
    setSelectedFlightId(null) // Close flight drawer when airport is clicked
    setFilters(prev => ({
      ...prev,
      airportCode: airport.iata,
      originAirport: '',
      destAirport: '',
      flightStates: [],
    }))
    handleFlyTo(airport.latitude, airport.longitude, 7.5)
  }, [handleFlyTo])

  const handleToggleFilterHub = useCallback((airportCode: string) => {
    setFilters(prev => ({
      ...prev,
      airportCode: prev.airportCode === airportCode ? undefined : airportCode,
    }))
  }, [])

  const handleCloseAirportDrawer = useCallback(() => {
    setSelectedAirport(null)
    setFilters(prev => ({
      ...prev,
      airportCode: undefined,
    }))
  }, [])

  const handleResetToAll = useCallback(() => {
    setSelectedAirport(null)
    setFilters(prev => ({
      ...prev,
      airportCode: undefined,
    }))
    handleFlyTo(39.8, -98.5, 3.8)
  }, [handleFlyTo])


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
        flightCount={filteredFlights.length}
        totalFlightCount={flights.length}
        arcCount={filteredArcs.length}
        pinnedCount={pinnedIds.length}
        onTogglePinnedDrawer={() => setIsPinnedDrawerOpen(prev => !prev)}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isMockMode={isMockMode}
        activeSource={activeSource}
        onToggleMockMode={() => setForceMockMode(prev => !prev)}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      {/* 2. Secondary Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        flights={flights}
        pinnedIds={pinnedIds}
        isAirportViewOpen={Boolean(selectedAirport)}
      />




      {/* 3. Main Deck.gl + MapLibre Map */}
      <FlightMap
        flights={filteredFlights}
        arcs={filteredArcs}
        selectedFlightId={selectedFlightId || undefined}
        selectedAirportCode={filters.airportCode}
        pinnedFlightIds={pinnedIds}
        onSelectFlight={handleSelectFlight}
        onSelectAirport={handleSelectAirport}
        viewState={viewState}
        onViewStateChange={setViewState}
        showAirportCodes={showAirportCodes}
        hasActiveFilter={hasActiveFilter}
      />

      {/* 4. Map Camera & Hub Controls */}
      <MapControls
        onZoom={handleZoom}
        onFlyTo={handleFlyTo}
        showAirportCodes={showAirportCodes}
        onToggleAirportCodes={handleToggleAirportCodes}
        bookmarkedAirports={bookmarkedAirports}
        selectedAirportIata={selectedAirport?.iata}
        onSelectAirport={handleSelectAirport}
        onResetToAll={handleResetToAll}
      />


      {/* 5. Selected Flight Detail Inspector Drawer */}
      <FlightDetailDrawer
        flight={selectedFlight}
        onClose={() => setSelectedFlightId(null)}
        isPinned={selectedFlight ? isPinned(selectedFlight.id) : false}
        onTogglePin={togglePin}
        onFocusCamera={(lat, lon) => handleFlyTo(lat, lon, 7)}
      />

      {/* 6. Airport Detail Inspector Drawer */}
      <AirportDetailDrawer
        airport={selectedAirport}
        onClose={handleCloseAirportDrawer}
        flights={flights}
        filters={filters}
        onFiltersChange={setFilters}
        onSelectFlight={handleSelectFlight}
        onFocusCamera={(lat, lon) => handleFlyTo(lat, lon, 7.5)}
        isFilteredByThisAirport={Boolean(selectedAirport && filters.airportCode === selectedAirport.iata)}
        onToggleFilterHub={handleToggleFilterHub}
        isBookmarked={selectedAirport ? isBookmarked(selectedAirport.iata) : false}
        onToggleBookmark={toggleBookmark}
      />

      {/* 7. Pinned / Watched Flights Drawer */}
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
