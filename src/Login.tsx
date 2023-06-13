import {
  App,
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  Space,
  Switch,
  theme,
} from "antd";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";
import api from "./api";
import Title from "antd/es/typography/Title";

const { defaultAlgorithm, darkAlgorithm } = theme;

const Login = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  function onRegister(values: { symbol: string; faction: string }) {
    api.default
      .register({
        symbol: values.symbol,
        faction: values.faction,
      })
      .then((res) => {
        api.updateToken(res.data.data.token);
        toast.success(`${res.data.data.agent.symbol} created`);
        console.log(res);
        navigate("/");
      })
      .catch((err) => {
        console.log(err.response);
      });
  }

  function onLogin(values: { token: string }) {
    api.updateToken(values.token);
    navigate("/");
  }

  if (isDarkMode) {
    document.body.style.backgroundColor = "#111";
  } else {
    document.body.style.backgroundColor = "white";
  }

  return (
    <ConfigProvider
      theme={{ algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}
    >
      <App>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <Toaster position="top-right" />
          <Title level={2}>Login</Title>
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
              <Card>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ padding: "0 1em 1em 1em" }}
                >
                  <label htmlFor="token">
                    <Title level={5}>Enter token</Title>
                  </label>
                  <Form layout="vertical" onFinish={onLogin}>
                    <Form.Item
                      label="Token"
                      name="token"
                      id="token"
                      rules={[
                        {
                          required: true,
                          message: "Required",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Login
                      </Button>
                    </Form.Item>
                  </Form>
                </Space>
              </Card>
              <Card>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ padding: "0 1em 1em 1em" }}
                >
                  <label htmlFor="symbol">
                    <Title level={5}>New agent</Title>
                  </label>
                  <Form layout="vertical" onFinish={onRegister}>
                    <Form.Item
                      label="Symbol"
                      name="symbol"
                      id="agent-name"
                      rules={[
                        {
                          required: true,
                          message: "Min 3 characters",
                          min: 3,
                        },
                      ]}
                    >
                      <Input placeholder="N4M3" />
                    </Form.Item>
                    <Form.Item
                      label="Faction"
                      name="faction"
                      rules={[
                        {
                          required: true,
                          message: "Required",
                        },
                      ]}
                    >
                      <Input placeholder="COSMIC" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Create
                      </Button>
                    </Form.Item>
                  </Form>
                </Space>
              </Card>
            </div>
          </Space>
          <div style={{ paddingTop: 20 }}>
            <Switch
              onChange={(val) => setIsDarkMode(val)}
              defaultChecked={true}
              checkedChildren="☽︎"
              unCheckedChildren="☾"
            />
          </div>
        </div>
      </App>
    </ConfigProvider>
  );
};

export default Login;
