import {
  DownOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Button,
  Divider,
  Dropdown,
  Popover,
  Progress,
  Space,
  Table,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import {
  Ship,
  ShipCargo,
  ShipFuel,
  ShipMount,
  ShipReactor,
} from "spacetraders-sdk";
import FleetDB from "./fleet-db";
import { HoverTag } from "./components/hover-tag";
const { Column } = Table;

const ReactorDescription = (props: { reactor: ShipReactor }) => (
  <Space>
    Reactor
    <HoverTag tooltip={props.reactor.description} text={props.reactor.name} />
  </Space>
);

const MountTag = (props: { mount: ShipMount }) => (
  <HoverTag tooltip={props.mount.description} text={props.mount.name} />
);

const CargoInventory = (props: { cargo: ShipCargo }) => (
  <div>
    {props.cargo.inventory.map((item, idx) => (
      <Popover key={idx} content={item.description}>
        <Tag>{item.name}</Tag>
        <Tag>{item.units}</Tag>
      </Popover>
    ))}
  </div>
);

const ShipDescription = (props: { ship: Ship }) => (
  <Space direction="vertical">
    {/* Symbol */}
    <Space>
      <big>
        <b>{props.ship.symbol}</b> <Tag>{props.ship.registration.role}</Tag>
      </big>
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Crew */}
    <Space>
      <span>
        Crew{" "}
        <Tag>
          {props.ship.crew.capacity} / {props.ship.crew.required}
        </Tag>
      </span>
      <Tag>{props.ship.crew.rotation}</Tag>
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Frame */}
    <Space>
      Frame
      <HoverTag
        tooltip={props.ship.frame.description}
        text={props.ship.frame.name}
      />
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Reactor */}
    <ReactorDescription reactor={props.ship.reactor} />

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Engine */}
    <Space>
      Engine
      <HoverTag
        tooltip={props.ship.engine.description}
        text={props.ship.engine.name}
      />
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Modules */}
    <div style={{ width: "300px" }}>
      <p>Modules</p>
      {props.ship.modules.map((module, idx) => (
        <Space key={idx} wrap size="small">
          <HoverTag tooltip={module.description} text={module.name} />
        </Space>
      ))}
    </div>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Mounts */}
    <div style={{ width: "300px" }}>
      <p>Mounts</p>
      {props.ship.mounts.map((mount, idx) => (
        <Space key={idx} wrap size={[6, 16]}>
          <MountTag mount={mount} />
        </Space>
      ))}
    </div>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Cargo */}
    <Space>
      Cargo
      <Popover content={<CargoInventory cargo={props.ship.cargo} />}>
        <Tag>
          {props.ship.cargo.units} / {props.ship.cargo.capacity}
        </Tag>
      </Popover>
    </Space>

    <Divider style={{ padding: 0, margin: 0 }} />

    {/* Fuel */}
    <Space>
      Fuel
      <Tag>
        {props.ship.fuel.current} / {props.ship.fuel.capacity}
      </Tag>
    </Space>
  </Space>
);

// Convert milliseconds to a string like "1h 20m 55s"
function msToHMS(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

function getTimeLeft(arrivalDate: string) {
  const date = new Date(arrivalDate);
  const diff = date.getTime() - Date.now();
  return diff;
}

const NavColumn = (props: { ship: Ship }) => {
  const [timeLeft, setTimeLeft] = useState(
    getTimeLeft(props.ship.nav.route.arrival)
  );

  // Update every second
  useEffect(() => {
    setTimeLeft(getTimeLeft(props.ship.nav.route.arrival));
    const interval = setInterval(() => {
      setTimeLeft((timeLeft) => {
        // Check if we've arrived at destination
        if (timeLeft - 1000 < 0) {
          if (props.ship.nav.status === "IN_TRANSIT") {
            FleetDB.update();
          }
          return timeLeft;
        }
        return timeLeft - 1000;
      });
    }, 1000);
    // Clear on unmount
    return () => {
      clearInterval(interval);
    };
  }, [props.ship]);

  return (
    <>
      <Tag>{props.ship.nav.status}</Tag>
      {props.ship.nav.waypointSymbol}
      {props.ship.nav.status === "IN_TRANSIT" && (
        <> (ETA: {msToHMS(timeLeft)})</>
      )}
    </>
  );
};

const ShipActions = (props: { ship: Ship }) => {
  // [Exploration]
  //  Create chart
  // Refine
  // Orbit ?
  // Dock !
  // Survey resources
  // Extract resources
  // Jettison cargo (confirm)
  // Jump
  // Navigate
  // Sell
  // Warp
  // Scan -> Systems
  //      -> Waypoints
  // Refuel [docked]
  // Purchase [docked]
  // Transfer
  // Negotiate contract (?)
  const actions: MenuProps["items"] = [
    {
      key: "dock",
      label: (
        <Button type="link" icon={<LoginOutlined />}>
          Dock
        </Button>
      ),
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

const ShipList = () => {
  const [fleet, setFleet] = useState<Ship[]>(FleetDB.getMyShips());

  useEffect(() => {
    // Initial fetch
    FleetDB.update().then((ships) => setFleet(ships));

    const updateCallback = (ships: Ship[]) => {
      setFleet(ships);
    };
    FleetDB.on("update", updateCallback);

    // Unsubscribe on unmount
    return () => {
      FleetDB.off("update", updateCallback);
    };
  }, []);

  return (
    <>
      <div style={{ margin: "auto", marginTop: "1em", width: "40em" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            margin: "auto",
            alignItems: "center",
            height: "2.4em",
          }}
        >
          <h4 style={{ flex: "5 5 auto" }}>Ships</h4>
          {/* <RefreshButton onClick={refresh} /> */}
        </div>
      </div>
      <Table
        dataSource={fleet.map((ship) => ({
          ...ship,
          key: ship.symbol,
        }))}
        size="small"
        pagination={false}
        style={{ width: "60%", margin: "auto" }}
      >
        <Column
          title="Ship"
          dataIndex="symbol"
          key="symbol"
          render={(symbol, ship: Ship) => (
            <Popover content={<ShipDescription ship={ship} />}>
              <Space>
                <b>{symbol}</b>
                <InfoCircleOutlined />
              </Space>
            </Popover>
          )}
        />
        <Column
          title="Status"
          dataIndex="nav"
          key="status"
          render={(_, ship: Ship) => <NavColumn ship={ship} />}
        />
        <Column
          title="Cargo"
          dataIndex="cargo"
          key="cargo"
          render={(cargo: ShipCargo) => (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Popover content={<CargoInventory cargo={cargo} />}>
                <Space>
                  <p>
                    {cargo.units} / {cargo.capacity}
                  </p>
                  <InfoCircleOutlined />
                </Space>
              </Popover>
            </div>
          )}
        />
        <Column
          title="Fuel"
          width={"10%"}
          dataIndex="fuel"
          key="fuel"
          render={(fuel: ShipFuel) => (
            <Popover content={`${fuel.current} / ${fuel.capacity}`}>
              <Progress
                size="small"
                type="line"
                percent={
                  Math.round((fuel.current / fuel.capacity) * 100 * 10) / 10
                }
              />
            </Popover>
          )}
        />
        <Column
          title="Actions"
          dataIndex=""
          key="actions"
          render={(_, ship: Ship) => <ShipActions ship={ship} />}
        />
      </Table>
    </>
  );
};

export { ShipList };
