import { Space, Switch } from "antd";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import AgentDB from "./agent-db";
import { ContractList } from "./contract";
import { ShipList } from "./fleet";
import { Fleet, FleetContext, fetchShipsRecursive } from "./fleet-context";
import { MapView } from "./mapview/map";
import { Status } from "./status";
import { SystemDB, SystemEvent } from "./system-db";
import { SystemInfo } from "./system-info";
import { getSystemSymbol } from "./utils";

function App() {
  const [fetchSystems, setFetchSystems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fleet, setFleet] = useState<Fleet>([]);

  useEffect(() => {
    // Fetch systems
    SystemDB.fetchPages(1, currentPage);
    setCurrentPage((c) => c + 1);

    // Set default selected system to HQ
    AgentDB.update().then((agent) => {
      SystemDB.get(getSystemSymbol(agent!.headquarters)).then((res) => {
        SystemEvent.emit("select", res);
        SystemEvent.emit("locate", res);
      });
    });

    // Fetch ships
    fetchShipsRecursive().then((shipList) => {
      setFleet(shipList);
    });
  }, []);

  function onToggleFetchSystems(value: boolean) {
    setFetchSystems(value);
    if (value) {
      SystemDB.fetchStart();
      SystemDB.fetchUntil(currentPage).then((page) => {
        setCurrentPage(page);
      });
    } else {
      SystemDB.fetchStop();
    }
  }

  return (
    <div className="App">
      <Toaster position="top-right" />
      <div id="dashboard">
        <FleetContext.Provider value={[fleet, setFleet]}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Status />
            {/* <Space size="middle"> */}
            <p>Fetch systems</p>
            <Switch
              defaultChecked={false}
              id="fetch-systems-toggle"
              onChange={() => onToggleFetchSystems(!fetchSystems)}
            ></Switch>
            {/* </Space> */}
            <div
              style={{
                display: "inline-block",
                width: "100%",
                height: "650px",
              }}
            >
              <SystemInfo />
              <MapView />
              {/* TODO searchable list of systems <SystemList setSelectedSystem={setSelectedSystem} /> */}
            </div>
            <ShipList />
            <ContractList />
          </Space>
        </FleetContext.Provider>
      </div>
    </div>
  );
}

export default App;
