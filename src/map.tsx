import * as ex from "excalibur";
import { useContext, useEffect, useRef } from "react";
import { System } from "spacetraders-sdk";
import { Systems } from "./system";
import { MessageContext, MessageQueue } from "./message-queue";

function clamp(x: number, xmin: number, xmax: number) {
  return Math.max(Math.min(x, xmax), xmin);
}

type SystemType = {
  [id: string]: ex.Color;
};
const systemTypeColor: { [id: string]: ex.Color } = {
  NEUTRON_STAR: ex.Color.Cyan,
  RED_STAR: ex.Color.Red,
  ORANGE_STAR: ex.Color.Orange,
  BLUE_STAR: ex.Color.Blue,
  YOUNG_STAR: ex.Color.ExcaliburBlue,
  WHITE_DWARF: ex.Color.White,
  BLACK_HOLE: ex.Color.Black,
  HYPERGIANT: ex.Color.Violet,
  NEBULA: ex.Color.Green,
  UNSTABLE: ex.Color.Rose,
};

class SystemGfx extends ex.Actor {
  // Instantiate a font per label (for some reason)
  private labelFont;
  private labelFontBold;
  private label;
  private circle;

  public constructor(pos: ex.Vector, symbol: string, type: string) {
    super({ pos: pos });
    this.circle = new ex.Circle({
      radius: 15,
      color: systemTypeColor[type],
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

    this.label = new ex.Label({
      pos: ex.vec(15, 10),
      text: symbol,
      color: ex.Color.White.darken(0.1),
      font: this.labelFont,
    });
    this.addChild(this.label);

    this.graphics.use(this.circle);
    this.label.pointer.useGraphicsBounds = true;
    this.events.wire(this.label.events);
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

class SystemViewScene extends ex.Scene {
  // Min/max zoom scale
  private maxZoomScale = 1;
  private minZoomScale = 0.05;
  // By how much to scale the system positions returned by the API into engine coordinates
  private systemPositionScale = 40;
  private systemsGfx: Map<string, SystemGfx>;
  private selectedSystemGfx: SystemGfx | null = null;

  constructor(input: ex.Input.EngineInput, msgQueue: MessageQueue) {
    super();

    this.systemsGfx = new Map<string, SystemGfx>();

    this.camera.pos = ex.vec(0, 0);
    this.camera.zoom = this.minZoomScale;

    // Set up user input
    const pointers = input.pointers;
    // Mouse scroll zoom
    pointers.on("wheel", (evt) => {
      this.camera
        .zoomOverTime(
          clamp(
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
        // console.log("ac", this.actors.length);
      }
    });
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
      // console.log(res.docs.length);
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
            this.setSelectedSystem(gfx);
            this.selectedSystemListeners.forEach((listener) =>
              listener(system)
            );
          }
        });

        // TODO show only sector labels when zooming all the way out?
        gfx.on("preupdate", () => {
          gfx.scale = ex
            .vec(1, 1)
            .scale(1.0 / clamp(this.camera.zoom, 0.2, this.maxZoomScale));
        });

        this.systemsGfx.set(system.symbol, gfx);
        this.add(gfx);
      }
    }
  }

  private selectedSystemListeners: Function[] = [];
  public addSelectedSystemListener(callback: Function) {
    this.selectedSystemListeners.push(callback);
  }
}

/**
 * Holds all the data (engine, scenes, actors) needed to draw the map
 */
class MapData {
  public systemViewScene: SystemViewScene;

  public game: ex.Engine;

  constructor(gameOptions: ex.EngineOptions, msgQueue: MessageQueue) {
    this.game = new ex.Engine(gameOptions);
    this.systemViewScene = new SystemViewScene(this.game.input, msgQueue);
    this.game.addScene("systemview", this.systemViewScene);

    this.game.start().then(() => {
      this.game.goToScene("systemview");
      this.systemViewScene.updateDrawnSystems();
      this.systemViewScene.camera.zoomOverTime(0.4, 1000.0);
    });
  }
}

/**
 * Map component. Holds a ref to the MapData object.
 */
const MapView = (props: {
  setSystemViewRef: Function;
  setSelectedSystem: Function;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const data = useRef<MapData | null>(null);
  const msgQueue = useContext(MessageContext);

  // Initialise the game data
  useEffect(() => {
    if (data.current) {
      // If we get here it means we got a hot reload on dev server, usually
      data.current.game.currentScene.clear();
      data.current.game.stop();
    }

    data.current = new MapData(
      {
        width: 600,
        height: 400,
        canvasElement: canvasRef.current!,
        enableCanvasTransparency: true,
        backgroundColor: new ex.Color(0, 0, 0, 0.5),
      },
      msgQueue!
    );

    props.setSystemViewRef(data.current.systemViewScene);

    data.current.systemViewScene.addSelectedSystemListener(
      props.setSelectedSystem
    );
  }, []);

  return (
    <span style={{ display: "inline-block" }}>
      <span id="mapContainer">
        <img
          id="mapBackground"
          src="/assets/starbg_gen2_600x400.png"
          alt="bg"
        ></img>
        <canvas
          id="mapCanvas"
          ref={canvasRef}
          width={600}
          height={400}
        ></canvas>
      </span>
    </span>
  );
};

export { MapView, SystemViewScene };
