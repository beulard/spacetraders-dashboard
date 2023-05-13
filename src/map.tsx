import React, { useEffect, useRef } from "react";
import Button from "@atlaskit/button";
import toast from "react-hot-toast";
import { useState } from "react";
import { SystemsApi, System } from "spacetraders-sdk";
import paper from "paper";

const Map = () => {
  const [show, setShow] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLayerRef = useRef<paper.Layer | null>(null);
  const uiLayerRef = useRef<paper.Layer | null>(null);
  var systems = new Array<System>();
  const api = new SystemsApi();

  const init = () => {
    paper.setup(canvasRef.current!);
    // ctxRef.current = canvasRef.current!.getContext("2d");
    const gameLayer = new paper.Layer();
    gameLayerRef.current = gameLayer;
    const uiLayer = new paper.Layer();
    uiLayerRef.current = uiLayer;
    gameLayer.activate();

    console.log("INITIAL POS", gameLayer.position);

    let myPath = new paper.Path();
    paper.view.onMouseDown = () => {
      myPath.strokeColor = new paper.Color("white");
      myPath.strokeWidth = 3;
    };

    // Drag map around with mouse
    paper.view.onMouseDrag = (event: paper.MouseEvent) => {
      gameLayer.translate(event.delta);
    };

    // Zoom with mousewheel (not handled by paperjs)
    canvasRef.current!.addEventListener("wheel", (event: WheelEvent) => {
      // console.log(Math.sign(event.deltaY));
      paper.view.zoom *= 1 - 0.15 * Math.sign(event.deltaY);

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
    NEUTRON_STAR: "yellow",
    RED_STAR: "red",
    ORANGE_STAR: "orange",
    BLUE_STAR: "blue",
    YOUNG_STAR: "gray",
    WHITE_DWARF: "white",
    BLACK_HOLE: "black",
    HYPERGIANT: "purple",
    NEBULA: "purple",
    UNSTABLE: "pink",
  };

  function drawSystems(systems: Array<System>) {
    // console.log(systems);
    gameLayerRef.current?.activate();
    systems.forEach((system) => {
      let circle = new paper.Path.Circle(
        new paper.Point(system.x * 8, system.y * 8),
        5
      );
      circle.strokeColor = new paper.Color(systemTypeColor[system.type]);
      circle.strokeWidth = 1;
      circle.fillColor = new paper.Color(systemTypeColor[system.type]);
      circle.fillColor.alpha = 0.2;

      let tooltip = new paper.PointText(
        circle.position.add(new paper.Point(10, 10))
      );
      tooltip.sendToBack();
      tooltip.content = system.symbol;
      tooltip.fillColor = new paper.Color("#ffffff99");
      tooltip.fontFamily = "monospace";
      tooltip.addTo(circle);
      // tooltip.visible = false;

      circle.onMouseEnter = () => {
        // tooltip.visible = true;
        // circle.addChild(tooltip);
        circle.strokeWidth = 2;
        tooltip.content = system.symbol;
        tooltip.fillColor!.alpha = 1.0;
      };
      circle.onMouseLeave = () => {
        // tooltip.visible = false;
        circle.strokeWidth = 1;
        tooltip.fillColor!.alpha = 0.6;
      };
      circle.onMouseDown = () => {
        circle.selected = true;
      };
    });
  }

  const refresh = () => {
    const promise = api.getSystems(1, 20);
    toast.promise(promise, {
      loading: "Fetching systems",
      success: "Fetched systems",
      error: "Error",
    });

    promise
      .then((res) => {
        console.log(res);
        systems = res.data.data;
        drawSystems(systems);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (show) {
      refresh();
      init();
    }
  }, [show]);

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
      <div>
        <Button
          appearance="primary"
          style={{ margin: "1em" }}
          onClick={() => setShow(!show)}
        >
          Toggle
        </Button>
        <Button
          appearance="warning"
          style={{ margin: "1em" }}
          onClick={() => {
            gameLayerRef.current!.position = new paper.Point(0, 0);
            paper.view.zoom = 1.0;
          }}
        >
          Center
        </Button>
      </div>
    </div>
  );
};

export { Map };
