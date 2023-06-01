import { Space, Switch } from "antd";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import AgentDB from "./agent-db";
import { ContractList } from "./contract";
import { ShipList } from "./fleet";
import { MapView } from "./mapview/map";
import { Status } from "./status";
import { SystemDB, SystemEvent } from "./system-db";
import { SystemInfo } from "./system-info";
import { getSystemSymbol } from "./utils";

const FetchSystemsToggle = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchSystems, setFetchSystems] = useState(false);

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
    <div>
      <p>Fetch systems</p>
      <Switch
        defaultChecked={false}
        id="fetch-systems-toggle"
        onChange={() => onToggleFetchSystems(!fetchSystems)}
      ></Switch>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Fetch systems
    // SystemDB.fetchPages(1, currentPage);
    // setCurrentPage((c) => c + 1);

    // Set default selected system to HQ
    AgentDB.update().then((agent) => {
      SystemDB.get(getSystemSymbol(agent!.headquarters)).then((res) => {
        SystemEvent.emit("select", res);
        SystemEvent.emit("locate", res);
      });
    });
  }, []);

  return (
    <div className="App">
      <Toaster position="top-right" />
      <div id="dashboard">
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Status />
          {/* <Space size="middle"> */}
          <FetchSystemsToggle />
          {/* </Space> */}
          <div
            style={{
              display: "flex",
              width: "100%",
              // height: "650px",
            }}
          >
            <div
              style={{
                textAlign: "left",
                flex: 1,
                paddingRight: "2%",
              }}
            >
              <SystemInfo />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <MapView />
              <ShipList />
              <ContractList />
            </div>
            {/* TODO searchable list of systems <SystemList setSelectedSystem={setSelectedSystem} /> */}
          </div>
        </Space>
      </div>
    </div>
  );
}

export default App;
