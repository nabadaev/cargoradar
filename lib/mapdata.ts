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
  {
    id: 'malacca',
    name: 'Strait of Malacca',
    type: 'hotzone',
    coordinates: [103.8, 1.3],
    riskScore: 7.2,
    riskLevel: 'high',
    description: 'Elevated piracy activity. Armed robbery incidents increasing. Heavy Cape-diversion traffic compounding congestion.',
  },
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    type: 'hotzone',
    coordinates: [56.3, 26.6],
    riskScore: 9.1,
    riskLevel: 'critical',
    description: 'Iranian vessel seizures ongoing. War-risk premiums at record highs. Most commercial carriers avoiding transits.',
  },
  {
    id: 'red-sea',
    name: 'Red Sea / Bab-el-Mandeb',
    type: 'hotzone',
    coordinates: [43.3, 12.5],
    riskScore: 9.4,
    riskLevel: 'critical',
    description: 'Houthi missile and drone strikes ongoing since Oct 2023. Effectively closed to major carriers. All traffic rerouting via Cape of Good Hope.',
  },
  {
    id: 'suez',
    name: 'Suez Canal',
    type: 'hotzone',
    coordinates: [32.3, 30.5],
    riskScore: 8.8,
    riskLevel: 'critical',
    description: 'Transit volumes down 70%+ vs pre-crisis. Vessels avoiding due to Red Sea / Bab-el-Mandeb threat. Canal authority revenues collapsed.',
  },
  {
    id: 'cape-of-good-hope',
    name: 'Cape of Good Hope',
    type: 'hotzone',
    coordinates: [18.4, -34.4],
    riskScore: 5.1,
    riskLevel: 'medium',
    description: 'Current primary diversion point for Far East–Europe traffic. Severe weather risk Nov–Mar. Port congestion at Cape Town elevated.',
  },
  {
    id: 'gulf-of-guinea',
    name: 'Gulf of Guinea',
    type: 'hotzone',
    coordinates: [3.0, 1.5],
    riskScore: 6.8,
    riskLevel: 'high',
    description: 'Piracy hotspot. Armed robbery, crew kidnapping incidents reported. Increased vessel traffic from Cape rerouting heightening exposure.',
  },
  {
    id: 'gibraltar',
    name: 'Strait of Gibraltar',
    type: 'hotzone',
    coordinates: [-5.6, 35.9],
    riskScore: 2.1,
    riskLevel: 'low',
    description: 'Operational. High traffic density from rerouted Cape voyages. Minor anchorage delays.',
  },
  {
    id: 'piraeus',
    name: 'Port of Piraeus',
    type: 'hotzone',
    coordinates: [23.6, 37.9],
    riskScore: 2.4,
    riskLevel: 'low',
    description: 'Operational. Handling increased transhipment volumes as Eastern Med gateway.',
  },
  {
    id: 'rotterdam',
    name: 'Port of Rotterdam',
    type: 'hotzone',
    coordinates: [4.1, 51.9],
    riskScore: 1.8,
    riskLevel: 'low',
    description: 'Operational. Primary European discharge port. Absorbing surge from Cape-routed Far East services.',
  },
  {
    id: 'antwerp',
    name: 'Port of Antwerp',
    type: 'hotzone',
    coordinates: [4.4, 51.3],
    riskScore: 1.9,
    riskLevel: 'low',
    description: 'Operational. Second-largest European port. Handling overflow from Rotterdam.',
  },
  {
    id: 'hamburg',
    name: 'Port of Hamburg',
    type: 'hotzone',
    coordinates: [9.9, 53.5],
    riskScore: 2.0,
    riskLevel: 'low',
    description: 'Operational. Northern European gateway. Slight congestion from increased Far East arrivals.',
  },
  {
    id: 'felixstowe',
    name: 'Port of Felixstowe',
    type: 'hotzone',
    coordinates: [1.3, 51.9],
    riskScore: 1.7,
    riskLevel: 'low',
    description: 'Operational. UK\'s largest container port. Stable operations, handling Cape-routed UK-bound cargo.',
  },
]

export const TRADE_LANES: TradeLane[] = [
  {
    id: 'far-east-europe-cape',
    name: 'Far East → Europe (Cape of Good Hope — Current Route)',
    riskLevel: 'high',
    coordinates: [
      [121.5, 31.2],
      [118.0, 18.0],
      [111.0, 8.0],
      [104.5, 1.5],
      [103.8, 1.3],
      [98.0, 4.0],
      [88.0, 6.0],
      [80.0, 6.0],
      [72.0, 5.0],
      [65.0, 0.0],
      [58.0, -8.0],
      [50.0, -18.0],
      [40.0, -26.0],
      [30.0, -32.0],
      [20.0, -35.5],
      [16.0, -33.0],
      [12.0, -28.0],
      [8.0, -18.0],
      [5.0, -8.0],
      [3.0, 1.5],
      [1.0, 4.0],
      [-5.0, 3.0],
      [-10.0, 5.0],
      [-15.0, 10.5],
      [-18.0, 16.0],
      [-18.5, 22.0],
      [-18.0, 28.0],
      [-15.5, 33.5],
      [-10.0, 36.0],
      [-6.5, 36.5],
      [-5.6, 35.9],
      [-6.0, 36.8],
      [-7.5, 37.5],
      [-9.5, 38.5],
      [-10.5, 39.5],
      [-10.8, 41.5],
      [-10.5, 43.5],
      [-9.5, 44.5],
      [-8.0, 46.0],
      [-6.5, 47.5],
      [-5.5, 48.5],
      [-4.5, 49.5],
      [-3.5, 50.5],
      [-2.5, 50.8],
      [-1.5, 50.9],
      [0.5, 51.3],
      [1.3, 51.9],
      [2.5, 52.0],
      [3.5, 52.0],
      [4.1, 51.9],
    ],
  },
]

// Backwards-compat alias so app/page.tsx can still import HOT_ZONES
export const HOT_ZONES = ZONES
