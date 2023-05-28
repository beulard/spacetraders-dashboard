import { Ship } from "spacetraders-sdk";
import { fetchShipsRecursive } from "./fleet-context";
import EventEmitter from "eventemitter3";

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

      return this.getMyShips();
    });
  }

  public getMyShips(): Ship[] {
    return [...this.cache.values()];
  }
}

// TODO make a custom hook for subscribing to fleet db events
// export function useFleet () {}

const FleetDB = new FleetDatabase();

export default FleetDB;
