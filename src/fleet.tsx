import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Popover, Progress, Space, Statistic, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { Ship, ShipCargo, ShipFuel } from "./spacetraders-sdk";
import { RefreshButton } from "./components/refresh-button";
import FleetDB from "./fleet-db";
import { ShipActions } from "./ship-actions";
import { ShipDescription, CargoInventory } from "./ship-description";
import toast from "react-hot-toast";
import { SystemDB, SystemEvent } from "./system-db";
const { Column } = Table;
const { Countdown } = Statistic;

const NavColumn = (props: { ship: Ship }) => {
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    setShowCountdown(props.ship.nav.status === "IN_TRANSIT");
  }, [props.ship]);

  function onLocateShip() {
    SystemEvent.emit(
      "locate",
      SystemDB.all.find(
        (s) => s.symbol === props.ship.nav.route.destination.systemSymbol
      )
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Tag style={{ margin: 0 }}>{props.ship.nav.status}</Tag>
      <Button type="link" onClick={onLocateShip}>
        {props.ship.nav.waypointSymbol}
      </Button>
      {showCountdown && (
        <Countdown
          valueStyle={{ fontSize: 10 }}
          value={props.ship.nav.route.arrival}
          onFinish={() => {
            setShowCountdown(false);
            FleetDB.update();
          }}
        />
      )}
    </div>
  );
};

const ShipList = () => {
  const [fleet, setFleet] = useState<Ship[]>(FleetDB.getMyShips());

  function onRefresh(onDone: Function) {
    const promise = FleetDB.update();

    toast.promise(promise, {
      loading: "Fetching ships",
      success: "Fetched ships",
      error: "Error (check console)",
    });

    promise.then((ships: Ship[]) => {
      setFleet(ships);
      onDone();
    });
  }

  useEffect(() => {
    const updateCallback = (ships: Ship[]) => {
      setFleet(ships);
    };
    FleetDB.on("update", updateCallback);

    // Initial fetch
    FleetDB.update();

    // Unsubscribe on unmount
    return () => {
      FleetDB.off("update", updateCallback);
    };
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "4em",
          alignItems: "center",
          height: "3em",
        }}
      >
        <h4>Ships</h4>
        <RefreshButton onClick={onRefresh} />
      </div>
      <Table
        dataSource={fleet.map((ship) => ({
          ...ship,
          key: ship.symbol,
        }))}
        size="small"
        pagination={false}
        style={{ margin: "auto" }}
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
    </div>
  );
};

export { ShipDescription, ShipList };
