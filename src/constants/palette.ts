export type ColorRGBA = [number, number, number, number]

export const MAP_PALETTE = {
  // Highlights & Statuses
  YELLOW: [250, 204, 21, 255] as ColorRGBA,        // Highlighted / Hovered aircraft & airport (#facc15)
  YELLOW_GLOW_FILL: [250, 204, 21, 50] as ColorRGBA,
  YELLOW_GLOW_LINE: [250, 204, 21, 240] as ColorRGBA,
  CYAN: [56, 189, 248, 255] as ColorRGBA,          // Origin endpoint / Active Hub / High cruise (#38bdf8)
  CYAN_ARC_DIM: [56, 189, 248, 35] as ColorRGBA,
  ROSE: [244, 63, 94, 255] as ColorRGBA,           // Destination endpoint (#f43f5e)
  ROSE_ARC_DIM: [244, 63, 94, 45] as ColorRGBA,
  AMBER: [245, 158, 11, 255] as ColorRGBA,         // Pinned aircraft (#f59e0b)
  AMBER_GLOW_FILL: [245, 158, 11, 35] as ColorRGBA,
  AMBER_GLOW_LINE: [245, 158, 11, 200] as ColorRGBA,
  INDIGO: [129, 140, 248, 255] as ColorRGBA,       // Mid-altitude cruise (#818cf8)
  EMERALD: [52, 211, 153, 255] as ColorRGBA,       // Climb / Approach (#34d399)
  SLATE_GROUND: [148, 163, 184, 220] as ColorRGBA, // Ground / Taxiing aircraft

  // Airport Markers & Waypoints
  AIRPORT_DOT: [186, 200, 222, 225] as ColorRGBA,  // Cool Platinum Ice airport marker

  // Typography & Overlays
  TEXT_DEFAULT: [243, 244, 246, 230] as ColorRGBA, // Default flight ID text
  TEXT_MUTED: [226, 232, 240, 220] as ColorRGBA,   // Airport IATA labels
  TEXT_OD: [145, 107, 2, 255] as ColorRGBA,      // OD pair second line text
  DARK_BG: [15, 23, 42, 210] as ColorRGBA,         // Text badge backdrop (slate-950)
  DARK_BG_DEEP: [15, 23, 42, 225] as ColorRGBA,    // Second line badge backdrop
  DARK_RIM: [15, 23, 42, 240] as ColorRGBA,        // Dark high-contrast dot boundary
  WHITE_RIM: [255, 255, 255, 255] as ColorRGBA,    // Active / Hovered dot boundary
} as const

export const PALETTE = MAP_PALETTE
