import { useState, useEffect } from "react";
import { MapPin, Users, Thermometer, Wind, CheckCircle, Plus } from "lucide-react";
import { api, type GymResponse } from "../api";
import { useToast } from "../hooks/useToast";
import "./GymListPage.css";

export default function GymListPage() {
  const [gyms, setGyms] = useState<GymResponse[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const { toast, showToast } = useToast();

  useEffect(() => {
    api.gyms.list().then(setGyms);
    api.gyms.subscriptions().then(setSubscriptions);
  }, []);

  const toggleSubscription = async (gymId: string) => {
    const subscribed = subscriptions.includes(gymId);
    try {
      if (subscribed) {
        await api.gyms.unsubscribe(gymId);
        setSubscriptions((prev) => prev.filter((id) => id !== gymId));
        showToast("Desinscription confirmee");
      } else {
        await api.gyms.subscribe(gymId);
        setSubscriptions((prev) => [...prev, gymId]);
        showToast("Inscription confirmee !");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const getOccupancyStatus = (current: number, max: number) => {
    const pct = (current / max) * 100;
    if (pct < 40) return { label: "Calme", color: "var(--color-success)" };
    if (pct < 70) return { label: "Moderee", color: "var(--color-warning)" };
    return { label: "Pleine", color: "var(--color-danger)" };
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Nos Salles</h1>
        <p className="page-subtitle">{gyms.length} salles disponibles</p>
      </div>

      <div className="gym-list">
        {gyms.map((gym) => {
          const subscribed = subscriptions.includes(gym.id);
          const status = getOccupancyStatus(gym.currentOccupancy, gym.maxCapacity);
          const pct = Math.round((gym.currentOccupancy / gym.maxCapacity) * 100);

          return (
            <div key={gym.id} className={`gym-list-card card ${subscribed ? "gym-list-card--subscribed" : ""}`}>
              <div className="gym-list-card-header">
                <div className="gym-list-card-info">
                  <h3 className="gym-list-card-name">{gym.name}</h3>
                  <div className="gym-list-card-location">
                    <MapPin size={13} />
                    <span>{gym.address}, {gym.city}</span>
                  </div>
                </div>
                {subscribed && (
                  <div className="gym-list-subscribed-badge">
                    <CheckCircle size={14} />
                    Inscrit
                  </div>
                )}
              </div>

              <p className="gym-list-card-desc">{gym.description}</p>

              <div className="gym-list-card-stats">
                <div className="gym-list-stat">
                  <Users size={14} />
                  <span style={{ color: status.color }}>{gym.currentOccupancy}/{gym.maxCapacity}</span>
                  <span className="gym-list-stat-label" style={{ color: status.color }}>{status.label}</span>
                </div>
                <div className="gym-list-stat">
                  <Thermometer size={14} />
                  <span>{gym.temperature}°C</span>
                </div>
                <div className="gym-list-stat">
                  <Wind size={14} />
                  <span>{gym.co2Level} ppm</span>
                </div>
              </div>

              <div className="gym-list-occupancy-bar">
                <div className="gym-list-occupancy-fill" style={{ width: `${pct}%`, background: status.color }} />
              </div>

              <button
                className={`gym-list-btn ${subscribed ? "gym-list-btn--leave" : "gym-list-btn--join"}`}
                onClick={() => toggleSubscription(gym.id)}
              >
                {subscribed ? (
                  "Se desinscrire"
                ) : (
                  <>
                    <Plus size={16} />
                    S'inscrire
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className={`toast toast--visible toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
