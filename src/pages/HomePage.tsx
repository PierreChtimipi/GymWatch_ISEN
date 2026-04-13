import { useState, useEffect } from 'react';
import { Thermometer, Wind, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OccupancyGauge } from '../components/OccupancyGauge';
import { ClassCard } from '../components/ClassCard';
import { useAuth } from '../context/AuthContext';
import { api, type GymStatsResponse, type GroupClassResponse, type SessionResponse } from '../api';
import { useToast } from '../hooks/useToast';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [gymStats, setGymStats] = useState<GymStatsResponse | null>(null);
  const [classes, setClasses] = useState<GroupClassResponse[]>([]);
  const [lastSession, setLastSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    api.gym.stats().then(setGymStats);
    api.classes.list().then(setClasses);
    api.sessions.list().then((sessions) => {
      if (sessions.length > 0) setLastSession(sessions[0]);
    });
  }, []);

  const handleBook = async (id: string) => {
    try {
      await api.classes.book(id);
      showToast("Inscription confirmee !");
      const updated = await api.classes.list();
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
      </div>

      {gymStats && (
        <>
          <div className="home-occupancy card">
            <div className="home-occupancy-header">
              <h3 className="section-title">Affluence en direct</h3>
              <div className="home-live-badge">
                <span className="home-live-dot" />
                LIVE
              </div>
            </div>
            <OccupancyGauge current={gymStats.currentOccupancy} max={gymStats.maxCapacity} />
          </div>

          <div className="home-env-row">
            <div className="home-env-card card">
              <Thermometer size={20} className="home-env-icon" />
              <span className="home-env-value">{gymStats.temperature}°C</span>
              <span className="home-env-label">Temperature</span>
            </div>
            <div className="home-env-card card">
              <Wind size={20} className="home-env-icon" />
              <span className="home-env-value">{gymStats.co2Level} ppm</span>
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
