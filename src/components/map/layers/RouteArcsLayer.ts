import { ArcLayer, PathLayer } from '@deck.gl/layers'
import type { Layer } from '@deck.gl/core'
import { FlightArc } from '../../../types/flight'
import { PALETTE, ColorRGBA } from '../../../constants/palette'
import { generateGreatCircleRoutePoints } from '../../../utils/geo'

export interface RouteArcsLayerProps {
  arcs: FlightArc[]
  selectedFlightId?: string
}

export interface RouteSegment {
  path: [[number, number], [number, number]]
  highlightColor: ColorRGBA
  dimColor: ColorRGBA
  flightId: string
}

function interpolateColor(c1: ColorRGBA, c2: ColorRGBA, t: number): ColorRGBA {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
    Math.round(c1[3] + (c2[3] - c1[3]) * t),
  ]
}

export function createRouteArcsLayer({
  arcs,
  selectedFlightId,
}: RouteArcsLayerProps): Layer[] {
  const standardArcs: FlightArc[] = []
  const transpacificSegments: RouteSegment[] = []

  for (const arc of arcs) {
    const lon1 = arc.source[0]
    const lat1 = arc.source[1]
    const lon2 = arc.target[0]
    const lat2 = arc.target[1]

    const isTranspacific = Math.abs(lon2 - lon1) > 180

    if (!isTranspacific) {
      standardArcs.push(arc)
      continue
    }

    // Generate continuous unwrapped Great-Circle points across the antimeridian
    const pts = generateGreatCircleRoutePoints(lon1, lat1, lon2, lat2, 25)

    // Determine Western copy (across -180) and Eastern copy (across +180)
    let ptsWestern: [number, number][]
    let ptsEastern: [number, number][]

    if (lon1 < 0) {
      // Westbound (Americas -> Asia)
      ptsWestern = pts
      ptsEastern = pts.map(([x, y]) => [x + 360, y])
    } else {
      // Eastbound (Asia -> Americas)
      ptsEastern = pts
      ptsWestern = pts.map(([x, y]) => [x - 360, y])
    }

    // Build segments for both world copies with smooth Cyan -> Rose gradient
    const n = pts.length
    for (let i = 0; i < n - 1; i++) {
      const t = (i + 0.5) / (n - 1)
      const highlightColor = interpolateColor(PALETTE.CYAN, PALETTE.ROSE, t)
      const dimColor = interpolateColor(PALETTE.CYAN_ARC_DIM, PALETTE.ROSE_ARC_DIM, t)

      transpacificSegments.push({
        path: [ptsWestern[i], ptsWestern[i + 1]],
        highlightColor,
        dimColor,
        flightId: arc.flightId,
      })
      transpacificSegments.push({
        path: [ptsEastern[i], ptsEastern[i + 1]],
        highlightColor,
        dimColor,
        flightId: arc.flightId,
      })
    }
  }

  // Sort transpacific segments so selected flight's segments render on top
  if (selectedFlightId) {
    transpacificSegments.sort((a, b) => {
      if (a.flightId === selectedFlightId && b.flightId !== selectedFlightId) return 1
      if (a.flightId !== selectedFlightId && b.flightId === selectedFlightId) return -1
      return 0
    })
  }

  const standardArcLayer = new ArcLayer<FlightArc>({
    id: 'arcs-routes-standard',
    data: standardArcs,
    getSourcePosition: d => d.source,
    getTargetPosition: d => d.target,
    greatCircle: true,
    wrapLongitude: false,
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

  if (transpacificSegments.length === 0) {
    return [standardArcLayer]
  }

  const transpacificPathLayer = new PathLayer<RouteSegment>({
    id: 'arcs-routes-transpacific',
    data: transpacificSegments,
    getPath: d => d.path,
    getColor: d => (d.flightId === selectedFlightId ? d.highlightColor : d.dimColor),
    getWidth: d => (d.flightId === selectedFlightId ? 3.5 : 1.2),
    widthUnits: 'pixels',
    capRounded: true,
    jointRounded: true,
    wrapLongitude: false,
    pickable: false,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    updateTriggers: {
      getColor: [selectedFlightId],
      getWidth: [selectedFlightId],
    },
  })

  const isSelectedTranspacific =
    selectedFlightId && transpacificSegments.some(s => s.flightId === selectedFlightId)

  return isSelectedTranspacific
    ? [standardArcLayer, transpacificPathLayer]
    : [transpacificPathLayer, standardArcLayer]
}

