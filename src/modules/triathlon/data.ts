export type Discipline = 'swim' | 'bike' | 'run'
export type SessionType = 'endurance' | 'fartlek' | 'seuil' | 'fractionne' | 'recup' | 'force' | 'sprint' | 'muscu' | 'repos'

export interface WorkoutSession {
  type: SessionType
  discipline?: Discipline
  label: string
  detail: string
  duration?: string
  distance?: string
}

export interface ProgramDay {
  day: number
  morning?: WorkoutSession
  evening?: WorkoutSession
}

export interface Phase {
  id: number
  name: string
  weeks: number[]
  description: string
  color: string
}

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Base aérobie',
    weeks: [1, 2, 3, 4, 5, 6],
    description: 'Construction des fondations cardio et endurance de base',
    color: '#3B82F6',
  },
  {
    id: 2,
    name: 'Développement',
    weeks: [7, 8, 9, 10, 11, 12, 13],
    description: 'Augmentation du volume et introduction des séances de qualité',
    color: '#10B981',
  },
  {
    id: 3,
    name: 'Spécifique',
    weeks: [14, 15, 16, 17, 18, 19, 20, 21],
    description: 'Travail au seuil et à allure course, enchaînements',
    color: '#F59E0B',
  },
  {
    id: 4,
    name: 'Affûtage',
    weeks: [22, 23, 24, 25],
    description: 'Réduction du volume, maintien de l\'intensité, préparation mentale',
    color: '#EF4444',
  },
]

export function getPhaseForWeek(week: number): Phase {
  return PHASES.find((p) => p.weeks.includes(week)) ?? PHASES[0]
}

export interface ExerciseInfo {
  name: string
  muscles: string
  sets: string
  reps: string
  tempo?: string
  rest?: string
  note?: string
}

export const EXERCISE_DB: Record<string, ExerciseInfo> = {
  squat: {
    name: 'Squat',
    muscles: 'Quadriceps, fessiers, ischio-jambiers',
    sets: '3-4',
    reps: '8-12',
    tempo: '3-0-1',
    rest: '90s',
  },
  rdl: {
    name: 'Romanian Deadlift',
    muscles: 'Ischio-jambiers, fessiers, lombaires',
    sets: '3',
    reps: '10-12',
    tempo: '3-1-1',
    rest: '90s',
  },
  hip_thrust: {
    name: 'Hip Thrust',
    muscles: 'Fessiers, ischio-jambiers',
    sets: '3-4',
    reps: '10-15',
    rest: '60s',
  },
  leg_press: {
    name: 'Leg Press',
    muscles: 'Quadriceps, fessiers',
    sets: '3',
    reps: '12-15',
    rest: '90s',
  },
  calf_raises: {
    name: 'Mollets debout',
    muscles: 'Gastrocnémiens, soléaires',
    sets: '3',
    reps: '15-20',
    rest: '45s',
  },
  nordic_curl: {
    name: 'Nordic Curl',
    muscles: 'Ischio-jambiers (excentrique)',
    sets: '3',
    reps: '5-8',
    rest: '120s',
    note: 'Excentrique progressif, très efficace pour la prévention',
  },
  lat_pulldown: {
    name: 'Tirage vertical',
    muscles: 'Grand dorsal, biceps',
    sets: '3',
    reps: '10-12',
    rest: '60s',
  },
  row: {
    name: 'Rowing barre',
    muscles: 'Grand dorsal, rhomboïdes, biceps',
    sets: '3',
    reps: '10-12',
    rest: '60s',
  },
  plank: {
    name: 'Gainage planche',
    muscles: 'Transverse, stabilisateurs',
    sets: '3',
    reps: '45-60s',
    rest: '30s',
  },
  side_plank: {
    name: 'Gainage latéral',
    muscles: 'Obliques, abducteurs de hanche',
    sets: '3 (chaque côté)',
    reps: '30-45s',
    rest: '30s',
  },
  dead_bug: {
    name: 'Dead Bug',
    muscles: 'Transverse, coordination',
    sets: '3',
    reps: '8-10 (chaque côté)',
    rest: '30s',
  },
  shoulder_press: {
    name: 'Développé épaules',
    muscles: 'Deltoïdes, triceps',
    sets: '3',
    reps: '10-12',
    rest: '60s',
  },
  single_leg_squat: {
    name: 'Pistol Squat assisté',
    muscles: 'Quadriceps, fessiers (unilateral)',
    sets: '3 (chaque jambe)',
    reps: '8-10',
    rest: '60s',
    note: 'Utiliser un TRX ou tenir un support si nécessaire',
  },
  step_up: {
    name: 'Step Up',
    muscles: 'Fessiers, quadriceps (unilateral)',
    sets: '3 (chaque jambe)',
    reps: '10-12',
    rest: '60s',
  },
}

export interface WeekProgram {
  week: number
  days: Record<number, WorkoutSession[]>
  totalVolume?: string
  focus?: string
}

function swim(label: string, detail: string, duration?: string, distance?: string, type: SessionType = 'endurance'): WorkoutSession {
  return { type, discipline: 'swim', label, detail, duration, distance }
}

function bike(label: string, detail: string, duration?: string, distance?: string, type: SessionType = 'endurance'): WorkoutSession {
  return { type, discipline: 'bike', label, detail, duration, distance }
}

function run(label: string, detail: string, duration?: string, distance?: string, type: SessionType = 'endurance'): WorkoutSession {
  return { type, discipline: 'run', label, detail, duration, distance }
}

function muscu(label: string, detail: string): WorkoutSession {
  return { type: 'muscu', label, detail }
}

function rest(): WorkoutSession {
  return { type: 'repos', label: 'Repos', detail: 'Récupération active ou repos complet' }
}

export const PROGRAM: Record<number, Record<number, WorkoutSession[]>> = {
  // PHASE 1 — Semaines 1–6
  1: {
    1: [swim('Natation technique', 'Échauffement 200m crawl + 6×50m technique bras/jambes + 200m retour calme', '45min', '1200m')],
    2: [bike('Vélo endurance', 'Zone 2 (60-70% FCmax), rythme conversation possible', '60min'), muscu('Force générale', 'Squat 3×10 + RDL 3×10 + Gainage 3×45s')],
    3: [run('Course endurance', 'Allure confortable, Zone 2, respiration nasale possible', '40min', '6km')],
    4: [swim('Natation endurance', 'Crawl continu en Zone 2, focus sur la glisse', '40min', '1000m')],
    5: [bike('Vélo + muscu', 'Vélo 45min Zone 2', '45min'), muscu('Bas du corps', 'Hip Thrust 3×12 + Leg Press 3×15 + Mollets 3×20')],
    6: [run('Sortie longue', 'Zone 1-2, pas de montre, plaisir', '60min', '9km')],
    7: [rest()],
  },
  2: {
    1: [swim('Natation technique', 'Échauffement 200m + 8×50m drill + 300m crawl', '50min', '1400m')],
    2: [bike('Vélo endurance', 'Zone 2 stable, cadence 85-90rpm', '70min'), muscu('Force A', 'Squat 3×10 + RDL 3×10 + Nordic Curl 3×5')],
    3: [run('Fartlek court', '10min échauffement + 5×(2min rapide/2min lent) + 10min retour', '45min', '7km', 'fartlek')],
    4: [swim('Natation volume', 'Sets de 100m avec récup 20s', '45min', '1500m')],
    5: [bike('Vélo récup', 'Zone 1, très facile', '40min'), muscu('Gainage/Core', 'Planche 3×60s + Gainage latéral 3×45s + Dead Bug 3×10')],
    6: [run('Sortie longue', 'Zone 2, pas de marche', '75min', '11km')],
    7: [rest()],
  },
  3: {
    1: [swim('Natation qualité', 'Échauff. + 4×200m avec récup 30s + retour calme', '55min', '1600m')],
    2: [bike('Vélo collines', 'Zone 2-3 sur terrain vallonné ou résistance', '75min'), muscu('Force B', 'Hip Thrust 4×12 + Step Up 3×10 + Mollets 3×20')],
    3: [run('Tempo court', '15min échauff. + 15min allure seuil + 10min retour', '40min', '7km', 'seuil')],
    4: [swim('Natation technique', 'Drills crawl + 600m continus', '45min', '1200m')],
    5: [bike('Vélo endurance', 'Zone 2, focus cadence', '60min'), muscu('Force A', 'Squat 4×10 + RDL 3×10 + Nordic Curl 3×6')],
    6: [run('Sortie longue', 'Zone 1-2', '80min', '12km')],
    7: [rest()],
  },
  4: {
    1: [swim('Récupération active', 'Crawl très lent, technique, 800m maxi', '30min', '800m', 'recup')],
    2: [bike('Récupération vélo', 'Zone 1, jambes légères', '45min'), muscu('Core léger', 'Planche 3×45s + Dead Bug 3×8')],
    3: [run('Footing facile', 'Zone 1, allure très facile', '30min', '5km', 'recup')],
    4: [swim('Natation douce', '6×100m technique avec récup', '40min', '1000m')],
    5: [rest()],
    6: [run('Sortie tranquille', 'Zone 2, à l\'écoute du corps', '50min', '8km')],
    7: [rest()],
  },
  5: {
    1: [swim('Natation volume+', 'Séries longues 4×300m récup 30s', '60min', '1800m')],
    2: [bike('Vélo puissance', 'Zone 2-3, inclure 3×5min à Zone 3', '80min'), muscu('Force A', 'Squat 4×8 + RDL 4×10 + Single Leg Squat 3×8')],
    3: [run('Intervalles', '10min échauff. + 6×(3min Z4/2min Z2) + 10min retour', '50min', '8km', 'fractionne')],
    4: [swim('Natation technique', 'Pull buoy + paddles 6×100m', '45min', '1200m')],
    5: [bike('Vélo endurance', 'Zone 2', '60min'), muscu('Force B', 'Hip Thrust 4×12 + Nordic Curl 3×6 + Step Up 3×12')],
    6: [run('Sortie longue', 'Zone 2 predominant', '90min', '13km')],
    7: [rest()],
  },
  6: {
    1: [swim('Natation seuil', '400m échauff. + 3×400m allure course + 200m retour', '60min', '2000m', 'seuil')],
    2: [bike('Vélo endurance longue', 'Zone 2, terrain varié', '90min'), muscu('Force A', 'Squat 4×8 lourd + RDL 4×8 + Nordic 3×6')],
    3: [run('Tempo', '10min échauff. + 20min allure seuil + 10min retour', '45min', '8km', 'seuil')],
    4: [swim('Natation récup', 'Crawl facile + drills', '40min', '1000m', 'recup')],
    5: [bike('Vélo technique', 'Travail cadence et technique pédalage', '60min'), muscu('Core/Stabilité', 'Planche 3×60s + Side Plank 3×45s + Dead Bug 3×12')],
    6: [run('Sortie longue', 'Zone 1-2 sur 2h', '120min', '17km')],
    7: [rest()],
  },

  // PHASE 2 — Semaines 7–13
  7: {
    1: [swim('Natation volume', '4×400m avec 30s récup', '65min', '2000m')],
    2: [bike('Vélo semi-long', 'Zone 2, 3×8min Zone 3', '100min'), muscu('Force puissance', 'Squat sauté 3×8 + RDL 4×8 + Hip Thrust 4×10')],
    3: [run('Fractionné long', '10min échauff. + 4×(5min Z4/3min Z2) + 10min', '55min', '9km', 'fractionne')],
    4: [swim('Natation technique mixte', 'Nage complète + crawl dos + 600m', '50min', '1500m')],
    5: [bike('Vélo récup/cadence', 'Zone 1-2, hautes cadences 95-100rpm', '50min'), muscu('Force B', 'Step Up 4×10 + Nordic 3×6 + Mollets 4×20')],
    6: [run('Sortie longue Z2', 'Zone 2 constant', '100min', '15km')],
    7: [rest()],
  },
  8: {
    1: [swim('Natation seuil+', '200m échauff. + 8×200m allure seuil récup 20s + 200m', '65min', '2200m', 'seuil')],
    2: [bike('Vélo collines', 'Côtes répétées 6×3min Z4-Z5', '90min'), muscu('Force A', 'Squat 4×6 lourd + RDL 4×8 + Nordic 3×5')],
    3: [run('Tempo progressif', '15min échauff. + 25min tempo progressif + 10min', '50min', '9km', 'seuil')],
    4: [swim('Natation volume tranquille', 'Crawl Zone 1-2 long', '55min', '1800m')],
    5: [bike('Brick court', 'Vélo 45min + Transition + Course 15min', '65min'), muscu('Core', 'Circuit gainage 4 exercices 3 tours')],
    6: [run('Sortie longue', 'Zone 2 + 20min Zone 3 final', '110min', '16km')],
    7: [rest()],
  },
  9: {
    1: [swim('Récupération', 'Nage libre facile', '35min', '900m', 'recup')],
    2: [bike('Récupération vélo', 'Zone 1 uniquement', '50min'), muscu('Léger', 'Squats légers 3×15 + Core 2×')],
    3: [run('Jogging récup', 'Allure très facile, écoute corporelle', '35min', '5km', 'recup')],
    4: [swim('Natation douce', 'Drills et nage lente', '40min', '1000m')],
    5: [rest()],
    6: [run('Sortie courte', 'Zone 2, bien récupéré', '50min', '8km')],
    7: [rest()],
  },
  10: {
    1: [swim('Natation compétition', '400m chaud + 4×200m sprint + 200m retour', '60min', '2000m', 'fractionne')],
    2: [bike('Vélo puissance', '5×10min Zone 3-4 avec 5min récup', '100min'), muscu('Force max', 'Squat 5×5 lourd + Hip Thrust 4×10 + Nordic 3×5')],
    3: [run('VMA court', '10min échauff. + 10×(1min Z5/1min Z2) + 10min', '40min', '7km', 'fractionne')],
    4: [swim('Natation volume', '3×500m allure course avec récup 45s', '65min', '2200m', 'seuil')],
    5: [bike('Vélo endurance', 'Zone 2 long', '90min'), muscu('Force B', 'RDL 4×8 + Step Up 4×10 + Mollets 4×20')],
    6: [run('Sortie longue', 'Zone 2, incluant 30min Zone 3', '120min', '18km')],
    7: [rest()],
  },
  11: {
    1: [swim('Natation seuil', '6×300m allure seuil récup 30s', '65min', '2400m', 'seuil')],
    2: [bike('Brick moyen', 'Vélo 60min + Course 20min directement', '85min'), muscu('Force A', 'Squat 4×8 + RDL 4×8 + Nordic 3×6')],
    3: [run('Tempo long', '15min échauff. + 30min tempo + 15min', '60min', '11km', 'seuil')],
    4: [swim('Natation récup', 'Nage facile drills', '40min', '1000m', 'recup')],
    5: [bike('Vélo endurance', 'Zone 2 stable', '90min'), muscu('Core avancé', 'Anti-rotation + Side Plank + Dead Bug 3 séries')],
    6: [run('Sortie longue', 'Zone 1-2', '110min', '16km')],
    7: [rest()],
  },
  12: {
    1: [swim('Natation race pace', '3×600m allure compétition + récup 60s', '70min', '2400m', 'seuil')],
    2: [bike('Vélo semi-long', 'Zone 2 + 4×10min Zone 3-4', '110min'), muscu('Force maintien', 'Squat 3×10 + Hip Thrust 3×12 + Core')],
    3: [run('Fractionné VMA', '10min échauff. + 8×(2min Z5/2min Z2) + 10min', '50min', '9km', 'fractionne')],
    4: [swim('Natation volume', 'Crawl mixte 2000m tranquille', '60min', '2000m')],
    5: [bike('Brick semi-compétition', 'Vélo 75min à allure course + Course 25min', '105min')],
    6: [run('Sortie longue', 'Zone 2, dernier long avant affûtage partiel', '120min', '18km')],
    7: [rest()],
  },
  13: {
    1: [swim('Récupération active', 'Nage facile 1000m maxi', '35min', '1000m', 'recup')],
    2: [bike('Vélo facile', 'Zone 1-2 uniquement', '60min')],
    3: [run('Footing facile', 'Zone 1-2, plaisir', '40min', '6km', 'recup')],
    4: [swim('Natation technique', 'Drills + 600m crawl cool', '40min', '1000m')],
    5: [rest()],
    6: [run('Sortie Z2', 'Bien récupéré, prêt pour la phase 3', '60min', '9km')],
    7: [rest()],
  },

  // PHASE 3 — Semaines 14–21
  14: {
    1: [swim('Natation spécifique', '400m + 2×800m allure course + 200m', '70min', '2600m', 'seuil')],
    2: [bike('Vélo seuil', '4×15min Zone 3-4 récup 5min', '110min'), muscu('Force maintien', 'Squat 4×6 + RDL 4×8 + Nordic 3×5')],
    3: [run('Tempo race pace', '15min échauff. + 35min allure objectif + 10min', '60min', '11km', 'seuil')],
    4: [swim('Natation récup', 'Facile + quelques accélérations', '40min', '1200m', 'recup')],
    5: [bike('Brick long', 'Vélo 90min race pace + Course 30min', '125min')],
    6: [run('Sortie longue', 'Zone 2 + quelques accélérations', '120min', '18km')],
    7: [rest()],
  },
  15: {
    1: [swim('Natation compétition', '1500m allure objectif + 500m récup', '65min', '2500m', 'seuil')],
    2: [bike('Vélo long spécifique', 'Zone 3-4 sur 40km simulé', '120min'), muscu('Force légère', 'Circuit léger 3 tours')],
    3: [run('Intervalles allure', '10min échauff. + 5×(4min allure semi/3min Z2) + 10min', '55min', '10km', 'fractionne')],
    4: [swim('Natation volume', '5×400m récup 30s', '70min', '2400m')],
    5: [bike('Vélo récup', 'Zone 1-2', '50min')],
    6: [run('Sortie longue', 'Zone 2, 2h15', '135min', '20km')],
    7: [rest()],
  },
  16: {
    1: [swim('Récupération semaine 16', 'Nage facile', '35min', '900m', 'recup')],
    2: [bike('Vélo modéré', 'Zone 2, pas d\'effort', '60min'), muscu('Léger', 'Core + mobilité')],
    3: [run('Footing léger', 'Zone 2 confortable', '40min', '6km', 'recup')],
    4: [swim('Natation douce', 'Technique et plaisir', '40min', '1100m')],
    5: [rest()],
    6: [run('Sortie courte Z2', 'Récupération avant phase intense', '50min', '8km')],
    7: [rest()],
  },
  17: {
    1: [swim('Natation race simulation', '750m allure + 750m récup + 750m allure', '65min', '2500m', 'seuil')],
    2: [bike('Vélo puissance course', '3×20min Zone 4 avec 8min récup', '110min'), muscu('Force maxi', 'Squat 5×5 + Hip Thrust 4×10')],
    3: [run('Course allure', '15min échauff. + 40min allure objectif 10km + 10min', '65min', '12km', 'seuil')],
    4: [swim('Natation mixte', 'Papillon + crawl dos + crawl libre', '50min', '1600m')],
    5: [bike('Brick compétition', 'Vélo 90min allure course + Course 35min', '130min')],
    6: [run('Sortie longue', 'Zone 2 + fin Z3', '120min', '18km')],
    7: [rest()],
  },
  18: {
    1: [swim('Natation qualité', '10×200m allure compétition récup 20s', '65min', '2400m', 'seuil')],
    2: [bike('Vélo long compétition', '45km simulation course', '130min'), muscu('Maintien', 'Circuit léger 3 tours')],
    3: [run('Tempo avec surge', '15min échauff. + 30min tempo + 3×1min sprint + 10min', '60min', '11km', 'seuil')],
    4: [swim('Natation récup', 'Crawl lent 1200m', '40min', '1200m', 'recup')],
    5: [bike('Brick semi-long', 'Vélo 60min + Course 20min', '85min')],
    6: [run('Sortie longue maxi', 'Zone 2, point culminant', '140min', '21km')],
    7: [rest()],
  },
  19: {
    1: [swim('Natation volume', '3×600m récup 45s', '65min', '2400m')],
    2: [bike('Vélo seuil court', '5×10min Zone 4 avec 5min récup', '100min')],
    3: [run('Fractionné VMA', '12×(1min Z5/1min Z2)', '45min', '8km', 'fractionne')],
    4: [swim('Natation technique', 'Drills avancés + 800m race pace', '50min', '1600m')],
    5: [bike('Brick moyen', 'Vélo 75min + Course 25min', '105min'), muscu('Force légère', 'Squats + Core')],
    6: [run('Sortie longue', 'Zone 2-3, 2h', '120min', '18km')],
    7: [rest()],
  },
  20: {
    1: [swim('Récupération', 'Nage facile', '35min', '900m', 'recup')],
    2: [bike('Récupération vélo', 'Zone 1', '50min')],
    3: [run('Footing léger', 'Zone 1-2', '35min', '5km', 'recup')],
    4: [swim('Nage douce', 'Technique', '40min', '1000m')],
    5: [rest()],
    6: [run('Activation', 'Zone 2 + quelques strides', '45min', '7km')],
    7: [rest()],
  },
  21: {
    1: [swim('Natation spécifique', '2×1000m allure compétition récup 60s', '70min', '2500m', 'seuil')],
    2: [bike('Simulation course', '40km allure compétition', '120min')],
    3: [run('Allure + vitesse', '15min échauff. + 4×(5min race pace/3min récup) + 10min', '60min', '11km', 'seuil')],
    4: [swim('Natation récup', 'Facile', '40min', '1200m', 'recup')],
    5: [bike('Brick final', 'Vélo 75min race pace + Course 30min race pace', '110min')],
    6: [run('Sortie longue', 'Dernière longue sortie, Zone 2', '110min', '17km')],
    7: [rest()],
  },

  // PHASE 4 — Semaines 22–25
  22: {
    1: [swim('Natation compétition', '1500m allure compétition', '45min', '2000m', 'seuil')],
    2: [bike('Vélo affûtage', 'Zone 2 + 2×15min Zone 3-4', '90min')],
    3: [run('Tempo court', '10min échauff. + 20min tempo + 10min', '45min', '8km', 'seuil')],
    4: [swim('Natation récup', 'Nage facile', '35min', '1000m', 'recup')],
    5: [bike('Brick affûtage', 'Vélo 50min + Course 15min allure course', '70min')],
    6: [run('Sortie longue réduite', 'Zone 2', '90min', '13km')],
    7: [rest()],
  },
  23: {
    1: [swim('Natation qualité', '4×300m allure compétition', '50min', '1800m', 'seuil')],
    2: [bike('Vélo court intense', 'Zone 2 + 3×10min Zone 4', '75min')],
    3: [run('Intervalles courts', '10min + 6×(2min Z4/2min Z2) + 10min', '45min', '7km', 'fractionne')],
    4: [swim('Natation aisance', 'Crawl confortable', '35min', '1000m')],
    5: [bike('Sortie légère', 'Zone 1-2, maintien des sensations', '60min')],
    6: [run('Sortie modérée', 'Zone 2, pas de fatigue', '70min', '10km')],
    7: [rest()],
  },
  24: {
    1: [swim('Natation légère', '3×200m allure race + 400m aisance', '40min', '1400m')],
    2: [bike('Activation vélo', 'Zone 1-2 + 2×8min Zone 3', '60min')],
    3: [run('Course légère + strides', '30min Zone 2 + 6×20s accélérations', '40min', '6km')],
    4: [swim('Natation douce', 'Technique, plaisir', '30min', '800m')],
    5: [bike('Sortie finale', 'Zone 1-2, se sentir bien', '45min')],
    6: [run('Footing de maintien', '20min tranquille, préparer la tête', '25min', '4km', 'recup')],
    7: [rest()],
  },
  25: {
    1: [swim('Natation pré-compétition', 'Échauffement habituel + quelques sprints', '25min', '700m')],
    2: [bike('Sortie d\'activation', 'Zone 1-2 uniquement, 30min maxi', '30min')],
    3: [run('Jogging + accélérations', '15min très facile + 4×20s allure course', '20min', '3km')],
    4: [rest()],
    5: [rest()],
    6: [swim('Échauffement J-1', '400m aisance + quelques sprints', '20min', '500m')],
    7: [{ type: 'sprint', discipline: undefined, label: 'COMPÉTITION', detail: 'Tout s\'est bien passé, maintenant c\'est l\'heure de performer ! Fais confiance à ta préparation.' }],
  },
}

export const DISCIPLINE_COLORS: Record<Discipline, string> = {
  swim: '#3B82F6',
  bike: '#F59E0B',
  run: '#10B981',
}

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  swim: 'Natation',
  bike: 'Vélo',
  run: 'Course',
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  endurance: 'Endurance',
  fartlek: 'Fartlek',
  seuil: 'Seuil',
  fractionne: 'Fractionné',
  recup: 'Récupération',
  force: 'Force',
  sprint: 'Sprint',
  muscu: 'Muscu',
  repos: 'Repos',
}
