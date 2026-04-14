import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, type GymResponse } from "../api";

interface GymContextType {
  selectedGymId: string | null;
  selectedGym: GymResponse | null;
  subscribedGyms: GymResponse[];
  selectGym: (id: string) => void;
  reload: () => void;
}

const GymContext = createContext<GymContextType | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const [subscribedGyms, setSubscribedGyms] = useState<GymResponse[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string | null>(
    localStorage.getItem("gymwatch_gym_id")
  );

  const load = () => {
    api.gyms.subscriptions().then(async (ids) => {
      if (ids.length === 0) { setSubscribedGyms([]); return; }
      const all = await api.gyms.list();
      const sub = all.filter((g) => ids.includes(g.id));
      setSubscribedGyms(sub);
      // Si la salle selectionnee n'est plus dans les abonnements, prendre la premiere
      setSelectedGymId((prev) => {
        const valid = prev && ids.includes(prev) ? prev : (ids[0] ?? null);
        localStorage.setItem("gymwatch_gym_id", valid ?? "");
        return valid;
      });
    });
  };

  useEffect(() => { load(); }, []);

  const selectGym = (id: string) => {
    localStorage.setItem("gymwatch_gym_id", id);
    setSelectedGymId(id);
  };

  const selectedGym = subscribedGyms.find((g) => g.id === selectedGymId) ?? null;

  return (
    <GymContext.Provider value={{ selectedGymId, selectedGym, subscribedGyms, selectGym, reload: load }}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used within GymProvider");
  return ctx;
}
