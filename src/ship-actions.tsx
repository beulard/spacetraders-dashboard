import {
  DownOutlined,
  LoginOutlined,
  LogoutOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown } from "antd";
import toast from "react-hot-toast";
import { Ship } from "./spacetraders-sdk";
import AgentDB from "./agent-db";
import api from "./api";
import FleetDB from "./fleet-db";

export const ShipActions = (props: { ship: Ship }) => {
  // [Exploration]
  //  Create chart
  // Refine
  // Orbit ?
  function onOrbit() {
    api.fleet
      .orbitShip(props.ship.symbol)
      .then((_) => {
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
  const actions: MenuProps["items"] = [
    {
      key: "dock",
      label: (
        <Button type="link" icon={<LoginOutlined />}>
          Dock
        </Button>
      ),
      onClick: onDock,
    },
    {
      key: "orbit",
      label: (
        <Button type="link" icon={<LogoutOutlined />}>
          Orbit
        </Button>
      ),
      onClick: onOrbit,
    },
    {
      key: "refuel",
      label: <Button type="link">Refuel</Button>,
      onClick: onRefuel,
    },
    {
      key: "extract",
      label: <Button type="link">Extract</Button>,
      onClick: onExtract,
    },
    {
      key: "survey",
      label: <Button type="link">Survey</Button>,
      onClick: onSurvey,
    },
    // TODO factor scan
    {
      key: "scan-systems",
      label: (
        <Button type="link" icon={<WifiOutlined />}>
          Scan systems
        </Button>
      ),
    },
    {
      key: "scan-waypoints",
      label: (
        <Button type="link" icon={<WifiOutlined />}>
          Scan waypoints
        </Button>
      ),
    },
  ];

  return (
    <Dropdown trigger={["click"]} menu={{ items: actions }} placement="top">
      <Button icon={<DownOutlined />} type="primary">
        Actions
      </Button>
    </Dropdown>
  );
};
