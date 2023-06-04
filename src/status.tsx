import { useEffect, useState } from "react";
import { Agent } from "spacetraders-sdk";
import AgentDB from "./agent-db";
import { RefreshButton } from "./components/refresh-button";
import { Statistic } from "antd";

const Status = () => {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(-1);
  const [home, setHome] = useState("");

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
          // title="Total"
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
      <RefreshButton
        onClick={(onDone) => {
          AgentDB.update().then(() => onDone());
        }}
      />
    </div>
  );
};

export { Status };
