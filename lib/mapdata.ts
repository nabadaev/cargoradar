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
      [119.0, 26.0],  // East China Sea south
      [116.0, 22.0],  // South China Sea north
      [114.0, 18.0],  // South China Sea
      [111.0, 12.0],  // South China Sea south
      [108.0, 6.0],   // Approaching Malacca
      [105.5, 3.0],   // Malacca north approach
      [103.8, 1.3],   // Strait of Malacca
      [101.0, 2.5],   // Malacca exit
      [97.0, 4.0],    // Andaman Sea
      [92.0, 5.5],    // Bay of Bengal west
      [87.0, 5.0],    // Indian Ocean north
      [83.0, 4.0],    // Sri Lanka south
      [80.0, 6.9],    // Indian Ocean west
      [76.0, 5.0],    // Indian Ocean mid
      [72.0, 1.0],    // Indian Ocean central
      [69.0, -5.0],   // Indian Ocean south heading
      [66.0, -12.0],  // Indian Ocean south
      [63.0, -18.0],  // Mozambique Channel approach
      [60.0, -22.0],  // Indian Ocean deep south
      [52.0, -28.0],  // South Indian Ocean
      [42.0, -33.0],  // Approaching Cape
      [32.0, -36.0],  // South Africa south
      [22.0, -36.0],  // Cape corridor
      [18.4, -34.4],  // Cape of Good Hope
      [15.0, -32.0],  // Cape north
      [10.0, -28.0],  // West Africa south
      [6.0, -22.0],   // Atlantic south
      [3.0, -15.0],   // South Atlantic
      [1.0, -8.0],    // South Atlantic north
      [0.0, -25.0],   // South Atlantic mid — NOTE: route doubles back here for curve
      [2.0, -5.0],    // Equatorial Atlantic
      [3.5, 2.0],     // Gulf of Guinea
      [5.0, 0.0],     // Gulf of Guinea equator
      [4.0, 5.0],     // Gulf of Guinea north
      [2.0, 8.0],     // West Africa coast north
      [-1.0, 11.0],   // West Africa
      [-5.0, 14.0],   // West Africa
      [-10.0, 15.0],  // West Africa open ocean
      [-14.0, 18.0],  // Off Senegal
      [-17.0, 22.0],  // Off Mauritania
      [-19.0, 27.0],  // Off Western Sahara
      [-17.0, 32.0],  // Off Morocco
      [-10.0, 36.0],  // Approaching Gibraltar
      [-5.6, 35.9],   // Strait of Gibraltar
      [-4.0, 38.5],   // Mediterranean / Atlantic split
      [-7.0, 40.0],   // Portugal coast
      [-8.0, 43.5],   // NW Spain
      [-6.0, 46.5],   // Bay of Biscay south
      [-5.0, 45.0],   // Bay of Biscay
      [-4.0, 48.0],   // Bay of Biscay north
      [-3.0, 49.5],   // English Channel approach
      [-1.0, 50.5],   // English Channel west
      [2.0, 51.2],    // North Sea south
      [4.1, 51.9],    // Rotterdam
    ],
  },
]

// Backwards-compat alias so app/page.tsx can still import HOT_ZONES
export const HOT_ZONES = ZONES
