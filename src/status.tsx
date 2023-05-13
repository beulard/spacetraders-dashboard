import React, { useEffect } from "react";
import { useState } from "react";
import player from "./player";
import toast from "react-hot-toast";
import Button from "@atlaskit/button";
import Spinner from "@atlaskit/spinner";
import RefreshIcon from "@atlaskit/icon/glyph/refresh";

const Status = () => {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(-1);
  const [home, setHome] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    const promise = player.getAgentInfo();
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
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
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
      <div>
        {loading ? (
          <Spinner />
        ) : (
          <Button
            onClick={refresh}
            iconBefore={<RefreshIcon label="" />}
          ></Button>
        )}
      </div>
    </div>
  );
};

export { Status };
