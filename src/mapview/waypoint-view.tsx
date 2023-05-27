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

const WaypointPositionScale = 24;

function shorten(symbol: string) {
  return symbol.split("-").reverse()[0];
}

class WaypointGfx extends ex.Actor {
  constructor(waypoint: Waypoint, config: ex.ActorArgs) {
    super(config);

    // Show above orbits
    this.z = 2;

    const style = WaypointTypeStyle[waypoint.type];
    const circle = new ex.Circle({
      radius: (style.size * WaypointPositionScale) / 4,
      color: style.color.darken(0.3),
      strokeColor: style.color.lighten(0.6),
      smoothing: true,
    });

    if (OrbitterTypes.includes(waypoint.type)) {
      // Offset by a random direction
      // TODO distribute orbitals evenly around parent
      // Use symbol as seed so we get same angles every time
      const angle = ex.randomInRange(0, ex.TwoPI);
      const dist = ex.randomInRange(2.5, 5) * WaypointPositionScale;
      this.pos.x += dist * Math.cos(angle);
      this.pos.y += dist * Math.sin(angle);
      this.z += 1;
    }

    this.graphics.show(circle);
    this.on("pointerenter", () => {
      circle.color = circle.color.lighten(0.5);
      circle.lineWidth += 1;
    });
    this.on("pointerleave", () => {
      circle.color = circle.color.darken(0.5);
      circle.lineWidth -= 1;
    });
    this.pointer.useGraphicsBounds = true;
  }
}

export class WaypointViewScene extends ex.Scene {
  // Min/max zoom scale
  private maxZoomScale = 1;
  private minZoomScale = 0.125;
  private waypoints: Waypoint[] = [];

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

    // this.add(backButton);
  }

  public onActivate(context: ex.SceneActivationContext<SystemData>) {
    this.clear();

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

  private drawShips(ships: Ship[]) {
    for (const ship of ships) {
      // Calculate the interpolated position
      const dest = ship.nav.route.destination;
      const gfx = new ex.Actor({
        x: dest.x * WaypointPositionScale,
        y: dest.y * WaypointPositionScale,
      });
      // Draw above waypoints
      gfx.z = 3;

      const dot = new ex.Polygon({
        points: [ex.vec(0, -10), ex.vec(5, 0), ex.vec(0, 10), ex.vec(-5, 0)],
        color: ex.Color.Yellow,
      });
      gfx.graphics.show(dot);

      const name = new ex.Text({
        text: ship.symbol,
        font: new ex.Font({ family: "Roboto", size: 16, bold: true }),
        color: ex.Color.White,
      });
      gfx.graphics.show(name, { offset: ex.vec(0, 30) });

      this.add(gfx);
    }
  }

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
      radius: (4 * WaypointPositionScale) / 2,
      strokeColor: SystemTypeColor[system.type]
        .desaturate(0.3)
        .multiply(ex.Color.fromRGB(255, 255, 255, 0.5)),
      color: SystemTypeColor[system.type].saturate(0.3),
      smoothing: true,
      lineWidth: 5,
    });
    gfx.graphics.use(circle);
    this.add(gfx);

    // Determine which waypoints are orbitals of others
    const orbitalWaypoints = new Map<string, string>(); // map<orbital -> parent>
    for (const w of waypoints) {
      for (const o of w.orbitals) {
        orbitalWaypoints.set(o.symbol, w.symbol);
      }
    }

    // Draw each waypoint
    for (const waypoint of waypoints) {
      this.drawOrbit(waypoint);

      const parent = waypoints.find(
        (w) => w.symbol === orbitalWaypoints.get(waypoint.symbol)
      );

      const gfx = new WaypointGfx(waypoint, {
        x: waypoint.x * WaypointPositionScale,
        y: waypoint.y * WaypointPositionScale,
      });

      // C'est un bordel ici...
      const waypointUi = new ex.Actor({ pos: gfx.pos });
      const label = new ex.Text({
        text: `${shorten(waypoint.symbol)}\n[${waypoint.type}]`,
        color: ex.Color.White,
        font: new ex.Font({
          family: "OpenSans",
          size: 10,
          unit: ex.FontUnit.Pt,
          textAlign: ex.TextAlign.Center,
          smoothing: true,
        }),
      });
      const traits = new ex.Text({
        text: waypoint.traits.map((t) => t.name).join("\n"),
        font: new ex.Font({
          family: "Ubuntu Mono",
          size: 10,
          unit: ex.FontUnit.Pt,
          textAlign: ex.TextAlign.Left,
          smoothing: true,
        }),
        color: ex.Color.White,
      });

      const hasTraits = waypoint.traits.length > 0;
      const padding = 10;

      const style = WaypointTypeStyle[waypoint.type];

      const traitsBg = new ex.Rectangle({
        height: traits.height + padding,
        width: traits.width + padding,
        color: ex.Color.DarkGray.multiply(ex.Color.fromRGB(255, 255, 255, 0.2)),
        strokeColor: ex.Color.Gray,
        lineWidth: 2,
      });

      waypointUi.z = 3;

      waypointUi.graphics.add("traits", traits);
      waypointUi.graphics.add("traitsBg", traitsBg);
      waypointUi.on("pointerenter", () => {
        if (hasTraits) {
          waypointUi.graphics.show("traitsBg", {
            offset: ex.vec(
              label.width / 2 + traits.width / 2 + 10,
              -6 * style.size - traits.height / waypoint.traits.length / 2
            ),
          });
          waypointUi.graphics.show("traits", {
            offset: ex.vec(
              label.width / 2 + traits.width / 2 + 10,
              -6 * style.size
            ),
          });
        }
      });
      waypointUi.graphics.show(label, {
        anchor: ex.vec(0, 0.5),
        offset: ex.vec(0, -6 * style.size),
      });

      waypointUi.on("pointerleave", () => {
        if (hasTraits) {
          waypointUi.graphics.hide("traits");
          waypointUi.graphics.hide("traitsBg");
        }
      });
      waypointUi.on("preupdate", (evt) => {
        waypointUi.scale = ex
          .vec(1, 1)
          .scale(1.0 / evt.engine.currentScene.camera.zoom);
      });

      // Pointer events
      waypointUi.pointer.useGraphicsBounds = true;
      waypointUi.events.wire(gfx.events);

      this.add(waypointUi);

      // If orbital, draw a line between waypoint and its parent
      if (parent) {
        const lineActor = new ex.Actor({ pos: gfx.pos });
        const line = new ex.Line({
          start: ex.vec(0, 0),
          end: ex.vec(
            parent.x * WaypointPositionScale - gfx.pos.x,
            parent.y * WaypointPositionScale - gfx.pos.y
          ),
          color: ex.Color.White.multiply(ex.Color.fromRGB(255, 255, 255, 0.85)),
          thickness: 2,
        });
        lineActor.graphics.use(line, { anchor: ex.vec(0, 0) });
        this.add(lineActor);
      }

      this.add(gfx);
    }
  }
}
