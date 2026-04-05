-- Seed: 12 Far East → Europe hot zones
-- Run in: Supabase dashboard → SQL Editor → New query

INSERT INTO zones (id, name, type, risk_score, risk_level, description, updated_at) VALUES
(gen_random_uuid(), 'Strait of Malacca',       'hotzone', 7.2, 'high',     'Critical chokepoint between Indian Ocean and South China Sea. Piracy and congestion risk.', now()),
(gen_random_uuid(), 'Strait of Hormuz',         'hotzone', 9.1, 'critical', 'Persian Gulf exit point. Iranian military tension and vessel seizure risk.', now()),
(gen_random_uuid(), 'Red Sea / Bab-el-Mandeb',  'hotzone', 9.4, 'critical', 'Houthi drone and missile attacks have effectively closed this route to major carriers.', now()),
(gen_random_uuid(), 'Suez Canal',               'hotzone', 8.8, 'critical', 'Canal transit suspended by most carriers due to Red Sea approach risk. Vessels diverting via Cape.', now()),
(gen_random_uuid(), 'Cape of Good Hope',        'hotzone', 5.1, 'medium',   'Current primary diversion route for Far East to Europe traffic. Weather and congestion risk.', now()),
(gen_random_uuid(), 'Gulf of Guinea',           'hotzone', 6.8, 'high',     'West African piracy hotspot. Armed robbery and kidnapping risk for vessels on Cape route.', now()),
(gen_random_uuid(), 'Strait of Gibraltar',      'hotzone', 2.1, 'low',      'Entry point to Mediterranean and North Atlantic. Low risk, high traffic volume.', now()),
(gen_random_uuid(), 'Port of Piraeus',          'hotzone', 2.4, 'low',      'Major Mediterranean hub. First major European port of call on Far East routes.', now()),
(gen_random_uuid(), 'Port of Rotterdam',        'hotzone', 1.8, 'low',      'Europe largest container port. Primary North European destination for Far East services.', now()),
(gen_random_uuid(), 'Port of Antwerp',          'hotzone', 1.9, 'low',      'Second largest European container port. Key destination for Far East westbound services.', now()),
(gen_random_uuid(), 'Port of Hamburg',          'hotzone', 2.0, 'low',      'Major North European hub. Important destination for Far East to Europe trade lane.', now()),
(gen_random_uuid(), 'Port of Felixstowe',       'hotzone', 1.7, 'low',      'UK largest container port. Key destination for Far East services to Britain.', now());
