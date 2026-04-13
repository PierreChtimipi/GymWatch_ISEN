import type { Machine, GroupClass, GymStats, SessionStats, UserProfile } from '../types';

export const gymStats: GymStats = {
  currentOccupancy: 47,
  maxCapacity: 120,
  co2Level: 620,
  temperature: 22.5,
};

export const machines: Machine[] = [
  { id: '1', name: 'Bench Press', category: 'Pectoraux', available: true, reserved: false },
  { id: '2', name: 'Squat Rack', category: 'Jambes', available: false, reserved: false },
  { id: '3', name: 'Tapis de course #1', category: 'Cardio', available: true, reserved: false },
  { id: '4', name: 'Tapis de course #2', category: 'Cardio', available: true, reserved: false },
  { id: '5', name: 'Leg Press', category: 'Jambes', available: false, reserved: true, reservedBy: 'Valentin' },
  { id: '6', name: 'Poulie haute', category: 'Dos', available: true, reserved: false },
  { id: '7', name: 'Velo elliptique', category: 'Cardio', available: false, reserved: false },
  { id: '8', name: 'Developpe epaules', category: 'Epaules', available: true, reserved: false },
  { id: '9', name: 'Curl biceps', category: 'Bras', available: true, reserved: false },
  { id: '10', name: 'Presse a cuisses', category: 'Jambes', available: false, reserved: true, reservedBy: 'Sophie' },
];

export const groupClasses: GroupClass[] = [
  { id: '1', name: 'Zumba', instructor: 'Marie L.', time: '10:00', duration: 45, spotsLeft: 8, totalSpots: 20, color: 'var(--color-zumba)' },
  { id: '2', name: 'CrossFit', instructor: 'Thomas R.', time: '12:00', duration: 60, spotsLeft: 2, totalSpots: 15, color: 'var(--color-crossfit)' },
  { id: '3', name: 'Yoga', instructor: 'Claire D.', time: '14:00', duration: 60, spotsLeft: 12, totalSpots: 25, color: 'var(--color-yoga)' },
  { id: '4', name: 'Pilates', instructor: 'Sophie M.', time: '16:00', duration: 45, spotsLeft: 0, totalSpots: 18, color: 'var(--color-pilates)' },
  { id: '5', name: 'Boxing', instructor: 'Kevin B.', time: '18:00', duration: 45, spotsLeft: 5, totalSpots: 12, color: 'var(--color-boxing)' },
  { id: '6', name: 'Cycling', instructor: 'Julien P.', time: '19:30', duration: 30, spotsLeft: 3, totalSpots: 20, color: 'var(--color-cycling)' },
];

export const sessionHistory: SessionStats[] = [
  { date: '2026-04-13', duration: 65, caloriesBurned: 420, exercisesCompleted: 8 },
  { date: '2026-04-11', duration: 50, caloriesBurned: 350, exercisesCompleted: 6 },
  { date: '2026-04-09', duration: 75, caloriesBurned: 520, exercisesCompleted: 10 },
  { date: '2026-04-07', duration: 45, caloriesBurned: 280, exercisesCompleted: 5 },
  { date: '2026-04-05', duration: 60, caloriesBurned: 400, exercisesCompleted: 7 },
  { date: '2026-04-03', duration: 55, caloriesBurned: 370, exercisesCompleted: 6 },
  { date: '2026-04-01', duration: 70, caloriesBurned: 480, exercisesCompleted: 9 },
];

export const userProfile: UserProfile = {
  name: 'Valentin',
  memberSince: '2025-09-01',
  totalSessions: 87,
  goals: ['Prise de masse', 'Endurance', 'Flexibilite'],
};
