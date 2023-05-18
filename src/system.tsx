// TODO A searchable database/list of all systems, prefetched and loaded from some json file on startup
// The map view should get its systems list from here.
// Should perhaps support updates

import { GetSystem200Response, System } from "spacetraders-sdk";
import api from "./api";
import loki from "lokijs";
import { AxiosResponse } from "axios";

// TODO on the right side of canvas:
// + A searchable list of systems/waypoints which show the object on map + info when clicked

/** Get the system symbol from the full symbol
 *  e.g. get X1-ABCD from X1-ABCD-1337D
 * @param fullSymbol
 */
export function getSystemSymbol(fullSymbol: string) {
  return fullSymbol.split("-").splice(0, 2).join("-");
}

class SystemData {
  private static _instance: SystemData;
  private systemList: Array<System> = [];
  private fetchedPages = [];
  private listeners: Array<SystemData.ListenerCallback> = [];
  private db: Loki;
  private systems: Collection<System>;

  public constructor() {
    // Initialize local db
    console.log("Init db");
    this.db = new loki("spacetrader.db", {
      verbose: true,
      // env: "BROWSER",
      autosave: true,
      autosaveInterval: 10000,
      autoload: true,
    });
    console.log();
    console.log("collections", this.db.listCollections());
    this.systems =
      this.db.getCollection("systems") || this.db.addCollection("systems");
  }

  public static New() {
    return (this._instance = new SystemData());
  }

  public static get Inst() {
    return this._instance || (this._instance = new SystemData());
  }

  private fetchLoopId: NodeJS.Timeout | null = null;
  /**
   *
   * @param limit Cap on number of systems to fetch
   */
  public fetchAllFromAPI(limit: number) {
    /**
     *
     * @param from First page
     * @param to Last+1 page
     * @param maxCount Total number of systems (as of res.data.meta.total)
     * @param intervalPages How many pages to fetch at once between waits
     * @param limit Number of systems per page
     */
    const fetchPages = (
      from: number,
      to: number,
      maxCount: number,
      intervalPages: number,
      limit = 20
    ) => {
      console.log(`Fetched systems ${this.systemList.length}/${maxCount}`);
      // Too many systems
      if (to * limit > maxCount) {
        console.log(`Exceeded system fetch limit (${maxCount})`);
        return;
      }
      console.log(`FETCHING PAGES ${from} to ${to}`);
      for (let i = from; i < to; ++i) {
        api.system.getSystems(i, limit).then((res) => {
          this.systemList = [...this.systemList, ...res.data.data];

          /// Notify listeners of new systems
          this.listeners.forEach((func) => func(res.data.data));
        });
      }
      // Calls itself after a delay to continue fetching
      this.fetchLoopId = setTimeout(() => {
        fetchPages(to, to + intervalPages, maxCount, intervalPages, 20);
      }, 2000);
    };

    api.system.getSystems(1, 1).then((res) => {
      console.log("get 1 system: ", res.data.meta);
      const maxCount = res.data.meta.total;

      const limitPerPage = 20; // Systems per page
      const intervalPages = 1; // Pages per wave

      // Start fetching
      fetchPages(
        1,
        1 + intervalPages,
        limit > 0 ? limit : maxCount,
        intervalPages,
        limitPerPage
      );
    });
  }

  public fetchCache() {
    return new Promise((resolve, reject) => {
      this.systemList = JSON.parse(localStorage.getItem("systems")!).data.data;
      resolve(this.systemList);
    });
  }

  /** Get the system named `symbol`
   *
   * @param symbol
   */
  public get(symbol: string): Promise<any> {
    // Check whether system exists in cache
    const system = this.systems.findOne({ symbol: symbol });
    console.log(this.systems.data);
    // Not in there, try to fetch it from the api
    if (system) {
      return new Promise((resolve) => {
        resolve(system);
      });
    } else {
      console.log(`${symbol} not found in local DB, fetching...`);
      const promise = api.system.getSystem(symbol);
      promise
        .then((res) => {
          console.log(`${symbol} found in API`);
          // Store it in the local db
          this.systems.insert(res.data.data);
          console.log(this.systems.data); //
          this.db.save();
        })
        .catch((err) => {
          console.log(`System ${symbol} does not exist!`);
          console.log(err);
        });
      console.log("promise:", promise);
      return promise;
    }
  }

  public getByIndex(index: number) {}

  public getAll() {
    return this.systemList;
  }

  public clear() {
    this.systemList = [];
    this.listeners = [];
  }
  // Add a listener for changes to the system list
  public addListener(callback: SystemData.ListenerCallback) {
    this.listeners.push(callback);
  }

  // Do a full refetch of the system data from the API and write it to disk
  public update() {}
}
// Callback function signature for listeners of SystemData changes
namespace SystemData {
  export interface ListenerCallback {
    (systems: Array<System>): void;
  }
}

const Systems = new SystemData();

export { Systems };
