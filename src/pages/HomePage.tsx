import { useState, useEffect } from 'react';
import { Thermometer, Wind, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OccupancyGauge } from '../components/OccupancyGauge';
import { ClassCard } from '../components/ClassCard';
import { useAuth } from '../context/AuthContext';
import { api, type GymResponse, type GroupClassResponse, type SessionResponse } from '../api';
import { useToast } from '../hooks/useToast';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [gym, setGym] = useState<GymResponse | null>(null);
  const [classes, setClasses] = useState<GroupClassResponse[]>([]);
  const [lastSession, setLastSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    api.gyms.subscriptions().then(async (subs) => {
      const gymId = subs[0];
      if (gymId) {
        const [gymData, classData] = await Promise.all([
          api.gyms.get(gymId),
          api.classes.list(gymId),
        ]);
        setGym(gymData);
        setClasses(classData);
      } else {
        // Fallback si pas encore inscrit dans une salle
        const stats = await api.gym.stats();
        setGym({
          id: "default",
          name: "",
          address: "",
          city: "",
          description: "",
          maxCapacity: stats.maxCapacity,
          currentOccupancy: stats.currentOccupancy,
          co2Level: stats.co2Level,
          temperature: stats.temperature,
        });
        api.classes.list().then(setClasses);
      }
    });

    api.sessions.list().then((sessions) => {
      if (sessions.length > 0) setLastSession(sessions[0]);
    });
  }, []);

  const handleBook = async (id: string) => {
    try {
      await api.classes.book(id);
      showToast("Inscription confirmee !");
      const gymId = gym?.id !== "default" ? gym?.id : undefined;
      const updated = await api.classes.list(gymId);
      setClasses(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const upcomingClasses = classes.slice(0, 3);

  return (
    <div className="page">
      <div className="page-header">
        <p className="home-greeting">Bonjour,</p>
        <h1 className="page-title">{user?.name}</h1>
        {gym?.name && <p className="page-subtitle">{gym.name}</p>}
      </div>

      {gym && (
        <>
          <div className="home-occupancy card">
            <div className="home-occupancy-header">
              <h3 className="section-title">Affluence en direct</h3>
              <div className="home-live-badge">
                <span className="home-live-dot" />
                LIVE
              </div>
            </div>
            <OccupancyGauge current={gym.currentOccupancy} max={gym.maxCapacity} />
          </div>

          <div className="home-env-row">
            <div className="home-env-card card">
              <Thermometer size={20} className="home-env-icon" />
              <span className="home-env-value">{gym.temperature}°C</span>
              <span className="home-env-label">Temperature</span>
            </div>
            <div className="home-env-card card">
              <Wind size={20} className="home-env-icon" />
              <span className="home-env-value">{gym.co2Level} ppm</span>
              <span className="home-env-label">CO2</span>
            </div>
          </div>
        </>
      )}

      {lastSession && (
        <div className="home-quick-stats card">
          <h3 className="section-title">Derniere seance</h3>
          <div className="home-stats-grid">
            <div className="home-stat">
              <TrendingUp size={18} className="home-stat-icon" />
              <span className="home-stat-value">{lastSession.duration} min</span>
              <span className="home-stat-label">Duree</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-emoji">🔥</span>
              <span className="home-stat-value">{lastSession.caloriesBurned}</span>
              <span className="home-stat-label">Calories</span>
            </div>
            <div className="home-stat">
              <Users size={18} className="home-stat-icon" />
              <span className="home-stat-value">{lastSession.exercisesCompleted}</span>
              <span className="home-stat-label">Exercices</span>
            </div>
          </div>
        </div>
      )}

      <div className="home-classes-section">
        <div className="home-classes-header">
          <h3 className="section-title">Cours du jour</h3>
          <Link to="/salle?tab=classes" className="home-see-all">
            Tout voir <ChevronRight size={16} />
          </Link>
        </div>
        <div className="home-classes-list">
          {upcomingClasses.length === 0 && (
            <p className="home-no-gym">
              <Link to="/salles">Inscris-toi dans une salle</Link> pour voir les cours.
            </p>
          )}
          {upcomingClasses.map((c) => (
            <ClassCard key={c.id} groupClass={c} onBook={handleBook} />
          ))}
        </div>
      </div>

      {toast && (
        <div className={`toast toast--visible toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
