import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Check, X, ChevronDown, Shield } from "lucide-react";
import { api, type AdminMachineRow, type AdminClassRow, type AdminGymRow, type AdminClassPayload } from "../api";
import { useToast } from "../hooks/useToast";
import "./AdminPage.css";

type AdminTab = "machines" | "classes" | "gyms";

const CLASS_COLORS = [
  { label: "Zumba (Rose)", value: "var(--color-zumba)" },
  { label: "CrossFit (Gris)", value: "var(--color-crossfit)" },
  { label: "Yoga (Violet)", value: "var(--color-yoga)" },
  { label: "Pilates (Cyan)", value: "var(--color-pilates)" },
  { label: "Boxing (Rouge)", value: "var(--color-boxing)" },
  { label: "Cycling (Orange)", value: "var(--color-cycling)" },
];

const MACHINE_CATEGORIES = ["Cardio", "Pectoraux", "Jambes", "Dos", "Epaules", "Bras", "CrossFit"];

interface MachineFormData {
  gymId: string;
  name: string;
  category: string;
}

interface ClassFormData {
  gymId: string;
  name: string;
  instructor: string;
  time: string;
  duration: string;
  totalSpots: string;
  color: string;
}

const emptyMachineForm: MachineFormData = { gymId: "", name: "", category: "Cardio" };
const emptyClassForm: ClassFormData = { gymId: "", name: "", instructor: "", time: "09:00", duration: "45", totalSpots: "20", color: "var(--color-crossfit)" };

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("machines");
  const [machines, setMachines] = useState<AdminMachineRow[]>([]);
  const [classes, setClasses] = useState<AdminClassRow[]>([]);
  const [gyms, setGyms] = useState<AdminGymRow[]>([]);
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [machineForm, setMachineForm] = useState<MachineFormData>(emptyMachineForm);
  const [classForm, setClassForm] = useState<ClassFormData>(emptyClassForm);
  const [editingMachine, setEditingMachine] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const loadData = () => {
    api.admin.machines().then(setMachines);
    api.admin.classes().then(setClasses);
    api.admin.gyms().then(setGyms);
  };

  useEffect(() => { loadData(); }, []);

  // ─── Machine handlers ────────────────────────────────────────────────────

  const handleCreateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createMachine(machineForm);
      showToast("Machine ajoutee !");
      setMachineForm(emptyMachineForm);
      setShowMachineForm(false);
      api.admin.machines().then(setMachines);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleToggleMachineAvailability = async (machine: AdminMachineRow) => {
    try {
      await api.admin.updateMachine(machine.id, { available: !machine.available });
      showToast(machine.available ? "Machine marquee hors service" : "Machine disponible");
      api.admin.machines().then(setMachines);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleDeleteMachine = async (id: string) => {
    try {
      await api.admin.deleteMachine(id);
      showToast("Machine supprimee");
      api.admin.machines().then(setMachines);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleEditMachineName = async (id: string, name: string) => {
    try {
      await api.admin.updateMachine(id, { name });
      showToast("Mise a jour effectuee");
      setEditingMachine(null);
      api.admin.machines().then(setMachines);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  // ─── Class handlers ──────────────────────────────────────────────────────

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createClass({
        ...classForm,
        duration: Number(classForm.duration),
        totalSpots: Number(classForm.totalSpots),
      });
      showToast("Cours ajoute !");
      setClassForm(emptyClassForm);
      setShowClassForm(false);
      api.admin.classes().then(setClasses);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await api.admin.deleteClass(id);
      showToast("Cours supprime");
      api.admin.classes().then(setClasses);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleUpdateClass = async (id: string, data: Partial<AdminClassPayload>) => {
    try {
      await api.admin.updateClass(id, data);
      showToast("Cours mis a jour");
      setEditingClass(null);
      api.admin.classes().then(setClasses);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  // ─── Grouped data ────────────────────────────────────────────────────────

  const machinesByGym = machines.reduce<Record<string, AdminMachineRow[]>>((acc, m) => {
    if (!acc[m.gymName]) acc[m.gymName] = [];
    acc[m.gymName].push(m);
    return acc;
  }, {});

  const classesByGym = classes.reduce<Record<string, AdminClassRow[]>>((acc, c) => {
    if (!acc[c.gymName]) acc[c.gymName] = [];
    acc[c.gymName].push(c);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-header">
        <div className="admin-title-row">
          <Shield size={20} className="admin-shield" />
          <h1 className="page-title">Administration</h1>
        </div>
        <p className="page-subtitle">Gestion des salles et equipements</p>
      </div>

      <div className="admin-tabs">
        {(["machines", "classes", "gyms"] as AdminTab[]).map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? "admin-tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "machines" ? "Machines" : t === "classes" ? "Cours" : "Salles"}
          </button>
        ))}
      </div>

      {/* ─── MACHINES ─────────────────────────────────────────────────── */}
      {tab === "machines" && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="section-title">Machines ({machines.length})</h3>
            <button className="admin-add-btn" onClick={() => setShowMachineForm(!showMachineForm)}>
              <Plus size={16} />
              Ajouter
            </button>
          </div>

          {showMachineForm && (
            <form className="admin-form card" onSubmit={handleCreateMachine}>
              <h4 className="admin-form-title">Nouvelle machine</h4>
              <div className="admin-form-field">
                <label>Salle</label>
                <div className="admin-select-wrapper">
                  <select value={machineForm.gymId} onChange={(e) => setMachineForm({ ...machineForm, gymId: e.target.value })} required>
                    <option value="">Selectionner une salle</option>
                    {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <ChevronDown size={16} />
                </div>
              </div>
              <div className="admin-form-field">
                <label>Nom</label>
                <input type="text" placeholder="ex: Bench Press #3" value={machineForm.name} onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })} required />
              </div>
              <div className="admin-form-field">
                <label>Categorie</label>
                <div className="admin-select-wrapper">
                  <select value={machineForm.category} onChange={(e) => setMachineForm({ ...machineForm, category: e.target.value })}>
                    {MACHINE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={16} />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setShowMachineForm(false)}>Annuler</button>
                <button type="submit" className="admin-btn-submit">Ajouter</button>
              </div>
            </form>
          )}

          {Object.entries(machinesByGym).map(([gymName, gymMachines]) => (
            <div key={gymName} className="admin-group">
              <h4 className="admin-group-title">{gymName}</h4>
              <div className="admin-items card">
                {gymMachines.map((m, idx) => (
                  <div key={m.id} className={`admin-item ${idx < gymMachines.length - 1 ? "admin-item--bordered" : ""}`}>
                    <div className={`admin-item-dot ${m.available ? "admin-item-dot--available" : "admin-item-dot--unavailable"}`} />
                    <div className="admin-item-info">
                      {editingMachine === m.id ? (
                        <EditNameInput
                          defaultValue={m.name}
                          onSave={(name) => handleEditMachineName(m.id, name)}
                          onCancel={() => setEditingMachine(null)}
                        />
                      ) : (
                        <>
                          <span className="admin-item-name">{m.name}</span>
                          <span className="admin-item-sub">{m.category}</span>
                        </>
                      )}
                    </div>
                    <div className="admin-item-actions">
                      <button
                        className={`admin-badge-btn ${m.available ? "admin-badge-btn--on" : "admin-badge-btn--off"}`}
                        onClick={() => handleToggleMachineAvailability(m)}
                        title={m.available ? "Marquer hors service" : "Marquer disponible"}
                      >
                        {m.available ? "Dispo" : "Hors service"}
                      </button>
                      <button className="admin-icon-btn" onClick={() => setEditingMachine(editingMachine === m.id ? null : m.id)}>
                        <Edit3 size={15} />
                      </button>
                      <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => handleDeleteMachine(m.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── CLASSES ──────────────────────────────────────────────────── */}
      {tab === "classes" && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="section-title">Cours ({classes.length})</h3>
            <button className="admin-add-btn" onClick={() => setShowClassForm(!showClassForm)}>
              <Plus size={16} />
              Ajouter
            </button>
          </div>

          {showClassForm && (
            <form className="admin-form card" onSubmit={handleCreateClass}>
              <h4 className="admin-form-title">Nouveau cours</h4>
              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label>Salle</label>
                  <div className="admin-select-wrapper">
                    <select value={classForm.gymId} onChange={(e) => setClassForm({ ...classForm, gymId: e.target.value })} required>
                      <option value="">Selectionner</option>
                      {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </div>
                <div className="admin-form-field">
                  <label>Couleur</label>
                  <div className="admin-select-wrapper">
                    <select value={classForm.color} onChange={(e) => setClassForm({ ...classForm, color: e.target.value })}>
                      {CLASS_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label>Nom du cours</label>
                  <input type="text" placeholder="ex: HIIT" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} required />
                </div>
                <div className="admin-form-field">
                  <label>Instructeur</label>
                  <input type="text" placeholder="Prenom" value={classForm.instructor} onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })} required />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label>Horaire</label>
                  <input type="time" value={classForm.time} onChange={(e) => setClassForm({ ...classForm, time: e.target.value })} required />
                </div>
                <div className="admin-form-field">
                  <label>Duree (min)</label>
                  <input type="number" min="15" max="180" value={classForm.duration} onChange={(e) => setClassForm({ ...classForm, duration: e.target.value })} required />
                </div>
                <div className="admin-form-field">
                  <label>Places</label>
                  <input type="number" min="1" max="100" value={classForm.totalSpots} onChange={(e) => setClassForm({ ...classForm, totalSpots: e.target.value })} required />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setShowClassForm(false)}>Annuler</button>
                <button type="submit" className="admin-btn-submit">Ajouter</button>
              </div>
            </form>
          )}

          {Object.entries(classesByGym).map(([gymName, gymClasses]) => (
            <div key={gymName} className="admin-group">
              <h4 className="admin-group-title">{gymName}</h4>
              <div className="admin-items card">
                {gymClasses.map((c, idx) => (
                  <div key={c.id}>
                    <div className={`admin-item ${idx < gymClasses.length - 1 && editingClass !== c.id ? "admin-item--bordered" : ""}`}>
                      <div className="admin-class-accent" style={{ background: c.color }} />
                      <div className="admin-item-info">
                        <span className="admin-item-name">{c.name}</span>
                        <span className="admin-item-sub">{c.instructor} · {c.time} · {c.duration}min · {c.spotsLeft}/{c.totalSpots} places</span>
                      </div>
                      <div className="admin-item-actions">
                        <button className="admin-icon-btn" onClick={() => setEditingClass(editingClass === c.id ? null : c.id)}>
                          <Edit3 size={15} />
                        </button>
                        <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => handleDeleteClass(c.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    {editingClass === c.id && (
                      <ClassEditForm
                        cls={c}
                        gyms={gyms}
                        onSave={(data) => handleUpdateClass(c.id, data)}
                        onCancel={() => setEditingClass(null)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── GYMS ─────────────────────────────────────────────────────── */}
      {tab === "gyms" && (
        <div className="admin-section">
          <h3 className="section-title">Gestion des salles</h3>
          {gyms.map((gym) => (
            <GymEditCard
              key={gym.id}
              gym={gym}
              onSave={async (data) => {
                try {
                  await api.admin.updateGym(gym.id, data);
                  showToast("Salle mise a jour !");
                  api.admin.gyms().then(setGyms);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Erreur", "error");
                }
              }}
            />
          ))}
        </div>
      )}

      {toast && (
        <div className={`toast toast--visible toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface GymEditCardProps {
  gym: AdminGymRow;
  onSave: (data: Record<string, unknown>) => void;
}

function GymEditCard({ gym, onSave }: GymEditCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    name: gym.name,
    address: gym.address,
    city: gym.city,
    description: gym.description,
    maxCapacity: String(gym.max_capacity),
    currentOccupancy: String(gym.current_occupancy),
    co2Level: String(gym.co2_level),
    temperature: String(gym.temperature),
  });

  useEffect(() => {
    setForm({
      name: gym.name,
      address: gym.address,
      city: gym.city,
      description: gym.description,
      maxCapacity: String(gym.max_capacity),
      currentOccupancy: String(gym.current_occupancy),
      co2Level: String(gym.co2_level),
      temperature: String(gym.temperature),
    });
  }, [gym]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      address: form.address,
      city: form.city,
      description: form.description,
      maxCapacity: Number(form.maxCapacity),
      currentOccupancy: Number(form.currentOccupancy),
      co2Level: Number(form.co2Level),
      temperature: Number(form.temperature),
    });
    setExpanded(false);
  };

  return (
    <div className="admin-gym-card card">
      <div className="admin-gym-card-header" onClick={() => setExpanded(!expanded)}>
        <div>
          <h4 className="admin-gym-name">{gym.name}</h4>
          <p className="admin-gym-city">{gym.city} · {gym.current_occupancy}/{gym.max_capacity} personnes</p>
        </div>
        <button className="admin-icon-btn">
          <Edit3 size={15} />
        </button>
      </div>

      {expanded && (
        <form className="admin-gym-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <div className="admin-form-field">
              <label>Nom</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="admin-form-field">
              <label>Ville</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
          </div>
          <div className="admin-form-field">
            <label>Adresse</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="admin-form-field">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="admin-form-row">
            <div className="admin-form-field">
              <label>Capacite max</label>
              <input type="number" min="1" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} required />
            </div>
            <div className="admin-form-field">
              <label>Affluence actuelle</label>
              <input type="number" min="0" value={form.currentOccupancy} onChange={(e) => setForm({ ...form, currentOccupancy: e.target.value })} required />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-field">
              <label>CO2 (ppm)</label>
              <input type="number" value={form.co2Level} onChange={(e) => setForm({ ...form, co2Level: e.target.value })} required />
            </div>
            <div className="admin-form-field">
              <label>Temperature (°C)</label>
              <input type="number" step="0.5" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} required />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-btn-cancel" onClick={() => setExpanded(false)}>Annuler</button>
            <button type="submit" className="admin-btn-submit">Enregistrer</button>
          </div>
        </form>
      )}
    </div>
  );
}

function ClassEditForm({ cls, gyms, onSave, onCancel }: { cls: AdminClassRow; gyms: AdminGymRow[]; onSave: (d: Partial<AdminClassPayload>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    gymId: cls.gymId,
    name: cls.name,
    instructor: cls.instructor,
    time: cls.time,
    duration: String(cls.duration),
    totalSpots: String(cls.totalSpots),
    color: cls.color,
  });

  return (
    <div className="admin-class-edit-form">
      <div className="admin-form-row">
        <div className="admin-form-field">
          <label>Nom</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="admin-form-field">
          <label>Instructeur</label>
          <input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
        </div>
      </div>
      <div className="admin-form-row">
        <div className="admin-form-field">
          <label>Horaire</label>
          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </div>
        <div className="admin-form-field">
          <label>Duree (min)</label>
          <input type="number" min="15" max="180" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        </div>
        <div className="admin-form-field">
          <label>Places</label>
          <input type="number" min="1" max="100" value={form.totalSpots} onChange={(e) => setForm({ ...form, totalSpots: e.target.value })} />
        </div>
      </div>
      <div className="admin-form-field">
        <label>Couleur</label>
        <div className="admin-select-wrapper">
          <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
            {CLASS_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <ChevronDown size={16} />
        </div>
      </div>
      <div className="admin-form-field">
        <label>Salle</label>
        <div className="admin-select-wrapper">
          <select value={form.gymId} onChange={(e) => setForm({ ...form, gymId: e.target.value })}>
            {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <ChevronDown size={16} />
        </div>
      </div>
      <div className="admin-form-actions">
        <button type="button" className="admin-btn-cancel" onClick={onCancel}>Annuler</button>
        <button type="button" className="admin-btn-submit" onClick={() => onSave({ ...form, duration: Number(form.duration), totalSpots: Number(form.totalSpots) })}>Enregistrer</button>
      </div>
    </div>
  );
}

function EditNameInput({ defaultValue, onSave, onCancel }: { defaultValue: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="admin-edit-input">
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
      <button type="button" className="admin-icon-btn admin-icon-btn--confirm" onClick={() => onSave(value)}><Check size={14} /></button>
      <button type="button" className="admin-icon-btn" onClick={onCancel}><X size={14} /></button>
    </div>
  );
}

