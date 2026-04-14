import { useState, useEffect } from 'react';
import {
  User,
  Target,
  Calendar,
  Accessibility,
  Moon,
  Bell,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type UserProfileResponse } from '../api';
import './SettingsPage.css';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  toggle?: boolean;
  toggled?: boolean;
  onToggle?: (v: boolean) => void;
}

function SettingItem({ icon, label, value, onClick, toggle, toggled, onToggle }: SettingItemProps) {
  return (
    <button className="setting-item" onClick={toggle ? () => onToggle?.(!toggled) : onClick}>
      <div className="setting-item-icon">{icon}</div>
      <div className="setting-item-content">
        <span className="setting-item-label">{label}</span>
        {value && <span className="setting-item-value">{value}</span>}
      </div>
      {toggle ? (
        <div className={`setting-toggle ${toggled ? 'setting-toggle--on' : ''}`}>
          <div className="setting-toggle-thumb" />
        </div>
      ) : (
        <ChevronRight size={18} className="setting-item-arrow" />
      )}
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    api.user.profile().then(setProfile);
  }, []);

  const memberDate = profile
    ? new Date(profile.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Options</h1>
      </div>

      <div className="settings-profile card">
        <div className="settings-avatar">
          <span>{user?.name[0]}</span>
        </div>
        <div className="settings-profile-info">
          <h3 className="settings-profile-name">{user?.name}</h3>
          <span className="settings-profile-since">Membre depuis {memberDate}</span>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Mon compte</h3>
        <div className="settings-group card">
          <SettingItem
            icon={<User size={20} />}
            label="Mon profil"
            value={user?.email}
          />
          <SettingItem
            icon={<Target size={20} />}
            label="Mes objectifs"
            value={profile?.goals.join(', ') || 'Aucun objectif'}
          />
          <SettingItem
            icon={<Calendar size={20} />}
            label="Planification de seance"
            value="Programmer mes entrainements"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Preferences</h3>
        <div className="settings-group card">
          <SettingItem
            icon={<Bell size={20} />}
            label="Notifications"
            toggle
            toggled={notifications}
            onToggle={setNotifications}
          />
          <SettingItem
            icon={<Moon size={20} />}
            label="Mode sombre"
            toggle
            toggled={darkMode}
            onToggle={setDarkMode}
          />
          <SettingItem
            icon={<Accessibility size={20} />}
            label="Accessibilite"
            value="Taille du texte, contraste"
          />
        </div>
      </div>

      {isAdmin && (
        <div className="settings-section">
          <h3 className="section-title">Administration</h3>
          <div className="settings-group card">
            <SettingItem
              icon={<Shield size={20} />}
              label="Panneau admin"
              value="Gerer machines, cours et salles"
              onClick={() => navigate('/admin')}
            />
          </div>
        </div>
      )}

      <button className="settings-logout" onClick={logout}>
        <LogOut size={18} />
        Se deconnecter
      </button>
    </div>
  );
}
