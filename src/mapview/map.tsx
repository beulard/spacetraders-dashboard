import * as ex from "excalibur";
import { useEffect, useRef } from "react";
import mapBackground from "../resources/starbg_gen3_600x400.png";
import { SystemViewScene } from "./system-view";
import { WaypointViewScene } from "./waypoint-view";

/**
 * Holds all the data (engine, scenes, actors) needed to draw the map
 */
class MapData {
  public systemViewScene: SystemViewScene;
  public waypointViewScene: WaypointViewScene;

  public game: ex.Engine;

  constructor(gameOptions: ex.EngineOptions) {
    this.game = new ex.Engine(gameOptions);
    // const devtool = new DevTool(this.game);
    this.systemViewScene = new SystemViewScene();
    this.waypointViewScene = new WaypointViewScene();
    this.game.addScene("systemview", this.systemViewScene);
    this.game.addScene("waypointview", this.waypointViewScene);

    this.game.start().then(async () => {
      // Debug waypoint view
      // this.game.goToScene("waypointview", {
      //   system: await SystemDB.get("X1-FJ40"),
      //   ships: FleetDB.getMyShips(),
      //   waypoints: await WaypointDB.getSystemWaypoints("X1-FJ40"),
      // });
      // Normal mode
      this.game.goToScene("systemview");
    });
  }
}

/**
 * Map component. Holds a ref to the MapData object.
 */
const MapView = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const data = useRef<MapData | null>(null);

  // Initialise the game data
  useEffect(() => {
    data.current = new MapData({
      width: 600,
      height: 400,
      canvasElement: canvasRef.current!,
      enableCanvasTransparency: true,
      backgroundColor: new ex.Color(0, 0, 0, 0.5),
      pointerScope: ex.Input.PointerScope.Canvas,
      // Disable canvas2d fallback:
      // configurePerformanceCanvas2DFallback: {
      //   allow: false
      // }
    });

    // Clean up on unmount
    return () => {
      if (data.current) {
        data.current.game.currentScene.clear();
        data.current.game.stop();
      }
    };
  }, []);

  return (
    <div
      style={{
        display: "inline-block",
        paddingTop: "40px",
        paddingBottom: "20px",
        maxWidth: "60%",
      }}
    >
      <div id="map-container">
        <img id="map-background" src={mapBackground} alt="bg"></img>
        <canvas
          id="map-canvas"
          ref={canvasRef}
          width={600}
          height={400}
        ></canvas>
        <div id="map-ui"></div>
      </div>
    </div>
  );
};

export { MapView, SystemViewScene };
