import { Waypoint } from "spacetraders-sdk";
import api from "./api";

const cache: Map<string, Waypoint[]> = new Map();

/**
 * Recursive fetch of waypoint pages
 */
async function fetchRecursive(
  systemSymbol: string,
  pageIndex: number = 1,
  limit: number = 10
): Promise<Waypoint[]> {
  try {
    const page = await api.system.getSystemWaypoints(
      systemSymbol,
      pageIndex,
      limit
    );
    const waypointCount = page.data.meta.page * page.data.meta.limit;
    if (waypointCount >= page.data.meta.total) {
      // Last page
      return page.data.data;
    } else {
      // Keep fetching
      return [
        ...page.data.data,
        ...(await fetchRecursive(systemSymbol, pageIndex + 1)),
      ];
    }
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getSystemWaypoints(symbol: string): Promise<Waypoint[]> {
  const wps = cache.get(symbol);
  if (!wps) {
    // console.debug(`no ${symbol} in db, fetching...`);
    return await fetchRecursive(symbol).then((res) => {
      cache.set(symbol, res);
      return res;
    });
  } else {
    return wps;
  }
}

const WaypointDB = { getSystemWaypoints };
export default WaypointDB;
