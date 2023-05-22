import * as ex from "excalibur";
import { System, Waypoint } from "spacetraders-sdk";

export class WaypointViewScene extends ex.Scene {
  constructor() {
    super();

    console.log("hi");
  }

  public drawSystem(system: System) {
    for (const waypoint of system.waypoints) {
      console.log(waypoint);
    }
  }
}
