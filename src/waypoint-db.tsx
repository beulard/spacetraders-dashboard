import { Waypoint } from "spacetraders-sdk";
import api from "./api";

const cache: Map<string, Waypoint[]> = new Map();

async function getSystemWaypoints(symbol: string): Promise<Waypoint[]> {
  const wps = cache.get(symbol);
  if (!wps) {
    console.debug(`no ${symbol} in db, fetching...`);
    console.warn(
      "FIXME: we are not fetching all waypoints but only the first page"
    );
    return await api.system.getSystemWaypoints(symbol).then((res) => {
      cache.set(symbol, res.data.data);
      return res.data.data;
    });
  } else {
    console.debug(`found ${symbol} in db!`);
    return wps;
  }
}

const WaypointDB = { getSystemWaypoints };
export default WaypointDB;
