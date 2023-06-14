import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Popconfirm, Popover, Space, Tag } from "antd";
import toast from "react-hot-toast";
import api from "./api";
import { HoverTag } from "./components/hover-tag";
import { FleetDB } from "./fleet-db";
import {
  Ship,
  ShipCargo,
  ShipCargoItem,
  ShipMount,
  ShipReactor,
} from "./spacetraders-sdk";

export const ReactorDescription = (props: { reactor: ShipReactor }) => (
  <Space>
    Reactor
    <HoverTag tooltip={props.reactor.description} text={props.reactor.name} />
  </Space>
);

export const MountTag = (props: { mount: ShipMount }) => (
  <HoverTag tooltip={props.mount.description} text={props.mount.name} />
);

// TODO jettison slider for quantity
export const CargoInventory = (props: {
  cargo: ShipCargo;
  onJettison: Function;
}) => (
  <div>
    {props.cargo.inventory.map((item, idx) => (
      <div key={idx} style={{ display: "flex", alignItems: "center" }}>
        <Popover content={item.description}>
          <Tag>{item.symbol}</Tag>
        </Popover>
        <Tag>{item.units}</Tag>
        <Popconfirm
          title={`Jettison ${item.name}?`}
          onConfirm={() => props.onJettison(item)}
        >
          <Button size="small" type="ghost" icon={<CloseCircleOutlined />} />
        </Popconfirm>
      </div>
    ))}
  </div>
);

export const ShipDescription = (props: { ship: Ship }) => {
  function onJettison(item: ShipCargoItem) {
    api.fleet
      .jettison(props.ship.symbol, {
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
        <Popover
          content={
            <CargoInventory cargo={props.ship.cargo} onJettison={onJettison} />
          }
        >
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
};
