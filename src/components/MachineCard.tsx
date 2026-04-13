import type { Machine } from '../types';
import { useAuth } from '../context/AuthContext';
import './MachineCard.css';

export interface MachineCardProps {
  machine: Machine;
  onReserve: (id: string) => void;
  onRelease?: (id: string) => void;
}

export function MachineCard({ machine, onReserve, onRelease }: MachineCardProps) {
  const { user } = useAuth();

  const isMyReservation = machine.reserved && machine.reservedBy === user?.name;

  const statusClass = machine.available
    ? 'machine-card--available'
    : machine.reserved
      ? 'machine-card--reserved'
      : 'machine-card--busy';

  const statusLabel = machine.available
    ? 'Disponible'
    : machine.reserved
      ? isMyReservation ? 'Ma reservation' : 'Reservee'
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
        {isMyReservation && onRelease && (
          <button
            className="machine-card-btn machine-card-btn--cancel"
            onClick={() => onRelease(machine.id)}
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
