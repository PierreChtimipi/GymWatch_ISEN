import { ChevronDown } from "lucide-react";
import { useGym } from "../context/GymContext";
import "./GymSelector.css";

export function GymSelector() {
  const { subscribedGyms, selectedGymId, selectGym } = useGym();

  if (subscribedGyms.length <= 1) return null;

  return (
    <div className="gym-selector">
      <div className="gym-selector-wrapper">
        <select
          value={selectedGymId ?? ""}
          onChange={(e) => selectGym(e.target.value)}
        >
          {subscribedGyms.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <ChevronDown size={15} className="gym-selector-arrow" />
      </div>
    </div>
  );
}
