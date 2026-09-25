import { GeoJsonLayer } from '@deck.gl/layers'
import northAmericaBorders from '../../../data/northAmericaBorders.json'
import { PALETTE } from '../../../constants/palette'

/**
 * Renders subtle country land borders for North America as a base Deck.gl layer.
 * Placed directly above raster map tiles and beneath routes, airports, and flights.
 */
export function createCountryBordersLayer(): GeoJsonLayer {
  return new GeoJsonLayer({
    id: 'country-borders-north-america',
    data: northAmericaBorders as any,
    stroked: true,
    filled: false,
    getLineColor: PALETTE.BORDER_GRAY,
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 0.75,
    lineWidthMaxPixels: 1.5,
    pickable: false,
    parameters: {
      depthCompare: 'always' as const,
      depthWriteEnabled: false,
    },
  })
}
