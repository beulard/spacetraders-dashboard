import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";
import { toast } from "react-hot-toast";
import api from "./api";
import { EventEmitter } from "eventemitter3";

class SystemData {
  private db: PouchDB.Database;
  private keepFetching: boolean = false;

  public constructor() {
    PouchDB.plugin(PouchFind);
    // Initialize local db
    this.db = new PouchDB("spacetrader.db");
    this.db.createIndex({ index: { fields: ["symbol"] } }).then((res) => {
      console.log("Symbol index ready");
    });
    this.db.createIndex({ index: { fields: ["x", "y"] } }).then((res) => {
      console.log("Coordinate index ready");
    });
  }

  /**
   * Get the system named `symbol`
   * @param symbol
   * @returns A promise of the system
   */
  public get(symbol: string): Promise<any> {
    // Check whether system exists in cache
    const promise = this.db
      .get(symbol)
      .then((res) => {
        toast.success(`${symbol} in local db`);
        return res;
      })
      .catch(() => {
        // If system is not found in local db, fetch API

        const fetchPromise = api.system
          .getSystem(symbol)
          .then((res) => res.data.data)
          .catch((err) => {
            console.log(err);
          });
        toast.promise(fetchPromise, {
          loading: `${symbol} not found in db, fetching...`,
          error: `System ${symbol} does not exist!`,
          success: `Fetched ${symbol}`,
        });

        fetchPromise.then((system) => {
          toast.success(`${symbol} found in API`);
          // Store it in the local db
          this.db.put({ _id: symbol, ...system }, { force: true });
          return system;
        });

        return fetchPromise;
      });
    return promise;
  }

  /**
   * Fetch a page of 20 systems from the API
   * @param pageIndex
   */
  public fetchPage(pageIndex: number) {
    const promise = api.system.getSystems(pageIndex, 20);
    promise
      .then((res) => {
        // toast.success(`Fetched page ${pageIndex}`);

        const systems = res.data.data;
        // console.log("adding " + systems.length + " systems");
        this.db
          .bulkDocs(
            systems.map((system) => ({ _id: system.symbol, ...system }))
          )
          .then(() => {
            // console.log("done");
          });
      })
      .catch((err) => {
        toast.error(`Failed to fetch page ${pageIndex}`);
        console.log(err);
      });
    return promise;
  }

  /**
   * Recursive fetch of system pages
   */
  public fetchNext(pageIndex: number) {
    this.fetchPage(pageIndex)
      .then((res) => {
        console.log(res.data.meta);
        this.fetchNext(pageIndex + 1);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public fetchStart() {
    this.keepFetching = true;
  }

  /**
   * Keep fetching pages until asked to fetchStop
   * @param pageIndex
   * @returns Promise to next page index
   */
  public async fetchUntil(pageIndex: number): Promise<number> {
    const promise = this.fetchPage(pageIndex).then(async (res) => {
      if (this.keepFetching) {
        // Wait for a couple of seconds
        await new Promise((resolve) => setTimeout(resolve, 500));
        // await new Promise((resolve) => setTimeout(resolve, 100));
        console.log(res.data.meta);
        return await this.fetchUntil(pageIndex + 1);
      } else {
        return pageIndex + 1;
      }
    });

    promise.catch((err) => {
      console.log(err);
    });

    return promise;
  }

  public fetchStop() {
    this.keepFetching = false;
  }

  /**
   * Fetch a given number of pages
   */
  public fetchPages(pageIndex: number, pageCount: number) {
    if (pageCount <= 0) {
      return;
    } else {
      this.fetchPage(pageIndex).then((res) => {
        // console.log(res.data.data);
        this.fetchPages(pageIndex + 1, pageCount - 1);
      });
    }
  }

  /**
   * Get all systems present in the local DB
   */
  public getAll(
    options?:
      | PouchDB.Core.AllDocsWithKeyOptions
      | PouchDB.Core.AllDocsWithinRangeOptions
      | PouchDB.Core.AllDocsOptions
  ) {
    return this.db.allDocs({ include_docs: true, ...options });
  }

  public find(req: PouchDB.Find.FindRequest<{}>) {
    return this.db.find(req);
  }

  /**
   * Add a listener for changes to the system list
   */
  public addListener(callback: ListenerCallback) {
    // this.listeners.push(callback);
    return this.db
      .changes({
        since: "now",
        live: true,
        include_docs: true,
      })
      .on("change", (change) => {
        callback(change);
      });
  }
}

interface ListenerCallback {
  (changes: PouchDB.Core.ChangesResponseChange<{}>): void;
}

// TODO rename to SystemDB, align api with FleetDB and WaypointDB
const Systems = new SystemData();

// Global event emitter for system selection in react UI or map view
const SystemEvent = new EventEmitter();

export { Systems, SystemEvent };
