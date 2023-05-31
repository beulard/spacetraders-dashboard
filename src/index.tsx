import "@atlaskit/css-reset";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./Login";
import "./index.css";

import { Spin } from "antd";
import { ReactElement, useEffect, useState } from "react";
import { HashRouter, Route, Routes, useNavigate } from "react-router-dom";
import api from "./api";

const TokenChecker = (props: { component: ReactElement }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Check token");
    api.agent
      .getMyAgent()
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate("/login");
        }
      });
  }, []);

  if (loading) {
    return <Spin />;
  } else {
    return props.component;
  }
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<TokenChecker component={<App />} />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </HashRouter>
);
