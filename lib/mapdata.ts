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
      [121.5, 31.2],  // Shanghai
      [121.0, 25.0],  // Taiwan Strait south
      [118.0, 18.0],  // South China Sea
      [111.0, 8.0],   // South China Sea south
      [104.5, 1.5],   // Strait of Malacca north
      [103.8, 1.3],   // Strait of Malacca
      [98.0, 4.0],    // Andaman Sea
      [88.0, 6.0],    // Indian Ocean east
      [80.0, 6.0],    // Sri Lanka / Colombo
      [72.0, 5.0],    // Indian Ocean central
      [65.0, 0.0],    // Indian Ocean mid
      [58.0, -8.0],   // Indian Ocean southwest
      [52.0, -18.0],  // Mozambique Channel approach
      [42.0, -26.0],  // South Indian Ocean
      [32.0, -32.0],  // Approaching Cape
      [20.0, -35.5],  // Cape of Good Hope
      [16.0, -33.0],  // Cape Town offshore
      [12.0, -28.0],  // South Atlantic north
      [8.0, -20.0],   // Atlantic, offshore Namibia
      [5.0, -10.0],   // Atlantic, offshore Angola
      [3.0, 1.5],     // Gulf of Guinea (hot zone marker here)
      [1.0, 4.0],     // Gulf of Guinea north
      [-2.0, 5.0],    // Offshore Ivory Coast/Ghana
      [-8.0, 5.0],    // Offshore Liberia
      [-15.0, 10.0],  // Offshore Guinea
      [-17.5, 14.5],  // Offshore Dakar, open ocean
      [-18.0, 20.0],  // Offshore Mauritania, open ocean
      [-17.0, 28.0],  // Offshore Western Sahara
      [-15.0, 33.0],  // Offshore Morocco
      [-9.5, 36.5],   // Atlantic approach to Gibraltar
      [-5.6, 35.9],   // Strait of Gibraltar
      [-2.0, 36.5],   // Mediterranean west entry
      [0.0, 38.0],    // Mediterranean, east of Gibraltar
      [-1.0, 43.5],   // Atlantic north of Spain, offshore
      [-4.0, 44.5],   // Bay of Biscay south, open water
      [-5.5, 47.5],   // Bay of Biscay mid, open water
      [-4.5, 50.0],   // English Channel approach
      [-3.0, 51.5],   // Celtic Sea
      [-1.5, 51.8],   // English Channel
      [1.3, 51.9],    // Felixstowe approach
      [4.1, 51.9],    // Rotterdam
    ],
  },
]

// Backwards-compat alias so app/page.tsx can still import HOT_ZONES
export const HOT_ZONES = ZONES
