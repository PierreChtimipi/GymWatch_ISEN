export interface Machine {
  id: string;
  name: string;
  category: string;
  available: boolean;
  reserved: boolean;
  reservedBy?: string;
}

export interface GroupClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  spotsLeft: number;
  totalSpots: number;
  color: string;
}

export interface GymStats {
  currentOccupancy: number;
  maxCapacity: number;
  co2Level: number;
  temperature: number;
}

export interface SessionStats {
  date: string;
  duration: number;
  caloriesBurned: number;
  exercisesCompleted: number;
}

export interface UserProfile {
  name: string;
  memberSince: string;
  totalSessions: number;
  goals: string[];
}
