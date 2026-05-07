import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MachineCard } from '../components/MachineCard';
import { ClassCard } from '../components/ClassCard';
import { GymSelector } from '../components/GymSelector';
import { useGym } from '../context/GymContext';
import { api, type MachineResponse, type GroupClassResponse } from '../api';
import { useToast } from '../hooks/useToast';
import './GymPage.css';

type Tab = 'machines' | 'classes';
type Filter = 'all' | 'available' | 'cardio' | 'musculation';

export default function GymPage() {
  const [searchParams] = useSearchParams();
  const { selectedGymId, selectedGym } = useGym();
  const [activeTab, setActiveTab] = useState<Tab>(
    searchParams.get('tab') === 'classes' ? 'classes' : 'machines'
  );
  const [filter, setFilter] = useState<Filter>('all');
  const [machines, setMachines] = useState<MachineResponse[]>([]);
  const [classes, setClasses] = useState<GroupClassResponse[]>([]);
  const [bookedClassIds, setBookedClassIds] = useState<string[]>([]);
  const { toast, showToast } = useToast();

  const reloadData = (gymId?: string) => {
    api.machines.list(gymId).then(setMachines);
    api.classes.list(gymId).then(setClasses);
  };

  useEffect(() => {
    api.user.bookings()
      .then((bookings) => setBookedClassIds(bookings.map((b) => b.id)))
      .catch(() => setBookedClassIds([]));
  }, []);

  useEffect(() => {
    reloadData(selectedGymId ?? undefined);
  }, [selectedGymId]);

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
      showToast("Machine réservée !");
      reloadData(selectedGymId ?? undefined);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleRelease = async (id: string) => {
    try {
      await api.machines.release(id);
      showToast("Réservation annulée");
      reloadData(selectedGymId ?? undefined);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleBookClass = async (id: string) => {
    try {
      await api.classes.book(id);
      showToast("Inscription confirmée !");
      setBookedClassIds((prev) => [...prev, id]);
      if (selectedGymId) api.classes.list(selectedGymId).then(setClasses);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await api.classes.cancel(id);
      showToast("Inscription annulée");
      setBookedClassIds((prev) => prev.filter((bookedId) => bookedId !== id));
      if (selectedGymId) api.classes.list(selectedGymId).then(setClasses);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Ma Salle</h1>
        <p className="page-subtitle">
          {selectedGym ? `${availableCount}/${machines.length} machines disponibles` : "Aucune salle sélectionnée"}
        </p>
      </div>

      <GymSelector />

      <div className="gym-tabs">
        <button className={`gym-tab ${activeTab === 'machines' ? 'gym-tab--active' : ''}`} onClick={() => setActiveTab('machines')}>
          Machines
        </button>
        <button className={`gym-tab ${activeTab === 'classes' ? 'gym-tab--active' : ''}`} onClick={() => setActiveTab('classes')}>
          Cours collectifs
        </button>
      </div>

      {activeTab === 'machines' && (
        <>
          <div className="gym-filters">
            {(['all', 'available', 'cardio', 'musculation'] as Filter[]).map((f) => (
              <button key={f} className={`gym-filter ${filter === f ? 'gym-filter--active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'Toutes' : f === 'available' ? 'Dispo' : f === 'cardio' ? 'Cardio' : 'Muscu'}
              </button>
            ))}
          </div>
          <div className="gym-machine-list">
            {filteredMachines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} onReserve={handleReserve} onRelease={handleRelease} />
            ))}
            {filteredMachines.length === 0 && <p className="gym-empty">Aucune machine trouvée</p>}
          </div>
        </>
      )}

      {activeTab === 'classes' && (
        <div className="gym-classes-list">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              groupClass={c}
              onBook={handleBookClass}
              onCancel={handleCancelBooking}
              isBooked={bookedClassIds.includes(c.id)}
            />
          ))}
          {classes.length === 0 && <p className="gym-empty">Aucun cours programmé</p>}
        </div>
      )}

      {toast && (
        <div className={`toast toast--visible toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
