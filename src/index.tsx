import "@atlaskit/css-reset";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./Login";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
// alert(window.location.pathname);
if (window.location.pathname === "/login") {
  root.render(<Login />);
} else {
  root.render(<App />);
}
