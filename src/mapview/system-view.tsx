import * as ex from "excalibur";
import { System } from "spacetraders-sdk";
import {
  LocateSystemPayload,
  MessageQueue,
  MessageType,
} from "../message-queue";
import { Systems } from "../system";
import { SystemTypeColor } from "./gfx-common";

export class SystemGfx extends ex.Actor {
  // Instantiate a font per label (for some reason)
  private labelFont;
  private labelFontBold;
  private label;
  private circle;

  public constructor(pos: ex.Vector, symbol: string, type: string) {
    super({ pos: pos });
    this.circle = new ex.Circle({
      radius: 15,
      color: SystemTypeColor[type].darken(0.3),
      strokeColor: SystemTypeColor[type].lighten(0.6),
      lineWidth: 3,
    });

    this.labelFont = new ex.Font({
      family: "Roboto",
      size: 16,
    });

    this.labelFontBold = new ex.Font({
      family: "Roboto",
      size: 16,
      bold: true,
    });

    this.label = new ex.Text({
      text: symbol,
      color: ex.Color.White.darken(0.1),
      font: this.labelFont,
    });

    this.graphics.add("circle", this.circle);
    this.graphics.show("circle");
    this.graphics.add("label", this.label);
    this.graphics.show("label", { offset: ex.vec(50, -10) });
    this.graphics.recalculateBounds();

    this.on("pointerenter", () => {
      this.circle.color = this.circle.color.lighten(0.3);
      this.circle.radius += 5;
      // this.labelFont.scale = ex.vec(2, 2);
      // this.labelFontBold.scale = ex.vec(2, 2);
    });
    this.on("pointerleave", () => {
      this.circle.color = this.circle.color.darken(0.3);
      this.circle.radius = 15;
      // this.labelFont.scale = ex.vec(1, 1);
      // this.labelFontBold.scale = ex.vec(1, 1);
    });

    this.pointer.useGraphicsBounds = true;
  }

  /**
   * Highlight when selected
   */
  public highlight() {
    this.circle.color = this.circle.color.lighten(0.5);
    this.label.font = this.labelFontBold;
    this.label.color = ex.Color.White;
  }

  /**
   * Return to normal style from highlighted style
   */
  public unhighlight() {
    this.circle.color = this.circle.color.darken(0.5);
    this.label.font = this.labelFont;
    this.label.color = ex.Color.White.darken(0.1);
  }
}

export class SystemViewScene extends ex.Scene {
  // Min/max zoom scale
  private maxZoomScale = 1;
  private minZoomScale = 0.025;
  // By how much to scale the system positions returned by the API into engine coordinates
  private systemPositionScale = 8;
  private systemsGfx: Map<string, SystemGfx>;
  private selectedSystemGfx: SystemGfx | null = null;
  private msgQueue: MessageQueue | null = null;
  // Keep track of the zoom scale before transition to waypoint view
  private lastZoomScale = 0.025;

  constructor(msgQueue: MessageQueue) {
    super();

    this.msgQueue = msgQueue;

    this.systemsGfx = new Map<string, SystemGfx>();

    this.camera.pos = ex.vec(0, 0);
    this.camera.zoom = this.minZoomScale * 2;

    // Handle system locate messages
    msgQueue.listen(
      MessageType.LocateSystem,
      (payload: LocateSystemPayload) => {
        this.camera
          .move(
            ex.vec(
              payload.x * this.systemPositionScale,
              payload.y * this.systemPositionScale
            ),
            1000
          )
          .then(() => this.updateDrawnSystems());
      }
    );
  }

  public onActivate() {
    this.camera.zoomOverTime(
      this.lastZoomScale,
      300,
      ex.EasingFunctions.EaseOutCubic
    );

    // Set up user input
    const pointers = this.engine.input.pointers;
    // Mouse scroll zoom
    pointers.on("wheel", (evt) => {
      this.camera
        .zoomOverTime(
          ex.clamp(
            this.camera.zoom * 0.66 ** Math.sign(evt.deltaY),
            this.minZoomScale,
            this.maxZoomScale
          ),
          50,
          ex.EasingFunctions.EaseInOutCubic
        )
        .then(() => {
          this.updateDrawnSystems();
        });
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
    pointers.on("up", () => {
      if (dragging) {
        // Stopped dragging this frame
        this.updateDrawnSystems();
        console.log("ac", this.actors.length);
      }
    });
  }

  public onDeactivate() {
    this.engine.input.pointers.off("wheel");
    this.engine.input.pointers.off("move");
  }

  public updateDrawnSystems() {
    // Stop drawing systems that are out of viewport
    const vp = this.camera.viewport;
    // Viewport expanded by (width, height) in each direction
    const expandedViewport = new ex.BoundingBox(
      vp.left - vp.width,
      vp.top - vp.height,
      vp.right + vp.width,
      vp.bottom + vp.height
    );

    Systems.find({
      selector: {
        x: {
          $gt: expandedViewport.left / this.systemPositionScale,
          $lt: expandedViewport.right / this.systemPositionScale,
        },
        y: {
          $gt: expandedViewport.top / this.systemPositionScale,
          $lt: expandedViewport.bottom / this.systemPositionScale,
        },
      },
    }).then((res) => {
      this.drawSystems(res.docs.map((sys) => sys as unknown as System));
    });
  }

  public setSelectedSystem(system: SystemGfx) {
    if (this.selectedSystemGfx) {
      // Return previous selection to normal
      this.selectedSystemGfx.unhighlight();
    }
    this.selectedSystemGfx = system;
    this.selectedSystemGfx.highlight();
  }

  public drawSystems(systems: Array<System>) {
    for (const system of systems) {
      const gfx = this.systemsGfx.get(system.symbol);

      if (gfx) {
        // Gfx already exists in map -> just draw it if not already on screen
        if (!this.contains(gfx)) {
          this.add(gfx);
        }
      } else {
        // Initialise new gfx and store it in systemsGfx map
        const gfx = new SystemGfx(
          ex.vec(
            system.x * this.systemPositionScale,
            system.y * this.systemPositionScale
          ),
          system.symbol,
          system.type
        );

        gfx.on("pointerdown", (evt) => {
          if (evt.button === "Left") {
            if (this.selectedSystemGfx === gfx) {
              this.lastZoomScale = this.camera.zoom;
              this.camera.move(
                this.selectedSystemGfx.pos,
                400,
                ex.EasingFunctions.EaseOutCubic
              );
              this.camera
                .zoomOverTime(
                  Math.max(0.2, this.camera.zoom),
                  300,
                  ex.EasingFunctions.EaseInCubic
                )
                .then(() =>
                  this.engine.goToScene("waypointview", { system: system })
                );
            }

            this.setSelectedSystem(gfx);

            // Send a selected system message
            this.msgQueue?.post(MessageType.SelectSystem, {
              system: system,
            });
          }
        });

        // TODO show only sector labels when zooming all the way out?
        gfx.on("preupdate", () => {
          gfx.scale = ex
            .vec(1, 1)
            .scale(1.0 / ex.clamp(this.camera.zoom, 0.2, this.maxZoomScale));
        });

        this.systemsGfx.set(system.symbol, gfx);
        this.add(gfx);
      }
    }
  }
}
