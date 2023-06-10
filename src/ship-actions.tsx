import {
  DownOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SendOutlined,
  ToTopOutlined,
  VerticalAlignBottomOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { Button, Form, Popover, Select, Space } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import AgentDB from "./agent-db";
import api from "./api";
import FleetDB from "./fleet-db";
import { Ship, System } from "./spacetraders-sdk";
import { SystemDB } from "./system-db";

// TODO ship mounts

export const ShipActions = (props: { ship: Ship }) => {
  const [isDocked, setIsDocked] = useState(props.ship.nav.status === "DOCKED");
  // [Exploration]
  //  Create chart
  // Refine
  // Orbit ?
  function onOrbit() {
    api.fleet
      .orbitShip(props.ship.symbol)
      .then((_) => {
        setIsDocked(false);
        toast.success(
          `${props.ship.symbol} is now orbitting ${props.ship.nav.waypointSymbol}`
        );
        FleetDB.update();
        AgentDB.update();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // Dock !
  function onDock() {
    api.fleet
      .dockShip(props.ship.symbol)
      .then((_) => {
        setIsDocked(true);
        toast.success(
          `Docked ${props.ship.symbol} at ${props.ship.nav.waypointSymbol}`
        );
        FleetDB.update();
        AgentDB.update();
      })
      .catch(() => {});
  }
  // Survey resources
  function onSurvey() {
    api.fleet
      .createSurvey(props.ship.symbol)
      .then((res) => {
        console.log(res);
      })
      .catch(() => {});
  }
  // Extract resources
  function onExtract() {
    api.fleet
      .extractResources(props.ship.symbol)
      .then((res) => {
        const data = res.data.data;
        console.log(data);
        toast.success(
          `${props.ship.symbol} extracted ${data.extraction.yield.units} of ${data.extraction.yield.symbol} at ${props.ship.nav.waypointSymbol}. On a cooldown for ${data.cooldown.remainingSeconds} s`
        );
        FleetDB.update();
        AgentDB.update();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // Jettison cargo (confirm)
  // Jump
  // Navigate
  // Sell
  // Warp
  function onWarp(values: { waypointSymbol: string }) {
    console.log("warpin to", values);
    api.fleet
      .warpShip(props.ship.symbol, {
        waypointSymbol: values.waypointSymbol,
      })
      .then((res) => {
        console.log(res);
        const data = res.data.data;
        toast.success(
          `Warping for ${data.fuel.consumed?.amount} fuel. ETA: ${data.nav.route.arrival}`
        );
        FleetDB.update();
      })
      .catch((err) => console.log(err));
  }
  // Scan -> Systems
  //      -> Waypoints
  // Refuel [docked]
  function onRefuel() {
    api.fleet
      .refuelShip(props.ship.symbol)
      .then((_) => {
        toast.success(
          `Refueled ${props.ship.symbol} at ${props.ship.nav.waypointSymbol}`
        );
        FleetDB.update();
        AgentDB.update();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // Purchase [docked]
  // Transfer
  // Deliver
  function onDeliver() {
    api.contract
      .deliverContract(props.ship.symbol)
      .then((_) => {
        toast.success(
          `Refueled ${props.ship.symbol} at ${props.ship.nav.waypointSymbol}`
        );
        FleetDB.update();
        AgentDB.update();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Negotiate contract (?)
  const actions = [
    isDocked
      ? {
          key: "orbit",
          label: (
            <Button
              className="ship-actions-item"
              icon={<ToTopOutlined style={{ color: "dodgerblue" }} />}
              onClick={onOrbit}
            >
              Orbit
            </Button>
          ),
        }
      : {
          key: "dock",
          label: (
            <Button
              className="ship-actions-item"
              icon={
                <VerticalAlignBottomOutlined style={{ color: "dodgerblue" }} />
              }
              onClick={onDock}
            >
              Dock
            </Button>
          ),
        },
    {
      key: "refuel",
      label: (
        <Button
          className="ship-actions-item"
          icon={<ReloadOutlined style={{ color: "dodgerblue" }} />}
          onClick={onRefuel}
        >
          Refuel
        </Button>
      ),
    },
    {
      key: "extract",
      label: (
        <Button
          className="ship-actions-item"
          icon={<DownloadOutlined style={{ color: "dodgerblue" }} />}
          onClick={onExtract}
        >
          Extract
        </Button>
      ),
    },
    {
      key: "survey",
      label: (
        <Button
          className="ship-actions-item"
          icon={<WifiOutlined style={{ color: "dodgerblue" }} />}
          onClick={onSurvey}
        >
          Survey
        </Button>
      ),
    },
    {
      key: "warp",
      label: (
        <Popover
          className="ship-actions-item"
          trigger="click"
          title={`Warp ${props.ship.symbol}`}
          content={
            <div style={{ minWidth: "14em" }}>
              <SystemSelector onSubmit={onWarp} />
            </div>
          }
        >
          <Button icon={<SendOutlined style={{ color: "dodgerblue" }} />}>
            Warp
          </Button>
        </Popover>
      ),
    },
    // TODO factor scan
    // {
    //   key: "scan-systems",
    //   label: (
    //     <Button type="link" icon={<WifiOutlined />}>
    //       Scan systems
    //     </Button>
    //   ),
    // },
    // {
    //   key: "scan-waypoints",
    //   label: (
    //     <Button type="link" icon={<WifiOutlined />}>
    //       Scan waypoints
    //     </Button>
    //   ),
    // },
  ];

  return (
    <Popover
      trigger="click"
      content={
        <Space direction="vertical" style={{ rowGap: 4 }}>
          {actions.map((a) => (
            <div key={a.key}>{a.label}</div>
          ))}
        </Space>
      }
    >
      <Button icon={<DownOutlined />} type="primary">
        Actions
      </Button>
    </Popover>
  );
};

const SystemSelector = (props: {
  onSubmit: (values: { waypointSymbol: string }) => void;
}) => {
  const [system, setSystem] = useState<System | null>(null);
  const [waypoint, setWaypoint] = useState("");

  return (
    <Form
      onFinish={() => {
        props.onSubmit({ waypointSymbol: system?.waypoints[0]?.symbol || "" });
      }}
      layout="inline"
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: 0,
        width: "100%",
      }}
    >
      <Form.Item style={{ width: "75%", margin: 0 }}>
        <Select
          size="small"
          options={SystemDB.all.map((s) => ({
            label: s.symbol,
            value: s.symbol,
          }))}
          showSearch
          placeholder="X1-ABCD"
          onChange={(v) => {
            setSystem(SystemDB.all.find((s) => s.symbol === v)!);
            setWaypoint("");
          }}
        />
      </Form.Item>
      <Form.Item style={{ width: "85%", margin: 0 }}>
        <Select
          size="small"
          options={system?.waypoints.map((s) => ({
            label: s.symbol,
            value: s.symbol,
          }))}
          showSearch
          value={waypoint}
          placeholder="83510X"
          onChange={(v) => setWaypoint(v)}
        />
      </Form.Item>
      <Form.Item style={{ margin: 0 }}>
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          htmlType="submit"
        />
      </Form.Item>
    </Form>
  );
};
