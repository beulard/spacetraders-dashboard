import { Button, Input, Space } from "antd";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";
import api from "./api";

const Login = () => {
  const [token, setToken] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentFaction, setAgentFaction] = useState("");
  const navigate = useNavigate();
  //   const [gameInfo, setGameInfo] = useState("");

  return (
    <div style={{ margin: "auto", textAlign: "center" }}>
      <Toaster position="top-right" />
      {/* <Space style={{ padding: "1em" }}>
        <h3>SpaceTraders</h3>
      </Space>
      <Divider /> */}
      <h2 style={{ paddingBottom: "1em" }}>Login</h2>
      <Space direction="vertical">
        <p style={{ color: "darkred" }}>No or invalid token</p>
        <p>Please enter valid token or create a new agent</p>
        <div
          style={{
            display: "flex",
            margin: "auto",
            textAlign: "left",
            justifyContent: "center",
          }}
        >
          <Space
            direction="vertical"
            size="small"
            style={{ padding: "0 1em 1em 1em" }}
          >
            <label htmlFor="token">
              <h4>Enter token</h4>
            </label>
            <Input
              id="token"
              type="text"
              placeholder="Token"
              value={token}
              onChange={(evt) => setToken(evt.target.value)}
            ></Input>
            <Button
              onClick={() => {
                api.updateToken(token);
                navigate("/");
              }}
            >
              Log in
            </Button>
          </Space>
          <Space
            direction="vertical"
            size="small"
            style={{ padding: "0 1em 1em 1em" }}
          >
            <label htmlFor="agent-name">
              <h4>New agent</h4>
            </label>
            {/* TODO wrap in form */}
            {/* <form> */}
            <Input
              id="agent-name"
              type="text"
              placeholder="N4M3"
              minLength={3}
              value={agentName}
              onChange={(evt) => setAgentName(evt.target.value)}
            ></Input>
            <Input
              id="agent-faction"
              type="text"
              placeholder="FACTION"
              defaultValue="COSMIC"
              value={agentFaction}
              onChange={(evt) => setAgentFaction(evt.target.value)}
            ></Input>
            <Button
              onClick={() => {
                api.default
                  .register({
                    symbol: agentName,
                    faction: agentFaction,
                  })
                  .then((res) => {
                    api.updateToken(res.data.data.token);
                    toast.success(`${res.data.data.agent.symbol} created`);
                    console.log(res);
                    navigate("/");
                  })
                  .catch((err) => {
                    console.log(err.response);
                    toast.error(
                      err.response.data.error.message + " Check console."
                    );
                  });
              }}
            >
              Create
            </Button>
            {/* </form> */}
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default Login;
