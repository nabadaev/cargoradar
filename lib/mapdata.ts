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
    id: 'far-east-north-europe-cape',
    name: 'Far East → North Europe (Cape Route)',
    riskLevel: 'high',
    coordinates: [
      [121.5, 31.2], [124.0, 30.0], [126.0, 26.0],
      [124.0, 22.0], [120.0, 17.0], [116.0, 11.0],
      [112.0, 6.0],  [108.0, 3.0],  [104.8, 1.2],
      [101.2, 2.5],  [98.0, 3.0],   [94.0, 2.0],
      [88.0, 1.0],   [82.0, -1.0],  [78.0, -3.0],
      [74.0, -6.0],  [70.0, -8.0],  [65.0, -10.0],
      [60.0, -14.0], [56.0, -20.0], [52.0, -26.0],
      [46.0, -33.0], [40.0, -38.0], [32.0, -41.0],
      [24.0, -41.0], [18.5, -38.0], [16.0, -34.0],
      [14.0, -28.0], [8.0, -20.0],  [2.0, -12.0],
      [-4.0, -4.0],  [-10.0, 4.0],  [-16.0, 12.0],
      [-21.0, 20.0], [-23.0, 28.0], [-20.0, 34.0],
      [-15.0, 38.0], [-10.0, 42.0], [-6.0, 46.0],
      [-3.0, 48.5],  [2.0, 51.0],   [4.1, 51.9],
    ],
  },
  {
    id: 'far-east-north-europe-suez',
    name: 'Far East → North Europe (Suez — Disrupted)',
    riskLevel: 'critical',
    coordinates: [
      [121.5, 31.2], [124.0, 30.0], [126.0, 26.0],
      [124.0, 22.0], [120.0, 17.0], [116.0, 11.0],
      [112.0, 6.0],  [108.0, 3.0],  [104.8, 1.2],
      [101.2, 2.5],  [96.0, 3.0],   [90.0, 4.0],
      [84.0, 6.0],   [78.0, 7.0],   [74.0, 9.0],
      [70.0, 12.0],  [66.0, 16.0],  [62.0, 20.0],
      [58.0, 22.0],  [56.3, 26.6],  [54.0, 22.0],
      [50.0, 17.0],  [46.0, 13.5],  [43.3, 12.5],
      [42.0, 15.0],  [38.0, 20.0],  [34.0, 26.0],
      [32.3, 30.5],  [30.5, 32.0],  [27.0, 33.5],
      [22.0, 34.5],  [16.0, 33.0],  [12.0, 33.5],
      [6.0, 37.0],   [0.0, 40.5],   [-4.0, 44.0],
      [-3.0, 48.5],  [2.0, 51.0],   [4.1, 51.9],
    ],
  },
  {
    id: 'far-east-north-america-west',
    name: 'Far East → North America West Coast',
    riskLevel: 'medium',
    coordinates: [
      [121.5, 31.2],  [124.0, 30.0],  [128.0, 30.0],
      [133.0, 31.0],  [136.0, 30.0],  [140.0, 32.0],
      [146.0, 35.0],  [152.0, 38.0],  [158.0, 40.5],
      [164.0, 42.5],  [170.0, 44.0],  [176.0, 44.5],
      [180.0, 44.5],  [-176.0, 44.5], [-170.0, 44.0],
      [-162.0, 43.0], [-154.0, 41.0], [-146.0, 38.5],
      [-138.0, 36.0], [-130.0, 34.5], [-124.0, 33.5],
      [-118.2, 33.7],
    ],
  },
  {
    id: 'north-america-east-europe',
    name: 'North America East Coast → Europe',
    riskLevel: 'low',
    coordinates: [
      [-74.0, 40.7], [-70.0, 42.5], [-64.0, 44.5],
      [-57.0, 46.5], [-50.0, 47.5], [-43.0, 48.5],
      [-36.0, 49.5], [-29.0, 50.5], [-22.0, 51.0],
      [-15.0, 51.5], [-8.0, 51.5],  [-3.0, 51.0],
      [2.0, 51.0],   [4.1, 51.9],
    ],
  },
  {
    id: 'middle-east-europe',
    name: 'Middle East → Europe (Cape Diversion)',
    riskLevel: 'critical',
    coordinates: [
      [56.3, 26.6],  [60.0, 20.0],  [64.0, 14.0],
      [66.0, 10.0],  [68.0, 6.0],   [70.0, 2.0],
      [70.0, -2.0],  [68.0, -6.0],  [64.0, -10.0],
      [60.0, -14.0], [56.0, -20.0], [52.0, -26.0],
      [46.0, -33.0], [40.0, -38.0], [32.0, -41.0],
      [24.0, -41.0], [18.5, -38.0], [16.0, -34.0],
      [14.0, -28.0], [8.0, -20.0],  [2.0, -12.0],
      [-4.0, -4.0],  [-10.0, 4.0],  [-16.0, 12.0],
      [-21.0, 20.0], [-23.0, 28.0], [-20.0, 34.0],
      [-15.0, 38.0], [-10.0, 42.0], [-6.0, 46.0],
      [-3.0, 48.5],  [2.0, 51.0],   [4.1, 51.9],
    ],
  },
  {
    id: 'middle-east-asia',
    name: 'Middle East → Asia',
    riskLevel: 'high',
    coordinates: [
      [56.3, 26.6],  [60.0, 22.0],  [64.0, 18.0],
      [67.0, 14.0],  [69.0, 11.0],  [71.0, 9.0],
      [74.0, 8.0],   [78.0, 7.0],   [82.0, 6.5],
      [86.0, 6.0],   [90.0, 5.5],   [94.0, 4.5],
      [98.0, 3.5],   [101.2, 2.5],  [104.8, 1.2],
      [108.0, 3.0],  [110.0, 6.0],  [113.0, 10.0],
      [116.0, 14.0], [119.0, 19.0], [121.5, 31.2],
    ],
  },
  {
    id: 'intra-asia',
    name: 'Intra-Asia',
    riskLevel: 'medium',
    coordinates: [
      [121.5, 31.2], [124.0, 30.0], [124.0, 26.0],
      [122.0, 22.0], [119.5, 24.5], [117.5, 22.0],
      [115.0, 18.0], [112.0, 14.0], [110.0, 10.0],
      [108.0, 6.0],  [106.0, 3.0],  [104.8, 1.2],
      [101.2, 2.5],  [99.0, 5.0],   [97.0, 8.0],
      [95.0, 12.0],  [92.0, 16.0],  [89.0, 20.0],
      [86.0, 17.0],  [83.0, 13.0],  [80.0, 10.0],
      [78.0, 8.5],   [77.5, 8.5],
    ],
  },
  {
    id: 'south-america-europe',
    name: 'South America → Europe',
    riskLevel: 'low',
    coordinates: [
      [-43.2, -22.9], [-45.0, -22.0], [-46.0, -18.0],
      [-46.0, -14.0], [-44.0, -8.0],  [-41.0, -3.0],
      [-38.0, 2.0],   [-35.0, 7.0],   [-32.0, 12.0],
      [-29.0, 17.0],  [-26.0, 22.0],  [-23.0, 27.0],
      [-20.0, 31.0],  [-17.0, 35.0],  [-13.0, 38.0],
      [-9.0, 41.5],   [-6.0, 45.0],   [-3.0, 48.5],
      [2.0, 51.0],    [4.1, 51.9],
    ],
  },
]

// Backwards-compat alias so app/page.tsx can still import HOT_ZONES
export const HOT_ZONES = ZONES
