export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Zone {
  id: string
  name: string
  type: 'hotzone'
  coordinates: [number, number] // [lng, lat]
  riskScore: number
  riskLevel: RiskLevel
  description: string
}

export interface TradeLane {
  id: string
  name: string
  riskLevel: RiskLevel
  coordinates: [number, number][]
}

export const ZONES: Zone[] = [
  { id: 'red-sea',       name: 'Red Sea / Bab-el-Mandeb', type: 'hotzone', coordinates: [43.3, 12.5],   riskScore: 8.4, riskLevel: 'critical', description: 'Houthi strikes ongoing. Major carriers rerouting via Cape of Good Hope.' },
  { id: 'hormuz',        name: 'Strait of Hormuz',         type: 'hotzone', coordinates: [56.3, 26.6],   riskScore: 9.8, riskLevel: 'critical', description: 'Effectively closed to commercial traffic. 21 confirmed ship attacks. War-risk insurance withdrawn.' },
  { id: 'panama',        name: 'Panama Canal',             type: 'hotzone', coordinates: [-79.7, 9.1],   riskScore: 5.4, riskLevel: 'medium',   description: 'Water levels recovering. Delays persist, queue times elevated.' },
  { id: 'suez',          name: 'Suez Canal',               type: 'hotzone', coordinates: [32.3, 30.5],   riskScore: 7.0, riskLevel: 'high',     description: 'Reduced traffic. Most Asia-Europe vessels diverting around Africa.' },
  { id: 'malacca',       name: 'Strait of Malacca',        type: 'hotzone', coordinates: [101.2, 2.5],   riskScore: 3.2, riskLevel: 'low',      description: 'Heavy traffic from Cape rerouting. Piracy monitoring active.' },
  { id: 'taiwan',        name: 'Taiwan Strait',            type: 'hotzone', coordinates: [119.5, 24.5],  riskScore: 6.5, riskLevel: 'high',     description: 'Military activity above baseline. PLA exercises ongoing.' },
  { id: 'black-sea',     name: 'Black Sea',                type: 'hotzone', coordinates: [34.0, 43.0],   riskScore: 7.2, riskLevel: 'high',     description: 'Ongoing conflict zone. Humanitarian corridors active.' },
  { id: 'rotterdam',     name: 'Port of Rotterdam',        type: 'hotzone', coordinates: [4.1, 51.9],    riskScore: 2.8, riskLevel: 'low',      description: 'Operational. Handling surge from Cape rerouting.' },
  { id: 'shanghai',      name: 'Port of Shanghai',         type: 'hotzone', coordinates: [121.5, 31.2],  riskScore: 4.2, riskLevel: 'medium',   description: 'Congestion from rerouted cargo flows.' },
  { id: 'la-long-beach', name: 'Port of LA / Long Beach',  type: 'hotzone', coordinates: [-118.2, 33.7], riskScore: 3.8, riskLevel: 'low',      description: 'Increased vessel calls. Labor stable.' },
]

export const TRADE_LANES: TradeLane[] = [
  {
    // PRIMARY 2026 route — Cape of Good Hope (all major carriers)
    id: 'far-east-north-europe-cape',
    name: 'Far East → North Europe (Cape Route)',
    riskLevel: 'high',
    coordinates: [
      [121.5, 31.2], [118.0, 24.0], [114.1, 22.3],
      [110.0, 5.0],  [103.8, 1.3],  [101.2, 2.5],
      [95.0, 4.0],   [88.0, 5.0],   [80.0, 7.0],
      [75.0, 8.0],   [72.0, 8.5],   [68.0, 10.0],
      [65.0, 12.0],  [60.0, 12.0],  [55.0, 10.0],
      [50.0, 8.0],   [45.0, 5.0],   [42.0, 2.0],
      [40.0, -2.0],  [38.0, -8.0],  [36.0, -15.0],
      [34.0, -22.0], [30.0, -30.0], [26.0, -35.0],
      [20.0, -38.0], [18.5, -34.4], [12.0, -32.0],
      // West Africa offshore — pushed well into Atlantic
      [-10.0, -5.0], [-22.0, 2.0],  [-24.0, 8.0],
      [-22.0, 18.0], [-20.0, 28.0], [-18.0, 36.0],
      [-16.0, 32.0], [-12.0, 40.0], [-5.0, 46.0],
      [4.1, 51.9],
    ],
  },
  {
    // DISRUPTED route — via Suez (shown for reference, risk critical)
    id: 'far-east-north-europe-suez',
    name: 'Far East → North Europe (Suez — Disrupted)',
    riskLevel: 'critical',
    coordinates: [
      [121.5, 31.2], [114.1, 22.3], [103.8, 1.3],
      [101.2, 2.5],  [80.0, 7.0],   [65.0, 15.0],
      [57.0, 21.0],  [56.3, 26.6],  [50.0, 15.0],
      [45.0, 12.0],  [43.3, 12.5],  [40.0, 14.0],
      [35.0, 20.0],  [32.3, 30.5],  [30.0, 33.0],
      [25.0, 34.5],  [20.0, 35.5],  [14.0, 37.5],
      // West of Gibraltar, offshore
      [-12.0, 40.0], [-16.0, 32.0],
      // Back north to Rotterdam via open Atlantic
      [-12.0, 40.0], [-5.0, 46.0],  [4.1, 51.9],
    ],
  },
  {
    id: 'far-east-north-america-west',
    name: 'Far East → North America West Coast',
    riskLevel: 'medium',
    coordinates: [
      [121.5, 31.2], [130.0, 33.0], [140.0, 36.0],
      [150.0, 39.0], [160.0, 41.5], [170.0, 43.0],
      [178.0, 43.5], [180.0, 43.5], [-178.0, 43.5],
      [-168.0, 43.0], [-155.0, 41.0], [-143.0, 38.0],
      [-132.0, 36.0], [-125.0, 34.5], [-118.2, 33.7],
    ],
  },
  {
    id: 'north-america-east-europe',
    name: 'North America East Coast → Europe',
    riskLevel: 'low',
    coordinates: [
      [-74.0, 40.7], [-68.0, 42.0], [-62.0, 44.0],
      [-55.0, 46.0], [-47.0, 47.5], [-40.0, 48.5],
      [-33.0, 49.5], [-25.0, 50.5], [-18.0, 51.0],
      [-10.0, 51.5], [-4.0, 51.5],  [4.1, 51.9],
    ],
  },
  {
    id: 'middle-east-europe',
    name: 'Middle East → Europe (Cape Diversion)',
    riskLevel: 'critical',
    coordinates: [
      [56.3, 26.6],  [60.0, 18.0],  [65.0, 13.0],
      [60.0, 8.0],   [55.0, 5.0],   [50.0, 2.0],
      [45.0, -2.0],  [42.0, -8.0],  [38.0, -18.0],
      // East Africa offshore — pushed into Indian Ocean
      [34.0, -26.0], [30.0, -37.0], [50.0, -28.0],
      [55.0, -20.0], [52.0, -12.0], [18.5, -34.4],
      [12.0, -32.0],
      // West Africa offshore — pushed into Atlantic
      [-10.0, -5.0], [-22.0, 2.0],  [-24.0, 8.0],
      [-22.0, 18.0], [-20.0, 28.0], [-18.0, 36.0],
      [-12.0, 40.0], [-5.0, 46.0],  [4.1, 51.9],
    ],
  },
  {
    id: 'middle-east-asia',
    name: 'Middle East → Asia',
    riskLevel: 'high',
    coordinates: [
      [56.3, 26.6],  [60.0, 20.0],  [63.0, 16.0],
      [67.0, 12.0],  [70.0, 10.0],  [74.0, 8.5],
      [78.0, 7.5],   [82.0, 6.5],   [86.0, 6.0],
      [90.0, 5.5],   [95.0, 4.5],   [99.0, 3.5],
      [101.2, 2.5],  [103.8, 1.3],  [108.0, 10.0],
      [114.1, 22.3], [119.5, 28.0], [121.5, 31.2],
    ],
  },
  {
    id: 'intra-asia',
    name: 'Intra-Asia',
    riskLevel: 'medium',
    coordinates: [
      [121.5, 31.2], [119.5, 24.5], [116.0, 20.0],
      [114.1, 22.3], [111.0, 18.0], [108.0, 14.0],
      [106.8, 10.8], [105.0, 6.0],  [103.8, 1.3],
      [101.2, 2.5],  [99.5, 4.5],   [97.5, 7.5],
      [95.5, 11.0],  [92.0, 16.0],  [88.0, 21.0],
      [85.0, 18.0],  [80.5, 13.0],  [77.5, 8.5],
    ],
  },
  {
    id: 'south-america-europe',
    name: 'South America → Europe',
    riskLevel: 'low',
    coordinates: [
      // Start offshore Brazil — no coast clipping
      [-42.0, -23.0], [-40.0, -17.0], [-36.0, -8.0],
      [-32.0, 0.0],   [-28.0, 8.0],   [-25.0, 15.0],
      [-20.0, 25.0],  [-14.0, 33.0],  [-8.0, 39.0],
      [-3.0, 45.0],   [4.1, 51.9],
    ],
  },
]

// Backwards-compat alias so app/page.tsx can still import HOT_ZONES
export const HOT_ZONES = ZONES
