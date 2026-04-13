import { Thermometer, Wind, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OccupancyGauge } from '../components/OccupancyGauge';
import { ClassCard } from '../components/ClassCard';
import { gymStats, groupClasses, sessionHistory, userProfile } from '../data/mockData';
import './HomePage.css';

export function HomePage() {
  const todaySession = sessionHistory[0];
  const upcomingClasses = groupClasses.slice(0, 3);

  return (
    <div className="page">
      <div className="page-header">
        <p className="home-greeting">Bonjour,</p>
        <h1 className="page-title">{userProfile.name}</h1>
      </div>

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

      {todaySession && (
        <div className="home-quick-stats card">
          <h3 className="section-title">Derniere seance</h3>
          <div className="home-stats-grid">
            <div className="home-stat">
              <TrendingUp size={18} className="home-stat-icon" />
              <span className="home-stat-value">{todaySession.duration} min</span>
              <span className="home-stat-label">Duree</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-emoji">🔥</span>
              <span className="home-stat-value">{todaySession.caloriesBurned}</span>
              <span className="home-stat-label">Calories</span>
            </div>
            <div className="home-stat">
              <Users size={18} className="home-stat-icon" />
              <span className="home-stat-value">{todaySession.exercisesCompleted}</span>
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
            <ClassCard key={c.id} groupClass={c} onBook={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}
