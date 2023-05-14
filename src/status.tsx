import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "./api";
import { RefreshButton } from "./components/refresh-button";

const Status = () => {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(-1);
  const [home, setHome] = useState("");

  const refresh = (onDone: Function = () => {}) => {
    const promise = api.agent.getMyAgent();
    toast.promise(promise, {
      loading: "Fetching agent info",
      success: "Fetched agent",
      error: "Error, check console",
    });

    promise
      .then((res) => {
        const data = res.data.data;
        setName(data.symbol);
        setCredits(data.credits);
        setHome(data.headquarters);
        onDone();
      })
      .catch((err) => {
        console.log(err);
        onDone();
      });
  };

  useEffect(() => {
    refresh();
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
        <h6>${credits}</h6>
      </div>
      <div>
        <h6>
          {name} from {home}
        </h6>
      </div>
      <RefreshButton onClick={refresh} />
    </div>
  );
};

export { Status };
