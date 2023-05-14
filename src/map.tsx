import Button, { ButtonGroup } from "@atlaskit/button";
import Toggle from "@atlaskit/toggle";
import paper from "paper";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { System, SystemWaypoint, SystemsApi } from "spacetraders-sdk";

const SystemList = (props: {
  systems: Array<System>;
  setSystems: Function;
}) => {
  const [fetchedCount, setFetchedCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const fetchLimit = 200;

  const api = new SystemsApi();

  // Fetch systems
  useEffect(() => {
    console.log(currentPage);
    const promise = api.getSystems(currentPage, 20);

    toast.promise(promise, {
      loading: "Fetching systems",
      success: "Fetched systems",
      error: "Error",
    });

    promise
      .then((res) => {
        console.log(currentPage);
        console.log(res);
        const meta = res.data.meta;
        let nFetched = res.data.data.length;
        props.setSystems(props.systems.concat(res.data.data));

        console.log(props.systems.length);

        // Stop updating fetched count if we got all systems already
        if (fetchedCount + nFetched >= fetchLimit /*meta.limit*/) {
          toast("fetched all ?");
          console.log(props.systems.length);
        } else {
          toast(`fetching ${nFetched} more...`);
          setFetchedCount(fetchedCount + nFetched);
          setCurrentPage(currentPage + 1);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [fetchedCount, currentPage]);

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

const Map = () => {
  const [show, setShow] = useState(true);
  const [systems, setSystems] = useState(Array<System>());
  const [drawnSystems, setDrawnSystems] = useState(0);
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [showSystemInfo, setShowSystemInfo] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLayerRef = useRef<paper.Layer | null>(null);
  const uiLayerRef = useRef<paper.Layer | null>(null);

  const init = () => {
    paper.setup(canvasRef.current!);
    paper.view.zoom = 0.2;
    // ctxRef.current = canvasRef.current!.getContext("2d");
    const gameLayer = new paper.Layer();
    gameLayer.applyMatrix = false;
    gameLayerRef.current = gameLayer;
    const uiLayer = new paper.Layer();
    uiLayerRef.current = uiLayer;
    gameLayer.activate();

    gameLayer.onMouseDown = (event: paper.MouseEvent) => {
      console.log(
        event.point,
        gameLayer.globalToLocal(event.point),
        paper.view.projectToView(event.point)
      );
    };

    // Drag map around with mouse
    paper.view.onMouseDrag = (event: paper.MouseEvent) => {
      gameLayer.translate(event.delta);
    };

    // Zoom with mousewheel (not handled by paperjs)
    canvasRef.current!.addEventListener("wheel", (event: WheelEvent) => {
      event.preventDefault();
      // console.log(Math.sign(event.deltaY));
      paper.view.zoom *= 1 - 0.15 * Math.sign(event.deltaY);
      console.log(paper.view.zoom);
      gameLayer.children.forEach((c) => {
        // c.scale(1.0 / (1.0 - 0.25 * Math.sign(event.deltaY)));
      });

      // Pan toward the mouse
      let direction = new paper.Point(event.offsetX, event.offsetY).subtract(
        paper.view.center
      );

      // console.log(paper.view.zoom);
      // console.log(mousePos, direction.divide(canvasRef.current!.width));
      gameLayer.translate(
        direction.multiply(
          (1 * 100 * Math.sign(event.deltaY)) /
            paper.view.zoom /
            Math.sqrt(
              canvasRef.current!.width ** 2 + canvasRef.current!.height ** 2
            )
        )
      );
    });
  };

  const systemTypeColor = {
    NEUTRON_STAR: "cyan",
    RED_STAR: "red",
    ORANGE_STAR: "orange",
    BLUE_STAR: "blue",
    YOUNG_STAR: "AliceBlue",
    WHITE_DWARF: "white",
    BLACK_HOLE: "black",
    HYPERGIANT: "purple",
    NEBULA: "Chartreuse",
    UNSTABLE: "hotpink",
  };

  function drawSystems(systems: Array<System>) {
    // console.log(systems);
    const layer = gameLayerRef.current!;
    layer.activate();

    let selectedSystemCircle: paper.Path.Circle | null = null;
    let selectedSystemTooltip: paper.TextItem | null = null;
    let selectedSystemIndicator = new paper.Path.RegularPolygon(
      new paper.Point(0, 0),
      3,
      20
    );
    selectedSystemIndicator.rotate(180);
    selectedSystemIndicator.fillColor = new paper.Color("#e9e9ff");
    selectedSystemIndicator.visible = false;
    selectedSystemIndicator.scale(0.66, 1);

    systems.forEach((system) => {
      // let position = layer.globalToLocal(
      //   paper.view.viewToProject(new paper.Point(system.x * 8, system.y * 8))
      // );
      let position = new paper.Point(system.x * 8, system.y * 8);
      let circle = new paper.Path.Circle(position.clone(), 10);
      circle.strokeColor = new paper.Color(systemTypeColor[system.type]);
      circle.strokeWidth = 5;
      circle.fillColor = new paper.Color(systemTypeColor[system.type]);
      circle.fillColor.alpha = 0.2;

      let tooltip = new paper.PointText(
        circle.position.add(new paper.Point(15, 20))
      );
      tooltip.fontSize = 24;
      tooltip.sendToBack();
      tooltip.content = system.symbol;
      tooltip.fillColor = new paper.Color("#ffffff");
      tooltip.fillColor!.alpha = 0.6;
      tooltip.fontFamily = "monospace";
      tooltip.addTo(circle);
      // tooltip.visible = false;

      circle.onMouseEnter = () => {
        // tooltip.visible = true;
        // circle.addChild(tooltip);
        circle.strokeWidth += 2;
        circle.fillColor!.alpha = 0.3;
        tooltip.content = system.symbol + "\n" + system.type;
        tooltip.fillColor!.alpha += 0.1;
      };
      circle.onMouseLeave = () => {
        // tooltip.visible = false;
        circle.strokeWidth -= 2;
        circle.fillColor!.alpha = 0.2;
        tooltip.content = system.symbol;
        tooltip.fillColor!.alpha -= 0.1;
      };
      circle.onMouseDown = () => {
        // circle.selected = true;
        setSelectedSystem(system);
        if (selectedSystemCircle) {
          selectedSystemCircle.strokeWidth -= 4;
        }
        if (selectedSystemTooltip) {
          selectedSystemTooltip.fillColor!.alpha -= 0.3;
        }

        selectedSystemCircle = circle;
        selectedSystemCircle.strokeWidth += 4;
        selectedSystemTooltip = tooltip;
        selectedSystemTooltip.fillColor!.alpha += 0.3;
        selectedSystemIndicator.visible = true;
        selectedSystemIndicator.position = selectedSystemCircle.position.add(
          new paper.Point(0, -45)
        );
      };
    });
  }

  useEffect(() => {
    if (show) {
      init();
      drawSystems(systems.slice(drawnSystems));
      setDrawnSystems(systems.length);
    }
  }, [show]);

  useEffect(() => {
    drawSystems(systems.slice(drawnSystems));
    setDrawnSystems(systems.length);
  }, [systems]);

  return (
    <div>
      {show && (
        <div id="mapContainer">
          <img
            id="mapBackground"
            src="/assets/starbg_gen_600x400.png"
            alt="bg"
          ></img>
          <canvas
            id="mapCanvas"
            ref={canvasRef}
            width={600}
            height={400}
          ></canvas>
        </div>
      )}
      <div style={{}}>
        <ButtonGroup>
          <Button
            appearance="primary"
            style={{ margin: "0.5em" }}
            onClick={() => {
              setDrawnSystems(0);
              setShow(!show);
            }}
          >
            Toggle
          </Button>
          <Button
            appearance="default"
            style={{ margin: "0.5em" }}
            onClick={() => {
              gameLayerRef.current!.matrix.reset();
              paper.view.zoom = 0.1;
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
      <SystemList systems={systems} setSystems={setSystems} />
      {showSystemInfo && <SystemInfo system={selectedSystem} />}
    </div>
  );
};

const WaypointInfo = (props: { waypoint: SystemWaypoint }) => {
  const waypoint = props.waypoint;

  return (
    <div>
      {waypoint.symbol} {waypoint.type}
    </div>
  );
};

const SystemInfo = (props: { system: System | null }) => {
  // const [system, setSystem] = useState(null);
  const system = props.system;

  if (!system) {
    return <></>;
  }

  return (
    <div
      style={{
        textAlign: "center",
        margin: "auto",
        maxWidth: "15em",
        marginTop: "1em",
      }}
    >
      <h5>
        {system.symbol} {system.type}{" "}
      </h5>
      {system.factions.length > 0 && (
        <>
          <h6>Factions</h6>
          {system.factions.map((faction) => (
            <p>{faction.symbol}</p>
          ))}
        </>
      )}
      {system.waypoints.length > 0 && (
        <>
          <h6>Waypoints</h6>
          <div style={{}}>
            {system.waypoints.map((waypoint) => (
              <WaypointInfo waypoint={waypoint} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export { Map };
