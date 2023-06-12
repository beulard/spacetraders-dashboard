import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Statistic, Switch, Typography } from "antd";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AgentDB from "./agent-db";
import { RefreshButton } from "./components/refresh-button";
import { Agent } from "./spacetraders-sdk";
import { SystemDB } from "./system-db";
const { Title } = Typography;

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

const Status = (props: { setIsDarkMode: Function }) => {
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
    <Card
      size="small"
      bordered={true}
      // style={{ maxHeight: "10%" }}
      bodyStyle={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
      }}
    >
      <div>
        <Statistic
          value={credits}
          prefix="$"
          valueStyle={{ fontSize: "13pt" }}
        />
      </div>
      <div style={{ fontSize: 17 }}>
        {name} from {home}
      </div>
      <RefreshButton onClick={onRefresh} />
      <FetchSystemsButton />
      {/* Mode switch */}
      <Switch
        onChange={(val) => props.setIsDarkMode(val)}
        defaultChecked={true}
        checkedChildren="☽︎"
        unCheckedChildren="☾"
      />
    </Card>
  );
};

export { Status };
