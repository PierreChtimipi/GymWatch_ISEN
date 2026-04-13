import { useState } from 'react';
import { MachineCard } from '../components/MachineCard';
import { ClassCard } from '../components/ClassCard';
import { machines, groupClasses } from '../data/mockData';
import './GymPage.css';

type Tab = 'machines' | 'classes';
type Filter = 'all' | 'available' | 'cardio' | 'musculation';

export function GymPage() {
  const [activeTab, setActiveTab] = useState<Tab>('machines');
  const [filter, setFilter] = useState<Filter>('all');

  const filteredMachines = machines.filter((m) => {
    if (filter === 'available') return m.available;
    if (filter === 'cardio') return m.category === 'Cardio';
    if (filter === 'musculation') return m.category !== 'Cardio';
    return true;
  });

  const availableCount = machines.filter((m) => m.available).length;

  const handleReserve = (id: string) => {
    alert(`Machine ${id} reservee ! (demo)`);
  };

  const handleBookClass = (id: string) => {
    alert(`Inscription au cours ${id} confirmee ! (demo)`);
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
              />
            ))}
          </div>
        </>
      )}

      {activeTab === 'classes' && (
        <div className="gym-classes-list">
          {groupClasses.map((c) => (
            <ClassCard key={c.id} groupClass={c} onBook={handleBookClass} />
          ))}
        </div>
      )}
    </div>
  );
}
