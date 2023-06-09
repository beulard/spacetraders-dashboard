import { useEffect, useState } from "react";
import { Agent } from "./spacetraders-sdk";
import AgentDB from "./agent-db";
import { RefreshButton } from "./components/refresh-button";
import { Button, Statistic } from "antd";
import toast from "react-hot-toast";
import { SystemDB } from "./system-db";
import { ReloadOutlined } from "@ant-design/icons";

const FetchSystemsButton = () => {
  const [loading, setLoading] = useState(false);

  function onFetch() {
    setLoading(true);
    SystemDB.fetchAll().then((_) => {
      setLoading(false);
    });
  }

  return (
    <Button
      type="default"
      loading={loading}
      onClick={onFetch}
      icon={<ReloadOutlined />}
    >
      Systems
    </Button>
  );
};

const Status = () => {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(-1);
  const [home, setHome] = useState("");

  function onRefresh(onDone: Function) {
    const promise = AgentDB.update();

    toast.promise(promise, {
      loading: "Fetching agent",
      success: "Fetched agent",
      error: "Error (check console)",
    });

    promise.then((agent) => {
      setName(agent!.symbol);
      setCredits(agent!.credits);
      setHome(agent!.headquarters);
      onDone();
    });
  }

  useEffect(() => {
    const onAgentUpdate = (agent: Agent) => {
      setName(agent.symbol);
      setCredits(agent.credits);
      setHome(agent.headquarters);
    };

    AgentDB.on("update", onAgentUpdate);

    return () => {
      AgentDB.off("update", onAgentUpdate);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        maxWidth: "50em",
        height: "2.4em",
        padding: "1em",
        margin: "auto",
      }}
    >
      <div>
        <Statistic
          value={credits}
          prefix="$"
          valueStyle={{ fontSize: "13pt" }}
        />
      </div>
      <div>
        <h4>
          {name} from {home}
        </h4>
      </div>
      <RefreshButton onClick={onRefresh} />
      <FetchSystemsButton />
    </div>
  );
};

export { Status };
