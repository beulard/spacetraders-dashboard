import { Ref, createContext, useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { System } from "spacetraders-sdk";
import api from "./api";
import { ContractList } from "./contract";
import FleetList from "./fleet";
import { MapView, SystemViewScene } from "./map";
import { Status } from "./status";
import { getSystemSymbol, Systems } from "./system";
import { SystemInfo } from "./system-info";
import { MessageContext, MessageQueue, MessageType } from "./message-queue";

function App() {
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const systemViewRef = useRef<SystemViewScene | null>(null);
  const msgQueue = new MessageQueue();

  useEffect(() => {
    // Fetch systems
    // TODO button to start/pause fetching
    // Systems.fetchAll();
    msgQueue.listen(MessageType.Hi, (payload: string) => {
      console.log(`hi ${payload}`);
    });
    msgQueue.listen(MessageType.Locate, (payload: { x: number; y: number }) => {
      console.log(`hi ${payload.x} ${payload.y}}`);
    });
    console.log(msgQueue);

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
          <MessageContext.Provider value={msgQueue}>
            <SystemInfo system={selectedSystem} systemViewRef={systemViewRef} />
            {/* // TODO trying to sneak a system view reference into SystemInfo... */}
            <MapView
              setSystemViewRef={(ref: SystemViewScene) => {
                systemViewRef.current = ref;
                console.log(systemViewRef.current);
              }}
              setSelectedSystem={setSelectedSystem}
            />
          </MessageContext.Provider>
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
