import { useState } from 'react';
import {
  User,
  Target,
  Calendar,
  Accessibility,
  Moon,
  Bell,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { userProfile } from '../data/mockData';
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

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const memberDate = new Date(userProfile.memberSince).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Options</h1>
      </div>

      <div className="settings-profile card">
        <div className="settings-avatar">
          <span>{userProfile.name[0]}</span>
        </div>
        <div className="settings-profile-info">
          <h3 className="settings-profile-name">{userProfile.name}</h3>
          <span className="settings-profile-since">Membre depuis {memberDate}</span>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Mon compte</h3>
        <div className="settings-group card">
          <SettingItem
            icon={<User size={20} />}
            label="Mon profil"
            value="Modifier mes informations"
          />
          <SettingItem
            icon={<Target size={20} />}
            label="Mes objectifs"
            value={userProfile.goals.join(', ')}
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

      <button className="settings-logout">
        <LogOut size={18} />
        Se deconnecter
      </button>
    </div>
  );
}
