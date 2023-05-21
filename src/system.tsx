import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";
import { toast } from "react-hot-toast";
import api from "./api";

// TODO on the right side of canvas:
// + A searchable list of systems/waypoints which show the object on map + info when clicked

/**
 * Get the system symbol from the full symbol
 * e.g. get X1-ABCD from X1-ABCD-1337D
 * @param fullSymbol
 */
export function getSystemSymbol(fullSymbol: string) {
  return fullSymbol.split("-").splice(0, 2).join("-");
}

class SystemData {
  private db: PouchDB.Database;

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
        console.log("adding " + systems.length + " systems");
        this.db
          .bulkDocs(
            systems.map((system) => ({ _id: system.symbol, ...system }))
          )
          .then(() => {
            console.log("done");
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

  /**
   * Fetch a given number of pages
   */
  public fetchPages(pageIndex: number, pageCount: number) {
    if (pageCount <= 0) {
      return;
    } else {
      this.fetchPage(pageIndex).then((res) => {
        console.log(res.data.data);
        this.fetchPages(pageIndex + 1, pageCount - 1);
      });
    }
  }

  /**
   * Fetch every system in the API and store it in the local DB if not yet present
   */
  public fetchAll() {
    // Determine how many systems we have stored so far
    this.db
      .info()
      .then((info) => {
        return info.doc_count;
      })
      .then((count) => {
        console.log(count);

        // Determine how many systems there are in total
        api.system
          .getSystems(1, 1)
          .then((res) => {
            return res.data.meta.total;
          })
          .then((total) => {
            let currentPage = Math.floor(count / 20) + 1;
            console.log(currentPage);

            // TODO possible to update progress bar in toast ?
            // const progressBarToast = toast(
            //   <div style={{ width: "10em" }}>
            //     Fetching systems...
            //     <ProgressBar value={count / total} />
            //   </div>,
            //   { duration: 3000000 }
            // );

            const id = setInterval(() => {
              this.db.info().then((info) => {
                if (info.doc_count >= total || currentPage >= total / 20 + 1) {
                  // toast.dismiss(progressBarToast);
                  clearInterval(id);
                } else {
                  toast.loading(
                    `Fetching page ${currentPage} / ${total / 20}`,
                    {
                      duration: 2000,
                    }
                  );
                  console.log(currentPage);
                  this.fetchPage(currentPage);
                  currentPage += 1;
                }
              });
            }, 2000);
          });
      });
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

const Systems = new SystemData();

export { Systems };
