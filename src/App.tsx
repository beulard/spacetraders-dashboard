import { Card, ConfigProvider, theme } from "antd";
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

// const FetchSystemsToggle = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [fetchSystems, setFetchSystems] = useState(false);

//   function onToggleFetchSystems(value: boolean) {
//     setFetchSystems(value);
//     if (value) {
//       SystemDB.fetchStart();
//       SystemDB.fetchUntil(currentPage).then((page) => {
//         setCurrentPage(page);
//       });
//     } else {
//       SystemDB.fetchStop();
//     }
//   }
//   return (
//     <div>
//       <p>Fetch systems</p>
//       <Switch
//         defaultChecked={false}
//         id="fetch-systems-toggle"
//         onChange={() => onToggleFetchSystems(!fetchSystems)}
//       ></Switch>
//     </div>
//   );
// };

const { defaultAlgorithm, darkAlgorithm } = theme;

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    SystemDB.init().then((systems) => {
      // Set default selected system to HQ
      AgentDB.update().then((agent) => {
        const hq = systems.find(
          (s) => s.symbol === getSystemSymbol(agent!.headquarters)
        );
        SystemEvent.emit("select", hq);
        SystemEvent.emit("locate", hq);
      });
    });
  }, []);

  if (isDarkMode) {
    document.body.style.backgroundColor = "#111";
  } else {
    document.body.style.backgroundColor = "white";
  }

  return (
    <ConfigProvider
      theme={{ algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}
    >
      <div className="app">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              backgroundColor: isDarkMode ? "#1f1f1f" : "white",
              color: isDarkMode ? "#fff" : "#000",
              border: isDarkMode ? "#fff" : "#000",
            },
          }}
        />
        <div id="dashboard">
          <Status setIsDarkMode={setIsDarkMode} />
          <div
            style={{
              flexGrow: 1,
              flexBasis: "100%",
              minHeight: "0",
              overflowY: "auto",
              display: "flex",
            }}
          >
            <SystemInfo />
            <Card
              style={{
                marginLeft: "1%",
                width: "50%",
                minWidth: "600px",
                maxHeight: "100%",
              }}
              bodyStyle={{
                maxHeight: "100%",
                minWidth: "600px",
                overflow: "scroll",
                scrollbarWidth: "thin",
                display: "flex",
                flexDirection: "column",
                gap: "1em",
              }}
            >
              <MapView />
              <ShipList />
              <ContractList />
            </Card>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
