import { SyncOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";

const RefreshButton = (props: { onClick: (onDone: Function) => any }) => {
  const [loading, setLoading] = useState(false);

  function click() {
    setLoading(true);
    props.onClick(() => setLoading(false));
  }

  return (
    <div style={{ width: "3em" }}>
      <Button loading={loading} onClick={click} icon={<SyncOutlined />} />
    </div>
  );
};

export { RefreshButton };
