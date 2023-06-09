import axios from "axios";
import EventEmitter from "eventemitter3";
import { toast } from "react-hot-toast";
import { System } from "./spacetraders-sdk";

class SystemDatabase {
  private _systems: System[] = [];

  // Read systems from localStorage if present, else fetch systems.json from api.spacetraders.io
  public init(): Promise<System[]> {
    const systemsStr = localStorage.getItem("systems");
    if (systemsStr) {
      // console.log("Found systems in localStorage");
      this._systems = JSON.parse(systemsStr) as System[];
      return new Promise((resolve) => resolve(this._systems));
    } else {
      // console.log("Systems not found in localStorage. Fetching.");
      return this.fetchAll();
    }
  }

  public fetchAll(): Promise<System[]> {
    const promise = axios
      .get("https://api.spacetraders.io/v2/systems.json")
      .then((res) => {
        this._systems = res.data;
        return res.data;
      });

    toast.promise(promise, {
      loading: "Fetching systems",
      success: "Fetched systems",
      error: "Error fetching systems",
    });

    promise.then((systems) => {
      localStorage.setItem("systems", JSON.stringify(systems));
    });

    promise.catch((err) => {
      console.log(err);
      toast.error("Error fetching systems.json");
    });

    return promise;
  }

  get all(): System[] {
    return this._systems;
  }
}

// TODO rename to SystemDB, align api with FleetDB and WaypointDB
const SystemDB = new SystemDatabase();

// Global event emitter for system selection in react UI or map view
const SystemEvent = new EventEmitter();

export { SystemDB, SystemEvent };
