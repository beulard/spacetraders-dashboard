import { Ship } from "spacetraders-sdk";
import { fetchShipsRecursive } from "./fleet-context";

const cache: Map<string, Ship> = new Map();

// Force a refetch of current ships
function update() {
  return fetchShipsRecursive().then((ships) => {
    for (const s of ships) {
      cache.set(s.symbol, s);
    }
    return getMyShips();
  });
}

function getMyShips(): Ship[] {
  return [...cache.values()];
}

const FleetDB = { update, getMyShips };
export default FleetDB;
