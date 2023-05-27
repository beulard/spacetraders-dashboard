import * as ex from "excalibur";
import {
  Ship,
  System,
  SystemWaypoint,
  Waypoint,
  WaypointType,
} from "spacetraders-sdk";
import { SystemTypeColor, WaypointTypeStyle } from "./gfx-common";

interface SystemData {
  system: System;
  waypoints: Waypoint[];
  ships: Ship[];
}

const OrbitterTypes: WaypointType[] = ["MOON", "ORBITAL_STATION"];

const WaypointPositionScale = 6;

class WaypointGfx extends ex.Actor {
  constructor(waypoint: SystemWaypoint, config: ex.ActorArgs) {
    super(config);
    const style = WaypointTypeStyle[waypoint.type];
    const circle = new ex.Circle({
      radius: (style.size * WaypointPositionScale) / 2,
      color: style.color.darken(0.3),
      strokeColor: style.color.lighten(0.6),
      smoothing: true,
    });
    const label = new ex.Text({
      text: `${waypoint.symbol}\n${waypoint.type}`,
      color: ex.Color.White,
      font: new ex.Font({ family: "Roboto", size: 16 }),
    });
    this.z = 2;
    if (OrbitterTypes.includes(waypoint.type)) {
      // Offset by a random direction
      const angle = ex.randomInRange(0, ex.TwoPI);
      const dist = ex.randomInRange(5, 10) * WaypointPositionScale;
      this.pos.x += dist * Math.cos(angle);
      this.pos.y += dist * Math.sin(angle);
      this.z += 1;
    }
    this.graphics.show(circle);
    this.graphics.show(label, {
      anchor: ex.vec(0.5, 0.5),
      // offset: ex.vec(0, 10 * style.size),
    });
    label.showDebug = true;

    this.on("pointerenter", () => {
      circle.color = circle.color.lighten(0.5);
      circle.lineWidth += 1;
      // label.text = `${waypoint.symbol}\n${waypoint.type}`;
    });
    this.on("pointerleave", () => {
      circle.color = circle.color.darken(0.5);
      circle.lineWidth -= 1;
      // label.text = `${waypoint.symbol}`;
    });
    this.pointer.useGraphicsBounds = true;
  }
}

export class WaypointViewScene extends ex.Scene {
  // Min/max zoom scale
  private maxZoomScale = 1;
  private minZoomScale = 0.25;

  public onInitialize(engine: ex.Engine): void {
    const backButton = new ex.ScreenElement({
      width: 100,
      height: 50,
      color: ex.Color.White,
      pos: ex.vec(0, 0),
    });
    // const rect = new ex.Rectangle({
    //   width: 100,
    //   height: 50,
    //   strokeColor: ex.Color.Blue,
    //   color: ex.Color.Transparent,
    // });
    // backButton.graphics.use(rect);

    backButton.on("pointerdown", () => {
      this.exit();
    });

    this.add(backButton);
  }

  public onActivate(context: ex.SceneActivationContext<SystemData>) {
    this.clear();

    // Fetch the detailed waypoint data
    // How to not dedupe this with system-info fetching the same ?
    // Send msg?
    // api.system.getSystemWaypoints(context.data!.system);

    this.camera.pos = ex.vec(0, 0);
    this.camera.zoom = this.minZoomScale;
    this.drawSystem(context.data!.system, context.data!.waypoints);
    this.drawShips(context.data!.ships);
    this.camera.zoomOverTime(
      this.maxZoomScale / 2,
      300,
      ex.EasingFunctions.EaseOutCubic
    );

    // Set up user input
    const pointers = this.engine.input.pointers;
    // Mouse scroll zoom
    pointers.on("wheel", (evt) => {
      this.camera.zoomOverTime(
        ex.clamp(
          this.camera.zoom * 0.66 ** Math.sign(evt.deltaY),
          this.minZoomScale,
          this.maxZoomScale
        ),
        50,
        ex.EasingFunctions.EaseInOutCubic
      );
    });

    // Drag camera with mouse
    let dragStart = ex.vec(0, 0);
    let cameraDragStart = ex.vec(0, 0);
    let dragging = false;
    pointers.on("move", (evt) => {
      const nativeEvt = evt.nativeEvent as MouseEvent;
      // Mouse wheel / left only
      if (
        (nativeEvt.buttons & 4 || nativeEvt.buttons & 1) &&
        pointers.isDragging(evt.pointerId)
      ) {
        if (!dragging) {
          dragging = true;
          dragStart = evt.screenPos;
          cameraDragStart = this.camera.pos;
        }
        this.camera.pos = cameraDragStart.sub(
          evt.screenPos.sub(dragStart).scale(1.0 / this.camera.zoom)
        );
      } else {
        dragging = false;
      }
    });

    this.engine.input.keyboard.on("press", (evt) => {
      if (evt.key === ex.Input.Keys.Escape) {
        this.exit();
      }
    });
  }

  private exit() {
    this.camera
      .zoomOverTime(this.minZoomScale, 300, ex.EasingFunctions.EaseInCubic)
      .then(() => this.engine.goToScene("systemview"));
  }

  public onDeactivate() {
    this.engine.input.pointers.off("wheel");
    this.engine.input.pointers.off("move");
  }

  private drawShips(ships: Ship[]) {}

  private drawOrbit(waypoint: SystemWaypoint) {
    if (!OrbitterTypes.includes(waypoint.type)) {
      const orbit = new ex.Circle({
        radius:
          Math.sqrt(waypoint.x ** 2 + waypoint.y ** 2) * WaypointPositionScale,
        color: ex.Color.Transparent,
        strokeColor: WaypointTypeStyle[waypoint.type].color.darken(0.4),
        lineWidth: 2,
      });
      const actor = new ex.Actor({ x: 0, y: 0, z: 1 });
      actor.graphics.use(orbit);
      this.add(actor);
    }
  }

  public drawSystem(system: System, waypoints: Waypoint[]) {
    // Draw the stellar object
    const gfx = new ex.Actor({ x: 0, y: 0 });
    const circle = new ex.Circle({
      radius: (8 * WaypointPositionScale) / 2,
      color: SystemTypeColor[system.type].darken(0.3),
      strokeColor: SystemTypeColor[system.type].lighten(0.6),
      smoothing: true,
    });
    gfx.graphics.use(circle);
    this.add(gfx);

    // Draw each waypoint
    for (const waypoint of waypoints) {
      this.drawOrbit(waypoint);

      const gfx = new WaypointGfx(waypoint, {
        x: waypoint.x * WaypointPositionScale,
        y: waypoint.y * WaypointPositionScale,
      });

      this.add(gfx);
    }
  }
}
