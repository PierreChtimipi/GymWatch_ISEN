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
  gyms: {
    list: () => request<GymResponse[]>("/gyms"),
    get: (id: string) => request<GymResponse>(`/gyms/${id}`),
    subscribe: (id: string) => request<{ success: boolean }>(`/gyms/${id}/subscribe`, { method: "POST" }),
    unsubscribe: (id: string) => request<{ success: boolean }>(`/gyms/${id}/subscribe`, { method: "DELETE" }),
    subscriptions: () => request<string[]>("/gyms/user/subscriptions"),
  },
  machines: {
    list: (gymId?: string) => request<MachineResponse[]>(`/machines${gymId ? `?gymId=${gymId}` : ""}`),
    reserve: (id: string) => request<{ success: boolean }>(`/machines/${id}/reserve`, { method: "POST" }),
    release: (id: string) => request<{ success: boolean }>(`/machines/${id}/release`, { method: "POST" }),
  },
  classes: {
    list: (gymId?: string) => request<GroupClassResponse[]>(`/classes${gymId ? `?gymId=${gymId}` : ""}`),
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
    updateWeekPlan: (weekPlan: Record<string, string>) =>
      request<{ success: boolean }>("/user/week-plan", {
        method: "PUT",
        body: JSON.stringify({ weekPlan }),
      }),
    bookings: () => request<BookedClassResponse[]>("/user/bookings"),
  },
  admin: {
    gyms: () => request<AdminGymRow[]>("/admin/gyms"),
    updateGym: (id: string, data: Partial<{ name: string; address: string; city: string; description: string; maxCapacity: number; currentOccupancy: number; co2Level: number; temperature: number }>) =>
      request<AdminGymRow>(`/admin/gyms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    machines: () => request<AdminMachineRow[]>("/admin/machines"),
    createMachine: (data: { gymId: string; name: string; category: string }) =>
      request<AdminMachineRow>("/admin/machines", { method: "POST", body: JSON.stringify(data) }),
    updateMachine: (id: string, data: { name?: string; category?: string; available?: boolean }) =>
      request<{ success: boolean }>(`/admin/machines/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteMachine: (id: string) =>
      request<{ success: boolean }>(`/admin/machines/${id}`, { method: "DELETE" }),
    classes: () => request<AdminClassRow[]>("/admin/classes"),
    createClass: (data: AdminClassPayload) =>
      request<AdminClassRow>("/admin/classes", { method: "POST", body: JSON.stringify(data) }),
    updateClass: (id: string, data: Partial<AdminClassPayload>) =>
      request<{ success: boolean }>(`/admin/classes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteClass: (id: string) =>
      request<{ success: boolean }>(`/admin/classes/${id}`, { method: "DELETE" }),
    users: () => request<AdminUserRow[]>("/admin/users"),
  },
};

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  memberSince: string;
  goals: string[];
}

export interface GymStatsResponse {
  currentOccupancy: number;
  maxCapacity: number;
  co2Level: number;
  temperature: number;
}

export interface GymResponse {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  maxCapacity: number;
  currentOccupancy: number;
  co2Level: number;
  temperature: number;
}

export interface MachineResponse {
  id: string;
  name: string;
  category: string;
  gymId: string;
  available: boolean;
  reserved: boolean;
  reservedBy?: string;
}

export interface GroupClassResponse {
  id: string;
  gymId: string;
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
  isAdmin: boolean;
  memberSince: string;
  goals: string[];
  weekPlan: Record<string, string>;
  totalSessions: number;
}

export interface BookedClassResponse {
  id: string;
  gymId: string;
  gymName: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  spotsLeft: number;
  totalSpots: number;
  color: string;
}

export interface AdminGymRow {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  max_capacity: number;
  current_occupancy: number;
  co2_level: number;
  temperature: number;
}

export interface AdminMachineRow {
  id: string;
  gymId: string;
  gymName: string;
  name: string;
  category: string;
  available: boolean;
  reserved: boolean;
  reservedBy?: string;
}

export interface AdminClassRow {
  id: string;
  gymId: string;
  gymName: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  spotsLeft: number;
  totalSpots: number;
  color: string;
}

export interface AdminClassPayload {
  gymId: string;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  totalSpots: number;
  color?: string;
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  memberSince: string;
}
