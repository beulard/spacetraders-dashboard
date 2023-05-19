import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { System } from "spacetraders-sdk";
import api from "./api";
import { ContractList } from "./contract";
import FleetList from "./fleet";
import { Map } from "./map";
import { Status } from "./status";
import { getSystemSymbol, Systems } from "./system";
import { SystemInfo } from "./system-info";

function App() {
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);

  useEffect(() => {
    // Fetch systems
    Systems.fetchAll();

    // Set default selected system to HQ
    api.agent.getMyAgent().then((res) => {
      const hq = res.data.data.headquarters;
      Systems.get(getSystemSymbol(hq)).then((res) => {
        setSelectedSystem(res);
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
      <div style={{ minHeight: "300px" }}>Footer</div>
    </div>
  );
}

export default App;
