import * as ex from "excalibur";
import { useContext, useEffect, useRef } from "react";
import { MessageContext, MessageQueue } from "../message-queue";
import { SystemViewScene } from "./system-view";
import { WaypointViewScene } from "./waypoint-view";

/**
 * Holds all the data (engine, scenes, actors) needed to draw the map
 */
class MapData {
  public systemViewScene: SystemViewScene;
  public waypointViewScene: WaypointViewScene;

  public game: ex.Engine;

  constructor(gameOptions: ex.EngineOptions, msgQueue: MessageQueue) {
    this.game = new ex.Engine(gameOptions);
    this.systemViewScene = new SystemViewScene(this.game, msgQueue);
    this.waypointViewScene = new WaypointViewScene();
    this.game.addScene("systemview", this.systemViewScene);
    this.game.addScene("waypointview", this.waypointViewScene);

    this.game.start().then(() => {
      this.game.goToScene("systemview");
      this.systemViewScene.updateDrawnSystems();
      // this.systemViewScene.camera.zoomOverTime(0.4, 1000.0);
    });
  }
}

/**
 * Map component. Holds a ref to the MapData object.
 */
const MapView = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const data = useRef<MapData | null>(null);
  const { msgQueue } = useContext(MessageContext);

  // Initialise the game data
  useEffect(() => {
    if (data.current) {
      // If we get here it means we got a hot reload on dev server, usually
      data.current.game.currentScene.clear();
      data.current.game.stop();
      MessageQueue.Instance().clear();
    }

    data.current = new MapData(
      {
        width: 600,
        height: 400,
        canvasElement: canvasRef.current!,
        enableCanvasTransparency: true,
        backgroundColor: new ex.Color(0, 0, 0, 0.5),
      },
      msgQueue
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
