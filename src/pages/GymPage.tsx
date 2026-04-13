import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MachineCard } from '../components/MachineCard';
import { ClassCard } from '../components/ClassCard';
import { api, type MachineResponse, type GroupClassResponse } from '../api';
import { useToast } from '../hooks/useToast';
import './GymPage.css';

type Tab = 'machines' | 'classes';
type Filter = 'all' | 'available' | 'cardio' | 'musculation';

export default function GymPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(
    searchParams.get('tab') === 'classes' ? 'classes' : 'machines'
  );
  const [filter, setFilter] = useState<Filter>('all');
  const [machines, setMachines] = useState<MachineResponse[]>([]);
  const [classes, setClasses] = useState<GroupClassResponse[]>([]);
  const { toast, showToast } = useToast();

  useEffect(() => {
    api.machines.list().then(setMachines);
    api.classes.list().then(setClasses);
  }, []);

  const filteredMachines = machines.filter((m) => {
    if (filter === 'available') return m.available;
    if (filter === 'cardio') return m.category === 'Cardio';
    if (filter === 'musculation') return m.category !== 'Cardio';
    return true;
  });

  const availableCount = machines.filter((m) => m.available).length;

  const handleReserve = async (id: string) => {
    try {
      await api.machines.reserve(id);
      showToast("Machine reservee !");
      const updated = await api.machines.list();
      setMachines(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleRelease = async (id: string) => {
    try {
      await api.machines.release(id);
      showToast("Reservation annulee");
      const updated = await api.machines.list();
      setMachines(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleBookClass = async (id: string) => {
    try {
      await api.classes.book(id);
      showToast("Inscription confirmee !");
      const updated = await api.classes.list();
      setClasses(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Ma Salle</h1>
        <p className="page-subtitle">
          {availableCount}/{machines.length} machines disponibles
        </p>
      </div>

      <div className="gym-tabs">
        <button
          className={`gym-tab ${activeTab === 'machines' ? 'gym-tab--active' : ''}`}
          onClick={() => setActiveTab('machines')}
        >
          Machines
        </button>
        <button
          className={`gym-tab ${activeTab === 'classes' ? 'gym-tab--active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          Cours collectifs
        </button>
      </div>

      {activeTab === 'machines' && (
        <>
          <div className="gym-filters">
            {(['all', 'available', 'cardio', 'musculation'] as Filter[]).map((f) => (
              <button
                key={f}
                className={`gym-filter ${filter === f ? 'gym-filter--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Toutes' : f === 'available' ? 'Dispo' : f === 'cardio' ? 'Cardio' : 'Muscu'}
              </button>
            ))}
          </div>

          <div className="gym-machine-list">
            {filteredMachines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onReserve={handleReserve}
                onRelease={handleRelease}
              />
            ))}
            {filteredMachines.length === 0 && (
              <p className="gym-empty">Aucune machine trouvee</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'classes' && (
        <div className="gym-classes-list">
          {classes.map((c) => (
            <ClassCard key={c.id} groupClass={c} onBook={handleBookClass} />
          ))}
        </div>
      )}

      {toast && (
        <div className={`toast toast--visible toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
