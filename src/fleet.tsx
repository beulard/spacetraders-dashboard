import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Popover,
  Progress,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "./api";
import { RefreshButton } from "./components/refresh-button";
import { FleetDB, useShips } from "./fleet-db";
import { ShipActions } from "./ship-actions";
import { CargoInventory, ShipDescription } from "./ship-description";
import { Ship, ShipCargo, ShipCargoItem, ShipFuel } from "./spacetraders-sdk";
import { SystemDB, SystemEvent } from "./system-db";
const { Title, Text } = Typography;
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
  // const [fleet, setFleet] = useState<Ship[]>(FleetDB.getMyShips());
  const [fleet, setFleet] = useShips();

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

  function onJettison(ship: Ship, item: ShipCargoItem) {
    api.fleet
      .jettison(ship.symbol, {
        symbol: item.symbol,
        units: item.units,
      })
      .then((res) => {
        toast.success(`Jettisoned ${item.units} units of ${item.symbol}`);
        FleetDB.update();
      })
      .catch((err) => console.log(err));
  }

  return (
    <Card
      size="small"
      title={<Text className="small-heading">Fleet</Text>}
      extra={<RefreshButton onClick={onRefresh} />}
      type="inner"
      style={{ minWidth: "600px" }}
    >
      <Table
        dataSource={fleet.map((ship) => ({
          ...ship,
          key: ship.symbol,
        }))}
        size="small"
        pagination={false}
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
          render={(cargo: ShipCargo, ship: Ship) => (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Popover
                content={
                  <CargoInventory
                    cargo={cargo}
                    onJettison={(item: ShipCargoItem) => onJettison(ship, item)}
                  />
                }
              >
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
    </Card>
  );
};

export { ShipDescription, ShipList };
