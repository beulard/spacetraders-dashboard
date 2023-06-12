import { Button, Form, Input, Space } from "antd";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";
import api from "./api";

const Login = () => {
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

  // TODO login dark theme !!

  return (
    <div style={{ margin: "auto", textAlign: "center" }}>
      <Toaster position="top-right" />
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
          <Space
            direction="vertical"
            size="small"
            style={{ padding: "0 1em 1em 1em" }}
          >
            <label htmlFor="symbol">
              <h4>New agent</h4>
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
        </div>
      </Space>
    </div>
  );
};

export default Login;
