export interface HotZone {
  id: string
  name: string
  coordinates: [number, number] // [lng, lat]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  description: string
}

export interface TradeLane {
  id: string
  name: string
  waypoints: [number, number][] // array of [lng, lat]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export const HOT_ZONES: HotZone[] = [
  {
    id: 'hormuz', name: 'Strait of Hormuz', coordinates: [56.3, 26.6],
    riskLevel: 'critical', riskScore: 9.8,
    description: 'Effectively closed to commercial traffic. 21 confirmed ship attacks since Jan 2026. All major carriers have suspended transits. War-risk insurance withdrawn by Lloyd\'s and most underwriters.',
  },
  {
    id: 'red-sea', name: 'Red Sea / Bab-el-Mandeb', coordinates: [43.3, 12.5],
    riskLevel: 'critical', riskScore: 8.4,
    description: 'Houthi drone and missile strikes ongoing. Now secondary crisis vs Hormuz but still active threat. Most carriers avoiding entirely, routing via Cape of Good Hope.',
  },
  {
    id: 'black-sea', name: 'Black Sea', coordinates: [34.0, 43.0],
    riskLevel: 'high', riskScore: 7.2,
    description: 'Ongoing Russia-Ukraine conflict continues to disrupt grain and commodity shipments. Ukrainian ports partially operational under grain corridor agreements.',
  },
  {
    id: 'suez', name: 'Suez Canal', coordinates: [32.3, 30.5],
    riskLevel: 'high', riskScore: 7.0,
    description: 'Closed to most container traffic due to compound Red Sea and Hormuz crisis. Vessels from Asia rerouting via Cape of Good Hope adding 14–18 days transit time.',
  },
  {
    id: 'taiwan-strait', name: 'Taiwan Strait', coordinates: [119.5, 24.5],
    riskLevel: 'high', riskScore: 6.5,
    description: 'Elevated PLA military exercises and naval activity. Commercial transits still proceeding but insurers tracking closely. Situation could escalate with little warning.',
  },
  {
    id: 'panama', name: 'Panama Canal', coordinates: [-79.7, 9.1],
    riskLevel: 'medium', riskScore: 5.4,
    description: 'Water levels recovering after 2024–25 drought restrictions. Daily transits back to ~32 vessels but still below normal capacity of 38. Booking queues manageable.',
  },
  {
    id: 'shanghai', name: 'Port of Shanghai', coordinates: [121.5, 31.2],
    riskLevel: 'medium', riskScore: 4.2,
    description: 'Increased congestion from Hormuz and Red Sea rerouting pushing demand through Asian ports. Average dwell times up 1.8 days vs Q4 2025. Yard utilisation at 87%.',
  },
  {
    id: 'la-lb', name: 'Port of LA / Long Beach', coordinates: [-118.2, 33.7],
    riskLevel: 'medium', riskScore: 3.8,
    description: 'Increased inbound volumes from Cape of Good Hope rerouting. Longer transit times reducing vessel frequency but port operations stable. Labour contract renewed through 2027.',
  },
  {
    id: 'malacca', name: 'Strait of Malacca', coordinates: [101.2, 2.5],
    riskLevel: 'low', riskScore: 3.2,
    description: 'Traffic volumes elevated as vessels avoid Red Sea and Hormuz. Monitoring for piracy and congestion risk. Singapore and Malaysian coast guard presence increased.',
  },
  {
    id: 'rotterdam', name: 'Port of Rotterdam', coordinates: [4.1, 51.9],
    riskLevel: 'low', riskScore: 2.8,
    description: 'Supply chain pressure from global rerouting but port operations fully functional. Receiving diverted cargo flows. Throughput up 12% YoY as Cape route traffic increases.',
  },
]

export const TRADE_LANES: TradeLane[] = [
  {
    id: 'far-east-north-europe',
    name: 'Far East → North Europe',
    riskLevel: 'critical',
    waypoints: [[121.5,31.2],[114.1,22.3],[103.8,1.3],[80.0,6.0],[43.3,12.5],[32.3,30.5],[15.0,36.5],[5.0,48.0],[4.1,51.9]],
  },
  {
    id: 'transpacific-eastbound',
    name: 'Far East → North America West Coast',
    riskLevel: 'medium',
    waypoints: [[121.5,31.2],[140.0,35.0],[165.0,40.0],[180.0,42.0],[-160.0,42.0],[-140.0,38.0],[-118.2,33.7]],
  },
  {
    id: 'transatlantic',
    name: 'North America East Coast → Europe',
    riskLevel: 'low',
    waypoints: [[-74.0,40.7],[-60.0,43.0],[-45.0,47.0],[-30.0,50.0],[-15.0,51.0],[-5.0,51.5],[4.1,51.9]],
  },
  {
    id: 'middle-east-europe',
    name: 'Middle East → Europe',
    riskLevel: 'critical',
    waypoints: [[56.3,26.6],[43.3,12.5],[32.3,30.5],[25.0,34.0],[15.0,36.5],[5.0,44.0],[4.1,51.9]],
  },
  {
    id: 'middle-east-asia',
    name: 'Middle East → Asia',
    riskLevel: 'critical',
    waypoints: [[56.3,26.6],[60.0,20.0],[72.0,8.0],[80.0,6.0],[101.2,2.5],[114.1,22.3],[121.5,31.2]],
  },
  {
    id: 'intra-asia',
    name: 'Intra-Asia',
    riskLevel: 'medium',
    waypoints: [[121.5,31.2],[114.1,22.3],[103.8,1.3],[106.8,10.8],[100.5,13.7],[98.0,8.0],[80.0,8.0]],
  },
  {
    id: 'south-america-europe',
    name: 'South America → Europe',
    riskLevel: 'low',
    waypoints: [[-43.2,-22.9],[-30.0,-15.0],[-20.0,5.0],[-10.0,30.0],[-5.0,40.0],[4.1,51.9]],
  },
]
