import type { Machine } from '../types';
import './MachineCard.css';

export interface MachineCardProps {
  machine: Machine;
  onReserve: (id: string) => void;
}

export function MachineCard({ machine, onReserve }: MachineCardProps) {
  const statusClass = machine.available
    ? 'machine-card--available'
    : machine.reserved
      ? 'machine-card--reserved'
      : 'machine-card--busy';

  const statusLabel = machine.available
    ? 'Disponible'
    : machine.reserved
      ? 'Reservee'
      : 'Occupee';

  return (
    <div className={`machine-card ${statusClass}`}>
      <div className="machine-card-status" />
      <div className="machine-card-info">
        <h4 className="machine-card-name">{machine.name}</h4>
        <span className="machine-card-category">{machine.category}</span>
      </div>
      <div className="machine-card-actions">
        <span className="machine-card-badge">{statusLabel}</span>
        {machine.available && (
          <button
            className="machine-card-btn"
            onClick={() => onReserve(machine.id)}
          >
            Reserver
          </button>
        )}
      </div>
    </div>
  );
}
