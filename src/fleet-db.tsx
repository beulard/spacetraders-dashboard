import { Ship } from "./spacetraders-sdk";
import { fetchShipsRecursive } from "./fleet-context";
import EventEmitter from "eventemitter3";
import { useEffect, useState } from "react";

class FleetDatabase extends EventEmitter {
  private cache: Map<string, Ship> = new Map();

  // Force a refetch of current ships
  public update() {
    return fetchShipsRecursive().then((ships) => {
      for (const s of ships) {
        this.cache.set(s.symbol, s);
      }
      // Notify every listener
      this.emit("update", [...this.cache.values()]);

      return ships;
    });
  }

  public getMyShips(): Ship[] {
    return [...this.cache.values()];
  }
}

const FleetDB = new FleetDatabase();

// Hook for fleet
function useShips(): [Ship[], React.Dispatch<React.SetStateAction<Ship[]>>] {
  const [ships, setShips] = useState<Ship[]>(FleetDB.getMyShips());
  useEffect(() => {
    function fleetUpdateCallback(newShips: Ship[]) {
      setShips(newShips);
    }
    FleetDB.addListener("update", fleetUpdateCallback);

    return () => {
      FleetDB.removeListener("update", fleetUpdateCallback);
    };
  }, []);

  return [ships, setShips];
}

export { FleetDB, useShips };
