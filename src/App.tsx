import loki from "lokijs";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { System } from "spacetraders-sdk";
import api from "./api";
import { ContractList } from "./contract";
import FleetList from "./fleet";
import { Map } from "./map";
import { Status } from "./status";
import { getSystemSymbol } from "./system";
import { SystemInfo } from "./system-info";

function App() {
  // Systems.FetchCache().then((systems) => {
  //   console.log("aaa", systems);
  // });

  // const systems = Systems.fetchAllFromAPI(800);
  // console.log(systems); //

  const db = new loki("spacetrader.db", {
    verbose: true,
    // env: "BROWSER",
    autosave: true,
    autosaveInterval: 10000,
  });

  const systems = db.addCollection("systems");
  systems.insert({
    symbol: "X1-JK50",
    sectorSymbol: "X1",
    type: "YOUNG_STAR",
    x: 135,
    y: -203,
    waypoints: [
      {
        symbol: "X1-JK50-73370F",
        type: "PLANET",
        x: -10,
        y: -20,
      },
      {
        symbol: "X1-JK50-64711B",
        type: "PLANET",
        x: -26,
        y: -40,
      },
      {
        symbol: "X1-JK50-02332F",
        type: "MOON",
        x: -26,
        y: -40,
      },
      {
        symbol: "X1-JK50-99173Z",
        type: "PLANET",
        x: 18,
        y: 59,
      },
      {
        symbol: "X1-JK50-85014F",
        type: "MOON",
        x: 18,
        y: 59,
      },
      {
        symbol: "X1-JK50-33345E",
        type: "ASTEROID_FIELD",
        x: 5,
        y: 90,
      },
    ],
    factions: [
      {
        symbol: "COSMIC",
      },
    ],
  });

  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);

  useEffect(() => {
    // Set default selected system to HQ
    api.agent.getMyAgent().then((res) => {
      const hq = res.data.data.headquarters;
      api.system.getSystem(getSystemSymbol(hq)).then((res) => {
        console.log(res.data.data);
        setSelectedSystem(res.data.data);
      });
    });
  }, []);

  return (
    <div className="App">
      <Toaster position="top-right" />
      <div id="dashboard">
        <Status />
        <div style={{ display: "inline-block", width: "100%" }}>
          <SystemInfo system={selectedSystem} />
          <Map setSelectedSystem={setSelectedSystem} />
          {/* TODO searchable list of systems <SystemList setSelectedSystem={setSelectedSystem} /> */}
        </div>
        <ContractList setSelectedSystem={setSelectedSystem} />
        <FleetList />
      </div>
    </div>
  );
}

export default App;
