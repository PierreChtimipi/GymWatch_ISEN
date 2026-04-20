import { useState, useEffect, useRef } from 'react';
import {
  Target,
  Flame,
  Clock,
  Calendar,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Check,
  Dumbbell,
  Users,
  MapPin,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGym } from '../context/GymContext';
import { api, type UserProfileResponse, type SessionResponse, type BookedClassResponse } from '../api';
import { useToast } from '../hooks/useToast';
import './ProfilePage.css';

const DAYS: { key: string; label: string; short: string }[] = [
  { key: 'lun', label: 'Lundi', short: 'L' },
  { key: 'mar', label: 'Mardi', short: 'M' },
  { key: 'mer', label: 'Mercredi', short: 'M' },
  { key: 'jeu', label: 'Jeudi', short: 'J' },
  { key: 'ven', label: 'Vendredi', short: 'V' },
  { key: 'sam', label: 'Samedi', short: 'S' },
  { key: 'dim', label: 'Dimanche', short: 'D' },
];

const GOAL_SUGGESTIONS = [
  'Prise de masse', 'Perte de poids', 'Endurance', 'Flexibilite',
  'Cardio', 'Force', 'Tonicite', 'Bien-etre', 'Full Body', 'HIIT',
];

function getWeekActivityDays(sessions: SessionResponse[]): Set<number> {
  // Returns set of ISO day-of-week numbers (1=Mon..7=Sun) active this week
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay() === 0 ? 7 : now.getDay();
  startOfWeek.setDate(now.getDate() - (day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const activeDays = new Set<number>();
  for (const s of sessions) {
    const d = new Date(s.date);
    if (d >= startOfWeek && d < endOfWeek) {
      const dow = d.getDay() === 0 ? 7 : d.getDay();
      activeDays.add(dow);
    }
  }
  return activeDays;
}

function computeStreak(sessions: SessionResponse[]): number {
  if (sessions.length === 0) return 0;
  const sessionDates = new Set(sessions.map((s) => s.date.slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (sessionDates.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { subscribedGyms } = useGym();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [bookings, setBookings] = useState<BookedClassResponse[]>([]);

  // Goals editing
  const [editingGoals, setEditingGoals] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState('');

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  // Week plan editing
  const [weekPlan, setWeekPlan] = useState<Record<string, string>>({});
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [dayInput, setDayInput] = useState('');

  // Session form
  const [addingSession, setAddingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({ duration: '', calories: '', exercises: '' });

  useEffect(() => {
    Promise.all([
      api.user.profile(),
      api.sessions.list(),
      api.user.bookings(),
    ]).then(([p, s, b]) => {
      setProfile(p);
      setGoals(p.goals);
      setWeekPlan(p.weekPlan || {});
      setNameInput(p.name);
      setSessions(s);
      setBookings(b);
    });
  }, []);

  // ── Name ──
  const saveName = async () => {
    if (!nameInput.trim()) return;
    try {
      await api.user.updateProfile({ name: nameInput.trim() });
      setProfile((p) => p ? { ...p, name: nameInput.trim() } : p);
      showToast('Nom mis a jour !');
    } catch {
      showToast('Erreur lors de la mise a jour', 'error');
    }
    setEditingName(false);
  };

  // ── Goals ──
  const addGoal = (g: string) => {
    if (!g.trim() || goals.includes(g.trim())) return;
    setGoals([...goals, g.trim()]);
    setGoalInput('');
  };
  const removeGoal = (g: string) => setGoals(goals.filter((x) => x !== g));
  const saveGoals = async () => {
    try {
      await api.user.updateProfile({ goals });
      showToast('Objectifs mis a jour !');
      setEditingGoals(false);
    } catch {
      showToast('Erreur', 'error');
    }
  };

  // ── Week plan ──
  const startEditDay = (key: string) => {
    setEditingDay(key);
    setDayInput(weekPlan[key] || '');
  };
  const saveDayPlan = async (key: string) => {
    const next = { ...weekPlan, [key]: dayInput };
    setWeekPlan(next);
    setEditingDay(null);
    try {
      await api.user.updateWeekPlan(next);
    } catch {
      showToast('Erreur sauvegarde', 'error');
    }
  };

  // ── Add session ──
  const submitSession = async () => {
    const dur = parseInt(sessionForm.duration);
    const cal = parseInt(sessionForm.calories);
    const exo = parseInt(sessionForm.exercises);
    if (!dur || !cal || !exo) { showToast('Remplis tous les champs', 'error'); return; }
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('gymwatch_token')}`,
        },
        body: JSON.stringify({ date: today, duration: dur, caloriesBurned: cal, exercisesCompleted: exo }),
      });
      if (!res.ok) throw new Error();
      const [p, s] = await Promise.all([api.user.profile(), api.sessions.list()]);
      setProfile(p);
      setSessions(s);
      setSessionForm({ duration: '', calories: '', exercises: '' });
      setAddingSession(false);
      showToast('Seance ajoutee !');
    } catch {
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

  // ── Computed ──
  const totalCalories = sessions.reduce((s, x) => s + x.caloriesBurned, 0);
  const totalMinutes = sessions.reduce((s, x) => s + x.duration, 0);
  const streak = computeStreak(sessions);
  const activityDays = getWeekActivityDays(sessions);
  const memberDate = profile
    ? new Date(profile.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="page profile-page">
      {/* ── Hero ── */}
      <div className="profile-hero card">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          <div className="profile-avatar">
            <span>{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="profile-hero-info">
            {editingName ? (
              <div className="profile-name-edit">
                <input
                  ref={nameRef}
                  className="profile-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  autoFocus
                />
                <button className="profile-name-save" onClick={saveName}><Check size={16} /></button>
              </div>
            ) : (
              <div className="profile-name-row">
                <h2 className="profile-name">{user?.name}</h2>
                <button className="profile-name-edit-btn" onClick={() => setEditingName(true)}>
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <span className="profile-since">Membre depuis {memberDate}</span>
            {streak > 0 && (
              <div className="profile-streak">
                <Flame size={14} />
                <span>{streak} jour{streak > 1 ? 's' : ''} de suite</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Activity ring ── */}
      <div className="profile-week card">
        <h3 className="section-title">Cette semaine</h3>
        <div className="profile-week-dots">
          {DAYS.map((d, i) => (
            <div key={d.key} className="profile-week-dot-col">
              <div className={`profile-week-dot ${activityDays.has(i + 1) ? 'profile-week-dot--active' : ''}`} />
              <span className="profile-week-dot-label">{d.short}</span>
            </div>
          ))}
        </div>
        <p className="profile-week-summary">
          {activityDays.size === 0
            ? 'Aucune seance cette semaine'
            : `${activityDays.size} seance${activityDays.size > 1 ? 's' : ''} cette semaine`}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card card">
          <div className="profile-stat-icon" style={{ background: 'rgba(245,166,35,0.12)' }}>
            <Calendar size={18} color="var(--color-primary)" />
          </div>
          <span className="profile-stat-value">{profile?.totalSessions ?? 0}</span>
          <span className="profile-stat-label">Seances</span>
        </div>
        <div className="profile-stat-card card">
          <div className="profile-stat-icon" style={{ background: 'rgba(229,57,53,0.12)' }}>
            <Flame size={18} color="var(--color-danger)" />
          </div>
          <span className="profile-stat-value">{totalCalories > 999 ? `${(totalCalories / 1000).toFixed(1)}k` : totalCalories}</span>
          <span className="profile-stat-label">Calories</span>
        </div>
        <div className="profile-stat-card card">
          <div className="profile-stat-icon" style={{ background: 'rgba(76,175,80,0.12)' }}>
            <Clock size={18} color="var(--color-success)" />
          </div>
          <span className="profile-stat-value">{Math.round(totalMinutes / 60)}h</span>
          <span className="profile-stat-label">Temps total</span>
        </div>
        <div className="profile-stat-card card">
          <div className="profile-stat-icon" style={{ background: 'rgba(156,39,176,0.12)' }}>
            <Target size={18} color="var(--color-yoga)" />
          </div>
          <span className="profile-stat-value">{goals.length}</span>
          <span className="profile-stat-label">Objectifs</span>
        </div>
      </div>

      {/* ── Planning hebdo ── */}
      <div className="card profile-section">
        <div className="profile-section-header">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Mon Planning Hebdo</h3>
        </div>
        <div className="profile-plan-list">
          {DAYS.map((d) => (
            <div key={d.key} className="profile-plan-row">
              <span className="profile-plan-day">{d.label}</span>
              {editingDay === d.key ? (
                <div className="profile-plan-edit">
                  <input
                    className="profile-plan-input"
                    value={dayInput}
                    placeholder="Ex: Push — Pecto, Triceps"
                    onChange={(e) => setDayInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveDayPlan(d.key)}
                    autoFocus
                  />
                  <button className="profile-plan-save" onClick={() => saveDayPlan(d.key)}><Check size={14} /></button>
                  <button className="profile-plan-cancel" onClick={() => setEditingDay(null)}><X size={14} /></button>
                </div>
              ) : (
                <button className="profile-plan-value" onClick={() => startEditDay(d.key)}>
                  <span className={weekPlan[d.key] ? 'profile-plan-text' : 'profile-plan-empty'}>
                    {weekPlan[d.key] || 'Repos'}
                  </span>
                  <Pencil size={12} className="profile-plan-pencil" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Objectifs ── */}
      <div className="card profile-section">
        <div className="profile-section-header">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Mes Objectifs</h3>
          <button
            className={`profile-edit-btn ${editingGoals ? 'profile-edit-btn--active' : ''}`}
            onClick={() => (editingGoals ? saveGoals() : setEditingGoals(true))}
          >
            {editingGoals ? <><Check size={14} /> Sauvegarder</> : <><Pencil size={14} /> Modifier</>}
          </button>
        </div>
        <div className="profile-goals-tags">
          {goals.map((g) => (
            <span key={g} className="profile-goal-tag">
              {g}
              {editingGoals && (
                <button onClick={() => removeGoal(g)}><X size={12} /></button>
              )}
            </span>
          ))}
          {goals.length === 0 && !editingGoals && (
            <span className="profile-goals-empty">Aucun objectif defini</span>
          )}
          {editingGoals && (
            <button className="profile-goal-tag profile-goal-add" onClick={() => setEditingGoals(true)}>
              <Plus size={14} />
            </button>
          )}
        </div>
        {editingGoals && (
          <div className="profile-goals-input-row">
            <input
              className="profile-goal-input"
              placeholder="Nouvel objectif…"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGoal(goalInput)}
            />
            <button className="profile-goal-add-btn" onClick={() => addGoal(goalInput)}>
              <Plus size={16} />
            </button>
          </div>
        )}
        {editingGoals && (
          <div className="profile-goals-suggestions">
            {GOAL_SUGGESTIONS.filter((g) => !goals.includes(g)).slice(0, 6).map((g) => (
              <button key={g} className="profile-goal-suggestion" onClick={() => addGoal(g)}>
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Historique séances ── */}
      <div className="card profile-section">
        <div className="profile-section-header">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Historique des seances</h3>
          <button
            className="profile-edit-btn"
            onClick={() => setAddingSession(!addingSession)}
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {addingSession && (
          <div className="profile-session-form">
            <div className="profile-session-form-row">
              <div className="profile-session-form-field">
                <label>Durée (min)</label>
                <input
                  type="number"
                  placeholder="60"
                  value={sessionForm.duration}
                  onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                />
              </div>
              <div className="profile-session-form-field">
                <label>Calories</label>
                <input
                  type="number"
                  placeholder="400"
                  value={sessionForm.calories}
                  onChange={(e) => setSessionForm({ ...sessionForm, calories: e.target.value })}
                />
              </div>
              <div className="profile-session-form-field">
                <label>Exercices</label>
                <input
                  type="number"
                  placeholder="8"
                  value={sessionForm.exercises}
                  onChange={(e) => setSessionForm({ ...sessionForm, exercises: e.target.value })}
                />
              </div>
            </div>
            <div className="profile-session-form-actions">
              <button className="profile-form-cancel" onClick={() => setAddingSession(false)}>Annuler</button>
              <button className="profile-form-submit" onClick={submitSession}>
                <TrendingUp size={14} /> Enregistrer
              </button>
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <p className="profile-empty">Aucune seance enregistree</p>
        )}
        <div className="profile-sessions-list">
          {sessions.slice(0, 5).map((s) => {
            const date = new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
            return (
              <div key={s.id} className="profile-session-row">
                <div className="profile-session-icon">
                  <Dumbbell size={16} color="var(--color-primary)" />
                </div>
                <div className="profile-session-info">
                  <span className="profile-session-date">{date}</span>
                  <div className="profile-session-meta">
                    <span><Clock size={11} /> {s.duration} min</span>
                    <span><Flame size={11} /> {s.caloriesBurned} cal</span>
                    <span>{s.exercisesCompleted} exos</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {sessions.length > 5 && (
          <button className="profile-see-more" onClick={() => navigate('/stats')}>
            Voir tout l'historique <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── Cours réservés ── */}
      <div className="card profile-section">
        <div className="profile-section-header">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Mes Cours Reserves</h3>
        </div>
        {bookings.length === 0 && (
          <p className="profile-empty">Aucun cours reserve</p>
        )}
        <div className="profile-bookings-list">
          {bookings.map((b) => (
            <div key={b.id} className="profile-booking-row">
              <div className="profile-booking-dot" style={{ background: b.color }} />
              <div className="profile-booking-info">
                <span className="profile-booking-name">{b.name}</span>
                <span className="profile-booking-meta">{b.time} · {b.duration} min · {b.instructor}</span>
                <span className="profile-booking-gym">{b.gymName}</span>
              </div>
              <div className="profile-booking-spots">
                <Users size={13} />
                <span>{b.spotsLeft}/{b.totalSpots}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mes salles ── */}
      <div className="card profile-section">
        <div className="profile-section-header">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Mes Salles</h3>
          <button className="profile-edit-btn" onClick={() => navigate('/salles')}>
            <Plus size={14} /> Explorer
          </button>
        </div>
        {subscribedGyms.length === 0 && (
          <p className="profile-empty">Pas encore inscrit</p>
        )}
        <div className="profile-gyms-list">
          {subscribedGyms.map((g) => (
            <div key={g.id} className="profile-gym-row">
              <div className="profile-gym-icon">
                <MapPin size={16} color="var(--color-primary)" />
              </div>
              <div className="profile-gym-info">
                <span className="profile-gym-name">{g.name}</span>
                <span className="profile-gym-city">{g.city}</span>
              </div>
              <div className="profile-gym-occ">
                <div
                  className="profile-gym-occ-bar"
                  style={{ width: `${Math.min((g.currentOccupancy / g.maxCapacity) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Paramètres ── */}
      <button className="profile-settings-link card" onClick={() => navigate('/settings')}>
        <Settings size={18} />
        <span>Parametres & Preferences</span>
        <ChevronRight size={16} />
      </button>

      {toast && (
        <div className={`toast toast--visible toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
