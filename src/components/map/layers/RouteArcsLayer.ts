import { ArcLayer } from '@deck.gl/layers'
import { FlightArc } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'

export interface RouteArcsLayerProps {
  arcs: FlightArc[]
  selectedFlightId?: string
}

export function createRouteArcsLayer({
  arcs,
  selectedFlightId,
}: RouteArcsLayerProps): ArcLayer<FlightArc> {
  return new ArcLayer<FlightArc>({
    id: 'arcs-routes',
    data: arcs,
    getSourcePosition: d => d.source,
    getTargetPosition: d => d.target,
    greatCircle: true,
    getHeight: 0,
    getSourceColor: d => (d.flightId === selectedFlightId ? PALETTE.CYAN : PALETTE.CYAN_ARC_DIM),
    getTargetColor: d => (d.flightId === selectedFlightId ? PALETTE.ROSE : PALETTE.ROSE_ARC_DIM),
    getWidth: d => (d.flightId === selectedFlightId ? 3.5 : 1.2),
    pickable: false,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    updateTriggers: {
      getSourceColor: [selectedFlightId],
      getTargetColor: [selectedFlightId],
      getWidth: [selectedFlightId],
    },
  })
}
