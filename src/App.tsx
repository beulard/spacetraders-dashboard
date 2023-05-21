import { ChangeEvent, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { System } from "spacetraders-sdk";
import api from "./api";
import { ContractList } from "./contract";
import { MapView } from "./map";
import { Status } from "./status";
import { Systems, getSystemSymbol } from "./system";
import { SystemInfo } from "./system-info";
import Toggle from "@atlaskit/toggle";

function App() {
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);

  useEffect(() => {
    // Fetch systems
    // TODO button to start/pause fetching
    // Systems.fetchAll();
    Systems.fetchPages(1, 4);

    // Set default selected system to HQ
    api.agent.getMyAgent().then((res) => {
      const hq = res.data.data.headquarters;
      Systems.get(getSystemSymbol(hq)).then((res) => {
        setSelectedSystem(res);
      });
    });
  }, []);

  function onToggleFetchSystems(evt: ChangeEvent) {
    // TODO
    console.log(evt);
  }

  return (
    <div className="App">
      <Toaster position="top-right" />
      <div id="dashboard">
        <Status />
        <div style={{ display: "inline-block" }}>
          <label htmlFor="fetch-systems-toggle">Fetch systems</label>
          <Toggle
            defaultChecked={false}
            id="fetch-systems-toggle"
            onChange={(evt) => onToggleFetchSystems(evt)}
          ></Toggle>
        </div>
        <div style={{ display: "inline-block", width: "100%" }}>
          <SystemInfo system={selectedSystem} />
          <MapView setSelectedSystem={setSelectedSystem} />
          {/* TODO searchable list of systems <SystemList setSelectedSystem={setSelectedSystem} /> */}
        </div>
        <ContractList setSelectedSystem={setSelectedSystem} />
        {/* <FleetList /> */}
      </div>
      <div style={{ minHeight: "300px" }}></div>
    </div>
  );
}

export default App;
