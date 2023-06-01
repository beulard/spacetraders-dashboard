import Button from "@atlaskit/button";
import RefreshIcon from "@atlaskit/icon/glyph/refresh";
import { Spin } from "antd";
import { useState } from "react";

const RefreshButton = (props: { onClick: (onDone: Function) => any }) => {
  const [loading, setLoading] = useState(false);

  function click() {
    setLoading(true);
    props.onClick(() => setLoading(false));
  }

  return (
    <div style={{ width: "3em" }}>
      {loading ? (
        <Spin />
      ) : (
        <Button onClick={click} iconBefore={<RefreshIcon label="" />}></Button>
      )}
    </div>
  );
};

export { RefreshButton };
