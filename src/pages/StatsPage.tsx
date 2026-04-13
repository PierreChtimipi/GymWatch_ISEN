import { useState, useEffect } from 'react';
import { TrendingUp, Flame, Target, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, type SessionResponse, type UserProfileResponse } from '../api';
import './StatsPage.css';

export default function StatsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    api.sessions.list().then(setSessions);
    api.user.profile().then(setProfile);
  }, []);

  const totalCalories = sessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgDuration = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;
  const maxCalories = sessions.length > 0 ? Math.max(...sessions.map((s) => s.caloriesBurned)) : 1;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Mes Statistiques</h1>
        <p className="page-subtitle">Depuis le debut du mois</p>
      </div>

      <div className="stats-overview">
        <div className="stats-card card">
          <div className="stats-card-icon" style={{ background: 'rgba(245, 166, 35, 0.1)' }}>
            <Calendar size={20} color="var(--color-primary)" />
          </div>
          <span className="stats-card-value">{profile?.totalSessions ?? 0}</span>
          <span className="stats-card-label">Seances totales</span>
        </div>
        <div className="stats-card card">
          <div className="stats-card-icon" style={{ background: 'rgba(229, 57, 53, 0.1)' }}>
            <Flame size={20} color="var(--color-danger)" />
          </div>
          <span className="stats-card-value">{totalCalories.toLocaleString()}</span>
          <span className="stats-card-label">Calories brulees</span>
        </div>
        <div className="stats-card card">
          <div className="stats-card-icon" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
            <TrendingUp size={20} color="var(--color-success)" />
          </div>
          <span className="stats-card-value">{avgDuration} min</span>
          <span className="stats-card-label">Duree moyenne</span>
        </div>
        <div className="stats-card card">
          <div className="stats-card-icon" style={{ background: 'rgba(156, 39, 176, 0.1)' }}>
            <Target size={20} color="var(--color-yoga)" />
          </div>
          <span className="stats-card-value">{user?.goals.length ?? 0}</span>
          <span className="stats-card-label">Objectifs actifs</span>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="stats-chart-section card">
          <h3 className="section-title">Calories par seance</h3>
          <div className="stats-chart">
            {sessions.slice().reverse().map((session, i) => {
              const height = (session.caloriesBurned / maxCalories) * 100;
              const day = new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short' });
              return (
                <div key={i} className="stats-bar-col">
                  <div className="stats-bar-wrapper">
                    <div
                      className="stats-bar"
                      style={{ height: `${height}%` }}
                    >
                      <span className="stats-bar-value">{session.caloriesBurned}</span>
                    </div>
                  </div>
                  <span className="stats-bar-label">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="stats-history">
        <h3 className="section-title">Historique des seances</h3>
        {sessions.length === 0 && (
          <p className="stats-empty">Aucune seance enregistree</p>
        )}
        {sessions.map((session) => {
          const date = new Date(session.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          });
          return (
            <div key={session.id} className="stats-session card">
              <div className="stats-session-date">
                <span className="stats-session-day">{date}</span>
              </div>
              <div className="stats-session-info">
                <span className="stats-session-detail">{session.duration} min</span>
                <span className="stats-session-sep">-</span>
                <span className="stats-session-detail">{session.caloriesBurned} cal</span>
                <span className="stats-session-sep">-</span>
                <span className="stats-session-detail">{session.exercisesCompleted} exos</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
