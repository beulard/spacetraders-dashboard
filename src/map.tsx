import Button, { ButtonGroup } from "@atlaskit/button";
import Toggle from "@atlaskit/toggle";
import * as ex from "excalibur";
import { useEffect, useRef, useState } from "react";
import { System, SystemsApi, SystemWaypoint } from "spacetraders-sdk";
import { Systems } from "./system";

const SystemList = (props: {
  systems: Array<System>;
  setSystems: Function;
}) => {
  const api = new SystemsApi();

  // Fetch systems
  // useEffect(() => {
  //   console.log(currentPage);
  //   const promise = api.getSystems(currentPage, 20);

  //   toast.promise(promise, {
  //     loading: "Fetching systems",
  //     success: "Fetched systems",
  //     error: "Error",
  //   });

  //   promise
  //     .then((res) => {
  //       console.log(currentPage);
  //       console.log(res);
  //       const meta = res.data.meta;
  //       let nFetched = res.data.data.length;
  //       props.setSystems(props.systems.concat(res.data.data));

  //       console.log(props.systems.length);

  //       // Stop updating fetched count if we got all systems already
  //       if (fetchedCount + nFetched >= fetchLimit /*meta.limit*/) {
  //         toast("fetched all ?");
  //         console.log(props.systems.length);
  //       } else {
  //         toast(`fetching ${nFetched} more...`);
  //         setFetchedCount(fetchedCount + nFetched);
  //         setCurrentPage(currentPage + 1);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, [fetchedCount, currentPage]);

  return (
    <div
      hidden
      style={{
        margin: "auto",
        width: "30em",
        textAlign: "left",
        fontFamily: "monospace",
      }}
    >
      <ul>
        {props.systems.map((system, idx) => (
          <li key={idx}>{system.symbol}</li>
        ))}
      </ul>
    </div>
  );
};

function clamp(x: number, xmin: number, xmax: number) {
  return Math.max(Math.min(x, xmax), xmin);
}

const Map = (props: { setSelectedSystem: Function }) => {
  const [show, setShow] = useState(true);
  // const [drawnSystems, setDrawnSystems] = useState(0);
  const [showSystemInfo, setShowSystemInfo] = useState(true);

  const maxZoomScale = 1;
  const minZoomScale = 0.05;
  // By how much to scale the system positions returned by the API into engine coordinates
  const systemPositionScale = 20;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<ex.Engine | null>(null);

  const init = () => {
    const game = new ex.Engine({
      width: 600,
      height: 400,
      canvasElement: canvasRef.current!,
      enableCanvasTransparency: true,
      backgroundColor: new ex.Color(0, 0, 0, 0.5),
    });
    gameRef.current = game;

    game.currentScene.camera.pos = ex.vec(0, 0);
    game.currentScene.camera.zoom = minZoomScale;
    game.start().then(() => {
      game.currentScene.camera.zoomOverTime(0.4, 1000.0);
    });

    const camera = game.currentScene.camera;
    camera.clearAllStrategies();

    game.input.pointers.on("wheel", (evt) => {
      // console.log(camera.zoom);
      camera.zoomOverTime(
        clamp(
          camera.zoom * 0.66 ** Math.sign(evt.deltaY),
          minZoomScale,
          maxZoomScale
        ),
        50,
        ex.EasingFunctions.EaseInOutCubic
      );
    });

    // TODO
    // When user stops dragging, look for Systems that might be on screen but are not shown currently

    // Drag camera with mouse
    const pointers = game.input.pointers;
    let dragStart = ex.vec(0, 0);
    let cameraDragStart = ex.vec(0, 0);
    let dragging = false;
    pointers.on("move", (evt) => {
      const nativeEvt = evt.nativeEvent as MouseEvent;
      // Mouse wheel only
      if (nativeEvt.buttons & 4 && pointers.isDragging(evt.pointerId)) {
        if (!dragging) {
          dragging = true;
          dragStart = evt.screenPos;
          cameraDragStart = camera.pos;
        }
        camera.pos = cameraDragStart.sub(
          evt.screenPos.sub(dragStart).scale(1.0 / camera.zoom)
        );
      } else {
        dragging = false;
      }
    });
  };

  const systemTypeColor = {
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

  function drawSystems(systems: Array<System>) {
    const game = gameRef.current!;
    const camera = game.currentScene.camera;
    let selectedSystemCircle: ex.Actor | null = null;
    let selectedSystemLabel: ex.Label | null = null;

    // TODO encapsulate in Actor.onInitialize
    systems.forEach((system) => {
      if (!drawnSystems.includes(system.symbol) && drawnSystems.length < 200) {
        drawnSystems.push(system.symbol);
        // console.log(`Drawing ${system.symbol}`);
        let systemGfx = new ex.Actor({
          pos: ex.vec(
            system.x * systemPositionScale,
            system.y * systemPositionScale
          ),
        });
        const circle = new ex.Actor({
          pos: ex.vec(0, 0),
          radius: 15,
          color: systemTypeColor[system.type],
        });
        circle.pointer.useGraphicsBounds = true;
        systemGfx.addChild(circle);

        // Instantiate a font per label (for some reason)
        const symbolFont = new ex.Font({
          family: "Roboto",
          size: 16,
        });

        const symbolFontBold = new ex.Font({
          family: "Roboto",
          size: 16,
          bold: true,
        });

        const label = new ex.Label({
          pos: ex.vec(10, 10),
          text: system.symbol,
          color: ex.Color.White.darken(0.1),
          font: symbolFont,
        });
        label.on("preupdate", () => {
          // TODO a way to hide system labels when too far?
          // TODO show only sector labels when zooming all the way out?
          label.scale = ex
            .vec(1, 1)
            .scale(1.0 / clamp(camera.zoom, 0.5, maxZoomScale));
        });
        label.pointer.useGraphicsBounds = true;

        systemGfx.events.wire(circle.events);
        systemGfx.events.wire(label.events);
        systemGfx.addChild(label);

        // Highlight selected system on click
        systemGfx.on("pointerdown", (evt) => {
          if (evt.button === "Left") {
            if (selectedSystemCircle) {
              // Return previous selection to normal
              selectedSystemCircle.color =
                selectedSystemCircle.color.darken(0.5);
              selectedSystemLabel!.font = symbolFont.clone();
              selectedSystemLabel!.color = ex.Color.White.darken(0.1);
            }
            props.setSelectedSystem(system);
            selectedSystemLabel = label;
            selectedSystemCircle = circle;

            circle.color = circle.color.lighten(0.5);
            label.font = symbolFontBold;
            label.color = ex.Color.White;
          }
        });

        game.add(systemGfx);
      }
    });
  }

  const drawnSystems: Array<string> = [];

  useEffect(() => {
    if (gameRef.current) {
      // If we get here it means we got a live reload on dev server, usually
      gameRef.current.currentScene.clear();
      gameRef.current.stop();
    }
    init();

    // Add systems added to local DB to scene graph
    Systems.addListener((change) => {
      drawSystems([change.doc as any as System]);
    });

    // Draw all from DB
    // TODO ordering is wrong / drawing faraway systems
    Systems.getAll().then((systems) => {
      console.log(
        "rows",
        systems.rows.map((row) => row.doc)
      );
      drawSystems(systems.rows.map((row) => row.doc as unknown as System));
    });
  }, []);

  // useEffect(() => {
  //   console.log(
  //     "effect systems",
  //     systems.slice(drawnSystems).length,
  //     systems.length
  //   );
  //   drawSystems(systems.slice(drawnSystems));
  //   setDrawnSystems(systems.length);
  // }, [systems]); TODO [Systems.GetAll().length] ?

  return (
    <span style={{ display: "inline-block" }}>
      {show && (
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
      )}
      <div style={{}}>
        <ButtonGroup>
          {/* TODO remove Center button replaced by locate and toggle */}
          <Button
            appearance="default"
            style={{ margin: "0.5em" }}
            onClick={() => {
              const camera = gameRef.current!.currentScene.camera;
              camera.move(ex.vec(0, 0), 1000);
              camera.zoomOverTime(0.4, 1000);
            }}
          >
            Center
          </Button>
          <div
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Toggle
              size="large"
              id="toggle-sys-info"
              defaultChecked
              onChange={() => {
                setShowSystemInfo(!showSystemInfo);
              }}
            />
            <label htmlFor="toggle-sys-info">System info</label>
          </div>
        </ButtonGroup>
      </div>
      {/* <SystemList systems={systems} setSystems={setSystems} /> */}
    </span>
  );
};

export const WaypointInfo = (props: { waypoint: SystemWaypoint }) => {
  const waypoint = props.waypoint;

  return (
    <div>
      {waypoint.symbol} {waypoint.type}
    </div>
  );
};

export const ShipSelector = () => {
  return <>Send ship (TODO)</>;
};

export { Map };
