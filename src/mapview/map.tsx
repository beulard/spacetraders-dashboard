import * as ex from "excalibur";
import { useContext, useEffect, useRef, useState } from "react";
import { MessageContext, MessageQueue } from "../message-queue";
import { SystemViewScene } from "./system-view";
import { WaypointViewScene } from "./waypoint-view";
import { Button } from "antd";
import { DevTool } from "@excaliburjs/dev-tools";

/**
 * Holds all the data (engine, scenes, actors) needed to draw the map
 */
class MapData {
  public systemViewScene: SystemViewScene;
  public waypointViewScene: WaypointViewScene;

  public game: ex.Engine;

  constructor(gameOptions: ex.EngineOptions, msgQueue: MessageQueue) {
    this.game = new ex.Engine(gameOptions);
    // const devtool = new DevTool(this.game);
    this.systemViewScene = new SystemViewScene(msgQueue);
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
    data.current = new MapData(
      {
        width: 600,
        height: 400,
        canvasElement: canvasRef.current!,
        enableCanvasTransparency: true,
        backgroundColor: new ex.Color(0, 0, 0, 0.5),
        // Disable canvas2d fallback:
        // configurePerformanceCanvas2DFallback: {
        //   allow: false
        // }
      },
      msgQueue
    );

    // Clean up on unmount
    return () => {
      if (data.current) {
        data.current.game.currentScene.clear();
        data.current.game.stop();
      }
      MessageQueue.Instance().clear();
    };
  }, []);

  return (
    <span
      style={{
        display: "inline-block",
        paddingTop: "40px",
        paddingBottom: "20px",
        maxWidth: "60%",
      }}
    >
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
