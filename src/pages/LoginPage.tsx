import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Dumbbell, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="login-logo">
          <Dumbbell size={40} strokeWidth={2.5} />
        </div>
        <h1 className="login-title">GymWatch</h1>
        <p className="login-subtitle">Ta salle connectée</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="form-title">{isRegister ? "Créer un compte" : "Se connecter"}</h2>

        {error && <div className="login-error">{error}</div>}

        {isRegister && (
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Prenom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="input-group">
          <Mail size={18} className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <Lock size={18} className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Chargement..." : isRegister ? "S'inscrire" : "Se connecter"}
        </button>

        <p className="login-switch">
          {isRegister ? "Deja un compte ?" : "Pas encore de compte ?"}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
            {isRegister ? "Se connecter" : "S'inscrire"}
          </button>
        </p>

        {!isRegister && (
          <div className="demo-hint">
            <p>Compte demo : <strong>valentin@gymwatch.fr</strong></p>
            <p>Mot de passe : <strong>demo1234</strong></p>
          </div>
        )}
      </form>
    </div>
  );
}
