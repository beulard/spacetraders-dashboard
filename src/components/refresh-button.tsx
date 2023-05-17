import Button from "@atlaskit/button";
import RefreshIcon from "@atlaskit/icon/glyph/refresh";
import Spinner from "@atlaskit/spinner";
import { useState } from "react";

const RefreshButton = (props: { onClick: Function }) => {
  const [loading, setLoading] = useState(false);

  function click() {
    setLoading(true);
    props.onClick(() => setLoading(false));
  }

  return (
    <div style={{ width: "3em", textAlign: "center" }}>
      {loading ? (
        <Spinner />
      ) : (
        <Button onClick={click} iconBefore={<RefreshIcon label="" />}></Button>
      )}
    </div>
  );
};

export { RefreshButton };
