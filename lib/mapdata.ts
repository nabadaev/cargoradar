export interface HotZone {
  id: string
  name: string
  coordinates: [number, number] // [lng, lat]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
}

export interface TradeLane {
  id: string
  name: string
  waypoints: [number, number][] // array of [lng, lat]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export const HOT_ZONES: HotZone[] = [
  { id: 'hormuz',        name: 'Strait of Hormuz',         coordinates: [56.3,  26.6], riskLevel: 'critical', riskScore: 9.8 },
  { id: 'red-sea',       name: 'Red Sea / Bab-el-Mandeb', coordinates: [43.3,  12.5],  riskLevel: 'critical', riskScore: 8.4 },
  { id: 'black-sea',     name: 'Black Sea',                coordinates: [34.0,  43.0], riskLevel: 'high',     riskScore: 7.2 },
  { id: 'suez',          name: 'Suez Canal',               coordinates: [32.3,  30.5], riskLevel: 'high',     riskScore: 7.0 },
  { id: 'taiwan-strait', name: 'Taiwan Strait',            coordinates: [119.5, 24.5], riskLevel: 'high',     riskScore: 6.5 },
  { id: 'panama',        name: 'Panama Canal',             coordinates: [-79.7,  9.1], riskLevel: 'medium',   riskScore: 5.4 },
  { id: 'shanghai',      name: 'Port of Shanghai',         coordinates: [121.5, 31.2], riskLevel: 'medium',   riskScore: 4.2 },
  { id: 'la-lb',         name: 'Port of LA / Long Beach',  coordinates: [-118.2, 33.7], riskLevel: 'medium',  riskScore: 3.8 },
  { id: 'malacca',       name: 'Strait of Malacca',        coordinates: [101.2,  2.5], riskLevel: 'low',      riskScore: 3.2 },
  { id: 'rotterdam',     name: 'Port of Rotterdam',        coordinates: [4.1,   51.9], riskLevel: 'low',      riskScore: 2.8 },
]

export const TRADE_LANES: TradeLane[] = [
  {
    id: 'far-east-north-europe',
    name: 'Far East → North Europe',
    riskLevel: 'high',
    waypoints: [[121.5, 31.2], [101.2, 2.5], [43.3, 12.5], [32.3, 30.5], [4.1, 51.9]],
  },
  {
    id: 'transpacific-eastbound',
    name: 'Far East → North America West Coast',
    riskLevel: 'medium',
    waypoints: [[121.5, 31.2], [-118.2, 33.7]],
  },
  {
    id: 'transatlantic',
    name: 'North America East Coast → Europe',
    riskLevel: 'low',
    waypoints: [[-74.0, 40.7], [4.1, 51.9]],
  },
  {
    id: 'middle-east-europe',
    name: 'Middle East → Europe',
    riskLevel: 'high',
    waypoints: [[56.3, 26.6], [43.3, 12.5], [32.3, 30.5], [4.1, 51.9]],
  },
  {
    id: 'middle-east-asia',
    name: 'Middle East → Asia',
    riskLevel: 'high',
    waypoints: [[56.3, 26.6], [101.2, 2.5], [121.5, 31.2]],
  },
  {
    id: 'intra-asia',
    name: 'Intra-Asia',
    riskLevel: 'medium',
    waypoints: [[121.5, 31.2], [119.5, 24.5], [101.2, 2.5]],
  },
  {
    id: 'south-america-north',
    name: 'South America → North America / Europe',
    riskLevel: 'low',
    waypoints: [[-43.2, -22.9], [-74.0, 40.7]],
  },
]
