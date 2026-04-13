const BASE_URL = "/api";

function getToken(): string | null {
  return localStorage.getItem("gymwatch_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: AuthUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string) =>
      request<{ token: string; user: AuthUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),
  },
  gym: {
    stats: () => request<GymStatsResponse>("/gym/stats"),
  },
  machines: {
    list: () => request<MachineResponse[]>("/machines"),
    reserve: (id: string) => request<{ success: boolean }>(`/machines/${id}/reserve`, { method: "POST" }),
    release: (id: string) => request<{ success: boolean }>(`/machines/${id}/release`, { method: "POST" }),
  },
  classes: {
    list: () => request<GroupClassResponse[]>("/classes"),
    book: (id: string) => request<{ success: boolean }>(`/classes/${id}/book`, { method: "POST" }),
    cancel: (id: string) => request<{ success: boolean }>(`/classes/${id}/book`, { method: "DELETE" }),
  },
  sessions: {
    list: () => request<SessionResponse[]>("/sessions"),
  },
  user: {
    profile: () => request<UserProfileResponse>("/user/profile"),
    updateProfile: (data: { name?: string; goals?: string[] }) =>
      request<UserProfileResponse>("/user/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    bookings: () => request<GroupClassResponse[]>("/user/bookings"),
  },
};

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  memberSince: string;
  goals: string[];
}

export interface GymStatsResponse {
  currentOccupancy: number;
  maxCapacity: number;
  co2Level: number;
  temperature: number;
}

export interface MachineResponse {
  id: string;
  name: string;
  category: string;
  available: boolean;
  reserved: boolean;
  reservedBy?: string;
}

export interface GroupClassResponse {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  spotsLeft: number;
  totalSpots: number;
  color: string;
}

export interface SessionResponse {
  id: number;
  date: string;
  duration: number;
  caloriesBurned: number;
  exercisesCompleted: number;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  memberSince: string;
  goals: string[];
  totalSessions: number;
}
