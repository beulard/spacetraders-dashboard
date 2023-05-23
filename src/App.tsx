import { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import api from "./api";
import { ContractList } from "./contract";
import { MapView } from "./mapview/map";
import { MessageContext, MessageType } from "./message-queue";
import { Status } from "./status";
import { Systems, getSystemSymbol } from "./system";
import { SystemInfo } from "./system-info";
import { ShipList } from "./fleet";
import { Space, Switch } from "antd";

function App() {
  const [fetchSystems, setFetchSystems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { msgQueue } = useContext(MessageContext);

  useEffect(() => {
    // Fetch systems
    Systems.fetchPages(1, currentPage);
    setCurrentPage(currentPage + 1);

    // Set default selected system to HQ
    api.agent.getMyAgent().then((res) => {
      const hq = res.data.data.headquarters;
      Systems.get(getSystemSymbol(hq)).then((res) => {
        msgQueue.post(MessageType.SelectSystem, { system: res });
        msgQueue.post(MessageType.LocateSystem, {
          symbol: res.symbol,
          x: res.x,
          y: res.y,
        });
      });
    });
  }, []);

  function onToggleFetchSystems(value: boolean) {
    setFetchSystems(value);
    if (value) {
      Systems.fetchStart();
      Systems.fetchUntil(currentPage).then((page) => {
        setCurrentPage(page);
      });
    } else {
      Systems.fetchStop();
    }
  }

  return (
    <div className="App">
      <Toaster position="top-right" />
      <div id="dashboard">
        <Status />
        <Space size="middle">
          <p>Fetch systems</p>
          <Switch
            defaultChecked={false}
            id="fetch-systems-toggle"
            onChange={() => onToggleFetchSystems(!fetchSystems)}
          ></Switch>
        </Space>
        <div
          style={{ display: "inline-block", width: "100%", height: "450px" }}
        >
          <SystemInfo />
          <MapView />
          {/* TODO searchable list of systems <SystemList setSelectedSystem={setSelectedSystem} /> */}
        </div>
        <ShipList />
        <ContractList />
      </div>
    </div>
  );
}

export default App;
