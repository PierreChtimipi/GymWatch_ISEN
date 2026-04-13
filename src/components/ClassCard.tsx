import { Clock, Users } from 'lucide-react';
import type { GroupClass } from '../types';
import './ClassCard.css';

export interface ClassCardProps {
  groupClass: GroupClass;
  onBook: (id: string) => void;
}

export function ClassCard({ groupClass, onBook }: ClassCardProps) {
  const spotsPercentage = (groupClass.spotsLeft / groupClass.totalSpots) * 100;
  const isFull = groupClass.spotsLeft === 0;

  return (
    <div
      className="class-card"
      style={{ '--class-color': groupClass.color } as React.CSSProperties}
    >
      <div className="class-card-accent" />
      <div className="class-card-body">
        <div className="class-card-header">
          <h4 className="class-card-name">{groupClass.name}</h4>
          <span className="class-card-instructor">{groupClass.instructor}</span>
        </div>
        <div className="class-card-meta">
          <span className="class-card-detail">
            <Clock size={14} />
            {groupClass.time} - {groupClass.duration}min
          </span>
          <span className="class-card-detail">
            <Users size={14} />
            {groupClass.spotsLeft}/{groupClass.totalSpots} places
          </span>
        </div>
        <div className="class-card-spots-bar">
          <div
            className="class-card-spots-fill"
            style={{ width: `${100 - spotsPercentage}%` }}
          />
        </div>
        <button
          className="class-card-btn"
          disabled={isFull}
          onClick={() => onBook(groupClass.id)}
        >
          {isFull ? 'Complet' : "S'inscrire"}
        </button>
      </div>
    </div>
  );
}
