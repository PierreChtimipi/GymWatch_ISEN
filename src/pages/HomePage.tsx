import { useState, useEffect } from 'react';
import { Thermometer, Wind, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OccupancyGauge } from '../components/OccupancyGauge';
import { ClassCard } from '../components/ClassCard';
import { GymSelector } from '../components/GymSelector';
import { useAuth } from '../context/AuthContext';
import { useGym } from '../context/GymContext';
import { api, type GroupClassResponse, type SessionResponse } from '../api';
import { useToast } from '../hooks/useToast';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const { selectedGym, selectedGymId } = useGym();
  const { toast, showToast } = useToast();
  const [classes, setClasses] = useState<GroupClassResponse[]>([]);
  const [lastSession, setLastSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    if (selectedGymId) {
      api.classes.list(selectedGymId).then(setClasses);
    }
  }, [selectedGymId]);

  useEffect(() => {
    api.sessions.list().then((sessions) => {
      if (sessions.length > 0) setLastSession(sessions[0]);
    });
  }, []);

  const handleBook = async (id: string) => {
    try {
      await api.classes.book(id);
      showToast("Inscription confirmee !");
      if (selectedGymId) api.classes.list(selectedGymId).then(setClasses);
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

      <GymSelector />

      {!selectedGym && (
        <div className="home-no-gym-card card">
          <p>Pas encore inscrit dans une salle.</p>
          <Link to="/salles">Trouver une salle →</Link>
        </div>
      )}

      {selectedGym && (
        <>
          <div className="home-occupancy card">
            <div className="home-occupancy-header">
              <div>
                <h3 className="section-title">Affluence en direct</h3>
                <p className="home-gym-name">{selectedGym.name}</p>
              </div>
              <div className="home-live-badge">
                <span className="home-live-dot" />
                LIVE
              </div>
            </div>
            <OccupancyGauge current={selectedGym.currentOccupancy} max={selectedGym.maxCapacity} />
          </div>

          <div className="home-env-row">
            <div className="home-env-card card">
              <Thermometer size={20} className="home-env-icon" />
              <span className="home-env-value">{selectedGym.temperature}°C</span>
              <span className="home-env-label">Temperature</span>
            </div>
            <div className="home-env-card card">
              <Wind size={20} className="home-env-icon" />
              <span className="home-env-value">{selectedGym.co2Level} ppm</span>
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

      {selectedGym && (
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
            {upcomingClasses.length === 0 && (
              <p className="home-no-gym">Aucun cours programme aujourd'hui.</p>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast--visible toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
