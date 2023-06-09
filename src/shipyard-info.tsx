import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Popconfirm,
  Popover,
  Space,
  Spin,
  Statistic,
  Tabs,
  TabsProps,
  Tag,
} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AgentDB from "./agent-db";
import api from "./api";
import { HoverTag } from "./components/hover-tag";
import FleetDB from "./fleet-db";
import {
  Ship,
  Shipyard,
  ShipyardShip,
  SystemWaypoint,
} from "./spacetraders-sdk";
import { alphabeticSorter, getSystemSymbol } from "./utils";
import { MountTag, ReactorDescription } from "./ship-description";

const ShipyardShipDescription = (props: { ship: ShipyardShip }) => (
  <Space direction="vertical">
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
  </Space>
);

const PurchaseShipDialog = (props: {
  ship: ShipyardShip;
  waypointSymbol: string;
}) => {
  async function onTrade() {
    // Agent might not have enough funds! Handle in response
    try {
      const res = await api.fleet.purchaseShip({
        shipType: props.ship.type!,
        waypointSymbol: props.waypointSymbol,
      });

      const transaction = res.data.data.transaction;
      toast.success(
        `Purchased ${transaction.shipSymbol} at ${transaction.waypointSymbol} for $${transaction.price}`
      );
      FleetDB.update();
      AgentDB.update();
    } catch (error) {
      const apiError = (error as any).response?.data?.error;
      if (apiError) {
        toast.error(apiError.message);
      }
      console.log(error);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Statistic
        title="Total"
        value={props.ship.purchasePrice}
        prefix="$"
        valueStyle={{ fontSize: "13pt", color: "indianred" }}
      />

      <Popconfirm title="Confirm" onConfirm={onTrade}>
        <Button type="primary">Buy</Button>
      </Popconfirm>
    </div>
  );
};

const ShipyardShipListing = (props: {
  ships: ShipyardShip[];
  waypointSymbol: string;
}) => {
  // Ships for sale table columns
  const columns: ColumnsType<ShipyardShip> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "bold",
      sorter: (a, b) => alphabeticSorter(a.name, b.name),
      render: (name, ship) => (
        <Popover
          className="table-popover"
          content={<ShipyardShipDescription ship={ship} />}
        >
          <Space>
            <span>{name}</span>
            <InfoCircleOutlined />
          </Space>
        </Popover>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Price",
      dataIndex: "purchasePrice",
      key: "price",
      sorter: (a, b) => a.purchasePrice - b.purchasePrice,
      render: (price, ship) => (
        <Popover
          trigger="click"
          title={`Purchase ${ship.name}`}
          content={
            <PurchaseShipDialog
              ship={ship}
              waypointSymbol={props.waypointSymbol}
            />
          }
        >
          <Button type="link" size="small">
            ${price}
          </Button>
        </Popover>
      ),
    },
  ];

  return (
    <Table
      className="tradegoods-table"
      rowClassName="table-row"
      size="small"
      columns={columns}
      dataSource={props.ships.map((s, idx) => ({
        ...s,
        key: idx,
      }))}
      pagination={false}
    />
  );
};

export const ShipyardInfo = (props: {
  waypoint: SystemWaypoint;
  localShips: Ship[];
}) => {
  const [shipyard, setShipyard] = useState<Shipyard | null>(null);

  useEffect(() => {
    api.system
      .getShipyard(
        getSystemSymbol(props.waypoint.symbol),
        props.waypoint.symbol
      )
      .then((s) => {
        console.log(s.data);
        setShipyard(s.data.data);
      });
  }, [props.localShips]);

  // Tabs
  const items: TabsProps["items"] = [
    {
      key: "types",
      label: "Ship types",
      children: shipyard?.shipTypes.map((s, idx) => (
        <Tag key={idx}>{s.type?.toLowerCase()}</Tag>
      )),
    },
  ];
  // If ship is present, show the list of ships for sale
  if (shipyard?.ships) {
    items.unshift({
      key: "ships",
      label: "Ships",
      children: (
        <ShipyardShipListing
          ships={shipyard.ships}
          waypointSymbol={props.waypoint.symbol}
        />
      ),
    });
    // And the list of transactions
    items.push({
      key: "transactions",
      label: "Transactions",
      children: shipyard.transactions?.map((t, idx) => (
        <p key={idx}>
          {t.timestamp} {t.agentSymbol} {t.price}
        </p>
      )),
    });
  }

  if (shipyard) {
    console.log(shipyard.ships);
    return (
      <Tabs
        tabBarStyle={{
          fontSize: 9,
          marginTop: -10,
          marginBottom: 5,
        }}
        style={{ fontSize: 11 }}
        size="small"
        items={items}
      />
    );
  } else {
    return <Spin />;
  }
};
