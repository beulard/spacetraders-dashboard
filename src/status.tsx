import { SyncOutlined } from "@ant-design/icons";
import { Button, Card, Spin, Statistic, Switch, Tooltip } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import { AgentDB, useAgent } from "./agent-db";
import { RefreshButton } from "./components/refresh-button";
import { SystemDB } from "./system-db";

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
      icon={<SyncOutlined />}
    >
      Systems
    </Button>
  );
};

const CopyTokenButton = (props: { label: string }) => {
  const [clicked, setClicked] = useState(false);

  function onClick() {
    navigator.clipboard.writeText(localStorage.getItem("access-token")!);
    setClicked(true);
  }

  return (
    <Tooltip
      title={!clicked ? "Copy token to clipboard" : "Copied ✔️"}
      mouseEnterDelay={0.3}
      onOpenChange={(val) => {
        if (val === false) setClicked(false);
      }}
    >
      <Button
        type="text"
        onClick={onClick}
        style={{ padding: 1, paddingLeft: 10, paddingRight: 10 }}
      >
        <big>{props.label}</big>
      </Button>
    </Tooltip>
  );
};

const Status = (props: { setIsDarkMode: Function }) => {
  const [agent] = useAgent();

  function onRefresh(onDone: Function) {
    const promise = AgentDB.update();

    toast.promise(promise, {
      loading: "Fetching agent",
      success: "Fetched agent",
      error: "Error (check console)",
    });

    promise.then((_) => {
      onDone();
    });
  }

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
      {agent ? (
        <>
          <div>
            <Statistic
              value={agent.credits}
              prefix="$"
              valueStyle={{ fontSize: "13pt" }}
            />
          </div>
          <CopyTokenButton
            label={`${agent.symbol} from ${agent.headquarters}`}
          />
          <RefreshButton onClick={onRefresh} />
        </>
      ) : (
        <Spin />
      )}
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
